(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  // Date-bound content: remove [data-show-until="YYYY-MM-DDTHH:MM"] once Melbourne time passes it.
  // Test with ?now=2026-11-01T10:00 (read as Melbourne local time).
  var STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

  function melbourneNow() {
    var override = new URLSearchParams(location.search).get("now");
    if (override && STAMP.test(override)) return override;
    var p = {};
    new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Melbourne",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return p.year + "-" + p.month + "-" + p.day + "T" + p.hour + ":" + p.minute;
  }

  function pruneExpired() {
    var nodes = document.querySelectorAll("[data-show-until]");
    if (!nodes.length) return;
    var now = melbourneNow();
    nodes.forEach(function (el) {
      var until = el.getAttribute("data-show-until");
      if (STAMP.test(until) && now > until) el.remove();
    });
  }

  function reveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  function init() { pruneExpired(); reveal(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
