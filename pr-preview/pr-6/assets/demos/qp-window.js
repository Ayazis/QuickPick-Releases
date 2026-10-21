/* QuickPick hex-menu demo — Windows 11 window chrome (markup side).
   Companion to qp-window.css. Builds the title bar every demo's stand-in
   desktop window needs, and optionally the whole window element.

   Two entry points, because the demos need it at two levels:

     // just the markup — for windows a demo positions itself, and for the
     // static copies that get scaled down into thumbnails
     QpWindow.barHTML(iconSvg, "main.js — Visual Studio Code")
     QpWindow.captionBtns

     // a whole window element inserted into the stage
     var w = QpWindow.build(qp, {
       icon: iconSvg, title: "...", bodyHTML: "<div class='qp-fw-body ...'>",
       className: "qp-app-win", small: true,
       at: { left: 215, top: 225, width: 330, height: 240 },
       before: qp.win          // insert above the desktop, below QuickPick
     });
     w.setTitle("..."); w.show(); w.hide();

   Needs qp-window.css loaded. */
window.QpWindow = (function () {
  "use strict";

  /* Minimize / maximize / close, drawn as line art so they stay legible
     when a window gets scaled down into a 116x74 thumbnail. */
  var CAPTION_BTNS =
    '<div class="qp-fw-caption">' +
      '<span class="qp-fw-cap"><svg viewBox="0 0 10 10"><line x1="1.5" y1="5" x2="8.5" y2="5"/></svg></span>' +
      '<span class="qp-fw-cap"><svg viewBox="0 0 10 10"><rect x="1.8" y="1.8" width="6.4" height="6.4"/></svg></span>' +
      '<span class="qp-fw-cap close"><svg viewBox="0 0 10 10"><line x1="2" y1="2" x2="8" y2="8"/>' +
        '<line x1="8" y1="2" x2="2" y2="8"/></svg></span>' +
    "</div>";

  function barHTML(iconSvg, title) {
    return '<div class="qp-fw-bar">' +
      '<span class="qp-fw-appicon">' + (iconSvg || "") + "</span>" +
      '<span class="qp-fw-title">' + (title || "") + "</span>" +
      CAPTION_BTNS + "</div>";
  }

  function build(qp, config) {
    config = config || {};
    var el = document.createElement("div");
    el.className = (config.className || "qp-fw-chrome") + (config.small ? " qp-fw-sm" : "");

    var at = config.at;
    if (at) {
      el.style.position = "absolute";
      if (typeof at.left === "number") el.style.left = at.left + "px";
      if (typeof at.top === "number") el.style.top = at.top + "px";
      if (typeof at.width === "number") el.style.width = at.width + "px";
      if (typeof at.height === "number") el.style.height = at.height + "px";
    }
    el.innerHTML = barHTML(config.icon, config.title) + (config.bodyHTML || "");

    /* Default insertion point is just below the QuickPick window, so the
       menu always paints over the app it was summoned in. */
    var before = config.before || (qp && qp.win);
    if (qp && qp.stage) {
      if (before && before.parentNode === qp.stage) qp.stage.insertBefore(el, before);
      else qp.stage.appendChild(el);
    }

    return {
      el: el,
      setTitle: function (t) { el.querySelector(".qp-fw-title").textContent = t; },
      show: function () { el.classList.add("active"); },
      hide: function () { el.classList.remove("active"); }
    };
  }

  return { build: build, barHTML: barHTML, captionBtns: CAPTION_BTNS };
})();
