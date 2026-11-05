const dict = {
  en: {
    stat1_n:"14<small>sites</small>", stat2_n:"1,000+<small>devices</small>", stat3_n:"~30<small>min</small>", name:"Ray Tsai",
    chip1:"System administration", chip2:"IT asset management", chip3:"Endpoint security monitoring", chip4:"IT procurement", chip5:"AI applications", chip6:"Process automation", chip7:"Data monitoring",
    job_t:"Systems Engineer · IT Dept., Capital Motors, Inc.", gu_t:"GrowUp",
    tag1:"AI project", c1_t:"Daily report-import monitoring", tag2:"Operations", c2_t:"IT equipment management", tag3:"Security", c3_t:"Endpoint virus monitoring", mail_btn:"Email me",
    nav_dash:"Live", dash_h:"Personal dashboard", dash_now:"Now", dash_repos:"public repos", dash_act:"recent activity",
    dash_note:"Data in this section is refreshed daily by GitHub Actions and uses public information only; the \"Now\" card is maintained by hand.",
    nav_about:"About", nav_exp:"Experience", nav_award:"Awards", nav_demo:"Demo", nav_proj:"Projects & Scope", nav_contact:"Contact",
    hero_hi:"Hi, I'm", hero_role:"Systems Engineer · IT Dept., Capital Motors, Inc.",
    hero_lead:"I keep nationwide IT infrastructure stable and secure, and use AI to automate repetitive monitoring so problems are caught before they spread.",
    cta_li:"Connect on LinkedIn",
    stat1:"nationwide IT coverage", stat2:"under management", stat3:"saved by the workflow",
    about_p:"I'm a systems engineer in the IT department at Capital Motors, Inc. My work spans device operations, endpoint security and procurement. Beyond keeping equipment at every site running smoothly, I apply AI in practice, for example designing a system that automatically checks whether daily report data is imported correctly, cutting manual verification time and oversights.",
    exp1:"Manage 1,000+ IT devices across 14 sites nationwide to keep daily operations running",
    exp2:"Monitor computers for viruses and malware to protect endpoint security",
    exp3:"Responsible for procurement and planning of IT equipment",
    exp4:"Designed, with AI assistance, an n8n workflow that monitors daily report imports, cross-checks the data automatically and emails the results, saving about 30 minutes of manual work",
    p1:"Designed with AI assistance and automated in n8n: on a schedule it reads logs and data files, cross-checks them and emails the result, replacing manual line-by-line checks and saving about 30 minutes.",
    p2:"Overseeing the status, maintenance and lifecycle of 1,000+ computers and peripherals across 14 sites.",
    p3:"Continuously monitoring computers for infections and responding early to reduce security risk.",
    award_h:"Awards", award_t:"1st Place, Education Open Data Category", award_p:"With my five-person university capstone team, won 1st place in the Education Open Data category at the 25th InnoServe Awards (2020 International ICT Innovative Services Awards), a national university-level competition. My part was image recognition: embedding the live video feed in the app and sending frames captured by a Raspberry Pi to the Google Vision API to recognize everyday objects, with recognition accuracy above 80%.", demo_tag:"2020 · University capstone project", demo_p:"A learning app for children: kids snap a photo of something they are curious about and get answers through AI image recognition. It adds game-style learning levels and uses open data from Taiwan's Ministry of Education and Ministry of Culture to recommend suitable picture books and materials, while parents can follow their child's progress.", gap_time:"2021 — 2025", gap_t:"Preparing for national civil service exams", gap_p:"After graduating, I spent about three years focused on preparing for national exams, then returned to IT and joined the IT department at Capital Motors, Inc..", exp_time:"Nov 2025 — Present", edu_time:"Graduated 2021", edu_t:"Ming Chuan University · B.A. in Information Management", edu_p:"My capstone team won 1st place in the Education Open Data category at the InnoServe Awards.", demo_h:"Interactive demo: report import monitoring", demo_note:"A mock-up with entirely fictional data, illustrating the idea of daily report-import monitoring: compare the record count in the source file with the count imported into the database, and flag any mismatch right away. Try it yourself.",
    flow_1:"Scheduled trigger", flow_2:"Read log file", flow_3:"Read CSV files", flow_4:"Cross-check", flow_5:"Compile results", flow_6:"Email notification", mon_title:"Data Audit Summary", mon_total:"Checks", mon_bad:"Anomalies", mon_status:"Audit status",
    mon_c1:"Report", mon_c2:"Source file rows", mon_c3:"Imported rows", mon_c4:"Import time", mon_c5:"Result",
    mon_run:"Re-run check", mon_inject:"Simulate import failure", mon_reset:"Reset to normal",
    p4_tag:"Personal project · In development", p4_t:"Reversible De-identification Tool", p4:"A planned personal project: replace personal data in documents, spreadsheets and images with tokens, and restore it with a key when needed. All processing runs offline on the local machine. Click to try a simplified demo.",
    deid_h:"Interactive demo: reversible de-identification", deid_note:"A simplified demo of a personal project I'm planning, a reversible de-identification tool: replace personal data with tokens, then restore them. Everything below runs in your browser and nothing is uploaded; all sample data is fictional. The real tool is designed to run offline on the local machine and keep the restore data in an encrypted mapping file.",
    deid_m_token:"Token mode (reversible)", deid_m_mask:"Mask mode", deid_reset:"Reset sample",
    deid_cust:"+ Add your own terms to de-identify (try Aurora or Starlight Tech from the text; separate different names for the same thing with commas and they share one token)", deid_add:"Add",
    deid_in:"① Original text (fictional, feel free to edit; highlight text with your mouse to de-identify it)", deid_sel:"+ De-identify the highlighted text", deid_out:"② De-identified result",
    deid_map:"View mapping table (demo only; the real tool stores it encrypted)",
    deid_ai:"③ Text returned by an AI (editable, try changing a token)", deid_sim:"Simulate AI altering tokens", deid_rest:"④ Restored text (green = restored)",
    deid_masknote:"Mask mode only keeps part of the format and does not store the original values, so it cannot be restored. Use token mode when you need to restore.",
    disclaimer:"Personal website. Views are my own and this is not an official site of Capital Motors, Inc. or Mercedes-Benz Taiwan.", contact_h:"Let's talk", contact_p:"Happy to chat about IT operations, security and practical AI."
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
  document.title = l === "en" ? "Ray Tsai | Systems Engineer · Capital Motors, Inc." : "蔡承勳 | 系統工程師 · 中華賓士";
  var av = document.querySelector(".avatar"); if (av) av.alt = l === "en" ? "Ray Tsai" : "蔡承勳";
  var aw = document.querySelector(".award img"); if (aw) aw.alt = l === "en" ? "1st place, Education Open Data category, 25th InnoServe Awards" : "第 25 屆 InnoServe Awards 大專校院資訊應用服務創新競賽 教育開放資料組第一名";
  var dc = document.getElementById("deid-chips"); if (dc) dc.setAttribute("aria-label", l === "en" ? "Custom terms" : "自訂詞");
  if (window.onLangChange) window.onLangChange();
}
function setTheme(t) {
  root.dataset.theme = t;
  safe(() => localStorage.setItem("theme", t));
}

document.getElementById("lang").onclick = () => setLang(root.lang === "en" ? "zh" : "en");
document.getElementById("theme").onclick = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");
document.getElementById("year").textContent = new Date().getFullYear();

setTheme(safe(() => localStorage.getItem("theme")) || "dark");
const saved = safe(() => localStorage.getItem("lang"));
if (saved === "en") setLang("en");
