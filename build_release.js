const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = __dirname;
console.log('=== 開始編譯長庚大學線上函文製作系統 (Portal + Letters + Outsourcing) ===\n');

// -------------------------------------------------------------
// 1. 自動建置外包檢核表子專案 (Vite App)
// -------------------------------------------------------------
const outsourcingDir = path.join(baseDir, 'outsourcing');
if (fs.existsSync(outsourcingDir)) {
    console.log('[1/4] 正在建置外包檢核表系統 (Vite App)...');
    try {
        execSync('npm.cmd run build', { cwd: outsourcingDir, stdio: 'inherit' });
        console.log('      外包檢核表系統建置成功！\n');
    } catch (err) {
        console.warn('      [警告] outsourcing 建置警告，使用既有 dist:', err.message);
    }
}

// 取得最新 Vite 建置出來的 asset 檔名
const distDir = path.join(outsourcingDir, 'dist');
let outsourcingCssFile = '';
let outsourcingJsFile = '';
if (fs.existsSync(path.join(distDir, 'assets'))) {
    const assets = fs.readdirSync(path.join(distDir, 'assets'));
    outsourcingCssFile = assets.find(f => f.endsWith('.css')) || '';
    outsourcingJsFile = assets.find(f => f.endsWith('.js')) || '';
}

// -------------------------------------------------------------
// 2. 產出根目錄 outsourcing.html 及離線單檔版
// -------------------------------------------------------------
console.log('[2/4] 正在產出根目錄 outsourcing.html 及離線發布檔...');
if (outsourcingCssFile && outsourcingJsFile) {
    const outsourcingOnlineHtml = `<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>長庚大學 外包工作申請單作業檢核表系統 (v1.0)</title>
    <link rel="icon" type="image/svg+xml" href="./outsourcing/dist/favicon.svg" />
    <link rel="stylesheet" href="./outsourcing/dist/assets/${outsourcingCssFile}">
  </head>
  <body>
    <div id="root"></div>
    <script src="./outsourcing/dist/assets/${outsourcingJsFile}"></script>
  </body>
</html>`;
    fs.writeFileSync(path.join(baseDir, 'outsourcing.html'), outsourcingOnlineHtml, 'utf-8');
    console.log(`      ✓ outsourcing.html 產出完成 (${(Buffer.byteLength(outsourcingOnlineHtml) / 1024).toFixed(1)} KB)`);

    // 離線單檔版 (內嵌 CSS 與 JS，免連網零相依)
    const outCssContent = fs.readFileSync(path.join(distDir, 'assets', outsourcingCssFile), 'utf-8');
    const outJsContent = fs.readFileSync(path.join(distDir, 'assets', outsourcingJsFile), 'utf-8');
    const outsourcingOfflineHtml = `<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>長庚大學 外包工作申請單作業檢核表系統 (v1.0 離線單檔版)</title>
    <style>
${outCssContent}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
${outJsContent}
    </script>
  </body>
</html>`;
    fs.writeFileSync(path.join(baseDir, 'outsourcing_v1.0_offline.html'), outsourcingOfflineHtml, 'utf-8');
    console.log(`      ✓ outsourcing_v1.0_offline.html 產出完成 (${(Buffer.byteLength(outsourcingOfflineHtml) / 1024).toFixed(1)} KB)\n`);
}

// -------------------------------------------------------------
// 3. 編譯公函製作系統 (letters.html, letters_v1.0.html, letters_v1.0_offline.html)
// -------------------------------------------------------------
console.log('[3/4] 正在編譯公函製作系統發布版本...');
const devHtmlPath = path.join(baseDir, 'letters_dev1.html');
const devJsPath = path.join(baseDir, 'app_letters_dev1.js');
const cssPath = path.join(baseDir, 'index.css');
const guidePath = path.join(baseDir, 'user_guide_letters.html');
const lucidePath = path.join(baseDir, 'lucide.min.js');

const devHtml = fs.readFileSync(devHtmlPath, 'utf-8');
const css = fs.readFileSync(cssPath, 'utf-8');
const devJs = fs.readFileSync(devJsPath, 'utf-8');
const guideHtml = fs.readFileSync(guidePath, 'utf-8');
let lucideJs = '';
if (fs.existsSync(lucidePath)) {
    lucideJs = fs.readFileSync(lucidePath, 'utf-8');
}

