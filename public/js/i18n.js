// ========================================
// BrainBoost - Internationalization (EN/AR)
// ========================================

const I18n = (() => {
  const STORAGE_KEY = 'brainboost_lang';

  const translations = {
    en: {
      hero_badge: 'NEW WAY TO STUDY',
      hero_subtitle: 'Stop copying. Start <strong>defeating</strong> your homework.',
      hero_desc: 'Every homework question is a Boss Battle. Fight through 3 quick rounds, learn the concepts, and unlock the answer. Earn points. Build streaks. Become a Brain Lord.',
      cta_start: 'Start Battling',
// BrainBoost - Internationalization (EN/AR)
// ========================================

const I18n = (() => {
  const STORAGE_KEY = 'brainboost_lang';

  const translations = {
    en: {
      hero_badge: 'NEW WAY TO STUDY',
      hero_subtitle: 'Stop copying. Start <strong>defeating</strong> your homework.',
      hero_desc: 'Every homework question is a Boss Battle. Fight through 3 quick rounds, learn the concepts, and unlock the answer. Earn points. Build streaks. Become a Brain Lord.',
      cta_start: 'Start Battling',
      how_title: 'How It Works',
      step1_title: 'Paste Your Question',
      step1_desc: 'Drop in any homework question. Math, science, English â anything.',
      step2_title: 'Fight the Boss',
      step2_desc: '3 quick rounds: Quick Draw, Fill the Gap, Final Strike. Beat them all to win.',
      step3_title: 'Unlock the Answer',
      step3_desc: 'Defeat the boss and get the full solution. You earned it â and you actually understand it.',
      feat1_title: 'Streak System',
      feat1_desc: '3 wins in a row = 2x point multiplier. Keep the fire alive.',
      feat2_title: 'Titles & Badges',
      feat2_desc: 'From "Homework Rookie" to "Brain Lord". Level up your rank.',
      feat3_title: 'Fast Rounds',
      feat3_desc: 'Each round takes 15-30 seconds. No boring lectures. Just quick, fun challenges.',
      footer: 'Built by students, for students. Stop copying. Start thinking.',
      new_challenge_badge: 'NEW CHALLENGE',
      card_title: 'Ready to battle?',
      pts: 'pts',
      streak: 'streak',
      demo_mode: 'Demo Mode',
      get_api_key: 'Get an API key',
      for_real_battles: 'for real AI battles',
      new_battle: 'New Boss Battle',
      input_desc: 'Paste your homework question below and choose your battlefield.',
      subject_label: 'Subject',
      question_label: 'Your Homework Question',
      question_placeholder: 'Paste your homework question here...',
      upload_drag: 'Drag & drop a file here, or',
      upload_browse: 'browse',
      upload_hint: 'Supports images and PDFs',
      start_battle: 'Start Boss Battle',
      summoning: 'Summoning Boss...',
      preparing: 'Preparing your battle rounds',
      boss_defeated: 'BOSS DEFEATED!',
      full_solution: 'Full Solution',
      next_battle: 'Next Battle',
      subj_math: 'Math',
      subj_science: 'Science',
      subj_physics: 'Physics',
      subj_chemistry: 'Chemistry',
      subj_biology: 'Biology',
      subj_english: 'English',
      subj_history: 'History',
      subj_geography: 'Geography',
      subj_cs: 'Computer Science',
      subj_other: 'Other',
    },
    ar: {
      new_challenge_badge: 'ØªØ­Ø¯ÙÙ Ø¬Ø¯ÙØ¯',
      card_title: 'Ø¬Ø§ÙØ² ØªØ¨Ø¯Ø£ Ø§ÙØªØ­Ø¯ÙÙØ',
      hero_badge: 'Ø£Ø³ÙÙØ¨ ÙØ¨ØªÙØ± ÙÙØªØ¹ÙÙ',
      hero_subtitle: 'Ø§ÙÙÙ ÙØ§Ø¬Ø¨Ù ÙÙ Ø£ÙÙ ÙÙ 3 Ø¯ÙØ§Ø¦Ù.. ÙØ§Ø­ØµÙ Ø¹ÙÙ Ø§ÙØ¥Ø¬Ø§Ø¨Ø© <strong>Ø¨Ø°ÙØ§Ø¡</strong>!',
      hero_desc: 'Ø­ÙÙÙ Ø£Ø³Ø¦ÙØ© Ø§ÙÙØ§Ø¬Ø¨ Ø¥ÙÙ ØªØ­Ø¯ÙØ§Øª ÙÙØªØ¹Ø©. Ø®Ø¶ 3 Ø¬ÙÙØ§Øª Ø³Ø±ÙØ¹Ø© ØµÙÙÙØª ÙØªØ¨Ø³ÙØ· ÙÙ Ø§ÙÙÙØ§ÙÙÙØ ÙØ¨ÙØ¬Ø±Ø¯ Ø¥ÙÙØ§ÙÙØ§ Ø³ØªØ­ØµÙ Ø¹ÙÙ Ø§ÙØ¥Ø¬Ø§Ø¨Ø© Ø§ÙÙÙÙØ°Ø¬ÙØ©. Ø§Ø¬ÙØ¹ Ø§ÙÙÙØ§Ø·Ø ÙØ§Ø±ÙØ¹ ÙØ³ØªÙØ§Ù Ø¨Ø¬ÙØ¯Ù!',
      cta_start: 'Ø§Ø¨Ø¯Ø£ Ø§ÙØªØ­Ø¯Ù Ø§ÙØ¢Ù',
      how_title: 'ÙÙÙ ØªØ¹ÙÙ Ø§ÙÙÙØµØ©Ø',
      step1_title: 'Ø£Ø¶Ù Ø³Ø¤Ø§ÙÙ',
      step1_desc: 'Ø§Ø±ÙØ¹ Ø³Ø¤Ø§ÙÙ Ø³ÙØ§Ø¡ ÙØ§Ù ÙØµØ§Ù Ø£Ù ØµÙØ±Ø© ÙÙ Ø£Ù ÙØ§Ø¯Ø© (Ø±ÙØ§Ø¶ÙØ§ØªØ Ø¹ÙÙÙØ ÙØºØ§Øª)Ø ÙØ¯Ø¹ÙØ§ ÙØ¬ÙÙØ² ÙÙ Ø§ÙØªØ­Ø¯Ù.',
      step2_title: 'Ø®Ø¶ Ø§ÙØªØ­Ø¯Ù',
      step2_desc: 'Ø£Ø¬Ø¨ Ø¹Ù 3 Ø¬ÙÙØ§Øª Ø°ÙÙØ© ÙØ³Ø±ÙØ¹Ø©Ø ÙÙØµÙÙØ© Ø®ØµÙØµØ§Ù ÙØ§Ø®ØªØ¨Ø§Ø± ÙÙÙÙ ÙÙØ¯Ø±Ø³ Ø¨Ø·Ø±ÙÙØ© ÙÙØªØ¹Ø©.',
      step3_title: 'Ø§Ø­ØµÙ Ø¹ÙÙ Ø§ÙØ¥Ø¬Ø§Ø¨Ø©',
      step3_desc: 'Ø¨ÙØ¬Ø±Ø¯ Ø§Ø¬ØªÙØ§Ø²Ù ÙÙØªØ­Ø¯ÙØ Ø³ØªÙÙØªØ­ ÙÙ Ø§ÙØ¥Ø¬Ø§Ø¨Ø© Ø§ÙÙÙÙØ°Ø¬ÙØ© ÙØªØ¶ÙÙ Ø§Ø³ØªÙØ¹Ø§Ø¨Ù Ø§ÙÙØ§ÙÙ ÙÙØ®Ø·ÙØ§ØªØ ÙØªÙÙÙ ÙØ¯ ÙØ³Ø¨Øª Ø§ÙØ­Ù Ø¨Ø¬Ø¯Ø§Ø±Ø©.',
      feat1_title: 'Ø³ÙØ³ÙØ© Ø§ÙØªÙÙÙÙ',
      feat1_desc: '3 Ø¥Ø¬Ø§Ø¨Ø§Øª ØµØ­ÙØ­Ø© ÙØªØªØ§ÙÙØ© = ÙÙØ§Ø· ÙØ¶Ø§Ø¹ÙØ©! Ø­Ø§ÙØ¸ Ø¹ÙÙ ØªÙØ¯ÙÙ ÙÙØ§ ØªÙØ³Ø± Ø§ÙØ³ÙØ³ÙØ©.',
      feat2_title: 'Ø£ÙØ³ÙØ© Ø§ÙØ¥ÙØ¬Ø§Ø²',
      feat2_desc: 'Ø§Ø±ØªÙÙ ÙÙ Ø§ÙØªØµÙÙÙ ÙÙ "ÙØ¨ØªØ¯Ø¦" Ø¥ÙÙ "Ø¹Ø¨ÙØ±Ù". ÙÙ ØªØ­Ø¯Ù ØªÙØ¬Ø²Ù ÙØ±ÙØ¹ ÙÙ ÙØ³ØªÙØ§Ù.',
      feat3_title: 'Ø¬ÙÙØ§Øª Ø³Ø±ÙØ¹Ø©',
      feat3_desc: 'Ø¬ÙÙØ§Øª ÙØ§ ØªØªØ¬Ø§ÙØ² 15 Ø¥ÙÙ 30 Ø«Ø§ÙÙØ©. Ø¥ÙÙØ§Ø¹ Ø³Ø±ÙØ¹ ÙÙØ³Ø± Ø§ÙÙÙÙ ÙÙØ­ÙØ² ØªØ±ÙÙØ²Ù ÙØ£ÙØµÙ Ø­Ø¯.',
      footer: 'ØµÙÙØ¹ Ø¨Ø´ØºÙ ÙÙ Ø§ÙØ·ÙØ§Ø¨.. Ø¥ÙÙ Ø§ÙØ·ÙØ§Ø¨. ÙØ§ ØªÙÙ ÙØ¬Ø±Ø¯ ÙØ§Ø³Ø®Ø ÙÙÙ ØµØ§ÙØ¹Ø§Ù ÙØªÙÙÙÙ.',
      pts: 'ÙÙØ·Ø©',
      streak: 'Ø³ÙØ³ÙØ©',
      demo_mode: 'Ø§ÙÙØ¶Ø¹ Ø§ÙØªØ¬Ø±ÙØ¨Ù',
      get_api_key: 'Ø§Ø­ØµÙ Ø¹ÙÙ ÙÙØªØ§Ø­ API',
      for_real_battles: 'ÙØªÙØ¹ÙÙ Ø§ÙØªØ­Ø¯ÙØ§Øª Ø¨Ø§ÙØ°ÙØ§Ø¡ Ø§ÙØ§ØµØ·ÙØ§Ø¹Ù',
      new_battle: 'ØªØ­Ø¯ÙÙ Ø¬Ø¯ÙØ¯',
      input_desc: 'Ø§Ø±ÙØ¹ Ø³Ø¤Ø§ÙÙ ÙØ§Ø®ØªØ± Ø§ÙÙØ§Ø¯Ø©Ø ÙØ¯Ø¹ÙØ§ ÙØ¨Ø¯Ø£ Ø§ÙØªØ­Ø¯Ù!',
      subject_label: 'Ø§Ø®ØªØ± Ø§ÙÙØ§Ø¯Ø©',
      question_label: 'Ø³Ø¤Ø§Ù Ø§ÙÙØ§Ø¬Ø¨',
      question_placeholder: 'Ø§ÙØªØ¨ Ø£Ù Ø§ÙØµÙ Ø³Ø¤Ø§Ù Ø§ÙÙØ§Ø¬Ø¨ ÙÙØ§...',
      upload_drag: 'Ø§Ø³Ø­Ø¨ Ø§ÙÙÙÙ ÙÙØ§Ø Ø£Ù',
      upload_browse: 'Ø§Ø®ØªØ± ÙÙÙ',
      upload_hint: 'ÙØ¯Ø¹Ù Ø§ÙØµÙØ± Ù PDF',
      start_battle: 'Ø§Ø¨Ø¯Ø£ Ø§ÙØªØ­Ø¯Ù Ø§ÙØ¢Ù!',
      summoning: 'ÙØ¬ÙÙØ² ÙÙ Ø§ÙØªØ­Ø¯Ù...',
      preparing: 'ÙØ­Ø¶ÙØ± Ø§ÙØ¬ÙÙØ§Øª',
      boss_defeated: 'Ø£Ø­Ø³ÙØª! ØªÙ Ø§ÙØ­Ù Ø¨ÙØ¬Ø§Ø­!',
      full_solution: 'Ø§ÙØ¥Ø¬Ø§Ø¨Ø© Ø§ÙÙÙÙØ°Ø¬ÙØ©',
      next_battle: 'ØªØ­Ø¯ÙÙ Ø¬Ø¯ÙØ¯',
      subj_math: 'Ø±ÙØ§Ø¶ÙØ§Øª',
      subj_science: 'Ø¹ÙÙÙ',
      subj_physics: 'ÙÙØ²ÙØ§Ø¡',
      subj_chemistry: 'ÙÙÙÙØ§Ø¡',
      subj_biology: 'Ø£Ø­ÙØ§Ø¡',
      subj_english: 'Ø¥ÙØ¬ÙÙØ²Ù',
      subj_history: 'ØªØ§Ø±ÙØ®',
      subj_geography: 'Ø¬ØºØ±Ø§ÙÙØ§',
      subj_cs: 'Ø­Ø§Ø³Ø¨',
      subj_other: 'Ø£Ø®Ø±Ù',
    }
  };

  function getCurrentLang() {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  function applyLang(lang) {
    const t = translations[lang];
    if (!t) return;

    // Set dir and lang on html
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.innerHTML = t[key];
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) el.placeholder = t[key];
    });

    // Update lang toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function init() {
    const lang = getCurrentLang();
    applyLang(lang);

    // Bind toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { getCurrentLang, setLang, translations };
})();
