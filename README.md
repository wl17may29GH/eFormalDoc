# 長庚大學 線上函文製作系統 (CGU Online Official Document Editor)

[![Portal Live](https://img.shields.io/badge/GitHub%20Pages-Live%20Online-brightgreen)](https://wl17may29gh.github.io/eFormalDoc/)
[![Domain](https://img.shields.io/badge/School%20Domain-ode.cgu.edu.tw-blue)](https://wl17may29gh.github.io/eFormalDoc/)
[![Version](https://img.shields.io/badge/Release-v1.0%20正式版-orange)](https://wl17may29gh.github.io/eFormalDoc/)
[![Client-Only](https://img.shields.io/badge/Security-100%25%20Pure%20Client--Side-success)](https://wl17may29gh.github.io/eFormalDoc/)

專為長庚大學教職員與行政作業研擬之官方文書線上製作平台。採用純前端架構、無需安裝額外外掛、公文內容絕不上傳伺服器，嚴格遵守標準單頁 A4 規格與學校公函排版規範，支援一鍵高清列印、另存 PDF 與斷網離線單檔操作。

---

## 🌐 線上正式發布網址

- **中央入口門戶（Portal Gateway）**：[https://wl17may29gh.github.io/eFormalDoc/](https://wl17may29gh.github.io/eFormalDoc/)
- **校內申請中網址**：`ode.cgu.edu.tw`
- **線上公函製作系統**：[https://wl17may29gh.github.io/eFormalDoc/letters.html](https://wl17may29gh.github.io/eFormalDoc/letters.html)
- **外包工作檢核表系統**：[https://wl17may29gh.github.io/eFormalDoc/outsourcing.html](https://wl17may29gh.github.io/eFormalDoc/outsourcing.html)
- **公函操作使用指南**：[https://wl17may29gh.github.io/eFormalDoc/user_guide_letters.html](https://wl17may29gh.github.io/eFormalDoc/user_guide_letters.html)

---

## 🏛️ 系統兩大核心功能模組

```
                                 ┌────────────────────────┐
                                 │   中央門戶入口網       │
                                 │      index.html        │
                                 │   (ode.cgu.edu.tw)     │
                                 └───────────┬────────────┘
                                             │
                    ┌────────────────────────┴────────────────────────┐
                    ▼                                                 ▼
     ┌─────────────────────────────┐                   ┌─────────────────────────────┐
     │   模組一：線上公函製作系統  │                   │  模組二：外包工作檢核表系統 │
     │        letters.html         │                   │       outsourcing.html      │
     └─────────────────────────────┘                   └─────────────────────────────┘
      • 類別1: 教育部上行文(函/稿)                      • 首次外包 / 續外包重新發包
      • 類別2: 校外機構平下行文                         • 維護特定標的(資產) / 純勞務案
      • 類別3: 校內業務接洽便函                         • 共同檢核 7 項 + 專屬獨立項目
      • 主旨說明置頂、正副本雙欄對照                    • 自動計算年度維護費資產占比
      • 挪抬空格提示、字級彈性切換                      • A4 橫式精準排版、單行防折行
```

### 1. 線上公函製作系統 (`letters.html`)
- **適用範圍**：教育部上行文函/稿、校外平行文、下行文、校內業務接洽便函。
- **人因工程佈局**：公文類別置頂選擇、核心「主旨與說明」開頁即用、次要卡片自動智慧摺疊。
- **全域字級調整**：支援 14px ～ 24px 彈性縮放，標籤、註解、選單與填寫欄位全域連動。
- **高擬真排版**：紅色公文外框線切換、挪抬空格語法提示、A4 直式精準單頁套印。

### 2. 外包工作申請單作業檢核表 (`outsourcing.html`)
- **適用範圍**：全校外包工作申請單作業初審與秘書室呈報檢核。
- **雙軌智慧適配**：發包類型（首次外包 / 續外包重新發包）、標的性質（固定資產保養 / 日常勞務承攬）。
- **業務規則自動化**：
  - 外包申請時效：已提前辦理自動隱藏延遲警語；未提前自動提供延遲原因填寫與對照。
  - 報價單與固定資產取得價值：自動四捨五入計算百分比占比（取至小數點後第 1 位）。
  - 單獨檢核其他事項：勾選後直接顯示填寫內容，未勾選整項隱藏略過。
- **固定唯一橫式標準版型**：項目欄寬加大（310px），確保套印與預覽單行顯示不折行。

---

## 📁 專案架構與檔案配置（方案 A 發布 ＋ 選項 2 數字版控）

```
eFormalDoc/
│
├── 🌐 中央門戶入口
│   └── index.html                       <-- 學校官方門戶首頁 (ode.cgu.edu.tw)
│
├── ✉️ 模組一：公函製作系統 (Letters)
│   ├── letters.html                     <-- 線上正式版（單檔發布，免依賴）
│   ├── letters_v1.0.html                <-- v1.0 正式版里程碑存檔
│   ├── letters_v1.0_offline.html        <-- 離線正式單檔版（內嵌使用指南 Modal）
│   ├── letters_dev1.html                <-- 本機開發版 Dev 1
│   ├── app_letters_dev1.js              <-- 本機開發用邏輯腳本
│   └── user_guide_letters.html          <-- 公函操作功能說明與使用手冊
│
├── 📋 模組二：外包工作檢核表 (Outsourcing)
│   ├── outsourcing.html                 <-- 線上正式版（入口網直接進入）
│   ├── outsourcing_v1.0_offline.html    <-- 離線正式單檔版（內嵌全量 CSS/JS）
│   └── outsourcing/                     <-- 原始碼與 Vite 構建工程
│       ├── src/
│       │   ├── App.jsx                  <-- 應用主核心（橫式預覽、左右拖曳）
│       │   ├── components/
│       │   │   ├── HeaderNav.jsx        <-- 頂端導航與跨系統跳轉
│       │   │   ├── FormControls.jsx     <-- 填寫表單面板與各卡片
│       │   │   └── A4PreviewLandscape.jsx <-- 橫式 A4 擬真排版核心
│       │   ├── constants/
│       │   │   └── formPresets.js       <-- 公文範本常數資料
│       │   └── utils/
│       │       ├── validation.js        <-- 檢核規則與占比計算
│       │       └── pdfExport.js         <-- PDF 匯出與列印配置
│       └── dist/                        <-- Vite 打包產物（支援本地 file:/// 雙擊）
│
├── 📜 歷史穩定版本存檔 (Beta 6 / 7)
│   ├── index_beta6.html / app_beta6.js  <-- Beta 6 開發版封存
│   ├── index_beta7.html                 <-- Beta 7 線上穩定版封存
│   └── index_beta7off.html              <-- Beta 7 離線版封存
│
├── 🛠️ 自動化編譯發布腳本
│   └── build_release.js                 <-- 自動構建 Vite、封裝單檔發布與更新入口網
│
└── 📖 專案說明文件
    └── README.md
```

---

## 🚀 本地開發與自動建置指南

### 1. 複製專案
```bash
git clone https://github.com/wl17may29GH/eFormalDoc.git
cd eFormalDoc
```

### 2. 安裝外包子專案依賴
```bash
cd outsourcing
npm install
cd ..
```

### 3. 一鍵自動編譯全發布版本
在專案根目錄執行建置腳本，將自動完成 Vite 打包、產出 `outsourcing.html`、封裝 `outsourcing_v1.0_offline.html`、更新 `letters.html` 及發布門戶 `index.html`：
```bash
node build_release.js
```

---

## 🔒 資訊安全與隱私承諾

- **零伺服器傳輸**：系統採用 100% 純前端技術（HTML5、CSS3、Vanilla JS、React），完全不設有後端資料庫。
- **本地端資料保密**：草稿儲存僅保存在使用者的瀏覽器 `LocalStorage`，不經過任何外部雲端。
- **斷網離線可用**：提供離線單檔版本（`letters_v1.0_offline.html` 與 `outsourcing_v1.0_offline.html`），可存於隨身碟在完全無網路的機密環境雙擊使用。

---

## 📄 版權與維護宣告

- **版權所有**：© 2026 長庚大學（Chang Gung University）
- **開發維護**：長庚大學行政公文數位化團隊
- **系統代碼**：[https://github.com/wl17may29GH/eFormalDoc](https://github.com/wl17may29GH/eFormalDoc)
