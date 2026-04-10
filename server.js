require('dotenv').config({ path: require('path').join(__dirname, '.env'), override: true });
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Claude Vision only accepts these image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Bilingual error messages
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
  generic: {
    en: 'Failed to generate battle. Please try again.',
    ar: 'تعذر توليد التحدي. حاول مرة أخرى.'
  }
};

function errMsg(key, lang) {
  const entry = ERRORS[key] || ERRORS.generic;
  return entry[lang === 'ar' ? 'ar' : 'en'];
}

// Extract JSON from text that might be wrapped in markdown code fences
function extractJSON(text) {
  if (!text) throw new Error('Empty response from Claude');

  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch (_) { /* fall through */ }

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]);
    } catch (_) { /* fall through */ }
  }

  // Extract first {...} block
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch (_) { /* fall through */ }
  }

  throw new Error('Could not parse JSON from Claude response');
}

// Build the user message with optional images for Claude Vision
function buildUserMessage(question, subject, images, lang) {
  const content = [];

  // Add images first so Claude can see them
  if (images && images.length > 0) {
    for (const img of images) {
      // Skip unsupported media types (Claude only supports jpeg/png/gif/webp)
      if (!ALLOWED_IMAGE_TYPES.includes(img.type)) continue;
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.type,
          data: img.data
        }
      });
    }
  }

  // Add the text question
  const isArabic = lang === 'ar';
  const langInstruction = isArabic
    ? 'IMPORTANT: The user interface language is Arabic. You MUST write ALL text fields in the JSON response (bossName, round questions, options, statements, hints, fullSolution) in Arabic, even if the homework question itself is written in English. Translate concepts into natural Arabic. Only keep proper nouns, formulas, numbers, chemical symbols and code in their original form.'
    : 'IMPORTANT: The user interface language is English. Write ALL text fields in the JSON response in English.';

  const textParts = [langInstruction, `Subject: ${subject || 'General'}`];
  if (question) {
    textParts.push(`Homework question: ${question}`);
  } else {
    textParts.push('Please look at the attached image(s) and solve the homework question shown.');
  }
  content.push({ type: 'text', text: textParts.join('\n') });

  return content;
}

// Check if API key is configured
const hasApiKey = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_api_key_here';

let anthropic;
if (hasApiKey) {
  anthropic = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({ hasApiKey, mode: hasApiKey ? 'live' : 'demo' });
});

