
const Sidebar = {
  render() {
    const user = Auth.getUser();
    return `
    <div class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">H</div>
        <div class="logo-text">
          <h1>HUHA HRM</h1>
          <span>Quản lý nhân sự v2.0</span>
        </div>
      </div>
      <nav class="sidebar-nav" id="sidebarNav">
        <div class="menu-label">Tổng quan</div>
        <div class="menu-item" data-page="dashboard">
          <span class="icon">📊</span><span>Bảng điều khiển</span>
        </div>

        <div class="menu-label">Hệ thống</div>
        <div class="menu-group">
          <button class="menu-group-toggle">
            <span class="icon">⚙️</span><span>Hệ thống</span><span class="chevron">▶</span>
          </button>
          <div class="menu-group-items">
            <div class="menu-item" data-page="users"><span class="icon">👥</span><span>Quản lý người dùng</span></div>
            <div class="menu-item" data-page="logon"><span class="icon">📋</span><span>Nhật ký truy cập</span></div>
            <div class="menu-item" data-page="backup"><span class="icon">💾</span><span>Sao lưu / Phục hồi</span></div>
          </div>
        </div>

        <div class="menu-label">Danh mục</div>
        <div class="menu-item" data-page="catalogs">
          <span class="icon">📁</span><span>Quản lý danh mục</span>
          <span class="menu-badge">31</span>
        </div>

        <div class="menu-label">Hồ sơ cán bộ</div>
        <div class="menu-item" data-page="personnel">
          <span class="icon">👤</span><span>Nhập hồ sơ cán bộ</span>
        </div>
        <div class="menu-item" data-page="transfer">
          <span class="icon">🔄</span><span>Thuyên chuyển</span>
        </div>
        <div class="menu-item" data-page="search">
          <span class="icon">🔍</span><span>Tra cứu thông tin</span>
        </div>

        <div class="menu-group">
          <button class="menu-group-toggle">
            <span class="icon">📋</span><span>Danh sách</span><span class="chevron">▶</span>
          </button>
          <div class="menu-group-items">
            <div class="menu-item" data-page="list-canbo"><span class="icon">📄</span><span>DS cán bộ</span></div>
            <div class="menu-item" data-page="list-khenthuong"><span class="icon">🏆</span><span>DS khen thưởng</span></div>
            <div class="menu-item" data-page="list-kyluat"><span class="icon">⚠️</span><span>DS kỷ luật</span></div>
            <div class="menu-item" data-page="list-nganhnghe"><span class="icon">🎓</span><span>DS theo ngành đào tạo</span></div>
            <div class="menu-item" data-page="list-nghihuu"><span class="icon">🏠</span><span>DS đến tuổi nghỉ hưu</span></div>
            <div class="menu-item" data-page="list-lenluong"><span class="icon">💰</span><span>DS đến kỳ lên lương</span></div>
            <div class="menu-item" data-page="list-thuyenchuyen"><span class="icon">🔄</span><span>DS đã thuyên chuyển</span></div>
            <div class="menu-item" data-page="list-thannhan"><span class="icon">👨‍👩‍👧‍👦</span><span>DS thân nhân</span></div>
            <div class="menu-item" data-page="list-dienthoai"><span class="icon">📞</span><span>Danh bạ điện thoại</span></div>
          </div>
        </div>

        <div class="menu-label">Thống kê & Báo cáo</div>
        <div class="menu-group">
          <button class="menu-group-toggle">
            <span class="icon">📈</span><span>Báo cáo</span><span class="chevron">▶</span>
          </button>
          <div class="menu-group-items">
            <div class="menu-item" data-page="report-ngoaingu"><span class="icon">🌐</span><span>TK trình độ ngoại ngữ</span></div>
            <div class="menu-item" data-page="report-nganhdt"><span class="icon">📊</span><span>TK theo ngành đào tạo</span></div>
            <div class="menu-item" data-page="report-ngachtuoi"><span class="icon">📉</span><span>TK ngạch, tuổi, giới tính</span></div>
            <div class="menu-item" data-page="report-chatluong"><span class="icon">📋</span><span>BC chất lượng CC, VC</span></div>
          </div>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="avatar">${user ? user.fullname.charAt(0).toUpperCase() : 'A'}</div>
        <div class="sidebar-footer-text">
          <div style="font-size:var(--font-size-sm);font-weight:500">${user ? user.fullname : ''}</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted)">${user && user.admin ? 'Quản trị viên' : 'Người dùng'}</div>
        </div>
        <button class="btn btn-ghost ml-auto" onclick="App.logout()" title="Đăng xuất" style="margin-left:auto">🚪</button>
      </div>
    </div>`;
  },

  init() {
    // Toggle menu groups
    document.querySelectorAll('.menu-group-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.menu-group').classList.toggle('open');
      });
    });
    // Menu item clicks
    document.querySelectorAll('.menu-item[data-page]').forEach(item => {
      item.addEventListener('click', () => {
        App.navigate(item.dataset.page);
      });
    });
  },

  setActive(page) {
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    const active = document.querySelector(`.menu-item[data-page="${page}"]`);
    if (active) {
      active.classList.add('active');
      // Open parent group if needed
      const group = active.closest('.menu-group');
      if (group) group.classList.add('open');
    }
  }
};
window.Sidebar = Sidebar;
