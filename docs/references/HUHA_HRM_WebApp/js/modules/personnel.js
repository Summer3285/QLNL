
const PersonnelModule = {
  async render() {
    const personnel = await DB.getAll('personnel');
    return `
    <div class="page-title">
      <h2>👤 Hồ sơ cán bộ</h2>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="PersonnelModule.showForm()">+ Thêm hồ sơ mới</button>
      </div>
    </div>
    <div class="card">
      <div class="table-toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input class="form-control" placeholder="Tìm kiếm theo mã, họ tên..." oninput="PersonnelModule.filterTable(this.value)" style="padding-left:36px">
        </div>
      </div>
      <div class="data-table-wrapper">
        <table class="data-table" id="personnelTable">
          <thead><tr>
            <th>Mã CB</th><th>Họ tên</th><th>Đơn vị</th><th>Chức vụ</th><th>Thao tác</th>
          </tr></thead>
          <tbody>
            ${personnel.map(p => `<tr>
              <td><span class="badge badge-primary">${p.ma_cc}</span></td>
              <td><strong>${p.ho_ten}</strong></td>
              <td>${p.ma_dvi}</td>
              <td>${p.ma_cvcq || ''}</td>
              <td class="actions">
                <button class="btn btn-ghost btn-icon" title="Sửa" onclick="PersonnelModule.showForm('${p.ma_cc}')">✏️</button>
                <button class="btn btn-ghost btn-icon" title="Quá trình" onclick="ProcessModule.showProcesses('${p.ma_cc}')">📅</button>
                <button class="btn btn-ghost btn-icon" title="Xóa" onclick="PersonnelModule.deletePersonnel('${p.ma_cc}')">🗑️</button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  filterTable(query) {
    const rows = document.querySelectorAll('#personnelTable tbody tr');
    rows.forEach(row => {
      row.style.display = Utils.searchMatch(row.textContent, query) ? '' : 'none';
    });
  },

  async showForm(ma_cc = null) {
    let p = {};
    if (ma_cc) {
      p = await DB.get('personnel', ma_cc) || {};
    }

    // Prepare catalog options
    const catalogs = {};
    for (const key of Object.keys(CATALOG_DEFS)) {
      catalogs[key] = await DB.getAll(key);
    }

    const renderSelect = (id, catKey, value, emptyText = '-- Chọn --') => {
      const cat = catalogs[catKey] || [];
      const codeField = CATALOG_DEFS[catKey].fields[0];
      const nameField = CATALOG_DEFS[catKey].fields[1];
      let options = `<option value="">${emptyText}</option>`;
      cat.forEach(c => {
        const selected = value === c[codeField] ? 'selected' : '';
        options += `<option value="${c[codeField]}" ${selected}>${c[nameField]}</option>`;
      });
      return `<select class="form-control" id="${id}">${options}</select>`;
    };

    const content = `
    <div class="tabs personnel-tabs">
      <button class="tab-btn active" onclick="PersonnelModule.switchTab(1, this)">1. Thông tin cá nhân</button>
      <button class="tab-btn" onclick="PersonnelModule.switchTab(2, this)">2. Công tác & Tuyển dụng</button>
      <button class="tab-btn" onclick="PersonnelModule.switchTab(3, this)">3. Ngạch & Bậc lương</button>
      <button class="tab-btn" onclick="PersonnelModule.switchTab(4, this)">4. Trình độ</button>
      <button class="tab-btn" onclick="PersonnelModule.switchTab(5, this)">5. Đoàn thể</button>
      <button class="tab-btn" onclick="PersonnelModule.switchTab(6, this)">6. Quân sự</button>
      <button class="tab-btn" onclick="PersonnelModule.switchTab(7, this)">7. Sức khỏe</button>
      <button class="tab-btn" onclick="PersonnelModule.switchTab(8, this)">8. Khác</button>
    </div>
    
    <form id="personnelForm" class="personnel-form">
      <!-- TAB 1: THÔNG TIN CÁ NHÂN -->
      <div id="tab1" class="tab-content active">
        <h4 class="section-title">Thông tin cơ bản</h4>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Mã CB <span class="required">*</span></label><input class="form-control" id="p_ma_cc" value="${p.ma_cc||''}" ${ma_cc?'readonly':''}></div>
          <div class="form-group"><label class="form-label">Họ tên <span class="required">*</span></label><input class="form-control" id="p_ho_ten" value="${p.ho_ten||''}"></div>
          <div class="form-group"><label class="form-label">Tên khác</label><input class="form-control" id="p_ten_khac" value="${p.ten_khac||''}"></div>
        </div>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Bí danh</label><input class="form-control" id="p_bi_danh" value="${p.bi_danh||''}"></div>
          <div class="form-group"><label class="form-label">Đơn vị</label>${renderSelect('p_ma_dvi', 'dm_dvi', p.ma_dvi)}</div>
          <div class="form-group"><label class="form-label">Chức vụ chính quyền</label>${renderSelect('p_ma_cvcq', 'dm_cvcq', p.ma_cvcq)}</div>
        </div>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Ngày sinh</label><input type="date" class="form-control" id="p_ngay_sinh" value="${Utils.formatDateInput(p.ngay_sinh)}"></div>
          <div class="form-group"><label class="form-label">Giới tính</label>
            <select class="form-control" id="p_gioi_tinh">
              <option value="Nam" ${p.gioi_tinh==='Nam'?'selected':''}>Nam</option>
              <option value="Nữ" ${p.gioi_tinh==='Nữ'?'selected':''}>Nữ</option>
            </select>
          </div>
        </div>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Số CMND</label><input class="form-control" id="p_so_cmnd" value="${p.so_cmnd||''}"></div>
          <div class="form-group"><label class="form-label">Ngày cấp</label><input type="date" class="form-control" id="p_ngay_cap" value="${Utils.formatDateInput(p.ngay_cap)}"></div>
          <div class="form-group"><label class="form-label">Nơi cấp</label><input class="form-control" id="p_noi_cap" value="${p.noi_cap||''}"></div>
        </div>

        <h4 class="section-title">Quê quán & Nơi ở</h4>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Nơi sinh</label><input class="form-control" id="p_noi_sinh" value="${p.noi_sinh||''}"></div>
          <div class="form-group"><label class="form-label">Quê quán</label><input class="form-control" id="p_que_quan" value="${p.que_quan||''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Hộ khẩu thường trú</label><input class="form-control" id="p_ho_khau" value="${p.ho_khau||''}"></div>
          <div class="form-group"><label class="form-label">Chỗ ở hiện nay</label><input class="form-control" id="p_cho_o" value="${p.cho_o||''}"></div>
        </div>

        <h4 class="section-title">Thành phần & Tôn giáo</h4>
        <div class="form-row-4" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:var(--space-4)">
          <div class="form-group"><label class="form-label">Dân tộc</label>${renderSelect('p_ma_dtoc', 'dm_dtoc', p.ma_dtoc)}</div>
          <div class="form-group"><label class="form-label">Tôn giáo</label>${renderSelect('p_ma_tgiao', 'dm_tgiao', p.ma_tgiao)}</div>
          <div class="form-group"><label class="form-label">Xuất thân</label>${renderSelect('p_ma_xthan', 'dm_xthan', p.ma_xthan)}</div>
          <div class="form-group"><label class="form-label">Hôn nhân</label>${renderSelect('p_ma_tthn', 'dm_tthn', p.ma_tthn)}</div>
        </div>

        <h4 class="section-title">Liên hệ</h4>
        <div class="form-row-4" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:var(--space-4)">
          <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" id="p_email" value="${p.email||''}"></div>
          <div class="form-group"><label class="form-label">ĐT Di động</label><input class="form-control" id="p_dt_dd" value="${p.dt_dd||''}"></div>
          <div class="form-group"><label class="form-label">ĐT Nhà riêng</label><input class="form-control" id="p_dt_nr" value="${p.dt_nr||''}"></div>
          <div class="form-group"><label class="form-label">ĐT Cơ quan</label><input class="form-control" id="p_dt_cq" value="${p.dt_cq||''}"></div>
        </div>
      </div>

      <!-- TAB 2: CÔNG TÁC -->
      <div id="tab2" class="tab-content">
        <h4 class="section-title">Đại biểu</h4>
        <div class="form-row-4" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:var(--space-4)">
          <div class="form-group"><label class="form-check"><input type="checkbox" id="p_quoc_hoi" ${p.quoc_hoi?'checked':''}> Đại biểu Quốc hội</label></div>
          <div class="form-group"><label class="form-check"><input type="checkbox" id="p_hdnd_tinh" ${p.hdnd_tinh?'checked':''}> ĐB HĐND Tỉnh</label></div>
          <div class="form-group"><label class="form-check"><input type="checkbox" id="p_hdnd_huyen" ${p.hdnd_huyen?'checked':''}> ĐB HĐND Huyện</label></div>
          <div class="form-group"><label class="form-check"><input type="checkbox" id="p_hdnd_xa" ${p.hdnd_xa?'checked':''}> ĐB HĐND Xã</label></div>
        </div>
        
        <h4 class="section-title">Công tác & Tuyển dụng</h4>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Ngày vào cơ quan</label><input type="date" class="form-control" id="p_ngay_ctac" value="${Utils.formatDateInput(p.ngay_ctac)}"></div>
          <div class="form-group"><label class="form-label">Cơ quan công tác</label><input class="form-control" id="p_cq_ctac" value="${p.cq_ctac||''}"></div>
          <div class="form-group"><label class="form-label">Ngày hợp đồng</label><input type="date" class="form-control" id="p_ngay_kyhd" value="${Utils.formatDateInput(p.ngay_kyhd)}"></div>
        </div>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Ngày tuyển dụng</label><input type="date" class="form-control" id="p_ngay_td" value="${Utils.formatDateInput(p.ngay_td)}"></div>
          <div class="form-group"><label class="form-label">Cơ quan tuyển dụng</label><input class="form-control" id="p_cq_tdung" value="${p.cq_tdung||''}"></div>
          <div class="form-group"><label class="form-label">Hình thức TD</label><input class="form-control" id="p_ht_tdung" value="${p.ht_tdung||''}"></div>
        </div>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Nguồn tuyển dụng</label><input class="form-control" id="p_nguon_td" value="${p.nguon_td||''}"></div>
          <div class="form-group"><label class="form-label">Vị trí tuyển dụng</label><input class="form-control" id="p_vitri_td" value="${p.vitri_td||''}"></div>
          <div class="form-group"><label class="form-label">Ngành nghề trước TD</label>${renderSelect('p_ma_ngng', 'dm_ngng', p.ma_ngng)}</div>
        </div>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Ngày cơ quan hoàn thành</label><input type="date" class="form-control" id="p_ngay_cqht" value="${Utils.formatDateInput(p.ngay_cqht)}"></div>
          <div class="form-group"><label class="form-label">Lĩnh vực công tác</label>${renderSelect('p_ma_lvct', 'dm_lvct', p.ma_lvct)}</div>
          <div class="form-group"><label class="form-label">Công việc đang làm</label>${renderSelect('p_ma_cviec', 'dm_cviec', p.ma_cviec)}</div>
        </div>
      </div>

      <!-- TAB 3: LƯƠNG -->
      <div id="tab3" class="tab-content">
        <h4 class="section-title">Ngạch, Bậc, Phụ cấp</h4>
        <div class="form-row-4" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:var(--space-4)">
          <div class="form-group"><label class="form-label">Ngạch công chức</label>${renderSelect('p_ma_ngach', 'dm_ngcc', p.ma_ngach)}</div>
          <div class="form-group"><label class="form-label">Ngày bổ nhiệm ngạch</label><input type="date" class="form-control" id="p_ngay_ngach" value="${Utils.formatDateInput(p.ngay_ngach)}"></div>
          <div class="form-group"><label class="form-label">Bậc lương</label><input type="number" class="form-control" id="p_bac" value="${p.bac||''}"></div>
          <div class="form-group"><label class="form-label">Hệ số lương</label><input type="number" step="0.01" class="form-control" id="p_he_so" value="${p.he_so||''}"></div>
        </div>
        <div class="form-row-4" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:var(--space-4)">
          <div class="form-group"><label class="form-label">Hưởng từ ngày</label><input type="date" class="form-control" id="p_huong_tu" value="${Utils.formatDateInput(p.huong_tu)}"></div>
          <div class="form-group"><label class="form-label">Phần trăm</label><input type="number" class="form-control" id="p_phan_tram" value="${p.phan_tram||''}"></div>
          <div class="form-group"><label class="form-label">% Vượt khung</label><input type="number" class="form-control" id="p_pc_tnvk" value="${p.pc_tnvk||''}"></div>
          <div class="form-group"><label class="form-label">Ngày TNVK</label><input type="date" class="form-control" id="p_ngay_tnvk" value="${Utils.formatDateInput(p.ngay_tnvk)}"></div>
        </div>
        <div class="form-row-4" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:var(--space-4)">
          <div class="form-group"><label class="form-label">Chức vụ (NĐ 204)</label><input class="form-control" id="p_cvu_nd204" value="${p.cvu_nd204||''}"></div>
          <div class="form-group"><label class="form-label">PC Kiêm nhiệm</label><input type="number" step="0.01" class="form-control" id="p_pc_knhiem" value="${p.pc_knhiem||''}"></div>
          <div class="form-group"><label class="form-label">PC Chức vụ</label><input type="number" step="0.01" class="form-control" id="p_pc_cvu" value="${p.pc_cvu||''}"></div>
          <div class="form-group"><label class="form-label">Ngày bổ nhiệm CV</label><input type="date" class="form-control" id="p_ng_bnhiem" value="${Utils.formatDateInput(p.ng_bnhiem)}"></div>
        </div>
        <div class="form-row-4" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:var(--space-4)">
          <div class="form-group"><label class="form-label">PC Khu vực</label><input type="number" step="0.01" class="form-control" id="p_pc_kvuc" value="${p.pc_kvuc||''}"></div>
          <div class="form-group"><label class="form-label">PC Trách nhiệm</label><input type="number" step="0.01" class="form-control" id="p_pc_tnhiem" value="${p.pc_tnhiem||''}"></div>
          <div class="form-group"><label class="form-label">PC Khác</label><input type="number" step="0.01" class="form-control" id="p_pc_khac" value="${p.pc_khac||''}"></div>
        </div>
        
        <h4 class="section-title">Bảo hiểm Xã hội</h4>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Số BHXH</label><input class="form-control" id="p_so_bhxh" value="${p.so_bhxh||''}"></div>
          <div class="form-group"><label class="form-label">Ngày tham gia</label><input type="date" class="form-control" id="p_ngay_bhxh" value="${Utils.formatDateInput(p.ngay_bhxh)}"></div>
        </div>
      </div>

      <!-- TAB 4: TRÌNH ĐỘ -->
      <div id="tab4" class="tab-content">
        <h4 class="section-title">Học hàm & Học vấn</h4>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Học hàm</label><input class="form-control" id="p_hoc_ham" value="${p.hoc_ham||''}"></div>
          <div class="form-group"><label class="form-label">Ngày phong</label><input type="date" class="form-control" id="p_ngay_hham" value="${Utils.formatDateInput(p.ngay_hham)}"></div>
          <div class="form-group"><label class="form-label">Trình độ HVPT</label>${renderSelect('p_ma_tdhvpt', 'dm_tdhvpt', p.ma_tdhvpt)}</div>
        </div>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Trình độ Chuyên môn</label>${renderSelect('p_ma_tdcm', 'dm_tdcm', p.ma_tdcm)}</div>
          <div class="form-group"><label class="form-label">Trình độ LLCT</label>${renderSelect('p_ma_tdllct', 'dm_tdllct', p.ma_tdllct)}</div>
          <div class="form-group"><label class="form-label">Trình độ QLNN</label>${renderSelect('p_ma_tdqlnn', 'dm_tdqlnn', p.ma_tdqlnn)}</div>
        </div>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Trình độ QLKT</label>${renderSelect('p_ma_tdqlkt', 'dm_tdqlkt', p.ma_tdqlkt)}</div>
          <div class="form-group"><label class="form-label">Ngành đào tạo</label>${renderSelect('p_ma_nganh', 'dm_ngdtao', p.ma_nganh)}</div>
          <div class="form-group"><label class="form-label">Trình độ Tin học</label>${renderSelect('p_ma_tdth', 'dm_tdthoc', p.ma_tdth)}</div>
        </div>
        <h4 class="section-title">Ngoại ngữ</h4>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Ngoại ngữ chính</label>${renderSelect('p_ma_tanh', 'dm_nngu', p.ma_tanh)}</div>
          <div class="form-group"><label class="form-label">Trình độ Ngoại ngữ</label>${renderSelect('p_ma_tdnn', 'dm_tdnngu', p.ma_tdnn)}</div>
          <div class="form-group"><label class="form-label">Tiếng dân tộc</label><input class="form-control" id="p_tieng_dtoc" value="${p.tieng_dtoc||''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-check"><input type="checkbox" id="p_an_ninh" ${p.an_ninh?'checked':''}> An ninh</label></div>
          <div class="form-group"><label class="form-check"><input type="checkbox" id="p_quoc_phong" ${p.quoc_phong?'checked':''}> Quốc phòng</label></div>
        </div>
      </div>

      <!-- TAB 5: ĐOÀN THỂ -->
      <div id="tab5" class="tab-content">
        <h4 class="section-title">Đoàn Thanh Niên</h4>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Ngày vào Đoàn</label><input type="date" class="form-control" id="p_ngay_doan" value="${Utils.formatDateInput(p.ngay_doan)}"></div>
          <div class="form-group"><label class="form-label">Chức vụ Đoàn</label>${renderSelect('p_ma_cvdoan', 'dm_cvdoan', p.ma_cvdoan)}</div>
        </div>
        <h4 class="section-title">Đảng Cộng Sản</h4>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Ngày vào Đảng</label><input type="date" class="form-control" id="p_ngay_dang" value="${Utils.formatDateInput(p.ngay_dang)}"></div>
          <div class="form-group"><label class="form-label">Ngày chính thức</label><input type="date" class="form-control" id="p_ngay_cthuc" value="${Utils.formatDateInput(p.ngay_cthuc)}"></div>
          <div class="form-group"><label class="form-label">Chức vụ Đảng</label>${renderSelect('p_ma_cvdang', 'dm_cvdang', p.ma_cvdang)}</div>
        </div>
        <div class="form-group"><label class="form-label">Nơi kết nạp</label><input class="form-control" id="p_noi_knap" value="${p.noi_knap||''}"></div>
      </div>

      <!-- TAB 6: QUÂN SỰ -->
      <div id="tab6" class="tab-content">
        <h4 class="section-title">Quân sự</h4>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Ngày nhập ngũ</label><input type="date" class="form-control" id="p_ngay_nngu" value="${Utils.formatDateInput(p.ngay_nngu)}"></div>
          <div class="form-group"><label class="form-label">Ngày xuất ngũ</label><input type="date" class="form-control" id="p_ngay_xngu" value="${Utils.formatDateInput(p.ngay_xngu)}"></div>
          <div class="form-group"><label class="form-label">Quân hàm</label>${renderSelect('p_ma_qham', 'dm_qham', p.ma_qham)}</div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Chức vụ Lực lượng vũ trang</label>${renderSelect('p_ma_cvvt', 'dm_cvvt', p.ma_cvvt)}</div>
          <div class="form-group"><label class="form-label">Danh hiệu được phong</label>${renderSelect('p_ma_dhieu', 'dm_dhieu', p.ma_dhieu)}</div>
        </div>
      </div>

      <!-- TAB 7: SỨC KHỎE -->
      <div id="tab7" class="tab-content">
        <h4 class="section-title">Sức khỏe & Đặc điểm</h4>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Chính sách ưu tiên</label>${renderSelect('p_ma_utgd', 'dm_utgd', p.ma_utgd)}</div>
          <div class="form-group"><label class="form-label">Tình trạng sức khỏe</label>${renderSelect('p_ma_ttsk', 'dm_ttsk', p.ma_ttsk)}</div>
          <div class="form-group"><label class="form-label">Nhóm máu</label><input class="form-control" id="p_nhom_mau" value="${p.nhom_mau||''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Chiều cao (cm)</label><input type="number" class="form-control" id="p_cao" value="${p.cao||''}"></div>
          <div class="form-group"><label class="form-label">Cân nặng (kg)</label><input type="number" class="form-control" id="p_nang" value="${p.nang||''}"></div>
        </div>
        <h4 class="section-title">Thương binh & Khuyết tật</h4>
        <div class="form-row-3">
          <div class="form-group"><label class="form-label">Hạng thương binh</label>${renderSelect('p_ma_tbinh', 'dm_tbinh', p.ma_tbinh)}</div>
          <div class="form-group"><label class="form-label">Hình thức thương tật</label><input class="form-control" id="p_ht_ttat" value="${p.ht_ttat||''}"></div>
          <div class="form-group"><label class="form-label">Khuyết tật</label><input class="form-control" id="p_khuyet_tat" value="${p.khuyet_tat||''}"></div>
        </div>
      </div>

      <!-- TAB 8: KHÁC -->
      <div id="tab8" class="tab-content">
        <h4 class="section-title">Khen thưởng - Kỷ luật</h4>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Khen thưởng</label>${renderSelect('p_ma_kt', 'dm_ktkl', p.ma_kt)}</div>
          <div class="form-group"><label class="form-label">Kỷ luật</label>${renderSelect('p_ma_kl', 'dm_ktkl', p.ma_kl)}</div>
        </div>
        <h4 class="section-title">Sở trường</h4>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Sở trường</label><input class="form-control" id="p_so_truong" value="${p.so_truong||''}"></div>
          <div class="form-group"><label class="form-label">Việc làm tốt nhất</label><input class="form-control" id="p_viec_lnhat" value="${p.viec_lnhat||''}"></div>
        </div>
        <h4 class="section-title">Tự thuật</h4>
        <div class="form-group"><textarea class="form-control" id="p_noi_dung1" rows="3" placeholder="Đặc điểm lịch sử bản thân">${p.noi_dung1||''}</textarea></div>
        <div class="form-group"><textarea class="form-control" id="p_noi_dung2" rows="3" placeholder="Lịch sử chính trị">${p.noi_dung2||''}</textarea></div>
        <div class="form-group"><textarea class="form-control" id="p_noi_dung3" rows="3" placeholder="Quan hệ gia đình">${p.noi_dung3||''}</textarea></div>
        <div class="form-group"><textarea class="form-control" id="p_noi_dung4" rows="3" placeholder="Nhận xét, đánh giá">${p.noi_dung4||''}</textarea></div>
      </div>
    </form>`;

    Modal.show({
      title: ma_cc ? `Sửa hồ sơ: ${p.ho_ten}` : 'Thêm hồ sơ mới',
      content: content,
      size: 'xl',
      footer: `<button class="btn btn-secondary" onclick="Modal.close()">Hủy</button>
               <button class="btn btn-primary" onclick="PersonnelModule.saveForm('${ma_cc||''}')">Lưu hồ sơ</button>`
    });
  },

  switchTab(num, btn) {
    document.querySelectorAll('.personnel-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.personnel-form .tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab${num}`).classList.add('active');
  },

  async saveForm(existing_ma_cc) {
    const ma_cc = document.getElementById('p_ma_cc').value.trim();
    if (!ma_cc) { Toast.error('Mã cán bộ không được để trống!'); return; }

    // Check existing
    if (!existing_ma_cc) {
      const exist = await DB.get('personnel', ma_cc);
      if (exist) { Toast.error('Mã cán bộ đã tồn tại!'); return; }
    }

    // Collect data (map all inputs to fields)
    const inputs = document.querySelectorAll('#personnelForm input, #personnelForm select, #personnelForm textarea');
    const data = {};
    inputs.forEach(el => {
      const key = el.id.replace(/^p_/, '');
      if (el.type === 'checkbox') {
        data[key] = el.checked ? 1 : 0;
      } else {
        data[key] = el.value.trim();
      }
    });

    try {
      await DB.put('personnel', data);
      Toast.success('Lưu hồ sơ thành công!');
      Modal.close();
      App.navigate('personnel');
    } catch(e) {
      Toast.error('Lỗi: ' + e.message);
    }
  },

  async deletePersonnel(ma_cc) {
    if (await Modal.confirm(`Bạn có chắc muốn xóa hồ sơ ${ma_cc}?`)) {
      await DB.delete('personnel', ma_cc);
      // Delete associated processes
      for (const store of Object.keys(PROCESS_STORES)) {
        const processes = await DB.getByIndex(store, 'ma_cc', ma_cc);
        for (const p of processes) await DB.delete(store, p.id);
      }
      Toast.success('Đã xóa hồ sơ!');
      App.navigate('personnel');
    }
  }
};
window.PersonnelModule = PersonnelModule;
