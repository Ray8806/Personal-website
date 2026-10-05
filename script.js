const dict = {
  en: {
    nav_about:"About", nav_exp:"Experience", nav_proj:"Projects & Scope", nav_contact:"Contact",
    hero_hi:"Hi, I'm", hero_role:"Systems Engineer · IT Dept., Mercedes-Benz Taiwan",
    hero_lead:"I keep nationwide IT infrastructure stable and secure, and use AI to automate repetitive monitoring so problems are caught before they spread.",
    cta_li:"Connect on LinkedIn",
    stat1:"Nationwide IT equipment", stat2:"Daily report-import monitoring", stat3:"AI in real workflows",
    about_p:"I'm a systems engineer in the IT department at Mercedes-Benz Taiwan (中華賓士). My work spans device operations, endpoint security and procurement. Beyond keeping equipment at every site running smoothly, I apply AI in practice, for example designing a system that automatically checks whether daily report data is imported correctly, cutting manual verification time and oversights.",
    exp1:"Manage IT equipment across all sites nationwide to keep daily operations running",
    exp2:"Monitor computers for viruses and malware to protect endpoint security",
    exp3:"Responsible for procurement and planning of IT equipment",
    exp4:"Designed, with AI, a monitoring system that automatically detects whether daily report data is imported normally",
    p1:"Designed with AI to automatically check that daily report data is imported correctly and flag anomalies right away, replacing manual line-by-line checks.",
    p2:"Overseeing the status, maintenance and lifecycle of computers and peripherals at every site.",
    p3:"Continuously monitoring computers for infections and responding early to reduce security risk.",
    contact_h:"Let's talk", contact_p:"Happy to chat about IT operations, security and practical AI."
  }
};
const zh = {};
document.querySelectorAll("[data-i18n]").forEach(el => zh[el.dataset.i18n] = el.innerHTML);
dict.zh = zh;

const root = document.documentElement;
const safe = (fn) => { try { return fn(); } catch (e) {} };

function setLang(l) {
  root.lang = l === "en" ? "en" : "zh-Hant";
  document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = dict[l][el.dataset.i18n]; });
  document.getElementById("lang").textContent = l === "en" ? "中" : "EN";
  safe(() => localStorage.setItem("lang", l));
}
function setTheme(t) {
  root.dataset.theme = t;
  safe(() => localStorage.setItem("theme", t));
}

document.getElementById("lang").onclick = () => setLang(root.lang === "en" ? "zh" : "en");
document.getElementById("theme").onclick = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");
document.getElementById("year").textContent = new Date().getFullYear();

setTheme(safe(() => localStorage.getItem("theme")) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
const saved = safe(() => localStorage.getItem("lang"));
if (saved === "en") setLang("en");
