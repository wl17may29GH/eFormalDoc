document.addEventListener('DOMContentLoaded', () => {
    // Lucide Icons initialization with safety check
    if (typeof lucide !== 'undefined') {
        try {
            lucide.createIcons();
        } catch (e) {
            console.error("Lucide failed to initialize", e);
        }
    }

    // DOM Elements - Form controls
    const docForm = document.getElementById('doc-form');
    const paDocMode = document.getElementById('pa-doc-mode');
    const paUsageMode = document.getElementById('pa-usage-mode');
    const editorFontSizeSelect = document.getElementById('editor-font-size-select');
    const previewModeSelect = document.getElementById('preview-mode-select');
    const toggleLivePreview = document.getElementById('toggle-live-preview');
    const btnRefreshPreview = document.getElementById('btn-refresh-preview');
    const toggleGrid = document.getElementById('toggle-grid');
    const editorPanel = document.querySelector('.editor-panel');
    const a4Sheet = document.getElementById('a4-sheet');

    // Cards
    const cardSend = document.getElementById('card-send');
    const cardReply = document.getElementById('card-reply');

    // Toolbar Buttons
    const btnNew = document.getElementById('btn-new');
    const btnDemo = document.getElementById('btn-demo');
    const btnExport = document.getElementById('btn-export');
    const btnImportTrigger = document.getElementById('btn-import-trigger');
    const fileImport = document.getElementById('file-import');
    const btnPrint = document.getElementById('btn-print');

    // Drag Resizer & Zoom Slider
    const dragBar = document.getElementById('drag-bar');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomValue = document.getElementById('zoom-value');
    let userHasManuallyZoomed = false;

    // Live preview state & debounce timer
    let isLivePreview = localStorage.getItem('cgu_formal_doc_live_preview') !== 'false';
    let previewDebounceTimer = null;

    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Tokenize text into atomic units: currency, dates, numbers, English words, punctuation, and CJK characters
    function tokenizeText(text) {
        if (!text) return [];
        const tokenRegex = /(?:新[臺台]幣|NT\$|\$)?[\d,]+(?:\.\d+)?元(?:整)?|(?:民國)?\d+年(?:度)?|\d{1,2}月|\d{1,2}日|\d+(?:[,\.]\d+)+|[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*|\s+|./gu;
        return text.match(tokenRegex) || [];
    }

    // Protect dates, numbers, currency amounts, and English words from being truncated across lines
    function protectNoBreak(text) {
        if (!text) return '';
        const tokens = tokenizeText(text);
        return tokens.map(t => {
            const isAtomic = t.length > 1 && !/^\s+$/.test(t);
            const escaped = escapeHTML(t);
            return isAtomic ? `<span class="no-break">${escaped}</span>` : escaped;
        }).join('');
    }

    function formatHTML(text) {
        if (!text) return '';
        return escapeHTML(text).replace(/\n/g, '<br>');
    }

    // Calculate dynamic marker width and responsive level styling classes for outline items
    function getMarkerInfo(level, marker) {
        let emWidth = 0;
        for (const c of marker) {
            emWidth += c.charCodeAt(0) < 128 ? 0.5 : 1.0;
        }
        
        let markerWidthClass = 'expl-marker-w2';
        let levelClass = `expl-level-${level}`;
        let bodyClass = `expl-paragraph expl-level-${level}-body`;
        
        if (level === 1) {
            if (emWidth > 2.0) {
                markerWidthClass = 'expl-marker-w3';
                levelClass = 'expl-level-1-w3';
                bodyClass = 'expl-paragraph expl-level-1-w3-body';
            } else {
                markerWidthClass = 'expl-marker-w2';
                levelClass = 'expl-level-1';
                bodyClass = 'expl-paragraph expl-level-1-body';
            }
        } else if (level === 2) {
            if (emWidth >= 3.5) {
                markerWidthClass = 'expl-marker-w4';
                levelClass = 'expl-level-2-w4';
                bodyClass = 'expl-paragraph expl-level-2-w4-body';
            } else if (emWidth > 2.0) {
                markerWidthClass = 'expl-marker-w3';
                levelClass = 'expl-level-2-w3';
                bodyClass = 'expl-paragraph expl-level-2-w3-body';
            } else {
                markerWidthClass = 'expl-marker-w2';
                levelClass = 'expl-level-2';
                bodyClass = 'expl-paragraph expl-level-2-body';
            }
        } else if (level === 3) {
            if (emWidth > 2.0) {
                markerWidthClass = 'expl-marker-w3';
                levelClass = 'expl-level-3-w3';
                bodyClass = 'expl-paragraph expl-level-3-w3-body';
            } else if (emWidth > 1.5) {
                markerWidthClass = 'expl-marker-w2';
                levelClass = 'expl-level-3-w2';
                bodyClass = 'expl-paragraph expl-level-3-w2-body';
            } else {
                markerWidthClass = 'expl-marker-w15';
                levelClass = 'expl-level-3';
                bodyClass = 'expl-paragraph expl-level-3-body';
            }
        } else if (level === 4) {
            if (emWidth > 2.0) {
                markerWidthClass = 'expl-marker-w3';
                levelClass = 'expl-level-4-w3';
                bodyClass = 'expl-paragraph expl-level-4-w3-body';
            } else if (emWidth > 1.5) {
                markerWidthClass = 'expl-marker-w2';
                levelClass = 'expl-level-4-w2';
                bodyClass = 'expl-paragraph expl-level-4-w2-body';
            } else {
                markerWidthClass = 'expl-marker-w15';
                levelClass = 'expl-level-4';
                bodyClass = 'expl-paragraph expl-level-4-body';
            }
        } else if (level === 5) {
            if (emWidth > 2.0) {
                markerWidthClass = 'expl-marker-w3';
                levelClass = 'expl-level-5-w3';
                bodyClass = 'expl-paragraph expl-level-5-w3-body';
            } else {
                markerWidthClass = 'expl-marker-w2';
                levelClass = 'expl-level-5';
                bodyClass = 'expl-paragraph expl-level-5-body';
            }
        } else if (level === 6) {
            if (emWidth > 2.0) {
                markerWidthClass = 'expl-marker-w3';
                levelClass = 'expl-level-6-w3';
                bodyClass = 'expl-paragraph expl-level-6-w3-body';
            } else {
                markerWidthClass = 'expl-marker-w2';
                levelClass = 'expl-level-6';
                bodyClass = 'expl-paragraph expl-level-6-body';
            }
        }
        
        return { markerWidthClass, levelClass, bodyClass };
    }

    // Check if explanation has outline points
    function checkHasPoints(text) {
        if (!text) return false;
        const lines = text.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (/^[一二三四五六七八九十百]+[、]/.test(trimmed) ||
                /^[(（][一二三四五六七八九十百]+[)）]/.test(trimmed) ||
                /^\d+[、]/.test(trimmed) ||
                /^[(（]\d+[)）]/.test(trimmed) ||
                /^[甲乙丙丁戊己庚辛壬癸]+[、]/.test(trimmed) ||
                /^[(（][甲乙丙丁戊己庚辛壬癸]+[)）]/.test(trimmed)) {
                return true;
            }
        }
        return false;
    }

    // Convert explanation text to HTML, supporting hanging indent blocks for numbered points (Level 1-6)
    function formatExplanationHTML(text, hasPoints) {
        if (!text) return '';
        
        const lines = text.split('\n');
        let currentLevel = 0;
        let currentBodyClass = '';
        
        return lines.map(line => {
            const trimmed = line.trim();
            if (hasPoints) {
                let detectedLevel = 0;
                let marker = '';
                let content = line;
                
                // Level 1: 一、
                if (/^[一二三四五六七八九十百]+[、]/.test(trimmed)) {
                    detectedLevel = 1;
                    const match = line.match(/^(\s*)([一二三四五六七八九十百]+[、])(.*)/);
                    if (match) {
                        marker = match[2];
                        content = match[3];
                    }
                }
                // Level 2: (一)
                else if (/^[(（][一二三四五六七八九十百]+[)）]/.test(trimmed)) {
                    detectedLevel = 2;
                    const match = line.match(/^(\s*)([(（][一二三四五六七八九十百]+[)）])(.*)/);
                    if (match) {
                        marker = match[2];
                        content = match[3];
                    }
                }
                // Level 3: 1、
                else if (/^\d+[、]/.test(trimmed)) {
                    detectedLevel = 3;
                    const match = line.match(/^(\s*)(\d+[、])(.*)/);
                    if (match) {
                        marker = match[2];
                        content = match[3];
                    }
                }
                // Level 4: (1)
                else if (/^[(（]\d+[)）]/.test(trimmed)) {
                    detectedLevel = 4;
                    const match = line.match(/^(\s*)([(（]\d+[)）])(.*)/);
                    if (match) {
                        marker = match[2];
                        content = match[3];
                    }
                }
                // Level 5: 甲、
                else if (/^[甲乙丙丁戊己庚辛壬癸]+[、]/.test(trimmed)) {
                    detectedLevel = 5;
                    const match = line.match(/^(\s*)([甲乙丙丁戊己庚辛壬癸]+[、])(.*)/);
                    if (match) {
                        marker = match[2];
                        content = match[3];
                    }
                }
                // Level 6: (甲)
                else if (/^[(（][甲乙丙丁戊己庚辛壬癸]+[)）]/.test(trimmed)) {
                    detectedLevel = 6;
                    const match = line.match(/^(\s*)([(（][甲乙丙丁戊己庚辛壬癸]+[)）])(.*)/);
                    if (match) {
                        marker = match[2];
                        content = match[3];
                    }
                }
                
                if (detectedLevel > 0) {
                    currentLevel = detectedLevel;
                    const markerInfo = getMarkerInfo(detectedLevel, marker);
                    currentBodyClass = markerInfo.bodyClass;
                    const escapedMarker = escapeHTML(marker);
                    const protectedContent = protectNoBreak(content);
                    return `<div class="expl-paragraph ${markerInfo.levelClass}"><span class="${markerInfo.markerWidthClass}">${escapedMarker}</span>${protectedContent}</div>`;
                } else {
                    if (currentLevel > 0 && currentBodyClass) {
                        return `<div class="${currentBodyClass}">${protectNoBreak(line)}</div>`;
                    } else {
                        return `<div class="expl-paragraph">${protectNoBreak(line)}</div>`;
                    }
                }
            } else {
                return `<div class="expl-paragraph">${protectNoBreak(line)}</div>`;
            }
        }).join('');
    }

    // Prepopulate date automatically with current ROC date
    function initDate() {
        const today = new Date();
        const rocYear = today.getFullYear() - 1911;
        const month = today.getMonth() + 1;
        const day = today.getDate();

        const yEl = document.getElementById('pa-date-year');
        const mEl = document.getElementById('pa-date-month');
        const dEl = document.getElementById('pa-date-day');
        if (yEl) yEl.value = rocYear;
        if (mEl) mEl.value = month;
        if (dEl) dEl.value = day;

        const paddedMonth = String(month).padStart(2, '0');
        const defaultSerial = `${rocYear}${paddedMonth}01`;
        const serialEl = document.getElementById('pa-id-serial');
        if (serialEl && !serialEl.value) {
            serialEl.value = defaultSerial;
        }
    }

    // Mode & Usage sync
    function syncUsageUI() {
        const usage = paUsageMode ? paUsageMode.value : 'send';
        if (usage === 'send') {
            if (cardSend) {
                cardSend.classList.remove('section-muted');
                cardSend.style.display = 'block';
            }
            if (cardReply) {
                cardReply.classList.add('section-muted');
            }
        } else if (usage === 'reply') {
            if (cardSend) {
                cardSend.classList.add('section-muted');
            }
            if (cardReply) {
                cardReply.classList.remove('section-muted');
                cardReply.style.display = 'block';
            }
        } else {
            // both
            if (cardSend) {
                cardSend.classList.remove('section-muted');
                cardSend.style.display = 'block';
            }
            if (cardReply) {
                cardReply.classList.remove('section-muted');
                cardReply.style.display = 'block';
            }
        }
    }

    // Live preview mode controller
    function setLivePreviewMode(isLive, shouldSyncNow = false) {
        isLivePreview = !!isLive;
        localStorage.setItem('cgu_formal_doc_live_preview', isLivePreview ? 'true' : 'false');
        if (previewModeSelect) {
            previewModeSelect.value = isLivePreview ? 'live' : 'manual';
        }
        if (toggleLivePreview) {
            toggleLivePreview.checked = isLivePreview;
        }
        if (btnRefreshPreview) {
            if (isLivePreview) {
                btnRefreshPreview.classList.remove('btn-primary');
                btnRefreshPreview.classList.add('btn-secondary');
                btnRefreshPreview.title = '即時模式：隨時可點擊強制更新預覽';
            } else {
                btnRefreshPreview.classList.remove('btn-secondary');
                btnRefreshPreview.classList.add('btn-primary');
                btnRefreshPreview.title = '手動模式：點擊立即更新預覽';
            }
        }
        if (shouldSyncNow) {
            if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
            syncPreview();
        }
    }

    // Auto-fit dynamic proportional font scaling for main content box (主旨 + 說明) within fixed 68mm height
    function autoFitContentBox(boxEl) {
        if (!boxEl) return;
        
        // Reset styles first to measure base layout at standard 12pt
        boxEl.style.fontSize = '';
        boxEl.style.lineHeight = '';
        
        const clientH = boxEl.clientHeight;
        if (clientH <= 0) return;
        
        // Font sizes to test in descending order (pt)
        const fontSizes = [12, 11.5, 11, 10.5, 10, 9.5, 9, 8.5, 8, 7.5, 7];
        
        for (let i = 0; i < fontSizes.length; i++) {
            const sz = fontSizes[i];
            boxEl.style.fontSize = `${sz}pt`;
            const lh = sz <= 8.5 ? 1.25 : (sz <= 10 ? 1.3 : 1.35);
            boxEl.style.lineHeight = `${lh}`;
            
            // If scrollHeight fits within clientHeight, we found optimal font size
            if (boxEl.scrollHeight <= clientH + 1) {
                break;
            }
        }
    }

    // Sync input fields to preview pane
    function syncPreview() {
        try {
            // 1. Table 1: Top Metadata Info
            const cat = document.getElementById('pa-category').value;
            const catA = document.getElementById('p-pa-cat-A');
            const catB = document.getElementById('p-pa-cat-B');
            const catC = document.getElementById('p-pa-cat-C');
            if (catA) catA.textContent = (cat === 'A') ? '✓' : '';
            if (catB) catB.textContent = (cat === 'B') ? '✓' : '';
            if (catC) catC.textContent = (cat === 'C') ? '✓' : '';

            // Title: 稿 vs 正式發文 (Requirement 4: 單行置中、無多餘空格、無上下邊框)
            const mode = paDocMode ? paDocMode.value : 'A';
            const mainTitle = document.getElementById('p-pa-main-title');
            if (mainTitle) {
                mainTitle.textContent = (mode === 'A') ? '業務接洽便函(稿)' : '業務接洽便函';
            }

            const secrecy = document.getElementById('pa-secrecy').value;
            const secYes = document.getElementById('p-pa-sec-yes');
            const secNo = document.getElementById('p-pa-sec-no');
            if (secYes) secYes.textContent = (secrecy === '機密') ? '✓' : '';
            if (secNo) secNo.textContent = (secrecy === '非機密') ? '✓' : '';

            const closeDateInput = document.getElementById('pa-close-date');
            const closeDate = (closeDateInput && closeDateInput.value.trim()) ? closeDateInput.value : '　　年　　月　　日';
            const days = document.getElementById('pa-days').value || '3';
            const years = document.getElementById('pa-years').value || '5年';
            const docNum = document.getElementById('pa-doc-num').value || '';

            const pCloseDate = document.getElementById('p-pa-close-date');
            const pDays = document.getElementById('p-pa-days');
            const pYears = document.getElementById('p-pa-years');
            const pDocNum = document.getElementById('p-pa-doc-num');
            if (pCloseDate) pCloseDate.textContent = closeDate;
            if (pDays) pDays.textContent = days;
            if (pYears) pYears.textContent = years;
            if (pDocNum) pDocNum.textContent = docNum;

            // Serial Row (Requirement 5: 單行發文字號)
            const yearVal = document.getElementById('pa-date-year').value || '115';
            const monthVal = document.getElementById('pa-date-month').value || '10';
            const dayVal = document.getElementById('pa-date-day').value || '10';
            const serialVal = document.getElementById('pa-id-serial').value || '1150001';

            const pDateRoc = document.getElementById('p-pa-date-roc');
            const pIdSerial = document.getElementById('p-pa-id-serial');
            if (pDateRoc) pDateRoc.textContent = `${yearVal} 年 ${monthVal} 月 ${dayVal} 日`;
            if (pIdSerial) pIdSerial.textContent = `　${serialVal}　`;

            // 2. Upper Block: 發文段 (Requirement 6: 左右分離、標題固定、內容自適應)
            const sendReceiver = document.getElementById('pa-send-receiver').value || '（受文者）';
            const sendSubject = document.getElementById('pa-send-subject').value || '';
            const sendExplanation = document.getElementById('pa-send-explanation').value || '';
            const sendDept = document.getElementById('pa-send-dept').value || '';
            const sendPerson = document.getElementById('pa-send-person').value || '';
            const sendPhone = document.getElementById('pa-send-phone').value || '';
            const sendAttachment = document.getElementById('pa-send-attachment').value || '無';
            const sendReplyStatus = document.getElementById('pa-send-reply-status').value || '待覆';
            const sendReplyDate = document.getElementById('pa-send-reply-date').value || '月　日';

            const pSendReceiver = document.getElementById('p-pa-send-receiver');
            const pSendSubject = document.getElementById('p-pa-send-subject');
            const pSendExplanation = document.getElementById('p-pa-send-explanation');
            const pSendDept = document.getElementById('p-pa-send-dept');
            const pSendPerson = document.getElementById('p-pa-send-person');
            const pSendPhone = document.getElementById('p-pa-send-phone');
            const pSendAttachment = document.getElementById('p-pa-send-attachment');
            const pStatusFree = document.getElementById('p-pa-status-free');
            const pStatusWait = document.getElementById('p-pa-status-wait');
            const pSendReplyDate = document.getElementById('p-pa-send-reply-date');

            if (pSendReceiver) pSendReceiver.textContent = sendReceiver;
            if (pSendSubject) pSendSubject.innerHTML = protectNoBreak(sendSubject);
            const sendHasPoints = checkHasPoints(sendExplanation);
            const sendExplWrapper = document.getElementById('p-pa-send-expl-wrapper');
            if (sendExplWrapper) {
                if (sendHasPoints) {
                    sendExplWrapper.classList.remove('layout-side-by-side');
                    sendExplWrapper.classList.add('layout-stacked');
                } else {
                    sendExplWrapper.classList.remove('layout-stacked');
                    sendExplWrapper.classList.add('layout-side-by-side');
                }
            }
            if (pSendExplanation) pSendExplanation.innerHTML = formatExplanationHTML(sendExplanation, sendHasPoints);
            if (pSendDept) pSendDept.textContent = sendDept;
            if (pSendPerson) pSendPerson.textContent = sendPerson;
            if (pSendPhone) pSendPhone.textContent = sendPhone;
            if (pSendAttachment) pSendAttachment.textContent = sendAttachment;
            if (pStatusFree) pStatusFree.textContent = sendReplyStatus === '免覆' ? '■免覆' : '□免覆';
            if (pStatusWait) pStatusWait.textContent = sendReplyStatus === '待覆' ? '■待覆' : '□待覆';
            if (pSendReplyDate) pSendReplyDate.textContent = sendReplyDate;

            // 3. Lower Block: 覆文段 (Requirement 6: 左右分離、標題固定、內容自適應)
            const replyReceiver = document.getElementById('pa-reply-receiver').value || '';
            const replySubject = document.getElementById('pa-reply-subject').value || '';
            const replyExplanation = document.getElementById('pa-reply-explanation').value || '';
            const replyDept = document.getElementById('pa-reply-dept').value || '';
            const replyPerson = document.getElementById('pa-reply-person').value || '';
            const replyPhone = document.getElementById('pa-reply-phone').value || '';
            const replyAttachment = document.getElementById('pa-reply-attachment').value || '無';
            const replyCloseStatus = document.getElementById('pa-reply-close-status').value || '銷案';
            const replyDate = document.getElementById('pa-reply-date').value || '月　日';
            const recvTime = document.getElementById('pa-recv-time').value || '　年　月　日　時　分';
            const replyId = document.getElementById('pa-reply-id').value || '　年　月　日　字第　號';

            const pReplyReceiver = document.getElementById('p-pa-reply-receiver');
            const pReplySubject = document.getElementById('p-pa-reply-subject');
            const pReplyExplanation = document.getElementById('p-pa-reply-explanation');
            const pReplyDept = document.getElementById('p-pa-reply-dept');
            const pReplyPerson = document.getElementById('p-pa-reply-person');
            const pReplyPhone = document.getElementById('p-pa-reply-phone');
            const pReplyAttachment = document.getElementById('p-pa-reply-attachment');
            const pReplyStatusClose = document.getElementById('p-pa-reply-status-close');
            const pReplyStatusWait = document.getElementById('p-pa-reply-status-wait');
            const pReplyDateVal = document.getElementById('p-pa-reply-date-val');
            const pRecvTime = document.getElementById('p-pa-recv-time');
            const pReplyId = document.getElementById('p-pa-reply-id');

            if (pReplyReceiver) pReplyReceiver.textContent = replyReceiver || '（受文者）';
            if (pReplySubject) pReplySubject.innerHTML = protectNoBreak(replySubject);
            const replyHasPoints = checkHasPoints(replyExplanation);
            const replyExplWrapper = document.getElementById('p-pa-reply-expl-wrapper');
            if (replyExplWrapper) {
                if (replyHasPoints) {
                    replyExplWrapper.classList.remove('layout-side-by-side');
                    replyExplWrapper.classList.add('layout-stacked');
                } else {
                    replyExplWrapper.classList.remove('layout-stacked');
                    replyExplWrapper.classList.add('layout-side-by-side');
                }
            }
            if (pReplyExplanation) pReplyExplanation.innerHTML = formatExplanationHTML(replyExplanation, replyHasPoints);
            if (pReplyDept) pReplyDept.textContent = replyDept;
            if (pReplyPerson) pReplyPerson.textContent = replyPerson;
            if (pReplyPhone) pReplyPhone.textContent = replyPhone;
            if (pReplyAttachment) pReplyAttachment.textContent = replyAttachment;
            if (pReplyStatusClose) pReplyStatusClose.textContent = replyCloseStatus === '銷案' ? '■銷案' : '□銷案';
            if (pReplyStatusWait) pReplyStatusWait.textContent = replyCloseStatus === '待覆' ? '■待覆' : '□待覆';
            if (pReplyDateVal) pReplyDateVal.textContent = replyDate || '月　日';

            // Requirement 5: 收文時間及覆文字號兩行分開呈現
            if (pRecvTime) pRecvTime.textContent = recvTime;
            if (pReplyId) pReplyId.textContent = replyId;

            // Requirement 2: 主要說明欄(主旨+說明) 依固定68mm高度自動最佳化等比例縮小字體
            const sendMainBox = document.getElementById('p-pa-send-main-box');
            const replyMainBox = document.getElementById('p-pa-reply-main-box');
            if (sendMainBox) autoFitContentBox(sendMainBox);
            if (replyMainBox) autoFitContentBox(replyMainBox);

            syncUsageUI();
            adjustPreviewScale();
            saveDraft();
        } catch (e) {
            console.error("syncPreview error:", e);
        }
    }

    // Auto save all field values to LocalStorage
    function saveDraft() {
        const formData = {};
        const inputs = docForm.querySelectorAll('input, select, textarea');
        inputs.forEach(el => {
            if (el.id) {
                formData[el.id] = el.value;
            }
        });
        localStorage.setItem('cgu_formal_doc_draft_v4', JSON.stringify(formData));
    }

    // Apply Demo Data
    function applyDemoData() {
        initDate();
        document.getElementById('pa-category').value = 'A';
        document.getElementById('pa-secrecy').value = '非機密';
        document.getElementById('pa-days').value = '3';
        document.getElementById('pa-years').value = '5年';
        document.getElementById('pa-doc-num').value = 'CGU-2026-0089';
        document.getElementById('pa-close-date').value = '';
        document.getElementById('pa-id-serial').value = '1150001';

        // Upper: Send段
        document.getElementById('pa-send-receiver').value = '總務處文書組';
        document.getElementById('pa-send-subject').value = '洽請協助進行115學年度新進教師公文系統權限設定開通事宜。';
        document.getElementById('pa-send-explanation').value = '一、本校預計於8月新增教師3名，需提早開通公文製作系統。\n二、檢附新進教師名單與處室對照表各乙份。';
        document.getElementById('pa-send-dept').value = '資訊處軟體發展組';
        document.getElementById('pa-send-person').value = '王小明';
        document.getElementById('pa-send-phone').value = '3601';
        document.getElementById('pa-send-attachment').value = '新進教師名單.xlsx';
        document.getElementById('pa-send-reply-status').value = '待覆';
        document.getElementById('pa-send-reply-date').value = '8月25日';

        // Lower: Reply段
        document.getElementById('pa-reply-receiver').value = '資訊處軟體發展組';
        document.getElementById('pa-reply-subject').value = '已完成115學年度新進教師公文系統權限設定開通，請 查照。';
        document.getElementById('pa-reply-explanation').value = '一、依 貴單位8月17日庚大業洽字第1150001號便函辦理。\n二、系統帳號密碼已以電子郵件寄送予各新進教師，即可登入使用。';
        document.getElementById('pa-reply-dept').value = '總務處文書組';
        document.getElementById('pa-reply-person').value = '李四';
        document.getElementById('pa-reply-phone').value = '3401';
        document.getElementById('pa-reply-attachment').value = '無';
        document.getElementById('pa-reply-close-status').value = '銷案';
        document.getElementById('pa-reply-date').value = '';
        document.getElementById('pa-recv-time').value = '115年8月18日10時00分';
        document.getElementById('pa-reply-id').value = '115年8月18日總大字第115000023號';
    }

    // Load Draft from LocalStorage
    function loadDraft() {
        const draftJSON = localStorage.getItem('cgu_formal_doc_draft_v4');
        if (draftJSON) {
            try {
                const data = JSON.parse(draftJSON);
                Object.keys(data).forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.value = data[id];
                    }
                });
            } catch (e) {
                console.error("Failed to load draft v4", e);
            }
        } else {
            applyDemoData();
        }
        setLivePreviewMode(localStorage.getItem('cgu_formal_doc_live_preview') !== 'false', false);
        syncUsageUI();
        syncPreview();
    }

    // Debounced form input handler
    function handleFormInput() {
        saveDraft();
        if (isLivePreview) {
            if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
            previewDebounceTimer = setTimeout(() => {
                syncPreview();
            }, 250);
        }
    }

    // Bindings
    docForm.addEventListener('input', handleFormInput);
    docForm.addEventListener('change', (e) => {
        if (e.target === paDocMode || e.target === paUsageMode) {
            syncUsageUI();
            syncPreview();
        } else if (e.target !== previewModeSelect) {
            handleFormInput();
        }
    });

    if (previewModeSelect) {
        previewModeSelect.addEventListener('change', () => {
            const isLive = previewModeSelect.value === 'live';
            setLivePreviewMode(isLive, isLive);
        });
    }

    if (toggleLivePreview) {
        toggleLivePreview.addEventListener('change', () => {
            const isLive = toggleLivePreview.checked;
            setLivePreviewMode(isLive, isLive);
        });
    }

    if (btnRefreshPreview) {
        btnRefreshPreview.addEventListener('click', () => {
            if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
            syncPreview();
        });
    }

    if (toggleGrid) {
        toggleGrid.addEventListener('change', () => {
            if (!a4Sheet) return;
            if (toggleGrid.checked) {
                a4Sheet.classList.add('show-grid');
            } else {
                a4Sheet.classList.remove('show-grid');
            }
        });
    }

    // Preset Phrase insertion listeners
    document.querySelectorAll('.phrase-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            const phrase = e.target.getAttribute('data-phrase');
            const targetId = e.target.getAttribute('data-target') || 'pa-send-subject';
            const textarea = document.getElementById(targetId);
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = textarea.value;
                textarea.value = text.substring(0, start) + phrase + text.substring(end);
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = start + phrase.length;
                handleFormInput();
            }
        });
    });

    // Detect double spaces in explanations
    ['pa-send-explanation', 'pa-reply-explanation'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('paste', (e) => {
                const pastedData = (e.clipboardData || window.clipboardData).getData('text');
                if (pastedData.includes('  ') || pastedData.includes('　　')) {
                    alert('業務接洽便函版型欄位已自動對齊，無須手動鍵入連續空白鍵排版。');
                }
            });
        }
    });

    // Toolbar button listeners
    if (btnDemo) {
        btnDemo.addEventListener('click', () => {
            if (confirm("確定要載入業務接洽便函的模擬範例資料嗎？這將會覆蓋目前的編輯內容。")) {
                applyDemoData();
                syncPreview();
            }
        });
    }

    if (btnNew) {
        btnNew.addEventListener('click', () => {
            if (confirm("確定要建立新便函嗎？這將會清除目前的編輯內容。")) {
                localStorage.removeItem('cgu_formal_doc_draft_v4');
                docForm.reset();
                initDate();
                setLivePreviewMode(localStorage.getItem('cgu_formal_doc_live_preview') !== 'false', true);
            }
        });
    }

    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const draftJSON = localStorage.getItem('cgu_formal_doc_draft_v4');
            if (!draftJSON) return;

            const blob = new Blob([draftJSON], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const d = new Date();
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            const dateStr = `${yyyy}${mm}${dd}${hh}${min}`;

            let subjectVal = (document.getElementById('pa-send-subject').value || '業務接洽便函').trim();
            subjectVal = subjectVal.replace(/[\\/:*?"<>|\r\n]/g, ' ').trim().substring(0, 40);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${dateStr}_便函_${subjectVal}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (btnImportTrigger && fileImport) {
        btnImportTrigger.addEventListener('click', () => {
            fileImport.click();
        });

        fileImport.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = evt.target.result;
                    localStorage.setItem('cgu_formal_doc_draft_v4', data);
                    loadDraft();
                    alert("便函草稿匯入成功！");
                } catch (err) {
                    alert("匯入失敗，請確認檔案格式是否正確。");
                }
            };
            reader.readAsText(file);
        });
    }

    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            window.print();
        });
    }

    // Zoom and Scale
    function adjustPreviewScale() {
        const previewPanelEl = document.querySelector('.preview-panel');
        if (!a4Sheet || !previewPanelEl) return;

        const availableWidth = previewPanelEl.clientWidth - 48; // padding
        const sheetNaturalWidth = 794; // approx 210mm in 96dpi

        let scale = availableWidth / sheetNaturalWidth;
        if (scale > 1.3) scale = 1.3;
        if (scale < 0.5) scale = 0.5;

        if (userHasManuallyZoomed && zoomSlider) {
            scale = parseFloat(zoomSlider.value) / 100;
        } else if (zoomSlider && zoomValue) {
            const pct = Math.round(scale * 100);
            zoomSlider.value = pct;
            zoomValue.textContent = `${pct}%`;
        }

        a4Sheet.style.transform = `scale(${scale})`;
        a4Sheet.style.transformOrigin = 'top center';
    }

    if (zoomSlider && zoomValue) {
        zoomSlider.addEventListener('input', () => {
            userHasManuallyZoomed = true;
            zoomValue.textContent = `${zoomSlider.value}%`;
            adjustPreviewScale();
        });

        zoomSlider.addEventListener('dblclick', () => {
            userHasManuallyZoomed = false;
            adjustPreviewScale();
        });
    }

    // Drag Resizer between Left and Right Panels
    if (dragBar && editorPanel) {
        let isDragging = false;

        dragBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragBar.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const containerWidth = document.querySelector('.app-container').clientWidth;
            let percentage = (e.clientX / containerWidth) * 100;
            if (percentage < 25) percentage = 25;
            if (percentage > 75) percentage = 75;

            editorPanel.style.width = `${percentage}%`;
            adjustPreviewScale();
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                dragBar.classList.remove('dragging');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                adjustPreviewScale();
            }
        });
    }

    // Editor Font Size adjust listener
    if (editorFontSizeSelect && editorPanel) {
        editorFontSizeSelect.addEventListener('change', () => {
            editorPanel.style.setProperty('--editor-font-size', `${editorFontSizeSelect.value}px`);
        });
        editorPanel.style.setProperty('--editor-font-size', `${editorFontSizeSelect.value}px`);
    }

    window.addEventListener('resize', adjustPreviewScale);

    // Initialization
    loadDraft();
});
