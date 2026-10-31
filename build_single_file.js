const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const htmlPath = path.join(baseDir, 'index_beta6.html');
const cssPath = path.join(baseDir, 'index.css');
const jsPath = path.join(baseDir, 'app_beta6.js');
const lucidePath = path.join(baseDir, 'lucide.min.js');
const guidePath = path.join(baseDir, 'user_guide_beta6.html');
const outputPath = path.join(baseDir, 'cgu_formal_doc_offline.html');
const beta7Path = path.join(baseDir, 'index_beta7.html');

console.log('Building standalone single-file offline version (Beta 7)...');

let html = fs.readFileSync(htmlPath, 'utf-8');
const css = fs.readFileSync(cssPath, 'utf-8');
const js = fs.readFileSync(jsPath, 'utf-8');
let lucideJs = '';
if (fs.existsSync(lucidePath)) {
    lucideJs = fs.readFileSync(lucidePath, 'utf-8');
}
const guideHtml = fs.readFileSync(guidePath, 'utf-8');

// 1. Extract Guide Styles and Body
const guideStyleMatch = guideHtml.match(/<style>([\s\S]*?)<\/style>/);
let guideCss = guideStyleMatch ? guideStyleMatch[1] : '';
// Remove print styles from guide CSS since modal is hidden in print anyway
guideCss = guideCss.replace(/@media print\s*\{[\s\S]*?\}\s*\}/g, '');
// Scope body styling to .guide-modal-body to avoid overriding main app body
guideCss = guideCss.replace(/\bbody\s*\{/g, '.guide-modal-body {');
guideCss = guideCss.replace(/\*\s*\{/g, '.guide-modal-window * {');

// Extract Guide Content (everything inside <div class="guide-container">...</div>)
const guideStart = guideHtml.indexOf('<div class="guide-container">');
const guideEnd = guideHtml.lastIndexOf('</div>');
let guideContent = '';
if (guideStart !== -1 && guideEnd !== -1) {
    guideContent = guideHtml.substring(guideStart, guideEnd + 6);
}
// In guide content, replace "開啟 Beta 6 系統操作" link with button that closes modal
guideContent = guideContent.replace(
    /<a href="index_beta6\.html" class="btn-action btn-print-hero">[\s\S]*?<\/a>/,
    '<button type="button" onclick="closeGuideModal()" class="btn-action btn-print-hero">返回系統操作</button>'
);

// 2. Modal Overlay CSS & HTML
const modalCss = `
/* --- Embedded User Guide Modal Styles --- */
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

// 3. Assemble standalone Beta 7 HTML
// A. Replace external CSS with inlined index.css + modal CSS
html = html.replace('<link rel="stylesheet" href="index.css">', `<style>\n/* --- Embedded index.css --- */\n${css}\n${modalCss}\n</style>`);

// B. Replace Lucide CDN with inlined script
if (lucideJs) {
    html = html.replace('<script src="https://unpkg.com/lucide@latest"></script>', `<script>\n/* --- Embedded Lucide Icons --- */\n${lucideJs}\n</script>`);
}

// C. Replace "使用指南" link with modal button in Beta 7
html = html.replace(
    /<a href="user_guide_beta6\.html"[\s\S]*?<\/a>/,
    `<button type="button" class="btn btn-secondary" onclick="openGuideModal()" title="開啟內嵌使用指南 (免連網)" style="display: inline-flex; align-items: center; gap: 4px;">
        <i data-lucide="help-circle"></i> 使用指南
    </button>`
);

// D. Replace "下載離線版" button in Beta 7 with "已為離線單檔版" indicator badge
html = html.replace(
    /<a id="btn-download-offline"[\s\S]*?<\/a>/,
    `<span class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 4px; background: #f0fdf4; color: #166534; border-color: #bbf7d0; cursor: default;" title="本檔案為獨立單檔，無需連網即可離線使用">
        <i data-lucide="layers"></i> 離線單檔版 (Beta 7)
    </span>`
);

// E. Update version numbers to Beta 7
html = html.replace(/Beta 6/g, 'Beta 7');
html = html.replace(/<title>長庚大學 線上函文製作系統 \(Beta 7\)<\/title>/, '<title>長庚大學 線上函文製作系統 (Beta 7 離線單檔版)</title>');

// F. Insert Modal HTML before </body>
html = html.replace('</body>', `${modalHtml}\n</body>`);

// G. Replace external app_beta6.js with inlined app_beta6.js + modalJs
let beta7Js = js.replace(/version: 'Beta 6'/, "version: 'Beta 7'");
html = html.replace('<script src="app_beta6.js"></script>', `<script>\n/* --- Embedded app_beta6.js --- */\n${beta7Js}\n${modalJs}\n</script>`);

// Write to cgu_formal_doc_offline.html and index_beta7.html
fs.writeFileSync(outputPath, html, 'utf-8');
fs.writeFileSync(beta7Path, html, 'utf-8');

console.log(`Beta 7 standalone generated at: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
console.log(`Beta 7 standalone mirror at: ${beta7Path} (${(fs.statSync(beta7Path).size / 1024).toFixed(1)} KB)`);
