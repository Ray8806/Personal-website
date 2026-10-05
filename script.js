const dict = {
  en: {
    nav_about:"About", nav_exp:"Experience", nav_proj:"Projects", nav_contact:"Contact",
    hero_hi:"Hi, I'm", hero_role:"Job Title · Specialty",
    hero_lead:"I help [audience] achieve [outcome]. One or two sentences on your value, e.g. 5 years in product, turning complex problems into simple, testable solutions.",
    cta_li:"Connect on LinkedIn", cta_cv:"Download résumé",
    stat1:"Years experience", stat2:"Projects shipped", stat3:"Industries",
    about_p:"Write 3–4 sentences: your background, how you like to work, what you're looking for next. Specific and natural beats a list of titles.",
    exp1:"Describe results: what you did → the measurable outcome (e.g. lifted conversion by 30%).",
    exp2:"Describe results: what you did → the measurable outcome.",
    exp3:"Major, honors or notable thesis.",
    p1:"Problem → approach → result, in two sentences.", p2:"Problem → approach → result, in two sentences.", p3:"Problem → approach → result, in two sentences.",
    contact_h:"Let's talk", contact_p:"Open to collaboration, interviews, or just a good conversation."
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
