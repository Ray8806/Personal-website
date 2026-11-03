// 示意用：全部在瀏覽器內執行，資料不會上傳；範例內容皆為虛構。
// 這是簡化版展示，並非「可還原去識別化工具」本體（本體設計為本機離線執行）。
(function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$("deid-app")) return;
  var en = function () { return document.documentElement.lang === "en"; };

  var SAMPLE = {
    zh: "客戶：王小明（身分證字號 A123456789）\n手機：0912-345-678　市話：02-1234-5678\nEmail：ming.wang@example.com\n車牌：ABC-1234　登入 IP：10.1.2.3\n\n工單備註：王經理表示設備已送修，林小姐會再與小明確認。\n請聯絡 林美玲 mei@example.com 安排取件。\n\n專案代號：Aurora　客戶公司：星辰科技",
    en: "Customer: Ming Wang (National ID A123456789)\nMobile: 0912-345-678   Landline: 02-1234-5678\nEmail: ming.wang@example.com\nPlate: ABC-1234   Login IP: 10.1.2.3\n\nTicket note: Mr. Wang says the device was sent for repair; Ms. Lin will follow up with Ming.\nPlease contact Mei-Ling Lin at mei@example.com to arrange pickup.\n\nProject code: Aurora   Client: Starlight Tech"
  };
  // 自訂字典：同一人的不同稱呼對應同一個代號
  var NAMES = [
    ["王小明", "王經理", "王先生", "小明", "Ming Wang", "Mr. Wang", "Ming"],
    ["林美玲", "林小姐", "美玲", "Mei-Ling Lin", "Ms. Lin"]
  ];
  var TYPES = {
    P: { zh: "人名", en: "Name" }, ID: { zh: "身分證", en: "National ID" },
    T: { zh: "電話", en: "Phone" }, E: { zh: "Email", en: "Email" },
    C: { zh: "車牌", en: "Plate" }, N: { zh: "IP", en: "IP" },
    D: { zh: "自訂詞", en: "Custom" }
  };
  var ORDER = ["P", "ID", "T", "E", "C", "N", "D"];

  // 使用者自訂的詞：每一組是同一對象的多種稱呼（共用同一個代號）；只存在這個頁面的記憶體，不會儲存或上傳
  var custom = [], MAX_GROUPS = 50;
  var mode = "token", edited = false, mapRows = [];

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function pad3(n) { return String(n).padStart(3, "0"); }
  function hw(s) { return s.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }); }
  function fw(s) { return s.replace(/[A-Za-z0-9]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) + 0xFEE0); }); }

  // 身分證字號檢查碼驗證（只認通過檢查碼的，降低誤判）
  function idValid(s) {
    var i = "ABCDEFGHJKLMNPQRSTUVXYWZIO".indexOf(s.charAt(0));
    if (i < 0) return false;
    var n = i + 10, d = [Math.floor(n / 10), n % 10], w = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1], sum = 0, k;
    for (k = 1; k < s.length; k++) d.push(+s.charAt(k));
    for (k = 0; k < 11; k++) sum += d[k] * w[k];
    return sum % 10 === 0;
  }
  function ipValid(s) { return s.split(".").every(function (x) { return +x <= 255; }); }

  function detect(text) {
    var found = [];
    function add(re, type, ok, keyFn) {
      var m;
      re.lastIndex = 0;
      while ((m = re.exec(text))) {
        if (ok && !ok(m[0])) continue;
        found.push({ s: m.index, e: m.index + m[0].length, t: type, v: m[0], k: keyFn ? keyFn(m[0]) : m[0] });
      }
    }
    // 自訂詞先加入，同位置、同長度時優先採用
    custom.forEach(function (group, gi) {
      group.forEach(function (term) {
        var ascii = /^[\x20-\x7e]+$/.test(term);
        add(new RegExp((ascii ? "(?<![A-Za-z0-9])" : "") + esc(term) + (ascii ? "(?![A-Za-z0-9])" : ""), ascii ? "gi" : "g"), "D", null, function () { return "c" + gi; });
      });
    });
    add(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "E", null, function (v) { return v.toLowerCase(); });
    add(/(?<![A-Za-z0-9])[A-Z][12]\d{8}(?![A-Za-z0-9])/g, "ID", idValid);
    add(/(?<!\d)09\d{2}[-\s]?\d{3}[-\s]?\d{3}(?!\d)/g, "T", null, function (v) { return v.replace(/\D/g, ""); });
    add(/(?<!\d)0[2-8]-?\d{3,4}-?\d{4}(?!\d)/g, "T", null, function (v) { return v.replace(/\D/g, ""); });
    add(/(?<![A-Za-z0-9])[A-Z]{3}-\d{4}(?![A-Za-z0-9])/g, "C");
    add(/(?<![\d.])\d{1,3}(?:\.\d{1,3}){3}(?![\d.])/g, "N", ipValid);
    NAMES.forEach(function (group, gi) {
      group.forEach(function (alias) {
        var ascii = /^[\x20-\x7e]+$/.test(alias);
        var re = new RegExp((ascii ? "(?<![A-Za-z])" : "") + esc(alias) + (ascii ? "(?![A-Za-z])" : ""), "g");
        add(re, "P", null, function () { return "g" + gi; });
      });
    });
    // 重疊時：先出現的優先，同位置取較長者
    found.sort(function (a, b) { return a.s - b.s || (b.e - b.s) - (a.e - a.s); });
    var out = [], last = 0;
    found.forEach(function (f) { if (f.s >= last) { out.push(f); last = f.e; } });
    return out;
  }

  function maskVal(t, v) {
    var digits, keepS, keepE, seen = 0;
    switch (t) {
      case "P": case "D": return v.split(" ").map(function (w) { return w.charAt(0) + new Array(w.length).join("*"); }).join(" ");
      case "ID": return v.slice(0, 3) + "*****" + v.slice(-2);
      case "T":
        digits = v.replace(/\D/g, "").length;
        keepS = Math.min(4, Math.ceil(digits * 0.4)); keepE = 3;
        return v.replace(/\d/g, function (c) { seen++; return seen <= keepS || seen > digits - keepE ? c : "*"; });
      case "E": return v.charAt(0) + "***@" + v.split("@")[1];
      case "C": return v.slice(0, 4) + "****";
      default: return v.split(".").slice(0, 2).join(".") + ".*.*";
    }
  }

  // 去識別化：回傳 { segs, map, counts, plain }
  function anonymize(text) {
    var matches = detect(text), segs = [], pos = 0, counters = {}, seen = {}, counts = {}, map = [];
    matches.forEach(function (m) {
      if (m.s > pos) segs.push({ text: text.slice(pos, m.s) });
      var rep;
      if (mode === "token") {
        var id = m.t + "|" + m.k;
        if (!seen[id]) {
          counters[m.t] = (counters[m.t] || 0) + 1;
          seen[id] = { tok: "⟦" + m.t + "-" + pad3(counters[m.t]) + "⟧", key: m.t + "-" + pad3(counters[m.t]) };
          map.push({ tok: seen[id].tok, key: seen[id].key, t: m.t, orig: m.v });
        }
        rep = seen[id].tok;
      } else { rep = maskVal(m.t, m.v); }
      counts[m.t] = (counts[m.t] || 0) + 1;
      segs.push({ text: rep, t: m.t });
      pos = m.e;
    });
    if (pos < text.length) segs.push({ text: text.slice(pos) });
    return { segs: segs, map: map, counts: counts, total: matches.length, plain: segs.map(function (s) { return s.text; }).join("") };
  }

  // 還原：容錯比對常見變形（括號不見、空白、全形／半形、大小寫）；對照不到的不自動猜
  var TK = new RegExp("(?:([⟦\\[［【〔])\\s*)?(?<![A-Za-z0-9])([A-Za-zＡ-Ｚａ-ｚ]{1,3})\\s*[-－_]\\s*([0-9０-９]{1,4})(?![0-9A-Za-z０-９])(?:\\s*([⟧\\]］】〕]))?", "g");
  function restore(text) {
    var lookup = {}, segs = [], pos = 0, m, restored = 0, unknown = [];
    mapRows.forEach(function (r) { lookup[r.key] = r.orig; });
    TK.lastIndex = 0;
    while ((m = TK.exec(text))) {
      var key = hw(m[2]).toUpperCase() + "-" + hw(m[3]).padStart(3, "0");
      var bracket = !!(m[1] || m[4]);
      if (lookup[key] !== undefined) {
        if (m.index > pos) segs.push({ text: text.slice(pos, m.index) });
        segs.push({ text: lookup[key], ok: true });
        pos = m.index + m[0].length; restored++;
      } else if (bracket) {
        if (m.index > pos) segs.push({ text: text.slice(pos, m.index) });
        segs.push({ text: m[0], bad: true });
        pos = m.index + m[0].length;
        if (unknown.indexOf(m[0].trim()) < 0) unknown.push(m[0].trim());
      }
    }
    if (pos < text.length) segs.push({ text: text.slice(pos) });
    return { segs: segs, restored: restored, unknown: unknown };
  }

  function paint(box, segs) {
    box.textContent = "";
    segs.forEach(function (s) {
      if (!s.t && !s.ok && !s.bad) { box.appendChild(document.createTextNode(s.text)); return; }
      var sp = document.createElement("span");
      sp.className = s.ok ? "tk rs" : s.bad ? "tk bd" : "tk";
      if (s.t) sp.setAttribute("data-t", s.t);
      sp.textContent = s.text;
      box.appendChild(sp);
    });
  }

  function mangle(plain) {
    var i = 0;
    var body = plain.replace(/⟦([A-Z]+)-(\d{3})⟧/g, function (all, t, n) {
      var v = i++ % 6;
      if (v === 1) return "[" + t.toLowerCase() + "-" + n + "]";
      if (v === 2) return t + "-" + n;
      if (v === 3) return "⟦" + fw(t) + "－" + fw(n) + "⟧";
      if (v === 4) return "⟦ " + t + " - " + n + " ⟧";
      if (v === 5) return "⟦X-099⟧";
      return all;
    });
    return (en() ? "Sure, here is the cleaned-up version:\n" : "好的，以下是整理後的內容：\n") + body;
  }

  var current = null;

  function drawMap() {
    var wrap = $("deid-maptable");
    wrap.textContent = "";
    if (!mapRows.length) return;
    var table = document.createElement("table"), thead = document.createElement("thead"), tr = document.createElement("tr");
    [en() ? "Token" : "代號", en() ? "Type" : "類型", en() ? "Original (first seen)" : "原值（首次出現）"].forEach(function (h) {
      var th = document.createElement("th"); th.textContent = h; tr.appendChild(th);
    });
    thead.appendChild(tr); table.appendChild(thead);
    var tb = document.createElement("tbody");
    mapRows.forEach(function (r) {
      var row = document.createElement("tr");
      [r.tok, TYPES[r.t][en() ? "en" : "zh"], r.orig].forEach(function (v) {
        var td = document.createElement("td"); td.textContent = v; row.appendChild(td);
      });
      tb.appendChild(row);
    });
    table.appendChild(tb); wrap.appendChild(table);
  }

  function drawSummary() {
    var sum = $("deid-sum");
    if (!current.total) { sum.textContent = en() ? "No sensitive data detected." : "未偵測到敏感資料。"; return; }
    var parts = ORDER.filter(function (t) { return current.counts[t]; }).map(function (t) {
      return TYPES[t][en() ? "en" : "zh"] + " " + current.counts[t];
    });
    sum.textContent = (en() ? "Detected " + current.total + " items: " : "共偵測到 " + current.total + " 筆：") + parts.join(en() ? ", " : "、") +
      (mode === "token" ? (en() ? ". Different mentions of the same person share one token." : "。同一個人的不同稱呼會共用同一個代號。") : "。");
  }

  function doRestore() {
    if (mode !== "token") return;
    var r = restore($("deid-ai").value);
    paint($("deid-res"), r.segs);
    var w = $("deid-warn");
    if (r.unknown.length) {
      w.className = "deid-warn bad";
      w.textContent = (en()
        ? "⚠ " + r.unknown.length + " token(s) not found in the map (" + r.unknown.join(", ") + "). The tool never guesses; these need manual review."
        : "⚠ 有 " + r.unknown.length + " 個代號在對照表中找不到（" + r.unknown.join("、") + "），工具不會自動猜測，需人工處理。") +
        (en() ? " Restored " + r.restored + "." : "（已還原 " + r.restored + " 個）");
    } else {
      w.className = "deid-warn ok";
      w.textContent = en() ? "Restored " + r.restored + " token(s); none left unmatched." : "已還原 " + r.restored + " 個代號，沒有無法對應的項目。";
    }
  }

  function compute() {
    current = anonymize($("deid-in").value);
    mapRows = current.map;
    paint($("deid-out"), current.segs);
    drawSummary(); drawMap();
    var token = mode === "token";
    $("deid-restore").hidden = !token;
    $("deid-masknote").hidden = token;
    $("deid-mapbox").hidden = !token;
    $("deid-m-token").classList.toggle("on", token);
    $("deid-m-mask").classList.toggle("on", !token);
    $("deid-m-token").setAttribute("aria-pressed", token);
    $("deid-m-mask").setAttribute("aria-pressed", !token);
    if (token) { $("deid-ai").value = current.plain; doRestore(); }
  }

  function setSample() { $("deid-in").value = SAMPLE[en() ? "en" : "zh"]; }

  // 自訂詞：以逗號（, ， 、）分隔同一對象的多種稱呼
  function drawChips() {
    var ul = $("deid-chips");
    ul.textContent = "";
    $("deid-term").placeholder = en() ? "e.g. Aurora   or   Starlight Tech, Starlight" : "例如：Aurora　或　星辰科技, 星辰";
    custom.forEach(function (group, gi) {
      var li = document.createElement("li"), x = document.createElement("button");
      li.appendChild(document.createTextNode(group.join(" = ")));
      x.type = "button"; x.textContent = "×";
      x.setAttribute("aria-label", (en() ? "Remove " : "移除 ") + group[0]);
      x.onclick = function () { custom.splice(gi, 1); drawChips(); compute(); };
      li.appendChild(x); ul.appendChild(li);
    });
  }

  function addTerm() {
    var input = $("deid-term"), msg = $("deid-termmsg");
    var terms = input.value.split(/[,，、]/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length >= 2 && s.length <= 60; });
    terms = terms.filter(function (t, i) { return terms.indexOf(t) === i; });
    msg.textContent = "";
    if (!terms.length) { msg.textContent = en() ? "Enter at least 2 characters." : "請輸入至少 2 個字。"; return; }
    if (custom.length >= MAX_GROUPS) { msg.textContent = en() ? "Limit reached (" + MAX_GROUPS + " groups)." : "已達上限（" + MAX_GROUPS + " 組）。"; return; }
    custom.push(terms);
    input.value = "";
    drawChips(); compute();
    input.focus();
  }

  function init() {
    setSample();
    $("deid-add").onclick = addTerm;
    $("deid-term").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); addTerm(); } });
    drawChips();
    $("deid-in").addEventListener("input", function () { edited = true; compute(); });
    $("deid-ai").addEventListener("input", doRestore);
    $("deid-m-token").onclick = function () { mode = "token"; compute(); };
    $("deid-m-mask").onclick = function () { mode = "mask"; compute(); };
    $("deid-sim").onclick = function () { $("deid-ai").value = mangle(current.plain); doRestore(); };
    $("deid-reset").onclick = function () { edited = false; setSample(); compute(); };
    var prev = window.onLangChange;
    window.onLangChange = function () {
      if (prev) prev();
      if (!edited) setSample();
      drawChips(); compute();
    };
    compute();
  }
  init();
})();
