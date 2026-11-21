import React from 'react';

// 判斷是否需要自動延伸至第 2 頁 (第1次公測修正三：內容多時自動分頁避免破版)
export function shouldPaginate(data) {
  if (data.pageMode === 'single') return false;
  if (data.pageMode === 'multi') return true;

  const assetCount = (data.item6_asset_checked && Array.isArray(data.item6_assets)) ? data.item6_assets.length : 0;
  const delayReason = (!data.item1_time_checked && data.item1_delay_reason) ? data.item1_delay_reason : '';
  const diffReason = (data.item14_renew_type === 'diff' && data.item14_diff_reason) ? data.item14_diff_reason : '';
  const notes = (data.item15_enabled && data.item15_notes) ? data.item15_notes : '';

  const delayLines = delayReason.split(/\r?\n/).length;
  const diffLines = diffReason.split(/\r?\n/).length;
  const noteLines = notes.split(/\r?\n/).length;

  if (assetCount >= 3) return true;
  if (delayLines > 2 || delayReason.length > 50) return true;
  if (diffLines > 2 || diffReason.length > 50) return true;
  if (noteLines > 2 || notes.length > 50) return true;

  let score = 0;
  if (assetCount > 1) score += (assetCount - 1) * 2;
  if (delayReason.trim()) score += Math.max(delayLines, Math.ceil(delayReason.length / 30));
  if (diffReason.trim()) score += Math.max(diffLines, Math.ceil(diffReason.length / 30));
  if (notes.trim()) score += Math.max(noteLines, Math.ceil(notes.length / 30));

  return score >= 3;
}

