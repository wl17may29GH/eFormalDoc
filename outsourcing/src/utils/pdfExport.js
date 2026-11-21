import html2pdf from 'html2pdf.js';

/**
 * 匯出 A4 橫式 PDF 檔案
 * 支援單頁與多頁自動分頁匯出，具備全面的異常防護與 DOM 清理機制
 */
export const exportToPdf = async (elementId, filename = '外包工作申請單作業檢核表.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('找不到檢核表預覽元素');
    return false;
  }

  // 匯出 PDF 選項配置
  const opt = {
    margin: 0, // 由內層 a4-page 的 8mm 10mm 6mm 10mm 精確控制
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'landscape',
    },
    pagebreak: { mode: ['css', 'legacy'], after: '.a4-page:not(:last-child)' },
  };

  try {
    // 執行純前端 PDF 產出並直接下載
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (error) {
    console.error('PDF 匯出失敗:', error);
    if (confirm('直接下載 PDF 時發生渲染問題，是否改用瀏覽器高清列印另存為 PDF？')) {
      window.print();
    }
    return false;
  } finally {
    // 關鍵修復：無論成功或失敗，無條件清理 html2pdf 產生的殘留 iframe 與遮罩，避免按鈕失效
    try {
      const strayIframes = document.querySelectorAll('iframe[id^="html2pdf"], .html2pdf__overlay');
      strayIframes.forEach(el => el.remove());
      // 復原 body 可能被修改的樣式
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    } catch (cleanErr) {
      console.warn('清理暫存 DOM 失敗:', cleanErr);
    }
  }
};
