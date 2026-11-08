import html2pdf from 'html2pdf.js';

export const exportToPdf = async (elementId, filename = '外包工作申請單作業檢核表.pdf', isLandscape = false) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('找不到檢核表預覽元素');
    return;
  }

  const opt = {
    margin: [8, 8, 8, 8], // mm [top, left, bottom, right]
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: isLandscape ? 'landscape' : 'portrait',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('PDF 匯出失敗:', error);
    // 降級引導使用瀏覽器列印
    if (confirm('直接下載 PDF 發生異常，是否改用瀏覽器高清列印另存為 PDF？')) {
      window.print();
    }
  }
};
