
const DashboardModule = {
  async render() {
    const totalPersonnel = await DB.count('personnel');
    const totalDvi = await DB.count('dm_dvi');
    const totalTransfers = await DB.count('transfers');
    const logons = await DB.getAll('logon');
    const recentLogons = logons.slice(-10).reverse();

    // Get personnel by gender
    const personnel = await DB.getAll('personnel');
    const male = personnel.filter(p => p.gioi_tinh === 'Nam').length;
    const female = personnel.filter(p => p.gioi_tinh === 'Nữ').length;

    // Get personnel by education
    const eduStats = {};
    const tdcmList = await DB.getAll('dm_tdcm');
    for (const p of personnel) {
      const key = p.ma_tdcm || 'Chưa xác định';
      const tdcm = tdcmList.find(t => t.ma_tdcm === p.ma_tdcm);
      const name = tdcm ? tdcm.ten_tdcm : key;
      eduStats[name] = (eduStats[name] || 0) + 1;
    }

    return `
    <div class="page-title">
      <h2>📊 Bảng điều khiển</h2>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="Export.backupAll()">💾 Sao lưu</button>
      </div>
    </div>

    <div class="dashboard-stats animate-slideUp">
      <div class="card stat-card">
        <div class="stat-icon green">👥</div>
        <div class="stat-info">
          <h4>${totalPersonnel}</h4>
          <p>Tổng cán bộ</p>
        </div>
      </div>
      <div class="card stat-card stagger-1">
        <div class="stat-icon blue">🏢</div>
        <div class="stat-info">
          <h4>${totalDvi}</h4>
          <p>Đơn vị</p>
        </div>
      </div>
      <div class="card stat-card stagger-2">
        <div class="stat-icon cyan">👨</div>
        <div class="stat-info">
          <h4>${male}</h4>
          <p>Nam</p>
        </div>
      </div>
      <div class="card stat-card stagger-3">
        <div class="stat-icon amber">👩</div>
        <div class="stat-info">
          <h4>${female}</h4>
          <p>Nữ</p>
        </div>
      </div>
      <div class="card stat-card stagger-4">
        <div class="stat-icon red">🔄</div>
        <div class="stat-info">
          <h4>${totalTransfers}</h4>
          <p>Thuyên chuyển</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card animate-slideUp">
        <div class="card-header">
          <h3>📈 Thống kê trình độ chuyên môn</h3>
        </div>
        <div class="card-body">
          ${Object.keys(eduStats).length > 0 ? `
          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${Object.entries(eduStats).map(([name, count]) => {
              const pct = totalPersonnel > 0 ? Math.round(count / totalPersonnel * 100) : 0;
              return `<div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm">${name}</span>
                  <span class="text-sm text-muted">${count} (${pct}%)</span>
                </div>
                <div style="height:8px;background:var(--slate-800);border-radius:4px;overflow:hidden">
                  <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--primary-500),var(--accent-500));border-radius:4px;transition:width 1s ease"></div>
                </div>
              </div>`;
            }).join('')}
          </div>` : '<div class="empty-state"><p>Chưa có dữ liệu</p></div>'}
        </div>
      </div>

      <div class="card animate-slideUp stagger-2">
        <div class="card-header">
          <h3>📋 Hoạt động gần đây</h3>
        </div>
        <div class="card-body">
          ${recentLogons.length > 0 ? `
          <div style="display:flex;flex-direction:column;gap:var(--space-2)">
            ${recentLogons.map(l => `
              <div class="flex items-center gap-3" style="padding:var(--space-2) 0;border-bottom:1px solid var(--glass-border)">
                <span class="badge ${l.status === 'IN' ? 'badge-success' : 'badge-neutral'}">${l.status === 'IN' ? 'Đăng nhập' : 'Đăng xuất'}</span>
                <span class="text-sm flex-1">${l.user}</span>
                <span class="text-xs text-muted">${l.date} ${l.time}</span>
              </div>
            `).join('')}
          </div>` : '<div class="empty-state"><p>Chưa có hoạt động</p></div>'}
        </div>
      </div>
    </div>`;
  }
};
window.DashboardModule = DashboardModule;
