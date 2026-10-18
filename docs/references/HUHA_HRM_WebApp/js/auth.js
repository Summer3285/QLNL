
// ============================================================
// HUHA HRM - Authentication
// ============================================================
const Auth = {
  currentUser: null,

  async login(username, password) {
    const users = await DB.getAll('users');
    const user = users.find(u => u.name === username && u.password === password);
    if (!user) return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' };

    this.currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user));

    // Log access
    await DB.add('logon', {
      user: user.name,
      date: Utils.today(),
      time: new Date().toLocaleTimeString('vi-VN'),
      status: 'IN'
    });

    return { success: true, user };
  },

  logout() {
    if (this.currentUser) {
      DB.add('logon', {
        user: this.currentUser.name,
        date: Utils.today(),
        time: new Date().toLocaleTimeString('vi-VN'),
        status: 'OUT'
      });
    }
    this.currentUser = null;
    sessionStorage.removeItem('currentUser');
  },

  isLoggedIn() {
    if (this.currentUser) return true;
    const saved = sessionStorage.getItem('currentUser');
    if (saved) {
      this.currentUser = JSON.parse(saved);
      return true;
    }
    return false;
  },

  isAdmin() {
    return this.currentUser && this.currentUser.admin === 1;
  },

  canEditCatalog() {
    return this.currentUser && (this.currentUser.admin === 1 || this.currentUser.edit_dm === 1);
  },

  canEditData() {
    return this.currentUser && (this.currentUser.admin === 1 || this.currentUser.edit_sl === 1);
  },

  getUser() {
    return this.currentUser;
  }
};

window.Auth = Auth;
