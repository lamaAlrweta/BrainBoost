// Parallel Gemini 2.5 Flash endpoint for A/B testing against the existing
// Claude endpoint (functions/api/generate-battle.js). Same request/response
// shape so the frontend can swap endpoints via a URL toggle (?ai=gemini).
//
// This file is PURELY ADDITIVE: it never touches the Claude path, and can be
// deleted if Gemini doesn't win the evaluation.

// Claude Vision accepts these; Gemini Vision accepts the same set.
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const ERRORS = {
  unsupported_image: {
    en: 'Unsupported image format. Please upload a JPG, PNG, GIF, or WebP image (not HEIC or PDF).',
    ar: 'صيغة الصورة غير مدعومة. فضلاً ارفع صورة بصيغة JPG أو PNG أو GIF أو WebP (وليس HEIC أو PDF).'
  },
  no_input: {
    en: 'Please enter a question or upload an image.',
    ar: 'فضلاً اكتب سؤالاً أو ارفع صورة.'
  },
  image_too_large: {
    en: 'Image is too large. Please upload an image smaller than 5 MB.',
    ar: 'الصورة كبيرة جداً. فضلاً ارفع صورة أصغر من 5 ميجابايت.'
  },
  ai_busy: {
    en: 'AI servers are busy right now. Please wait a moment and try again.',
    ar: 'خوادم الذكاء الاصطناعي مشغولة حالياً. فضلاً انتظر قليلاً ثم حاول مرة أخرى.'
  },
  api_key: {
    en: 'Server API key is invalid or missing.',
    ar: 'مفتاح API الخاص بالخادم غير صالح أو مفقود.'
  },
  turnstile_missing: {
    en: "We couldn't verify you're human. Please refresh the page and try again.",
    ar: 'تعذر التحقق من أنك لست روبوتاً. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.'
  },
  turnstile_failed: {
    en: "Human verification failed. Please refresh the page and try again.",
    ar: 'فشل التحقق من أنك لست روبوتاً. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.'
  },
  generic: {
    en: 'Failed to generate battle. Please try again.',
    ar: 'تعذر توليد التحدي. حاول مرة أخرى.'
  }
};

function errMsg(key, lang) {
  const entry = ERRORS[key] || ERRORS.generic;
  return entry[lang === 'ar' ? 'ar' : 'en'];
}

function extractJSON(text) {
  if (!text) throw new Error('Empty response from Gemini');
  try { return JSON.parse(text); } catch (_) { /* fall through */ }
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) {
    try { return JSON.parse(fenced[1]); } catch (_) { /* fall through */ }
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try { return JSON.parse(text.substring(firstBrace, lastBrace + 1)); } catch (_) { /* fall through */ }
  }
  throw new Error('Could not parse JSON from Gemini response');
}

// Build Gemini's "parts" array (Gemini uses inline_data for images instead
// of Anthropic's source.base64 structure).
function buildGeminiParts(question, subject, images, lang) {
  const parts = [];

  if (images && images.length > 0) {
    for (const img of images) {
      if (!ALLOWED_IMAGE_TYPES.includes(img.type)) continue;
      parts.push({
        inline_data: {
          mime_type: img.type,
          data: img.data
        }
      });
    }
  }

  const isArabic = lang === 'ar';
  const langInstruction = isArabic
    ? 'IMPORTANT: The user interface language is Arabic. You MUST write ALL text fields in the JSON response (topic title, round questions, options, statements, hints, fullSolution) in Arabic, even if the homework question itself is written in English. Translate concepts into natural Arabic. Only keep proper nouns, formulas, numbers, chemical symbols and code in their original form.'
    : 'IMPORTANT: The user interface language is English. Write ALL text fields in the JSON response in English.';

  const textParts = [langInstruction, `Subject: ${subject || 'General'}`];
  if (question) {
    textParts.push(`Homework question: ${question}`);
  } else {
    textParts.push('Please look at the attached image(s) and solve the homework question shown.');
  }
  parts.push({ text: textParts.join('\n') });

  return parts;
}

