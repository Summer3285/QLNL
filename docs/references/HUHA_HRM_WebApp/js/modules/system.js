
const SystemModule = {
  async renderUsers() {
    const users = await DB.getAll('users');
    return `
    <div class="page-title">
      <h2>👥 Quản lý người dùng</h2>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="SystemModule.showUserForm()">+ Thêm người dùng</button>
      </div>
    </div>
    <div class="card">
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr>
            <th>ID</th><th>Tên đăng nhập</th><th>Họ tên</th>
            <th>Admin</th><th>Sửa DM</th><th>Sửa SL</th><th>Xem</th><th>Thao tác</th>
          </tr></thead>
          <tbody>
            ${users.map(u => `<tr>
              <td>${u.user_id}</td>
              <td><span class="badge badge-primary">${u.name}</span></td>
              <td>${u.fullname}</td>
              <td>${u.admin ? '<span class="badge badge-success">✓</span>' : ''}</td>
              <td>${u.edit_dm ? '<span class="badge badge-info">✓</span>' : ''}</td>
              <td>${u.edit_sl ? '<span class="badge badge-warning">✓</span>' : ''}</td>
              <td>${u.view ? '<span class="badge badge-neutral">✓</span>' : ''}</td>
              <td class="actions">
                <button class="btn btn-ghost btn-icon" onclick="SystemModule.editUser(${u.user_id})">✏️</button>
                ${u.name !== 'admin' ? `<button class="btn btn-ghost btn-icon" onclick="SystemModule.deleteUser(${u.user_id})">🗑️</button>` : ''}
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  showUserForm(user = null) {
    const isEdit = !!user;
    Modal.show({
      title: isEdit ? 'Sửa người dùng' : 'Thêm người dùng',
      content: `<form id="userForm">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tên đăng nhập <span class="required">*</span></label>
            <input class="form-control" id="u_name" value="${user ? user.name : ''}" ${isEdit ? 'readonly' : ''}>
          </div>
          <div class="form-group">
            <label class="form-label">Mật khẩu <span class="required">*</span></label>
            <input class="form-control" type="password" id="u_password" value="${user ? user.password : ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Họ tên đầy đủ</label>
          <input class="form-control" id="u_fullname" value="${user ? user.fullname : ''}">
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-check"><input type="checkbox" id="u_admin" ${user && user.admin ? 'checked' : ''}> Quản trị viên</label></div>
          <div class="form-group"><label class="form-check"><input type="checkbox" id="u_edit_dm" ${user && user.edit_dm ? 'checked' : ''}> Sửa danh mục</label></div>
          <div class="form-group"><label class="form-check"><input type="checkbox" id="u_edit_sl" ${user && user.edit_sl ? 'checked' : ''}> Sửa số liệu</label></div>
          <div class="form-group"><label class="form-check"><input type="checkbox" id="u_view" ${user && user.view ? 'checked' : ''} checked> Quyền xem</label></div>
        </div>
      </form>`,
      footer: `<button class="btn btn-secondary" onclick="Modal.close()">Hủy</button>
                <button class="btn btn-primary" onclick="SystemModule.saveUser(${user ? user.user_id : 'null'})">Lưu</button>`
    });
  },

  async editUser(id) {
    const user = await DB.get('users', id);
    if (user) this.showUserForm(user);
  },

  async saveUser(id) {
    const data = {
      name: document.getElementById('u_name').value.trim(),
      password: document.getElementById('u_password').value,
      fullname: document.getElementById('u_fullname').value.trim(),
      admin: document.getElementById('u_admin').checked ? 1 : 0,
      edit_dm: document.getElementById('u_edit_dm').checked ? 1 : 0,
      edit_sl: document.getElementById('u_edit_sl').checked ? 1 : 0,
      view: document.getElementById('u_view').checked ? 1 : 0,
    };
    if (!data.name || !data.password) { Toast.error('Nhập tên và mật khẩu!'); return; }
    if (id) data.user_id = id;
    await DB.put('users', data);
    Toast.success('Đã lưu!');
    Modal.close();
    App.navigate('users');
  },

  async deleteUser(id) {
    if (await Modal.confirm('Xóa người dùng này?')) {
      await DB.delete('users', id);
      Toast.success('Đã xóa!');
      App.navigate('users');
    }
  },

  async renderLogon() {
    const logons = await DB.getAll('logon');
    const recent = logons.slice(-100).reverse();
    return `
    <div class="page-title"><h2>📋 Nhật ký truy cập</h2></div>
    <div class="card">
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>Người dùng</th><th>Ngày</th><th>Giờ</th><th>Trạng thái</th></tr></thead>
          <tbody>
            ${recent.map(l => `<tr>
              <td>${l.user}</td><td>${l.date}</td><td>${l.time}</td>
              <td><span class="badge ${l.status === 'IN' ? 'badge-success' : 'badge-neutral'}">${l.status === 'IN' ? 'Đăng nhập' : 'Đăng xuất'}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  renderBackup() {
    return `
    <div class="page-title"><h2>💾 Sao lưu / Phục hồi dữ liệu</h2></div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>📥 Sao lưu dữ liệu</h3></div>
        <div class="card-body">
          <p class="text-secondary text-sm mb-4">Xuất toàn bộ dữ liệu ra file JSON để lưu trữ an toàn.</p>
          <button class="btn btn-primary" onclick="Export.backupAll()">💾 Sao lưu ngay</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>📤 Phục hồi dữ liệu</h3></div>
        <div class="card-body">
          <p class="text-secondary text-sm mb-4">Nhập dữ liệu từ file sao lưu JSON. <strong class="text-warning">Cảnh báo: Dữ liệu hiện tại sẽ bị ghi đè!</strong></p>
          <input type="file" id="restoreFile" accept=".json" class="form-control" onchange="SystemModule.handleRestore(this)">
        </div>
      </div>
    </div>`;
  },

  async handleRestore(input) {
    if (input.files.length === 0) return;
    if (await Modal.confirm('Phục hồi sẽ ghi đè toàn bộ dữ liệu hiện tại. Tiếp tục?', '⚠️ Cảnh báo')) {
      await Export.restoreAll(input.files[0]);
    }
  }
};
window.SystemModule = SystemModule;
