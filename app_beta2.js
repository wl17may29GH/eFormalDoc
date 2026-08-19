document.addEventListener('DOMContentLoaded', () => {
    // Lucide Icons initialization with safety check
    if (typeof lucide !== 'undefined') {
        try {
            lucide.createIcons();
        } catch (e) {
            console.error("Lucide failed to initialize", e);
        }
    }

    // DOM Elements
    const templateSelect = document.getElementById('template-select');
    const presetSelect = document.getElementById('preset-select');
    const docForm = document.getElementById('doc-form');
    
    // Panels
    const panelUpward = document.getElementById('panel-upward');
    const panelParallel = document.getElementById('panel-parallel');
    const a4Sheet = document.getElementById('a4-sheet');
    const toggleGrid = document.getElementById('toggle-grid');
    const a4TemplateHTML = a4Sheet ? a4Sheet.innerHTML : '';

    // Layout elements inside A4
    const layoutUpward = document.querySelector('.preview-layout-upward');
    const layoutParallel = document.querySelector('.preview-layout-parallel');

    // Toolbar Buttons
    const btnNew = document.getElementById('btn-new');
    const btnExport = document.getElementById('btn-export');
    const btnImportTrigger = document.getElementById('btn-import-trigger');
    const fileImport = document.getElementById('file-import');
    const btnPrint = document.getElementById('btn-print');

    // Presets for CGU Departments (Mapped to both formats where appropriate)
    const cguPresets = {
        president: {
            upPerson: '陳秘書', upPhone: '03-2118800分機3101', upFax: '03-2118700', upDept: '校長室',
            paSendDept: '校長室', paSendPerson: '陳秘書', paSendPhone: '3101',
            paReplyDept: '校長室', paReplyPerson: '陳秘書', paReplyPhone: '3101'
        },
        academic: {
            upPerson: '李組員', upPhone: '03-2118800分機3302', upFax: '03-2118701', upDept: '教務處',
            paSendDept: '教務處教務組', paSendPerson: '李組員', paSendPhone: '3302',
            paReplyDept: '教務處教務組', paReplyPerson: '李組員', paReplyPhone: '3302'
        },
        student: {
            upPerson: '張輔導員', upPhone: '03-2118800分機3201', upFax: '03-2118702', upDept: '學務處',
            paSendDept: '學務處課外組', paSendPerson: '張輔導員', paSendPhone: '3201',
            paReplyDept: '學務處課外組', paReplyPerson: '張輔導員', paReplyPhone: '3201'
        },
        general: {
            upPerson: '王專員', upPhone: '03-2118800分機3401', upFax: '03-2118703', upDept: '總務處',
            paSendDept: '總務處文書組', paSendPerson: '王專員', paSendPhone: '3401',
            paReplyDept: '總務處文書組', paReplyPerson: '王專員', paReplyPhone: '3401'
        },
        rd: {
            upPerson: '黃秘書', upPhone: '03-2118800分機3501', upFax: '03-2118704', upDept: '研發處',
            paSendDept: '研發處計管組', paSendPerson: '黃秘書', paSendPhone: '3501',
            paReplyDept: '研發處計管組', paReplyPerson: '黃秘書', paReplyPhone: '3501'
        },
        info: {
            upPerson: '吳工程師', upPhone: '03-2118800分機3601', upFax: '03-2118705', upDept: '資訊處',
            paSendDept: '資訊處軟體組', paSendPerson: '吳工程師', paSendPhone: '3601',
            paReplyDept: '資訊處軟體組', paReplyPerson: '吳工程師', paReplyPhone: '3601'
        }
    };

    // Prepopulate date automatically with current ROC date
    function initDate() {
        const today = new Date();
        const rocYear = today.getFullYear() - 1911;
        const month = today.getMonth() + 1;
        const day = today.getDate();

        document.getElementById('up-date-year').value = rocYear;
        document.getElementById('up-date-month').value = month;
        document.getElementById('up-date-day').value = day;
        
        // Default serial ID: [ROC Year][Padded Month]00000
        const paddedMonth = String(month).padStart(2, '0');
        const defaultId = `${rocYear}${paddedMonth}00000`;
        const upIdInput = document.getElementById('up-id-num');
        if (upIdInput) {
            upIdInput.value = defaultId;
        }
    }

    // Convert newlines to breaks and escape HTML
    function formatHTML(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\n/g, '<br>')
            .replace(/ /g, '&nbsp;');
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Convert explanation text to HTML, supporting hanging indent blocks for numbered points (Level 1-6)
    function formatExplanationHTML(text, hasPoints) {
        if (!text) return '';
        
        const lines = text.split('\n');
        let currentLevel = 0;
        
        if (hasPoints) {
            return lines.map(line => {
                const trimmed = line.trim();
                let detectedLevel = 0;
                let marker = '';
                let content = line;
                
                // Level 1: 一、 (Marker: 一、 (2em))
                if (/^[一二三四五六七八九十百]+[、]/.test(trimmed)) {
                    detectedLevel = 1;
                    const match = line.match(/^(\s*)([一二三四五六七八九十百]+[、])(.*)/);
                    if (match) {
                        marker = match[2];
                        content = match[3];
                    }
                }
                // Level 2: (一) (Marker: (一) (2em))
                else if (/^[(（][一二三四五六七八九十百]+[)）]/.test(trimmed)) {
                    detectedLevel = 2;
                    const match = line.match(/^(\s*)([(（][一二三四五六七八九十百]+[)）])(.*)/);
                    if (match) {
                        marker = match[2];
                        content = match[3];
                    }
                }
                // Level 3: 1、 (Marker: 1、 (1.5em))
                else if (/^\d+[、]/.test(trimmed)) {
                    detectedLevel = 3;
                    const match = line.match(/^(\s*)(\d+[、])(.*)/);
                    if (match) {
                        marker = match[2];
                        content = match[3];
                    }
                }
                // Level 4: (1) (Marker: (1) (1.5em))
                else if (/^[(（]\d+[)）]/.test(trimmed)) {
                    detectedLevel = 4;
                    const match = line.match(/^(\s*)([(（]\d+[)）])(.*)/);
                    if (match) {
                        marker = match[2];
                        content = match[3];
                    }
                }
                // Level 5: 甲、 (Marker: 甲、 (2em))
                else if (/^[甲乙丙丁戊己庚辛壬癸]+[、]/.test(trimmed)) {
                    detectedLevel = 5;
                    const match = line.match(/^(\s*)([甲乙丙丁戊己庚辛壬癸]+[、])(.*)/);
                    if (match) {
                        marker = match[2];
                        content = match[3];
                    }
                }
                // Level 6: (甲) (Marker: (甲) (2em))
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
                    const escapedMarker = escapeHTML(marker).replace(/ /g, '&nbsp;');
                    const escapedContent = escapeHTML(content).replace(/ /g, '&nbsp;');
                    const markerWidthClass = (detectedLevel === 3 || detectedLevel === 4) ? 'expl-marker-w15' : 'expl-marker-w2';
                    return `<div class="expl-paragraph expl-level-${detectedLevel}"><span class="${markerWidthClass}">${escapedMarker}</span>${escapedContent}</div>`;
                } else {
                    const escapedLine = escapeHTML(line).replace(/ /g, '&nbsp;');
                    if (currentLevel > 0) {
                        return `<div class="expl-paragraph expl-level-${currentLevel}-body">${escapedLine}</div>`;
                    } else {
                        return `<div class="expl-paragraph">${escapedLine}</div>`;
                    }
                }
            }).join('');
        } else {
            return lines.map(line => {
                const escapedLine = escapeHTML(line).replace(/ /g, '&nbsp;');
                return `<div class="expl-paragraph">${escapedLine}</div>`;
            }).join('');
        }
    }

    // Toggle template visibility
    function handleTemplateChange() {
        const value = templateSelect.value;
        
        // Restore single page layout before switching classes
        const container = document.querySelector('.a4-sheet-container');
        if (container && !document.getElementById('a4-sheet')) {
            container.innerHTML = `<div id="a4-sheet" class="a4-sheet show-grid">${a4TemplateHTML}</div>`;
        }
        
        const activeSheet = document.getElementById('a4-sheet');
        if (activeSheet) {
            activeSheet.className = 'a4-sheet';
            if (toggleGrid.checked) {
                activeSheet.classList.add('show-grid');
            }

            if (value === 'upward' || value === 'parallel_downward') {
                activeSheet.classList.add('template-upward');
                panelUpward.classList.remove('hidden');
                panelParallel.classList.add('hidden');
                
                // Fetch elements within activeSheet
                const layoutUp = activeSheet.querySelector('.preview-layout-upward');
                const layoutPa = activeSheet.querySelector('.preview-layout-parallel');
                if (layoutUp) layoutUp.classList.remove('hidden');
                if (layoutPa) layoutPa.classList.add('hidden');
                
                // Toggle address label wording
                const addressLabel = document.getElementById('p-up-address-label');
                if (addressLabel) {
                    addressLabel.textContent = (value === 'upward') ? '地　　址：' : '機關地址：';
                }
                
                // Toggle principal sign-off visibility (upward only)
                const principalSignoff = document.getElementById('p-up-principal-signoff');
                if (principalSignoff) {
                    if (value === 'upward') {
                        principalSignoff.classList.remove('hidden');
                    } else {
                        principalSignoff.classList.add('hidden');
                    }
                }
            } else {
                activeSheet.classList.add('template-parallel');
                panelUpward.classList.add('hidden');
                panelParallel.classList.remove('hidden');
                
                const layoutUp = activeSheet.querySelector('.preview-layout-upward');
                const layoutPa = activeSheet.querySelector('.preview-layout-parallel');
                if (layoutUp) layoutUp.classList.add('hidden');
                if (layoutPa) layoutPa.classList.remove('hidden');
            }
        }
        syncPreview();
    }

    // Sync input fields to preview pane
    function syncPreview() {
        try {
            const template = templateSelect.value;
            const today = new Date();
            const rocYear = today.getFullYear() - 1911;
            const month = today.getMonth() + 1;
            const day = today.getDate();

            if (template === 'upward' || template === 'parallel_downward') {
                const secrecyVal = document.getElementById('up-secrecy').value;
                const warningEl = document.getElementById('secrecy-warning');
                if (warningEl) {
                    warningEl.style.display = secrecyVal !== '' ? 'block' : 'none';
                }
                
                paginateDocument();
            } else {
                // Restore single page if it was paginated
                const container = document.querySelector('.a4-sheet-container');
                if (container && !document.getElementById('a4-sheet')) {
                    container.innerHTML = `<div id="a4-sheet" class="a4-sheet show-grid">${a4TemplateHTML}</div>`;
                }
                // Parallel (Business contact memo)
                const cat = document.getElementById('pa-category').value;
                document.getElementById('p-pa-cat-A').textContent = cat === 'A' ? '■A' : '□A';
                document.getElementById('p-pa-cat-B').textContent = cat === 'B' ? '■B' : '□B';
                document.getElementById('p-pa-cat-C').textContent = cat === 'C' ? '■C' : '□C';

                const secrecy = document.getElementById('pa-secrecy').value;
                document.getElementById('p-pa-sec-yes').textContent = secrecy === '機密' ? '■機密' : '□機密';
                document.getElementById('p-pa-sec-no').textContent = secrecy === '非機密' ? '■非機密' : '□非機密';

                document.getElementById('p-pa-close-date').textContent = document.getElementById('pa-close-date').value || '年 月 日';
                document.getElementById('p-pa-days').textContent = document.getElementById('pa-days').value;
                document.getElementById('p-pa-years').textContent = document.getElementById('pa-years').value;
                document.getElementById('p-pa-doc-num').textContent = document.getElementById('pa-doc-num').value;

                // Serial ID Row
                const serial = document.getElementById('pa-id-serial').value || '　　　　　　';
                document.getElementById('p-pa-id').textContent = `${rocYear} 年 ${month} 月 ${day} 日庚大業洽字第 ${serial} 號`;

                // Segment 1 (Send)
                document.getElementById('p-pa-send-receiver').textContent = document.getElementById('pa-send-receiver').value || '（受文者）';
                document.getElementById('p-pa-send-subject').innerHTML = formatHTML(document.getElementById('pa-send-subject').value);
                document.getElementById('p-pa-send-explanation').innerHTML = formatHTML(document.getElementById('pa-send-explanation').value);

                document.getElementById('p-pa-send-dept').textContent = document.getElementById('pa-send-dept').value;
                document.getElementById('p-pa-send-person').textContent = document.getElementById('pa-send-person').value;
                document.getElementById('p-pa-send-phone').textContent = document.getElementById('pa-send-phone').value;
                document.getElementById('p-pa-send-attachment').textContent = document.getElementById('pa-send-attachment').value || '無';

                const sendRepStatus = document.getElementById('pa-send-reply-status').value;
                document.getElementById('p-pa-status-free').textContent = sendRepStatus === '免覆' ? '■免覆' : '□免覆';
                document.getElementById('p-pa-status-wait').textContent = sendRepStatus === '待覆' ? '■待覆' : '□待覆';
                document.getElementById('p-pa-send-reply-date').textContent = document.getElementById('pa-send-reply-date').value || '月 日';

                // Segment 2 (Reply)
                document.getElementById('p-pa-reply-receiver').textContent = document.getElementById('pa-reply-receiver').value || '（受文者）';
                document.getElementById('p-pa-reply-subject').innerHTML = formatHTML(document.getElementById('pa-reply-subject').value);
                document.getElementById('p-pa-reply-explanation').innerHTML = formatHTML(document.getElementById('pa-reply-explanation').value);

                document.getElementById('p-pa-reply-dept').textContent = document.getElementById('pa-reply-dept').value;
                document.getElementById('p-pa-reply-person').textContent = document.getElementById('pa-reply-person').value;
                document.getElementById('p-pa-reply-phone').textContent = document.getElementById('p-pa-reply-phone').value;
                document.getElementById('p-pa-reply-attachment').textContent = document.getElementById('pa-reply-attachment').value || '無';

                const repRepStatus = document.getElementById('pa-reply-close-status').value;
                document.getElementById('p-pa-reply-status-close').textContent = repRepStatus === '銷案' ? '■銷案' : '□銷案';
                document.getElementById('p-pa-reply-status-wait').textContent = repRepStatus === '待覆' ? '■待覆' : '□待覆';
                document.getElementById('p-pa-reply-date-val').textContent = document.getElementById('pa-reply-date').value || '月 日';

                document.getElementById('p-pa-recv-time').textContent = `收文時間：${document.getElementById('pa-recv-time').value || '   年  月   日  時  分'}`;
                document.getElementById('p-pa-reply-id').textContent = `覆文字號：${document.getElementById('pa-reply-id').value || '   年  月  日           字第　　　　　　　　　　號'}`;
            }
            adjustPreviewScale();
            saveDraft();
        } catch (e) {
            console.error("syncPreview error:", e);
            alert("預覽載入錯誤，請向開發人員回報: " + e.message + "\nStack: " + e.stack);
        }
    }

    // Auto save all field values to LocalStorage
    function saveDraft() {
        const formData = {};
        const inputs = docForm.querySelectorAll('input, select, textarea');
        inputs.forEach(el => {
            formData[el.id] = el.value;
        });
        formData['template-select'] = templateSelect.value;
        formData['preset-select'] = presetSelect.value;
        localStorage.setItem('cgu_formal_doc_draft_v2', JSON.stringify(formData));
    }

    // Load Demo Data for specific template
    function applyDemoData(type) {
        initDate();
        if (type === 'upward') {
            document.getElementById('up-address').value = '桃園市龜山區文化一路259號';
            document.getElementById('up-person').value = '王大明';
            document.getElementById('up-phone').value = '03-2118800分機3302';
            document.getElementById('up-fax').value = '03-2118700';
            document.getElementById('up-receiver').value = '教育部';
            document.getElementById('up-id-num').value = '1150000001';
            document.getElementById('up-speed').value = '普通件';
            document.getElementById('up-secrecy').value = '';
            document.getElementById('up-secrecy-duration-preset').value = '';
            document.getElementById('up-secrecy-duration').value = '';
            document.getElementById('up-attachment').value = '「學術發展獎勵辦法」修正草案各乙份';
            document.getElementById('up-subject').value = '檢送本校「學術發展獎勵辦法」修正草案乙份，請 鑒核。';
            document.getElementById('up-explanation').value = '一、依據本校115學年度第1次校務會議決議辦理。\n二、檢附旨揭辦法修正對照表及修正後全文各乙份。';
            document.getElementById('up-original').value = '教育部';
            document.getElementById('up-cc').value = '本校秘書室、教務處';
        } else if (type === 'parallel_downward') {
            document.getElementById('up-address').value = '桃園市龜山區文化一路259號';
            document.getElementById('up-person').value = '李專員';
            document.getElementById('up-phone').value = '03-2118800分機3401';
            document.getElementById('up-fax').value = '03-2118703';
            document.getElementById('up-receiver').value = '長庚紀念醫院';
            document.getElementById('up-id-num').value = '1150000002';
            document.getElementById('up-speed').value = '最速件';
            document.getElementById('up-secrecy').value = '';
            document.getElementById('up-secrecy-duration-preset').value = '';
            document.getElementById('up-secrecy-duration').value = '';
            document.getElementById('up-attachment').value = '「生醫論壇計畫草案」乙份';
            document.getElementById('up-subject').value = '洽商本校與 貴院共同舉辦「2026長庚生醫論壇」相關合作事宜，請 查照。';
            document.getElementById('up-explanation').value = '一、旨揭論壇擬訂於115年11月12日於本校國際會議廳舉行。\n二、隨文檢送論壇活動計畫書草案，請 貴院惠予協助提供場地與技術支援。';
            document.getElementById('up-original').value = '長庚紀念醫院';
            document.getElementById('up-cc').value = '本校研發處、總務處';
        } else {
            // business_memo
            document.getElementById('pa-category').value = 'A';
            document.getElementById('pa-days').value = '3';
            document.getElementById('pa-years').value = '5年';
            document.getElementById('pa-secrecy').value = '非機密';
            document.getElementById('pa-doc-num').value = 'CGU-2026-0089';
            document.getElementById('pa-close-date').value = '';
            document.getElementById('pa-id-serial').value = '1150001';
            
            document.getElementById('pa-send-receiver').value = '總務處文書組';
            document.getElementById('pa-send-subject').value = '洽請協助進行115學年度新進教師公文系統權限設定開通事宜。';
            document.getElementById('pa-send-explanation').value = '一、本校預計於8月新增教師3名，需提早開通公文製作系統。\n二、檢附新進教師名單與處室對照表各乙份。';
            document.getElementById('pa-send-dept').value = '資訊處軟體發展組';
            document.getElementById('pa-send-person').value = '王小明';
            document.getElementById('pa-send-phone').value = '3601';
            document.getElementById('pa-send-attachment').value = '新進教師名單.xlsx';
            document.getElementById('pa-send-reply-status').value = '待覆';
            document.getElementById('pa-send-reply-date').value = '8月25日';

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
    }

    // Load Draft from LocalStorage
    function loadDraft() {
        const draftJSON = localStorage.getItem('cgu_formal_doc_draft_v2');
        if (draftJSON) {
            try {
                const data = JSON.parse(draftJSON);
                let loadedTemplate = data['template-select'] || 'upward';
                if (loadedTemplate === 'parallel' || loadedTemplate === 'business_memo') {
                    loadedTemplate = 'upward';
                }
                templateSelect.value = loadedTemplate;
                presetSelect.value = data['preset-select'] || 'custom';
                
                Object.keys(data).forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.value = data[id];
                    }
                });
            } catch (e) {
                console.error("Failed to load draft v2", e);
            }
        } else {
            applyDemoData(templateSelect.value);
        }
        handleTemplateChange();
    }

    // Preset loading listener
    if (presetSelect) {
        presetSelect.addEventListener('change', () => {
            const val = presetSelect.value;
            if (val !== 'custom' && cguPresets[val]) {
                const config = cguPresets[val];
                
                // Format 1 mappings
                document.getElementById('up-person').value = config.upPerson;
                document.getElementById('up-phone').value = config.upPhone;
                document.getElementById('up-fax').value = config.upFax;

                // Format 2 mappings
                document.getElementById('pa-send-dept').value = config.paSendDept;
                document.getElementById('pa-send-person').value = config.paSendPerson;
                document.getElementById('pa-send-phone').value = config.paSendPhone;

                document.getElementById('pa-reply-dept').value = config.paReplyDept;
                document.getElementById('pa-reply-person').value = config.paReplyPerson;
                document.getElementById('pa-reply-phone').value = config.paReplyPhone;

                syncPreview();
            }
        });
    }

    // Preset Phrase Tags Insert logic
    document.querySelectorAll('.phrase-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            const phrase = e.target.getAttribute('data-phrase');
            const targetId = (templateSelect.value === 'upward' || templateSelect.value === 'parallel_downward') ? 'up-subject' : 'pa-send-subject';
            const textarea = document.getElementById(targetId);
            
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = textarea.value;
                textarea.value = text.substring(0, start) + phrase + text.substring(end);
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = start + phrase.length;
                syncPreview();
            }
        });
    });

    // Secrecy duration preset selector listener
    const secrecyDurationPreset = document.getElementById('up-secrecy-duration-preset');
    const secrecyDurationInput = document.getElementById('up-secrecy-duration');
    if (secrecyDurationPreset && secrecyDurationInput) {
        secrecyDurationPreset.addEventListener('change', () => {
            const val = secrecyDurationPreset.value;
            if (val === 'other') {
                secrecyDurationInput.value = '';
                secrecyDurationInput.focus();
            } else {
                secrecyDurationInput.value = val;
            }
            syncPreview();
        });
    }

    // Detect double spaces in the Explanation textarea to prevent manual layout spacing (only alert once for typing, once for paste, no auto-replacement)
    let hasAlertedTypingSpaces = false;
    let hasAlertedPasteSpaces = false;
    const explanationInput = document.getElementById('up-explanation');
    if (explanationInput) {
        // Listen to paste event specifically to detect initial paste warning
        explanationInput.addEventListener('paste', (e) => {
            const pastedData = (e.clipboardData || window.clipboardData).getData('text');
            if (pastedData.includes('  ') || pastedData.includes('　　')) {
                if (!hasAlertedPasteSpaces) {
                    hasAlertedPasteSpaces = true;
                    alert('此公文製作為自動版型，無需自行使用空白鍵排版。');
                }
            }
        });

        // Listen to input event for typing/regular edits
        explanationInput.addEventListener('input', (e) => {
            const val = e.target.value;
            
            // If it is a paste event, let the paste listener handle the warning
            if (e.inputType === 'insertFromPaste') {
                return;
            }

            if (val.includes('  ') || val.includes('　　')) {
                if (!hasAlertedTypingSpaces) {
                    hasAlertedTypingSpaces = true;
                    alert('此公文製作為自動版型，無需自行使用空白鍵排版。');
                }
            }
        });
    }

    // Form change bindings
    docForm.addEventListener('input', syncPreview);
    templateSelect.addEventListener('change', handleTemplateChange);
    
    // Explicit binding to each individual element to guarantee real-time updates
    const bindAllInputs = () => {
        const inputs = docForm.querySelectorAll('input, select, textarea');
        inputs.forEach(el => {
            el.addEventListener('input', syncPreview);
            el.addEventListener('change', syncPreview);
            el.addEventListener('keyup', syncPreview);
        });
    };
    bindAllInputs();

    // Manual Refresh button binding
    const btnRefreshPreview = document.getElementById('btn-refresh-preview');
    if (btnRefreshPreview) {
        btnRefreshPreview.addEventListener('click', syncPreview);
    }

    toggleGrid.addEventListener('change', () => {
        const container = document.querySelector('.a4-sheet-container');
        if (!container) return;
        const allSheets = container.querySelectorAll('.a4-sheet');
        allSheets.forEach(sheet => {
            if (toggleGrid.checked) {
                sheet.classList.add('show-grid');
            } else {
                sheet.classList.remove('show-grid');
            }
        });
    });

    // Load Demo Button
    const btnDemo = document.getElementById('btn-demo');
    if (btnDemo) {
        btnDemo.addEventListener('click', () => {
            if (confirm("確定要載入此範本的模擬範例資料嗎？這將會覆蓋目前的編輯內容。")) {
                applyDemoData(templateSelect.value);
                syncPreview();
            }
        });
    }

    // New Draft Button
    btnNew.addEventListener('click', () => {
        if (confirm("確定要建立新公文嗎？這將會清除目前的編輯內容。")) {
            localStorage.removeItem('cgu_formal_doc_draft_v2');
            docForm.reset();
            initDate();
            presetSelect.value = 'custom';
            handleTemplateChange();
        }
    });

    // Export JSON draft file
    btnExport.addEventListener('click', () => {
        const draftJSON = localStorage.getItem('cgu_formal_doc_draft_v2');
        if (!draftJSON) return;

        const blob = new Blob([draftJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const name = templateSelect.value === 'upward' ? '上行文' : (templateSelect.value === 'parallel_downward' ? '平行下行文' : '業洽函');
        a.download = `長庚發函草稿_${name}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    });

    // Trigger Upload/Import File click
    btnImportTrigger.addEventListener('click', () => {
        fileImport.click();
    });

    // Read imported JSON file
    fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const data = evt.target.result;
                localStorage.setItem('cgu_formal_doc_draft_v2', data);
                loadDraft();
                alert("草稿匯入成功！");
            } catch (err) {
                alert("匯入失敗，請確認檔案格式是否正確。");
            }
        };
        reader.readAsText(file);
    });

    // Print A4 Document
    btnPrint.addEventListener('click', () => {
        window.print();
    });

    let userHasManuallyZoomed = false;

    // Scale helper for rendering the A4 page preview based on container size and zoom slider
    function adjustPreviewScale() {
        const container = document.querySelector('.a4-sheet-container');
        const zoomSlider = document.getElementById('zoom-slider');
        const zoomValue = document.getElementById('zoom-value');
        if (!container) return;
        
        const containerWidth = container.clientWidth - 80;
        const sheetWidth = 793.7; // standard A4 width
        
        // Calculate the scale needed to fit the container width (minimum is 1.0)
        const fitScale = Math.max(1.0, containerWidth / sheetWidth);
        
        let finalScale = fitScale;
        
        if (zoomSlider) {
            if (!userHasManuallyZoomed) {
                // Automatically set the slider value to match the fitScale
                const fitPercent = Math.round(fitScale * 100);
                zoomSlider.value = Math.min(200, Math.max(100, fitPercent));
                if (zoomValue) {
                    zoomValue.textContent = `${zoomSlider.value}%`;
                }
                finalScale = fitScale;
            } else {
                // Use the user's manual slider value (minimum is 1.0 / 100%)
                finalScale = parseInt(zoomSlider.value) / 100;
                if (zoomValue) {
                    zoomValue.textContent = `${zoomSlider.value}%`;
                }
            }
        }
        
        // Apply transform to ALL A4 sheets inside the container
        const allSheets = container.querySelectorAll('.a4-sheet');
        allSheets.forEach(s => {
            s.style.transform = `scale(${finalScale})`;
            s.style.transformOrigin = 'top center';
            if (finalScale > 1.0) {
                s.style.marginBottom = `${20 + 1123 * (finalScale - 1.0)}px`;
            } else {
                s.style.marginBottom = '20px';
            }
        });
    }

    // Auto-adjust letter spacing to avoid orphan characters on the last line of any block element
    function adjustElementOrphans(el) {
        if (!el) return;
        
        el.style.letterSpacing = ''; // Reset
        
        const originalHTML = el.innerHTML;
        
        // Find if there is a list marker span at the start (Level 1-6 markers)
        const markerSpan = el.querySelector('[class^="expl-marker-"]');
        let textToSplit = '';
        let markerHTML = '';
        if (markerSpan) {
            markerHTML = markerSpan.outerHTML;
            // Extract content after the marker span text
            textToSplit = el.textContent.substring(markerSpan.textContent.length).trim();
        } else {
            textToSplit = el.textContent.trim();
        }
        
        if (textToSplit.length <= 2) return;
        
        function getLastLineCharCount() {
            const chars = Array.from(textToSplit);
            // Re-render wrapping the text characters in span tags, keeping the marker span intact
            el.innerHTML = markerHTML + chars.map(c => `<span>${c}</span>`).join('');
            const spans = el.querySelectorAll('span:not([class^="expl-marker-"])');
            if (spans.length === 0) return 0;
            
            const lines = [];
            let currentTop = spans[0].getBoundingClientRect().top;
            let currentLine = [];
            
            spans.forEach(span => {
                const top = span.getBoundingClientRect().top;
                if (Math.abs(top - currentTop) > 5) {
                    lines.push(currentLine);
                    currentLine = [];
                    currentTop = top;
                }
                currentLine.push(span);
            });
            if (currentLine.length > 0) {
                lines.push(currentLine);
            }
            
            if (lines.length <= 1) {
                return -1; // No wrap
            }
            
            const lastLineText = lines[lines.length - 1].map(s => s.textContent).join('');
            const cleanText = lastLineText.replace(/[。，、；：！？\s]/g, '');
            return cleanText.length;
        }
        
        let charCount = getLastLineCharCount();
        if (charCount === 1) {
            let spacing = 0.2;
            while (spacing <= 3.0) {
                el.style.letterSpacing = `${spacing}px`;
                if (getLastLineCharCount() > 1) {
                    break;
                }
                spacing += 0.2;
            }
        }
        
        el.innerHTML = originalHTML;
    }

    // Dynamic Multi-Page Pagination Engine
    function paginateDocument() {
        const container = document.querySelector('.a4-sheet-container');
        if (!container || !a4TemplateHTML) return;
        
        // 1. Create a measurement div to measure heights in standard flow
        let measureDiv = document.getElementById('a4-measure-workspace');
        if (!measureDiv) {
            measureDiv = document.createElement('div');
            measureDiv.id = 'a4-measure-workspace';
            measureDiv.className = 'a4-sheet show-grid template-upward';
            measureDiv.style.position = 'absolute';
            measureDiv.style.left = '-9999px';
            measureDiv.style.top = '0';
            measureDiv.style.visibility = 'hidden';
            measureDiv.style.height = 'auto'; // allow it to grow for measuring
            measureDiv.style.minHeight = '0';
            document.body.appendChild(measureDiv);
        }
        
        // Populate the measure div with the template and current data
        measureDiv.innerHTML = a4TemplateHTML;
        
        // Safe DOM setter helper to prevent Null Pointer ReferenceErrors
        const setSafeText = (selector, text) => {
            const el = measureDiv.querySelector(selector);
            if (el) el.textContent = text;
        };
        const setSafeHTML = (selector, html) => {
            const el = measureDiv.querySelector(selector);
            if (el) el.innerHTML = html;
        };

        const upAddressLabel = document.getElementById('p-up-address-label');
        setSafeText('#p-up-address-label', upAddressLabel ? upAddressLabel.textContent : '地　　址：');
        setSafeText('#p-up-address', document.getElementById('up-address').value);
        setSafeText('#p-up-person', document.getElementById('up-person').value);
        setSafeText('#p-up-phone', document.getElementById('up-phone').value);
        setSafeText('#p-up-fax', document.getElementById('up-fax').value);
        setSafeText('#p-up-receiver', document.getElementById('up-receiver').value || '○○○○○○○');
        
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
        
        // Detect if explanation has points
        const explLines = explanationVal.split('\n');
        const hasPoints = explLines.some(line => {
            const trimmed = line.trim();
            return /^[一二三四五六七八九十百]+[、]/.test(trimmed) ||
                   /^[(（][一二三四五六七八九十百]+[)）]/.test(trimmed) ||
                   /^\d+[、]/.test(trimmed) ||
                   /^[(（]\d+[)）]/.test(trimmed) ||
                   /^[甲乙丙丁戊己庚辛壬癸]+[、]/.test(trimmed) ||
                   /^[(（][甲乙丙丁戊己庚辛壬癸]+[)）]/.test(trimmed);
        });
        
        const explanationSection = measureDiv.querySelector('.section-explanation');
        if (explanationSection) {
            if (!hasExplanation) {
                explanationSection.style.display = 'none';
            } else {
                explanationSection.style.display = 'block';
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
        
        setSafeText('#p-up-original', document.getElementById('up-original').value || '○○○○○○');
        setSafeText('#p-up-cc', document.getElementById('up-cc').value || '○○○○○○');
        
        // Toggle signoff block
        const signoffBlock = measureDiv.querySelector('#p-up-principal-signoff');
        if (signoffBlock) {
            if (templateSelect.value === 'upward') {
                signoffBlock.style.display = 'block';
            } else {
                signoffBlock.style.display = 'none';
            }
        }
        
        // Helper function to split paragraph into individual line elements by rendering spans
        function splitParagraphIntoLines(el, baseClass, bodyClass) {
            const originalHTML = el.innerHTML;
            
            // Find if there is a list marker span
            const markerSpan = el.querySelector('[class^="expl-marker-"]');
            let textToSplit = '';
            let markerHTML = '';
            if (markerSpan) {
                markerHTML = markerSpan.outerHTML;
                textToSplit = el.textContent.substring(markerSpan.textContent.length);
            } else {
                textToSplit = el.textContent;
            }
            
            const chars = Array.from(textToSplit);
            el.innerHTML = markerHTML + chars.map(c => `<span>${c}</span>`).join('');
            const spans = el.querySelectorAll('span:not([class^="expl-marker-"])');
            
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
            if (currentLineText) {
                lines.push(currentLineText);
            }
            
            el.innerHTML = originalHTML;
            
            return lines.map((lineText, idx) => {
                const escapedText = escapeHTML(lineText).replace(/ /g, '&nbsp;');
                const isLast = (idx === lines.length - 1);
                const suffix = isLast ? ' expl-line-last' : ' expl-line-middle';
                if (idx === 0) {
                    return {
                        html: markerHTML + escapedText,
                        class: baseClass + suffix
                    };
                } else {
                    return {
                        html: escapedText,
                        class: bodyClass + suffix
                    };
                }
            });
        }

        // 2. Measure heights of elements
        // Target body area height in A4 (297mm height is ~1123px at 96dpi, margin top+bottom is 2.3cm * 2 = 174px, total printable height = 949px)
        const totalPrintableHeight = 925; 
        
        // Measure header height on page 1 (red-header, contact details, receiver, metadata)
        const redHeader = measureDiv.querySelector('.red-header');
        const contactDetails = measureDiv.querySelector('.contact-details-container');
        const receiverRow = measureDiv.querySelector('.recipient-row');
        const metadataBlock = measureDiv.querySelector('.metadata-block');
        
        const headerHeight = (redHeader ? redHeader.offsetHeight : 0) + 
                             (contactDetails ? contactDetails.offsetHeight : 0) + 
                             (receiverRow ? receiverRow.offsetHeight : 0) + 
                             (metadataBlock ? metadataBlock.offsetHeight : 0) + 
                             30; // some spacing margins
        
        const page1Capacity = totalPrintableHeight - headerHeight;
        const page2Capacity = totalPrintableHeight; // Page 2+ has no headers at all!
        
        // Get content elements to distribute
        const subjectBlock = measureDiv.querySelector('.section-subject');
        const footerBlock = measureDiv.querySelector('.footer-block');
        const principalSignoff = measureDiv.querySelector('#p-up-principal-signoff');
        
        // Build items list with their heights
        const items = [];
        if (subjectBlock && subjectBlock.offsetHeight > 0) {
            items.push({ type: 'subject', html: subjectBlock.innerHTML, class: subjectBlock.className, height: subjectBlock.offsetHeight + 15 });
        }
        
        if (hasExplanation) {
            const allExplParagraphs = measureDiv.querySelectorAll('#p-up-explanation .expl-paragraph');
            allExplParagraphs.forEach(p => {
                // Auto-adjust letter spacing to avoid orphans on the last line of this paragraph
                adjustElementOrphans(p);
                const letterSpacing = p.style.letterSpacing || '';
                
                const baseClass = p.className;
                let bodyClass = baseClass + '-body';
                if (baseClass.includes('expl-level-1')) bodyClass = 'expl-paragraph expl-level-1-body';
                else if (baseClass.includes('expl-level-2')) bodyClass = 'expl-paragraph expl-level-2-body';
                else if (baseClass.includes('expl-level-3')) bodyClass = 'expl-paragraph expl-level-3-body';
                else if (baseClass.includes('expl-level-4')) bodyClass = 'expl-paragraph expl-level-4-body';
                else if (baseClass.includes('expl-level-5')) bodyClass = 'expl-paragraph expl-level-5-body';
                else if (baseClass.includes('expl-level-6')) bodyClass = 'expl-paragraph expl-level-6-body';
                else bodyClass = 'expl-paragraph';
                
                const lines = splitParagraphIntoLines(p, baseClass, bodyClass);
                lines.forEach(line => {
                    // Measure exact line height by rendering in workspace
                    const testDiv = document.createElement('div');
                    testDiv.className = line.class;
                    testDiv.innerHTML = line.html;
                    testDiv.style.letterSpacing = letterSpacing; // Apply the spacing for accurate measurement
                    measureDiv.appendChild(testDiv);
                    // Add 4px margin-bottom buffer to offsetHeight
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
        if (principalSignoff && templateSelect.value === 'upward') {
            footerItems.push(principalSignoff.cloneNode(true));
            footerHeight += principalSignoff.offsetHeight + 15;
        }
        
        // Distribute content into pages
        const pages = [];
        let currentPageItems = [];
        let currentHeight = 0;
        let isFirstPage = true;
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const capacity = isFirstPage ? page1Capacity : page2Capacity;
            
            if (currentHeight + item.height > capacity && currentPageItems.length > 0) {
                // Page is full, push page and start a new one
                pages.push({ isFirst: isFirstPage, items: currentPageItems });
                isFirstPage = false;
                currentPageItems = [item];
                currentHeight = item.height;
            } else {
                currentPageItems.push(item);
                currentHeight += item.height;
            }
        }
        
        // Now add the footer block. Does it fit on the current page?
        const finalCapacity = isFirstPage ? page1Capacity : page2Capacity;
        if (currentHeight + footerHeight > finalCapacity && currentPageItems.length > 0) {
            // Push current page
            pages.push({ isFirst: isFirstPage, items: currentPageItems });
            isFirstPage = false;
            // Place footer on a new page
            pages.push({ isFirst: isFirstPage, items: [], footer: footerItems });
        } else {
            // Fits on the current page
            pages.push({ isFirst: isFirstPage, items: currentPageItems, footer: footerItems });
        }
        
        // 3. Render pages inside container
        container.innerHTML = ''; // Clear container
        
        pages.forEach((page, index) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'a4-sheet show-grid template-upward';
            pageDiv.id = index === 0 ? 'a4-sheet' : `a4-sheet-page-${index + 1}`;
            
            // Build inner HTML for page
            if (page.isFirst) {
                // Page 1: clone headers from measureDiv
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
                        if (item.letterSpacing) {
                            lineDiv.style.letterSpacing = item.letterSpacing;
                        }
                        explContainer.querySelector('#p-up-explanation').appendChild(lineDiv);
                    }
                });
                
                p1Layout.appendChild(bodyDiv);
                
                // If footer is on this page
                if (page.footer) {
                    page.footer.forEach(foot => p1Layout.appendChild(foot));
                }
                
                pageDiv.appendChild(p1Layout);
            } else {
                // Page 2+: ONLY the lines! No header, no '說明：' label!
                const pxLayout = document.createElement('div');
                pxLayout.className = 'preview-layout-upward';
                
                const bodyDiv = document.createElement('div');
                bodyDiv.className = 'body-content';
                
                page.items.forEach(item => {
                    if (item.type === 'expl-line') {
                        const lineDiv = document.createElement('div');
                        lineDiv.className = item.class;
                        lineDiv.innerHTML = item.html;
                        if (item.letterSpacing) {
                            lineDiv.style.letterSpacing = item.letterSpacing;
                        }
                        bodyDiv.appendChild(lineDiv);
                    }
                });
                
                pxLayout.appendChild(bodyDiv);
                
                if (page.footer) {
                    page.footer.forEach(foot => pxLayout.appendChild(foot));
                }
                
                pageDiv.appendChild(pxLayout);
            }
            
            // Add page numbers at the bottom of EVERY page
            const pageNumDiv = document.createElement('div');
            pageNumDiv.className = 'page-number-footer';
            pageNumDiv.textContent = `第 ${index + 1} 頁，共 ${pages.length} 頁`;
            pageDiv.appendChild(pageNumDiv);
            
            container.appendChild(pageDiv);
        });
        
        // Re-bind grid toggle
        const isGridChecked = toggleGrid.checked;
        const allSheets = container.querySelectorAll('.a4-sheet');
        allSheets.forEach(sheet => {
            if (isGridChecked) {
                sheet.classList.add('show-grid');
            } else {
                sheet.classList.remove('show-grid');
            }
        });
    }

    // Drag resizing functionality for split screen
    const dragBar = document.getElementById('drag-bar');
    const editorPanel = document.querySelector('.editor-panel');
    const appContainer = document.querySelector('.app-container');
    const viewModeSelect = document.getElementById('view-mode-select');

    if (dragBar && editorPanel && appContainer) {
        let isDragging = false;

        dragBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragBar.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const containerWidth = appContainer.getBoundingClientRect().width;
            const mouseX = e.clientX - appContainer.getBoundingClientRect().left;
            let percentage = (mouseX / containerWidth) * 100;
            
            // Constrain between 20% and 80%
            if (percentage < 20) percentage = 20;
            if (percentage > 80) percentage = 80;
            
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

    // Zoom Slider listeners
    const zoomSlider = document.getElementById('zoom-slider');
    if (zoomSlider) {
        zoomSlider.addEventListener('input', () => {
            userHasManuallyZoomed = true;
            adjustPreviewScale();
        });
        
        // Double click the slider to reset to automatic fitScale width
        zoomSlider.addEventListener('dblclick', () => {
            userHasManuallyZoomed = false;
            adjustPreviewScale();
        });
    }

    // Editor Font Size adjust listener
    const editorFontSizeSelect = document.getElementById('editor-font-size-select');
    if (editorFontSizeSelect && editorPanel) {
        editorFontSizeSelect.addEventListener('change', () => {
            editorPanel.style.setProperty('--editor-font-size', `${editorFontSizeSelect.value}px`);
        });
        // Set initial size
        editorPanel.style.setProperty('--editor-font-size', `${editorFontSizeSelect.value}px`);
    }

    window.addEventListener('resize', adjustPreviewScale);
    
    // Initialization
    loadDraft();
    adjustPreviewScale();
});