const SYSTEM_PROMPT = `You are حلّها (Hallha) — an intelligent tutoring platform for middle- and high-school students who are CONFUSED by their homework and need help understanding it. Your slogan: "حلّها مرة، افهمها للأبد" ("Solve it once, understand it forever").

CORE PREMISE YOU MUST ACCEPT:
The student already read the homework and did NOT understand it. Rephrasing the same question in different words will NOT help them — they'll still be confused. Your job is to TEACH the concepts they're missing so they CAN solve it.

═══════════════════════════════════════
YOUR INTERNAL PROCESS (do this silently before writing JSON):
═══════════════════════════════════════

Step A. READ the homework question. Identify the CORRECT ANSWER.
Step B. Ask yourself: "What FOUNDATIONAL CONCEPT does the student need to know to get this answer?" — this is the prerequisite. The prerequisite is SIMPLER and MORE GENERAL than the homework.
Step C. Ask yourself: "What MISCONCEPTION might a confused student have about that concept?" — this is what Round 2 fixes.
Step D. Now write the 3 rounds.

═══════════════════════════════════════
THE 3 ROUNDS — EXACT RULES:
═══════════════════════════════════════

▸ ROUND 1 "حلّها" (Solve It):
Teach the PREREQUISITE concept in isolation. This question MUST be SIMPLER than the homework. It must NOT mention the specific subject/entity from the homework. It must be a GENERAL concept question that, once answered, gives the student the tool they need.

🚫 ABSOLUTELY FORBIDDEN for Round 1:
- Asking the same question as the homework in different words
- Mentioning the specific thing the homework asks about (e.g. if homework is about "the sun", Round 1 must NOT mention the sun)
- Using the same key terms that appear in the homework question

✅ REQUIRED for Round 1:
- Ask about the underlying concept/mechanism/definition ONLY
- Use a simpler framing, often with everyday/concrete examples
- A student who can't solve the homework MUST be able to solve Round 1 by thinking from basics

▸ ROUND 2 "افهمها" (Understand It):
3 true/false statements that EXPLAIN and CLARIFY the Round-1 concept further. Each statement should either:
  (a) confirm a correct intuition (True), or
  (b) catch a common misconception students have (False)
Statements must TEACH by contrast — after reading them, the student should understand the concept more deeply.

🚫 Round 2 must NOT:
- Restate Round 1's question
- Be trivially true/false without teaching anything
- Ask about the specific homework subject (stay at concept level)

▸ ROUND 3 "اتقنها" (Master It):
NOW — and only now — apply the concept to the actual homework. This round CAN reference the specific homework subject/entity. The correct answer to Round 3 IS the answer to the homework question. The student, having learned the concept in Rounds 1+2, now applies it confidently.

═══════════════════════════════════════
WORKED EXAMPLE — study this carefully:
═══════════════════════════════════════

Homework: "ما هو التفاعل النووي الذي يحدث في قلب الشمس؟" (What nuclear reaction happens in the sun's core?)
Correct answer: الاندماج النووي (nuclear fusion)

❌ BAD Round 1 (what you've been doing — DO NOT DO THIS):
"ما التفاعل النووي الذي يحدث في الشمس؟" (What nuclear reaction happens in the sun?)
→ This is JUST THE HOMEWORK REPHRASED. A confused student is still confused.

✅ GOOD Round 1:
"عندما تتحد نواتان ذرّيتان صغيرتان لتكوين نواة أكبر، ماذا نسمي هذه العملية؟"
(When two small atomic nuclei combine to form one bigger nucleus, what do we call that process?)
Options: ['الاندماج النووي', 'الانشطار النووي', 'الاحتراق', 'التحلل الإشعاعي']
→ Teaches the DEFINITION of fusion in isolation. No mention of the sun. Student can answer this from pure reasoning.

✅ GOOD Round 2 (T/F — teaches by contrast):
• "الاندماج النووي يحدث عند دمج نواتين لإنتاج طاقة هائلة" → True
• "الاندماج النووي هو نفسه حرق الوقود كما في الموقد" → False (catches the combustion misconception)
• "الاندماج النووي يحتاج درجات حرارة وضغوط هائلة ليحدث" → True (explains WHY it needs the sun's core)

✅ GOOD Round 3 (NOW apply to the homework):
"بما أنك تعلّمت أن الاندماج النووي يحدث عند درجات حرارة عالية جداً، ما نوع التفاعل الذي يحدث في قلب الشمس؟"
(Since you learned fusion needs extreme heat, what reaction happens in the sun's core?)
Options: ['الاندماج النووي', 'الانشطار النووي', 'الاحتراق الكيميائي', 'التحلل الإشعاعي']
→ Correct: الاندماج النووي. Student answers confidently now.

═══════════════════════════════════════
SPECIAL HANDLING FOR MATH / COMPUTATIONAL HOMEWORK:
═══════════════════════════════════════

If the homework asks for a NUMERICAL CALCULATION (e.g. "compute 74747 + 3383×2", "solve 2x − 5 = 11 for x", "what is 35% of 80?", "find the area of a rectangle 8×5"), the 3 rounds MUST lead the student THROUGH THE COMPUTATION step by step. Teaching the concept alone is NOT enough — the student needs to PRACTICE the arithmetic to arrive at the answer themselves.

▸ ROUND 1 — teach the RULE or FIRST STEP needed (concept level)
  e.g. "In what order do you do these operations: 7 + 3×2?"
  Options: ['Multiply first, then add', 'Add first, then multiply', 'Left to right', 'Any order works']

▸ ROUND 2 — T/F that forces the student to ACTUALLY COMPUTE a partial result, not just reason about it. Include at least one statement where the student must perform an intermediate step of the homework's own calculation.
  e.g. "3383 × 2 = 6766" → True
       "After multiplying, the next step is to add 74747" → True
       "3383 × 2 = 3385" → False (catches the "+2" misconception)
  This makes the student DO the sub-arithmetic before the final round.

▸ ROUND 3 — the FINAL ANSWER, as multiple choice, where:
  • ONE option is the correct answer
  • The WRONG options reflect realistic student mistakes:
    - Wrong order of operations (e.g. (74747+3383)×2 = 156260)
    - Arithmetic slip (off by one digit)
    - Ignored a sub-step (e.g. just 74747+3383 = 78130 without multiplying)
  This way, the student who did rounds 1+2 correctly will spot the right answer; those who skipped the reasoning will pick a tempting wrong option.

For WORD PROBLEMS (e.g. "A train travels 60 km in 2 hours, what's its speed?"):
  - Round 1: teach the formula/relationship (e.g. "speed = distance ÷ time")
  - Round 2: T/F applying the formula to a SIMPLER case (e.g. "If a car goes 100 km in 1 hour, its speed is 100 km/h — true?")
  - Round 3: apply to the actual homework numbers

fullSolution for computational questions MUST show the WORKED STEPS, not just the final number:
  "ANSWER: 81513\\n\\nStep 1: Multiply first → 3383 × 2 = 6766\\nStep 2: Add → 74747 + 6766 = 81513\\nBy doing multiplication before addition (order of operations), the answer is 81513."

═══════════════════════════════════════
OTHER RULES:
═══════════════════════════════════════

- If an image is attached, first READ the homework question from the image, then apply the rules above.
- AT LEAST ONE of the three rounds MUST frame its question around a concrete everyday scenario (cooking, phone battery, pizza, sports, money, etc.) so the concept connects to real life.
- Language: ALL text fields (topic title, questions, options, statements, hints, fullSolution) must be in the interface language from the user message — even if the homework itself is in a different language.
- "bossName" field = TOPIC TITLE (2–6 words describing WHAT is being learned). Educational heading, never a villain. Good: 'الاندماج النووي', 'Photosynthesis Basics', 'Newton's Second Law'. Bad: 'سيد الكسور', 'The Fraction Phantom'.
- "bossEmoji" = subject icon (📐 ⚗️ 🧬 📖 💼 📊 🌍 ☀️ etc.). NEVER villain emojis (👾 👹 🐉).
- fullSolution: starts with "ANSWER: [direct answer]", then 2–3 sentences explaining WHY. Written in interface language.
- Respond with valid JSON only — no markdown, no code fences, no preamble.

═══════════════════════════════════════
JSON SCHEMA (your output format):
═══════════════════════════════════════

{
  "bossName": "Educational topic title, 2–6 words, never a villain name",
  "bossEmoji": "Single subject-relevant emoji (not a monster)",
  "round1": {
    "type": "quick_draw",
    "question": "TEACHES a prerequisite concept in isolation. Does NOT mention the homework's specific subject. A student confused by the homework MUST still be able to answer this by thinking from basics.",
    "options": ["Four plausible choices — one correct, three reflect common confusions"],
    "correctIndex": 0,
    "hint": "One-line hint that nudges toward the concept (not the answer)"
  },
  "round2": {
    "type": "true_false_blitz",
    "statements": [
      { "text": "T/F statement that DEEPENS understanding of the Round-1 concept, usually by catching a common misconception or confirming an important implication", "isTrue": true }
    ]
  },
  "round3": {
    "type": "final_strike_mc",
    "question": "NOW applies the Round-1 concept to the actual homework subject. The correct answer IS the homework's answer. The student, having learned rounds 1+2, answers this confidently.",
    "options": ["Four choices — correct is the homework answer"],
    "correctIndex": 0,
    "hint": "Reminds the student of the concept from Round 1"
  },
  "fullSolution": "ANSWER: [direct homework answer]\\n\\n[2–3 sentences tying it back to the Round 1 concept, so the student sees the WHOLE picture]"
}`;

