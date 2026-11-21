import React from 'react';

// 預估單個項目在 A4 橫式上的高度 (mm)
export function estimateItemHeight(itemKey, data) {
  if (itemKey === 'item1') {
    if (data.item1_time_checked) return 8.5;
    const text = data.item1_delay_reason || '';
    const lines = text.split(/\r?\n/).reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / 24)), 0);
    return 8.5 + (Math.max(1, lines) - 1) * 5.5;
  }
  if (itemKey === 'item6') {
    if (data.purposeType !== 'asset') return 8.5;
    const count = (data.item6_assets && Array.isArray(data.item6_assets)) ? data.item6_assets.length : 1;
    return 7.5 + count * 5.5;
  }
  if (itemKey === 'item7') {
    return 9.5;
  }
  if (itemKey === 'item11') {
    // 擬外包資料
    return data.outsourceType === 'initial' ? 13.5 : 8.5;
  }
  if (itemKey === 'item14') {
    if (data.outsourceType === 'renew' && data.item14_renew_type === 'diff') {
      const text = data.item14_diff_reason || '';
      const lines = 1 + text.split(/\r?\n/).reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / 24)), 0);
      return 8.5 + (lines - 1) * 5.5;
    }
    return data.outsourceType === 'initial' ? 12 : 8.5;
  }
  if (itemKey === 'item15') {
    const text = data.item15_notes || '';
    const lines = text.split(/\r?\n/).reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / 24)), 0);
    return 8.5 + (Math.max(1, lines) - 1) * 5.5;
  }
  return 8.5;
}

// 建立所有檢核項目清單
export function getAllItems(data) {
  const isInitial = data.outsourceType === 'initial';
  const isRenew = data.outsourceType === 'renew';
  const isAsset = data.purposeType === 'asset';

  const items = [
    // --- 共同項目 (項序 1 ~ 7) ---
    {
      key: 'item1',
      category: '共同',
      seq: 1,
      title: '外包工作申請單時效',
      checked: data.item1_time_checked ? '✓' : '',
      content: data.item1_time_checked ? (
        '已提前到期日或需求日至少二個月辦理。'
      ) : (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          延遲原因：{data.item1_delay_reason || '（未說明原因）'}
        </div>
      ),
      height: estimateItemHeight('item1', data)
    },
    {
      key: 'item2',
      category: '共同',
      seq: 2,
      title: '付款週期',
      checked: data.item2_payment_checked ? '✓' : '',
      content: '已確認申請單與承攬書之付款週期一致。',
      height: 8.5
    },
    {
      key: 'item3',
      category: '共同',
      seq: 3,
      title: '法務室業洽函',
      checked: data.item3_legal_letter_checked ? '✓' : '',
      content: '已提供。',
      height: 8.5
    },
    {
      key: 'item4',
      category: '共同',
      seq: 4,
      title: '法務室斧正意見',
      checked: data.item4_legal_opinion_checked ? '✓' : '',
      content: '已提供。',
      height: 8.5
    },
    {
      key: 'item5',
      category: '共同',
      seq: 5,
      title: (
        <span>
          修正後承攬書/合約書<span style={{ fontSize: '10pt', verticalAlign: 'super' }}>註1</span>
        </span>
      ),
      checked: data.item5_contract_checked ? '✓' : '',
      content: '已提供。',
      height: 8.5
    },
    {
      key: 'item6',
      category: '共同',
      seq: 6,
      title: '固定資產建檔證明(*含取得價值)',
      checked: data.item6_asset_checked ? '✓' : '',
      content: isAsset ? (
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
      ),
      height: estimateItemHeight('item6', data)
    },
    {
      key: 'item7',
      category: '共同',
      seq: 7,
      title: '施工作業安全告知單',
      checked: data.item7_safety_checked ? '✓' : '',
      content: '已提供，合約工期與承攬書一致，並已完成簽名。',
      height: estimateItemHeight('item7', data)
    },

    // --- 專屬項目 (項序 8 ~ N) ---
    {
      key: 'item9',
      category: '專屬',
      seq: 8,
      title: '外包期間',
      checked: data.item9_checked ? '✓' : '',
      content: isInitial 
        ? '起訖時間已接續保固到期日或招商需求日。' 
        : '起訖時間已接續原合約到期日。',
      height: 8.5
    },
    {
      key: 'item10',
      category: '專屬',
      seq: 9,
      title: '外包到期提示單',
      checked: isInitial ? '' : (data.item10_checked ? '✓' : ''),
      content: isInitial ? '略。' : '已提供。',
      height: 8.5
    },
    {
      key: 'item11',
      category: '專屬',
      seq: 10,
      title: '現狀外包單價(未稅)',
      checked: isInitial ? '' : (data.item11_checked ? '✓' : ''),
      content: isInitial ? '略。' : '與「外包到期提示單」一致。',
      height: 8.5
    },
    {
      key: 'item12',
      category: '專屬',
      seq: 11,
      title: '擬外包資料(*金額皆未稅)',
      checked: '✓',
      content: isInitial 
        ? '月工作量、單價、總金額及付款週期等內容，均與相關佐證資料相符。' 
        : (data.item12_type === 'same' ? '與前案一致。' : '與前案不一致。'),
      height: estimateItemHeight('item11', data)
    },
    ...(isAsset ? [{
      key: 'item13',
      category: '專屬',
      seq: 12,
      title: '保固證明',
      checked: isInitial ? (data.item13_checked ? '✓' : '') : '✓',
      content: isInitial ? '已提供。' : '可免。',
      height: 8.5
    }] : []),
    {
      key: 'item14',
      category: '專屬',
      seq: isAsset ? 13 : 12,
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
      ),
      height: estimateItemHeight('item14', data)
    },
    ...(data.item15_enabled ? [{
      key: 'item15',
      category: '專屬',
      seq: isAsset ? 14 : 13,
      title: '其他',
      checked: '✓',
      content: data.item15_notes && data.item15_notes.trim() ? (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {data.item15_notes}
        </div>
      ) : '',
      height: estimateItemHeight('item15', data)
    }] : [])
  ];

  return items;
}

