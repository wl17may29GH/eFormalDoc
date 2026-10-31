const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const htmlPath = path.join(baseDir, 'index_beta6.html');
const cssPath = path.join(baseDir, 'index.css');
const jsPath = path.join(baseDir, 'app_beta6.js');
const lucidePath = path.join(baseDir, 'lucide.min.js');
const guidePath = path.join(baseDir, 'user_guide_beta6.html');

// 輸出規範：
// 1. 正式發布線上版：奇數號 (index_beta7.html)
// 2. 正式發布離線下載版：奇數號+off (index_beta7off.html)
const beta7OnlinePath = path.join(baseDir, 'index_beta7.html');
const beta7OfflinePath = path.join(baseDir, 'index_beta7off.html');
const legacyOfflinePath = path.join(baseDir, 'cgu_formal_doc_offline.html');

console.log('=== 開始編譯雙軌發布版本 ===');

const baseHtml = fs.readFileSync(htmlPath, 'utf-8');
const css = fs.readFileSync(cssPath, 'utf-8');
const js = fs.readFileSync(jsPath, 'utf-8');
let lucideJs = '';
if (fs.existsSync(lucidePath)) {
    lucideJs = fs.readFileSync(lucidePath, 'utf-8');
}
const guideHtml = fs.readFileSync(guidePath, 'utf-8');

