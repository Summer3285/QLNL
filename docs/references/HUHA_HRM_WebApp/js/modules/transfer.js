
const TransferModule = {
  async render() {
    const personnel = await DB.getAll('personnel');
    return `
    <div class="page-title">
      <h2>🔄 Thuyên chuyển cán bộ</h2>
    </div>
    <div class="card" style="max-width:800px; margin:0 auto">
      <div class="transfer-steps">
        <div class="transfer-step active"><div class="step-num">1</div> Chọn cán bộ</div>
        <div class="transfer-arrow">❯</div>
        <div class="transfer-step"><div class="step-num">2</div> Nhập thông tin thuyên chuyển</div>
        <div class="transfer-arrow">❯</div>
        <div class="transfer-step"><div class="step-num">3</div> Hoàn tất</div>
      </div>
      
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">Chọn cán bộ cần thuyên chuyển</label>
          <select class="form-control" id="tf_ma_cc">
            <option value="">-- Chọn cán bộ --</option>
            ${personnel.map(p => `<option value="${p.ma_cc}">${p.ma_cc} - ${p.ho_ten}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Ngày thuyên chuyển</label>
          <input type="date" class="form-control" id="tf_ngay" value="${Utils.today()}">
        </div>
        <div class="form-group">
          <label class="form-label">Nơi chuyển đến</label>
          <input class="form-control" id="tf_noi_den">
        </div>
        <div class="form-group">
          <label class="form-label">Lý do / Ghi chú</label>
          <textarea class="form-control" id="tf_lydo"></textarea>
        </div>
        
        <div class="mt-6 text-right">
          <button class="btn btn-primary" onclick="TransferModule.executeTransfer()">Thực hiện thuyên chuyển</button>
        </div>
      </div>
    </div>`;
  },

  async executeTransfer() {
    const ma_cc = document.getElementById('tf_ma_cc').value;
    const ngay = document.getElementById('tf_ngay').value;
    const noi_den = document.getElementById('tf_noi_den').value;
    const lydo = document.getElementById('tf_lydo').value;

    if (!ma_cc || !noi_den) {
      Toast.error('Vui lòng chọn cán bộ và nhập nơi đến!');
      return;
    }

    const p = await DB.get('personnel', ma_cc);
    if (!p) return;

    if (await Modal.confirm(`Thực hiện thuyên chuyển cán bộ ${p.ho_ten} tới ${noi_den}?`)) {
      // Create transfer record
      const record = {
        ma_cc: p.ma_cc,
        ho_ten: p.ho_ten,
        don_vi_cu: p.ma_dvi,
        noi_den: noi_den,
        ngay_chuyen: ngay,
        ly_do: lydo,
        trang_thai: 'Đã chuyển',
        ho_so_goc: p
      };
      await DB.add('transfers', record);
      
      // Delete from active personnel
      await DB.delete('personnel', ma_cc);
      
      Toast.success('Thuyên chuyển thành công!');
      App.navigate('list-thuyenchuyen');
    }
  }
};
window.TransferModule = TransferModule;
