// 科技風背景：緩慢漂浮的節點與連線，滑鼠靠近時會牽線。尊重「減少動態效果」設定。
(function () {
  var cv = document.createElement("canvas");
  cv.id = "bg";
  cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  var ctx = cv.getContext("2d");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W, H, dpr, pts = [], mouse = { x: -999, y: -999 }, raf;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(70, Math.round(W * H / 20000));
    pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25 });
  }

  function rgb() { return document.documentElement.dataset.theme === "dark" ? "0,173,239" : "0,121,158"; }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var c = rgb(), dark = document.documentElement.dataset.theme === "dark";
    var base = dark ? 0.5 : 0.28, D = 150;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (!reduce) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < D) { ctx.strokeStyle = "rgba(" + c + "," + (1 - d / D) * base * .6 + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      var mx = p.x - mouse.x, my = p.y - mouse.y, md = Math.sqrt(mx * mx + my * my);
      if (md < 180) { ctx.strokeStyle = "rgba(" + c + "," + (1 - md / 180) * base + ")"; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      ctx.fillStyle = "rgba(" + c + "," + base + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.2832); ctx.fill();
    }
    if (!reduce) raf = requestAnimationFrame(draw);
  }

  addEventListener("resize", function () { size(); if (reduce) draw(); });
  addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener("mouseout", function () { mouse.x = mouse.y = -999; });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) cancelAnimationFrame(raf); else if (!reduce) draw();
  });
  new MutationObserver(function () { if (reduce) draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  size(); draw();
})();
