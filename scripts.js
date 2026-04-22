/* ==========================================================================
   Lyric — page scripts
   Served by serve.js and imported via Squarespace Code Injection.
   Each block is scoped by the Squarespace section ID it targets, so rules
   only fire on the page where that section exists.
   ========================================================================== */


/* --------------------------------------------------------------------------
   LEADERSHIP — TEAM GRID
   Section: 69e914650701ed0ac1d35db2
   Wraps each card in an invisible overlay link and injects a "Read Bio"
   hover button over the card image. Matches the CSS hover-overlay treatment.
   -------------------------------------------------------------------------- */

(function () {
  const SECTION_ID = '69e914650701ed0ac1d35db2';

  function init() {
    const cards = document.querySelectorAll('[data-section-id="' + SECTION_ID + '"] .list-item');
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