// 1. 處理使用指南樣式與內嵌 HTML (離線版專用)
const guideStyleMatch = guideHtml.match(/<style>([\s\S]*?)<\/style>/);
let guideCss = guideStyleMatch ? guideStyleMatch[1] : '';
guideCss = guideCss.replace(/@media print\s*\{[\s\S]*?\}\s*\}/g, '');
guideCss = guideCss.replace(/\bbody\s*\{/g, '.guide-modal-body {');
guideCss = guideCss.replace(/\*\s*\{/g, '.guide-modal-window * {');

const guideStart = guideHtml.indexOf('<div class="guide-container">');
const guideEnd = guideHtml.lastIndexOf('</div>');
let guideContent = '';
if (guideStart !== -1 && guideEnd !== -1) {
    guideContent = guideHtml.substring(guideStart, guideEnd + 6);
}
guideContent = guideContent.replace(
    /<a href="index_beta6\.html" class="btn-action btn-print-hero">[\s\S]*?<\/a>/,
    '<button type="button" onclick="closeGuideModal()" class="btn-action btn-print-hero">返回系統操作</button>'
);

// 離線指南 Modal 樣式
const modalCss = `
/* --- Embedded User Guide Modal Styles (Offline Release) --- */
.guide-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(4px);
    z-index: 999999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
}
.guide-modal-window {
    background: #f8fafc;
    width: 100%;
    max-width: 1080px;
    height: 92vh;
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #cbd5e1;
}
.guide-modal-header {
    background: #1e293b;
    color: #f8fafc;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.btn-close-modal {
    background: #ef4444;
    color: #ffffff;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.88rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.btn-close-modal:hover {
    background: #dc2626;
}
.guide-modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px 32px 48px 32px;
    scroll-behavior: smooth;
}
@media print {
    .guide-modal-overlay {
        display: none !important;
    }
}
${guideCss}
`;

const modalHtml = `
<!-- 內嵌離線使用指南 Modal (Beta 7 離線單檔版專用) -->
<div id="guide-modal-overlay" class="guide-modal-overlay" onclick="handleGuideOverlayClick(event)">
    <div class="guide-modal-window">
        <div class="guide-modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="help-circle" style="width: 20px; height: 20px; color: #f59e0b;"></i>
                <strong style="font-size: 1.05rem; letter-spacing: 0.5px;">長庚大學 線上函文製作系統 使用指南 (Beta 7 離線版)</strong>
            </div>
            <button type="button" class="btn-close-modal" onclick="closeGuideModal()" title="關閉指南 (Esc)">✕ 關閉指南</button>
        </div>
        <div class="guide-modal-body" id="guide-modal-body">
            ${guideContent}
        </div>
    </div>
</div>
`;

const modalJs = `
/* --- Guide Modal Control --- */
function openGuideModal() {
    const modal = document.getElementById('guide-modal-overlay');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}
function closeGuideModal() {
    const modal = document.getElementById('guide-modal-overlay');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}
function handleGuideOverlayClick(e) {
    if (e.target && e.target.id === 'guide-modal-overlay') {
        closeGuideModal();
    }
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGuideModal();
});
`;

// ============================================================
// 二、編譯【正式發布線上版】：index_beta7.html
// 包含內嵌 CSS + JS (避免快取衝突)，提供下載 index_beta7off.html 按鈕
// ============================================================
let onlineHtml = baseHtml;
onlineHtml = onlineHtml.replace('<link rel="stylesheet" href="index.css">', `<style>\n/* --- Embedded index.css --- */\n${css}\n</style>`);
if (lucideJs) {
    onlineHtml = onlineHtml.replace('<script src="https://unpkg.com/lucide@latest"></script>', `<script>\n/* --- Embedded Lucide Icons --- */\n${lucideJs}\n</script>`);
}
onlineHtml = onlineHtml.replace(/Beta 6/g, 'Beta 7');
// 線上版確保下載按鈕指向 index_beta7off.html
onlineHtml = onlineHtml.replace(
    /href="[^"]*"\s+download="[^"]*"/,
    'href="index_beta7off.html" download="長庚大學線上函文製作系統_離線版(Beta7).html"'
);
let beta7OnlineJs = js.replace(/version: 'Beta 6'/, "version: 'Beta 7'");
onlineHtml = onlineHtml.replace('<script src="app_beta6.js"></script>', `<script>\n/* --- Embedded app_beta6.js --- */\n${beta7OnlineJs}\n</script>`);

fs.writeFileSync(beta7OnlinePath, onlineHtml, 'utf-8');
console.log(`[1] 正式發布線上版完成: ${beta7OnlinePath} (${(fs.statSync(beta7OnlinePath).size / 1024).toFixed(1)} KB)`);

// ============================================================
// 三、編譯【正式發布離線下載版】：index_beta7off.html
// 包含內嵌 CSS + JS + 內嵌離線使用指南 Modal，獨立單檔免連網
// ============================================================
let offlineHtml = baseHtml;
offlineHtml = offlineHtml.replace('<link rel="stylesheet" href="index.css">', `<style>\n/* --- Embedded index.css --- */\n${css}\n${modalCss}\n</style>`);
if (lucideJs) {
    offlineHtml = offlineHtml.replace('<script src="https://unpkg.com/lucide@latest"></script>', `<script>\n/* --- Embedded Lucide Icons --- */\n${lucideJs}\n</script>`);
}
// 使用指南替換為彈窗觸發鈕
offlineHtml = offlineHtml.replace(
    /<a href="user_guide_beta6\.html"[\s\S]*?<\/a>/,
    `<button type="button" class="btn btn-secondary" onclick="openGuideModal()" title="開啟內嵌使用指南 (免連網)" style="display: inline-flex; align-items: center; gap: 4px;">
        <i data-lucide="help-circle"></i> 使用指南
    </button>`
);
// 下載按鈕替換為離線狀態指示徽章
offlineHtml = offlineHtml.replace(
    /<a id="btn-download-offline"[\s\S]*?<\/a>/,
    `<span class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 4px; background: #f0fdf4; color: #166534; border-color: #bbf7d0; cursor: default;" title="本檔案為獨立單檔，無需連網即可離線使用">
        <i data-lucide="layers"></i> 離線單檔版 (Beta 7)
    </span>`
);
offlineHtml = offlineHtml.replace(/Beta 6/g, 'Beta 7');
offlineHtml = offlineHtml.replace(/<title>長庚大學 線上函文製作系統 \(Beta 7\)<\/title>/, '<title>長庚大學 線上函文製作系統 (Beta 7 離線單檔版)</title>');
offlineHtml = offlineHtml.replace('</body>', `${modalHtml}\n</body>`);

let beta7OfflineJs = js.replace(/version: 'Beta 6'/, "version: 'Beta 7'");
offlineHtml = offlineHtml.replace('<script src="app_beta6.js"></script>', `<script>\n/* --- Embedded app_beta6.js --- */\n${beta7OfflineJs}\n${modalJs}\n</script>`);

fs.writeFileSync(beta7OfflinePath, offlineHtml, 'utf-8');
fs.writeFileSync(legacyOfflinePath, offlineHtml, 'utf-8'); // 相容舊檔名
console.log(`[2] 正式發布離線下載版完成: ${beta7OfflinePath} (${(fs.statSync(beta7OfflinePath).size / 1024).toFixed(1)} KB)`);
console.log('=== 編譯發布完畢 ===');
