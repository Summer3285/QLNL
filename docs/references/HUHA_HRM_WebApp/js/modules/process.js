
const ProcessModule = {
  async showProcesses(ma_cc) {
    const p = await DB.get('personnel', ma_cc);
    if (!p) return;

    const content = `
    <div class="tabs personnel-tabs">
      <button class="tab-btn active" onclick="ProcessModule.switchTab('qt_congtac', this)">Công tác</button>
      <button class="tab-btn" onclick="ProcessModule.switchTab('qt_daotao', this)">Đào tạo</button>
      <button class="tab-btn" onclick="ProcessModule.switchTab('qt_luong', this)">Lương</button>
      <button class="tab-btn" onclick="ProcessModule.switchTab('qt_ktkl', this)">Khen thưởng/Kỷ luật</button>
      <button class="tab-btn" onclick="ProcessModule.switchTab('qt_qhgd', this)">Quan hệ GĐ</button>
      <button class="tab-btn" onclick="ProcessModule.switchTab('qt_danhgia', this)">Đánh giá CC</button>
      <button class="tab-btn" onclick="ProcessModule.switchTab('qt_bonhiem', this)">Bổ nhiệm</button>
    </div>
    <div id="processContainer" style="min-height:300px"></div>
    `;

    Modal.show({
      title: `Quá trình: ${p.ho_ten} (${ma_cc})`,
      content: content,
      size: 'xl'
    });

    // Save context
    this.currentMaCc = ma_cc;
    setTimeout(() => this.loadProcessTab('qt_congtac'), 100);
  },

  switchTab(store, btn) {
    document.querySelectorAll('.personnel-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.loadProcessTab(store);
  },

  async loadProcessTab(store) {
    const ma_cc = this.currentMaCc;
    const records = await DB.getByIndex(store, 'ma_cc', ma_cc);
    const def = PROCESS_STORES[store];
    const container = document.getElementById('processContainer');
    
    // Define columns per store
    const cols = {
      qt_congtac: [
        {k:'tu',n:'Từ ngày'},{k:'den',n:'Đến ngày'},{k:'vi_tri',n:'Vị trí'},
        {k:'don_vi',n:'Đơn vị'},{k:'phong_ban',n:'Phòng ban'},{k:'chuc_vu',n:'Chức vụ'}
      ],
      qt_daotao: [
        {k:'nam_tn',n:'Năm TN'},{k:'ma_truong',n:'Trường'},{k:'ma_nganh',n:'Ngành'},
        {k:'ma_tdcm',n:'Trình độ'},{k:'xep_loai',n:'Xếp loại'}
      ],
      qt_luong: [
        {k:'tu',n:'Từ ngày'},{k:'den',n:'Đến ngày'},{k:'ngach',n:'Ngạch'},
        {k:'bac',n:'Bậc'},{k:'he_so',n:'Hệ số'}
      ],
      qt_ktkl: [
        {k:'ngay_ktkl',n:'Ngày'},{k:'loai_ktkl',n:'Loại (KT/KL)'},{k:'ma_ktkl',n:'Hình thức'},
        {k:'cq_ktkl',n:'Cơ quan'},{k:'nguoi_ky',n:'Người ký'}
      ],
      qt_qhgd: [
        {k:'ten_qhgd',n:'Quan hệ'},{k:'ten',n:'Họ tên'},{k:'nam_sinh',n:'Năm sinh'},
        {k:'noi_dung',n:'Thông tin chi tiết'}
      ],
      qt_danhgia: [
        {k:'nam',n:'Năm'},{k:'loai',n:'Loại đánh giá'},{k:'noi_dung',n:'Nội dung'}
      ],
      qt_bonhiem: [
        {k:'chuc_vu',n:'Chức vụ'},{k:'don_vi',n:'Đơn vị'},{k:'ngay_hluc',n:'Ngày hiệu lực'},
        {k:'so_qdinh',n:'Số QĐ'}
      ]
    }[store];

    container.innerHTML = `
      <div style="margin-bottom:15px;text-align:right">
        <button class="btn btn-primary btn-sm" onclick="ProcessModule.addRecord('${store}')">+ Thêm dòng</button>
      </div>
      <table class="data-table">
        <thead><tr>
          ${cols.map(c => `<th>${c.n}</th>`).join('')}
          <th>Thao tác</th>
        </tr></thead>
        <tbody>
          ${records.map(r => `<tr>
            ${cols.map(c => `<td>${Utils.escapeHtml(r[c.k]||'')}</td>`).join('')}
            <td class="actions">
              <button class="btn btn-ghost btn-icon" onclick="ProcessModule.deleteRecord('${store}', ${r.id})">🗑️</button>
            </td>
          </tr>`).join('')}
          ${records.length === 0 ? `<tr><td colspan="${cols.length+1}" class="text-center text-muted">Chưa có dữ liệu</td></tr>` : ''}
        </tbody>
      </table>
    `;
  },

  async addRecord(store) {
    const record = { ma_cc: this.currentMaCc };
    // Mở form nhập nhanh bằng window.prompt (để đơn giản)
    // Trong thực tế sẽ dùng Modal Form Builder
    let isValid = true;
    const cols = {
      qt_congtac: ['tu','den','vi_tri','don_vi','phong_ban','chuc_vu'],
      qt_daotao: ['nam_tn','ma_truong','ma_nganh','ma_tdcm','xep_loai'],
      qt_luong: ['tu','den','ngach','bac','he_so'],
      qt_ktkl: ['ngay_ktkl','loai_ktkl','ma_ktkl','cq_ktkl','nguoi_ky'],
      qt_qhgd: ['ten_qhgd','ten','nam_sinh','noi_dung'],
      qt_danhgia: ['nam','loai','noi_dung'],
      qt_bonhiem: ['chuc_vu','don_vi','ngay_hluc','so_qdinh']
    }[store];

    for (const c of cols) {
      const val = prompt(`Nhập thông tin cho [${c}]:`);
      if (val === null) { isValid = false; break; }
      record[c] = val.trim();
    }

    if (isValid) {
      await DB.add(store, record);
      this.loadProcessTab(store);
      Toast.success('Đã thêm');
    }
  },

  async deleteRecord(store, id) {
    if (confirm('Xóa dòng này?')) {
      await DB.delete(store, id);
      this.loadProcessTab(store);
      Toast.success('Đã xóa');
    }
  }
};
window.ProcessModule = ProcessModule;
