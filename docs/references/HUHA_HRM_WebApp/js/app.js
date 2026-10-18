
const App = {
  routes: {
    'dashboard': DashboardModule.render.bind(DashboardModule),
    'users': SystemModule.renderUsers.bind(SystemModule),
    'logon': SystemModule.renderLogon.bind(SystemModule),
    'backup': SystemModule.renderBackup.bind(SystemModule),
    'catalogs': CatalogModule.render.bind(CatalogModule),
    'personnel': PersonnelModule.render.bind(PersonnelModule),
    'transfer': TransferModule.render.bind(TransferModule),
    'search': SearchModule.render.bind(SearchModule),
  },

  async init() {

  // ONE-TIME SYNC
  try {
    await DB.importAll(window.INITIAL_DATA);
    console.log("FORCE SYNC COMPLETED!");
  } catch(e) {}

    await DB.seedDefaults();
    
    // Auto import initial data if available
    const importRes = await DB.loadInitialData();
    if (importRes && importRes.success) {
      console.log(importRes.message);
    }

    
    // Add list routes dynamically
    const lists = ['canbo','khenthuong','kyluat','nganhnghe','nghihuu','lenluong','thuyenchuyen','thannhan','dienthoai'];
    lists.forEach(l => {
      this.routes[`list-${l}`] = () => ListsModule.render(l);
    });

    // Add report routes dynamically
    const reports = ['ngoaingu','nganhdt','ngachtuoi','chatluong'];
    reports.forEach(r => {
      this.routes[`report-${r}`] = () => ReportsModule.render(r);
    });

    if (!Auth.isLoggedIn()) {
      this.renderLogin();
    } else {
      this.renderLayout();
    }
  },

  renderLogin() {
    document.getElementById('app').innerHTML = `
      <div class="login-page">
        <div class="login-card">
          <div class="login-logo">
            <div class="icon-box">H</div>
            <h2>HUHA HRM</h2>
            <p>Phần mềm Quản lý Cán bộ v2.0</p>
          </div>
          <form id="loginForm" onsubmit="App.handleLogin(event)">
            <div class="form-group">
              <label class="form-label">Tên đăng nhập</label>
              <input type="text" id="username" class="form-control" required autocomplete="off">
            </div>
            <div class="form-group">
              <label class="form-label">Mật khẩu</label>
              <input type="password" id="password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary login-btn">Đăng nhập</button>
          </form>
        </div>
      </div>
    `;
    setTimeout(() => document.getElementById('username').focus(), 100);
  },

  async handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    const result = await Auth.login(user, pass);
    
    if (result.success) {
      Toast.success(`Chào mừng ${result.user.fullname}!`);
      this.renderLayout();
    } else {
      Toast.error(result.message);
    }
  },

  logout() {
    Auth.logout();
    this.renderLogin();
  },

  renderLayout() {
    document.getElementById('app').innerHTML = `
      ${Sidebar.render()}
      <div class="main-wrapper">
        <header class="main-header">
          <div class="header-left">
            <button class="header-btn" onclick="App.toggleSidebar()">☰</button>
            <div class="header-breadcrumb" id="headerBreadcrumb">
              <span>Bảng điều khiển</span>
            </div>
          </div>
        </header>
        <main class="main-content" id="mainContent"></main>
      </div>
    `;
    Sidebar.init();
    this.navigate('dashboard');
  },

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
  },

  async navigate(route) {
    if (!this.routes[route]) route = 'dashboard';
    
    // Check permissions
    if (route === 'users' && !Auth.isAdmin()) {
      Toast.error('Bạn không có quyền truy cập chức năng này!');
      return;
    }
    if (route === 'catalogs' && !Auth.canEditCatalog()) {
      Toast.error('Bạn không có quyền sửa danh mục!');
      return;
    }

    const main = document.getElementById('mainContent');
    const breadcrumb = document.getElementById('headerBreadcrumb');
    
    // Loading state
    main.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%"><div class="loading-spinner"></div></div>`;
    
    try {
      const content = await this.routes[route]();
      main.innerHTML = content;
      Sidebar.setActive(route);
      
      // Update breadcrumb
      const activeMenu = document.querySelector(`.menu-item[data-page="${route}"] span:last-child`);
      if (activeMenu) {
        breadcrumb.innerHTML = `<span>${activeMenu.textContent}</span>`;
      }
    } catch (error) {
      console.error(error);
      main.innerHTML = `<div class="empty-state">
        <div class="empty-icon text-danger">⚠️</div>
        <h3>Lỗi tải trang</h3>
        <p>${error.message}</p>
      </div>`;
    }
  }
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
