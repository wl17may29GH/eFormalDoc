import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Calculator, 
  Layers,
  Settings,
  Info,
  User,
  CheckCircle,
  FileText,
  BookOpen
} from 'lucide-react';
import { calculateAnnualRatio } from '../utils/validation';

export default function FormControls({ data, onChange }) {
  const isInitial = data.outsourceType === 'initial';
  const isRenew = data.outsourceType === 'renew';
  const isAsset = data.purposeType === 'asset';

  // 卡片展開/收合狀態
  const [cardStates, setCardStates] = useState({
    core: true,       // 發包基本條件
    common: true,     // 共同項目
    exclusive: true,  // 獨立項目
    operator: true,   // 經辦人員署名
    guidelines: false // 外包檢核作業須知 (預設收合)
  });

  const toggleCard = (cardKey) => {
    setCardStates(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  const expandAll = () => {
    setCardStates({
      core: true,
      common: true,
      exclusive: true,
      operator: true,
      guidelines: true
    });
  };

  const collapseAux = () => {
    setCardStates({
      core: true,
      common: true,
      exclusive: true,
      operator: true,
      guidelines: false
    });
  };

  // 自動計算資產總額
  const calculateTotalAssetValue = () => {
    return data.item6_assets.reduce((sum, item) => {
      const val = parseFloat((item.value || '0').replace(/,/g, ''));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  };

  const handleAssetChange = (index, field, value) => {
    const updated = [...data.item6_assets];
    updated[index][field] = value;
    onChange({ ...data, item6_assets: updated });
  };

  const addAssetRow = () => {
    onChange({
      ...data,
      item6_assets: [...data.item6_assets, { no: '', value: '' }]
    });
  };

  const removeAssetRow = (index) => {
    const updated = data.item6_assets.filter((_, i) => i !== index);
    onChange({ ...data, item6_assets: updated });
  };

  // 第3次修正二：以百分比格式呈現，取到小數點後第1位，於第2位四捨五入到第1位
  const handleAutoCalculateRatio = () => {
    const totalAsset = calculateTotalAssetValue();
    const ratioStr = calculateAnnualRatio(data.item14_annual_fee, totalAsset);
    if (ratioStr) {
      onChange({ ...data, item14_ratio: ratioStr });
    } else {
      alert('請先填寫固定資產取得價值，並輸入本案「一年維護費(未稅)」，以自動計算占比！');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* 頂部操作工具條 */}
      <div className="editor-section-header">
        <span className="editor-section-title">
          <Layers style={{ width: '18px', height: '18px', color: 'var(--primary-color)' }} />
          檢核表編輯面板
        </span>
        <div className="editor-quick-actions">
          <button type="button" className="btn-xs" onClick={expandAll} title="展開所有卡片">
            展開全部
          </button>
          <button type="button" className="btn-xs" onClick={collapseAux} title="僅保留核心檢核卡片">
            收合非核心
          </button>
        </div>
      </div>

      {/* 1. 發包基本條件卡片 */}
      <section 
        className={`collapsible-card ${cardStates.core ? 'expanded' : 'collapsed'}`}
        style={{ borderLeft: '3px solid var(--primary-color)' }}
      >
        <div className="card-header-bar" onClick={() => toggleCard('core')}>
          <div className="card-title-left">
            <Settings style={{ width: '18px', height: '18px', color: 'var(--primary-color)' }} />
            <span>一、發包基本條件</span>
            <span className="card-badge-summary">
              {isInitial ? '首次外包' : '續外包'} · {isAsset ? '維護特定標的' : '純勞務'}
            </span>
          </div>
          <span className="toggle-arrow">▼</span>
        </div>

        <div className="card-body-content">
          <div className="form-grid">
            {/* 發包類型 */}
            <div className="form-group col-span-2">
              <label>發包類型</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => onChange({ ...data, outsourceType: 'initial' })}
                  className={`btn ${isInitial ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                >
                  {isInitial ? <CheckSquare style={{ width: '16px', height: '16px' }} /> : <Square style={{ width: '16px', height: '16px' }} />}
                  首次外包
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...data, outsourceType: 'renew' })}
                  className={`btn ${isRenew ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                >
                  {isRenew ? <CheckSquare style={{ width: '16px', height: '16px' }} /> : <Square style={{ width: '16px', height: '16px' }} />}
                  續外包重新發包
                </button>
              </div>
            </div>

            {/* 發包目的 */}
            <div className="form-group col-span-2">
              <label>發包目的</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => onChange({ ...data, purposeType: 'asset' })}
                  className={`btn ${isAsset ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                >
                  {isAsset ? <CheckSquare style={{ width: '16px', height: '16px' }} /> : <Square style={{ width: '16px', height: '16px' }} />}
                  維護特定標的 (資產類)
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...data, purposeType: 'service' })}
                  className={`btn ${!isAsset ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                >
                  {!isAsset ? <CheckSquare style={{ width: '16px', height: '16px' }} /> : <Square style={{ width: '16px', height: '16px' }} />}
                  純勞務 (非資產類)
                </button>
              </div>
            </div>

            {/* 標的性質標籤 (文件規範版本已移除) */}
            <div className="col-span-2" style={{ marginTop: '4px' }}>
              <div style={{ 
                background: 'var(--primary-light)', 
                color: '#B45309', 
                border: '1px solid #FCD34D', 
                borderRadius: '6px', 
                padding: '7px 12px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                標的性質：{isAsset ? '固定資產設備全責保養' : '日常勞務承攬'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 共同檢核項目卡片 */}
      <section 
        className={`collapsible-card ${cardStates.common ? 'expanded' : 'collapsed'}`}
        style={{ borderLeft: '3px solid #3B82F6' }}
      >
        <div className="card-header-bar" onClick={() => toggleCard('common')}>
          <div className="card-title-left">
            <CheckCircle style={{ width: '18px', height: '18px', color: '#3B82F6' }} />
            <span>二、共同檢核項目</span>
            <span className="card-badge-summary">共 7 項</span>
          </div>
          <span className="toggle-arrow">▼</span>
        </div>

        <div className="card-body-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* 項序 1 */}
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: '#1E293B' }}>
                  外包工作申請單時效 <span style={{ color: '#EF4444' }}>*</span>
                </span>
                <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                  {data.item1_time_checked 
                    ? '已提前到期日或需求日至少二個月辦理。' 
                    : '未提前辦理，請填寫延遲原因說明：'}
                </p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input
                  type="checkbox"
                  checked={data.item1_time_checked}
                  onChange={(e) => onChange({ ...data, item1_time_checked: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                />
                <span style={{ fontWeight: 600, color: data.item1_time_checked ? '#1D4ED8' : '#64748B' }}>
                  已提前辦理 [ ✓ ]
                </span>
              </label>
            </div>
            {!data.item1_time_checked && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #CBD5E1' }}>
                <label style={{ fontWeight: 'bold', color: '#DC2626', display: 'block', marginBottom: '4px' }}>
                  * 請說明延遲原因（未提前辦理時必填）：
                </label>
                <input
                  type="text"
                  value={data.item1_delay_reason}
                  onChange={(e) => onChange({ ...data, item1_delay_reason: e.target.value })}
                  placeholder="請填寫延遲辦理原因..."
                  style={{ width: '100%', padding: '6px 10px', border: '1px solid #F87171', borderRadius: '4px', background: '#FEF2F2' }}
                />
              </div>
            )}
          </div>

          {/* 項序 2 */}
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#1E293B' }}>
                付款週期 <span style={{ color: '#EF4444' }}>*</span>
              </span>
              <p style={{ color: 'var(--text-muted)' }}>已確認申請單與承攬書之付款週期一致。</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={data.item2_payment_checked}
                onChange={(e) => onChange({ ...data, item2_payment_checked: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
              />
              <span style={{ fontWeight: 600, color: data.item2_payment_checked ? '#1D4ED8' : '#64748B' }}>
                一致 [ ✓ ]
              </span>
            </label>
          </div>

          {/* 項序 3 */}
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#1E293B' }}>
                法務室業洽函 <span style={{ color: '#EF4444' }}>*</span>
              </span>
              <p style={{ color: 'var(--text-muted)' }}>已提供法務室業洽函。</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={data.item3_legal_letter_checked}
                onChange={(e) => onChange({ ...data, item3_legal_letter_checked: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
              />
              <span style={{ fontWeight: 600, color: data.item3_legal_letter_checked ? '#1D4ED8' : '#64748B' }}>
                已提供 [ ✓ ]
              </span>
            </label>
          </div>

          {/* 項序 4 */}
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#1E293B' }}>
                法務室斧正意見 <span style={{ color: '#EF4444' }}>*</span>
              </span>
              <p style={{ color: 'var(--text-muted)' }}>已提供法務室斧正意見。</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={data.item4_legal_opinion_checked}
                onChange={(e) => onChange({ ...data, item4_legal_opinion_checked: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
              />
              <span style={{ fontWeight: 600, color: data.item4_legal_opinion_checked ? '#1D4ED8' : '#64748B' }}>
                已提供 [ ✓ ]
              </span>
            </label>
          </div>

          {/* 項序 5 */}
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#1E293B' }}>
                修正後承攬書/合約書 <span style={{ color: '#EF4444' }}>*</span>
              </span>
              <p style={{ color: 'var(--text-muted)' }}>已提供。（初審階段可保留修訂痕跡；上傳 MIS 定稿檔案不得有任何註解痕跡）</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={data.item5_contract_checked}
                onChange={(e) => onChange({ ...data, item5_contract_checked: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
              />
              <span style={{ fontWeight: 600, color: data.item5_contract_checked ? '#1D4ED8' : '#64748B' }}>
                已提供 [ ✓ ]
              </span>
            </label>
          </div>

          {/* 項序 6: 固定資產建檔證明 */}
          <div style={{ 
            background: isAsset ? 'var(--primary-light)' : '#F8FAFC', 
            padding: '12px', 
            borderRadius: '6px', 
            border: isAsset ? '1px solid #FCD34D' : '1px solid #E2E8F0' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: '#1E293B' }}>
                  固定資產建檔證明 (*含取得價值)
                  {isAsset && <span style={{ color: '#EF4444', marginLeft: '4px' }}>* 必填</span>}
                </span>
                <p style={{ color: 'var(--text-muted)' }}>
                  {isAsset ? '需填寫請購案號與取得價值。' : '非資產設備類維護案得免附。'}
                </p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={data.item6_asset_checked}
                  onChange={(e) => onChange({ ...data, item6_asset_checked: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                />
                <span style={{ fontWeight: 600, color: data.item6_asset_checked ? '#1D4ED8' : '#64748B' }}>
                  {data.item6_asset_checked ? '已提供 [ ✓ ]' : '免填'}
                </span>
              </label>
            </div>

            {/* 資產清單 (多筆) */}
            {data.item6_asset_checked && (
              <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>請購案號與取得價值清單：</span>
                  <button
                    type="button"
                    onClick={addAssetRow}
                    className="btn-xs"
                    style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Plus style={{ width: '14px', height: '14px' }} /> 新增案號
                  </button>
                </div>

                {data.item6_assets.map((asset, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', width: '18px' }}>{index + 1}.</span>
                    <input
                      type="text"
                      placeholder="案號 (例: H402V0)"
                      value={asset.no}
                      onChange={(e) => handleAssetChange(index, 'no', e.target.value)}
                      style={{ width: '130px', padding: '5px 8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                      <span style={{ color: 'var(--text-muted)' }}>價值:</span>
                      <input
                        type="text"
                        placeholder="取得價值(未稅)"
                        value={asset.value}
                        onChange={(e) => handleAssetChange(index, 'value', e.target.value)}
                        style={{ flex: 1, padding: '5px 8px', border: '1px solid var(--border-color)', borderRadius: '4px', fontFamily: 'monospace' }}
                      />
                      <span style={{ color: 'var(--text-muted)' }}>元(未稅)</span>
                    </div>
                    {data.item6_assets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAssetRow(index)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}
                        title="刪除此筆"
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    )}
                  </div>
                ))}

                <div style={{ textAlign: 'right', color: '#1E293B', fontWeight: 600, borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
                  合計固定資產原取得價值：
                  <span style={{ color: 'var(--primary-color)', fontFamily: 'monospace', fontWeight: 'bold', marginLeft: '4px' }}>
                    {calculateTotalAssetValue().toLocaleString()}
                  </span> 元 (未稅)
                </div>
              </div>
            )}
          </div>

          {/* 項序 7 */}
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#1E293B' }}>
                施工作業安全告知單 <span style={{ color: '#EF4444' }}>*</span>
              </span>
              <p style={{ color: 'var(--text-muted)' }}>已提供，工期與承攬書一致並完成簽名。</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={data.item7_safety_checked}
                onChange={(e) => onChange({ ...data, item7_safety_checked: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
              />
              <span style={{ fontWeight: 600, color: data.item7_safety_checked ? '#1D4ED8' : '#64748B' }}>
                已簽名 [ ✓ ]
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* 3. 獨立檢核項目卡片 */}
      <section 
        className={`collapsible-card ${cardStates.exclusive ? 'expanded' : 'collapsed'}`}
        style={{ borderLeft: '3px solid #10B981' }}
      >
        <div className="card-header-bar" onClick={() => toggleCard('exclusive')}>
          <div className="card-title-left">
            <CheckCircle style={{ width: '18px', height: '18px', color: '#10B981' }} />
            <span>三、獨立檢核項目</span>
            <span className="card-badge-summary">
              {isInitial ? '首次外包' : '續外包'}
            </span>
          </div>
          <span className="toggle-arrow">▼</span>
        </div>

        <div className="card-body-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* 外包期間 */}
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#1E293B' }}>
                外包期間 <span style={{ color: '#EF4444' }}>*</span>
              </span>
              <p style={{ color: 'var(--text-muted)' }}>
                {isInitial ? '起訖時間已接續保固到期日或招商需求日。' : '起訖時間已接續原合約到期日。'}
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={data.item9_checked}
                onChange={(e) => onChange({ ...data, item9_checked: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
              />
              <span style={{ fontWeight: 600, color: data.item9_checked ? '#1D4ED8' : '#64748B' }}>
                已接續 [ ✓ ]
              </span>
            </label>
          </div>

          {/* 外包到期提示單 */}
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#1E293B' }}>
                外包到期提示單 {isRenew && <span style={{ color: '#EF4444' }}>*</span>}
              </span>
              <p style={{ color: 'var(--text-muted)' }}>
                {isInitial ? '首次外包此項為略。' : '續外包案件已提供到期提示單。'}
              </p>
            </div>
            {isInitial ? (
              <span style={{ background: '#E2E8F0', color: '#64748B', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>略</span>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={data.item10_checked}
                  onChange={(e) => onChange({ ...data, item10_checked: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                />
                <span style={{ fontWeight: 600, color: data.item10_checked ? '#1D4ED8' : '#64748B' }}>
                  已提供 [ ✓ ]
                </span>
              </label>
            )}
          </div>

          {/* 現狀外包單價 */}
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#1E293B' }}>
                現狀外包單價(未稅) {isRenew && <span style={{ color: '#EF4444' }}>*</span>}
              </span>
              <p style={{ color: 'var(--text-muted)' }}>
                {isInitial ? '首次外包此項為略。' : '已確認與「外包到期提示單」一致。'}
              </p>
            </div>
            {isInitial ? (
              <span style={{ background: '#E2E8F0', color: '#64748B', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>略</span>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={data.item11_checked}
                  onChange={(e) => onChange({ ...data, item11_checked: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                />
                <span style={{ fontWeight: 600, color: data.item11_checked ? '#1D4ED8' : '#64748B' }}>
                  一致 [ ✓ ]
                </span>
              </label>
            )}
          </div>

          {/* 擬外包資料 */}
          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontWeight: 'bold', color: '#1E293B', display: 'block', marginBottom: '2px' }}>
              擬外包資料 (*金額皆未稅) <span style={{ color: '#EF4444' }}>*</span>
            </span>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
              月工作量、單價、總金額及付款週期等內容，均與相關佐證資料相符。
            </p>

            {isInitial ? (
              <div style={{ background: '#ECFDF5', color: '#065F46', padding: '8px 12px', borderRadius: '4px', fontWeight: 600 }}>
                已核對佐證資料相符 [ ✓ ]
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onChange({ ...data, item12_type: 'same' })}
                  className={`btn ${data.item12_type === 'same' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                >
                  {data.item12_type === 'same' ? <CheckSquare style={{ width: '16px', height: '16px' }} /> : <Square style={{ width: '16px', height: '16px' }} />}
                  與前案一致
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...data, item12_type: 'diff' })}
                  className={`btn ${data.item12_type === 'diff' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                >
                  {data.item12_type === 'diff' ? <CheckSquare style={{ width: '16px', height: '16px' }} /> : <Square style={{ width: '16px', height: '16px' }} />}
                  與前案不一致
                </button>
              </div>
            )}
          </div>

          {/* 保固證明 (僅資產類顯示) */}
          {isAsset && (
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: '#1E293B' }}>
                  保固證明
                  {isInitial && <span style={{ color: '#EF4444', marginLeft: '4px' }}>* 必選</span>}
                </span>
                <p style={{ color: 'var(--text-muted)' }}>
                  {isInitial ? '首次外包資產案已提供保固證明。' : '續外包案件可免。'}
                </p>
              </div>
              {isRenew ? (
                <span style={{ background: '#E2E8F0', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>可免 [ ✓ ]</span>
              ) : (
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={data.item13_checked}
                    onChange={(e) => onChange({ ...data, item13_checked: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                  />
                  <span style={{ fontWeight: 600, color: data.item13_checked ? '#1D4ED8' : '#64748B' }}>
                    已提供 [ ✓ ]
                  </span>
                </label>
              )}
            </div>
          )}

          {/* 報價單 */}
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontWeight: 'bold', color: '#1E293B', display: 'block', marginBottom: '2px' }}>
              報價單 {data.item14_ratio ? `(約占 ${data.item14_ratio})` : ''}
              {isInitial && isAsset && <span style={{ color: '#EF4444', marginLeft: '4px' }}>* 必填</span>}
            </span>

            {/* 年度維護費與占比計算 (第3次修正二：取到小數點第1位百分比) */}
            <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', marginTop: '6px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                年度維護費占比計算：本案一年維護費(未稅) ÷ 原固定資產取得價值(未稅)（以百分比呈現，四捨五入至第1位）。
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                    本案一年維護費(未稅元)
                  </label>
                  <input
                    type="text"
                    value={data.item14_annual_fee}
                    onChange={(e) => onChange({ ...data, item14_annual_fee: e.target.value })}
                    placeholder="例: 352,800"
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '4px', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                    計算占比結果 (% 格式)
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      value={data.item14_ratio}
                      onChange={(e) => onChange({ ...data, item14_ratio: e.target.value })}
                      placeholder="例: 20.7%"
                      style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--primary-color)' }}
                    />
                    <button
                      type="button"
                      onClick={handleAutoCalculateRatio}
                      className="btn-xs"
                      style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Calculator style={{ width: '14px', height: '14px' }} /> 自動算
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 續外包模式調價比對 */}
            {isRenew && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #CBD5E1' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>
                  續約價格比對前案：
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => onChange({ ...data, item14_renew_type: 'same' })}
                    className={`btn ${data.item14_renew_type === 'same' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center' }}
                  >
                    {data.item14_renew_type === 'same' ? <CheckSquare style={{ width: '16px', height: '16px' }} /> : <Square style={{ width: '16px', height: '16px' }} />}
                    與前案一致
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...data, item14_renew_type: 'diff' })}
                    className={`btn ${data.item14_renew_type === 'diff' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center' }}
                  >
                    {data.item14_renew_type === 'diff' ? <CheckSquare style={{ width: '16px', height: '16px' }} /> : <Square style={{ width: '16px', height: '16px' }} />}
                    與前案不一致，已補充佐證附件
                  </button>
                </div>
                {data.item14_renew_type === 'diff' && (
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ color: '#DC2626', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                      * 差異原因及合理性說明（必填）：
                    </label>
                    <textarea
                      rows={2}
                      value={data.item14_diff_reason}
                      onChange={(e) => onChange({ ...data, item14_diff_reason: e.target.value })}
                      placeholder="請說明調價具體原因與漲幅合理性佐證..."
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #FCA5A5', borderRadius: '4px' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 其他事項 (第3次修正四：勾選後才填寫顯示，未勾選時 PDF 直接隱藏略過) */}
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#1E293B' }}>
                其他事項與備註說明
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={data.item15_enabled}
                  onChange={(e) => onChange({ ...data, item15_enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                />
                <span style={{ fontWeight: 600, color: data.item15_enabled ? '#1D4ED8' : '#64748B' }}>
                  {data.item15_enabled ? '有其他事項 [ ✓ ]' : '無其他事項'}
                </span>
              </label>
            </div>
            
            {data.item15_enabled && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #CBD5E1' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  其他備註說明事項內容（勾選後直接顯示填寫內容）：
                </label>
                <textarea
                  rows={3}
                  value={data.item15_notes}
                  onChange={(e) => onChange({ ...data, item15_notes: e.target.value })}
                  placeholder="請輸入其他補充備註..."
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. 經辦人員署名卡片 */}
      <section 
        className={`collapsible-card ${cardStates.operator ? 'expanded' : 'collapsed'}`}
        style={{ borderLeft: '3px solid #8B5CF6' }}
      >
        <div className="card-header-bar" onClick={() => toggleCard('operator')}>
          <div className="card-title-left">
            <User style={{ width: '18px', height: '18px', color: '#8B5CF6' }} />
            <span>四、經辦人員署名</span>
            <span className="card-badge-summary">
              經辦：{data.operator || '未填'}
            </span>
          </div>
          <span className="toggle-arrow">▼</span>
        </div>

        <div className="card-body-content">
          <div className="form-group">
            <label>經辦人員 <span style={{ color: '#EF4444' }}>* 必填署名</span></label>
            <input
              type="text"
              value={data.operator}
              onChange={(e) => onChange({ ...data, operator: e.target.value })}
              placeholder="例如：張廷甄"
            />
          </div>
        </div>
      </section>

      {/* 5. 外包作業檢核須知 (第3次修正三：檢核表最下方的灰字備註改列在此處) */}
      <section 
        className={`collapsible-card ${cardStates.guidelines ? 'expanded' : 'collapsed'}`}
        style={{ borderLeft: '3px solid #64748B' }}
      >
        <div className="card-header-bar" onClick={() => toggleCard('guidelines')}>
          <div className="card-title-left">
            <BookOpen style={{ width: '18px', height: '18px', color: '#64748B' }} />
            <span>五、外包作業檢核須知 (秘書室/MIS規定)</span>
          </div>
          <span className="toggle-arrow">▼</span>
        </div>

        <div className="card-body-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>1.</span>
            <span><strong>合約修訂：</strong>修正後承攬書/合約書，初審階段可以保留修訂情形；惟最終上傳 MIS 之定稿檔案不得有任何修正、註解痕跡。</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>2.</span>
            <span><strong>勞務外包：</strong>「非資產設備類維護案」之外包工作申請，固定資產建檔證明得免附，保固證明可免。</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>3.</span>
            <span><strong>呈報審查：</strong>備妥相關文件，先 email 至秘書室專人審查 (yuchen@gap.cgu.edu.tw)，信件主旨：「ＯＯＯ續外包案審查_ＯＯ/ＯＯ/ＯＯ到期」，審查完畢再至 MIS 辦理相關申請程序。</span>
          </div>
        </div>
      </section>

      {/* 底部版權宣告 */}
      <footer className="sidebar-copyright">
        <p>長庚大學 外包工作申請單檢核表系統</p>
        <p>CGU Online Outsourcing Checklist System · © 2026</p>
      </footer>

    </div>
  );
}
