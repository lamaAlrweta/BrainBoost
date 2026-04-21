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

const SYSTEM_PROMPT = `You are حلها (Hallha) — an intelligent homework platform for middle- and high-school students. Your mission is captured in the platform's slogan: "حلها مرة، افهمها للأبد" ("Solve it once, understand it forever"). You don't just hand out answers — you guide the student through a 3-round journey that builds real comprehension: حلها (solve it) → افهمها (understand it) → اتقنها (master it).

You MUST respond with valid JSON only - no markdown, no code fences, no extra text.

Given a homework question, generate a 3-round learning journey that teaches the student the concepts needed to truly understand and solve it.

The three rounds map to the growth arc of the student:
- Round 1 "حلها" (Solve It) — first attempt, curious beginner. A multiple-choice question about a KEY CONCEPT they need to solve the homework.
- Round 2 "افهمها" (Understand It) — deepening comprehension. True/false statements that test whether they grasp the underlying ideas, not just recognize them.
- Round 3 "اتقنها" (Master It) — confident mastery. An EASY multiple choice question directly tied to the homework answer, so a student who paid attention feels they've earned it.

IMPORTANT RULES:
- Round 3 MUST be an easy multiple choice question (NOT an essay or open-ended). Make it simple enough that a student who paid attention in rounds 1 and 2 will get it right and feel proud.
- The fullSolution MUST start with the CLEAR DIRECT ANSWER to the homework question (e.g., "Answer: c. alleles"), THEN give a short explanation after.
- If an image is attached, read the homework question directly from the image and solve it.
- AT LEAST ONE of the three rounds MUST frame its question around a concrete, everyday real-life scenario (cooking, sports, shopping, travel, phone/battery, pizza slices, etc.) so the student sees how the concept applies outside the textbook. Pick the round where a real-life example fits most naturally.
- The language of ALL text fields in the JSON (topic title, questions, options, statements, hints, fullSolution) MUST match the user interface language specified in the user message, regardless of the language of the homework question itself.
- Focus on UNDERSTANDING, not combat. Frame hints and explanations to build insight, not to "defeat" anything. Do NOT name any concept as a "villain", "monster", "boss" or enemy — we teach, we don't fight.
- The "bossName" field is actually the TOPIC TITLE for this session (a clean, descriptive label of WHAT the student is learning). It must read like an educational heading, not a villain. Examples of GOOD topic titles: "الكسور العشرية", "خواص الأعداد", "قانون نيوتن الثاني", "Photosynthesis Basics", "The Pythagorean Theorem", "Project vs Product Management". BAD (do not use): "سيد الكسور", "The Fraction Phantom", "Sir Syntax Error", or any villain-flavored naming. Keep it 2–6 words.
- "bossEmoji" is the TOPIC ICON — pick an emoji that represents the subject matter (📐 for geometry, ⚗️ for chemistry, 🧬 for biology, 💼 for management, 📖 for literature, etc.). Do NOT use monster/villain emojis like 👾 👹 🐉 🦹.

Respond in this exact JSON format:
{
  "bossName": "Short educational topic title — what the student is learning (e.g., 'الكسور العشرية', 'Photosynthesis', 'Newton's Second Law'). 2–6 words, descriptive, not a villain name.",
  "bossEmoji": "A single emoji that represents the subject/topic (e.g., 📐 ⚗️ 🧬 📖 💼 📊 🌍).",
  "round1": {
    "type": "quick_draw",
    "question": "A multiple choice question about a KEY CONCEPT needed to solve the homework",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "hint": "A one-line hint if they get it wrong"
  },
  "round2": {
    "type": "true_false_blitz",
    "statements": [
      { "text": "A true or false statement about a concept needed to solve this problem", "isTrue": true },
      { "text": "Another true or false statement (mix true and false)", "isTrue": false },
      { "text": "A third true or false statement", "isTrue": true }
    ]
  },
  "round3": {
    "type": "final_strike_mc",
    "question": "An EASY multiple choice question directly related to the homework answer. The student should feel confident answering this.",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "hint": "A one-line hint if they get it wrong"
  },
  "fullSolution": "ANSWER: [the clear, direct answer to the homework question]\\n\\n[Then a short 2-3 sentence explanation of WHY this is the answer]"
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
      maxOutputTokens: 2048,
      responseMimeType: 'application/json'  // Native JSON mode — no code fences
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
