
// ============================================================
// HUHA HRM - Export Module
// ============================================================
const Export = {
  toCSV(data, columns, filename) {
    Utils.downloadCSV(data, columns, filename || 'export.csv');
  },

  toJSON(data, filename) {
    Utils.downloadJSON(data, filename || 'export.json');
  },

  async backupAll() {
    const data = await DB.exportAll();
    const backup = {
      version: '1.0',
      date: new Date().toISOString(),
      data: data
    };
    Utils.downloadJSON(backup, `HUHA_HRM_backup_${Utils.today()}.json`);
    Toast.success('Sao lưu dữ liệu thành công!');
  },

  async restoreAll(file) {
    try {
      const backup = await Utils.readFileAsJSON(file);
      if (!backup.data) throw new Error('File sao lưu không hợp lệ');
      await DB.importAll(backup.data);
      Toast.success('Phục hồi dữ liệu thành công! Trang sẽ tải lại.');
      setTimeout(() => location.reload(), 1500);
    } catch(e) {
      Toast.error('Lỗi phục hồi: ' + e.message);
    }
  },

printTable(title, tableHtml) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN');
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; padding: 20px; color: #000; }
        .print-head { text-align: center; margin-bottom: 20px; }
        .print-head h3 { margin: 0; font-size: 13pt; }
        .print-head h2 { margin: 10px 0; font-size: 16pt; }
        .print-head .line { width: 120px; border-bottom: 1px solid #000; margin: 5px auto; }
        .print-info { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 11pt; }
        table { width: 100%; border-collapse: collapse; font-size: 11pt; }
        th, td { border: 1px solid #000; padding: 5px 8px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; text-align: center; }
        .footer { display: flex; justify-content: space-between; margin-top: 30px; text-align: center; }
        .footer div { width: 45%; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <div class="print-head">
        <h3>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
        <h3>Độc lập - Tự do - Hạnh phúc</h3>
        <div class="line"></div>
        <h2>${title}</h2>
      </div>
      <div class="print-info">
        <span>Ngày in: ${dateStr}</span>
      </div>
      ${tableHtml}
      <div class="footer">
        <div><br><br><b>Người lập</b><br><i>(Ký, ghi rõ họ tên)</i></div>
        <div><i>........, ngày .... tháng .... năm ........</i><br><b>Thủ trưởng đơn vị</b><br><i>(Ký tên, đóng dấu)</i></div>
      </div>
      <script>window.print();</script>
    </body></html>`);
  }
};

window.Export = Export;
