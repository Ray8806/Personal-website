// 示意用的虛構資料，與任何真實系統、資料表或數字無關
(function () {
  var ITEMS = [
    { zh: "每日銷售明細", en: "Daily sales detail", n: 12840 },
    { zh: "訂單狀態彙總", en: "Order status summary", n: 8765 },
    { zh: "庫存異動紀錄", en: "Inventory movements", n: 23410 },
    { zh: "客戶聯絡紀錄", en: "Customer contacts", n: 4213 },
    { zh: "服務工單", en: "Service tickets", n: 1587 },
    { zh: "零件出貨明細", en: "Parts shipments", n: 9632 },
    { zh: "保固資料", en: "Warranty records", n: 3076 },
    { zh: "據點營運日報", en: "Branch daily ops", n: 66 }
  ];
  var rows = [], busy = false, bad = null;
  var $ = function (id) { return document.getElementById(id); };
  var en = function () { return document.documentElement.lang === "en"; };
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var fmt = function (n) { return n.toLocaleString("en-US"); };

  function reset() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    rows = ITEMS.map(function (it, i) {
      var t = new Date(d.getTime() + (i * 97 + 180) * 1000);
      return { it: it, src: it.n, db: it.n, time: t, state: "idle" };
    });
    bad = null;
  }

  function stamp(t) {
    return t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate()) + " " + pad(t.getHours()) + ":" + pad(t.getMinutes()) + ":" + pad(t.getSeconds());
  }

  function render() {
    var body = $("mon-body"), n = 0, failed = 0, pending = 0;
    body.innerHTML = "";
    rows.forEach(function (r) {
      var tr = document.createElement("tr");
      var label = en() ? r.it.en : r.it.zh;
      var res = "", cls = "";
      if (r.state === "checking") { res = en() ? "Checking…" : "檢查中…"; cls = "chk"; pending++; }
      else if (r.state === "idle") { res = "—"; pending++; }
      else if (r.state === "ok") { res = "✔ " + (en() ? "Passed" : "核對通過"); cls = "ok"; n++; }
      else { res = "✖ " + (en() ? "Mismatch: " : "筆數不符：") + (r.db - r.src > 0 ? "+" : "") + fmt(r.db - r.src); cls = "bad"; n++; failed++; }
      [label, fmt(r.src), r.state === "ok" || r.state === "bad" ? fmt(r.db) : "—", stamp(r.time), res].forEach(function (v, i) {
        var td = document.createElement("td");
        td.textContent = v;
        if (i === 4) td.className = cls;
        if (i === 0) td.setAttribute("data-label", "");
        tr.appendChild(td);
      });
      if (r.state === "bad") tr.className = "row-bad";
      body.appendChild(tr);
    });
    $("mon-total").textContent = rows.length;
    $("mon-bad").textContent = failed;
    $("mon-bad").className = failed ? "bad" : "ok";
    var st = $("mon-status");
    if (pending) { st.textContent = en() ? "Running" : "檢查中"; st.className = "chk"; }
    else if (failed) { st.textContent = en() ? "Attention" : "異常"; st.className = "bad"; }
    else { st.textContent = en() ? "Normal" : "正常"; st.className = "ok"; }
    var d = new Date();
    $("mon-date").textContent = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    var msg = $("mon-msg");
    if (!pending && failed) {
      var r = rows.filter(function (x) { return x.state === "bad"; })[0];
      msg.textContent = en()
        ? "Alert: “" + r.it.en + "” imported " + fmt(Math.abs(r.db - r.src)) + " fewer rows than the source file. In practice this is where a notification would be sent."
        : "警示：「" + r.it.zh + "」匯入筆數比來源檔案少 " + fmt(Math.abs(r.db - r.src)) + " 筆。實務上會在此時發出通知，讓人員及早處理。";
      msg.className = "mon-msg bad";
    } else if (!pending) {
      msg.textContent = en() ? "All reports were imported correctly." : "所有報表皆已正確匯入。";
      msg.className = "mon-msg ok";
    } else { msg.textContent = ""; }
  }

  function run() {
    if (busy) return;
    busy = true;
    ["mon-run", "mon-inject", "mon-reset"].forEach(function (id) { $(id).disabled = true; });
    rows.forEach(function (r) { r.state = "idle"; });
    render();
    var i = 0;
    (function step() {
      if (i >= rows.length) {
        busy = false;
        ["mon-run", "mon-inject", "mon-reset"].forEach(function (id) { $(id).disabled = false; });
        render();
        return;
      }
      rows[i].state = "checking"; render();
      setTimeout(function () {
        var r = rows[i];
        r.state = r.src === r.db ? "ok" : "bad";
        i++; render(); setTimeout(step, 120);
      }, 260);
    })();
  }

  function inject() {
    if (busy) return;
    var pool = rows.filter(function (r) { return r.src === r.db; });
    if (!pool.length) { return run(); }
    var r = pool[Math.floor(Math.random() * pool.length)];
    r.db = Math.max(0, r.src - (Math.floor(Math.random() * 400) + 20));
    run();
  }

  function init() {
    if (!$("monitor")) return;
    reset();
    $("mon-run").onclick = run;
    $("mon-inject").onclick = inject;
    $("mon-reset").onclick = function () { if (!busy) { reset(); run(); } };
    window.onLangChange = render;
    // 捲動到示範區時自動跑一次
    var started = false;
    function start() { if (!started) { started = true; run(); } }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { start(); o.disconnect(); } }, { threshold: 0.3 }).observe($("monitor"));
      render();
    } else { start(); }
  }
  init();
})();