// Generate boss battle rounds for a homework question
app.post('/api/generate-battle', async (req, res) => {
  const { question, subject, images, lang } = req.body;
  const language = lang === 'ar' ? 'ar' : 'en';

  // Filter images to only supported types
  const validImages = (images || []).filter(img => ALLOWED_IMAGE_TYPES.includes(img.type));
  const rejectedImages = (images || []).filter(img => !ALLOWED_IMAGE_TYPES.includes(img.type));

  if (!question && validImages.length === 0) {
    if (rejectedImages.length > 0) {
      return res.status(400).json({ error: errMsg('unsupported_image', language) });
    }
    return res.status(400).json({ error: errMsg('no_input', language) });
  }

  // Check image size (Claude limit is ~5 MB per image, base64 is ~1.33x larger)
  for (const img of validImages) {
    const approxBytes = (img.data || '').length * 0.75;
    if (approxBytes > 5 * 1024 * 1024) {
      return res.status(400).json({ error: errMsg('image_too_large', language) });
    }
  }

  // Demo mode - return sample battle data
  if (!hasApiKey) {
    return res.json(getDemoBattle(question, subject));
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are BrainBoost, a homework tutor that teaches through game-like challenges.
You MUST respond with valid JSON only - no markdown, no code fences, no extra text.

Given a homework question, generate a "Boss Battle" with 3 rounds that teach the student the concepts needed to solve it.

IMPORTANT RULES:
- Round 3 MUST be an easy multiple choice question (NOT an essay or open-ended). Make it simple enough that a student who paid attention in rounds 1 and 2 will get it right and feel proud.
- The fullSolution MUST start with the CLEAR DIRECT ANSWER to the homework question (e.g., "Answer: c. alleles"), THEN give a short explanation after.
- If an image is attached, read the homework question directly from the image and solve it.
- AT LEAST ONE of the three rounds MUST frame its question around a concrete, everyday real-life scenario (cooking, sports, shopping, travel, phone/battery, pizza slices, etc.) so the student sees how the concept applies outside the textbook. Pick the round where a real-life example fits most naturally.
- The language of ALL text fields in the JSON (bossName, questions, options, statements, hints, fullSolution) MUST match the user interface language specified in the user message, regardless of the language of the homework question itself.

Respond in this exact JSON format:
{
  "bossName": "A fun, creative boss name related to the topic (e.g., 'The Fraction Phantom', 'Sir Syntax Error')",
  "bossEmoji": "One emoji that represents the boss",
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
}`,
        messages: [
          {
            role: 'user',
            content: buildUserMessage(question, subject, validImages, language)
          }
        ]
      });

      const text = message.content.find(c => c.type === 'text')?.text || message.content[0]?.text || '';
      const battle = extractJSON(text);
      return res.json(battle);
    } catch (error) {
      const status = error.status || error.statusCode || 0;
      console.error(`API Error (attempt ${attempt}/${maxRetries}):`, status, error.message);

      // Retry on overloaded (529) or rate limit (429) or server errors (500+)
      if ((status === 529 || status === 429 || status >= 500) && attempt < maxRetries) {
        const waitTime = attempt * 2000; // 2s, 4s
        console.log(`Retrying in ${waitTime / 1000}s...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }

      if (status === 529) {
        return res.status(503).json({ error: errMsg('ai_busy', language) });
      }
      if (status === 400) {
        return res.status(400).json({ error: errMsg('generic', language) });
      }
      if (status === 401 || status === 403) {
        return res.status(500).json({ error: errMsg('api_key', language) });
      }
      return res.status(500).json({ error: errMsg('generic', language) });
    }
  }
});

// Demo battle data for when no API key is set
function getDemoBattle(question, subject) {
  return {
    demo: true,
    bossName: "The Demo Dragon",
    bossEmoji: "🐉",
    round1: {
      type: "quick_draw",
      question: "This is a demo! Which of these is the correct approach to start solving this problem?",
      options: [
        "Break it down into smaller parts",
        "Guess randomly",
        "Skip it entirely",
        "Copy from the internet"
      ],
      correctIndex: 0,
      hint: "Think about how you'd eat an elephant - one bite at a time!"
    },
    round2: {
      type: "true_false_blitz",
      statements: [
        { text: "Breaking a problem into smaller parts makes it easier to solve", isTrue: true },
        { text: "You should always start solving without reading the full question", isTrue: false },
        { text: "Understanding key concepts helps you solve problems faster", isTrue: true }
      ]
    },
    round3: {
      type: "final_strike_mc",
      question: "What is the FIRST step to solving any homework problem?",
      options: [
        "Read and understand the question",
        "Guess the answer immediately",
        "Skip it and move on",
        "Copy from a friend"
      ],
      correctIndex: 0,
      hint: "Always start by understanding what's being asked!"
    },
    fullSolution: "🎮 This is DEMO MODE! To get real AI-powered battles, add your Anthropic API key to the .env file.\n\nGet your key at: https://console.anthropic.com/\n\nYour original question was: \"" + (question || '(image only)') + "\""
  };
}

app.listen(PORT, () => {
  console.log(`\n🧠 BrainBoost is running at http://localhost:${PORT}`);
  console.log(`💡 Mode: ${hasApiKey ? '🟢 LIVE (Claude API)' : '🟡 DEMO (no API key)'}`);
  if (!hasApiKey) {
    console.log(`\n💡 To enable AI: add your API key to .env`);
    console.log(`   Get one at: https://console.anthropic.com/\n`);
  }
});
