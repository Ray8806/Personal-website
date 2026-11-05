// 個人儀表板：讀取 data/now.json（手動）與 data/github.json（Actions 每日產生）
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var now = null, gh = null, music = null;
  var COLORS = ["#00adef", "#8d9399", "#e0a030", "#5cb85c", "#b06ad8", "#d9534f"];

  var en = function () { return document.documentElement.lang === "en"; };
  var fmt = function (iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(en() ? "en-US" : "zh-TW", { year: "numeric", month: "short", day: "numeric" });
  };
  var el = function (tag, attrs, text) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  };

  function renderNow() {
    if (!now) { $("dash-now").hidden = true; return; }
    var ul = $("now-list"); ul.textContent = "";
    now.items.forEach(function (it) {
      var li = el("li"); li.appendChild(el("span", { "aria-hidden": "true" }, it.icon));
      li.appendChild(el("span", null, en() ? it.en : it.zh)); ul.appendChild(li);
    });
    $("now-upd").textContent = (en() ? "Updated " : "更新於 ") + fmt(now.updated);
  }

  function level(n, max) { return n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)); }

  function renderGh() {
    var card = $("dash-gh");
    if (!gh || !gh.generated_at) { card.hidden = true; return; }
    card.hidden = false;
    $("gh-repos").textContent = gh.public_repos;
    $("gh-act").textContent = gh.activity_total;

    // 熱圖：最近 N 週，週日開頭、每欄一週
    var heat = $("gh-heat"); heat.textContent = "";
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var start = new Date(today); start.setDate(start.getDate() - start.getDay() - (gh.weeks - 1) * 7);
    var max = Math.max.apply(null, [1].concat(Object.keys(gh.days).map(function (k) { return gh.days[k]; })));
    for (var d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      var key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      var n = gh.days[key] || 0, c = el("i", { "data-l": level(n, max), title: key + ": " + n });
      heat.appendChild(c);
    }
    heat.setAttribute("aria-label", en() ? "Public activity heatmap, last " + gh.weeks + " weeks" : "近 " + gh.weeks + " 週公開活動熱圖");

    // 語言分布
    var bar = $("gh-langs"); bar.textContent = "";
    var legend = document.getElementById("gh-legend");
    if (legend) legend.remove();
    var total = gh.languages.reduce(function (a, l) { return a + l.count; }, 0);
    legend = el("ul", { id: "gh-legend", class: "lang-legend" });
    gh.languages.forEach(function (l, i) {
      var color = COLORS[i % COLORS.length];
      var seg = el("i", { title: l.name }); seg.style.width = (l.count / total * 100) + "%"; seg.style.background = color; bar.appendChild(seg);
      var li = el("li"); var dot = el("span"); dot.style.background = color; li.appendChild(dot); li.appendChild(document.createTextNode(l.name)); legend.appendChild(li);
    });
    bar.after(legend);

    // 最近更新的專案
    var ul = $("gh-recent"); ul.textContent = "";
    gh.recent.forEach(function (r) {
      var li = el("li"); var a = el("a", { href: r.url, target: "_blank", rel: "noopener" }, r.name);
      li.appendChild(a); li.appendChild(el("em", null, fmt(r.pushed_at))); ul.appendChild(li);
    });
    $("gh-upd").textContent = (en() ? "GitHub data updated " : "GitHub 資料更新於 ") + fmt(gh.generated_at);
  }

  // 只接受 youtube / music.youtube.com 的播放清單連結，並只取出 list ID 組成嵌入網址
  function listId(url) {
    try {
      var u = new URL(url);
      if (u.protocol !== "https:" || !/^(music|www)\.youtube\.com$/.test(u.hostname)) return null;
      var id = u.searchParams.get("list");
      return id && /^[\w-]{10,64}$/.test(id) ? id : null;
    } catch (e) { return null; }
  }
  function renderMusic() {
    var card = $("dash-music"), id = music && listId(music.playlist_url);
    if (!id) { card.hidden = true; return; }
    card.hidden = false;
    $("music-title").textContent = en() ? music.title.en : music.title.zh;
    $("music-note").textContent = en() ? music.note.en : music.note.zh;
    var f = $("music-embed"), src = "https://www.youtube-nocookie.com/embed/videoseries?list=" + id;
    if (f.getAttribute("src") !== src) f.setAttribute("src", src);
    f.hidden = false;
    $("music-link").href = "https://music.youtube.com/playlist?list=" + id;
  }

  function render() { renderNow(); renderGh(); renderMusic(); }

  var prev = window.onLangChange;
  window.onLangChange = function () { if (prev) prev(); render(); };

  function load(path) { return fetch(path, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
  Promise.all([load("data/now.json"), load("data/github.json"), load("data/music.json")]).then(function (res) { now = res[0]; gh = res[1]; music = res[2]; render(); });
})();
