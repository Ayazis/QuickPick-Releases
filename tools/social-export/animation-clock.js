// Installed after Playwright's clock and before the demo starts.
// Flush CSS at timer boundaries, not just screenshot boundaries: the drag
// loop updates every 25 ms and replaces a 24 ms cursor transition each time.
(() => {
  const starts = new WeakMap();
  function sync() {
    const now = performance.now();
    for (const animation of document.getAnimations()) {
      if (!starts.has(animation)) starts.set(animation, now);
      animation.pause();
      animation.currentTime = now - starts.get(animation);
    }
  }
  const schedule = window.setTimeout;
  window.setTimeout = function (callback, delay, ...args) {
    return schedule(() => {
      sync();
      if (typeof callback === 'function') callback(...args);
      else (0, eval)(callback);
      queueMicrotask(sync);
    }, delay);
  };
  // Async sequence continuations can change styles several microtasks later.
  new MutationObserver(sync).observe(document.documentElement, {
    subtree: true, attributes: true, childList: true, characterData: true
  });
  window.syncExportAnimations = sync;
  sync();
})();
