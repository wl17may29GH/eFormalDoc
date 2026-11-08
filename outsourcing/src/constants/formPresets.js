// 系統固定版本號（由系統維護，非使用者填寫）
export const SYSTEM_VERSION = "2026/10/05 版本";

// 初始資料
export const INITIAL_FORM_DATA = {
  // 基本公文資訊
  projectName: "高效能伺服器系統維護保養案",
  department: "資訊中心 / 技合處",
  outsourceType: "renew", // "initial" (首次外包) | "renew" (續外包重新發包)
  purposeType: "asset",   // "service" (純勞務) | "asset" (維護特定標的)
  fillDate: "2026-10-05",

  // 共同項目 1~7
  item1_time_checked: true,
  item1_delay_reason: "", // 若未符合則必須填寫延遲原因
  
  item2_payment_checked: true,
  item3_legal_letter_checked: true,
  item4_legal_opinion_checked: true,
  item5_contract_checked: true,
  
  // 固定資產建檔證明 (資產類為必填，純勞務顯示免填)
  item6_asset_checked: true,
  item6_assets: [
    { no: "H402V0", value: "1,420,000" },
    { no: "K40261", value: "285,200" }
  ],
  
  item7_safety_checked: true,

  // 獨立/專屬項目
  // 外包期間
  item9_checked: true,

  // 外包到期提示單 (續外包必選)
  item10_checked: true,

  // 現狀外包單價 (續外包必選)
  item11_checked: true,

  // 擬外包資料 (單選：只保留所選結果，未勾不列入)
  item12_type: "same", // "same" (與前案一致) | "diff" (與前案不一致)

  // 保固證明 (綁定資產類；非資產類直接隱藏掠過)
  item13_checked: true,

  // 報價單 (單選：只保留所選結果；四捨五入至第 1 位百分比格式)
  item14_annual_fee: "352,800", // 本案報價單一年維護費(未稅)
  item14_ratio: "20.7%",        // 自動計算占比 (於第2位四捨五入至第1位)
  item14_renew_type: "diff",    // 續外包時: "same" | "diff"
  item14_diff_reason: "因原廠零組件調漲及通膨調整，經議價後符合市場行情合理漲幅。",

  // 其他事項 (第3次修正四：勾選後才填寫顯示，未勾選時 PDF 直接隱藏略過)
  item15_enabled: true,
  item15_notes: "廠商因回饋老客戶，故於此次維護保養續約提出贈送 2027 年 1 月 18 日至 2027 年 1 月 31 日無償保養。新合約起算日期更改為 2027/2/1 至 2030/1/31 日止。",

  // 經辦人員
  operator: "張廷甄"
};

// 預設範本一：首次外包 + 維護特定標的 (資產類)
export const PRESET_INITIAL_ASSET = {
  projectName: "新建置精密質譜儀設備全責維護保養案",
  department: "研發處檢驗中心",
  outsourceType: "initial",
  purposeType: "asset",
  fillDate: "2026-10-05",

  item1_time_checked: true,
  item1_delay_reason: "",
  item2_payment_checked: true,
  item3_legal_letter_checked: true,
  item4_legal_opinion_checked: true,
  item5_contract_checked: true,
  item6_asset_checked: true,
  item6_assets: [
    { no: "E90123", value: "2,500,000" }
  ],
  item7_safety_checked: true,

  item9_checked: true,
  item10_checked: false,
  item11_checked: false,
  item12_type: "same",
  item13_checked: true, // 資產類首次外包需保固證明
  item14_annual_fee: "312,500",
  item14_ratio: "12.5%", // 312,500 / 2,500,000 = 12.5%
  item14_renew_type: "same",
  item14_diff_reason: "",
  
  item15_enabled: true,
  item15_notes: "本案為原廠新購設備保固屆滿後之首度外包維護案，維護費用率為 12.5%，符合資產折舊維護標準。",

  operator: "張廷甄"
};

// 預設範本二：續外包重新發包 + 維護特定標的（參考公文範本範例）
export const PRESET_RENEW_ASSET = {
  projectName: "校園核心網路骨幹設備維護續約案",
  department: "圖書資訊處",
  outsourceType: "renew",
  purposeType: "asset",
  fillDate: "2026-03-16",

  item1_time_checked: true,
  item1_delay_reason: "",
  item2_payment_checked: true,
  item3_legal_letter_checked: true,
  item4_legal_opinion_checked: true,
  item5_contract_checked: true,
  item6_asset_checked: true,
  item6_assets: [
    { no: "H402V0", value: "1,420,000" },
    { no: "K40261", value: "285,200" }
  ],
  item7_safety_checked: true,

  item9_checked: true,
  item10_checked: true,
  item11_checked: true,
  item12_type: "same",
  item13_checked: false,
  item14_annual_fee: "352,800",
  item14_ratio: "20.7%", // 352,800 / 1,705,200 = 20.6896... -> 20.7%
  item14_renew_type: "diff",
  item14_diff_reason: "因原廠零組件調漲及通膨調整，經議價後符合市場行情合理漲幅。",
  
  item15_enabled: true,
  item15_notes: "廠商因回饋老客戶，故於此次維護 保養續約提出贈送 2027 年 1 月 18 日至 2027 年 1 月 31 日無償保養。新合約起算日期更改為 2027/2/1 至 2030/1/31 日止。",

  operator: "張廷甄"
};

// 預設範本三：純勞務外包（環境清潔或駐點人力）
export const PRESET_LABOR = {
  projectName: "全校辦公大樓清潔與行政勞務承攬案",
  department: "總務處保管事務組",
  outsourceType: "renew",
  purposeType: "service",
  fillDate: "2026-10-05",

  item1_time_checked: true,
  item1_delay_reason: "",
  item2_payment_checked: true,
  item3_legal_letter_checked: true,
  item4_legal_opinion_checked: true,
  item5_contract_checked: true,
  item6_asset_checked: false,
  item6_assets: [],
  item7_safety_checked: true,

  item9_checked: true,
  item10_checked: true,
  item11_checked: true,
  item12_type: "same",
  item13_checked: false,
  item14_annual_fee: "",
  item14_ratio: "",
  item14_renew_type: "same",
  item14_diff_reason: "",
  
  item15_enabled: false, // 純勞務預設無其他補充事項，PDF 直接隱藏掠過
  item15_notes: "",

  operator: "李專員"
};
