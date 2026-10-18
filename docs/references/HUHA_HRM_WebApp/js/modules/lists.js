
const ListsModule = {
  // Helper: resolve a catalog code to its display name
  async resolveName(storeName, id) {
    if (!id || String(id).trim() === '') return '';
    try {
      const all = await DB.getAll(storeName);
      const found = all.find(r => {
        const maKey = Object.keys(r).find(k => k.startsWith('ma_'));
        return maKey && String(r[maKey]).trim() === String(id).trim();
      });
      if (found) {
        const tenKey = Object.keys(found).find(k => k.startsWith('ten_'));
        return tenKey ? found[tenKey] : id;
      }
    } catch(e) {}
    return id;
  },

  // Build lookup map for a catalog
  async buildLookup(storeName) {
    const map = {};
    try {
      const all = await DB.getAll(storeName);
      for (const r of all) {
        const maKey = Object.keys(r).find(k => k.startsWith('ma_'));
        const tenKey = Object.keys(r).find(k => k.startsWith('ten_'));
        if (maKey && tenKey) map[String(r[maKey]).trim()] = r[tenKey];
      }
    } catch(e) {}
    return map;
  },

  async render(listType) {
    const personnel = await DB.getAll('personnel');

    // Pre-load all catalog lookups
    const [dviMap, cvcqMap, tdcmMap, tdllctMap, tdqlnnMap, dtocMap,
           tgiaoMap, tthnMap, ngachMap, ktklMap, ttskMap, nnguMap] = await Promise.all([
      this.buildLookup('dm_dvi'),
      this.buildLookup('dm_cvcq'),
      this.buildLookup('dm_tdcm'),
      this.buildLookup('dm_tdllct'),
      this.buildLookup('dm_tdqlnn'),
      this.buildLookup('dm_dtoc'),
      this.buildLookup('dm_tgiao'),
      this.buildLookup('dm_tthn'),
      this.buildLookup('dm_ngcc'),
      this.buildLookup('dm_ktkl'),
      this.buildLookup('dm_ttsk'),
      this.buildLookup('dm_nngu'),
    ]);

    const L = (map, code) => {
      if (!code) return '';
      return map[String(code).trim()] || code;
    };

    let data = [];
    let title = '';
    let cols = [];

    switch(listType) {
      case 'canbo':
        title = 'Danh sách Cán bộ';
        data = personnel;
        cols = [
          {k:'ma_cc', n:'Mã CB'},
          {k:'ho_ten', n:'Họ tên'},
          {k:'ngay_sinh', n:'Ngày sinh', fmt: Utils.formatDate},
          {k:'gioi_tinh', n:'Giới tính'},
          {k:'ma_dvi', n:'Đơn vị', fmt: v => L(dviMap, v)},
          {k:'ma_cvcq', n:'Chức vụ', fmt: v => L(cvcqMap, v)},
          {k:'ma_tdcm', n:'Trình độ CM', fmt: v => L(tdcmMap, v)},
          {k:'ma_cc', n:'Thao tác', fmt: v => `<button class="btn btn-ghost btn-sm" onclick="PrintModule.printProfile('${v}')" title="In hồ sơ 2C">🖨️ In cá nhân</button>`},
        ];
        break;
      case 'khenthuong':
        title = 'Danh sách Cán bộ được Khen thưởng';
        data = personnel.filter(p => p.ma_kt);
        cols = [
          {k:'ma_cc', n:'Mã CB'}, {k:'ho_ten', n:'Họ tên'},
          {k:'ma_dvi', n:'Đơn vị', fmt: v => L(dviMap, v)},
          {k:'ma_kt', n:'Hình thức KT', fmt: v => L(ktklMap, v)},
          {k:'ngay_kt', n:'Ngày KT', fmt: Utils.formatDate},
          {k:'so_kt', n:'Số QĐ'}, {k:'cq_kt', n:'Cơ quan KT'},
        ];
        break;
      case 'kyluat':
        title = 'Danh sách Cán bộ bị Kỷ luật';
        data = personnel.filter(p => p.ma_kl);
        cols = [
          {k:'ma_cc', n:'Mã CB'}, {k:'ho_ten', n:'Họ tên'},
          {k:'ma_dvi', n:'Đơn vị', fmt: v => L(dviMap, v)},
          {k:'ma_kl', n:'Hình thức KL', fmt: v => L(ktklMap, v)},
          {k:'ngay_kl', n:'Ngày KL', fmt: Utils.formatDate},
          {k:'so_kl', n:'Số QĐ'},
        ];
        break;
      case 'nganhnghe':
        title = 'Danh sách Cán bộ theo Trình độ chuyên môn';
        data = personnel.sort((a,b) => (a.ma_tdcm||'').localeCompare(b.ma_tdcm||''));
        cols = [
          {k:'ma_cc', n:'Mã CB'}, {k:'ho_ten', n:'Họ tên'},
          {k:'ma_dvi', n:'Đơn vị', fmt: v => L(dviMap, v)},
          {k:'ma_tdcm', n:'Trình độ CM', fmt: v => L(tdcmMap, v)},
          {k:'ma_cc', n:'Thao tác', fmt: v => `<button class="btn btn-ghost btn-sm" onclick="PrintModule.printProfile('${v}')" title="In hồ sơ 2C">🖨️ In cá nhân</button>`},
          {k:'ma_tdllct', n:'Lý luận CT', fmt: v => L(tdllctMap, v)},
          {k:'ma_tdqlnn', n:'Quản lý NN', fmt: v => L(tdqlnnMap, v)},
        ];
        break;
      case 'nghihuu':
        title = 'Danh sách Cán bộ đến tuổi nghỉ hưu';
        const currentYear = new Date().getFullYear();
        data = personnel.filter(p => {
          if(!p.ngay_sinh) return false;
          const yob = new Date(p.ngay_sinh).getFullYear();
          return (p.gioi_tinh === 'Nam' && currentYear - yob >= 60) ||
                 (p.gioi_tinh === 'Nữ' && currentYear - yob >= 55);
        });
        cols = [
          {k:'ma_cc', n:'Mã CB'}, {k:'ho_ten', n:'Họ tên'},
          {k:'ngay_sinh', n:'Ngày sinh', fmt: Utils.formatDate},
          {k:'gioi_tinh', n:'Giới tính'},
          {k:'ma_dvi', n:'Đơn vị', fmt: v => L(dviMap, v)},
          {k:'ma_cvcq', n:'Chức vụ', fmt: v => L(cvcqMap, v)},
        ];
        break;
      case 'lenluong':
        title = 'Danh sách Cán bộ đến kỳ lên lương';
        const today = new Date();
        data = personnel.filter(p => {
          if(!p.huong_tu) return false;
          const huongTu = new Date(p.huong_tu);
          const diffYears = (today - huongTu) / (1000 * 60 * 60 * 24 * 365);
          return diffYears >= 3;
        });
        cols = [
          {k:'ma_cc', n:'Mã CB'}, {k:'ho_ten', n:'Họ tên'},
          {k:'ma_dvi', n:'Đơn vị', fmt: v => L(dviMap, v)},
          {k:'ma_ngach', n:'Ngạch', fmt: v => L(ngachMap, v)},
          {k:'bac', n:'Bậc'}, {k:'he_so', n:'Hệ số'},
          {k:'huong_tu', n:'Hưởng từ', fmt: Utils.formatDate},
        ];
        break;
      case 'thuyenchuyen':
        title = 'Danh sách Cán bộ đã thuyên chuyển';
        data = await DB.getAll('transfers');
        cols = [
          {k:'ma_cc', n:'Mã CB'}, {k:'ho_ten', n:'Họ tên'},
          {k:'don_vi_cu', n:'Đơn vị cũ'}, {k:'noi_den', n:'Nơi đến'},
          {k:'ngay_chuyen', n:'Ngày chuyển', fmt: Utils.formatDate},
        ];
        break;
      case 'thannhan':
        title = 'Danh sách Thân nhân cán bộ';
        const qhgd = await DB.getAll('qt_qhgd');
        data = qhgd;
        cols = [
          {k:'ma_cc', n:'Mã CB'}, {k:'ten_qhgd', n:'Quan hệ'},
          {k:'ten', n:'Họ tên thân nhân'}, {k:'nam_sinh', n:'Năm sinh'},
        ];
        break;
      case 'dienthoai':
        title = 'Danh bạ điện thoại';
        data = personnel.filter(p => p.dt_dd || p.dt_cq || p.dt_nr);
        cols = [
          {k:'ma_cc', n:'Mã CB'}, {k:'ho_ten', n:'Họ tên'},
          {k:'ma_dvi', n:'Đơn vị', fmt: v => L(dviMap, v)},
          {k:'ma_cvcq', n:'Chức vụ', fmt: v => L(cvcqMap, v)},
          {k:'dt_dd', n:'ĐT Di động'}, {k:'dt_cq', n:'ĐT Cơ quan'},
          {k:'email', n:'Email'},
        ];
        break;
    }

    const hasBatchPrint = listType === 'canbo';
    const tableHtml = `
      <table class="data-table">
        <thead><tr>
          ${hasBatchPrint ? `<th style="width:40px;text-align:center"><input type="checkbox" onchange="ListsModule.toggleAll(this)"></th>` : ''}
          <th>STT</th>
          ${cols.map(c => `<th>${c.n}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${data.map((row, i) => `<tr>
            ${hasBatchPrint ? `<td style="text-align:center"><input type="checkbox" class="batch-print-chk" value="${row.ma_cc}"></td>` : ''}
            <td>${i+1}</td>
            ${cols.map(c => `<td>${c.fmt ? c.fmt(row[c.k]) : (row[c.k] || '')}</td>`).join('')}
          </tr>`).join('')}
          ${data.length === 0 ? `<tr><td colspan="${cols.length + (hasBatchPrint?2:1)}" class="text-center text-muted">Không có dữ liệu</td></tr>` : ''}
        </tbody>
      </table>
    `;

    window._currentListData = data;
    window._currentListCols = cols;
    window._currentListTitle = title;

    return `
    <div class="page-title">
      <h2>📋 ${title}</h2>
      <div class="page-actions">
        <span class="badge badge-info">${data.length} cán bộ</span>
      </div>
    </div>
    <div class="card">
      <div class="list-export-bar">
        ${hasBatchPrint ? `<button class="btn btn-primary" onclick="ListsModule.printBatchProfiles()">🖨️ In Hàng Loạt (Sơ yếu lý lịch)</button>` : ''}
        <button class="btn btn-secondary" onclick="ListsModule.exportCSV()">📥 Xuất CSV</button>
        <button class="btn btn-secondary" onclick="ListsModule.print()">🖨️ In Danh Sách (Bảng)</button>
      </div>
      <div class="data-table-wrapper" id="listTableContainer">
        ${tableHtml}
      </div>
    </div>
    `;
  },

  toggleAll(checkbox) {
    const checkboxes = document.querySelectorAll('.batch-print-chk');
    checkboxes.forEach(chk => chk.checked = checkbox.checked);
  },

  printBatchProfiles() {
    const checked = document.querySelectorAll('.batch-print-chk:checked');
    if (checked.length === 0) {
      Toast.error('Vui lòng tích chọn ít nhất 1 cán bộ để in');
      return;
    }
    const ma_cc_list = Array.from(checked).map(c => c.value);
    PrintModule.printBatch(ma_cc_list);
  },
  
  exportCSV() {
    const data = window._currentListData;
    const cols = window._currentListCols;
    const headers = cols.map(c => ({key: c.k, label: c.n}));
    Utils.downloadCSV(data, headers, `${Utils.slugify(window._currentListTitle)}.csv`);
    Toast.success('Đã xuất file CSV');
  },

  print() {
    const data = window._currentListData;
    const title = window._currentListTitle;
    // Filter out the 'Thao tác' column for printing
    const cols = window._currentListCols.filter(c => c.n !== 'Thao tác');
    
    const tableHtml = `
      <table>
        <thead><tr>
          <th>STT</th>
          ${cols.map(c => `<th>${c.n}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${data.map((row, i) => `<tr>
            <td style="text-align:center">${i+1}</td>
            ${cols.map(c => `<td>${c.fmt ? c.fmt(row[c.k]) : (row[c.k] || '')}</td>`).join('')}
          </tr>`).join('')}
          ${data.length === 0 ? `<tr><td colspan="${cols.length+1}" class="text-center">Không có dữ liệu</td></tr>` : ''}
        </tbody>
      </table>
    `;
    
    Export.printTable(title, tableHtml);
  }
};
window.ListsModule = ListsModule;
