/* QuickPick hex-menu demo — optional Windows-desktop backdrop.

   Adds a wallpaper, a couple of desktop shortcuts and a Win11-style
   centered taskbar behind everything else in a QuickPickHex stage, so the
   menu reads as running on a real desktop. Needs qp-desktop.css, and
   qp-brand-icons.js if you reference brand icons by name.

   Usage:
     var qp = QuickPickHex.create(el, {...});
     QpDesktop.build(qp, {
       taskbar:   ["vsCode", { icon: "chrome", run: true }, "outlook"],
       shortcuts: [{ icon: "abletonLive", label: "Ableton Live 12" }]
     });

   Taskbar/shortcut entries are either a QpBrandIcons key or an object
   { icon, label, run }. Start and search are prepended automatically. */
window.QpDesktop = (function () {
  "use strict";

  var START =
    '<svg viewBox="0 0 24 24">' +
      '<rect x="3" y="3" width="8.4" height="8.4" rx="1" fill="#4cc2ff"/>' +
      '<rect x="12.6" y="3" width="8.4" height="8.4" rx="1" fill="#4cc2ff"/>' +
      '<rect x="3" y="12.6" width="8.4" height="8.4" rx="1" fill="#4cc2ff"/>' +
      '<rect x="12.6" y="12.6" width="8.4" height="8.4" rx="1" fill="#4cc2ff"/>' +
    "</svg>";

  var RECYCLE_BIN =
    '<svg viewBox="0 0 24 24">' +
      '<path d="M5.5 7.5h13l-1.2 12a1.6 1.6 0 0 1-1.6 1.4H8.3a1.6 1.6 0 0 1-1.6-1.4z"' +
        ' fill="rgba(190,225,255,.35)" stroke="#cfe6ff" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="M9.6 11v6.4M12 11v6.4M14.4 11v6.4" stroke="#cfe6ff" stroke-width="1.1" stroke-linecap="round"/>' +
      '<path d="M4 6.4h16" stroke="#cfe6ff" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M9.4 6.4V4.6c0-.6.5-1.1 1.1-1.1h3c.6 0 1.1.5 1.1 1.1v1.8" fill="none" stroke="#cfe6ff" stroke-width="1.2"/>' +
    "</svg>";

  /* An entry's icon markup: a QpBrandIcons key, or raw SVG passed through. */
  function markup(icon) {
    if (!icon) return "";
    if (icon.charAt(0) === "<") return icon;
    return (window.QpBrandIcons && window.QpBrandIcons[icon]) || "";
  }
  function normalize(entry) {
    return typeof entry === "string" ? { icon: entry } : (entry || {});
  }

  function build(qp, config) {
    config = config || {};
    var taskbar = config.taskbar || [];
    var shortcuts = config.shortcuts || [];

    var desktop = document.createElement("div");
    desktop.className = "qp-desktop";
    desktop.innerHTML =
      '<div class="qp-wallpaper"></div>' +
      '<div class="qp-desktop-vignette"></div>';

    if (shortcuts.length) {
      var deskIcons = document.createElement("div");
      deskIcons.className = "qp-desk-icons";
      shortcuts.forEach(function (raw) {
        var s = normalize(raw);
        var el = document.createElement("div");
        el.className = "qp-desk-icon";
        el.innerHTML = (s.icon === "recycleBin" ? RECYCLE_BIN : markup(s.icon)) +
          "<span>" + (s.label || "") + "</span>";
        deskIcons.appendChild(el);
      });
      desktop.appendChild(deskIcons);
    }

    if (taskbar.length) {
      var bar = document.createElement("div");
      bar.className = "qp-taskbar";
      bar.innerHTML =
        '<div class="qp-tb-item">' + START + "</div>" +
        '<div class="qp-tb-search"></div>';
      taskbar.forEach(function (raw) {
        var t = normalize(raw);
        var el = document.createElement("div");
        el.className = "qp-tb-item" + (t.run ? " run" : "");
        el.innerHTML = markup(t.icon);
        bar.appendChild(el);
      });
      desktop.appendChild(bar);
    }

    qp.stage.insertBefore(desktop, qp.stage.firstChild);
    qp.root.classList.add("has-desktop");
    return desktop;
  }

  return { build: build };
})();