// 處理指南 Modal
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
    /<a href="[^"]*" class="btn-action btn-print-hero">[\s\S]*?<\/a>/,
    '<button type="button" onclick="closeGuideModal()" class="btn-action btn-print-hero">返回系統操作</button>'
);

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
<!-- 內嵌離線使用指南 Modal (公函製作 v1.0 離線單檔版專用) -->
<div id="guide-modal-overlay" class="guide-modal-overlay" onclick="handleGuideOverlayClick(event)">
    <div class="guide-modal-window">
        <div class="guide-modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="help-circle" style="width: 20px; height: 20px; color: #f59e0b;"></i>
                <strong style="font-size: 1.05rem; letter-spacing: 0.5px;">長庚大學 線上函文製作系統 使用指南 (公函製作 v1.0 離線版)</strong>
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

// 3.1 線上正式版：letters.html
let lettersOnlineHtml = devHtml;
lettersOnlineHtml = lettersOnlineHtml.replace('<link rel="stylesheet" href="index.css">', `<style>\n/* --- Embedded index.css --- */\n${css}\n</style>`);
if (lucideJs) {
    lettersOnlineHtml = lettersOnlineHtml.replace(/<script src="(?:https:\/\/unpkg\.com\/lucide@latest|lucide\.min\.js)"><\/script>/, `<script>\n/* --- Embedded Lucide Icons --- */\n${lucideJs}\n</script>`);
}
lettersOnlineHtml = lettersOnlineHtml.replace(/v1\.0 Dev 1/g, 'v1.0 正式版');
lettersOnlineHtml = lettersOnlineHtml.replace(/<title>.*?<\/title>/, '<title>長庚大學 線上函文製作系統 (公函製作 v1.0)</title>');
let releaseJs = devJs.replace(/version: 'v1\.0 \(Dev 1\)'/, "version: 'v1.0'");
lettersOnlineHtml = lettersOnlineHtml.replace('<script src="app_letters_dev1.js"></script>', `<script>\n/* --- Embedded app_letters_dev1.js --- */\n${releaseJs}\n</script>`);

fs.writeFileSync(path.join(baseDir, 'letters.html'), lettersOnlineHtml, 'utf-8');
fs.writeFileSync(path.join(baseDir, 'letters_v1.0.html'), lettersOnlineHtml, 'utf-8'); // 里程碑存檔
console.log(`      ✓ letters.html 產出完成 (${(Buffer.byteLength(lettersOnlineHtml) / 1024).toFixed(1)} KB)`);
console.log(`      ✓ letters_v1.0.html 里程碑存檔完成`);

// 3.2 離線正式版：letters_v1.0_offline.html
let lettersOfflineHtml = devHtml;
lettersOfflineHtml = lettersOfflineHtml.replace('<link rel="stylesheet" href="index.css">', `<style>\n/* --- Embedded index.css --- */\n${css}\n${modalCss}\n</style>`);
if (lucideJs) {
    lettersOfflineHtml = lettersOfflineHtml.replace(/<script src="(?:https:\/\/unpkg\.com\/lucide@latest|lucide\.min\.js)"><\/script>/, `<script>\n/* --- Embedded Lucide Icons --- */\n${lucideJs}\n</script>`);
}
// 替換使用指南為彈窗
lettersOfflineHtml = lettersOfflineHtml.replace(
    /<a href="user_guide_letters\.html"[\s\S]*?<\/a>/,
    `<button type="button" class="btn btn-secondary" onclick="openGuideModal()" title="開啟內嵌使用指南 (免連網)"><i data-lucide="help-circle"></i><span>使用指南</span></button>`
);
// 替換下載按鈕為離線指示
lettersOfflineHtml = lettersOfflineHtml.replace(
    /<a id="btn-download-offline"[\s\S]*?<\/a>/,
    `<span class="btn btn-secondary" style="background: #f0fdf4; color: #166534; border-color: #bbf7d0; cursor: default;" title="本檔案為獨立單檔，無需連網即可離線使用"><i data-lucide="layers"></i><span>離線單檔版 (v1.0)</span></span>`
);
lettersOfflineHtml = lettersOfflineHtml.replace(/v1\.0 Dev 1/g, 'v1.0 離線版');
lettersOfflineHtml = lettersOfflineHtml.replace(/<title>.*?<\/title>/, '<title>長庚大學 線上函文製作系統 (公函製作 v1.0 離線單檔版)</title>');
lettersOfflineHtml = lettersOfflineHtml.replace('</body>', `${modalHtml}\n</body>`);
lettersOfflineHtml = lettersOfflineHtml.replace('<script src="app_letters_dev1.js"></script>', `<script>\n/* --- Embedded app_letters_dev1.js --- */\n${releaseJs}\n${modalJs}\n</script>`);

