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
      how_title: 'How It Works',
      step1_title: 'Paste Your Question',
      step1_desc: 'Drop in any homework question. Math, science, English — anything.',
      step2_title: 'Fight the Boss',
      step2_desc: '3 quick rounds: Quick Draw, Fill the Gap, Final Strike. Beat them all to win.',
      step3_title: 'Unlock the Answer',
      step3_desc: 'Defeat the boss and get the full solution. You earned it — and you actually understand it.',
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
      new_challenge_badge: 'تحدّي جديد',
      card_title: 'جاهز للتحدّي؟',
      hero_badge: 'طريقة جديدة للمذاكرة',
      hero_subtitle: 'وقف النسخ. وابدأ <strong>تفهم</strong> واجبك!',
      hero_desc: 'كل سؤال واجب يتحول لتحدّي ذكي. حل 3 جولات سريعة، افهم الدرس، واحصل على الإجابة. اجمع نقاط وطوّر مستواك!',
      cta_start: 'ابدأ الحين!',
      how_title: 'كيف يشتغل؟',
      step1_title: 'أضف سؤالك',
      step1_desc: 'اكتب أو صوّر سؤال الواجب. رياضيات، علوم، انجليزي — أي مادة.',
      step2_title: 'واجه التحدّي',
      step2_desc: '3 جولات سريعة تختبر فهمك للدرس بطريقة ممتعة.',
      step3_title: 'احصل على الإجابة',
      step3_desc: 'أكمل التحدّي واحصل على الحل الكامل. الحلو إنك فهمته مو بس نسخته!',
      feat1_title: 'سلسلة الانتصارات',
      feat1_desc: '3 انتصارات متتالية = نقاط مضاعفة! حافظ على السلسلة.',
      feat2_title: 'ألقاب وأوسمة',
      feat2_desc: 'ابدأ كـ "مبتدئ" ووصل لـ "عبقري". كل ما تحل أكثر يرتفع مستواك.',
      feat3_title: 'جولات سريعة',
      feat3_desc: 'كل جولة من 15 لـ 30 ثانية بس. بدون ملل، تحديات سريعة وممتعة.',
      footer: 'من طلاب، للطلاب. وقف النسخ وابدأ تفهم.',
      pts: 'نقاط',
      streak: 'سلسلة',
      demo_mode: 'الوضع التجريبي',
      get_api_key: 'احصل على مفتاح API',
      for_real_battles: 'لتفعيل التحديات بالذكاء الاصطناعي',
      new_battle: 'تحدّي جديد',
      input_desc: 'اكتب سؤال الواجب أو صوّره واختر المادة.',
      subject_label: 'المادة',
      question_label: 'سؤال الواجب',
      question_placeholder: 'اكتب أو الصق سؤال الواجب هنا...',
      upload_drag: 'اسحب الملف هنا، أو',
      upload_browse: 'اختر ملف',
      upload_hint: 'يدعم الصور و PDF',
      start_battle: 'ابدأ التحدّي!',
      summoning: 'نجهّز التحدّي...',
      preparing: 'نحضّر الجولات',
      boss_defeated: 'أحسنت! تم الحل!',
      full_solution: 'الحل الكامل',
      next_battle: 'التحدّي التالي',
      subj_math: 'رياضيات',
      subj_science: 'علوم',
      subj_physics: 'فيزياء',
      subj_chemistry: 'كيمياء',
      subj_biology: 'أحياء',
      subj_english: 'انجليزي',
      subj_history: 'تاريخ',
      subj_geography: 'جغرافيا',
      subj_cs: 'حاسب',
      subj_other: 'أخرى',
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