// Demo battle (same as Claude version for parity) when no API key is set
function getDemoBattle(question) {
  return {
    demo: true,
    provider: 'gemini',
    bossName: 'Demo Topic (Gemini)',
    bossEmoji: '📚',
    round1: {
      type: 'quick_draw',
      question: 'This is a Gemini demo! Which of these is the correct approach to start solving a problem?',
      options: ['Break it down into smaller parts', 'Guess randomly', 'Skip it entirely', 'Copy from the internet'],
      correctIndex: 0,
      hint: "Think about how you'd eat an elephant — one bite at a time!"
    },
    round2: {
      type: 'true_false_blitz',
      statements: [
        { text: 'Breaking a problem into smaller parts makes it easier to solve', isTrue: true },
        { text: 'You should always start solving without reading the full question', isTrue: false },
        { text: 'Understanding key concepts helps you solve problems faster', isTrue: true }
      ]
    },
    round3: {
      type: 'final_strike_mc',
      question: 'What is the FIRST step to solving any homework problem?',
      options: ['Read and understand the question', 'Guess the answer immediately', 'Skip it and move on', 'Copy from a friend'],
      correctIndex: 0,
      hint: "Always start by understanding what's being asked!"
    },
    fullSolution:
      '🧪 This is Gemini DEMO MODE! To run real Gemini-powered battles, set the GEMINI_API_KEY secret.\n\nGet your key at: https://aistudio.google.com/apikey\n\nYour original question was: "' +
      (question || '(image only)') +
      '"'
  };
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Strict JSON schema — forces Gemini to return EXACTLY the shape the
// frontend expects. Without this, Gemini 2.5 Flash ignores the example
// schema in the prompt and invents its own structure (e.g. 'learning_journey'
// arrays instead of our round1/round2/round3 objects).
const BATTLE_SCHEMA = {
  type: 'object',
  properties: {
    bossName: { type: 'string' },
    bossEmoji: { type: 'string' },
    round1: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        question: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } },
        correctIndex: { type: 'integer' },
        hint: { type: 'string' }
      },
      required: ['type', 'question', 'options', 'correctIndex', 'hint']
    },
    round2: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        statements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              isTrue: { type: 'boolean' }
            },
            required: ['text', 'isTrue']
          }
        }
      },
      required: ['type', 'statements']
    },
    round3: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        question: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } },
        correctIndex: { type: 'integer' },
        hint: { type: 'string' }
      },
      required: ['type', 'question', 'options', 'correctIndex', 'hint']
    },
    fullSolution: { type: 'string' }
  },
  required: ['bossName', 'bossEmoji', 'round1', 'round2', 'round3', 'fullSolution']
};