export default function A4PreviewLandscape({ data, forceMultiPage }) {
  const isInitial = data.outsourceType === 'initial';
  const isRenew = data.outsourceType === 'renew';
  const isAsset = data.purposeType === 'asset';

  const isMulti = forceMultiPage !== undefined ? forceMultiPage : shouldPaginate(data);

  // 專屬項目清單
  const exclusiveItems = [
    {
      key: 'item9',
      title: '外包期間',
      checked: data.item9_checked ? '✓' : '',
      content: isInitial 
        ? '起訖時間已接續保固到期日或招商需求日。' 
        : '起訖時間已接續原合約到期日。'
    },
    {
      key: 'item10',
      title: '外包到期提示單',
      checked: isInitial ? '' : (data.item10_checked ? '✓' : ''),
      content: isInitial ? '略。' : '已提供。'
    },
    {
      key: 'item11',
      title: '現狀外包單價(未稅)',
      checked: isInitial ? '' : (data.item11_checked ? '✓' : ''),
      content: isInitial ? '略。' : '與「外包到期提示單」一致。'
    },
    {
      key: 'item12',
      title: '擬外包資料(*金額皆未稅)',
      checked: '✓',
      content: isInitial 
        ? '月工作量、單價、總金額及付款週期等內容，均與相關佐證資料相符。' 
        : (data.item12_type === 'same' ? '與前案一致。' : '與前案不一致。')
    },
    ...(isAsset ? [{
      key: 'item13',
      title: '保固證明',
      checked: isInitial ? (data.item13_checked ? '✓' : '') : '✓',
      content: isInitial ? '已提供。' : '可免。'
    }] : []),
    {
      key: 'item14',
      title: `報價單${data.item14_ratio ? ` (約占 ${data.item14_ratio})` : ''}`,
      checked: '✓',
      content: isInitial ? (
        isAsset ? (
          `資產類外包案應敘明年度維護費與原資產取得價值之占比${data.item14_ratio ? ` (本案計算約占 ${data.item14_ratio})` : ''}。`
        ) : (
          '純勞務外包案，已確認報價單內容相符。'
        )
      ) : (
        data.item14_renew_type === 'same' ? (
          '與前案一致。'
        ) : (
          <>
            <div>與前案不一致，已補充佐證附件。</div>
            {data.item14_diff_reason && (
              <div style={{ display: 'block', marginTop: '2px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                差異原因及合理性說明：{data.item14_diff_reason}
              </div>
            )}
          </>
        )
      )
    },
    ...(data.item15_enabled ? [{
      key: 'item15',
      title: '其他',
      checked: '✓',
      content: data.item15_notes && data.item15_notes.trim() ? (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {data.item15_notes}
        </div>
      ) : ''
    }] : [])
  ];

  // A4 紙張基礎樣式（嚴格符合 297mm x 210mm 橫式規格，移除所有 oklch class 避免截圖或匯出失敗）
  const basePageStyle = {
    width: '297mm',
    minHeight: '210mm',
    height: '210mm',
    maxHeight: '210mm',
    padding: '8mm 10mm 6mm 10mm',
    boxSizing: 'border-box',
    fontSize: '14pt', // 嚴格遵守：字體大小至少 14 號字以上
    lineHeight: '1.24',
    fontFamily: '"Times New Roman", "DFKai-SB", "BiauKai", "標楷體", "Microsoft JhengHei", "Noto Sans TC", sans-serif',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    color: '#000000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  };

  // 表格邊界與字級樣式
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    border: '2px solid black',
    fontSize: '14pt',
  };

  // 表頭 JSX
  const renderTableHeader = () => (
    <thead>
      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid black' }}>
        <th style={{ border: '1px solid black', width: '36px', padding: '1px', textAlign: 'center', fontWeight: 'bold' }}>
          類<br/>別
        </th>
        <th style={{ border: '1px solid black', width: '36px', padding: '1px', textAlign: 'center', fontWeight: 'bold' }}>
          項<br/>序
        </th>
        <th style={{ border: '1px solid black', width: '310px', padding: '1px 6px', textAlign: 'center', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          項目
        </th>
        <th style={{ border: '1px solid black', width: '42px', padding: '1px', textAlign: 'center', fontWeight: 'bold' }}>
          勾選
        </th>
        <th style={{ border: '1px solid black', padding: '1px 6px', textAlign: 'center', fontWeight: 'bold' }}>
          請逐項勾選確認
        </th>
      </tr>
    </thead>
  );

  // 共同項目 (項序 1 ~ 7)
  const renderCommonRows = () => (
    <>
      <tr>
        <td 
          rowSpan={7} 
          style={{ 
            border: '1px solid black', 
            textAlign: 'center', 
            fontWeight: 'bold', 
            writingMode: 'vertical-rl', 
            letterSpacing: '3px',
            backgroundColor: '#f8fafc',
            fontSize: '14pt'
          }}
        >
          共同
        </td>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold' }}>1</td>
        <td style={{ border: '1px solid black', padding: '1px 6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>外包工作申請單時效</td>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '15pt' }}>
          {data.item1_time_checked ? '✓' : ''}
        </td>
        <td style={{ border: '1px solid black', padding: '1px 6px' }}>
          {data.item1_time_checked ? (
            '已提前到期日或需求日至少二個月辦理。'
          ) : (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              延遲原因：{data.item1_delay_reason || '（未說明原因）'}
            </div>
          )}
        </td>
      </tr>

      <tr>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold' }}>2</td>
        <td style={{ border: '1px solid black', padding: '1px 6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>付款週期</td>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '15pt' }}>
          {data.item2_payment_checked ? '✓' : ''}
        </td>
        <td style={{ border: '1px solid black', padding: '1px 6px' }}>
          已確認申請單與承攬書之付款週期一致。
        </td>
      </tr>

      <tr>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold' }}>3</td>
        <td style={{ border: '1px solid black', padding: '1px 6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>法務室業洽函</td>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '15pt' }}>
          {data.item3_legal_letter_checked ? '✓' : ''}
        </td>
        <td style={{ border: '1px solid black', padding: '1px 6px' }}>已提供。</td>
      </tr>

      <tr>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold' }}>4</td>
        <td style={{ border: '1px solid black', padding: '1px 6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>法務室斧正意見</td>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '15pt' }}>
          {data.item4_legal_opinion_checked ? '✓' : ''}
        </td>
        <td style={{ border: '1px solid black', padding: '1px 6px' }}>已提供。</td>
      </tr>

      <tr>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold' }}>5</td>
        <td style={{ border: '1px solid black', padding: '1px 6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>修正後承攬書/合約書<span style={{ fontSize: '10pt', verticalAlign: 'super' }}>註1</span></td>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '15pt' }}>
          {data.item5_contract_checked ? '✓' : ''}
        </td>
        <td style={{ border: '1px solid black', padding: '1px 6px' }}>已提供。</td>
      </tr>

      {/* 項序 6：固定資產建檔證明 (支援多筆案號與換行) */}
      <tr>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold' }}>6</td>
        <td style={{ border: '1px solid black', padding: '1px 6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          固定資產建檔證明(*含取得價值)
        </td>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '15pt' }}>
          {data.item6_asset_checked ? '✓' : ''}
        </td>
        <td style={{ border: '1px solid black', padding: '1px 6px' }}>
          {isAsset ? (
            <div>
              <span>已提供。</span>
              {data.item6_assets && data.item6_assets.length > 0 && (
                <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {data.item6_assets.map((a, i) => (
                    <div key={i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {data.item6_assets.length > 1 ? `(${i + 1}) ` : ''}請購案號：{a.no || '_______'}；取得價值：{a.value || '_______'} 元。(未稅)
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            data.item6_asset_checked ? '已提供。' : <span style={{ color: '#475569' }}>免填 (非屬資產設備類)。</span>
          )}
        </td>
      </tr>

      <tr>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold' }}>7</td>
        <td style={{ border: '1px solid black', padding: '1px 6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>施工作業安全告知單</td>
        <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '15pt' }}>
          {data.item7_safety_checked ? '✓' : ''}
        </td>
        <td style={{ border: '1px solid black', padding: '1px 6px' }}>
          已提供，合約工期與承攬書一致，並已完成簽名。
        </td>
      </tr>
    </>
  );

  // 專屬項目 (項序 8 ~ N)
  const renderExclusiveRows = () => (
    exclusiveItems.map((item, index) => {
      const itemSeq = 7 + index + 1;
      return (
        <tr key={item.key}>
          {index === 0 && (
            <td 
              rowSpan={exclusiveItems.length} 
              style={{ 
                border: '1px solid black', 
                textAlign: 'center', 
                fontWeight: 'bold', 
                writingMode: 'vertical-rl', 
                letterSpacing: '3px',
                backgroundColor: '#f8fafc',
                fontSize: '14pt'
              }}
            >
              專屬
            </td>
          )}
          <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold' }}>
            {itemSeq}
          </td>
          <td style={{ border: '1px solid black', padding: '1px 6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {item.title}
          </td>
          <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '15pt' }}>
            {item.checked}
          </td>
          <td style={{ border: '1px solid black', padding: '1px 6px' }}>
            {item.content}
          </td>
        </tr>
      );
    })
  );

  // 經辦人員簽核欄
  const renderOperatorRow = () => (
    <tr>
      <td 
        colSpan={5} 
        style={{ 
          border: '1.5px solid black', 
          padding: '4px 14px', 
          backgroundColor: '#ffffff' 
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            fontSize: '14pt', 
            fontWeight: 'bold', 
            width: '100%' 
          }}
        >
          <div>
            經辦人員：<span style={{ fontWeight: 'normal' }}>{data.operator || '_____________________'}</span>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div id="a4-print-target-landscape" className="a4-print-container">
      
      {/* 判斷為單頁或雙頁模式 */}
      {!isMulti ? (
        // ======================== 單頁模式 (標準 1 頁) ========================
        <div className="a4-page" style={basePageStyle}>
          <div>
            {/* 表頭左側標示 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13pt', marginBottom: '2mm' }}>
              <div style={{ textAlign: 'left', fontWeight: 'bold', color: '#1e293b' }}>
                【{isInitial ? '首次外包' : '續外包重新發包'} ‧ {isAsset ? '維護特定標的' : '純勞務案'}】
              </div>
            </div>

            {/* 標題 */}
            <h1 style={{ textAlign: 'center', fontWeight: 'bold', letterSpacing: '4px', fontSize: '18pt', marginBottom: '2.5mm', marginTop: '0mm' }}>
              外包工作申請單作業檢核表
            </h1>

            {/* 表格本體 (含共同 + 專屬 + 簽核) */}
            <table style={tableStyle}>
              {renderTableHeader()}
              <tbody>
                {renderCommonRows()}
                {renderExclusiveRows()}
                {renderOperatorRow()}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // ======================== 雙頁模式 (內容較多自動延伸) ========================
        <>
          {/* 第 1 頁：共同檢核項目 (含寬裕的多筆資產建檔證明空間) */}
          <div className="a4-page" style={basePageStyle}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13pt', marginBottom: '2mm' }}>
                <div style={{ textAlign: 'left', fontWeight: 'bold', color: '#1e293b' }}>
                  【{isInitial ? '首次外包' : '續外包重新發包'} ‧ {isAsset ? '維護特定標的' : '純勞務案'}】
                </div>
                <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#475569', fontSize: '12pt' }}>
                  (第 1 頁，共 2 頁)
                </div>
              </div>

              <h1 style={{ textAlign: 'center', fontWeight: 'bold', letterSpacing: '4px', fontSize: '18pt', marginBottom: '2.5mm', marginTop: '0mm' }}>
                外包工作申請單作業檢核表
              </h1>

              <table style={tableStyle}>
                {renderTableHeader()}
                <tbody>
                  {renderCommonRows()}
                  <tr style={{ borderTop: '2px solid black', backgroundColor: '#f8fafc' }}>
                    <td colSpan={5} style={{ padding: '6px 14px', textAlign: 'right', fontWeight: 'bold', color: '#475569', fontSize: '13pt' }}>
                      （請翻閱次頁繼續檢核專屬項目與簽名 ➔）
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 第 2 頁：專屬檢核項目 (含寬裕的調價說明與其他備註空間) + 經辦簽署 */}
          <div className="a4-page a4-page-2" style={{ ...basePageStyle, marginTop: '24px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13pt', marginBottom: '2mm' }}>
                <div style={{ textAlign: 'left', fontWeight: 'bold', color: '#1e293b' }}>
                  【{isInitial ? '首次外包' : '續外包重新發包'} ‧ {isAsset ? '維護特定標的' : '純勞務案'}】
                </div>
                <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#475569', fontSize: '12pt' }}>
                  (第 2 頁，共 2 頁)
                </div>
              </div>

              <h1 style={{ textAlign: 'center', fontWeight: 'bold', letterSpacing: '4px', fontSize: '18pt', marginBottom: '2.5mm', marginTop: '0mm' }}>
                外包工作申請單作業檢核表 (續頁)
              </h1>

              <table style={tableStyle}>
                {renderTableHeader()}
                <tbody>
                  {renderExclusiveRows()}
                  {renderOperatorRow()}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
