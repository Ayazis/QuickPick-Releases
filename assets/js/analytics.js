// Thin wrapper around Umami custom events.
//
// Analytics here is best-effort and entirely optional: the Umami script is
// cookie-free, it may be blocked by ad-blockers, and it isn't even loaded until
// a website ID exists (see the commented tag in index.html). Every call must
// therefore no-op gracefully when window.umami is absent, and tracking must
// never throw into the page or block a click. That's the whole contract.
(function () {
  function track(event, data) {
    try {
      if (window.umami && typeof window.umami.track === 'function') {
        window.umami.track(event, data);
      }
    } catch (_) {
      // Swallow: a failed analytics call must never surface to the user.
    }
  }

  window.QuickPickAnalytics = { track };

  // Secondary engagement: outbound Discord clicks. Fired for every discord.gg
  // link (the CTA button and the "What's next" feature link), tagged via
  // data-track-location so restyling the CTA button can't silently relabel
  // its clicks.
  document.querySelectorAll('a[href*="discord.gg"]').forEach((link) => {
    link.addEventListener('click', () => {
      track('discord', {
        location: link.dataset.trackLocation || 'unknown'
      });
    });
  });
})();
