// ========================================
// حلها (Hallha) - Main App Logic
// ========================================

const App = (() => {
  let battleData = null;
  let currentRound = 0;
  let battlePoints = 0;
  let mistakes = 0;
  let uploadedFiles = [];
  let selectedSubject = 'Math';

  // Cloudflare Turnstile state
  let turnstileSiteKey = null;   // sitekey fetched from /api/status
  let turnstileWidgetId = null;  // id returned by turnstile.render()
  let turnstileToken = null;     // latest token issued by the widget

  // Claude Vision only accepts these image types
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_IMAGE_BYTES = 4.5 * 1024 * 1024; // stay under Claude's 5 MB limit

  // Shortcut: look up a translation for the current UI language
  function t(key) {
    if (typeof I18n === 'undefined' || !I18n.translations) return key;
    const lang = I18n.getCurrentLang ? I18n.getCurrentLang() : 'en';
    const dict = I18n.translations[lang] || I18n.translations.en || {};
    return dict[key] || (I18n.translations.en && I18n.translations.en[key]) || key;
  }

  // Convert file to base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove the "data:image/...;base64," prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Resize an image file to fit within max dimension and re-encode as JPEG
  function resizeImage(file, maxDim = 1600, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Failed to resize image'));
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve({
              type: 'image/jpeg',
              data: dataUrl.split(',')[1],
              name: file.name.replace(/\.[^.]+$/, '') + '.jpg'
            });
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not load image'));
      };
      img.src = url;
    });
  }

  // DOM elements (initialized in init)
  let screens, els;

  // Initialize
  function init() {
    screens = {
      input: document.getElementById('input-screen'),
      loading: document.getElementById('loading-screen'),
      battle: document.getElementById('battle-screen'),
      victory: document.getElementById('victory-screen'),
    };

    els = {
      startBtn: document.getElementById('start-battle-btn'),
      questionInput: document.getElementById('question-input'),
      subjectSelect: document.getElementById('subject-select'),
      bossEmoji: document.getElementById('boss-emoji'),
      bossName: document.getElementById('boss-name'),
      healthFill: document.getElementById('health-fill'),
      healthText: document.getElementById('health-text'),
      roundContent: document.getElementById('round-content'),
      solutionText: document.getElementById('solution-text'),
      victoryStats: document.getElementById('victory-stats'),
      newBattleBtn: document.getElementById('new-battle-btn'),
      modeBanner: document.getElementById('mode-banner'),
      uploadZone: document.getElementById('upload-zone'),
      fileInput: document.getElementById('file-input'),
      fileList: document.getElementById('file-list'),
    };

    els.startBtn.addEventListener('click', startBattle);
    els.newBattleBtn.addEventListener('click', newBattle);

    initCustomDropdown();
    initFileUpload();

    Gamification.updateUI();
    checkMode();
  }

  // ========================================
  // Subject Chips
  // ========================================
  function initCustomDropdown() {
    const chipsContainer = document.getElementById('subject-chips');
    if (!chipsContainer) return;

    chipsContainer.querySelectorAll('.subject-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chipsContainer.querySelectorAll('.subject-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedSubject = chip.dataset.value;
        if (els.subjectSelect) els.subjectSelect.value = selectedSubject;
      });
    });
  }

  // ========================================
  // File Upload
  // ========================================
  function initFileUpload() {
    const zone = els.uploadZone;
    const input = els.fileInput;
    if (!zone || !input) return;

    // Click upload area (not textarea) to browse
    const uploadArea = document.getElementById('unified-upload-area');
    if (uploadArea) {
      uploadArea.addEventListener('click', (e) => {
        e.stopPropagation();
        input.click();
      });
    } else {
      zone.addEventListener('click', () => input.click());
    }

    // Drag & drop
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });

    // File input change
    input.addEventListener('change', () => {
      handleFiles(input.files);
      input.value = '';
    });
  }

  function handleFiles(fileListObj) {
    for (const file of fileListObj) {
      if (uploadedFiles.length >= 5) break;
      uploadedFiles.push(file);
    }
    renderFileList();
  }

  function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
  }

  function renderFileList() {
    const list = els.fileList;
    list.innerHTML = '';
    uploadedFiles.forEach((file, i) => {
      const tag = document.createElement('div');
      tag.className = 'upload-file-tag';
      tag.innerHTML = `📄 ${escapeHtml(file.name)} <span class="upload-file-remove" data-index="${i}">&times;</span>`;
      list.appendChild(tag);
    });

    // Bind remove buttons
    list.querySelectorAll('.upload-file-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFile(parseInt(btn.dataset.index));
      });
    });
  }

  // Check if we're in demo or live mode
  async function checkMode() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data.mode === 'demo') {
        els.modeBanner.style.display = 'block';
      }
      if (data.turnstileSiteKey) {
        turnstileSiteKey = data.turnstileSiteKey;
        tryRenderTurnstile();
      }
    } catch {
      els.modeBanner.style.display = 'block';
    }
  }

  // ========================================
  // Cloudflare Turnstile
  // ========================================

  // Render the widget when both the Turnstile library and the sitekey are
  // available. Polls for window.turnstile because the script is loaded async
  // and may finish before or after this function is first called. Fails open
  // with a console warning if the script never appears (e.g. blocked by an
  // ad blocker) — the server will still reject the request, but the user
  // sees a clearer error than a silently broken page.
  function tryRenderTurnstile(attempt = 0) {
    if (!turnstileSiteKey) return;
    if (turnstileWidgetId !== null) return; // already rendered
    const container = document.getElementById('turnstile-container');
    if (!container) return;

    if (!window.turnstile || typeof window.turnstile.render !== 'function') {
      if (attempt > 60) { // ~6 seconds
        console.warn('Turnstile script never loaded — widget will not render. ' +
                     'Likely blocked by an extension or network filter.');
        return;
      }
      setTimeout(() => tryRenderTurnstile(attempt + 1), 100);
      return;
    }

    try {
      turnstileWidgetId = window.turnstile.render(container, {
        sitekey: turnstileSiteKey,
        callback: (token) => { turnstileToken = token; },
        'expired-callback': () => { turnstileToken = null; },
        'error-callback': () => { turnstileToken = null; },
        theme: 'light',
        appearance: 'always'
      });
    } catch (e) {
      console.error('Turnstile render failed:', e);
    }
  }

  // Force a new token for the next battle (tokens are single-use)
  function resetTurnstile() {
    turnstileToken = null;
    if (turnstileWidgetId !== null && window.turnstile) {
      try { window.turnstile.reset(turnstileWidgetId); } catch (_) {}
    }
  }

  // Show a specific screen with animation
  function showScreen(name) {
    // Hide all screens immediately, then animate the target in
    Object.values(screens).forEach(s => {
      s.classList.add('hidden');
      s.style.opacity = '';
      s.style.transform = '';
    });

    const next = screens[name];
    next.classList.remove('hidden', 'animate-in');
    void next.offsetWidth; // force reflow
    next.classList.add('animate-in');
    window.scrollTo(0, 0);
  }

  // Start a new battle
  async function startBattle() {
    const question = els.questionInput.value.trim();
    if (!question && uploadedFiles.length === 0) {
      els.questionInput.style.borderColor = '#ef4444';
      els.questionInput.focus();
      setTimeout(() => els.questionInput.style.borderColor = '', 1500);
      return;
    }

    const subject = selectedSubject;

    showScreen('loading');
    battlePoints = 0;
    mistakes = 0;
    currentRound = 0;

    try {
      // Convert uploaded images to base64, rejecting unsupported formats
      const images = [];
      const rejected = [];
      for (const file of uploadedFiles) {
        if (!file.type.startsWith('image/')) {
          rejected.push(file.name + ' (' + t('err_not_image') + ')');
          continue;
        }
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          rejected.push(file.name + ' (' + file.type + ' — ' + t('err_not_supported') + ')');
          continue;
        }

        let prepared;
        // Resize large images so they fit under Claude's 5 MB limit
        if (file.size > MAX_IMAGE_BYTES) {
          try {
            prepared = await resizeImage(file);
          } catch (_) {
            rejected.push(file.name + ' (' + t('err_could_not_resize') + ')');
            continue;
          }
        } else {
          const base64 = await fileToBase64(file);
          prepared = { type: file.type, data: base64, name: file.name };
        }
        images.push(prepared);
      }

      if (uploadedFiles.length > 0 && images.length === 0) {
        alert(t('err_no_files_usable') + '\n\n' + rejected.join('\n') + '\n\n' + t('err_upload_jpg'));
        showScreen('input');
        return;
      }

      const lang = (typeof I18n !== 'undefined' && I18n.getCurrentLang) ? I18n.getCurrentLang() : 'en';
      const res = await fetch('/api/generate-battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, subject, images, lang, turnstileToken }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = payload.error || (t('err_generic') + ' (' + res.status + ')');
        throw new Error(msg);
      }

      battleData = payload;
      showScreen('battle');
      initBattle();
    } catch (err) {
      console.error('Battle generation failed:', err);
      alert((err && err.message) ? err.message : t('err_generic'));
      showScreen('input');
    }
  }

  // Initialize battle UI
  function initBattle() {
    els.bossEmoji.textContent = battleData.bossEmoji || '📚';
    els.bossName.textContent = battleData.bossName || t('topic_loading');
    setHealth(0);
    updateRoundDots(0);
    startRound(1);
  }

  // Set boss progress bar (0% = start, 100% = defeated)
  function setHealth(progress) {
    els.healthFill.style.width = progress + '%';
    els.healthText.textContent = Math.round(progress) + '%';

    els.healthFill.classList.remove('medium', 'high');
    if (progress >= 66) els.healthFill.classList.add('high');
    else if (progress >= 33) els.healthFill.classList.add('medium');

    // Progress glow flash
    els.healthFill.classList.add('damage');
    setTimeout(() => els.healthFill.classList.remove('damage'), 500);
  }

  // Update round dots
  function updateRoundDots(completedUpTo) {
    for (let i = 1; i <= 3; i++) {
      const dot = document.getElementById(`dot-${i}`);
      dot.classList.remove('active', 'completed');
      if (i < completedUpTo + 1) dot.classList.add('completed');
      else if (i === completedUpTo + 1) dot.classList.add('active');
    }
  }

  // Start a specific round with animation
  function startRound(roundNum) {
    currentRound = roundNum;
    updateRoundDots(roundNum - 1);

    // Re-trigger entrance animation on round content
    els.roundContent.style.animation = 'none';
    void els.roundContent.offsetWidth;
    els.roundContent.style.animation = '';

    if (roundNum === 1) renderRound1();
    else if (roundNum === 2) renderRound2();
    else if (roundNum === 3) renderRound3();
  }

  // ========================================
  // Round 1: حلها / Solve It (Multiple Choice)
  // ========================================
  function renderRound1() {
    const r = battleData.round1;
    els.roundContent.className = 'round-content round-1';
    els.roundContent.innerHTML = `
      <div class="round-hero round-1-hero">
        <svg class="hal hal-curious" aria-hidden="true" viewBox="0 0 140 160"><use href="#hal-curious"/></svg>
      </div>
      <div class="round-label">${t('round_label')} 1</div>
      <div class="round-title">${t('round1_title')}</div>
      <div class="round-subtitle">${t('round1_subtitle')}</div>
      <div class="round-question">${escapeHtml(r.question)}</div>
      <div class="options-grid" id="options-grid">
        ${r.options.map((opt, i) => `
          <button class="option-btn" data-index="${i}">${escapeHtml(opt)}</button>
        `).join('')}
      </div>
    `;

    const buttons = els.roundContent.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => handleRound1Answer(btn, r, buttons));
    });
  }

  // Trigger a one-shot reaction animation on the current round's Hal character.
  // emotion: 'celebrate' | 'confused'
  function halReact(emotion) {
    const hal = els.roundContent && els.roundContent.querySelector('.hal');
    const hero = els.roundContent && els.roundContent.querySelector('.round-hero');
    if (!hal) return;
    const cls = emotion === 'confused' ? 'hal-confused' : 'hal-celebrate';
    hal.classList.remove('hal-celebrate', 'hal-confused');
    // Force reflow so the class re-add restarts the animation
    void hal.offsetWidth;
    hal.classList.add(cls);
    if (emotion === 'celebrate' && hero) {
      hero.classList.remove('hal-celebrating');
      void hero.offsetWidth;
      hero.classList.add('hal-celebrating');
      setTimeout(() => hero.classList.remove('hal-celebrating'), 1000);
    }
    setTimeout(() => hal.classList.remove(cls), 1000);
  }

  function handleRound1Answer(btn, roundData, allButtons) {
    const chosen = parseInt(btn.dataset.index);
    const correct = roundData.correctIndex;

    if (chosen === correct) {
      btn.classList.add('correct');
      allButtons.forEach(b => b.classList.add('disabled'));

      battlePoints += 10;
      setHealth(33);
      Gamification.showPointsPopup(10);
      Gamification.shakeScreen();
      halReact('celebrate');

      setTimeout(() => {
        const cont = document.createElement('button');
        cont.className = 'continue-btn';
        cont.innerHTML = t('btn_next_round');
        cont.addEventListener('click', () => startRound(2));
        els.roundContent.appendChild(cont);
      }, 600);
    } else {
      btn.classList.add('wrong');
      mistakes++;
      halReact('confused');

      if (!els.roundContent.querySelector('.hint-box')) {
        const hint = document.createElement('div');
        hint.className = 'hint-box';
        hint.textContent = t('hint_label') + ' ' + roundData.hint;
        els.roundContent.appendChild(hint);
      }

      setTimeout(() => btn.classList.remove('wrong'), 600);
    }
  }

  // ========================================
  // Round 2: افهمها / Understand It (True or False)
  // ========================================
  let blitzIndex = 0;
  let blitzCorrect = 0;

  function renderRound2() {
    const r = battleData.round2;
    blitzIndex = 0;
    blitzCorrect = 0;

    els.roundContent.className = 'round-content round-2';
    els.roundContent.innerHTML = `
      <div class="round-hero round-2-hero">
        <svg class="hal hal-thinker" aria-hidden="true" viewBox="0 0 140 160"><use href="#hal-thinker"/></svg>
      </div>
      <div class="round-label">${t('round_label')} 2</div>
      <div class="round-title">${t('round2_title')}</div>
      <div class="round-subtitle">${t('round2_subtitle')}</div>
      <div class="blitz-container">
        <div class="blitz-progress" id="blitz-progress">
          ${r.statements.map((_, i) => `<div class="blitz-pip ${i === 0 ? 'active' : ''}" id="pip-${i}"></div>`).join('')}
        </div>
        <div class="blitz-statement" id="blitz-statement">${escapeHtml(r.statements[0].text)}</div>
        <div class="blitz-buttons" id="blitz-buttons">
          <button class="blitz-btn true-btn" id="blitz-true">${t('btn_true')}</button>
          <button class="blitz-btn false-btn" id="blitz-false">${t('btn_false')}</button>
        </div>
        <div id="blitz-feedback"></div>
      </div>
    `;

    document.getElementById('blitz-true').addEventListener('click', () => handleBlitz(true, r));
    document.getElementById('blitz-false').addEventListener('click', () => handleBlitz(false, r));
  }

  function handleBlitz(playerAnswer, roundData) {
    const statements = roundData.statements;
    const current = statements[blitzIndex];
    const isCorrect = playerAnswer === current.isTrue;

    const trueBtn = document.getElementById('blitz-true');
    const falseBtn = document.getElementById('blitz-false');
    const pip = document.getElementById(`pip-${blitzIndex}`);
    const feedback = document.getElementById('blitz-feedback');

    // Disable buttons temporarily
    trueBtn.classList.add('disabled');
    falseBtn.classList.add('disabled');

    // Show result
    if (isCorrect) {
      blitzCorrect++;
      (playerAnswer ? trueBtn : falseBtn).classList.add('correct');
      pip.classList.remove('active');
      pip.classList.add('done-correct');
      feedback.innerHTML = `<div class="blitz-result correct">${t('feedback_correct')}</div>`;
      Gamification.showPointsPopup(10);
      halReact('celebrate');
      battlePoints += 10;
    } else {
      mistakes++;
      (playerAnswer ? trueBtn : falseBtn).classList.add('wrong');
      pip.classList.remove('active');
      pip.classList.add('done-wrong');
      const rightAnswer = current.isTrue ? t('feedback_true') : t('feedback_false');
      feedback.innerHTML = `<div class="blitz-result wrong">${t('feedback_wrong')} ${rightAnswer}</div>`;
      halReact('confused');
    }

    blitzIndex++;

    // Move to next statement or finish
    setTimeout(() => {
      trueBtn.classList.remove('correct', 'wrong', 'disabled');
      falseBtn.classList.remove('correct', 'wrong', 'disabled');
      feedback.innerHTML = '';

      if (blitzIndex < statements.length) {
        // Next statement
        document.getElementById('blitz-statement').textContent = statements[blitzIndex].text;
        const nextPip = document.getElementById(`pip-${blitzIndex}`);
        if (nextPip) nextPip.classList.add('active');
      } else {
        // Blitz complete
        setHealth(66);
        Gamification.shakeScreen();

        els.roundContent.querySelector('.blitz-buttons').style.display = 'none';
        const score = `${blitzCorrect}/${statements.length}`;
        feedback.innerHTML = `<div class="blitz-result correct" style="font-size:16px;padding:12px;">${t('blitz_done')} ${score} ${t('blitz_correct_word')} 🔥</div>`;

        const cont = document.createElement('button');
        cont.className = 'continue-btn';
        cont.innerHTML = t('btn_final_round');
        cont.addEventListener('click', () => startRound(3));
        els.roundContent.appendChild(cont);
      }
    }, 1200);
  }

  // ========================================
  // Round 3: اتقنها / Master It (Easy Multiple Choice)
  // ========================================
  function renderRound3() {
    const r = battleData.round3;

    // Support both old format (essay) and new format (multiple choice)
    els.roundContent.className = 'round-content round-3';
    if (r.type === 'final_strike_mc' && r.options) {
      els.roundContent.innerHTML = `
        <div class="round-hero round-3-hero">
          <svg class="hal hal-champion" aria-hidden="true" viewBox="0 0 140 160"><use href="#hal-champion"/></svg>
        </div>
        <div class="round-label">${t('round_label')} 3</div>
        <div class="round-title">${t('round3_title')}</div>
        <div class="round-subtitle">${t('round3_subtitle')}</div>
        <div class="round-question">${escapeHtml(r.question)}</div>
        <div class="options-grid" id="strike-options">
          ${r.options.map((opt, i) => `
            <button class="option-btn" data-index="${i}">${escapeHtml(opt)}</button>
          `).join('')}
        </div>
      `;

      const buttons = els.roundContent.querySelectorAll('.option-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => handleRound3MC(btn, r, buttons));
      });
    } else {
      // Fallback for old essay format
      els.roundContent.innerHTML = `
        <div class="round-hero round-3-hero">
          <svg class="hal hal-champion" aria-hidden="true" viewBox="0 0 140 160"><use href="#hal-champion"/></svg>
        </div>
        <div class="round-label">${t('round_label')} 3</div>
        <div class="round-title">${t('round3_title')}</div>
        <div class="round-subtitle">${t('round3_subtitle')}</div>
        <div class="round-question">${escapeHtml(r.challenge || r.question)}</div>
        <div class="strike-input-group">
          <input type="text" class="strike-input" id="strike-input" placeholder="${t('answer_placeholder')}" autocomplete="off">
          <button class="strike-btn" id="strike-btn">${t('btn_strike')}</button>
        </div>
      `;
      document.getElementById('strike-btn').addEventListener('click', () => handleRound3Essay(r));
      document.getElementById('strike-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleRound3Essay(r);
      });
    }
  }

  function handleRound3MC(btn, roundData, allButtons) {
    const chosen = parseInt(btn.dataset.index);
    const correct = roundData.correctIndex;

    if (chosen === correct) {
      btn.classList.add('correct');
      allButtons.forEach(b => b.classList.add('disabled'));

      battlePoints += 10;
      setHealth(100);
      Gamification.showPointsPopup(10);
      Gamification.shakeScreen();
      halReact('celebrate');

      setTimeout(() => showVictory(), 1000);
    } else {
      btn.classList.add('wrong');
      mistakes++;
      halReact('confused');

      if (!els.roundContent.querySelector('.hint-box')) {
        const hint = document.createElement('div');
        hint.className = 'hint-box';
        hint.textContent = t('hint_label') + ' ' + roundData.hint;
        els.roundContent.appendChild(hint);
      }

      setTimeout(() => btn.classList.remove('wrong'), 600);
    }
  }

  let round3Attempts = 0;

  function handleRound3Essay(roundData) {
    const input = document.getElementById('strike-input');
    const answer = input.value.trim().toLowerCase();
    const correct = (roundData.answer || '').toLowerCase().trim();
    round3Attempts++;

    const isCorrect = answer === correct
      || answer.includes(correct)
      || correct.includes(answer)
      || (battleData.demo && answer.length > 0)
      || round3Attempts >= 2;

    if (isCorrect) {
      battlePoints += 10;
      setHealth(100);
      Gamification.showPointsPopup(10);
      Gamification.shakeScreen();

      input.style.borderColor = 'var(--green)';
      document.getElementById('strike-btn').disabled = true;

      setTimeout(() => showVictory(), 800);
    } else {
      mistakes++;
      input.style.borderColor = 'var(--red)';
      setTimeout(() => input.style.borderColor = '', 800);

      if (!els.roundContent.querySelector('.insight-box')) {
        const insight = document.createElement('div');
        insight.className = 'insight-box';
        insight.textContent = t('insight_label') + ' ' + roundData.keyInsight;
        els.roundContent.appendChild(insight);
      }
    }
  }

  // ========================================
  // Victory
  // ========================================
  function showVictory() {
    const isPerfect = mistakes === 0;
    const result = Gamification.recordWin(battlePoints, isPerfect);

    updateRoundDots(3);
    showScreen('victory');

    els.victoryStats.innerHTML = `
      <div class="v-stat">
        <div class="v-stat-value">${result.pointsEarned}</div>
        <div class="v-stat-label">${t('points_earned')}</div>
      </div>
      <div class="v-stat">
        <div class="v-stat-value">${result.streak} 🔥</div>
        <div class="v-stat-label">${t('win_streak')}</div>
      </div>
      <div class="v-stat">
        <div class="v-stat-value">${result.multiplier}x</div>
        <div class="v-stat-label">${t('multiplier')}</div>
      </div>
      ${isPerfect ? `<div class="v-stat"><div class="v-stat-value">💎</div><div class="v-stat-label">${t('perfect_kill')}</div></div>` : ''}
      ${result.newBadges.length > 0 ? result.newBadges.map(b =>
        `<div class="v-stat"><div class="v-stat-value">${b.emoji}</div><div class="v-stat-label">${t('new_badge')}: ${escapeHtml(b.name)}</div></div>`
      ).join('') : ''}
    `;

    els.solutionText.textContent = battleData.fullSolution;
    Gamification.updateUI();
  }

  // New battle
  function newBattle() {
    els.questionInput.value = '';
    uploadedFiles = [];
    if (els.fileList) els.fileList.innerHTML = '';
    round3Attempts = 0;
    resetTurnstile(); // issue a fresh token for the next battle
    showScreen('input');
  }

  // Utility: escape HTML to prevent XSS
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { init };
})();

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
