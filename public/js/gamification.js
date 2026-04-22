// ========================================
// حلّها (Hallha) - Gamification System
// ========================================

const Gamification = (() => {
  const STORAGE_KEY = 'brainboost_data';

  // Translation lookup helper
  function tr(key) {
    if (typeof I18n === 'undefined' || !I18n.translations) return key;
    const lang = I18n.getCurrentLang ? I18n.getCurrentLang() : 'en';
    const dict = I18n.translations[lang] || I18n.translations.en || {};
    return dict[key] || (I18n.translations.en && I18n.translations.en[key]) || key;
  }

  const TITLES = [
    { minPoints: 0, key: 'title_rookie', emoji: '🐣' },
    { minPoints: 100, key: 'title_quester', emoji: '🗡️' },
    { minPoints: 300, key: 'title_puncher', emoji: '👊' },
    { minPoints: 600, key: 'title_battler', emoji: '⚔️' },
    { minPoints: 1000, key: 'title_slayer', emoji: '🔥' },
    { minPoints: 2000, key: 'title_knight', emoji: '🛡️' },
    { minPoints: 3500, key: 'title_warrior', emoji: '⚡' },
    { minPoints: 5000, key: 'title_brain_lord', emoji: '🧠' },
    { minPoints: 10000, key: 'title_legendary', emoji: '👑' },
  ];

  const BADGES = [
    { id: 'first_win', key: 'badge_first_blood', emoji: '🩸', check: d => d.totalWins >= 1 },
    { id: 'ten_wins', key: 'badge_veteran', emoji: '🎖️', check: d => d.totalWins >= 10 },
    { id: 'perfect', key: 'badge_perfect', emoji: '💎', check: d => d.perfectKills >= 1 },
    { id: 'streak3', key: 'badge_on_fire', emoji: '🔥', check: d => d.bestStreak >= 3 },
    { id: 'streak5', key: 'badge_unstoppable', emoji: '💥', check: d => d.bestStreak >= 5 },
    { id: 'points1k', key: 'badge_point_hoarder', emoji: '💰', check: d => d.totalPoints >= 1000 },
    { id: 'points5k', key: 'badge_rich_mind', emoji: '👑', check: d => d.totalPoints >= 5000 },
  ];

  // Load data from localStorage
  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch { /* fall through */ }
    }
    return {
      totalPoints: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalWins: 0,
      perfectKills: 0,
      badges: [],
    };
  }

  // Save data to localStorage
  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Get current player data
  function getData() {
    return load();
  }

  // Get current title based on points (translated)
  function getTitle(points) {
    let current = TITLES[0];
    for (const t of TITLES) {
      if (points >= t.minPoints) current = t;
    }
    return { ...current, title: tr(current.key) };
  }

  // Get streak multiplier
  function getMultiplier(streak) {
    if (streak >= 3) return 2;
    return 1;
  }

  // Add points and return details
  function addPoints(amount) {
    const data = load();
    const multiplier = getMultiplier(data.currentStreak);
    const actual = amount * multiplier;
    data.totalPoints += actual;
    save(data);
    return { base: amount, multiplier, actual, total: data.totalPoints };
  }

  // Record a battle win
  function recordWin(battlePoints, isPerfect) {
    const data = load();
    data.totalWins += 1;
    data.currentStreak += 1;
    if (data.currentStreak > data.bestStreak) {
      data.bestStreak = data.currentStreak;
    }
    if (isPerfect) {
      data.perfectKills += 1;
    }

    // Calculate total points with streak multiplier
    const multiplier = getMultiplier(data.currentStreak);
    const perfectBonus = isPerfect ? 50 : 0;
    const totalEarned = (battlePoints + perfectBonus) * multiplier;
    data.totalPoints += totalEarned;

    // Check for new badges (translate names on the fly)
    const newBadges = [];
    for (const badge of BADGES) {
      if (!data.badges.includes(badge.id) && badge.check(data)) {
        data.badges.push(badge.id);
        newBadges.push({ ...badge, name: tr(badge.key) });
      }
    }

    save(data);

    return {
      pointsEarned: totalEarned,
      battlePoints,
      perfectBonus,
      multiplier,
      totalPoints: data.totalPoints,
      streak: data.currentStreak,
      isPerfect,
      newBadges,
      title: getTitle(data.totalPoints),
    };
  }

  // Reset streak (on loss — not used currently since we always let them win)
  function resetStreak() {
    const data = load();
    data.currentStreak = 0;
    save(data);
  }

  // Update the UI elements
  function updateUI() {
    const data = load();
    const title = getTitle(data.totalPoints);

    const pointsEl = document.getElementById('total-points');
    const streakEl = document.getElementById('streak-count');
    const streakIcon = document.getElementById('streak-icon');
    const titleEl = document.getElementById('player-title');

    if (pointsEl) pointsEl.textContent = data.totalPoints.toLocaleString();
    if (streakEl) streakEl.textContent = data.currentStreak;
    if (streakIcon) streakIcon.textContent = data.currentStreak >= 3 ? '🔥' : '✨';
    if (titleEl) titleEl.textContent = title.title;
  }

  // Show floating points animation
  function showPointsPopup(points) {
    const popup = document.getElementById('points-popup');
    if (!popup) return;

    popup.textContent = `+${points}`;
    popup.classList.remove('hidden');
    popup.style.animation = 'none';
    // Trigger reflow
    popup.offsetHeight;
    popup.style.animation = 'pointsFloat 1s ease forwards';

    setTimeout(() => popup.classList.add('hidden'), 1000);
  }

  // Shake the screen
  function shakeScreen() {
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 400);
  }

  return {
    getData,
    getTitle,
    getMultiplier,
    addPoints,
    recordWin,
    resetStreak,
    updateUI,
    showPointsPopup,
    shakeScreen,
    BADGES,
  };
})();
