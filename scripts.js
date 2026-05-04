/* ==========================================================================
   Lyric — page scripts
   Served by serve.js and imported via Squarespace Code Injection.
   Each block is scoped by the Squarespace section ID it targets, so rules
   only fire on the page where that section exists.
   ========================================================================== */


/* --------------------------------------------------------------------------
   LEADERSHIP — TEAM / BOARD GRIDS
   Sections:
     69e914650701ed0ac1d35db2 — main leadership page
     69e9c86cbcadb033d1aa85a0 — member detail page (Board Members grid)
   Wraps each card in an invisible overlay link and injects a "Read Bio"
   hover button over the card image. Matches the CSS hover-overlay treatment.
   -------------------------------------------------------------------------- */

(function () {
  const SECTION_IDS = [
    '69e914650701ed0ac1d35db2',
    '69e9c86cbcadb033d1aa85a0',
    '69e9d1675857fb4682c045dc',
    '69e9ddab092ff56fc51b5459',
    '69e9e060ef8ec45f9c564d93',
    '69e9e1ee9a2cee6840e5f00e',
    '69e9e48725a62208b4d590fc',
    '69e9e55fd857433cc028dcd6',
    '69e9dce099ffba0c330640c8',
    '69e9e9841351db6792e17611',
    '69e9e992c2072a18995aa4ed',
    '69e9e9a2d857433cc02a310a',
  ];

  function init() {
    const selector = SECTION_IDS
      .map(function (id) { return '[data-section-id="' + id + '"] .list-item'; })
      .join(',');
    const cards = document.querySelectorAll(selector);
    if (!cards.length) return;

    cards.forEach(function (card) {
      if (card.dataset.lyricEnhanced === '1') return;
      card.dataset.lyricEnhanced = '1';

      const btn = card.querySelector('a.list-item-content__button');
      if (!btn) return;
      const href = btn.getAttribute('href');

      card.style.position = 'relative';
      card.style.cursor = 'pointer';

      const cardLink = document.createElement('a');
      cardLink.href = href;
      cardLink.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;z-index:10;display:block;';
      card.appendChild(cardLink);

      const image = card.querySelector('.list-item-media');
      if (!image) return;

      const hoverBtn = document.createElement('span');
      hoverBtn.textContent = 'Read Bio';
      hoverBtn.style.cssText = [
        'position:absolute',
        'bottom:16px',
        'left:16px',
        'z-index:20',
        'border:0.5px solid white',
        'border-radius:5px',
        'color:white',
        'padding:8px 16px',
        'font-size:0.8rem',
        'letter-spacing:0.05em',
        'opacity:0',
        'transition:opacity 0.3s ease',
        'pointer-events:none',
      ].join(';');

      image.style.position = 'relative';
      image.appendChild(hoverBtn);

      card.addEventListener('mouseenter', function () { hoverBtn.style.opacity = '1'; });
      card.addEventListener('mouseleave', function () { hoverBtn.style.opacity = '0'; });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


/* --------------------------------------------------------------------------
   HOMEPAGE HERO — STAT COUNTERS
   Section: 69e09e3cc2426d72a3b2a97b
   Animates the four hero stats (190m / 65% / 99% / 35+) from 0 up to their
   target value when the hero scrolls into view. Preserves any trailing
   suffix (m, %, +). Runs once per block.
   -------------------------------------------------------------------------- */

(function () {
  const STAT_BLOCK_IDS = [
    'block-yui_3_17_2_1_1776864865938_11136', // 190m
    'block-a082f825d59daf49cae2',             // 65%
    'block-e75ee00756497475a772',             // 99%
    'block-a72fa5a4e72dfea00345',             // 35+
  ];
  const DURATION = 1600; // ms

  function animateStat(el) {
    if (el.dataset.lyricCounted === '1') return;
    el.dataset.lyricCounted = '1';

    const raw = (el.textContent || '').trim();
    const match = raw.match(/^([0-9]+(?:\.[0-9]+)?)(.*)$/);
    if (!match) return;

    const finalStr = match[1];
    const suffix = match[2];
    const target = parseFloat(finalStr);
    const decimals = finalStr.includes('.') ? finalStr.split('.')[1].length : 0;

    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = finalStr + suffix; // snap to exact final value
      }
    }
    requestAnimationFrame(frame);
  }

  function init() {
    const targets = [];
    STAT_BLOCK_IDS.forEach(function (id) {
      const block = document.getElementById(id);
      if (!block) return;
      const strong = block.querySelector('strong') || block.querySelector('h1, h2, h3, h4, p');
      if (strong) targets.push(strong);
    });
    if (!targets.length) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      targets.forEach(function (t) { io.observe(t); });
    } else {
      targets.forEach(animateStat);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


/* --------------------------------------------------------------------------
   CAREERS — HOW HIRING WORKS — Accordion title split
   Section: 69e904e5d857433cc0dc6887
   Each item's title is authored as "NN . Label" (e.g. "01 . Candidate Review").
   We split the leading number into its own <span> so CSS can pin the number
   left and the label in the middle of the row.
   -------------------------------------------------------------------------- */

(function () {
  const SECTION_ID = '69e904e5d857433cc0dc6887';
  // Leading number + optional separator (". ", " . ", "- ", etc).
  const PATTERN = /^\s*(\d{1,3})\s*[.\-:·]?\s*\.?\s+(.*\S)\s*$/;

  function splitTitle(titleEl) {
    if (titleEl.dataset.lyricSplit === '1') return;

    const raw = (titleEl.textContent || '').trim();
    const m = raw.match(PATTERN);
    if (!m) return;

    const num = m[1];
    const label = m[2];

    titleEl.dataset.lyricSplit = '1';
    titleEl.classList.add('lyric-accordion-title-split');
    titleEl.innerHTML =
      '<span class="lyric-accordion-number">' + num + '.</span>' +
      '<span class="lyric-accordion-label">' + label + '</span>';
  }

  function init() {
    const section = document.querySelector('[data-section-id="' + SECTION_ID + '"]');
    if (!section) return;

    const titles = section.querySelectorAll('.accordion-item__title');
    titles.forEach(splitTitle);

    // Squarespace re-renders accordion titles on toggle in some builds —
    // observe for re-inserted text and re-split if needed.
    const mo = new MutationObserver(function () {
      section.querySelectorAll('.accordion-item__title').forEach(splitTitle);
    });
    mo.observe(section, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


/* --------------------------------------------------------------------------
   PAGE-SCOPED BODY CLASSES
   Squarespace doesn't expose page slugs as body classes, so add our own
   for any URL we want to target from CSS.
   -------------------------------------------------------------------------- */

(function () {
  const SLUG_CLASS_MAP = {
    '/home-new-v2': 'lyric-page-home-v2',
  };

  function apply() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const cls = SLUG_CLASS_MAP[path];
    if (cls) document.body.classList.add(cls);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();


/* --------------------------------------------------------------------------
   CAREERS — COME THRIVE AT LYRIC: force "Honesty and Respect" heading to
   break after "and" so it reads "Honesty and / Respect" (matching the
   intended two-line layout on the wider columns).
   -------------------------------------------------------------------------- */

(function () {
  function apply() {
    const el = document.querySelector('#block-a87ff8a5ea4d34c8ebfb h3');
    if (!el) return;
    const target = el.querySelector('strong') || el;
    if (target.dataset.lyricBroken === '1') return;
    if (/Honesty and Respect/.test(target.textContent)) {
      target.innerHTML = target.innerHTML.replace(
        /Honesty and\s+Respect/,
        'Honesty and<br>Respect'
      );
      target.dataset.lyricBroken = '1';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();


/* --------------------------------------------------------------------------
   SCROLL-DRIVEN PARALLAX (site-wide registry)
   Each entry pairs a Squarespace image block ID with a Y-translation factor.
   Negative factor → element drifts up as the section scrolls through the
   viewport; positive → drifts down. Magnitude in px (≈ peak displacement
   when the element centre crosses a viewport edge).

   Implementation: rAF-throttled scroll listener computes each element's
   distance from viewport centre as a clamped progress value in [-1, +1]
   and multiplies by the per-element factor. The transform is written to
   the inner .fluid-image-container so it doesn't fight the outer block's
   own positioning transform (e.g. the homepage hero photo carries a
   translate(100px,-20px) nudge, the line graphic translateY(-100px),
   and the contact photo a translateX(20px) nudge — all on the outer block).

   Skipped when prefers-reduced-motion is on.

   Sections wired up:
     - Homepage hero (69e09e3cc2426d72a3b2a97b)
         line graphic → up, nurse photo → down
     - Homepage "How we use AI" top pair (69e8a392ef8ec45f9cde5abc)
         cdcb86 → up, 34556 → down
     - Contact (69e9f4495391a643aa88a5f5)
         outline → up, photo → down
     - Careers "How hiring works at Lyric" (69e904e5d857433cc0dc6887)
         RecruitmentLine3 → up, Recruitment3 photo → down
     - Homepage "Why Lyric exists" (69e63e83126fbf28f74a40c8)
         single image (desktop + mobile variants) → down
     - Homepage "How we use AI" 3-card row, desktop only (69e8a392ef8ec45f9cde5abc)
         card 1 → up subtle, card 2 → up baseline, card 3 → up strong
     - Careers hero (69e902e00701ed0ac1cb8154)
         bd636… → up, …8111 → down
     - Careers "Join our talent community" (69e90210d49cfe289df1534b)
         single wide image → down
   -------------------------------------------------------------------------- */

(function () {
  const TARGETS = [
    // Homepage hero
    { blockId: 'block-db981ef2ff9d18ccd965',             factor: -40 }, // line graphic → up
    { blockId: 'block-yui_3_17_2_1_1776942559033_13324', factor:  40 }, // nurse photo  → down

    // Homepage "How we use AI" top pair
    { blockId: 'block-cdcb86dcac6f27b37b8c',             factor: -40 }, // → up
    { blockId: 'block-yui_3_17_2_1_1776853087754_34556', factor:  40 }, // → down

    // Contact
    { blockId: 'block-5ffdf3528f2cc4c961c9', factor: -40 }, // outline → up
    { blockId: 'block-99c14dbf7518da9d58c2', factor:  40 }, // photo   → down

    // Careers "How hiring works at Lyric"
    { blockId: 'block-7cbe7547d2686a55ff3a', factor: -40 }, // line graphic → up
    { blockId: 'block-82f4ebf3d4276ba0f31f', factor:  40 }, // people photo → down

    // Homepage "Why Lyric exists" (69e63e83126fbf28f74a40c8) — single image,
    // desktop (shaped) and mobile (rectangular) variants are display-swapped
    // by CSS, so register both; only the visible one moves.
    { blockId: 'block-yui_3_17_2_1_1776695389595_14334', factor: 40 }, // desktop image → down
    { blockId: 'block-e5c8b5c5acdf222aff43',             factor: 40 }, // mobile image  → down

    // Homepage "How we use AI" — 3-card row, desktop only. Staggered
    // upward drift escalating left → right (1× / 2× / 3× of baseline).
    // Mobile shows a different trio (c83e10/b82721/3ea2fe), untouched.
    { blockId: 'block-yui_3_17_2_1_1776853087754_37379', factor: -20, desktopOnly: true }, // card 1 → up, subtle
    { blockId: 'block-c9f790750fa40a2d7eb4',             factor: -40, desktopOnly: true }, // card 2 → up, baseline
    { blockId: 'block-17f4dd96e5ae8200df45',             factor: -60, desktopOnly: true }, // card 3 → up, strong

    // Careers hero "Come build better healthcare" (69e902e00701ed0ac1cb8154)
    // — counter-motion pair, replaces the prior floating-loop animations.
    { blockId: 'block-bd63645a4e0e98b8a30c',             factor: -40 }, // image 1 → up
    { blockId: 'block-yui_3_17_2_1_1776878137813_8111',  factor:  40 }, // image 2 → down

    // Careers "Join our talent community" (69e90210d49cfe289df1534b) —
    // single wide image just before the Benefits icon section.
    { blockId: 'block-e5248eb3595a9858c010',             factor:  40 }, // wide image → down
  ];

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    if (reduceMotion) return;

    const items = TARGETS
      .map(function (t) {
        const block = document.getElementById(t.blockId);
        if (!block) return null;
        const container = block.querySelector('.fluid-image-container');
        if (!container) return null;
        return { container: container, factor: t.factor, desktopOnly: !!t.desktopOnly };
      })
      .filter(Boolean);

    if (!items.length) return;

    let ticking = false;

    function update() {
      const vh = window.innerHeight;
      const half = vh / 2;
      // Slightly stronger drift on desktop, slightly softer on mobile.
      const isMobile = window.innerWidth <= 767;
      const scale = isMobile ? 0.75 : 1.2;
      items.forEach(function (item) {
        if (item.desktopOnly && isMobile) {
          item.container.style.transform = '';
          return;
        }
        const rect = item.container.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        // Progress: -1 when element centre is at viewport bottom edge,
        //            0 when element centre is at viewport centre,
        //           +1 when element centre is at viewport top edge.
        const raw = (half - elementCenter) / (half + rect.height / 2);
        const progress = Math.max(-1, Math.min(1, raw));
        const y = progress * item.factor * scale;
        item.container.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0)';
      });
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
