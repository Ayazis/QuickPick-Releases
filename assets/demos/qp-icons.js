/* QuickPick hex-menu demo — shared icon library (FontAwesome-style
   approximations, currentColor). Demos may merge in extra icons:
   Object.assign({}, QpIcons, { myIcon: '<svg>...</svg>' }) */
window.QpIcons = {
  tools:
    '<svg viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M3.2 3.2 6 2l2.5 2.5-.4 2.3-2.3.4L3.2 6z"/>' +
      '<rect x="10.8" y="6.1" width="3" height="12" rx="1" transform="rotate(-45 12.3 12.1)"/>' +
      '<path d="M21.9 5.3a4.3 4.3 0 0 1-6.3 4.7L7 18.6a2.1 2.1 0 1 1-3-3l8.6-8.6a4.3 4.3 0 0 1 4.7-6.3L14.9 3l.6 2.6 2.6.6z"/>' +
    '</svg>',
  minimize: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="16.5" width="16" height="3" rx="1"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.6c0-.9 1-1.5 1.8-1L20 11c.8.5.8 1.6 0 2L8.8 20.4c-.8.5-1.8-.1-1.8-1z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5.5" y="4" width="4.6" height="16" rx="1.2"/><rect x="13.9" y="4" width="4.6" height="16" rx="1.2"/></svg>',
  forward: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6.3c0-.8.9-1.3 1.6-.9l7.4 5.1v-4.2c0-.8.9-1.3 1.6-.9l8 5.7c.6.4.6 1.3 0 1.7l-8 5.7c-.7.5-1.6 0-1.6-.9v-4.2l-7.4 5.1c-.7.5-1.6 0-1.6-.9z"/></svg>',
  backward: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 6.3c0-.8-.9-1.3-1.6-.9L12 10.5V6.3c0-.8-.9-1.3-1.6-.9l-8 5.7c-.6.4-.6 1.3 0 1.7l8 5.7c.7.5 1.6 0 1.6-.9v-4.2l7.4 5.1c.7.5 1.6 0 1.6-.9z"/></svg>',
  volume:
    '<svg viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M3 9.5h3.5L11 5.4c.6-.6 1.5-.1 1.5.7v11.8c0 .8-.9 1.3-1.5.7l-4.5-4.1H3c-.6 0-1-.4-1-1v-3c0-.6.4-1 1-1z"/>' +
      '<path d="M15.2 8.6a4.8 4.8 0 0 1 0 6.8l-1.2-1.2a3.1 3.1 0 0 0 0-4.4z"/>' +
      '<path d="M17.8 5.8a8.7 8.7 0 0 1 0 12.4l-1.2-1.2a7 7 0 0 0 0-10z"/>' +
    '</svg>',
  adjust:
    '<svg viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M12 4.2v15.6a7.8 7.8 0 0 0 0-15.6z"/>' +
      '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '</svg>'
};
