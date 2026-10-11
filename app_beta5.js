document.addEventListener('DOMContentLoaded', () => {
    // Lucide Icons initialization with safety check
    function initLucide() {
        if (typeof lucide !== 'undefined') {
            try {
                lucide.createIcons();
            } catch (e) {
                console.error("Lucide failed to initialize", e);
            }
        }
    }
    initLucide();

    // ==========================================
    // DOM Elements
    // ==========================================
    // Document Config & Category / Mode
    const docCategorySelect = document.getElementById('doc-category-select');
    const docModeSelect = document.getElementById('doc-mode-select');
    const upReceiverManualGroup = document.getElementById('up-receiver-manual-group');
    const upReceiverManual = document.getElementById('up-receiver-manual');
    const paUsageModeGroup = document.getElementById('pa-usage-mode-group');
    const paUsageMode = document.getElementById('pa-usage-mode');
    const editorFontSizeSelect = document.getElementById('editor-font-size-select');
    const previewModeSelect = document.getElementById('preview-mode-select');
    const toggleLivePreview = document.getElementById('toggle-live-preview');
    const btnRefreshPreview = document.getElementById('btn-refresh-preview');
    const toggleGrid = document.getElementById('toggle-grid');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomValue = document.getElementById('zoom-value');
    const previewToolbarTitle = document.getElementById('preview-toolbar-title');

    // Panels
    const panelFormalDoc = document.getElementById('panel-formal-doc');
    const panelContactLetter = document.getElementById('panel-contact-letter');
    const cardMeta = document.getElementById('card-meta');
    const cardSend = document.getElementById('card-send');
    const cardReply = document.getElementById('card-reply');
    const docForm = document.getElementById('doc-form');

    // Preview Container & Templates
    const container = document.getElementById('a4-sheet-container');
    const tmplFormalDoc = document.getElementById('tmpl-formal-doc-page');
    const tmplContactLetter = document.getElementById('tmpl-contact-letter-page');

    // Header Toolbar Buttons
    const btnDemo = document.getElementById('btn-demo');
    const btnNew = document.getElementById('btn-new');
    const btnExport = document.getElementById('btn-export');
    const btnImportTrigger = document.getElementById('btn-import-trigger');
    const fileImport = document.getElementById('file-import');
    const btnPrint = document.getElementById('btn-print');

    // State
    let isLivePreview = true;
    let previewDebounceTimer = null;
    let hasWarnedMoe = false;

    // ==========================================
    // String & Text Formatting Utilities
    // ==========================================
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

    // Convert newlines to breaks and escape HTML, protecting dates, numbers, and words
    function formatHTML(text) {
        if (!text) return '';
        const lines = text.split('\n');
        return lines.map(line => protectNoBreak(line)).join('<br>');
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
            if (/^(\[分頁\]|【分頁】|\[pagebreak\])$/i.test(trimmed)) {
                return '<div class="expl-pagebreak-marker" style="display: none;"></div>';
            }
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

    // Auto-fit dynamic proportional font scaling for main content box (主旨 + 說明) within fixed 84mm height
    function autoFitContentBox(boxEl) {
        if (!boxEl) return;
        
        boxEl.style.fontSize = '';
        boxEl.style.lineHeight = '';
        
        const clientH = boxEl.clientHeight;
        if (clientH <= 0) return;
        
        const fontSizes = [12, 11.5, 11, 10.5, 10, 9.5, 9, 8.5, 8, 7.5, 7];
        
        for (let i = 0; i < fontSizes.length; i++) {
            const sz = fontSizes[i];
            boxEl.style.fontSize = `${sz}pt`;
            const lh = sz <= 8.5 ? 1.25 : (sz <= 10 ? 1.3 : 1.35);
            boxEl.style.lineHeight = `${lh}`;
            
            if (boxEl.scrollHeight <= clientH + 1) {
                break;
            }
        }
    }

    // Auto-detect orphan characters on the last line of paragraphs and adjust letter spacing
    function adjustElementOrphans(el) {
        if (!el) return;
        const text = el.textContent || '';
        if (text.length < 5) return;

        const originalHTML = el.innerHTML;
        const markerSpan = el.querySelector('[class^="expl-marker-"]');
        let textToSplit = '';
        let markerHTML = '';
        if (markerSpan) {
            markerHTML = markerSpan.outerHTML;
            textToSplit = text.substring(markerSpan.textContent.length);
        } else {
            textToSplit = text;
        }

        const tokens = tokenizeText(textToSplit);
        if (tokens.length <= 1) return;

        el.innerHTML = markerHTML + tokens.map(t => {
            const isAtomic = t.length > 1 && !/^\s+$/.test(t);
            const escaped = escapeHTML(t);
            return isAtomic ? `<span class="no-break">${escaped}</span>` : `<span>${escaped}</span>`;
        }).join('');

        const spans = el.querySelectorAll(':scope > span:not([class^="expl-marker-"])');
        if (spans.length === 0) {
            el.innerHTML = originalHTML;
            return;
        }

        function getLastLineInfo() {
            if (spans.length === 0) return { lineCount: 0, charCount: 0 };
            const lastSpan = spans[spans.length - 1];
            const lastTop = lastSpan.getBoundingClientRect().top;
            const firstTop = spans[0].getBoundingClientRect().top;

            // If first token and last token have roughly same top (within 5px), it's only 1 line!
            if (Math.abs(lastTop - firstTop) <= 5) {
                return { lineCount: 1, charCount: textToSplit.length };
            }

            // Multi-line: walk backwards from the end to count characters on the last line and total lines
            let lastLineChars = 0;
            let lineCount = 1;
            let currentLineTop = lastTop;
            for (let i = spans.length - 1; i >= 0; i--) {
                const top = spans[i].getBoundingClientRect().top;
                if (Math.abs(top - lastTop) <= 5) {
                    lastLineChars += spans[i].textContent.length;
                }
                if (Math.abs(top - currentLineTop) > 5) {
                    lineCount++;
                    currentLineTop = top;
                }
            }

            return {
                lineCount: lineCount,
                charCount: lastLineChars
            };
        }

        const initialInfo = getLastLineInfo();
        const initialLines = initialInfo.lineCount;
        // Trigger only when multi-line (initialLines > 1) and the last line has 1 or 2 characters (single word or punctuation orphan)
        if (initialLines > 1 && initialInfo.charCount > 0 && initialInfo.charCount <= 2) {
            let resolved = false;

            // Strategy 1: Tighten letter-spacing slightly (-0.15px to -0.6px) to pull orphan back to previous line
            const tightenSteps = [-0.15, -0.3, -0.45, -0.6];
            for (const sp of tightenSteps) {
                el.style.letterSpacing = `${sp}px`;
                const info = getLastLineInfo();
                if (info.lineCount < initialLines || info.charCount >= 4) {
                    resolved = true;
                    break;
                }
            }

            // Strategy 2: If tightening couldn't pull it up, gently expand (+0.15px to +0.45px) to pull preceding characters down so it's not a lonely orphan
            if (!resolved) {
                const targetMinChars = (initialInfo.charCount === 1) ? 2 : 3;
                const expandSteps = [0.15, 0.3, 0.45];
                for (const sp of expandSteps) {
                    el.style.letterSpacing = `${sp}px`;
                    const info = getLastLineInfo();
                    if (info.lineCount === initialLines && info.charCount >= targetMinChars) {
                        resolved = true;
                        break;
                    }
                }
            }

            if (!resolved) {
                el.style.letterSpacing = '';
            }
        }

        el.innerHTML = originalHTML;
    }

    // Prepopulate date automatically with current ROC date
    function initDate() {
        const today = new Date();
        const rocYear = today.getFullYear() - 1911;
        const month = today.getMonth() + 1;
        const day = today.getDate();

        // Formal doc dates
        const upYear = document.getElementById('up-date-year');
        const upMonth = document.getElementById('up-date-month');
        const upDay = document.getElementById('up-date-day');
        if (upYear && !upYear.value) upYear.value = rocYear;
        if (upMonth && !upMonth.value) upMonth.value = month;
        if (upDay && !upDay.value) upDay.value = day;

        const paddedMonth = String(month).padStart(2, '0');
        const defaultId = `${rocYear}${paddedMonth}00000`;
        const upIdInput = document.getElementById('up-id-num');
        if (upIdInput && !upIdInput.value) {
            upIdInput.value = defaultId;
        }

        // Contact letter dates
        const paDateYear = document.getElementById('pa-date-year');
        const paDateMonth = document.getElementById('pa-date-month');
        const paDateDay = document.getElementById('pa-date-day');
        if (paDateYear && !paDateYear.value) paDateYear.value = rocYear;
        if (paDateMonth && !paDateMonth.value) paDateMonth.value = month;
        if (paDateDay && !paDateDay.value) paDateDay.value = day;
    }

    // ==========================================
    // Category & Mode Management
    // ==========================================
    function updateModeOptions(category) {
        const currentMode = docModeSelect.value;
        if (category === 'contact_letter') {
            docModeSelect.innerHTML = `
                <option value="A">1. 內部陳核（標題顯示「業務接洽便函(稿)」）</option>
                <option value="B">2. 正式發文（標題顯示「業務接洽便函」）</option>
            `;
            // Keep A or B
            docModeSelect.value = (currentMode === 'B') ? 'B' : 'A';
        } else {
            docModeSelect.innerHTML = `
                <option value="A">1. 內部陳核 (連動「如正副本」+ 標題「(稿)」)</option>
                <option value="B">2. 正式發文 (依正副本對象分頁列印)</option>
                <option value="C">3. 手動輸入</option>
            `;
            if (currentMode === 'B') docModeSelect.value = 'B';
            else if (currentMode === 'C') docModeSelect.value = 'C';
            else docModeSelect.value = 'A';
        }
    }

    function checkMoeWarning() {
        const category = docCategorySelect ? docCategorySelect.value : '';
        const tempOriginalVal = document.getElementById('up-original') ? document.getElementById('up-original').value : '';
        const parseRecipients = (text) => {
            if (!text) return [];
            return text.split(/[、,，\n]+/).map(s => s.trim()).filter(s => s.length > 0);
        };
        const originals = parseRecipients(tempOriginalVal);
        const hasMoe = originals.some(org => org === '教育部' || org.includes('教育部'));

        if (category === 'parallel_downward' && hasMoe) {
            if (!hasWarnedMoe) {
                hasWarnedMoe = true;
                alert('發函教育部應使用上行文');
            }
        } else {
            hasWarnedMoe = false;
        }
    }

    function updateReplyDateControls() {
        // 1. 發文區
        const sendStatusEl = document.getElementById('pa-send-reply-status');
        const sendReplyStatus = sendStatusEl ? sendStatusEl.value : '待覆';
        const sendYear = document.getElementById('pa-send-reply-year');
        const sendMonth = document.getElementById('pa-send-reply-month');
        const sendDay = document.getElementById('pa-send-reply-day');
        const sendGroup = document.getElementById('pa-send-reply-date-group');
        const sendLabel = document.getElementById('pa-send-reply-date-label');

        if (sendReplyStatus === '免覆') {
            if (sendYear) { sendYear.disabled = true; sendYear.value = ''; }
            if (sendMonth) { sendMonth.disabled = true; sendMonth.value = ''; }
            if (sendDay) { sendDay.disabled = true; sendDay.value = ''; }
            if (sendGroup) sendGroup.classList.add('disabled-control');
            if (sendLabel) sendLabel.innerHTML = '待覆日期 <small style="color: var(--text-muted); font-weight: normal; font-size: 0.8rem;">(免覆無須填寫)</small>';
        } else {
            if (sendYear) sendYear.disabled = false;
            if (sendMonth) sendMonth.disabled = false;
            if (sendDay) sendDay.disabled = false;
            if (sendGroup) sendGroup.classList.remove('disabled-control');
            if (sendLabel) sendLabel.innerHTML = '待覆日期 <span style="color: var(--red-official);">*</span>';
        }

        // 2. 回文區
        const replyStatusEl = document.getElementById('pa-reply-close-status');
        const replyCloseStatus = replyStatusEl ? replyStatusEl.value : '銷案';
        const replyYear = document.getElementById('pa-reply-year');
        const replyMonth = document.getElementById('pa-reply-month');
        const replyDay = document.getElementById('pa-reply-day');
        const replyGroup = document.getElementById('pa-reply-date-group');
        const replyLabel = document.getElementById('pa-reply-date-label');

        if (replyCloseStatus === '銷案') {
            if (replyYear) { replyYear.disabled = true; replyYear.value = ''; }
            if (replyMonth) { replyMonth.disabled = true; replyMonth.value = ''; }
            if (replyDay) { replyDay.disabled = true; replyDay.value = ''; }
            if (replyGroup) replyGroup.classList.add('disabled-control');
            if (replyLabel) replyLabel.innerHTML = '待覆日期 <small style="color: var(--text-muted); font-weight: normal; font-size: 0.8rem;">(銷案無須填寫)</small>';
        } else {
            if (replyYear) replyYear.disabled = false;
            if (replyMonth) replyMonth.disabled = false;
            if (replyDay) replyDay.disabled = false;
            if (replyGroup) replyGroup.classList.remove('disabled-control');
            if (replyLabel) replyLabel.innerHTML = '待覆日期 <span style="color: var(--red-official);">*</span>';
        }
    }

    function handleCategoryChange(shouldSyncNow = true) {
        if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
        const category = docCategorySelect.value;
        updateModeOptions(category);

        if (category === 'contact_letter') {
            // Show Contact Letter panel, hide Formal Doc panel
            panelFormalDoc.classList.add('hidden');
            panelContactLetter.classList.remove('hidden');
            paUsageModeGroup.classList.remove('hidden');
            upReceiverManualGroup.classList.add('hidden');

            document.body.classList.remove('category-formal-doc');
            document.body.classList.add('category-contact-letter');
            previewToolbarTitle.innerHTML = '<i data-lucide="eye"></i> A4 高擬真公文排版預覽 - 業務接洽便函';
            updateReplyDateControls();
        } else {
            // Show Formal Doc panel, hide Contact Letter panel
            panelFormalDoc.classList.remove('hidden');
            panelContactLetter.classList.add('hidden');
            paUsageModeGroup.classList.add('hidden');

            document.body.classList.remove('category-contact-letter');
            document.body.classList.add('category-formal-doc');
            const catName = (category === 'upward') ? '上行文 (函)' : '平行/下行文 (函)';
            previewToolbarTitle.innerHTML = `<i data-lucide="eye"></i> A4 高擬真公文排版預覽 - ${catName}`;

            handleModeChange(false);
            checkMoeWarning();
        }

        initLucide();
        if (shouldSyncNow) syncPreview();
    }

    function handleModeChange(shouldSyncNow = true) {
        const category = docCategorySelect.value;
        const mode = docModeSelect.value;

        if (category !== 'contact_letter') {
            if (mode === 'C') {
                upReceiverManualGroup.classList.remove('hidden');
            } else {
                upReceiverManualGroup.classList.add('hidden');
            }
        } else {
            upReceiverManualGroup.classList.add('hidden');
        }

        if (shouldSyncNow) syncPreview();
    }

    function syncUsageUI() {
        const usage = paUsageMode ? paUsageMode.value : 'both';
        const previewSendBlock = document.getElementById('preview-send-block');
        const previewReplyBlock = document.getElementById('preview-reply-block');

        if (usage === 'send') {
            if (previewSendBlock) previewSendBlock.classList.remove('section-muted');
            if (previewReplyBlock) previewReplyBlock.classList.add('section-muted');
            if (cardSend) {
                cardSend.classList.remove('section-muted');
                cardSend.style.display = 'block';
            }
            if (cardReply) {
                cardReply.classList.add('section-muted');
            }
        } else if (usage === 'reply') {
            if (previewSendBlock) previewSendBlock.classList.add('section-muted');
            if (previewReplyBlock) previewReplyBlock.classList.remove('section-muted');
            if (cardSend) {
                cardSend.classList.add('section-muted');
            }
            if (cardReply) {
                cardReply.classList.remove('section-muted');
                cardReply.style.display = 'block';
            }
        } else {
            if (previewSendBlock) previewSendBlock.classList.remove('section-muted');
            if (previewReplyBlock) previewReplyBlock.classList.remove('section-muted');
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

    // ==========================================
    // Responsive Screen Split & Dynamic Preview Scaling
    // ==========================================
    let userHasManuallyZoomed = false;
    let userCustomEditorRatio = null;

    function applyResponsiveSplit() {
        const editorPanel = document.querySelector('.editor-panel');
        if (!editorPanel) return;

        if (userCustomEditorRatio !== null) {
            editorPanel.style.width = `${userCustomEditorRatio}%`;
        } else {
            const winW = window.innerWidth;
            let autoRatio;
            if (winW >= 1600) {
                autoRatio = 42; // Wide screens: 42% editor, 58% preview
            } else if (winW >= 1280) {
                autoRatio = 45; // Medium screens: 45% editor, 55% preview
            } else if (winW >= 1024) {
                autoRatio = 48; // Narrower screens: 48% editor, 52% preview
            } else {
                autoRatio = 50; // Small screens: 50% editor, 50% preview
            }
            editorPanel.style.width = `${autoRatio}%`;
        }
    }

    function adjustPreviewScale() {
        if (!container) return;

        const availableWidth = container.clientWidth - 40; // padding 20px on each side
        const sheetWidth = 794; // approx 210mm in 96dpi
        const sheetHeight = 1123; // approx 297mm in 96dpi

        // Fit single page width, but STRICTLY AT LEAST 100% (1.0)
        const fitScale = Math.max(1.0, availableWidth / sheetWidth);

        let scaleVal;
        if (userHasManuallyZoomed && zoomSlider) {
            // Strictly at least 100% (1.0)
            scaleVal = Math.max(1.0, parseInt(zoomSlider.value, 10) / 100);
        } else {
            scaleVal = fitScale;
            if (zoomSlider) {
                const fitPercent = Math.round(fitScale * 100);
                zoomSlider.value = Math.min(200, Math.max(100, fitPercent));
            }
        }

        if (zoomValue && zoomSlider) {
            zoomValue.textContent = `${Math.round(scaleVal * 100)}%`;
        }

        const wrappers = container.querySelectorAll('.a4-page-wrapper');
        const scaledWidth = Math.round(sheetWidth * scaleVal);
        const scaledHeight = Math.round(sheetHeight * scaleVal);

        if (wrappers.length > 0) {
            wrappers.forEach(w => {
                w.style.width = `${scaledWidth}px`;
                w.style.height = `${scaledHeight}px`;
                w.style.margin = '0 auto 24px auto';
                const sheet = w.querySelector('.a4-sheet');
                if (sheet) {
                    sheet.style.transform = `scale(${scaleVal})`;
                    sheet.style.transformOrigin = 'top left';
                    sheet.style.marginBottom = '';
                }
            });
        } else {
            const sheets = container.querySelectorAll('.a4-sheet');
            sheets.forEach(sheet => {
                sheet.style.transform = `scale(${scaleVal})`;
                sheet.style.transformOrigin = 'top center';
                if (scaleVal > 1) {
                    sheet.style.marginBottom = `${(297 * 3.7795 * (scaleVal - 1)) + 20}px`;
                } else {
                    sheet.style.marginBottom = '';
                }
            });
        }
    }

    function updateGridDisplay() {
        const isGridChecked = toggleGrid.checked;
        const sheets = container.querySelectorAll('.a4-sheet');
        sheets.forEach(sheet => {
            if (isGridChecked) {
                sheet.classList.add('show-grid');
            } else {
                sheet.classList.remove('show-grid');
            }
        });
    }

    // ==========================================
    // Formal Doc Pagination Engine (Beta 3 Merged)
    // ==========================================
    function paginateFormalDoc() {
        if (!tmplFormalDoc || !container) return;

        // Create measurement div if not exists
        let measureDiv = document.getElementById('a4-measure-workspace');
        if (!measureDiv) {
            measureDiv = document.createElement('div');
            measureDiv.id = 'a4-measure-workspace';
            measureDiv.className = 'a4-sheet show-grid template-upward';
            measureDiv.style.position = 'absolute';
            measureDiv.style.left = '-9999px';
            measureDiv.style.top = '0';
            measureDiv.style.visibility = 'hidden';
            measureDiv.style.height = 'auto';
            measureDiv.style.minHeight = '0';
            document.body.appendChild(measureDiv);
        }
        measureDiv.style.display = 'block';

        const category = docCategorySelect.value;
        const mode = docModeSelect ? docModeSelect.value : 'A';
        const manualVal = upReceiverManual ? upReceiverManual.value : '';
        const originalVal = document.getElementById('up-original').value || '';
        const ccVal = document.getElementById('up-cc').value || '';

        let recipientsList = [];
        let mainTitle = '長庚大學　函';

        if (mode === 'A') {
            const hasCc = ccVal.trim() !== '';
            recipientsList = [hasCc ? '如正、副本收受者' : '如正本收受者'];
            mainTitle = '長庚大學　函(稿)';
        } else if (mode === 'C') {
            recipientsList = [manualVal.trim() || '○○○○○○○'];
            mainTitle = '長庚大學　函';
        } else if (mode === 'B') {
            const parseRecipients = (text) => {
                if (!text) return [];
                return text.split(/[、,，\n]+/).map(s => s.trim()).filter(s => s.length > 0);
            };
            const originals = parseRecipients(originalVal);
            const ccs = parseRecipients(ccVal);
            const combined = originals.concat(ccs);
            const unique = [];
            combined.forEach(item => {
                if (unique.indexOf(item) === -1) unique.push(item);
            });
            recipientsList = unique.length > 0 ? unique : ['○○○○○○○'];
            mainTitle = '長庚大學　函';
        }

        container.innerHTML = '';

        recipientsList.forEach((recipient, recipientIndex) => {
            measureDiv.innerHTML = tmplFormalDoc.innerHTML;

            const titleMainEl = measureDiv.querySelector('.cgu-title-main');
            if (titleMainEl) titleMainEl.textContent = mainTitle;

            const setSafeText = (selector, text) => {
                const el = measureDiv.querySelector(selector);
                if (el) el.textContent = text;
            };
            const setSafeHTML = (selector, html) => {
                const el = measureDiv.querySelector(selector);
                if (el) el.innerHTML = html;
            };

            setSafeText('#p-up-address', document.getElementById('up-address').value);
            setSafeText('#p-up-person', document.getElementById('up-person').value);
            setSafeText('#p-up-phone', document.getElementById('up-phone').value);
            setSafeText('#p-up-fax', document.getElementById('up-fax').value);
            setSafeText('#p-up-receiver', recipient);

            const rocYear = new Date().getFullYear() - 1911;
            const upYear = document.getElementById('up-date-year').value || rocYear;
            const upMonth = document.getElementById('up-date-month').value || (new Date().getMonth() + 1);
            const upDay = document.getElementById('up-date-day').value || new Date().getDate();
            setSafeText('#p-up-date', `中華民國 ${upYear} 年 ${upMonth} 月 ${upDay} 日`);

            const upIdNum = document.getElementById('up-id-num').value || '○○○○○○○○○○';
            setSafeText('#p-up-id', `長庚大字第 ${upIdNum} 號`);
            setSafeText('#p-up-speed', document.getElementById('up-speed').value);

            const secrecyVal = document.getElementById('up-secrecy').value;
            const secrecyDurationVal = document.getElementById('up-secrecy-duration').value;
            let combinedSecrecy = secrecyVal || '';
            if (secrecyDurationVal) {
                combinedSecrecy += secrecyVal ? ` (${secrecyDurationVal})` : secrecyDurationVal;
            }
            setSafeText('#p-up-secrecy', combinedSecrecy);
            setSafeText('#p-up-attachment', document.getElementById('up-attachment').value || '無');

            // Body Content
            setSafeHTML('#p-up-subject', formatHTML(document.getElementById('up-subject').value) || '○○○○○○○');
            const pSubj = measureDiv.querySelector('#p-up-subject');
            if (pSubj) adjustElementOrphans(pSubj);

            const explanationVal = document.getElementById('up-explanation').value.trim();
            const hasExplanation = explanationVal !== '';
            const hasPoints = checkHasPoints(explanationVal);

            const explanationSection = measureDiv.querySelector('.section-explanation');
            if (explanationSection) {
                if (!hasExplanation) {
                    explanationSection.style.display = 'none';
                } else {
                    explanationSection.style.display = '';
                    if (hasPoints) {
                        explanationSection.classList.remove('layout-side-by-side');
                        explanationSection.classList.add('layout-stacked');
                    } else {
                        explanationSection.classList.remove('layout-stacked');
                        explanationSection.classList.add('layout-side-by-side');
                    }
                    const pExpl = measureDiv.querySelector('#p-up-explanation');
                    if (pExpl) pExpl.innerHTML = formatExplanationHTML(explanationVal, hasPoints);
                }
            }

            const upOrigVal = document.getElementById('up-original').value;
            setSafeHTML('#p-up-original', upOrigVal ? protectNoBreak(upOrigVal) : '○○○○○○');
            const upCcVal = document.getElementById('up-cc').value;
            setSafeHTML('#p-up-cc', upCcVal ? protectNoBreak(upCcVal) : '');

            // Signoff block toggles
            const signoffBlock = measureDiv.querySelector('#p-up-principal-signoff');
            if (signoffBlock) {
                signoffBlock.style.display = (category === 'upward') ? 'block' : 'none';
            }

            const footerBlock = measureDiv.querySelector('.footer-block');
            if (footerBlock) {
                const sigSeal = footerBlock.querySelector('#p-up-signature-seal');
                if (sigSeal) {
                    if (category === 'parallel_downward') {
                        sigSeal.classList.remove('hidden');
                    } else {
                        sigSeal.classList.add('hidden');
                    }
                }
            }

            // Line splitting helper
            function splitParagraphIntoLines(el, baseClass, bodyClass) {
                const originalHTML = el.innerHTML;
                const markerSpan = el.querySelector('[class^="expl-marker-"]');
                let textToSplit = '';
                let markerHTML = '';
                if (markerSpan) {
                    markerHTML = markerSpan.outerHTML;
                    textToSplit = el.textContent.substring(markerSpan.textContent.length);
                } else {
                    textToSplit = el.textContent;
                }

                const tokens = tokenizeText(textToSplit);
                el.innerHTML = markerHTML + tokens.map(t => {
                    const isAtomic = t.length > 1 && !/^\s+$/.test(t);
                    const escaped = escapeHTML(t);
                    return isAtomic ? `<span class="no-break">${escaped}</span>` : `<span>${escaped}</span>`;
                }).join('');
                const spans = el.querySelectorAll(':scope > span:not([class^="expl-marker-"])');

                const lines = [];
                if (spans.length === 0) {
                    lines.push(originalHTML);
                    el.innerHTML = originalHTML;
                    return [{ html: originalHTML, class: baseClass }];
                }

                let currentTop = spans[0].getBoundingClientRect().top;
                let currentLineText = '';

                spans.forEach(span => {
                    const top = span.getBoundingClientRect().top;
                    if (Math.abs(top - currentTop) > 5) {
                        lines.push(currentLineText);
                        currentLineText = '';
                        currentTop = top;
                    }
                    currentLineText += span.textContent;
                });
                if (currentLineText) lines.push(currentLineText);

                el.innerHTML = originalHTML;

                return lines.map((lineText, idx) => {
                    const protectedHTML = protectNoBreak(lineText);
                    const isLast = (idx === lines.length - 1);
                    const suffix = isLast ? ' expl-line-last' : ' expl-line-middle';
                    if (idx === 0) {
                        return { html: markerHTML + protectedHTML, class: baseClass + suffix };
                    } else {
                        return { html: protectedHTML, class: bodyClass + suffix };
                    }
                });
            }

            // Measurement
            const totalPrintableHeight = 925;
            const redHeader = measureDiv.querySelector('.red-header');
            const contactDetails = measureDiv.querySelector('.contact-details-container');
            const receiverRow = measureDiv.querySelector('.recipient-row');
            const metadataBlock = measureDiv.querySelector('.metadata-block');

            const headerHeight = (redHeader ? redHeader.offsetHeight : 0) +
                                 (contactDetails ? contactDetails.offsetHeight : 0) +
                                 (receiverRow ? receiverRow.offsetHeight : 0) +
                                 (metadataBlock ? metadataBlock.offsetHeight : 0) + 30;

            const page1Capacity = totalPrintableHeight - headerHeight;
            const page2Capacity = totalPrintableHeight;

            const subjectBlock = measureDiv.querySelector('.section-subject');
            const principalSignoff = measureDiv.querySelector('#p-up-principal-signoff');

            const items = [];
            if (subjectBlock) {
                items.push({
                    type: 'subject',
                    html: subjectBlock.innerHTML,
                    class: 'content-section section-subject',
                    height: subjectBlock.offsetHeight + 10
                });
            }

            if (hasExplanation) {
                const explBody = measureDiv.querySelector('#p-up-explanation');
                const elements = explBody.querySelectorAll('.expl-paragraph, .expl-pagebreak-marker');
                elements.forEach(el => {
                    if (el.classList.contains('expl-pagebreak-marker')) {
                        items.push({ type: 'page-break', height: 0 });
                        return;
                    }
                    const p = el;
                    adjustElementOrphans(p);
                    const letterSpacing = p.style.letterSpacing || '';
                    const baseClass = p.className;
                    let bodyClass = baseClass + '-body';
                    if (baseClass.includes('expl-level-1-w3')) bodyClass = 'expl-paragraph expl-level-1-w3-body';
                    else if (baseClass.includes('expl-level-1')) bodyClass = 'expl-paragraph expl-level-1-body';
                    else if (baseClass.includes('expl-level-2-w4')) bodyClass = 'expl-paragraph expl-level-2-w4-body';
                    else if (baseClass.includes('expl-level-2-w3')) bodyClass = 'expl-paragraph expl-level-2-w3-body';
                    else if (baseClass.includes('expl-level-2')) bodyClass = 'expl-paragraph expl-level-2-body';
                    else if (baseClass.includes('expl-level-3-w3')) bodyClass = 'expl-paragraph expl-level-3-w3-body';
                    else if (baseClass.includes('expl-level-3-w2')) bodyClass = 'expl-paragraph expl-level-3-w2-body';
                    else if (baseClass.includes('expl-level-3')) bodyClass = 'expl-paragraph expl-level-3-body';
                    else if (baseClass.includes('expl-level-4-w3')) bodyClass = 'expl-paragraph expl-level-4-w3-body';
                    else if (baseClass.includes('expl-level-4-w2')) bodyClass = 'expl-paragraph expl-level-4-w2-body';
                    else if (baseClass.includes('expl-level-4')) bodyClass = 'expl-paragraph expl-level-4-body';
                    else if (baseClass.includes('expl-level-5-w3')) bodyClass = 'expl-paragraph expl-level-5-w3-body';
                    else if (baseClass.includes('expl-level-5')) bodyClass = 'expl-paragraph expl-level-5-body';
                    else if (baseClass.includes('expl-level-6-w3')) bodyClass = 'expl-paragraph expl-level-6-w3-body';
                    else if (baseClass.includes('expl-level-6')) bodyClass = 'expl-paragraph expl-level-6-body';
                    else bodyClass = 'expl-paragraph';

                    const lines = splitParagraphIntoLines(p, baseClass, bodyClass);
                    lines.forEach(line => {
                        const testDiv = document.createElement('div');
                        testDiv.className = line.class;
                        testDiv.innerHTML = line.html;
                        testDiv.style.letterSpacing = letterSpacing;
                        measureDiv.appendChild(testDiv);
                        const h = (testDiv.offsetHeight || 34) + 4;
                        measureDiv.removeChild(testDiv);

                        items.push({
                            type: 'expl-line',
                            html: line.html,
                            class: line.class,
                            height: h,
                            letterSpacing: letterSpacing
                        });
                    });
                });
            }

            const footerItems = [];
            let footerHeight = 0;
            if (footerBlock) {
                footerItems.push(footerBlock.cloneNode(true));
                footerHeight += footerBlock.offsetHeight + 15;
            }
            if (principalSignoff && category === 'upward') {
                footerItems.push(principalSignoff.cloneNode(true));
                footerHeight += principalSignoff.offsetHeight + 15;
            }

            const pages = [];
            let currentPageItems = [];
            let currentHeight = 0;
            let isFirstPage = true;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const capacity = isFirstPage ? page1Capacity : page2Capacity;

                if (item.type === 'page-break') {
                    if (currentPageItems.length > 0) {
                        pages.push({ isFirst: isFirstPage, items: currentPageItems, forcedBreak: true });
                        isFirstPage = false;
                        currentPageItems = [];
                        currentHeight = 0;
                    }
                    continue;
                }

                if (currentHeight + item.height > capacity && currentPageItems.length > 0) {
                    pages.push({ isFirst: isFirstPage, items: currentPageItems });
                    isFirstPage = false;
                    currentPageItems = [item];
                    currentHeight = item.height;
                } else {
                    currentPageItems.push(item);
                    currentHeight += item.height;
                }
            }

            const finalCapacity = isFirstPage ? page1Capacity : page2Capacity;
            if (currentHeight + footerHeight > finalCapacity && currentPageItems.length > 0) {
                pages.push({ isFirst: isFirstPage, items: currentPageItems });
                isFirstPage = false;
                pages.push({ isFirst: isFirstPage, items: [], footer: footerItems });
            } else {
                pages.push({ isFirst: isFirstPage, items: currentPageItems, footer: footerItems });
            }

            // Anti-Orphan Page Engine
            if (pages.length > 1) {
                const lastPage = pages[pages.length - 1];
                const prevPage = pages[pages.length - 2];

                if (lastPage.footer && !prevPage.forcedBreak) {
                    const lastExplCount = lastPage.items.filter(it => it.type === 'expl-line').length;
                    const prevExplCount = prevPage.items.filter(it => it.type === 'expl-line').length;

                    if (lastExplCount === 0 && prevExplCount >= 3) {
                        const pullCount = (prevExplCount >= 4) ? 2 : 1;
                        for (let k = 0; k < pullCount; k++) {
                            for (let idx = prevPage.items.length - 1; idx >= 0; idx--) {
                                if (prevPage.items[idx].type === 'expl-line') {
                                    const pulled = prevPage.items.splice(idx, 1)[0];
                                    lastPage.items.unshift(pulled);
                                    break;
                                }
                            }
                        }
                    } else if (lastExplCount === 1 && prevExplCount >= 3) {
                        for (let idx = prevPage.items.length - 1; idx >= 0; idx--) {
                            if (prevPage.items[idx].type === 'expl-line') {
                                const pulled = prevPage.items.splice(idx, 1)[0];
                                lastPage.items.unshift(pulled);
                                break;
                            }
                        }
                    }
                }
            }

            // Render pages inside container
            if (recipientIndex > 0) {
                const separator = document.createElement('div');
                separator.className = 'document-separator';
                container.appendChild(separator);
            }

            pages.forEach((page, index) => {
                const pageWrapper = document.createElement('div');
                pageWrapper.className = 'a4-page-wrapper';

                const pageDiv = document.createElement('div');
                pageDiv.className = 'a4-sheet show-grid template-upward';
                const isAbsoluteFirst = (recipientIndex === 0 && index === 0);
                pageDiv.id = isAbsoluteFirst ? 'a4-sheet' : `a4-sheet-rec-${recipientIndex}-p-${index + 1}`;

                if (page.isFirst) {
                    const p1Layout = document.createElement('div');
                    p1Layout.className = 'preview-layout-upward';
                    p1Layout.appendChild(redHeader.cloneNode(true));
                    p1Layout.appendChild(contactDetails.cloneNode(true));
                    p1Layout.appendChild(receiverRow.cloneNode(true));
                    p1Layout.appendChild(metadataBlock.cloneNode(true));

                    const bodyDiv = document.createElement('div');
                    bodyDiv.className = 'body-content';

                    let explContainer = null;
                    page.items.forEach(item => {
                        if (item.type === 'subject') {
                            const subjDiv = document.createElement('div');
                            subjDiv.className = item.class;
                            subjDiv.innerHTML = item.html;
                            bodyDiv.appendChild(subjDiv);
                        } else if (item.type === 'expl-line') {
                            if (!explContainer) {
                                explContainer = document.createElement('div');
                                explContainer.className = `content-section section-explanation ${hasPoints ? 'layout-stacked' : 'layout-side-by-side'}`;
                                const titleSpan = document.createElement('span');
                                titleSpan.className = 'sec-title';
                                titleSpan.textContent = '說明：';
                                explContainer.appendChild(titleSpan);

                                const bodyWrapper = document.createElement('div');
                                bodyWrapper.id = 'p-up-explanation';
                                bodyWrapper.className = 'sec-body';
                                explContainer.appendChild(bodyWrapper);
                                bodyDiv.appendChild(explContainer);
                            }
                            const lineDiv = document.createElement('div');
                            lineDiv.className = item.class;
                            lineDiv.innerHTML = item.html;
                            if (item.letterSpacing) lineDiv.style.letterSpacing = item.letterSpacing;
                            explContainer.querySelector('#p-up-explanation').appendChild(lineDiv);
                        }
                    });

                    p1Layout.appendChild(bodyDiv);
                    if (page.footer) {
                        page.footer.forEach(foot => p1Layout.appendChild(foot));
                    }
                    pageDiv.appendChild(p1Layout);
                } else {
                    const pxLayout = document.createElement('div');
                    pxLayout.className = 'preview-layout-upward';

                    const bodyDiv = document.createElement('div');
                    bodyDiv.className = 'body-content';

                    page.items.forEach(item => {
                        if (item.type === 'expl-line') {
                            const lineDiv = document.createElement('div');
                            lineDiv.className = item.class;
                            lineDiv.innerHTML = item.html;
                            if (item.letterSpacing) lineDiv.style.letterSpacing = item.letterSpacing;
                            bodyDiv.appendChild(lineDiv);
                        }
                    });

                    pxLayout.appendChild(bodyDiv);
                    if (page.footer) {
                        page.footer.forEach(foot => pxLayout.appendChild(foot));
                    }
                    pageDiv.appendChild(pxLayout);
                }

                const pageNumDiv = document.createElement('div');
                pageNumDiv.className = 'page-number-footer';
                pageNumDiv.textContent = `第 ${index + 1} 頁，共 ${pages.length} 頁`;
                pageDiv.appendChild(pageNumDiv);

                pageWrapper.appendChild(pageDiv);
                container.appendChild(pageWrapper);
            });
        });

        updateGridDisplay();

        if (measureDiv) {
            measureDiv.innerHTML = '';
            measureDiv.style.display = 'none';
        }
    }

    // ==========================================
    // Contact Letter Render Engine (Beta 4 Merged)
    // ==========================================
    function renderContactLetter() {
        if (!tmplContactLetter || !container) return;

        container.innerHTML = '';

        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'a4-page-wrapper';

        const pageDiv = document.createElement('div');
        pageDiv.id = 'a4-sheet';
        pageDiv.className = 'a4-sheet show-grid template-contact-letter';
        pageDiv.style.padding = '13mm';
        pageDiv.style.boxSizing = 'border-box';
        pageDiv.innerHTML = tmplContactLetter.innerHTML;

        pageWrapper.appendChild(pageDiv);
        container.appendChild(pageWrapper);

        // 1. Table 1 Metadata
        const cat = document.getElementById('pa-category').value;
        const catA = pageDiv.querySelector('#p-pa-cat-A');
        const catB = pageDiv.querySelector('#p-pa-cat-B');
        const catC = pageDiv.querySelector('#p-pa-cat-C');
        if (catA) catA.textContent = (cat === 'A') ? '✓' : '';
        if (catB) catB.textContent = (cat === 'B') ? '✓' : '';
        if (catC) catC.textContent = (cat === 'C') ? '✓' : '';

        const mode = docModeSelect ? docModeSelect.value : 'A';
        const mainTitle = pageDiv.querySelector('#p-pa-main-title');
        if (mainTitle) {
            mainTitle.textContent = (mode === 'A') ? '業務接洽便函(稿)' : '業務接洽便函';
        }

        const secrecy = document.getElementById('pa-secrecy').value;
        const secYes = pageDiv.querySelector('#p-pa-sec-yes');
        const secNo = pageDiv.querySelector('#p-pa-sec-no');
        if (secYes) secYes.textContent = (secrecy === '機密') ? '✓' : '';
        if (secNo) secNo.textContent = (secrecy === '非機密') ? '✓' : '';

        const closeYear = document.getElementById('pa-close-year') ? document.getElementById('pa-close-year').value.trim() : '';
        const closeMonth = document.getElementById('pa-close-month') ? document.getElementById('pa-close-month').value.trim() : '';
        const closeDay = document.getElementById('pa-close-day') ? document.getElementById('pa-close-day').value.trim() : '';
        let closeDate = '　　年　　月　　日';
        if (closeYear || closeMonth || closeDay) {
            closeDate = `${closeYear || '　'}年${closeMonth || '　'}月${closeDay || '　'}日`;
        }
        const days = document.getElementById('pa-days').value || '3';
        const years = document.getElementById('pa-years').value || '5年';
        const docNum = document.getElementById('pa-doc-num').value || '';

        const pCloseDate = pageDiv.querySelector('#p-pa-close-date');
        const pDays = pageDiv.querySelector('#p-pa-days');
        const pYears = pageDiv.querySelector('#p-pa-years');
        const pDocNum = pageDiv.querySelector('#p-pa-doc-num');
        if (pCloseDate) pCloseDate.textContent = closeDate;
        if (pDays) pDays.textContent = days;
        if (pYears) pYears.textContent = years;
        if (pDocNum) pDocNum.textContent = docNum;

        // Serial Row
        const yearVal = document.getElementById('pa-date-year').value || '115';
        const monthVal = document.getElementById('pa-date-month').value || '10';
        const dayVal = document.getElementById('pa-date-day').value || '10';
        const serialVal = document.getElementById('pa-id-serial').value || '1150001';

        const pDateRoc = pageDiv.querySelector('#p-pa-date-roc');
        const pIdSerial = pageDiv.querySelector('#p-pa-id-serial');
        if (pDateRoc) pDateRoc.textContent = `${yearVal} 年 ${monthVal} 月 ${dayVal} 日`;
        if (pIdSerial) pIdSerial.textContent = `　${serialVal}　`;

        // 2. Send Block
        const sendReceiver = document.getElementById('pa-send-receiver').value || '（受文者）';
        const sendSubject = document.getElementById('pa-send-subject').value || '';
        const sendExplanation = document.getElementById('pa-send-explanation').value || '';
        const sendDept = document.getElementById('pa-send-dept').value || '';
        const sendPerson = document.getElementById('pa-send-person').value || '';
        const sendPhone = document.getElementById('pa-send-phone').value || '';
        const sendAttachment = document.getElementById('pa-send-attachment').value || '無';
        const sendReplyStatus = document.getElementById('pa-send-reply-status').value || '待覆';

        const sendReplyYear = document.getElementById('pa-send-reply-year') ? document.getElementById('pa-send-reply-year').value.trim() : '';
        const sendReplyMonth = document.getElementById('pa-send-reply-month') ? document.getElementById('pa-send-reply-month').value.trim() : '';
        const sendReplyDay = document.getElementById('pa-send-reply-day') ? document.getElementById('pa-send-reply-day').value.trim() : '';
        let sendReplyDate = '　年　月　日';
        if (sendReplyStatus === '待覆' && (sendReplyYear || sendReplyMonth || sendReplyDay)) {
            sendReplyDate = `${sendReplyYear || '　'}年${sendReplyMonth || '　'}月${sendReplyDay || '　'}日`;
        }

        const pSendReceiver = pageDiv.querySelector('#p-pa-send-receiver');
        const pSendSubject = pageDiv.querySelector('#p-pa-send-subject');
        const pSendExplanation = pageDiv.querySelector('#p-pa-send-explanation');
        const pSendDept = pageDiv.querySelector('#p-pa-send-dept');
        const pSendPerson = pageDiv.querySelector('#p-pa-send-person');
        const pSendPhone = pageDiv.querySelector('#p-pa-send-phone');
        const pSendAttachment = pageDiv.querySelector('#p-pa-send-attachment');
        const pStatusFree = pageDiv.querySelector('#p-pa-status-free');
        const pStatusWait = pageDiv.querySelector('#p-pa-status-wait');
        const pSendReplyDate = pageDiv.querySelector('#p-pa-send-reply-date');

        if (pSendReceiver) pSendReceiver.textContent = sendReceiver;
        if (pSendSubject) pSendSubject.innerHTML = protectNoBreak(sendSubject);
        const sendHasPoints = checkHasPoints(sendExplanation);
        const sendExplWrapper = pageDiv.querySelector('#p-pa-send-expl-wrapper');
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

        // 3. Reply Block
        const replyReceiver = document.getElementById('pa-reply-receiver').value || '';
        const replySubject = document.getElementById('pa-reply-subject').value || '';
        const replyExplanation = document.getElementById('pa-reply-explanation').value || '';
        const replyDept = document.getElementById('pa-reply-dept').value || '';
        const replyPerson = document.getElementById('pa-reply-person').value || '';
        const replyPhone = document.getElementById('pa-reply-phone').value || '';
        const replyAttachment = document.getElementById('pa-reply-attachment').value || '無';
        const replyCloseStatus = document.getElementById('pa-reply-close-status').value || '銷案';

        const replyYear = document.getElementById('pa-reply-year') ? document.getElementById('pa-reply-year').value.trim() : '';
        const replyMonth = document.getElementById('pa-reply-month') ? document.getElementById('pa-reply-month').value.trim() : '';
        const replyDay = document.getElementById('pa-reply-day') ? document.getElementById('pa-reply-day').value.trim() : '';
        let replyDate = '　年　月　日';
        if (replyCloseStatus === '待覆' && (replyYear || replyMonth || replyDay)) {
            replyDate = `${replyYear || '　'}年${replyMonth || '　'}月${replyDay || '　'}日`;
        }

        const pReplyReceiver = pageDiv.querySelector('#p-pa-reply-receiver');
        const pReplySubject = pageDiv.querySelector('#p-pa-reply-subject');
        const pReplyExplanation = pageDiv.querySelector('#p-pa-reply-explanation');
        const pReplyDept = pageDiv.querySelector('#p-pa-reply-dept');
        const pReplyPerson = pageDiv.querySelector('#p-pa-reply-person');
        const pReplyPhone = pageDiv.querySelector('#p-pa-reply-phone');
        const pReplyAttachment = pageDiv.querySelector('#p-pa-reply-attachment');
        const pReplyStatusClose = pageDiv.querySelector('#p-pa-reply-status-close');
        const pReplyStatusWait = pageDiv.querySelector('#p-pa-reply-status-wait');
        const pReplyDateVal = pageDiv.querySelector('#p-pa-reply-date-val');
        const pRecvTime = pageDiv.querySelector('#p-pa-recv-time');
        const pReplyId = pageDiv.querySelector('#p-pa-reply-id');

        if (pReplyReceiver) pReplyReceiver.textContent = replyReceiver || '（受文者）';
        if (pReplySubject) pReplySubject.innerHTML = protectNoBreak(replySubject);
        const replyHasPoints = checkHasPoints(replyExplanation);
        const replyExplWrapper = pageDiv.querySelector('#p-pa-reply-expl-wrapper');
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
        if (pReplyDateVal) pReplyDateVal.textContent = replyDate || '　年　月　日';

        // Bottom lines fixed spacing
        if (pRecvTime) pRecvTime.textContent = '　　　年　　月　　日　　時　　分';
        if (pReplyId) pReplyId.textContent = '　　　年　　月　　日庚大業洽字第　　　　　號';

        // Dynamic font fitting for main content boxes
        const sendMainBox = pageDiv.querySelector('#p-pa-send-main-box');
        const replyMainBox = pageDiv.querySelector('#p-pa-reply-main-box');
        if (sendMainBox) autoFitContentBox(sendMainBox);
        if (replyMainBox) autoFitContentBox(replyMainBox);

        // Apply Single-character Orphan Control to Send & Reply Subjects and Explanations
        if (pSendSubject) adjustElementOrphans(pSendSubject);
        if (pSendExplanation) {
            const paragraphs = pSendExplanation.querySelectorAll('.expl-paragraph');
            paragraphs.forEach(p => adjustElementOrphans(p));
        }
        if (pReplySubject) adjustElementOrphans(pReplySubject);
        if (pReplyExplanation) {
            const paragraphs = pReplyExplanation.querySelectorAll('.expl-paragraph');
            paragraphs.forEach(p => adjustElementOrphans(p));
        }

        syncUsageUI();
        updateGridDisplay();
    }

    // ==========================================
    // Unified Preview Synchronization
    // ==========================================
    function syncPreview() {
        try {
            const category = docCategorySelect.value;
            if (category === 'contact_letter') {
                renderContactLetter();
            } else {
                paginateFormalDoc();
            }
            adjustPreviewScale();
            saveDraft();
        } catch (e) {
            console.error("syncPreview error:", e);
        }
    }

    // Live preview controller
    function setLivePreviewMode(isLive, shouldSyncNow = false) {
        isLivePreview = !!isLive;
        localStorage.setItem('cgu_formal_doc_live_preview_b5', isLivePreview ? 'true' : 'false');
        if (previewModeSelect) previewModeSelect.value = isLivePreview ? 'live' : 'manual';
        if (toggleLivePreview) toggleLivePreview.checked = isLivePreview;

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

    function handleFormInput() {
        if (isLivePreview) {
            if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
            previewDebounceTimer = setTimeout(syncPreview, 300);
        }
    }

    // ==========================================
    // Draft Persistence (LocalStorage & JSON)
    // ==========================================
    function saveDraft() {
        const category = docCategorySelect.value;
        const draft = {
            version: 'Beta 5',
            docCategory: category,
            docMode: docModeSelect.value,
            upReceiverManual: upReceiverManual.value,
            paUsageMode: paUsageMode.value,
            editorFontSize: editorFontSizeSelect.value,
            // Formal Doc Fields
            upAddress: document.getElementById('up-address').value,
            upPerson: document.getElementById('up-person').value,
            upPhone: document.getElementById('up-phone').value,
            upFax: document.getElementById('up-fax').value,
            upDateYear: document.getElementById('up-date-year').value,
            upDateMonth: document.getElementById('up-date-month').value,
            upDateDay: document.getElementById('up-date-day').value,
            upIdNum: document.getElementById('up-id-num').value,
            upSpeed: document.getElementById('up-speed').value,
            upSecrecy: document.getElementById('up-secrecy').value,
            upSecrecyDurationPreset: document.getElementById('up-secrecy-duration-preset').value,
            upSecrecyDuration: document.getElementById('up-secrecy-duration').value,
            upAttachment: document.getElementById('up-attachment').value,
            upSubject: document.getElementById('up-subject').value,
            upExplanation: document.getElementById('up-explanation').value,
            upOriginal: document.getElementById('up-original').value,
            upCc: document.getElementById('up-cc').value,
            // Contact Letter Fields
            paCategory: document.getElementById('pa-category').value,
            paSecrecy: document.getElementById('pa-secrecy').value,
            paDays: document.getElementById('pa-days').value,
            paYears: document.getElementById('pa-years').value,
            paDocNum: document.getElementById('pa-doc-num').value,
            paCloseYear: document.getElementById('pa-close-year').value,
            paCloseMonth: document.getElementById('pa-close-month').value,
            paCloseDay: document.getElementById('pa-close-day').value,
            paIdSerial: document.getElementById('pa-id-serial').value,
            paDateYear: document.getElementById('pa-date-year').value,
            paDateMonth: document.getElementById('pa-date-month').value,
            paDateDay: document.getElementById('pa-date-day').value,
            paSendReceiver: document.getElementById('pa-send-receiver').value,
            paSendSubject: document.getElementById('pa-send-subject').value,
            paSendExplanation: document.getElementById('pa-send-explanation').value,
            paSendDept: document.getElementById('pa-send-dept').value,
            paSendPerson: document.getElementById('pa-send-person').value,
            paSendPhone: document.getElementById('pa-send-phone').value,
            paSendAttachment: document.getElementById('pa-send-attachment').value,
            paSendReplyStatus: document.getElementById('pa-send-reply-status').value,
            paSendReplyYear: document.getElementById('pa-send-reply-year').value,
            paSendReplyMonth: document.getElementById('pa-send-reply-month').value,
            paSendReplyDay: document.getElementById('pa-send-reply-day').value,
            paReplyReceiver: document.getElementById('pa-reply-receiver').value,
            paReplySubject: document.getElementById('pa-reply-subject').value,
            paReplyExplanation: document.getElementById('pa-reply-explanation').value,
            paReplyDept: document.getElementById('pa-reply-dept').value,
            paReplyPerson: document.getElementById('pa-reply-person').value,
            paReplyPhone: document.getElementById('pa-reply-phone').value,
            paReplyAttachment: document.getElementById('pa-reply-attachment').value,
            paReplyCloseStatus: document.getElementById('pa-reply-close-status').value,
            paReplyYear: document.getElementById('pa-reply-year').value,
            paReplyMonth: document.getElementById('pa-reply-month').value,
            paReplyDay: document.getElementById('pa-reply-day').value
        };
        try {
            localStorage.setItem('cgu_formal_doc_draft_b5', JSON.stringify(draft));
        } catch (e) {
            console.error("Draft save failed", e);
        }
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem('cgu_formal_doc_draft_b5');
            if (!raw) {
                // If no Beta 5 draft, check Beta 4 or Beta 3
                initDate();
                applyDemoData(false);
                return;
            }
            const d = JSON.parse(raw);

            if (d.docCategory) {
                docCategorySelect.value = d.docCategory;
            }
            handleCategoryChange(false);

            if (d.docMode) docModeSelect.value = d.docMode;
            if (d.upReceiverManual !== undefined) upReceiverManual.value = d.upReceiverManual;
            if (d.paUsageMode) paUsageMode.value = d.paUsageMode;
            if (d.editorFontSize) {
                editorFontSizeSelect.value = d.editorFontSize;
                applyEditorFontSize(d.editorFontSize);
            }

            // Formal Doc
            if (d.upAddress !== undefined) document.getElementById('up-address').value = d.upAddress;
            if (d.upPerson !== undefined) document.getElementById('up-person').value = d.upPerson;
            if (d.upPhone !== undefined) document.getElementById('up-phone').value = d.upPhone;
            if (d.upFax !== undefined) document.getElementById('up-fax').value = d.upFax;
            if (d.upDateYear !== undefined) document.getElementById('up-date-year').value = d.upDateYear;
            if (d.upDateMonth !== undefined) document.getElementById('up-date-month').value = d.upDateMonth;
            if (d.upDateDay !== undefined) document.getElementById('up-date-day').value = d.upDateDay;
            if (d.upIdNum !== undefined) document.getElementById('up-id-num').value = d.upIdNum;
            if (d.upSpeed !== undefined) document.getElementById('up-speed').value = d.upSpeed;
            if (d.upSecrecy !== undefined) document.getElementById('up-secrecy').value = d.upSecrecy;
            if (d.upSecrecyDurationPreset !== undefined) document.getElementById('up-secrecy-duration-preset').value = d.upSecrecyDurationPreset;
            if (d.upSecrecyDuration !== undefined) document.getElementById('up-secrecy-duration').value = d.upSecrecyDuration;
            if (d.upAttachment !== undefined) document.getElementById('up-attachment').value = d.upAttachment;
            if (d.upSubject !== undefined) document.getElementById('up-subject').value = d.upSubject;
            if (d.upExplanation !== undefined) document.getElementById('up-explanation').value = d.upExplanation;
            if (d.upOriginal !== undefined) document.getElementById('up-original').value = d.upOriginal;
            if (d.upCc !== undefined) document.getElementById('up-cc').value = d.upCc;

            // Contact Letter
            if (d.paCategory !== undefined) document.getElementById('pa-category').value = d.paCategory;
            if (d.paSecrecy !== undefined) document.getElementById('pa-secrecy').value = d.paSecrecy;
            if (d.paDays !== undefined) document.getElementById('pa-days').value = d.paDays;
            if (d.paYears !== undefined) document.getElementById('pa-years').value = d.paYears;
            if (d.paDocNum !== undefined) document.getElementById('pa-doc-num').value = d.paDocNum;
            if (d.paCloseYear !== undefined) document.getElementById('pa-close-year').value = d.paCloseYear;
            if (d.paCloseMonth !== undefined) document.getElementById('pa-close-month').value = d.paCloseMonth;
            if (d.paCloseDay !== undefined) document.getElementById('pa-close-day').value = d.paCloseDay;
            if (d.paIdSerial !== undefined) document.getElementById('pa-id-serial').value = d.paIdSerial;
            if (d.paDateYear !== undefined) document.getElementById('pa-date-year').value = d.paDateYear;
            if (d.paDateMonth !== undefined) document.getElementById('pa-date-month').value = d.paDateMonth;
            if (d.paDateDay !== undefined) document.getElementById('pa-date-day').value = d.paDateDay;
            if (d.paSendReceiver !== undefined) document.getElementById('pa-send-receiver').value = d.paSendReceiver;
            if (d.paSendSubject !== undefined) document.getElementById('pa-send-subject').value = d.paSendSubject;
            if (d.paSendExplanation !== undefined) document.getElementById('pa-send-explanation').value = d.paSendExplanation;
            if (d.paSendDept !== undefined) document.getElementById('pa-send-dept').value = d.paSendDept;
            if (d.paSendPerson !== undefined) document.getElementById('pa-send-person').value = d.paSendPerson;
            if (d.paSendPhone !== undefined) document.getElementById('pa-send-phone').value = d.paSendPhone;
            if (d.paSendAttachment !== undefined) document.getElementById('pa-send-attachment').value = d.paSendAttachment;
            if (d.paSendReplyStatus !== undefined) document.getElementById('pa-send-reply-status').value = d.paSendReplyStatus;
            if (d.paSendReplyYear !== undefined) document.getElementById('pa-send-reply-year').value = d.paSendReplyYear;
            if (d.paSendReplyMonth !== undefined) document.getElementById('pa-send-reply-month').value = d.paSendReplyMonth;
            if (d.paSendReplyDay !== undefined) document.getElementById('pa-send-reply-day').value = d.paSendReplyDay;
            if (d.paReplyReceiver !== undefined) document.getElementById('pa-reply-receiver').value = d.paReplyReceiver;
            if (d.paReplySubject !== undefined) document.getElementById('pa-reply-subject').value = d.paReplySubject;
            if (d.paReplyExplanation !== undefined) document.getElementById('pa-reply-explanation').value = d.paReplyExplanation;
            if (d.paReplyDept !== undefined) document.getElementById('pa-reply-dept').value = d.paReplyDept;
            if (d.paReplyPerson !== undefined) document.getElementById('pa-reply-person').value = d.paReplyPerson;
            if (d.paReplyPhone !== undefined) document.getElementById('pa-reply-phone').value = d.paReplyPhone;
            if (d.paReplyAttachment !== undefined) document.getElementById('pa-reply-attachment').value = d.paReplyAttachment;
            if (d.paReplyCloseStatus !== undefined) document.getElementById('pa-reply-close-status').value = d.paReplyCloseStatus;
            if (d.paReplyYear !== undefined) document.getElementById('pa-reply-year').value = d.paReplyYear;
            if (d.paReplyMonth !== undefined) document.getElementById('pa-reply-month').value = d.paReplyMonth;
            if (d.paReplyDay !== undefined) document.getElementById('pa-reply-day').value = d.paReplyDay;

            updateReplyDateControls();
            syncPreview();
        } catch (e) {
            console.error("Draft load failed", e);
            initDate();
            applyDemoData(false);
        }
    }

    // ==========================================
    // Demo Data
    // ==========================================
    function applyDemoData(shouldSync = true) {
        const category = docCategorySelect.value;
        const today = new Date();
        const rocYear = today.getFullYear() - 1911;
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const paddedMonth = String(month).padStart(2, '0');

        if (category === 'upward') {
            docModeSelect.value = 'A';
            document.getElementById('up-address').value = '桃園市龜山區文化一路259號';
            document.getElementById('up-person').value = '木子三';
            document.getElementById('up-phone').value = '03-2118800分機1314';
            document.getElementById('up-fax').value = '03-2118700';
            document.getElementById('up-date-year').value = rocYear;
            document.getElementById('up-date-month').value = month;
            document.getElementById('up-date-day').value = day;
            document.getElementById('up-id-num').value = `${rocYear}${paddedMonth}00001`;
            document.getElementById('up-speed').value = '普通件';
            document.getElementById('up-secrecy').value = '';
            document.getElementById('up-secrecy-duration-preset').value = '';
            document.getElementById('up-secrecy-duration').value = '';
            document.getElementById('up-attachment').value = '如主旨';
            document.getElementById('up-subject').value = '檢陳本校115學年度發展創新教學精進計畫書乙份，請 鑒核。';
            document.getElementById('up-explanation').value = '一、依據教育部115年1月15日臺高(二)字第1150001234號函辦理。\n二、本校為提升教學品質，深化數位學習成效，特研擬本計畫。\n三、隨函檢附計畫書及經費明細表各乙份。';
            document.getElementById('up-original').value = '教育部';
            document.getElementById('up-cc').value = '本校秘書室、研發處';
        } else if (category === 'parallel_downward') {
            docModeSelect.value = 'A';
            document.getElementById('up-address').value = '桃園市龜山區文化一路259號';
            document.getElementById('up-person').value = '林專員';
            document.getElementById('up-phone').value = '03-2118800分機3401';
            document.getElementById('up-fax').value = '03-2118700';
            document.getElementById('up-date-year').value = rocYear;
            document.getElementById('up-date-month').value = month;
            document.getElementById('up-date-day').value = day;
            document.getElementById('up-id-num').value = `${rocYear}${paddedMonth}00002`;
            document.getElementById('up-speed').value = '速件';
            document.getElementById('up-secrecy').value = '';
            document.getElementById('up-secrecy-duration-preset').value = '';
            document.getElementById('up-secrecy-duration').value = '';
            document.getElementById('up-attachment').value = '合約書草案乙份';
            document.getElementById('up-subject').value = '檢送本校與貴院產學合作計畫合約書草案，請 查照。';
            document.getElementById('up-explanation').value = '一、依據雙方115年3月10日合作籌備會議決議辦理。\n二、合約內容業經本校法規會審查完竣，請 貴院審閱確認後回復。\n三、如有疑義，請洽本校研發處經辦人員。';
            document.getElementById('up-original').value = '長庚醫療財團法人林口長庚紀念醫院';
            document.getElementById('up-cc').value = '本校研發處、總務處';
        } else if (category === 'contact_letter') {
            docModeSelect.value = 'A';
            paUsageMode.value = 'both';
            document.getElementById('pa-category').value = 'A';
            document.getElementById('pa-secrecy').value = '非機密';
            document.getElementById('pa-days').value = '3';
            document.getElementById('pa-years').value = '5年';
            document.getElementById('pa-doc-num').value = '115-08-001';
            document.getElementById('pa-close-year').value = '115';
            document.getElementById('pa-close-month').value = '8';
            document.getElementById('pa-close-day').value = '30';
            document.getElementById('pa-id-serial').value = '1150001';
            document.getElementById('pa-date-year').value = '115';
            document.getElementById('pa-date-month').value = '10';
            document.getElementById('pa-date-day').value = '10';

            // Send block
            document.getElementById('pa-send-receiver').value = '總務處文書組';
            document.getElementById('pa-send-subject').value = '洽請協助進行115學年度新進教師公文系統權限設定開通事宜。';
            document.getElementById('pa-send-explanation').value = '一、本校預計於8月新增教師3名，需提早開通公文製作系統。\n二、檢附新進教師名單與處室對照表各乙份。';
            document.getElementById('pa-send-dept').value = '資訊處軟體發展組';
            document.getElementById('pa-send-person').value = '王小明';
            document.getElementById('pa-send-phone').value = '3601';
            document.getElementById('pa-send-attachment').value = '新進教師名單.xlsx';
            document.getElementById('pa-send-reply-status').value = '待覆';
            document.getElementById('pa-send-reply-year').value = '115';
            document.getElementById('pa-send-reply-month').value = '8';
            document.getElementById('pa-send-reply-day').value = '25';

            // Reply block
            document.getElementById('pa-reply-receiver').value = '資訊處軟體發展組';
            document.getElementById('pa-reply-subject').value = '已完成115學年度新進教師公文系統權限設定開通，請 查照。';
            document.getElementById('pa-reply-explanation').value = '一、依 貴單位8月17日庚大業洽字第1150001號便函辦理。\n二、系統帳號密碼已以電子郵件寄送予各新進教師，即可登入使用。';
            document.getElementById('pa-reply-dept').value = '總務處文書組';
            document.getElementById('pa-reply-person').value = '李四';
            document.getElementById('pa-reply-phone').value = '3401';
            document.getElementById('pa-reply-attachment').value = '無';
            document.getElementById('pa-reply-close-status').value = '銷案';
            document.getElementById('pa-reply-year').value = '';
            document.getElementById('pa-reply-month').value = '';
            document.getElementById('pa-reply-day').value = '';
        }

        updateReplyDateControls();
        if (shouldSync) syncPreview();
    }

    // New Document Reset
    function resetDocument() {
        if (!confirm('確定要建立新公文嗎？目前編輯之未儲存變更將被清空重設。')) return;

        const category = docCategorySelect.value;
        const today = new Date();
        const rocYear = today.getFullYear() - 1911;
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const paddedMonth = String(month).padStart(2, '0');

        if (category !== 'contact_letter') {
            docModeSelect.value = 'A';
            document.getElementById('up-address').value = '桃園市龜山區文化一路259號';
            document.getElementById('up-person').value = '';
            document.getElementById('up-phone').value = '03-2118800分機';
            document.getElementById('up-fax').value = '03-2118700';
            document.getElementById('up-date-year').value = rocYear;
            document.getElementById('up-date-month').value = month;
            document.getElementById('up-date-day').value = day;
            document.getElementById('up-id-num').value = `${rocYear}${paddedMonth}00000`;
            document.getElementById('up-speed').value = '普通件';
            document.getElementById('up-secrecy').value = '';
            document.getElementById('up-secrecy-duration-preset').value = '';
            document.getElementById('up-secrecy-duration').value = '';
            document.getElementById('up-attachment').value = '';
            document.getElementById('up-subject').value = '';
            document.getElementById('up-explanation').value = '';
            document.getElementById('up-original').value = '';
            document.getElementById('up-cc').value = '';
            if (upReceiverManual) upReceiverManual.value = '';
        } else {
            docModeSelect.value = 'A';
            paUsageMode.value = 'send';
            document.getElementById('pa-category').value = 'A';
            document.getElementById('pa-secrecy').value = '非機密';
            document.getElementById('pa-days').value = '3';
            document.getElementById('pa-years').value = '5年';
            document.getElementById('pa-doc-num').value = '';
            document.getElementById('pa-close-year').value = '';
            document.getElementById('pa-close-month').value = '';
            document.getElementById('pa-close-day').value = '';
            document.getElementById('pa-id-serial').value = `${rocYear}0001`;
            document.getElementById('pa-date-year').value = rocYear;
            document.getElementById('pa-date-month').value = month;
            document.getElementById('pa-date-day').value = day;

            document.getElementById('pa-send-receiver').value = '';
            document.getElementById('pa-send-subject').value = '';
            document.getElementById('pa-send-explanation').value = '';
            document.getElementById('pa-send-dept').value = '';
            document.getElementById('pa-send-person').value = '';
            document.getElementById('pa-send-phone').value = '';
            document.getElementById('pa-send-attachment').value = '無';
            document.getElementById('pa-send-reply-status').value = '待覆';
            document.getElementById('pa-send-reply-year').value = '';
            document.getElementById('pa-send-reply-month').value = '';
            document.getElementById('pa-send-reply-day').value = '';

            document.getElementById('pa-reply-receiver').value = '';
            document.getElementById('pa-reply-subject').value = '';
            document.getElementById('pa-reply-explanation').value = '';
            document.getElementById('pa-reply-dept').value = '';
            document.getElementById('pa-reply-person').value = '';
            document.getElementById('pa-reply-phone').value = '';
            document.getElementById('pa-reply-attachment').value = '無';
            document.getElementById('pa-reply-close-status').value = '銷案';
            document.getElementById('pa-reply-year').value = '';
            document.getElementById('pa-reply-month').value = '';
            document.getElementById('pa-reply-day').value = '';
        }

        updateReplyDateControls();
        syncPreview();
    }

    // Export Draft to JSON file
    function exportDraftFile() {
        saveDraft();
        const raw = localStorage.getItem('cgu_formal_doc_draft_b5');
        if (!raw) return;

        const category = docCategorySelect.value;
        const blob = new Blob([raw], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        a.download = `CGU_公文草稿_${category}_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Import Draft from JSON file
    function importDraftFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                localStorage.setItem('cgu_formal_doc_draft_b5', JSON.stringify(data));
                loadDraft();
                alert('公文草稿載入成功！');
            } catch (err) {
                alert('草稿檔案讀取失敗，格式不相符');
                console.error(err);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    // ==========================================
    // UI Helpers (Font size, Phrase insertion, Resizer)
    // ==========================================
    function applyEditorFontSize(size) {
        const textareas = document.querySelectorAll('.editor-panel textarea, .editor-panel input, .editor-panel select');
        textareas.forEach(el => {
            el.style.fontSize = `${size}px`;
        });
    }

    function setupQuickPhrases() {
        const phraseButtons = document.querySelectorAll('.phrase-tag');
        phraseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const phrase = btn.dataset.phrase;
                const targetId = btn.dataset.target || 'up-subject';
                const targetEl = document.getElementById(targetId);
                if (!targetEl) return;

                const startPos = targetEl.selectionStart || 0;
                const endPos = targetEl.selectionEnd || 0;
                const original = targetEl.value;
                targetEl.value = original.substring(0, startPos) + phrase + original.substring(endPos);
                targetEl.focus();
                targetEl.setSelectionRange(startPos + phrase.length, startPos + phrase.length);

                handleFormInput();
            });
        });
    }

    function setupResizer() {
        const dragBar = document.getElementById('drag-bar');
        const editorPanel = document.querySelector('.editor-panel');
        if (!dragBar || !editorPanel) return;

        dragBar.setAttribute('title', '拖曳調整左右欄寬占比 (雙擊重設為系統預設占比)');

        let isDragging = false;
        dragBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragBar.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const winW = window.innerWidth;
            const clientX = e.clientX;
            // Enforce min 320px for editor and min 320px for preview
            if (clientX >= 320 && clientX <= winW - 320) {
                const ratio = (clientX / winW) * 100;
                const clamped = Math.min(75, Math.max(25, ratio));
                userCustomEditorRatio = clamped;
                editorPanel.style.width = `${clamped.toFixed(2)}%`;
                adjustPreviewScale();
            }
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

        // Double click to reset to automatic responsive proportion
        dragBar.addEventListener('dblclick', () => {
            userCustomEditorRatio = null;
            applyResponsiveSplit();
            adjustPreviewScale();
        });
    }

    function setupSecrecyPreset() {
        const presetEl = document.getElementById('up-secrecy-duration-preset');
        const durationEl = document.getElementById('up-secrecy-duration');
        if (presetEl && durationEl) {
            presetEl.addEventListener('change', () => {
                const val = presetEl.value;
                if (val && val !== 'other') {
                    durationEl.value = val;
                } else if (val === '') {
                    durationEl.value = '';
                }
                handleFormInput();
            });
        }

        const secrecySelect = document.getElementById('up-secrecy');
        const secrecyWarning = document.getElementById('secrecy-warning');
        if (secrecySelect && secrecyWarning) {
            secrecySelect.addEventListener('change', () => {
                secrecyWarning.style.display = (secrecySelect.value && secrecySelect.value !== '') ? 'block' : 'none';
            });
        }
    }

    // ==========================================
    // Event Listeners Binding
    // ==========================================
    function bindEvents() {
        // Category change
        docCategorySelect.addEventListener('change', (e) => {
            e.stopPropagation();
            handleCategoryChange(true);
        });

        // Mode change
        docModeSelect.addEventListener('change', (e) => {
            e.stopPropagation();
            handleModeChange(true);
        });

        // Recipients change check for MOE warning
        const upOriginal = document.getElementById('up-original');
        if (upOriginal) {
            upOriginal.addEventListener('change', checkMoeWarning);
        }

        // Contact Letter status changes
        const paSendReplyStatus = document.getElementById('pa-send-reply-status');
        if (paSendReplyStatus) {
            paSendReplyStatus.addEventListener('change', () => {
                updateReplyDateControls();
                handleFormInput();
            });
        }
        const paReplyCloseStatus = document.getElementById('pa-reply-close-status');
        if (paReplyCloseStatus) {
            paReplyCloseStatus.addEventListener('change', () => {
                updateReplyDateControls();
                handleFormInput();
            });
        }

        // Usage mode change
        if (paUsageMode) {
            paUsageMode.addEventListener('change', () => {
                syncUsageUI();
                saveDraft();
            });
        }

        // Font size select
        editorFontSizeSelect.addEventListener('change', (e) => {
            applyEditorFontSize(e.target.value);
            saveDraft();
        });

        // Preview live vs manual
        if (previewModeSelect) {
            previewModeSelect.addEventListener('change', (e) => {
                setLivePreviewMode(e.target.value === 'live', true);
            });
        }
        toggleLivePreview.addEventListener('change', (e) => {
            setLivePreviewMode(e.target.checked, true);
        });

        btnRefreshPreview.addEventListener('click', () => {
            syncPreview();
        });

        // Grid toggle
        toggleGrid.addEventListener('change', () => {
            updateGridDisplay();
        });

        // Zoom slider
        if (zoomSlider) {
            zoomSlider.addEventListener('input', () => {
                userHasManuallyZoomed = true;
                adjustPreviewScale();
            });
            zoomSlider.addEventListener('dblclick', () => {
                userHasManuallyZoomed = false;
                adjustPreviewScale();
            });
        }
        if (zoomValue) {
            zoomValue.addEventListener('click', () => {
                userHasManuallyZoomed = false;
                adjustPreviewScale();
            });
        }

        // Form live input debounce
        docForm.addEventListener('input', handleFormInput);
        docForm.addEventListener('change', handleFormInput);

        // Header buttons
        btnDemo.addEventListener('click', () => applyDemoData(true));
        btnNew.addEventListener('click', resetDocument);
        btnExport.addEventListener('click', exportDraftFile);
        btnImportTrigger.addEventListener('click', () => fileImport.click());
        fileImport.addEventListener('change', importDraftFile);
        btnPrint.addEventListener('click', () => {
            const category = docCategorySelect.value;
            if (category === 'contact_letter') {
                const sendStatus = document.getElementById('pa-send-reply-status').value;
                if (sendStatus === '待覆') {
                    const y = (document.getElementById('pa-send-reply-year').value || '').trim();
                    const m = (document.getElementById('pa-send-reply-month').value || '').trim();
                    const d = (document.getElementById('pa-send-reply-day').value || '').trim();
                    if (!y || !m || !d) {
                        alert('發文區覆文狀態為「待覆」，強制必須填寫完整的待覆日期（年、月、日）！');
                        if (!y) document.getElementById('pa-send-reply-year').focus();
                        else if (!m) document.getElementById('pa-send-reply-month').focus();
                        else document.getElementById('pa-send-reply-day').focus();
                        return;
                    }
                }
                const replyStatus = document.getElementById('pa-reply-close-status').value;
                if (replyStatus === '待覆') {
                    const y = (document.getElementById('pa-reply-year').value || '').trim();
                    const m = (document.getElementById('pa-reply-month').value || '').trim();
                    const d = (document.getElementById('pa-reply-day').value || '').trim();
                    if (!y || !m || !d) {
                        alert('回文區銷案狀態為「待覆」，強制必須填寫完整的待覆日期（年、月、日）！');
                        if (!y) document.getElementById('pa-reply-year').focus();
                        else if (!m) document.getElementById('pa-reply-month').focus();
                        else document.getElementById('pa-reply-day').focus();
                        return;
                    }
                }
            }
            syncPreview();
            window.print();
        });

        // Window resize re-balance
        window.addEventListener('resize', () => {
            applyResponsiveSplit();
            adjustPreviewScale();
        });
    }

    // ==========================================
    // Initialization Sequence
    // ==========================================
    function init() {
        applyResponsiveSplit();
        bindEvents();
        setupQuickPhrases();
        setupResizer();
        setupSecrecyPreset();

        const storedLive = localStorage.getItem('cgu_formal_doc_live_preview_b5');
        if (storedLive !== null) {
            setLivePreviewMode(storedLive === 'true', false);
        }

        // Check URL query search parameters or hash (e.g. ?cat=contact_letter or #cat=contact_letter)
        const hashStr = window.location.hash ? window.location.hash.replace(/^#\??/, '') : '';
        const urlParams = new URLSearchParams(window.location.search || hashStr);
        const catParam = urlParams.get('cat');
        const modeParam = urlParams.get('mode');
        const usageParam = urlParams.get('usage');

        if (catParam && ['upward', 'parallel_downward', 'contact_letter'].includes(catParam)) {
            docCategorySelect.value = catParam;
            handleCategoryChange(false);
            applyDemoData(false);
            if (modeParam && ['A', 'B', 'C'].includes(modeParam)) {
                docModeSelect.value = modeParam;
                handleModeChange(false);
            }
            if (usageParam && ['send', 'reply', 'both'].includes(usageParam) && paUsageMode) {
                paUsageMode.value = usageParam;
            }
        } else {
            loadDraft();
            handleCategoryChange(false);
        }

        updateReplyDateControls();
        syncPreview();
    }


    init();
});
