# Personal Website

純靜態個人網站（HTML / CSS / JS，無需建置），支援中英切換與深色模式。

## 修改內容
1. 搜尋 `your-id`、`you@example.com` 換成你的資料
2. 換掉 `assets/avatar.jpg`
3. 英文版文字在 `script.js` 的 `dict.en`；中文版直接寫在 `index.html`
4. 分享預覽圖使用 `assets/og-image.png`（1200×627 的純文字圖），要改文字可重新製作同尺寸圖片取代

## 互動示範
- `demo.js`：報表匯入監測（虛構資料）
- `deid.js`：可還原去識別化的簡化示範，全部在瀏覽器內執行、不上傳資料，範例皆為虛構。這只是展示用，不是去識別化工具本體（本體規劃為本機離線執行，放在獨立 repo）。

## 個人儀表板
資料檔都在 `data/`，儀表板（`dashboard.js`）讀取後渲染；檔案為空或格式不符時，對應卡片會自動隱藏。
- `now.json`：近況（手動維護）
- `music.json`：YouTube Music 公開播放清單連結
- `budget.json`：預算比例（手動維護，**只放比例，不放金額與明細**；欄位 `updated`、`used_pct`、`categories[{zh,en,pct}]`、`trend[{month,used_pct}]`）
- `watchlist.json`：股市要追蹤的大盤與自選股（只放關注標的，不放持股）
- `github.json`、`stocks.json`：由 GitHub Actions（`.github/workflows/update-dashboard.yml`）每天自動產生，請勿手動修改
- 天氣：開啟頁面時直接向 Open-Meteo 取得（免金鑰），地點座標在 `dashboard.js` 的 `WX_URL`

## 部署（GitHub Pages）
Settings → Pages → Deploy from a branch → 選 main / root。網址：`https://ray8806.github.io/Personal-website/`

## SEO 與圖示
- 網站圖示：`assets/favicon.svg`、`assets/apple-touch-icon.png`
- 搜尋引擎：`robots.txt`、`sitemap.xml`，以及 `index.html` 內的結構化資料（JSON-LD）

## 放到 LinkedIn
- Profile → Contact info → Website，貼上網址
- 或在 Featured 區塊新增連結；貼文分享時會用 og 標籤產生預覽卡
