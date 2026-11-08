import React, { useRef } from 'react';
import { 
  Printer, 
  Download, 
  RotateCcw, 
  Upload, 
  FileText, 
  Type,
  HelpCircle,
  FileSpreadsheet,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { 
  PRESET_INITIAL_ASSET, 
  PRESET_RENEW_ASSET, 
  PRESET_LABOR 
} from '../constants/formPresets';

export default function HeaderNav({ 
  onPrint, 
  onDownloadPdf, 
  onLoadPreset, 
  onReset,
  onExportJson,
  onImportJson,
  editorFontSize,
  setEditorFontSize
}) {
  const fileInputRef = useRef(null);

  // 計算返回線上函文系統之路徑 (支援 beta8 開發版、beta9 線上版、beta9off 離線版或預設首頁)
  const getBackToFormalDocUrl = () => {
    if (typeof window === 'undefined') return '../../index.html';
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    if (from && ['index_beta8', 'index_beta9', 'index_beta9off', 'index'].includes(from)) {
      return `../../${from}.html`;
    }
    if (typeof document !== 'undefined' && document.referrer) {
      if (document.referrer.includes('beta8')) return '../../index_beta8.html';
      if (document.referrer.includes('beta9off')) return '../../index_beta9off.html';
      if (document.referrer.includes('beta9')) return '../../index_beta9.html';
    }
    return '../../index.html';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      e.target.value = '';
    }
  };

  return (
    <header className="app-header no-print">
      {/* 左側 Logo 與系統標題 (比照 eFormalDoc CGU 規範) */}
      <div className="logo-area">
        {/* 長庚大學幾何 SVG Logo */}
        <svg className="cgu-logo-svg" viewBox="0 0 100 100" width="36" height="36">
          <polygon points="50,15 90,35 50,55 10,35" fill="#E39800" />
          <polygon points="50,55 50,90 90,70 90,35" fill="#C58000" />
          <polygon points="50,55 10,35 10,70 50,90" fill="#F3A91A" />
          <path d="M50,40 L65,55 L55,55 L55,75 L45,75 L45,55 L35,55 Z" fill="#FFFFFF" />
        </svg>

        <div className="logo-text">
          <h1>
            長庚大學 <span>外包工作申請單檢核表系統</span>
            <span style={{ 
              fontSize: '0.72rem', 
              background: 'var(--primary-color)', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '10px', 
              fontWeight: 'bold', 
              marginLeft: '6px' 
            }}>
              正式版
            </span>
          </h1>
          <p>CGU Online Outsourcing Checklist System · 嚴格符合單頁 A4 與 14pt 字體規範</p>
        </div>
      </div>

      {/* 右側工具操作按鈕區 */}
      <div className="header-actions">
        {/* 編輯區字級切換 (比照 index_beta7.html 貼心設計) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: '4px' }}>
          <label 
            htmlFor="editor-font-size-select" 
            style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-dark)', whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <Type style={{ width: '15px', height: '15px' }} /> 編輯字級:
          </label>
          <select 
            id="editor-font-size-select"
            value={editorFontSize}
            onChange={(e) => setEditorFontSize(Number(e.target.value))}
            style={{ 
              padding: '5px 8px', 
              borderRadius: 'var(--radius)', 
              border: '1px solid var(--border-color)', 
              fontSize: '0.85rem', 
              fontWeight: 500, 
              background: '#fff', 
              color: 'var(--text-dark)', 
              cursor: 'pointer' 
            }}
          >
            <option value="14">14 px</option>
            <option value="15">15 px</option>
            <option value="16">16 px (標準)</option>
            <option value="17">17 px</option>
            <option value="18">18 px</option>
            <option value="20">20 px</option>
          </select>
        </div>

        {/* 載入公文範本選單 */}
        <div className="relative inline-block text-left">
          <select
            onChange={(e) => {
              if (e.target.value === 'preset_renew') onLoadPreset(PRESET_RENEW_ASSET);
              if (e.target.value === 'preset_initial') onLoadPreset(PRESET_INITIAL_ASSET);
              if (e.target.value === 'preset_labor') onLoadPreset(PRESET_LABOR);
              e.target.value = '';
            }}
            defaultValue=""
            className="btn btn-secondary"
            style={{ 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--primary-color)', 
              borderColor: 'var(--primary-color)', 
              fontWeight: 600,
              padding: '7px 12px'
            }}
          >
            <option value="" disabled>⚡ 載入公文範例...</option>
            <option value="preset_renew">範本1: 長庚公文續外包維護案（142萬資產）</option>
            <option value="preset_initial">範本2: 首次外包設備維護案（自動算比例）</option>
            <option value="preset_labor">範本3: 純勞務案（非資產自動免填）</option>
          </select>
        </div>

        {/* 切換至線上函文製作系統 */}
        <a
          href={getBackToFormalDocUrl()}
          className="btn btn-secondary"
          title="切換至長庚大學線上函文製作系統"
          style={{ textDecoration: 'none' }}
        >
          <FileText style={{ width: '15px', height: '15px' }} />
          <span>線上函文系統</span>
        </a>

        {/* 新建/清空 */}
        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary"
          title="新建並清空表單"
        >
          <RotateCcw style={{ width: '15px', height: '15px' }} />
          <span>新建</span>
        </button>

        {/* 匯出公文 JSON 備份檔 */}
        <button
          type="button"
          onClick={onExportJson}
          className="btn btn-secondary"
          title="匯出 JSON 公文資料備份"
        >
          <Download style={{ width: '15px', height: '15px' }} />
          <span>匯出資料</span>
        </button>

        {/* 匯入公文 JSON 備份檔 */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-secondary"
          title="匯入 JSON 公文備份檔"
        >
          <Upload style={{ width: '15px', height: '15px' }} />
          <span>匯入資料</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".json" 
          style={{ display: 'none' }} 
        />

        {/* 直接下載 PDF */}
        <button
          type="button"
          onClick={onDownloadPdf}
          className="btn btn-secondary"
          title="純前端直接下載 PDF"
        >
          <FileDown style={{ width: '15px', height: '15px' }} />
          <span>下載 PDF</span>
        </button>

        {/* 高清列印 / 另存為 PDF (主要按鈕) */}
        <button
          type="button"
          onClick={onPrint}
          className="btn btn-primary"
          title="瀏覽器高清列印 / 另存為 PDF"
        >
          <Printer style={{ width: '16px', height: '16px' }} />
          <span>列印 / PDF</span>
        </button>
      </div>
    </header>
  );
}