// Safety thresholds tuned for EDUCATIONAL content. Default Gemini safety
// settings sometimes over-block legitimate homework topics (historical
// conflicts, chemistry reactions, biology). BLOCK_ONLY_HIGH allows educational
// context while still blocking genuinely harmful content.
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
];

export const onRequestPost = async ({ request, env }) => {
  const hasApiKey = !!env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'your_api_key_here';

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return Response.json({ error: errMsg('generic', 'en') }, { status: 400 });
  }

  const { question, subject, images, lang, turnstileToken } = body || {};
  const language = lang === 'ar' ? 'ar' : 'en';

  // Turnstile (same check as Claude endpoint)
  if (env.TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) {
      return Response.json({ error: errMsg('turnstile_missing', language) }, { status: 400 });
    }
    try {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
          remoteip: request.headers.get('CF-Connecting-IP') || ''
        })
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return Response.json({ error: errMsg('turnstile_failed', language) }, { status: 403 });
      }
    } catch (e) {
      return Response.json({ error: errMsg('turnstile_failed', language) }, { status: 503 });
    }
  }

  // Input validation
  const validImages = (images || []).filter(img => ALLOWED_IMAGE_TYPES.includes(img.type));
  const rejectedImages = (images || []).filter(img => !ALLOWED_IMAGE_TYPES.includes(img.type));

  if (!question && validImages.length === 0) {
    if (rejectedImages.length > 0) {
      return Response.json({ error: errMsg('unsupported_image', language) }, { status: 400 });
    }
    return Response.json({ error: errMsg('no_input', language) }, { status: 400 });
  }

  for (const img of validImages) {
    const approxBytes = (img.data || '').length * 0.75;
    if (approxBytes > 5 * 1024 * 1024) {
      return Response.json({ error: errMsg('image_too_large', language) }, { status: 400 });
    }
  }

  if (!hasApiKey) {
    return Response.json(getDemoBattle(question));
  }

  const requestBody = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: buildGeminiParts(question, subject, validImages, language)
      }
    ],
    generationConfig: {
      temperature: 0.7,
      // 1536 is enough for our JSON schema (3 rounds + solution) and
      // shaves ~30% off latency vs 2048 without truncating outputs.
      maxOutputTokens: 1536,
      responseMimeType: 'application/json',
      // Force the EXACT schema our frontend expects. Without this, Gemini
      // 2.5 Flash invents its own JSON shape (e.g. learning_journey arrays)
      // and the frontend can't render it.
      responseSchema: BATTLE_SCHEMA,
      // Disable thinking mode — it adds 5-8s of latency and for homework
      // tutoring at K-12 level, the quality gain isn't worth the wait.
      thinkingConfig: { thinkingBudget: 0 }
    },
    safetySettings: SAFETY_SETTINGS
  };

  const url = `${GEMINI_ENDPOINT}?key=${env.GEMINI_API_KEY}`;

  // 5 attempts with exponential backoff (1s → 2s → 4s → 8s between).
  // Gemini's free tier has occasional 503 "high demand" spikes that last a
  // few seconds; the extra retries almost always clear them before the user
  // sees an error.
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (r.ok) {
        const json = await r.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text
                  || json.candidates?.[0]?.content?.parts?.find(p => p.text)?.text
                  || '';

        if (!text) {
          // Could be blocked by safety filters — Gemini returns finishReason: 'SAFETY'
          const finishReason = json.candidates?.[0]?.finishReason;
          console.error('Gemini returned no text. finishReason:', finishReason, 'raw:', JSON.stringify(json).slice(0, 500));
          return Response.json({ error: errMsg('generic', language) }, { status: 500 });
        }

        try {
          const battle = extractJSON(text);
          battle.provider = 'gemini';  // Tag response so frontend can show which model answered
          return Response.json(battle);
        } catch (parseErr) {
          console.error('Gemini JSON parse failed:', parseErr.message, 'text sample:', text.slice(0, 200));
          return Response.json({ error: errMsg('generic', language) }, { status: 500 });
        }
      }

      // Retry on rate limit / server errors
      const retriable = r.status === 429 || r.status >= 500;
      if (retriable && attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, 8s
        await new Promise(res => setTimeout(res, Math.pow(2, attempt - 1) * 1000));
        continue;
      }

      // Non-retriable failure — classify and return
      const errText = await r.text();
      console.error(`Gemini API error ${r.status}:`, errText.slice(0, 300));

      if (r.status === 429 || r.status === 503) {
        return Response.json({ error: errMsg('ai_busy', language) }, { status: 503 });
      }
      if (r.status === 401 || r.status === 403) {
        return Response.json({ error: errMsg('api_key', language) }, { status: 500 });
      }
      return Response.json({ error: errMsg('generic', language) }, { status: r.status === 400 ? 400 : 500 });

    } catch (error) {
      console.error(`Gemini fetch failed (attempt ${attempt}/${maxRetries}):`, error.message);
      if (attempt < maxRetries) {
        await new Promise(res => setTimeout(res, attempt * 2000));
        continue;
      }
      return Response.json({ error: errMsg('generic', language) }, { status: 500 });
    }
  }
};
