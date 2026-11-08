/**
 * 檢核表必填欄位驗證邏輯
 * 依據外包業務檢核標準進行校驗
 */
export function validateChecklist(data) {
  const errors = [];

  // 1. 經辦人員
  if (!data.operator || !data.operator.trim()) {
    errors.push('【經辦人員】為必填項目，請填寫經辦人員姓名。');
  }

  // 2. 共同項目 1：時效
  if (!data.item1_time_checked && (!data.item1_delay_reason || !data.item1_delay_reason.trim())) {
    errors.push('【項序 1 外包時效】若未符合提前辦理，必須填寫「延遲原因說明」。');
  }

  // 3. 共同項目 2：付款週期
  if (!data.item2_payment_checked) {
    errors.push('【項序 2 付款週期】為必選項目，需確認申請單與承攬書之付款週期一致。');
  }

  // 4. 共同項目 3：法務室業洽函
  if (!data.item3_legal_letter_checked) {
    errors.push('【項序 3 法務室業洽函】為必選項目，需確認已提供。');
  }

  // 5. 共同項目 4：法務室斧正意見
  if (!data.item4_legal_opinion_checked) {
    errors.push('【項序 4 法務室斧正意見】為必選項目，需確認已提供。');
  }

  // 6. 共同項目 5：修正後承攬書/合約書
  if (!data.item5_contract_checked) {
    errors.push('【項序 5 修正後承攬書/合約書】為必選項目，需確認已提供。');
  }

  // 7. 共同項目 6：固定資產建檔證明 (資產類必填)
  if (data.purposeType === 'asset') {
    if (!data.item6_asset_checked) {
      errors.push('【項序 6 固定資產建檔證明】維護特定標的(資產類)外包案為必選項，需確認已提供。');
    }
    const hasValidAsset = data.item6_assets && data.item6_assets.some(
      a => a.no && a.no.trim() && a.value && a.value.trim()
    );
    if (!hasValidAsset) {
      errors.push('【項序 6 固定資產明細】資產類外包請至少填寫一筆完整的「請購案號」與「取得價值(未稅)」。');
    }
  }

  // 8. 共同項目 7：施工作業安全告知單
  if (!data.item7_safety_checked) {
    errors.push('【項序 7 施工作業安全告知單】為必選項目，需確認已提供並已完成簽名。');
  }

  // 9. 專屬項目：外包期間
  if (!data.item9_checked) {
    errors.push('【外包期間】為必選項目，需確認起訖時間已完成接續。');
  }

  // 10. 專屬項目：外包到期提示單與現狀單價 (續外包必選)
  if (data.outsourceType === 'renew') {
    if (!data.item10_checked) {
      errors.push('【外包到期提示單】續外包重新發包案為必選項目，需確認已提供。');
    }
    if (!data.item11_checked) {
      errors.push('【現狀外包單價】續外包重新發包案為必選項目，需確認與外包到期提示單一致。');
    }
  }

  // 11. 專屬項目：保固證明 (首次 + 資產類為必選)
  if (data.purposeType === 'asset' && data.outsourceType === 'initial') {
    if (!data.item13_checked) {
      errors.push('【保固證明】首次外包資產設備類案件為必選項目，需確認已提供。');
    }
  }

  // 12. 專屬項目：報價單 (年度維護費與占比)
  if (data.purposeType === 'asset' && data.outsourceType === 'initial') {
    if (!data.item14_annual_fee || !data.item14_annual_fee.trim()) {
      errors.push('【報價單】資產類首次外包案，必須填寫「本案一年維護費(未稅)」以計算占比。');
    }
    if (!data.item14_ratio || !data.item14_ratio.trim()) {
      errors.push('【報價單占比】請點擊「自動計算」或填入年度維護費占比。');
    }
  }

  if (data.outsourceType === 'renew') {
    if (data.item14_renew_type === 'diff' && (!data.item14_diff_reason || !data.item14_diff_reason.trim())) {
      errors.push('【報價單調價說明】選擇「與前案不一致」時，必須述明價格調整具體原因及漲幅合理性。');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 自動計算維護費占原資產取得價值百分比
 * 依據第 3 次修正二：以百分比格式呈現，取到小數點後第 1 位，於第 2 位四捨五入到第 1 位
 * 公式：( (本案一年維護費(未稅) / 固定資產取得價值(未稅)) * 100 ).toFixed(1) + '%'
 */
export function calculateAnnualRatio(annualFeeStr, totalAssetValue) {
  const annualFee = parseFloat((annualFeeStr || '0').replace(/,/g, ''));
  if (isNaN(annualFee) || annualFee <= 0 || !totalAssetValue || totalAssetValue <= 0) {
    return '';
  }
  const rawPercentage = (annualFee / totalAssetValue) * 100;
  // 於第 2 位四捨五入至第 1 位百分比 (例如: 12.5%, 20.7%)
  return `${rawPercentage.toFixed(1)}%`;
}
