import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * 匯出 A4 橫式 PDF 檔案
 * 直接針對 .a4-page 頁面進行高解析度純前端轉出，消除任何預覽縮放、陰影與分頁錯位問題
 */
export const exportToPdf = async (containerId, filename = '外包工作申請單作業檢核表.pdf') => {
  const container = document.getElementById(containerId);
  if (!container) {
    alert('找不到檢核表預覽元素');
    return false;
  }

  const pageElements = container.querySelectorAll('.a4-page');
  if (!pageElements || pageElements.length === 0) {
    alert('找不到可匯出的 A4 頁面');
    return false;
  }

  // 建立離線渲染容器，保證 1:1 縮放與無陰影邊框
  const offscreenContainer = document.createElement('div');
  offscreenContainer.style.position = 'fixed';
  offscreenContainer.style.top = '-99999px';
  offscreenContainer.style.left = '-99999px';
  offscreenContainer.style.width = '297mm';
  offscreenContainer.style.zIndex = '-99999';
  offscreenContainer.style.backgroundColor = '#ffffff';
  document.body.appendChild(offscreenContainer);

  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      const clone = pageEl.cloneNode(true);

      // 清除預覽用的陰影與邊界
      clone.style.boxShadow = 'none';
      clone.style.margin = '0';
      clone.style.transform = 'none';
      clone.style.width = '297mm';
      clone.style.height = '210mm';
      clone.style.minHeight = '210mm';
      clone.style.maxHeight = '210mm';
      clone.style.overflow = 'hidden';
      clone.style.backgroundColor = '#ffffff';

      offscreenContainer.innerHTML = '';
      offscreenContainer.appendChild(clone);

      // 等待 DOM 繪製微秒
      await new Promise(resolve => setTimeout(resolve, 60));

      const canvas = await html2canvas(clone, {
        scale: 2, // 2x 超取樣，產出 200+ DPI 銳利字體
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff',
        width: clone.offsetWidth,
        height: clone.offsetHeight,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      if (i > 0) {
        pdf.addPage('a4', 'landscape');
      }

      // 將圖片精確填滿 297mm x 210mm 的 A4 橫式頁面
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('PDF 匯出失敗:', error);
    if (confirm('直接下載 PDF 時發生渲染問題，是否改用瀏覽器高清列印另存為 PDF？')) {
      window.print();
    }
    return false;
  } finally {
    if (offscreenContainer.parentNode) {
      offscreenContainer.parentNode.removeChild(offscreenContainer);
    }
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
};
