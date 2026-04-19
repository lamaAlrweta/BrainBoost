// ========================================
// حلها (Hallha) - Internationalization (EN/AR)
// ========================================

const I18n = (() => {
  const STORAGE_KEY = 'brainboost_lang';

  const translations = {
    en: {
      app_name: 'Hallha',
      app_tagline: 'Solve it once, understand it forever',
      hero_badge: 'A NEW WAY TO STUDY',
      hero_subtitle: 'Stop memorizing. Start <strong>understanding</strong> your homework.',
      hero_desc: 'Every homework becomes a 3-step journey: Solve It, Understand It, Master It. Build real comprehension in minutes — not just answers, insight.',
      cta_start: 'Start Learning',
      how_title: 'How It Works',
      step1_title: 'Paste Your Question',
      step1_desc: 'Drop in any homework question. Math, science, English \u2014 anything.',
      step2_title: 'Go Through 3 Rounds',
      step2_desc: '3 focused rounds: Solve It, Understand It, Master It. Each round builds real comprehension step by step.',
      step3_title: 'Unlock the Answer',
      step3_desc: 'Finish the journey and get the full solution. You\'ve earned it \u2014 and you actually understand it.',
      feat1_title: 'Streaks & Points',
      feat1_desc: '3 correct rounds in a row = 2x point multiplier. Keep your momentum going.',
      feat2_title: 'Titles & Badges',
      feat2_desc: 'Progress from "Curious Beginner" to "Master Thinker". Every challenge raises your rank.',
      feat3_title: 'Quick Rounds',
      feat3_desc: 'Each round takes 15-30 seconds. No lectures. Just focused, meaningful practice.',
      footer: 'Built by students, for students. Don\'t just copy answers \u2014 understand them.',
      copyright_footer: '© 2026 Hallha. All rights reserved.',
      new_challenge_badge: 'NEW CHALLENGE',
      card_title: 'Ready to learn?',
      pts: 'pts',
      streak: 'streak',
      demo_mode: 'Demo Mode',
      get_api_key: 'Get an API key',
      for_real_battles: 'for real AI challenges',
      new_battle: 'New Challenge',
      input_desc: 'Paste your homework question below and choose the subject.',
      subject_label: 'Subject',
      question_label: 'Your Homework Question',
      question_placeholder: 'Paste your homework question here...',
      upload_drag: 'Drop a photo of your homework here, or',
      upload_browse: 'browse',
      upload_hint: 'Supports images and PDFs',
      divider_or: 'OR',
      start_battle: 'Start Challenge',
      summoning: 'Preparing your challenge...',
      preparing: 'Getting your rounds ready',
      boss_defeated: 'CHALLENGE COMPLETE!',
      full_solution: 'Full Solution',
      next_battle: 'New Challenge',
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
      // Round labels + dynamic UI
      round_label: 'ROUND',
      round1_title: 'Solve It',
      round2_title: 'Understand It',
      round3_title: 'Master It',
      round1_subtitle: 'The Curious One',
      round2_subtitle: 'The Thinker',
      round3_subtitle: 'The Champion',
      btn_true: '✅ TRUE',
      btn_false: '❌ FALSE',
      btn_next_round: 'Next Round →',
      btn_final_round: 'Final Round →',
      btn_strike: '⚔️ Strike!',
      answer_placeholder: 'Your answer...',
      feedback_correct: 'Correct! 🎯',
      feedback_wrong: 'Wrong! The answer was',
      feedback_true: 'TRUE',
      feedback_false: 'FALSE',
      blitz_done: 'Blitz done!',
      blitz_correct_word: 'correct',
      hint_label: '💡',
      insight_label: '🔑 Key insight:',
      // Victory stats
      points_earned: 'Points Earned',
      win_streak: 'Win Streak',
      multiplier: 'Multiplier',
      perfect_kill: 'Perfect Round!',
      new_badge: 'NEW',
      // Error / alert messages
      err_no_files_usable: 'None of your uploaded files could be used:',
      err_upload_jpg: 'Please upload a JPG, PNG, GIF, or WebP image.',
      err_not_image: 'not an image',
      err_not_supported: 'not supported — use JPG/PNG',
      err_could_not_resize: 'could not resize',
      err_generic: 'Failed to generate battle. Please try again.',
      // Titles (gamification)
      title_rookie: 'Curious Beginner',
      title_quester: 'Question Explorer',
      title_puncher: 'Problem Tackler',
      title_battler: 'Concept Seeker',
      title_slayer: 'Deep Thinker',
      title_knight: 'Knowledge Knight',
      title_warrior: 'Wisdom Warrior',
      title_brain_lord: 'Master Thinker',
      title_legendary: 'Legendary Mind',
      // Badges
      badge_first_blood: 'First Victory',
      badge_veteran: 'Veteran',
      badge_perfect: 'Perfect Round',
      badge_on_fire: 'On Fire',
      badge_unstoppable: 'Unstoppable',
      badge_point_hoarder: 'Point Collector',
      badge_rich_mind: 'Rich Mind',
    },
    ar: {
      app_name: 'حلها',
      app_tagline: 'حلها مرة، افهمها للأبد',
      new_challenge_badge: '\u062A\u062D\u062F\u0651\u064A \u062C\u062F\u064A\u062F',
      card_title: '\u062C\u0627\u0647\u0632 \u062A\u0628\u062F\u0623 \u0627\u0644\u062A\u062D\u062F\u0651\u064A\u061F',
      hero_badge: '\u0623\u0633\u0644\u0648\u0628 \u0645\u0628\u062A\u0643\u0631 \u0644\u0644\u062A\u0639\u0644\u0651\u0645',
      hero_subtitle: '\u0627\u0641\u0647\u0645 \u0648\u0627\u062C\u0628\u0643 \u0641\u064A \u0623\u0642\u0644 \u0645\u0646 3 \u062F\u0642\u0627\u0626\u0642.. \u0648\u0627\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 <strong>\u0628\u0630\u0643\u0627\u0621</strong>!',
      hero_desc: '\u062D\u0648\u0651\u0644 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0648\u0627\u062C\u0628 \u0625\u0644\u0649 \u062A\u062D\u062F\u064A\u0627\u062A \u0645\u0645\u062A\u0639\u0629. \u062E\u0636 3 \u062C\u0648\u0644\u0627\u062A \u0633\u0631\u064A\u0639\u0629 \u0635\u064E\u0645\u0651\u0645\u062A \u0644\u062A\u0628\u0633\u0651\u0637 \u0644\u0643 \u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645\u060C \u0648\u0628\u0645\u062C\u0631\u062D\u0627\u0644\u0647\u0627 \u0633\u062A\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0646\u0645\u0648\u0630\u062C\u064A\u0629. \u0627\u062C\u0645\u0639 \u0627\u0644\u0646\u0642\u0627\u0637\u060C \u0648\u0627\u0631\u0641\u0639 \u0645\u0633\u062A\u0648\u0627\u0643 \u0628\u062C\u0647\u062F\u0643!',
      cta_start: '\u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u062D\u062F\u064A \u0627\u0644\u0622\u0646',
      how_title: '\u0643\u064A\u0641 \u062A\u0639\u0645\u0644 \u0627\u0644\u0645\u0646\u0635\u0629\u061F',
      step1_title: '\u0623\u0636\u0641 \u0633\u0624\u0627\u0644\u0643',
      step1_desc: '\u0627\u0631\u0641\u0639 \u0633\u0624\u0627\u0644\u0643 \u0633\u0648\u0627\u0621 \u0643\u0627\u0646 \u0646\u0635\u0627\u064B \u0623\u0648 \u0635\u0648\u0631\u0629 \u0641\u064A \u0623\u064A \u0645\u0627\u062F\u0629 (\u0631\u064A\u0627\u0636\u064A\u0627\u062A\u060C \u0639\u0644\u0648\u0645\u060C \u0644\u063A\u0627\u062A)\u060C \u0648\u062F\u0639\u0646\u0627 \u0646\u062C\u0647\u0651\u0632 \u0644\u0643 \u0627\u0644\u062A\u062D\u062F\u064A.',
      step2_title: '\u062E\u0636 \u0627\u0644\u062A\u062D\u062F\u064A',
      step2_desc: '\u0623\u062C\u0628 \u0639\u0646 3 \u062C\u0648\u0644\u0627\u062A \u0630\u0643\u064A\u0629 \u0648\u0633\u0631\u064A\u0639\u0629\u060C \u0645\u064F\u0635\u0645\u0651\u0645\u0629 \u062E\u0635\u064A\u0635\u0627\u064B \u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0641\u0647\u0645\u0643 \u0644\u0644\u062F\u0631\u0633 \u0628\u0637\u0631\u064A\u0642\u0629 \u0645\u0645\u062A\u0639\u0629.',
      step3_title: '\u0627\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u062C\u0627\u0628\u0629',
      step3_desc: '\u0628\u0645\u062C\u0631\u062F \u0627\u062C\u062A\u064A\u0627\u0632\u0643 \u0644\u0644\u062A\u062D\u062F\u064A\u060C \u0633\u062A\u064F\u0641\u062A\u062D \u0644\u0643 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0646\u0645\u0648\u0630\u062C\u064A\u0629 \u0644\u062A\u0636\u0645\u0646 \u0627\u0633\u062A\u064A\u0639\u0627\u0628\u0643 \u0627\u0644\u0643\u0627\u0645\u0644 \u0644\u0644\u062E\u0637\u0648\u0627\u062A\u060C \u0648\u062A\u0643\u0648\u0646 \u0642\u062F \u0643\u0633\u0628\u062A \u0627\u0644\u062D\u0644 \u0628\u062C\u062F\u0627\u0631\u0629.',
      feat1_title: '\u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u062A\u0641\u0648\u0651\u0642',
      feat1_desc: '3 \u0625\u062C\u0627\u0628\u0627\u062A \u0635\u062D\u064A\u062D\u0629 \u0645\u062A\u062A\u0627\u0644\u064A\u0629 = \u0646\u0642\u0627\u0637 \u0645\u0636\u0627\u0639\u0641\u0629! \u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u062A\u0642\u062F\u0645\u0643 \u0648\u0644\u0627 \u062A\u0643\u0633\u0631 \u0627\u0644\u0633\u0644\u0633\u0644\u0629.',
      feat2_title: '\u0623\u0648\u0633\u0645\u0629 \u0627\u0644\u0625\u0646\u062C\u0627\u0632',
      feat2_desc: '\u0627\u0631\u062A\u0642\u0650 \u0641\u064A \u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0645\u0646 "\u0645\u0628\u062A\u062F\u0626" \u0625\u0644\u0649 "\u0639\u0628\u0642\u0631\u064A". \u0643\u0644 \u062A\u062D\u062F\u0651\u064D \u062A\u0646\u062C\u0632\u0647 \u064A\u0631\u0641\u0639 \u0645\u0646 \u0645\u0633\u062A\u0648\u0627\u0643.',
      feat3_title: '\u062C\u0648\u0644\u0627\u062A \u0633\u0631\u064A\u0639\u0629',
      feat3_desc: '\u062C\u0648\u0644\u0627\u062A \u0644\u0627 \u062A\u062A\u062C\u0627\u0648\u0632 15 \u0625\u0644\u0649 30 \u062B\u0627\u0646\u064A\u0629. \u0625\u064A\u0642\u0627\u0639 \u0633\u0631\u064A\u0639 \u064A\u0643\u0633\u0631 \u0627\u0644\u0645\u0644\u0644 \u0648\u064A\u062D\u0641\u0632 \u062A\u0631\u0643\u064A\u0632\u0643 \u0644\u0623\u0642\u0635\u0649 \u062D\u062F.',
      footer: '\u0635\u064F\u0646\u0639 \u0628\u0634\u063A\u0641\u0625 \u0627\u0644\u0637\u0644\u0627\u0628.. \u0625\u0644\u0649 \u0627\u0644\u0637\u0644\u0627\u0628. \u0644\u0627 \u062A\u0643\u0646 \u0645\u062C\u0631\u062F \u0646\u0627\u0633\u062E\u060C \u0643\u064F\u0646 \u0635\u0627\u0646\u0639\u0627\u064B \u0644\u062A\u0641\u0648\u0651\u0642\u0643.',
      copyright_footer: '© 2026 حلها. جميع الحقوق محفوظة.',
      pts: '\u0646\u0642\u0637\u0629',
      streak: '\u0633\u0644\u0633\u0644\u0629',
      demo_mode: '\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A',
      get_api_key: '\u0627\u062D\u0635\u0644 \u0639\u0644\u0649 \u0645\u0641\u062A\u0627\u062D API',
      for_real_battles: '\u0644\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062A\u062D\u062F\u064A\u0627\u062A \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A',
      new_battle: '\u062A\u062D\u062F\u0651\u064A \u062C\u062F\u064A\u062F',
      input_desc: '\u0627\u0631\u0641\u0639 \u0633\u0624\u0627\u0644\u0643 \u0648\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0627\u062F\u0629\u060C \u0648\u062F\u0639\u0646\u0627 \u0646\u0628\u062F\u0623 \u0627\u0644\u062A\u062D\u062F\u064A!',
      subject_label: '\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0627\u062F\u0629',
      question_label: '\u0633\u0624\u0627\u0644 \u0627\u0644\u0648\u0627\u062C\u0628',
      question_placeholder: '\u0627\u0643\u062A\u0628 \u0623\u0648 \u0627\u0644\u0635\u0642 \u0633\u0624\u0627\u0644 \u0627\u0644\u0648\u0627\u062C\u0628 \u0647\u0646\u0627...',
      upload_drag: '\u0627\u0633\u062D\u0628 \u0627\u0644\u0645\u0644\u0641 \u0647\u0646\u0627\u060C \u0623\u0648',
      upload_browse: '\u0627\u062E\u062A\u0631 \u0645\u0644\u0641',
      upload_hint: '\u064A\u062F\u0639\u0645 \u0627\u0644\u0635\u0648\u0631 \u0648 PDF',
      divider_or: 'أو',
      start_battle: '\u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u062D\u062F\u064A \u0627\u0644\u0622\u0646!',
      summoning: '\u0646\u062C\u0647\u0651\u0632 \u0644\u0643 \u0627\u0644\u062A\u062D\u062F\u064A...',
      preparing: '\u0646\u062D\u0636\u0651\u0632 \u0627\u0644\u062C\u0648\u0644\u0627\u062A',
      boss_defeated: '\u0623\u062D\u0633\u0646\u062A! \u062A\u0645 \u0627\u0644\u062D\u0644 \u0628\u0646\u062C\u0627\u062D!',
      full_solution: '\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0646\u0645\u0648\u0630\u062C\u064A\u0629',
      next_battle: '\u062A\u062D\u062F\u0651\u064A \u062C\u062F\u064A\u062F',
      subj_math: '\u0631\u064A\u0627\u0636\u064A\u0627\u062A',
      subj_science: '\u0639\u0644\u0648\u0645',
      subj_physics: '\u0641\u064A\u0632\u064A\u0627\u0621',
      subj_chemistry: '\u0643\u064A\u0645\u064A\u0627\u0621',
      subj_biology: '\u0623\u062D\u064A\u0627\u0621',
      subj_english: '\u0625\u0646\u062C\u0644\u064A\u0632\u064A',
      subj_history: '\u062A\u0627\u0631\u064A\u062E',
      subj_geography: '\u062C\u063A\u0631\u0627\u0641\u064A\u0627',
      subj_cs: '\u062D\u0627\u0633\u0628',
      subj_other: '\u0623\u062E\u0631\u0649',
      // Round labels + dynamic UI
      round_label: '\u0627\u0644\u062C\u0648\u0644\u0629',
      round1_title: 'حلها',
      round2_title: 'افهمها',
      round3_title: 'اتقنها',
      round1_subtitle: 'الفضولي',
      round2_subtitle: 'المفكِّر',
      round3_subtitle: 'البطل',
      btn_true: '\u2705 \u0635\u062D',
      btn_false: '\u274C \u062E\u0637\u0623',
      btn_next_round: '\u0627\u0644\u062C\u0648\u0644\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u2190',
      btn_final_round: '\u0627\u0644\u062C\u0648\u0644\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629 \u2190',
      btn_strike: '\u2694\uFE0F \u0627\u0636\u0631\u0628!',
      answer_placeholder: '\u0625\u062C\u0627\u0628\u062A\u0643...',
      feedback_correct: '\u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629! 🎯',
      feedback_wrong: '\u0625\u062C\u0627\u0628\u0629 \u062E\u0627\u0637\u0626\u0629! \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0647\u064A',
      feedback_true: '\u0635\u062D',
      feedback_false: '\u062E\u0637\u0623',
      blitz_done: '\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u062C\u0648\u0644\u0629!',
      blitz_correct_word: '\u0625\u062C\u0627\u0628\u0627\u062A \u0635\u062D\u064A\u062D\u0629',
      hint_label: '💡',
      insight_label: '🔑 \u0627\u0644\u0641\u0643\u0631\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629:',
      // Victory stats
      points_earned: '\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u0643\u062A\u0633\u0628\u0629',
      win_streak: '\u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u0641\u0648\u0632',
      multiplier: '\u0645\u0636\u0627\u0639\u0641 \u0627\u0644\u0646\u0642\u0627\u0637',
      perfect_kill: '\u0641\u0648\u0632 \u0645\u062B\u0627\u0644\u064A!',
      new_badge: '\u062C\u062F\u064A\u062F',
      // Error / alert messages
      err_no_files_usable: '\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u064A \u0645\u0646 \u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u062A\u064A \u0631\u0641\u0639\u062A\u0647\u0627:',
      err_upload_jpg: '\u0641\u0636\u0644\u0627\u064B \u0627\u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u0628\u0635\u064A\u063A\u0629 JPG \u0623\u0648 PNG \u0623\u0648 GIF \u0623\u0648 WebP.',
      err_not_image: '\u0644\u064A\u0633 \u0635\u0648\u0631\u0629',
      err_not_supported: '\u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645 \u2014 \u0627\u0633\u062A\u062E\u062F\u0645 JPG \u0623\u0648 PNG',
      err_could_not_resize: '\u062A\u0639\u0630\u0631 \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u062D\u062C\u0645',
      err_generic: '\u062A\u0639\u0630\u0631 \u062A\u0648\u0644\u064A\u062F \u0627\u0644\u062A\u062D\u062F\u064A. \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.',
      // Titles
      title_rookie: '\u0645\u0628\u062A\u062F\u0626 \u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A',
      title_quester: '\u0628\u0627\u062D\u062B \u0627\u0644\u0623\u0633\u0626\u0644\u0629',
      title_puncher: '\u0645\u0644\u0627\u0643\u0645 \u0627\u0644\u0645\u0633\u0627\u0626\u0644',
      title_battler: '\u0645\u062D\u0627\u0631\u0628 \u0627\u0644\u0632\u0639\u0645\u0627\u0621',
      title_slayer: '\u0642\u0627\u062A\u0644 \u0627\u0644\u0632\u0639\u0645\u0627\u0621',
      title_knight: '\u0641\u0627\u0631\u0633 \u0627\u0644\u0645\u0639\u0631\u0641\u0629',
      title_warrior: '\u0645\u062D\u0627\u0631\u0628 \u0627\u0644\u062D\u0643\u0645\u0629',
      title_brain_lord: '\u0633\u064A\u062F \u0627\u0644\u0639\u0642\u0644',
      title_legendary: '\u0627\u0644\u0639\u0642\u0644 \u0627\u0644\u0623\u0633\u0637\u0648\u0631\u064A',
      // Badges
      badge_first_blood: '\u0623\u0648\u0644 \u0641\u0648\u0632',
      badge_veteran: '\u0645\u062E\u0636\u0631\u0645',
      badge_perfect: '\u0641\u0648\u0632 \u0645\u062B\u0627\u0644\u064A',
      badge_on_fire: '\u0645\u0634\u062A\u0639\u0644',
      badge_unstoppable: '\u0644\u0627 \u064A\u064F\u0642\u0627\u0648\u0645',
      badge_point_hoarder: '\u062C\u0627\u0645\u0639 \u0627\u0644\u0646\u0642\u0627\u0637',
      badge_rich_mind: '\u0627\u0644\u0639\u0642\u0644 \u0627\u0644\u063A\u0646\u064A',
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

    // Refresh the gamification UI so the player title updates live
    if (typeof Gamification !== 'undefined' && Gamification.updateUI) {
      Gamification.updateUI();
    }
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
