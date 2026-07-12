/* QuickPick hex-menu demo — optional app-bar add-on.
   Loaded before qp-core.js's create() runs for a demo that passes an
   `appBar: { apps: [...] }` config. apps items: { run: bool, icon: svgString }.

   svgIcon(inner) helper is exposed for demos authoring their own app icons:
     QpAppBar.svgIcon('<circle .../>') -> '<svg viewBox="0 0 20 20" class="qp-app-icon">...</svg>' */
window.QpAppBar = (function () {
  "use strict";

  function svgIcon(inner) {
    return '<svg viewBox="0 0 20 20" class="qp-app-icon">' + inner + "</svg>";
  }

  function build(barEl, stripEl, apps, ns, stage) {
    var appEls = [];
    apps.forEach(function (a) {
      var el = document.createElement("div");
      el.className = "qp-app";
      el.innerHTML = '<div class="qp-app-btn"></div>' + a.icon + (a.run ? '<div class="qp-underline"></div>' : "");
      barEl.appendChild(el);
      appEls.push(el);
    });
    stripEl.style.width = (apps.length * 35) + "px"; // AppLinkBarWidth = count * 35

    function hover(i, on) {
      appEls[i].classList.toggle("hover", on);
    }
    function setActive(i, on) {
      var el = appEls[i];
      var underline = el.querySelector(".qp-underline");
      if (on && !underline) {
        underline = document.createElement("div");
        underline.className = "qp-underline";
        el.appendChild(underline);
      } else if (!on && underline) {
        underline.remove();
      }
    }
    function center(i) {
      var el = appEls[i];
      var pos = window.QuickPickHex.offsetRelativeTo(el, stage);
      // The bar centers itself with translateX(-50%), which offsetLeft (and
      // thus offsetRelativeTo) doesn't reflect — subtract half the bar width
      // to get the real on-screen center.
      return { x: pos.x - barEl.offsetWidth / 2 + el.offsetWidth / 2, y: pos.y + el.offsetHeight / 2 };
    }

    return { els: appEls, hover: hover, setActive: setActive, center: center };
  }

  return { build: build, svgIcon: svgIcon };
})();
