// ========================================
// حلها (Hallha) — Hal character SVG sprite
// ========================================
// "Hal" is the platform's mascot. Three evolving forms mirror the
// student's growth arc through the rounds:
//   hal-curious  → الفضولي  → Round 1 "حلها"  (Solve It)
//   hal-thinker  → المفكِّر → Round 2 "افهمها" (Understand It)
//   hal-champion → البطل   → Round 3 "اتقنها" (Master It)
//
// Use anywhere with: <svg class="hal"><use href="#hal-curious"/></svg>

(function () {
  const sprite = `
<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden" focusable="false">
  <defs>
    <linearGradient id="hal-curious-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFC077"/>
      <stop offset="1" stop-color="#FF8C42"/>
    </linearGradient>
    <linearGradient id="hal-thinker-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8A7CB5"/>
      <stop offset="1" stop-color="#5E4E8F"/>
    </linearGradient>
    <linearGradient id="hal-champion-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFE44D"/>
      <stop offset="1" stop-color="#FFC300"/>
    </linearGradient>
    <radialGradient id="hal-bulb-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFEB99" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#FFEB99" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hal-champion-aura" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFD700" stop-opacity="0.4"/>
      <stop offset="1" stop-color="#FFD700" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- ============ Stage 1 :: الفضولي (The Curious One) ============ -->
  <symbol id="hal-curious" viewBox="0 0 140 160">
    <ellipse cx="70" cy="150" rx="42" ry="4" fill="#000" opacity="0.08"/>
    <ellipse cx="70" cy="92" rx="48" ry="54" fill="url(#hal-curious-grad)"/>
    <ellipse cx="70" cy="108" rx="28" ry="20" fill="#FFF" opacity="0.22"/>
    <!-- Arms -->
    <ellipse cx="18" cy="102" rx="9" ry="14" fill="url(#hal-curious-grad)" transform="rotate(-15 18 102)"/>
    <!-- Right arm + magnifying glass (held out, held up) -->
    <g transform="translate(115 75) rotate(20)">
      <ellipse cx="0" cy="15" rx="9" ry="14" fill="url(#hal-curious-grad)"/>
      <circle cx="3" cy="-8" r="12" fill="#87CEEB" opacity="0.35"/>
      <circle cx="3" cy="-8" r="12" fill="none" stroke="#5A3A1A" stroke-width="2.8"/>
      <line x1="12" y1="1" x2="22" y2="12" stroke="#5A3A1A" stroke-width="3.5" stroke-linecap="round"/>
    </g>
    <!-- Eyes (wide, curious) -->
    <ellipse cx="53" cy="82" rx="11" ry="12" fill="#FFF"/>
    <ellipse cx="88" cy="82" rx="11" ry="12" fill="#FFF"/>
    <circle class="hal-pupil" cx="55" cy="80" r="5.5" fill="#2D2D2D"/>
    <circle class="hal-pupil" cx="90" cy="80" r="5.5" fill="#2D2D2D"/>
    <circle cx="57" cy="77" r="1.8" fill="#FFF"/>
    <circle cx="92" cy="77" r="1.8" fill="#FFF"/>
    <!-- Raised eyebrows -->
    <path d="M43 68 Q53 62 62 68" stroke="#5A3A1A" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M79 68 Q88 62 98 68" stroke="#5A3A1A" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <!-- Mouth: open small "oh!" -->
    <ellipse cx="70" cy="112" rx="6" ry="5" fill="#5A3A1A"/>
    <ellipse cx="70" cy="113" rx="4" ry="3" fill="#C95A3A"/>
  </symbol>

  <!-- ============ Stage 2 :: المفكِّر (The Thinker) ============ -->
  <symbol id="hal-thinker" viewBox="0 0 140 160">
    <!-- Lightbulb glow halo -->
    <circle class="hal-bulb-glow" cx="70" cy="22" r="26" fill="url(#hal-bulb-glow)"/>
    <!-- Lightbulb above head -->
    <g class="hal-lightbulb">
      <ellipse cx="70" cy="22" rx="10" ry="12" fill="#FFEB99"/>
      <ellipse cx="67" cy="18" rx="3" ry="5" fill="#FFF" opacity="0.55"/>
      <rect x="65" y="31" width="10" height="4" fill="#8B7355" rx="1"/>
      <rect x="66" y="34" width="8" height="2" fill="#5A4530" rx="1"/>
      <g stroke="#FFD166" stroke-width="2" stroke-linecap="round" opacity="0.8">
        <line x1="52" y1="22" x2="46" y2="22"/>
        <line x1="88" y1="22" x2="94" y2="22"/>
        <line x1="55" y1="10" x2="51" y2="6"/>
        <line x1="85" y1="10" x2="89" y2="6"/>
        <line x1="70" y1="4" x2="70" y2="-1"/>
      </g>
    </g>
    <ellipse cx="70" cy="150" rx="42" ry="4" fill="#000" opacity="0.08"/>
    <ellipse cx="70" cy="98" rx="48" ry="52" fill="url(#hal-thinker-grad)"/>
    <ellipse cx="70" cy="112" rx="26" ry="18" fill="#FFF" opacity="0.18"/>
    <!-- Left arm relaxed -->
    <ellipse cx="18" cy="110" rx="9" ry="14" fill="url(#hal-thinker-grad)" transform="rotate(-20 18 110)"/>
    <!-- Right arm up to chin (thinking pose) -->
    <g transform="translate(108 115) rotate(-55)">
      <ellipse cx="0" cy="0" rx="9" ry="16" fill="url(#hal-thinker-grad)"/>
    </g>
    <circle cx="92" cy="118" r="7" fill="url(#hal-thinker-grad)"/>
    <!-- Eyes (one squint, looking upper-left "hmm") -->
    <ellipse cx="53" cy="88" rx="11" ry="12" fill="#FFF"/>
    <ellipse cx="88" cy="88" rx="11" ry="12" fill="#FFF"/>
    <circle class="hal-pupil" cx="50" cy="86" r="5" fill="#2D2D2D"/>
    <path d="M80 86 Q88 82 96 86 Q88 92 80 86" fill="#2D2D2D"/>
    <circle cx="52" cy="83" r="1.6" fill="#FFF"/>
    <!-- Tilted inward eyebrows (thoughtful) -->
    <path d="M42 74 L62 70" stroke="#2D2048" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M78 70 L100 74" stroke="#2D2048" stroke-width="2.8" stroke-linecap="round"/>
    <!-- Slight smile -->
    <path d="M60 115 Q70 119 80 115" stroke="#2D2048" stroke-width="3" fill="none" stroke-linecap="round"/>
  </symbol>

  <!-- ============ Stage 3 :: البطل (The Champion) ============ -->
  <symbol id="hal-champion" viewBox="0 0 140 160">
    <!-- Aura -->
    <circle class="hal-aura" cx="70" cy="92" r="72" fill="url(#hal-champion-aura)"/>
    <!-- Cape behind body -->
    <path d="M32 85 Q22 132 36 150 Q40 130 44 92 Z" fill="#B22222"/>
    <path d="M108 85 Q118 132 104 150 Q100 130 96 92 Z" fill="#B22222"/>
    <path d="M42 90 Q35 135 48 152 L92 152 Q105 135 98 90 Z" fill="#DC143C"/>
    <!-- Shadow -->
    <ellipse cx="70" cy="152" rx="44" ry="4" fill="#000" opacity="0.12"/>
    <!-- Body -->
    <ellipse cx="70" cy="92" rx="48" ry="54" fill="url(#hal-champion-grad)"/>
    <ellipse cx="70" cy="108" rx="28" ry="20" fill="#FFF" opacity="0.3"/>
    <!-- Arms (raised in triumph slightly) -->
    <ellipse cx="17" cy="100" rx="9" ry="14" fill="url(#hal-champion-grad)" transform="rotate(-28 17 100)"/>
    <ellipse cx="123" cy="100" rx="9" ry="14" fill="url(#hal-champion-grad)" transform="rotate(28 123 100)"/>
    <!-- Crown -->
    <g class="hal-crown">
      <rect x="48" y="30" width="44" height="9" fill="#E8A300" rx="1.5"/>
      <path d="M48 30 L54 14 L62 30 Z" fill="#FFD700"/>
      <path d="M62 30 L70 8 L78 30 Z" fill="#FFD700"/>
      <path d="M78 30 L86 14 L92 30 Z" fill="#FFD700"/>
      <circle cx="54" cy="19" r="2.2" fill="#DC143C"/>
      <circle cx="70" cy="13" r="2.8" fill="#4169E1"/>
      <circle cx="86" cy="19" r="2.2" fill="#DC143C"/>
      <rect x="48" y="37" width="44" height="2" fill="#FFD700" opacity="0.6" rx="1"/>
    </g>
    <!-- Eyes (confident, sparkle) -->
    <ellipse cx="53" cy="83" rx="11" ry="12" fill="#FFF"/>
    <ellipse cx="88" cy="83" rx="11" ry="12" fill="#FFF"/>
    <circle class="hal-pupil" cx="53" cy="83" r="5.5" fill="#2D2D2D"/>
    <circle class="hal-pupil" cx="88" cy="83" r="5.5" fill="#2D2D2D"/>
    <circle cx="55" cy="80" r="2.2" fill="#FFF"/>
    <circle cx="90" cy="80" r="2.2" fill="#FFF"/>
    <!-- Eyebrows: confident -->
    <path d="M43 68 Q53 66 63 68" stroke="#6B4F00" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M79 68 Q88 66 97 68" stroke="#6B4F00" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <!-- Big confident grin + teeth hint -->
    <path d="M52 106 Q70 124 88 106" stroke="#6B4F00" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M58 110 Q70 118 82 110 Z" fill="#FFF" opacity="0.9"/>
    <!-- Sparkle accents -->
    <g fill="#FFD700">
      <circle cx="14" cy="50" r="1.8"/>
      <circle cx="126" cy="45" r="1.8"/>
      <circle cx="9" cy="115" r="1.5"/>
      <circle cx="131" cy="118" r="1.5"/>
    </g>
  </symbol>
</svg>`;

  function injectSprite() {
    // Avoid double-injection if the script is included twice
    if (document.getElementById('hal-sprite-root')) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'hal-sprite-root';
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.innerHTML = sprite;
    document.body.insertBefore(wrapper, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSprite);
  } else {
    injectSprite();
  }
})();
