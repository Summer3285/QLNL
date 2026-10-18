
const SearchModule = {
  async render() {
    // Load catalogs for dropdowns
    const [dvis, dtocs, tgiaos, tthns, tdcms, tdllcts, tdqlnns, cvcqs, xthanhs, ttsk] = await Promise.all([
      DB.getAll('dm_dvi'),
      DB.getAll('dm_dtoc'),
      DB.getAll('dm_tgiao'),
      DB.getAll('dm_tthn'),
      DB.getAll('dm_tdcm'),
      DB.getAll('dm_tdllct'),
      DB.getAll('dm_tdqlnn'),
      DB.getAll('dm_cvcq'),
      DB.getAll('dm_xthan'),
      DB.getAll('dm_ttsk'),
    ]);

    const opt = (items, keyField, nameField) =>
      items.map(i => `<option value="${i[keyField]}">${i[nameField]}</option>`).join('');

    return `
    <div class="page-title">
      <h2>🔍 Tra cứu thông tin cán bộ</h2>
    </div>
    
    <div class="card">
      <div class="card-header"><h3>Điều kiện tra cứu</h3></div>
      <div class="card-body">

        <div class="form-grid form-grid-3" style="gap:12px">
          <div class="form-group">
            <label class="form-label">Họ và tên (hoặc mã CB)</label>
            <input type="text" class="form-control" id="sq_keyword" placeholder="Nhập từ khóa...">
          </div>
          <div class="form-group">
            <label class="form-label">Đơn vị</label>
            <select class="form-control" id="sq_dvi">
              <option value="">-- Tất cả --</option>
              ${opt(dvis, 'ma_dvi', 'ten_dvi')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Giới tính</label>
            <select class="form-control" id="sq_gioitinh">
              <option value="">-- Tất cả --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Tuổi từ</label>
            <input type="number" class="form-control" id="sq_tuoi_tu" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label">Đến tuổi</label>
            <input type="number" class="form-control" id="sq_tuoi_den" placeholder="100">
          </div>
          <div class="form-group">
            <label class="form-label">Dân tộc</label>
            <select class="form-control" id="sq_dtoc">
              <option value="">-- Tất cả --</option>
              ${opt(dtocs, 'ma_dtoc', 'ten_dtoc')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Tôn giáo</label>
            <select class="form-control" id="sq_tgiao">
              <option value="">-- Tất cả --</option>
              ${opt(tgiaos, 'ma_tgiao', 'ten_tgiao')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tình trạng hôn nhân</label>
            <select class="form-control" id="sq_tthn">
              <option value="">-- Tất cả --</option>
              ${opt(tthns, 'ma_tthn', 'ten_tthn')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Thành phần xuất thân</label>
            <select class="form-control" id="sq_xthan">
              <option value="">-- Tất cả --</option>
              ${opt(xthanhs, 'ma_xthan', 'ten_xthan')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Trình độ chuyên môn</label>
            <select class="form-control" id="sq_tdcm">
              <option value="">-- Tất cả --</option>
              ${opt(tdcms, 'ma_tdcm', 'ten_tdcm')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Lý luận chính trị</label>
            <select class="form-control" id="sq_tdllct">
              <option value="">-- Tất cả --</option>
              ${opt(tdllcts, 'ma_tdllct', 'ten_tdllct')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Quản lý nhà nước</label>
            <select class="form-control" id="sq_tdqlnn">
              <option value="">-- Tất cả --</option>
              ${opt(tdqlnns, 'ma_tdqlnn', 'ten_tdqlnn')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Chức vụ chính quyền</label>
            <select class="form-control" id="sq_cvcq">
              <option value="">-- Tất cả --</option>
              ${opt(cvcqs, 'ma_cvcq', 'ten_cvcq')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tình trạng sức khỏe</label>
            <select class="form-control" id="sq_ttsk">
              <option value="">-- Tất cả --</option>
              ${opt(ttsk, 'ma_ttsk', 'ten_ttsk')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Đảng viên</label>
            <select class="form-control" id="sq_dangvien">
              <option value="">-- Tất cả --</option>
              <option value="co">Là đảng viên</option>
              <option value="khong">Chưa vào Đảng</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Năm sinh từ</label>
            <input type="number" class="form-control" id="sq_nam_tu" placeholder="VD: 1970">
          </div>
          <div class="form-group">
            <label class="form-label">Năm sinh đến</label>
            <input type="number" class="form-control" id="sq_nam_den" placeholder="VD: 2000">
          </div>
          <div class="form-group" style="align-self:flex-end; display:flex; gap:8px">
            <button class="btn btn-secondary w-full" onclick="SearchModule.clearForm()">🔄 Xóa điều kiện</button>
            <button class="btn btn-primary w-full" onclick="SearchModule.executeSearch()">🔍 Tìm kiếm</button>
          </div>
        </div>

      </div>
    </div>
    
    <div class="search-results" id="searchResults"></div>
    `;
  },

  clearForm() {
    ['sq_keyword','sq_dvi','sq_gioitinh','sq_tuoi_tu','sq_tuoi_den',
     'sq_dtoc','sq_tgiao','sq_tthn','sq_xthan','sq_tdcm','sq_tdllct',
     'sq_tdqlnn','sq_cvcq','sq_ttsk','sq_dangvien','sq_nam_tu','sq_nam_den'
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('searchResults').innerHTML = '';
  },

  async executeSearch() {
    const keyword   = document.getElementById('sq_keyword').value.trim().toLowerCase();
    const dvi       = document.getElementById('sq_dvi').value;
    const gioiTinh  = document.getElementById('sq_gioitinh').value;
    const tuoiTu    = parseInt(document.getElementById('sq_tuoi_tu').value) || 0;
    const tuoiDen   = parseInt(document.getElementById('sq_tuoi_den').value) || 999;
    const dtoc      = document.getElementById('sq_dtoc').value;
    const tgiao     = document.getElementById('sq_tgiao').value;
    const tthn      = document.getElementById('sq_tthn').value;
    const xthan     = document.getElementById('sq_xthan').value;
    const tdcm      = document.getElementById('sq_tdcm').value;
    const tdllct    = document.getElementById('sq_tdllct').value;
    const tdqlnn    = document.getElementById('sq_tdqlnn').value;
    const cvcq      = document.getElementById('sq_cvcq').value;
    const ttsk      = document.getElementById('sq_ttsk').value;
    const dangvien  = document.getElementById('sq_dangvien').value;
    const namTu     = parseInt(document.getElementById('sq_nam_tu').value) || 0;
    const namDen    = parseInt(document.getElementById('sq_nam_den').value) || 9999;

    const personnel = await DB.getAll('personnel');
    const now = new Date().getFullYear();
    
    const results = personnel.filter(p => {
      // Keyword search: ho ten or ma_cc
      if (keyword && !((p.ho_ten||'').toLowerCase().includes(keyword) || (p.ma_cc||'').toLowerCase().includes(keyword))) return false;
      
      // Dropdown filters
      if (dvi     && (p.ma_dvi   || '').trim() !== dvi)     return false;
      if (gioiTinh && (p.gioi_tinh || '').trim() !== gioiTinh) return false;
      if (dtoc    && (p.ma_dtoc  || '').trim() !== dtoc)    return false;
      if (tgiao   && (p.ma_tgiao || '').trim() !== tgiao)   return false;
      if (tthn    && (p.ma_tthn  || '').trim() !== tthn)    return false;
      if (xthan   && (p.ma_xthan || '').trim() !== xthan)   return false;
      if (tdcm    && (p.ma_tdcm  || '').trim() !== tdcm)    return false;
      if (tdllct  && (p.ma_tdllct|| '').trim() !== tdllct)  return false;
      if (tdqlnn  && (p.ma_tdqlnn|| '').trim() !== tdqlnn)  return false;
      if (cvcq    && (p.ma_cvcq  || '').trim() !== cvcq)    return false;
      if (ttsk    && (p.ma_ttsk  || '').trim() !== ttsk)    return false;

      // Đảng viên
      if (dangvien === 'co'    && !p.ngay_dang) return false;
      if (dangvien === 'khong' && p.ngay_dang)  return false;

      // Age filter
      const age = Utils.calculateAge(p.ngay_sinh);
      if (tuoiTu > 0 || tuoiDen < 999) {
        if (age === '' || age < tuoiTu || age > tuoiDen) return false;
      }

      // Year-of-birth filter
      if (namTu > 0 || namDen < 9999) {
        const yr = p.ngay_sinh ? new Date(p.ngay_sinh).getFullYear() : null;
        if (!yr || yr < namTu || yr > namDen) return false;
      }

      return true;
    });

    const container = document.getElementById('searchResults');
    if (results.length === 0) {
      container.innerHTML = `<div class="card"><div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Không tìm thấy kết quả</h3>
        <p>Vui lòng thử lại với các điều kiện tra cứu khác.</p>
      </div></div>`;
      return;
    }

    container.innerHTML = `
    <div class="card">
      <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
        <h3>Tìm thấy <strong>${results.length}</strong> cán bộ</h3>
        <button class="btn btn-secondary btn-sm" onclick="SearchModule.exportResults()">⬇️ Xuất danh sách</button>
      </div>
      <div class="data-table-wrapper">
        <table class="data-table" id="searchResultTable">
          <thead><tr>
            <th>Mã CB</th><th>Họ tên</th><th>Ngày sinh</th><th>Giới tính</th>
            <th>Đơn vị</th><th>Chức vụ</th><th>Trình độ CM</th><th>Thao tác</th>
          </tr></thead>
          <tbody>
            ${results.map(p => `<tr>
              <td><span class="badge badge-primary">${p.ma_cc||''}</span></td>
              <td><strong>${p.ho_ten||''}</strong></td>
              <td>${Utils.formatDate(p.ngay_sinh)}</td>
              <td>${p.gioi_tinh||''}</td>
              <td>${p.ma_dvi||''}</td>
              <td>${p.ma_cvcq||''}</td>
              <td>${p.ma_tdcm||''}</td>
              <td class="actions">
                <button class="btn btn-ghost btn-icon" title="Xem/Sửa" onclick="PersonnelModule.showForm('${p.ma_cc}')">✏️</button>
                <button class="btn btn-ghost btn-icon" title="In hồ sơ" onclick="PrintModule.printProfile('${p.ma_cc}')">🖨️</button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

    // Cache results for export
    window._searchResults = results;
  },

  exportResults() {
    const results = window._searchResults || [];
    if (!results.length) return;
    const headers = ['Mã CB', 'Họ tên', 'Ngày sinh', 'Giới tính', 'Đơn vị', 'Chức vụ', 'Trình độ CM'];
    const rows = results.map(p => [
      p.ma_cc||'', p.ho_ten||'', Utils.formatDate(p.ngay_sinh),
      p.gioi_tinh||'', p.ma_dvi||'', p.ma_cvcq||'', p.ma_tdcm||''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'KetQuaTraCuu.csv';
    a.click();
  }
};
window.SearchModule = SearchModule;