// 動態排版分頁計算：以用滿第 1 頁可印版面為原則
export function calculatePages(data) {
  const items = getAllItems(data);
  const operatorRowHeight = 12;    // 經辦人員簽核欄高度 (mm)
  const maxSinglePageHeight = 158; // 單頁模式下所有項目 + 簽核欄的最大可用高度 (mm)
  const maxPage1Height = 152;      // 雙頁模式下第一頁項目的最大可用高度 (mm，保留底部接續提示)

  const totalHeight = items.reduce((sum, item) => sum + item.height, 0) + operatorRowHeight;

  if (totalHeight <= maxSinglePageHeight) {
    return {
      isMulti: false,
      page1Items: items,
      page2Items: []
    };
  }

  // 雙頁模式：貪婪填滿第 1 頁可印版面
  const page1Items = [];
  const page2Items = [];
  let currentHeight = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (currentHeight + item.height <= maxPage1Height) {
      page1Items.push(item);
      currentHeight += item.height;
    } else {
      page2Items.push(item);
    }
  }

  // 防呆：若第 1 頁為空，至少放 1 個項目
  if (page1Items.length === 0 && items.length > 0) {
    page1Items.push(items[0]);
    page2Items.splice(0, 1);
  }

  // 防呆：若所有項目剛好塞滿第 1 頁但加上簽名欄超出一頁，將最後一項移至第 2 頁陪伴簽名欄
  if (page2Items.length === 0 && page1Items.length > 1) {
    page2Items.unshift(page1Items.pop());
  }

  return {
    isMulti: true,
    page1Items,
    page2Items
  };
}

// 供外部調用判斷是否分頁
export function shouldPaginate(data) {
  return calculatePages(data).isMulti;
}

export default function A4PreviewLandscape({ data, forceMultiPage }) {
  const isInitial = data.outsourceType === 'initial';
  const isRenew = data.outsourceType === 'renew';
  const isAsset = data.purposeType === 'asset';

  const { isMulti: autoMulti, page1Items, page2Items } = calculatePages(data);
  const isMulti = forceMultiPage !== undefined ? forceMultiPage : autoMulti;

  // A4 紙張基礎樣式（嚴格符合 297mm x 210mm 橫式規格）
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

  // 動態渲染檢核項目列 (具備連續類別合併 rowSpan 能力)
  const renderItemRows = (items) => {
    const rows = [];
    let i = 0;
    while (i < items.length) {
      const currentCat = items[i].category;
      let span = 0;
      while (i + span < items.length && items[i + span].category === currentCat) {
        span++;
      }
      for (let j = 0; j < span; j++) {
        const item = items[i + j];
        const isFirstInCat = (j === 0);
        rows.push(
          <tr key={item.key || item.seq}>
            {isFirstInCat && (
              <td
                rowSpan={span}
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
                {currentCat}
              </td>
            )}
            <td style={{ border: '1px solid black', textAlign: 'center', fontWeight: 'bold' }}>
              {item.seq}
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
      }
      i += span;
    }
    return rows;
  };

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

            {/* 表格本體 (填滿單頁，含簽名欄) */}
            <table style={tableStyle}>
              {renderTableHeader()}
              <tbody>
                {renderItemRows(page1Items)}
                {renderOperatorRow()}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // ======================== 雙頁模式 (第一頁填滿後自動換頁) ========================
        <>
          {/* 第 1 頁：用滿版面，含底部接續提示 */}
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
                  {renderItemRows(page1Items)}
                  <tr style={{ borderTop: '2px solid black', backgroundColor: '#f8fafc' }}>
                    <td colSpan={5} style={{ padding: '4px 14px', textAlign: 'right', fontWeight: 'bold', color: '#475569', fontSize: '13pt' }}>
                      （請翻閱次頁繼續檢核專屬項目與簽名 ➔）
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 第 2 頁：承接剩餘項目 + 經辦人員簽核欄 */}
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
                  {renderItemRows(page2Items)}
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
