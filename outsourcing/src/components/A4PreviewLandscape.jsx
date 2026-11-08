import React from 'react';

export default function A4PreviewLandscape({ data }) {
  const isInitial = data.outsourceType === 'initial';
  const isRenew = data.outsourceType === 'renew';
  const isAsset = data.purposeType === 'asset';

  // 動態獨立項目清單 (依第3次修正一、四、五、六：連續編號、條件隱藏、美化打勾符號)
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
            <span>與前案不一致，已補充佐證附件。</span>
            {data.item14_diff_reason && (
              <span style={{ display: 'block', marginTop: '2px' }}>
                差異原因及合理性說明：{data.item14_diff_reason}
              </span>
            )}
          </>
        )
      )
    },
    ...(data.item15_enabled ? [{
      key: 'item15',
      title: '其他',
      checked: '✓',
      content: data.item15_notes && data.item15_notes.trim() ? data.item15_notes : ''
    }] : [])
  ];

  return (
    <div 
      id="a4-print-target-landscape"
      className="a4-page bg-white mx-auto shadow-2xl print:shadow-none print:m-0 text-black print:text-black"
      style={{
        width: '297mm',
        minHeight: '210mm',
        maxHeight: '210mm',
        padding: '8mm 10mm 6mm 10mm',
        boxSizing: 'border-box',
        fontSize: '14pt', // 嚴格遵守：字體大小至少 14 號字以上
        lineHeight: '1.24',
        fontFamily: '"Times New Roman", "DFKai-SB", "BiauKai", "標楷體", "Microsoft JhengHei", "Noto Sans TC", sans-serif',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <div>
        {/* 表頭左側：標示外包性質 (文件規範版本已移除) */}
        <div className="flex justify-between items-center" style={{ fontSize: '13pt', marginBottom: '2mm' }}>
          <div className="text-left font-bold text-slate-800">
            【{isInitial ? '首次外包' : '續外包重新發包'} ‧ {isAsset ? '維護特定標的' : '純勞務案'}】
          </div>
        </div>

        {/* 標題 */}
        <h1 
          className="text-center font-bold tracking-widest"
          style={{ fontSize: '18pt', marginBottom: '2.5mm', marginTop: '0mm' }}
        >
          外包工作申請單作業檢核表
        </h1>

        {/* 表格本體 */}
        <table 
          className="w-full"
          style={{
            borderCollapse: 'collapse',
            border: '2px solid black',
            fontSize: '14pt',
          }}
        >
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
          <tbody>
            {/* 共同項目 (1 ~ 7) */}
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
                  <span>
                    延遲原因：{data.item1_delay_reason || '（未說明原因）'}
                  </span>
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

            {/* 項序 6：依備註3自動調整 */}
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
                  <>
                    已提供。
                    {data.item6_assets && data.item6_assets.length > 0 && (
                      <span style={{ display: 'inline', marginLeft: '6px' }}>
                        {data.item6_assets.map((a, i) => (
                          <span key={i} style={{ display: 'inline-block', marginRight: '8px' }}>
                            請購案號：{a.no || '_______'}；取得價值：{a.value || '_______'} 元。(未稅)
                          </span>
                        ))}
                      </span>
                    )}
                  </>
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

            {/* 專屬項目 (依第3次修正一：連續項序 8 ~ N，無跳號；依修正四：未勾選15時隱藏；依修正六：美化打勾) */}
            {exclusiveItems.map((item, index) => {
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
            })}

            {/* 表格最末列：經辦人員署名 (依第2次修正二：刪除單位主管，只保留經辦人員) */}
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
