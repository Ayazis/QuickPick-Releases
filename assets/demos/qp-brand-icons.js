/* QuickPick hex-menu demo — recognizable app marks.

   Simplified, hand-drawn approximations of the desktop apps a power user
   actually pins (the real app extracts each launched app's own icon via
   StartApplicationStep — these stand in for that on the landing page).
   Drawn at 24x24 in the same rounded-tile style as the rest of the demo
   icon set. All marks are simplified likenesses, not the vendors' official
   assets; each logo remains the trademark of its owner.

   Merge in alongside the base set:
     Object.assign({}, QpIcons, QpBrandIcons, { ... }) */
window.QpBrandIcons = (function () {
  /* rounded app tile, matching the placeholder icons' 20x20 inner box */
  function tile(fill) {
    return '<rect x="2" y="2" width="20" height="20" rx="5" fill="' + fill + '"/>';
  }
  function letter(ch, color, size, y) {
    return '<text x="12" y="' + (y || 16.6) + '" text-anchor="middle" fill="' + color + '"' +
      ' font-family="Segoe UI, Inter, Helvetica, Arial, sans-serif"' +
      ' font-weight="700" font-size="' + (size || 11) + '">' + ch + '</text>';
  }
  function svg(inner) {
    return '<svg viewBox="0 0 24 24">' + inner + '</svg>';
  }

  return {
    /* ── Microsoft ─────────────────────────────────────────────── */
    msTeams: svg(
      tile('#4b53bc') +
      '<circle cx="17.4" cy="7.6" r="2.5" fill="#7b83eb"/>' +
      '<rect x="12.6" y="10.4" width="8.4" height="7.2" rx="2" fill="#7b83eb"/>' +
      '<rect x="4" y="7" width="11" height="11" rx="2.2" fill="#fff"/>' +
      '<path d="M6.3 9.8h6.4v1.5h-2.4v5.1H8.7v-5.1H6.3z" fill="#4b53bc"/>'),

    /* the purple infinity ribbon — deliberately distinct from vsCode's
       blue sail below, since both ship on the same machine */
    visualStudio: svg(
      tile('#f5f5f7') +
      '<path d="M8 9c-1.7 0-3 1.4-3 3s1.3 3 3 3c3 0 5-6 8-6 1.7 0 3 1.4 3 3s-1.3 3-3 3c-3 0-5-6-8-6z"' +
        ' fill="none" stroke="#8250bf" stroke-width="2.4" stroke-linecap="round"/>'),

    vsCode: svg(
      tile('#0f6cbd') +
      '<path d="M17 4.7 11.6 10 8.2 7.3 6.6 8.1l2.9 3.9-2.9 3.9 1.6.8 3.4-2.7 5.4 5.3 3-1.4V6.1zM14.9 9.5v5l-3.2-2.5z" fill="#fff"/>'),

    windowsTerminal: svg(
      tile('#1b1b1f') +
      '<path d="M6.4 8.6l3.8 3.3-3.8 3.3" fill="none" stroke="#f2f2f2" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="12.4" y="14.4" width="5.6" height="1.8" rx=".9" fill="#f2f2f2"/>'),

    outlook: svg(
      tile('#0f6cbd') +
      '<rect x="11" y="7" width="9.4" height="10" rx="1" fill="#fff"/>' +
      '<path d="M11.4 8.1l4.7 3.4 4.7-3.4" fill="none" stroke="#0f6cbd" stroke-width="1.2"/>' +
      '<rect x="3" y="5.4" width="9.6" height="13.2" rx="1.6" fill="#0a4d8c"/>' +
      '<ellipse cx="7.8" cy="12" rx="2.9" ry="3.6" fill="none" stroke="#fff" stroke-width="1.7"/>'),

    excel: svg(
      tile('#107c41') +
      '<rect x="10.8" y="5.6" width="9.6" height="12.8" rx="1" fill="#fff" opacity=".92"/>' +
      '<rect x="10.8" y="9.8" width="9.6" height="1.1" fill="#107c41"/>' +
      '<rect x="10.8" y="13.6" width="9.6" height="1.1" fill="#107c41"/>' +
      '<rect x="14.9" y="5.6" width="1.1" height="12.8" fill="#107c41"/>' +
      '<rect x="2.6" y="5.6" width="9.4" height="12.8" rx="1.4" fill="#0b5e31"/>' +
      '<path d="M5 8.6l4.6 6.8M9.6 8.6L5 15.4" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>'),

    /* ── Creative ──────────────────────────────────────────────── */
    abletonLive: svg(
      tile('#1a1a1c') +
      '<g fill="#f2f2f2">' +
        '<rect x="5" y="5.6" width="1.9" height="6.2"/><rect x="8" y="5.6" width="1.9" height="6.2"/>' +
        '<rect x="11" y="5.6" width="1.9" height="6.2"/>' +
        '<rect x="5" y="13.2" width="14" height="1.9"/><rect x="5" y="16.2" width="14" height="1.9"/>' +
      '</g>'),

    photoshop: svg(
      tile('#001e36') +
      '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4" fill="none" stroke="#31a8ff" stroke-width="1.3"/>' +
      letter('Ps', '#31a8ff', 9.5, 15.6)),

    lightroom: svg(
      tile('#001e36') +
      '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4" fill="none" stroke="#8cd2ff" stroke-width="1.3"/>' +
      letter('Lr', '#8cd2ff', 9.5, 15.6)),

    illustrator: svg(
      tile('#330000') +
      '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4" fill="none" stroke="#ff9a00" stroke-width="1.3"/>' +
      letter('Ai', '#ff9a00', 9.5, 15.6)),

    figma: svg(
      tile('#1e1e22') +
      '<path d="M12 5h-2.6a2.6 2.6 0 1 0 0 5.2H12z" fill="#f24e1e"/>' +
      '<path d="M12 5h2.6a2.6 2.6 0 1 1 0 5.2H12z" fill="#ff7262"/>' +
      '<path d="M12 10.2H9.4a2.6 2.6 0 1 0 0 5.2H12z" fill="#a259ff"/>' +
      '<path d="M12 15.4H9.4a2.6 2.6 0 1 0 2.6 2.6z" fill="#0acf83"/>' +
      '<circle cx="14.6" cy="12.8" r="2.6" fill="#1abcfe"/>'),

    blender: svg(
      tile('#1e1e22') +
      '<circle cx="13" cy="12.8" r="5.4" fill="#ea7600"/>' +
      '<circle cx="13" cy="12.8" r="2.2" fill="#fff"/>' +
      '<path d="M4.2 10.6h7.2l-2.6 2.4H4.2z" fill="#265787"/>'),

    /* ── Everyday ──────────────────────────────────────────────── */
    chrome: svg(
      tile('#f5f5f7') +
      '<path d="M12 3.4a8.6 8.6 0 0 1 7.5 4.4H12a4.2 4.2 0 0 0-3.9 2.6L4.9 6.9A8.6 8.6 0 0 1 12 3.4z" fill="#ea4335"/>' +
      '<path d="M4.9 6.9l3.2 3.5a4.2 4.2 0 0 0 2.5 5.8l-2.9 4.1A8.6 8.6 0 0 1 4.9 6.9z" fill="#34a853"/>' +
      '<path d="M19.5 7.8a8.6 8.6 0 0 1-7.8 12.8l3.5-6.1a4.2 4.2 0 0 0-.3-4.5z" fill="#fbbc05"/>' +
      '<circle cx="12" cy="12" r="3.3" fill="#4285f4"/>'),

    spotify: svg(
      tile('#1db954') +
      '<path d="M7 9.4c3.3-1 6.9-.7 9.8 1M7.6 12.4c2.8-.8 5.8-.5 8.2.9M8.2 15.3c2.3-.6 4.7-.4 6.7.8"' +
        ' fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>'),

    slack: svg(
      tile('#f5f5f7') +
      '<g stroke-linecap="round" stroke-width="3.1" fill="none">' +
        '<path d="M9.2 5.6h0M9.2 5.6v3.6" stroke="#36c5f0"/>' +
        '<path d="M5.6 9.2h3.6" stroke="#36c5f0"/>' +
        '<path d="M14.8 18.4v-3.6M14.8 14.8h0" stroke="#2eb67d"/>' +
        '<path d="M14.8 14.8h3.6" stroke="#ecb22e"/>' +
        '<path d="M9.2 14.8H5.6M9.2 14.8v3.6" stroke="#e01e5a"/>' +
      '</g>'),

    discordApp: svg(
      tile('#5865f2') +
      '<path d="M16.6 7.3a11 11 0 0 0-2.7-.8l-.3.7a8.4 8.4 0 0 0-3.2 0l-.3-.7a11 11 0 0 0-2.7.8C5.6 10 5.1 12.7 5.3 15.3a11.4 11.4 0 0 0 3.4 1.7l.7-1.1a7.3 7.3 0 0 1-1.1-.5l.2-.2a8 8 0 0 0 7 0l.2.2c-.3.2-.7.4-1.1.5l.7 1.1a11.4 11.4 0 0 0 3.4-1.7c.3-3-.5-5.7-2.1-8zM9.9 13.6c-.6 0-1.2-.6-1.2-1.4s.5-1.4 1.2-1.4 1.2.6 1.2 1.4-.5 1.4-1.2 1.4zm4.2 0c-.6 0-1.2-.6-1.2-1.4s.5-1.4 1.2-1.4 1.2.6 1.2 1.4-.6 1.4-1.2 1.4z" fill="#fff"/>'),

    notion: svg(
      tile('#f5f5f7') +
      '<path d="M6.2 6.6l9.6-.9c.6-.1 1 .1 1.4.5l1.6 1.4c.3.3.3.5.3.9v8.4c0 .6-.3.9-.9 1l-9.9.7c-.6 0-1-.2-1.3-.6l-1.2-1.5c-.2-.3-.3-.5-.3-.9V7.6c0-.5.2-.9.7-1z" fill="#fff" stroke="#111" stroke-width="1.1" stroke-linejoin="round"/>' +
      '<path d="M9 9.6v5.9l1.4-.1v-3.7l2.6 3.5 1.5-.1V9.1l-1.4.1v3.5L10.6 9.5z" fill="#111"/>'),

    obsStudio: svg(
      tile('#1e1e22') +
      '<circle cx="12" cy="12" r="7.4" fill="none" stroke="#e1e1e6" stroke-width="1.5"/>' +
      '<circle cx="9.4" cy="10.2" r="3.4" fill="#e1e1e6"/>' +
      '<path d="M13 13.6a3.6 3.6 0 0 1 1.4 4.6" fill="none" stroke="#e1e1e6" stroke-width="1.5" stroke-linecap="round"/>'),

    fileExplorer: svg(
      tile('#1e1e22') +
      '<path d="M3.6 8.2c0-.7.5-1.2 1.2-1.2h4.3l1.7 1.9h8c.7 0 1.2.5 1.2 1.2v6.5c0 .7-.5 1.2-1.2 1.2H4.8c-.7 0-1.2-.5-1.2-1.2z" fill="#ffb900"/>' +
      '<path d="M6 10.4h13.4c.7 0 1.1.6 1 1.3l-.9 5c-.1.6-.6 1.1-1.2 1.1H4.9c-.7 0-1.1-.6-1-1.3l.9-5c.1-.6.6-1.1 1.2-1.1z" fill="#ffd257"/>')
  };
})();

/* Helpers, kept off QpBrandIcons itself so the map stays safe to spread into
   an icon set with Object.assign. */
window.QpBrandIconTools = {
  /* the mark's contents, without the 24x24 <svg> wrapper */
  inner: function (name) {
    return (window.QpBrandIcons[name] || "")
      .replace(/^<svg[^>]*>/, "")
      .replace(/<\/svg>$/, "");
  },
  /* the mark re-scaled for the 20x20 viewBox the app bar and window
     title bars use (QpAppBar.svgIcon) */
  inner20: function (name) {
    return '<g transform="scale(0.8333)">' + window.QpBrandIconTools.inner(name) + "</g>";
  }
};
