
const CatalogModule = {
  currentCatalog: null,

  async render() {
    // Show catalog grid
    const counts = {};
    for (const key of Object.keys(CATALOG_DEFS)) {
      counts[key] = await DB.count(key);
    }

    const colors = ['green','blue','cyan','amber','red'];
    let idx = 0;

    return `
    <div class="page-title">
      <h2>📁 Quản lý danh mục</h2>
    </div>
    <div class="catalog-grid animate-slideUp">
      ${Object.entries(CATALOG_DEFS).map(([key, def]) => {
        const color = colors[idx++ % colors.length];
        return `<div class="card catalog-card" onclick="CatalogModule.openCatalog('${key}')">
          <div class="catalog-icon stat-icon ${color}">📋</div>
          <h4>${def.name}</h4>
          <p>${counts[key] || 0} mục</p>
        </div>`;
      }).join('')}
    </div>`;
  },

  async openCatalog(key) {
    this.currentCatalog = key;
    const def = CATALOG_DEFS[key];
    if (!def) return;

    const items = await DB.getAll(key);
    const codeField = def.fields[0];
    const nameField = def.fields[1];

    const content = `
      <div class="table-toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input class="form-control" placeholder="Tìm kiếm..." id="catalogSearch"
            oninput="CatalogModule.filterTable(this.value)" style="padding-left:36px">
        </div>
        <button class="btn btn-primary" onclick="CatalogModule.showAddForm('${key}')">
          + Thêm mới
        </button>
      </div>
      <div class="data-table-wrapper">
        <table class="data-table" id="catalogTable">
          <thead><tr>
            <th style="width:60px">STT</th>
            <th style="width:120px">Mã</th>
            <th>Tên</th>
            ${def.fields.length > 2 ? `<th>${def.fields[2]}</th>` : ''}
            <th style="width:120px">Thao tác</th>
          </tr></thead>
          <tbody>
            ${items.map((item, i) => `<tr data-key="${item[codeField]}">
              <td>${i + 1}</td>
              <td><span class="badge badge-primary">${Utils.escapeHtml(item[codeField])}</span></td>
              <td>${Utils.escapeHtml(item[nameField])}</td>
              ${def.fields.length > 2 ? `<td>${Utils.escapeHtml(item[def.fields[2]] || '')}</td>` : ''}
              <td class="actions">
                <button class="btn btn-ghost btn-icon" title="Sửa" onclick="CatalogModule.showEditForm('${key}','${item[codeField]}')">✏️</button>
                <button class="btn btn-ghost btn-icon" title="Xóa" onclick="CatalogModule.deleteItem('${key}','${item[codeField]}')">🗑️</button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span>Tổng: ${items.length} mục</span>
        <button class="btn btn-secondary btn-sm" onclick="CatalogModule.exportCatalog('${key}')">📥 Xuất CSV</button>
      </div>`;

    const overlay = Modal.show({
      title: def.name,
      content: content,
      size: 'lg'
    });
  },

  filterTable(query) {
    const rows = document.querySelectorAll('#catalogTable tbody tr');
    rows.forEach(row => {
      const text = row.textContent;
      row.style.display = Utils.searchMatch(text, query) ? '' : 'none';
    });
  },

  showAddForm(key) {
    const def = CATALOG_DEFS[key];
    Modal.close();
    setTimeout(() => {
      const fields = def.fields.map(f => `
        <div class="form-group">
          <label class="form-label">${f}</label>
          <input class="form-control" id="field_${f}" placeholder="${f}">
        </div>`).join('');

      const overlay = Modal.show({
        title: `Thêm - ${def.name}`,
        content: `<form id="catalogForm">${fields}</form>`,
        footer: `<button class="btn btn-secondary" onclick="Modal.close()">Hủy</button>
                  <button class="btn btn-primary" onclick="CatalogModule.saveItem('${key}')">Lưu</button>`
      });
    }, 350);
  },

  async showEditForm(key, code) {
    const def = CATALOG_DEFS[key];
    const item = await DB.get(key, code);
    if (!item) return;
    Modal.close();
    setTimeout(() => {
      const fields = def.fields.map((f, i) => `
        <div class="form-group">
          <label class="form-label">${f}</label>
          <input class="form-control" id="field_${f}" value="${Utils.escapeHtml(item[f] || '')}" ${i === 0 ? 'readonly' : ''}>
        </div>`).join('');

      Modal.show({
        title: `Sửa - ${def.name}`,
        content: `<form id="catalogForm">${fields}</form>`,
        footer: `<button class="btn btn-secondary" onclick="Modal.close()">Hủy</button>
                  <button class="btn btn-primary" onclick="CatalogModule.saveItem('${key}', true)">Cập nhật</button>`
      });
    }, 350);
  },

  async saveItem(key, isEdit = false) {
    const def = CATALOG_DEFS[key];
    const data = {};
    for (const f of def.fields) {
      data[f] = document.getElementById(`field_${f}`).value.trim();
    }
    if (!data[def.fields[0]] || !data[def.fields[1]]) {
      Toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    try {
      await DB.put(key, data);
      Toast.success(isEdit ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      Modal.close();
      setTimeout(() => this.openCatalog(key), 350);
    } catch(e) {
      Toast.error('Lỗi: ' + e.message);
    }
  },

  async deleteItem(key, code) {
    const confirmed = await Modal.confirm('Bạn có chắc muốn xóa mục này?', 'Xác nhận xóa');
    if (!confirmed) return;
    await DB.delete(key, code);
    Toast.success('Đã xóa!');
    Modal.close();
    setTimeout(() => this.openCatalog(key), 350);
  },

  async exportCatalog(key) {
    const def = CATALOG_DEFS[key];
    const items = await DB.getAll(key);
    const headers = def.fields.map(f => ({ key: f, label: f }));
    Utils.downloadCSV(items, headers, `${key}.csv`);
    Toast.success('Đã xuất file CSV!');
  }
};
window.CatalogModule = CatalogModule;
