import React, { useState, useEffect, useRef } from 'react';
import HeaderNav from './components/HeaderNav';
import FormControls from './components/FormControls';
import A4PreviewLandscape from './components/A4PreviewLandscape';
import { INITIAL_FORM_DATA, PRESET_RENEW_ASSET } from './constants/formPresets';
import { validateChecklist } from './utils/validation';
import { exportToPdf } from './utils/pdfExport';
import { 
  Eye, 
  RefreshCw, 
  Sliders, 
  AlertTriangle, 
  X,
  FileCheck2
} from 'lucide-react';

const STORAGE_KEY = 'outsourcing_check_form_v3';

export default function App() {
  // 表單資料狀態
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : PRESET_RENEW_ASSET;
    } catch {
      return PRESET_RENEW_ASSET;
    }
  });

  // 預覽縮放倍率 (預設 85%)
  const [zoomScale, setZoomScale] = useState(0.85);

  // 編輯區字級大小 (比照 index_beta7.html)
  const [editorFontSize, setEditorFontSize] = useState(16);

  // 即時更新預覽開關 (比照 index_beta7.html)
  const [livePreview, setLivePreview] = useState(true);

  // 必填驗證失敗訊息彈窗
  const [validationErrors, setValidationErrors] = useState(null);

  // 左側面板寬度拖曳相關 Ref
  const editorPanelRef = useRef(null);
  const dragBarRef = useRef(null);
  const isDraggingRef = useRef(false);

  // 自動存檔至 LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (e) {
      console.error('LocalStorage 存檔失敗:', e);
    }
  }, [formData]);

  // 設定編輯區字級 CSS 變數
  useEffect(() => {
    document.documentElement.style.setProperty('--editor-font-size', `${editorFontSize}px`);
  }, [editorFontSize]);

  // 拖曳調整左右欄寬 (比照 eFormalDoc index_beta7.html 核心實作)
  useEffect(() => {
    const dragBar = dragBarRef.current;
    const editorPanel = editorPanelRef.current;
    if (!dragBar || !editorPanel) return;

    const handleMouseDown = () => {
      isDraggingRef.current = true;
      dragBar.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const winW = window.innerWidth;
      const clientX = e.clientX;
      // 限制左欄與右欄最小各 340px
      if (clientX >= 340 && clientX <= winW - 340) {
        const pct = (clientX / winW) * 100;
        editorPanel.style.width = `${pct}%`;
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        dragBar.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    const handleDblClick = () => {
      editorPanel.style.width = '45%'; // 連按兩下重設為預設 45%
    };

    dragBar.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    dragBar.addEventListener('dblclick', handleDblClick);

    return () => {
      dragBar.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      dragBar.removeEventListener('dblclick', handleDblClick);
    };
  }, []);

  // 動態設置列印 orientation 標籤 (固定 A4 橫式)
  const setupPrintOrientation = () => {
    let styleEl = document.getElementById('dynamic-print-page-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-print-page-style';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `@media print { @page { size: A4 landscape; margin: 6mm 8mm; } }`;
  };

  // 驗證表單並阻擋
  const checkValidation = () => {
    const { isValid, errors } = validateChecklist(formData);
    if (!isValid) {
      setValidationErrors(errors);
      return false;
    }
    setValidationErrors(null);
    return true;
  };

  // 列印 / 另存 PDF (固定橫式)
  const handlePrint = () => {
    if (!checkValidation()) return;
    setupPrintOrientation();
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // 直接下載 PDF (固定橫式)
  const handleDownloadPdf = async () => {
    if (!checkValidation()) return;
    const filename = `外包工作申請單作業檢核表_${formData.outsourceType === 'initial' ? '首次外包' : '續外包'}.pdf`;
    await exportToPdf('a4-print-target-landscape', filename, true);
  };

  // 匯出 JSON 資料備份 (比照 index_beta7.html 匯出檔功能)
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `外包檢核表備份_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 匯入 JSON 資料備份
  const handleImportJson = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setFormData(imported);
        alert('公文檢核表資料匯入成功！');
      } catch (err) {
        alert('匯入失敗：檔案格式不正確，請選擇有效的檢核表 JSON 檔案。');
      }
    };
    reader.readAsText(file);
  };

  // 載入預設公文範本
  const handleLoadPreset = (preset) => {
    if (confirm('確定要載入此公文範例嗎？未儲存的異動將被替換。')) {
      setFormData(preset);
      setValidationErrors(null);
    }
  };

  // 重設表單
  const handleReset = () => {
    if (confirm('確定要清空並重設為初始狀態嗎？')) {
      setFormData(INITIAL_FORM_DATA);
      localStorage.removeItem(STORAGE_KEY);
      setValidationErrors(null);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* 頂部導覽列 (比照 index_beta7.html) */}
      <HeaderNav
        onPrint={handlePrint}
        onDownloadPdf={handleDownloadPdf}
        onLoadPreset={handleLoadPreset}
        onReset={handleReset}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        editorFontSize={editorFontSize}
        setEditorFontSize={setEditorFontSize}
      />

      {/* 必填驗證未通過提示彈窗 */}
      {validationErrors && validationErrors.length > 0 && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            border: '2px solid #FCA5A5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontWeight: 'bold', fontSize: '1rem' }}>
                <AlertTriangle style={{ width: '20px', height: '20px' }} />
                <span>檢核表尚有必選項未勾選或未填寫</span>
              </div>
              <button
                type="button"
                onClick={() => setValidationErrors(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ margin: '14px 0' }}>
              <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '10px' }}>
                依據線上公文檢核表必選規則與備註規定，必須完成下列項次確認或資料填寫，方可列印或匯出 PDF：
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {validationErrors.map((err, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#FEF2F2', color: '#991B1B', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', border: '1px solid #FECACA' }}>
                    <span style={{ fontWeight: 'bold', color: '#DC2626' }}>•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setValidationErrors(null)}
                className="btn btn-primary"
                style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
              >
                我知道了，前往補填
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 主工作區 (左欄編輯器 + 拖曳中線 + 右欄預覽區) */}
      <div className="app-container">
        
        {/* 左側編輯面板 (.editor-panel) */}
        <aside className="editor-panel" ref={editorPanelRef}>
          <FormControls 
            data={formData} 
            onChange={setFormData} 
          />
        </aside>

        {/* 拖曳調整寬度分割線 (.drag-bar) */}
        <div 
          className="drag-bar" 
          ref={dragBarRef} 
          title="拖曳調整左右欄寬占比 (連按兩下重設為 45%)"
        />

        {/* 右側預覽面板 (.preview-panel) */}
        <main className="preview-panel">
          
          {/* 預覽工具列 (.preview-toolbar 比照 index_beta7.html) */}
          <div className="preview-toolbar no-print">
            <div className="preview-toolbar-title">
              <Eye style={{ width: '18px', height: '18px', color: 'var(--primary-color)' }} />
              <span>A4 橫式檢核表排版預覽</span>
            </div>

            <div className="preview-options">
              {/* 縮放滑桿 (比照 index_beta7.html #zoom-slider) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                <span>🔍 比例調整:</span>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={Math.round(zoomScale * 100)} 
                  onChange={(e) => setZoomScale(Number(e.target.value) / 100)}
                  style={{ width: '90px', cursor: 'pointer', accentColor: 'var(--primary-color)' }} 
                  title="拖曳調整縮放比例；連按兩下重設為 85%"
                  onDoubleClick={() => setZoomScale(0.85)}
                />
                <span 
                  onClick={() => setZoomScale(0.85)}
                  style={{ fontWeight: 'bold', minWidth: '42px', cursor: 'pointer', fontFamily: 'monospace' }} 
                  title="點擊重設為 85%"
                >
                  {Math.round(zoomScale * 100)}%
                </span>
              </div>

              {/* 即時預覽切換開關 (比照 index_beta7.html #toggle-live-preview) */}
              <label className="toggle-switch" title="切換輸入時即時更新預覽">
                <input 
                  type="checkbox" 
                  checked={livePreview} 
                  onChange={(e) => setLivePreview(e.target.checked)} 
                />
                <span className="slider"></span>
                即時預覽
              </label>
            </div>
          </div>

          {/* A4 紙張模擬器畫布容器 (.a4-sheet-container) */}
          <div className="a4-sheet-container">
            <div 
              style={{ 
                margin: '0 auto',
                width: 'fit-content',
                transform: `scale(${zoomScale})`, 
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className="print:transform-none"
            >
              <A4PreviewLandscape data={formData} />
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
