// ========================================
// BrainBoost - Gamification System
// ========================================

const Gamification = (() => {
  const STORAGE_KEY = 'brainboost_data';

  const TITLES = [
    { minPoints: 0, title: 'Homework Rookie', emoji: '🐣' },
    { minPoints: 100, title: 'Question Quester', emoji: '🗡️' },
    { minPoints: 300, title: 'Problem Puncher', emoji: '👊' },
    { minPoints: 600, title: 'Boss Battler', emoji: '⚔️' },
    { minPoints: 1000, title: 'Boss Slayer', emoji: '🔥' },
    { minPoints: 2000, title: 'Knowledge Knight', emoji: '🛡️' },
    { minPoints: 3500, title: 'Wisdom Warrior', emoji: '⚡' },
    { minPoints: 5000, title: 'Brain Lord', emoji: '🧠' },
    { minPoints: 10000, title: 'Legendary Mind', emoji: '👑' },
  ];

  const BADGES = [
    { id: 'first_win', name: 'First Blood', emoji: '🩸', desc: 'Defeat your first boss', check: d => d.totalWins >= 1 },
    { id: 'ten_wins', name: 'Veteran', emoji: '🎖️', desc: 'Defeat 10 bosses', check: d => d.totalWins >= 10 },
    { id: 'perfect', name: 'Perfect Kill', emoji: '💎', desc: 'Complete a battle with no mistakes', check: d => d.perfectKills >= 1 },
    { id: 'streak3', name: 'On Fire', emoji: '🔥', desc: 'Win 3 battles in a row', check: d => d.bestStreak >= 3 },
    { id: 'streak5', name: 'Unstoppable', emoji: '💥', desc: 'Win 5 battles in a row', check: d => d.bestStreak >= 5 },
    { id: 'points1k', name: 'Point Hoarder', emoji: '💰', desc: 'Earn 1,000 total points', check: d => d.totalPoints >= 1000 },
    { id: 'points5k', name: 'Rich Mind', emoji: '👑', desc: 'Earn 5,000 total points', check: d => d.totalPoints >= 5000 },
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

  // Get current title based on points
  function getTitle(points) {
    let current = TITLES[0];
    for (const t of TITLES) {
      if (points >= t.minPoints) current = t;
    }
    return current;
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

    // Check for new badges
    const newBadges = [];
    for (const badge of BADGES) {
      if (!data.badges.includes(badge.id) && badge.check(data)) {
        data.badges.push(badge.id);
        newBadges.push(badge);
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