fs.writeFileSync(path.join(baseDir, 'letters_v1.0_offline.html'), lettersOfflineHtml, 'utf-8');
console.log(`      ✓ letters_v1.0_offline.html 產出完成 (${(Buffer.byteLength(lettersOfflineHtml) / 1024).toFixed(1)} KB)\n`);

// -------------------------------------------------------------
// 4. 產出中央門戶入口網 index.html (ode.cgu.edu.tw)
// -------------------------------------------------------------
console.log('[4/4] 正在產出中央門戶入口網 index.html...');
const portalHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>長庚大學 線上函文製作系統 | CGU Online Official Document Editor</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="lucide.min.js"></script>
    <style>
        :root {
            --primary: #E39800;
            --primary-hover: #C58000;
            --primary-light: #FFF8EB;
            --primary-border: #F6D38B;
            --slate-900: #0F172A;
            --slate-800: #1E293B;
            --slate-700: #334155;
            --slate-600: #475569;
            --slate-500: #64748B;
            --slate-100: #F1F5F9;
            --slate-50: #F8FAFC;
            --card-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
            --card-hover-shadow: 0 20px 30px -10px rgba(227, 152, 0, 0.18), 0 12px 15px -8px rgba(15, 23, 42, 0.08);
            --radius-xl: 16px;
            --radius-lg: 12px;
            --radius-md: 8px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Noto Sans TC', sans-serif;
            background-color: var(--slate-50);
            color: var(--slate-800);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* 頂端列 */
        .portal-header {
            background: #ffffff;
            border-bottom: 2px solid var(--primary);
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .header-container {
            max-width: 1240px;
            margin: 0 auto;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .logo-area {
            display: flex;
            align-items: center;
            gap: 14px;
            text-decoration: none;
            color: inherit;
        }

        .logo-text h1 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--slate-900);
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        }

        .logo-text h1 span {
            color: var(--primary);
            font-weight: 600;
        }

        .logo-text p {
            font-size: 0.78rem;
            color: var(--slate-500);
            letter-spacing: 0.3px;
        }

        .header-badges {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .domain-pill {
            background: var(--primary-light);
            border: 1px solid var(--primary-border);
            color: var(--primary-hover);
            font-size: 0.82rem;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 20px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        /* 主視覺 Hero 區域 */
        .hero-section {
            background: linear-gradient(135deg, #ffffff 0%, #fefcf8 50%, #f9fbfd 100%);
            border-bottom: 1px solid #E2E8F0;
            padding: 56px 24px 44px;
            text-align: center;
        }

        .hero-inner {
            max-width: 900px;
            margin: 0 auto;
        }

        .hero-tag {
            display: inline-block;
            background: rgba(227, 152, 0, 0.12);
            color: var(--primary-hover);
            font-size: 0.85rem;
            font-weight: 700;
            padding: 4px 14px;
            border-radius: 20px;
            margin-bottom: 16px;
            letter-spacing: 0.5px;
        }

        .hero-title {
            font-size: 2.25rem;
            font-weight: 800;
            color: var(--slate-900);
            margin-bottom: 14px;
            letter-spacing: -0.5px;
        }

        .hero-subtitle {
            font-size: 1.05rem;
            color: var(--slate-600);
            margin-bottom: 28px;
            line-height: 1.7;
        }

        /* 特色亮點列 */
        .features-pill-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 16px;
            margin-top: 10px;
        }

        .feat-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 0.88rem;
            font-weight: 500;
            color: var(--slate-700);
            background: #ffffff;
            padding: 8px 16px;
            border-radius: 30px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }

        .feat-pill i {
            color: var(--primary);
            width: 16px;
            height: 16px;
        }

        /* 系統模組卡片區 */
        .modules-section {
            max-width: 1200px;
            margin: -24px auto 60px;
            padding: 0 24px;
            width: 100%;
        }

        .cards-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 32px;
        }

        .module-card {
            background: #ffffff;
            border: 1px solid #E2E8F0;
            border-radius: var(--radius-xl);
            padding: 36px 32px;
            box-shadow: var(--card-shadow);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        }

        .module-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--card-hover-shadow);
            border-color: var(--primary-border);
        }

        .module-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .module-icon-box {
            width: 56px;
            height: 56px;
            border-radius: var(--radius-lg);
            background: var(--primary-light);
            border: 1px solid var(--primary-border);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-hover);
        }

        .module-icon-box i {
            width: 28px;
            height: 28px;
        }

        .version-badge {
            background: #10B981;
            color: #ffffff;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 12px;
            letter-spacing: 0.5px;
        }

        .module-card-body {
            flex: 1;
        }

        .module-title {
            font-size: 1.45rem;
            font-weight: 700;
            color: var(--slate-900);
            margin-bottom: 8px;
        }

        .module-subtext {
            font-size: 0.92rem;
            color: var(--primary-hover);
            font-weight: 500;
            margin-bottom: 16px;
        }

        .module-desc {
            font-size: 0.92rem;
            color: var(--slate-600);
            margin-bottom: 22px;
            line-height: 1.6;
        }

        .module-checklist {
            list-style: none;
            margin-bottom: 30px;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .module-checklist li {
            font-size: 0.88rem;
            color: var(--slate-700);
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }

        .module-checklist li i {
            color: #10B981;
            width: 17px;
            height: 17px;
            flex-shrink: 0;
            margin-top: 2px;
        }

        /* 按鈕組 */
        .card-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: auto;
        }

        .btn-launch {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: var(--primary);
            color: #ffffff;
            font-size: 1rem;
            font-weight: 700;
            padding: 13px 20px;
            border-radius: var(--radius-md);
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 10px rgba(227, 152, 0, 0.25);
        }

        .btn-launch:hover {
            background: var(--primary-hover);
            transform: translateY(-1px);
            box-shadow: 0 6px 14px rgba(227, 152, 0, 0.35);
        }

        .btn-offline {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: #F0FDF4;
            color: #166534;
            border: 1px solid #BBF7D0;
            font-size: 0.88rem;
            font-weight: 600;
            padding: 10px 16px;
            border-radius: var(--radius-md);
            text-decoration: none;
            transition: all 0.2s ease;
        }

        .btn-offline:hover {
            background: #DCFCE7;
            border-color: #86EFAC;
            color: #14532D;
        }

        .card-footer-links {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 14px;
            padding-top: 12px;
            border-top: 1px dashed #E2E8F0;
            font-size: 0.82rem;
        }

        .card-footer-links a {
            color: var(--slate-500);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: color 0.15s;
        }

        .card-footer-links a:hover {
            color: var(--primary-hover);
        }

        /* 隱私承諾與說明橫幅 */
        .info-section {
            max-width: 1200px;
            margin: 0 auto 50px;
            padding: 0 24px;
            width: 100%;
        }

        .info-card {
            background: #ffffff;
            border: 1px solid #E2E8F0;
            border-radius: var(--radius-lg);
            padding: 24px 30px;
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .info-icon {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: #EFF6FF;
            color: #2563EB;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .info-text h3 {
            font-size: 1rem;
            font-weight: 700;
            color: var(--slate-900);
            margin-bottom: 4px;
        }

        .info-text p {
            font-size: 0.88rem;
            color: var(--slate-600);
        }

        /* 頁尾 */
        .portal-footer {
            background: #ffffff;
            border-top: 1px solid #E2E8F0;
            margin-top: auto;
            padding: 28px 24px;
            text-align: center;
            font-size: 0.85rem;
            color: var(--slate-500);
        }

        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .footer-dept-row {
            display: flex;
            justify-content: center;
            gap: 20px;
            color: var(--slate-600);
            font-weight: 500;
        }

        @media (max-width: 820px) {
            .cards-grid {
                grid-template-columns: 1fr;
            }
            .hero-title {
                font-size: 1.85rem;
            }
            .info-card {
                flex-direction: column;
                text-align: center;
            }
        }
    </style>
</head>
<body>

    <!-- 頂端導航列 -->
    <header class="portal-header">
        <div class="header-container">
            <a href="index.html" class="logo-area">
                <svg viewBox="0 0 100 100" width="38" height="38">
                    <polygon points="50,15 90,35 50,55 10,35" fill="#E39800" />
                    <polygon points="50,55 50,90 90,70 90,35" fill="#C58000" />
                    <polygon points="50,55 10,35 10,70 50,90" fill="#F3A91A" />
                    <path d="M50,40 L65,55 L55,55 L55,75 L45,75 L45,55 L35,55 Z" fill="#FFFFFF" />
                </svg>
                <div class="logo-text">
                    <h1>長庚大學 <span>線上函文製作系統</span></h1>
                    <p>CGU Online Official Document Editor</p>
                </div>
            </a>
            <div class="header-badges">
                <span class="domain-pill" title="校內專屬正式網域">
                    <i data-lucide="globe"></i> ode.cgu.edu.tw
                </span>
            </div>
        </div>
    </header>

    <!-- 主視覺 Hero -->
    <section class="hero-section">
        <div class="hero-inner">
            <span class="hero-tag">🏫 長庚大學教職員專屬公文平台 · v1.0 正式版</span>
            <h2 class="hero-title">高擬真、高效率的公務文書線上製作環境</h2>
            <p class="hero-subtitle">
                專為長庚大學行政作業打造，整合公函製作與外包工作檢核表雙系統。<br>
                純前端即開即用，無需安裝繁雜外掛，嚴格遵循單頁 A4 規格、精準排版、支援一鍵高清列印與獨立單檔離線使用。
            </p>
            <div class="features-pill-row">
                <div class="feat-pill"><i data-lucide="shield-check"></i> 本地純前端運算 · 公文絕不上傳伺服器</div>
                <div class="feat-pill"><i data-lucide="file-check"></i> 嚴格遵循長庚規範 · A4 單頁與 14/16pt 字級</div>
                <div class="feat-pill"><i data-lucide="printer"></i> 支援瀏覽器高清套印與另存 PDF</div>
                <div class="feat-pill"><i data-lucide="download"></i> 完整離線單檔支援 · 斷網環境隨點即用</div>
            </div>
        </div>
    </section>

    <!-- 系統功能卡片模組 -->
    <main class="modules-section">
        <div class="cards-grid">
            
            <!-- 卡片 1: 公函製作系統 -->
            <article class="module-card">
                <div class="module-card-header">
                    <div class="module-icon-box">
                        <i data-lucide="file-text"></i>
                    </div>
                    <span class="version-badge">v1.0 正式版</span>
                </div>
                <div class="module-card-body">
                    <h3 class="module-title">線上公函製作系統</h3>
                    <p class="module-subtext">上行文 · 平行文 / 下行文 · 業務接洽便函</p>
                    <p class="module-desc">
                        專為學校各級處室、系所與院長室研擬之官方公函編輯系統。提供主旨說明置頂、正副本雙欄對照、常用公函用語快速插入與左側編輯字級彈性縮放。
                    </p>
                    <ul class="module-checklist">
                        <li><i data-lucide="check"></i> 完整支援 3 大公文類別（上行文函/稿、平下行文、便函）</li>
                        <li><i data-lucide="check"></i> 編輯區全域字級切換（14px～24px），標籤與選單全面連動</li>
                        <li><i data-lucide="check"></i> A4 右側高擬真即時排版，支援挪抬空格語法提示</li>
                        <li><i data-lucide="check"></i> 支援 JSON 草稿匯出/匯入備份與自動本機暫存</li>
                    </ul>
                </div>
                <div class="card-actions">
                    <a href="letters.html" class="btn-launch">
                        <i data-lucide="external-link"></i> 進入公函製作系統
                    </a>
                    <a href="letters_v1.0_offline.html" download="長庚大學線上函文製作系統_公函離線版(v1.0).html" class="btn-offline" title="下載單一獨立 HTML 檔案，免連網即可全功能使用">
                        <i data-lucide="download"></i> 下載公函離線單檔 (免連網)
                    </a>
                </div>
                <div class="card-footer-links">
                    <a href="user_guide_letters.html" target="_blank"><i data-lucide="book-open"></i> 查閱公函使用手冊</a>
                    <span>開發版: <a href="letters_dev1.html">letters_dev1.html</a></span>
                </div>
            </article>

            <!-- 卡片 2: 外包工作檢核表系統 -->
            <article class="module-card">
                <div class="module-card-header">
                    <div class="module-icon-box">
                        <i data-lucide="clipboard-check"></i>
                    </div>
                    <span class="version-badge">v1.0 正式版</span>
                </div>
                <div class="module-card-body">
                    <h3 class="module-title">外包工作申請單作業檢核表系統</h3>
                    <p class="module-subtext">資訊安全法遵 · 智慧財產權 · 資產與勞務外包檢核</p>
                    <p class="module-desc">
                        針對長庚大學外包工作申請作業，提供符合學校單頁 A4 嚴格規範與 14pt 標準字體之檢核表產製工具。支援設備資產比例自動試算與智慧填報防呆。
                    </p>
                    <ul class="module-checklist">
                        <li><i data-lucide="check"></i> 嚴格遵循單頁 A4 直式/橫式與 14pt 字體法規標準</li>
                        <li><i data-lucide="check"></i> 自動試算外包維護佔原購資產比例與勞務採購分級規範</li>
                        <li><i data-lucide="check"></i> 內建續外包、首度外包、純勞務等 3 組官方範本一鍵載入</li>
                        <li><i data-lucide="check"></i> 純前端直接輸出 PDF 或瀏覽器高清列印</li>
                    </ul>
                </div>
                <div class="card-actions">
                    <a href="outsourcing.html" class="btn-launch">
                        <i data-lucide="external-link"></i> 進入外包檢核表系統
                    </a>
                    <a href="outsourcing_v1.0_offline.html" download="長庚大學外包工作申請單作業檢核表系統_離線版(v1.0).html" class="btn-offline" title="下載獨立離線 HTML 單檔">
                        <i data-lucide="download"></i> 下載檢核表離線單檔 (免連網)
                    </a>
                </div>
                <div class="card-footer-links">
                    <span>符合長庚大學外包標準規範</span>
                    <span>獨立單檔發布</span>
                </div>
            </article>

        </div>
    </main>

    <!-- 隱私與技術承諾 -->
    <section class="info-section">
        <div class="info-card">
            <div class="info-icon">
                <i data-lucide="lock"></i>
            </div>
            <div class="info-text">
                <h3>嚴格純前端架構 · 零資料上傳承諾</h3>
                <p>
                    本系統所有公文撰寫、檢核表計算與 PDF 排版運算皆在您的本機瀏覽器內部執行，本站不設任何資料庫，亦絕不會將任何公文文字或受文者資訊傳輸至任何雲端或第三方伺服器，請安心使用。
                </p>
            </div>
        </div>
    </section>

    <!-- 頁尾 -->
    <footer class="portal-footer">
        <div class="footer-content">
            <div class="footer-dept-row">
                <span>主管單位：長庚大學 總務處文書組</span>
                <span>技術支援：長庚大學 資訊處</span>
                <span>校內正式網址：ode.cgu.edu.tw</span>
            </div>
            <p>長庚大學 線上函文製作系統 · CGU Online Official Document Editor · © 2026 版權所有</p>
            <p style="font-size: 0.78rem; color: #94A3B8; margin-top: 4px;">
                歷史版本封存參照：<a href="index_beta7.html" style="color: #94A3B8; text-decoration: underline;">Beta 7 線上穩定版</a> · <a href="index_beta7off.html" style="color: #94A3B8; text-decoration: underline;">Beta 7 離線版</a> · <a href="index_beta6.html" style="color: #94A3B8; text-decoration: underline;">Beta 6 開發版</a>
            </p>
        </div>
    </footer>

    <script>
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(baseDir, 'index.html'), portalHtml, 'utf-8');
console.log(`      ✓ index.html (Portal) 產出完成 (${(Buffer.byteLength(portalHtml) / 1024).toFixed(1)} KB)\n`);

console.log('=== 全部版本編譯發布完畢！ ===');
