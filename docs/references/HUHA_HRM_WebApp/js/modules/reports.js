
const ReportsModule = {
  async render(reportType) {
    const personnel = await DB.getAll('personnel');
    let title = '';
    let content = '';

    switch(reportType) {
      case 'ngoaingu':
        title = 'Thống kê trình độ ngoại ngữ CBCC';
        const dmnn = await DB.getAll('dm_nngu');
        const dmtdnn = await DB.getAll('dm_tdnngu');
        
        let nnTable = `<table class="data-table"><thead><tr><th>Ngoại ngữ</th><th>Trình độ</th><th>Số lượng</th></tr></thead><tbody>`;
        dmnn.forEach(nn => {
          dmtdnn.forEach(td => {
            const count = personnel.filter(p => p.ma_tanh === nn.ma_nn && p.ma_tdnn === td.ma_tdnn).length;
            if (count > 0) {
              nnTable += `<tr><td>${nn.ten_nn}</td><td>${td.ten_tdnn}</td><td><strong>${count}</strong></td></tr>`;
            }
          });
        });
        nnTable += `</tbody></table>`;
        content = `<div class="data-table-wrapper">${nnTable}</div>`;
        break;

      case 'nganhdt':
        title = 'Thống kê cán bộ theo ngành đào tạo';
        const dmnganh = await DB.getAll('dm_ngdtao');
        let dtTable = `<table class="data-table"><thead><tr><th>Mã Ngành</th><th>Tên Ngành</th><th>Số lượng</th></tr></thead><tbody>`;
        let totalDt = 0;
        dmnganh.forEach(ng => {
          const count = personnel.filter(p => p.ma_nganh === ng.ma_nganh).length;
          if (count > 0) {
            dtTable += `<tr><td>${ng.ma_nganh}</td><td>${ng.ten_nganh}</td><td><strong>${count}</strong></td></tr>`;
            totalDt += count;
          }
        });
        dtTable += `<tr style="background:var(--bg-table-header)">
          <td colspan="2" class="text-right font-bold">Tổng cộng:</td>
          <td class="font-bold">${totalDt}</td>
        </tr></tbody></table>`;
        content = `<div class="data-table-wrapper">${dtTable}</div>`;
        break;

      case 'ngachtuoi':
        title = 'Thống kê theo ngạch, độ tuổi và giới tính';
        // Simplified version
        const dmngcc = await DB.getAll('dm_ngcc');
        let ntTable = `<table class="data-table"><thead><tr>
          <th>Ngạch</th><th>Tổng</th>
          <th>Nam < 30</th><th>Nữ < 30</th>
          <th>Nam 31-40</th><th>Nữ 31-40</th>
          <th>Nam 41-50</th><th>Nữ 41-50</th>
          <th>Nam > 50</th><th>Nữ > 50</th>
        </tr></thead><tbody>`;
        
        dmngcc.forEach(ng => {
          const pb = personnel.filter(p => p.ma_ngach === ng.ma_ngach);
          if (pb.length === 0) return;
          
          let cols = { n30:0, nu30:0, n40:0, nu40:0, n50:0, nu50:0, n50p:0, nu50p:0 };
          pb.forEach(p => {
            const age = Utils.calculateAge(p.ngay_sinh);
            if (age === '') return;
            const isNam = p.gioi_tinh === 'Nam';
            if (age <= 30) isNam ? cols.n30++ : cols.nu30++;
            else if (age <= 40) isNam ? cols.n40++ : cols.nu40++;
            else if (age <= 50) isNam ? cols.n50++ : cols.nu50++;
            else isNam ? cols.n50p++ : cols.nu50p++;
          });
          
          ntTable += `<tr>
            <td>${ng.ten_ngach}</td><td><strong>${pb.length}</strong></td>
            <td>${cols.n30}</td><td>${cols.nu30}</td>
            <td>${cols.n40}</td><td>${cols.nu40}</td>
            <td>${cols.n50}</td><td>${cols.nu50}</td>
            <td>${cols.n50p}</td><td>${cols.nu50p}</td>
          </tr>`;
        });
        ntTable += `</tbody></table>`;
        content = `<div class="data-table-wrapper">${ntTable}</div>`;
        break;

      case 'chatluong':
        title = 'Báo cáo chất lượng công chức, viên chức';
        const total = personnel.length;
        const ts = personnel.filter(p => p.ma_tdcm === '02').length;
        const ths = personnel.filter(p => p.ma_tdcm === '03').length;
        const dh = personnel.filter(p => p.ma_tdcm === '04').length;
        
        content = `
        <div class="grid-2">
          <div class="card stat-card">
            <div class="stat-icon blue">🎓</div>
            <div class="stat-info"><h4>${ts}</h4><p>Tiến sĩ</p></div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon green">🎓</div>
            <div class="stat-info"><h4>${ths}</h4><p>Thạc sĩ</p></div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon cyan">🎓</div>
            <div class="stat-info"><h4>${dh}</h4><p>Đại học</p></div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon amber">👥</div>
            <div class="stat-info"><h4>${total}</h4><p>Tổng số</p></div>
          </div>
        </div>
        `;
        break;
    }

    return `
    <div class="report-container">
      <div class="card" id="reportContent">
        <div class="report-header">
          <h2>${title}</h2>
          <p>Ngày xuất báo cáo: ${Utils.now()}</p>
        </div>
        <div class="card-body p-6">
          ${content}
        </div>
      </div>
      <div class="mt-4 text-right">
        <button class="btn btn-primary" onclick="Export.printTable('${title}', document.getElementById('reportContent').innerHTML)">
          🖨️ In Báo cáo
        </button>
      </div>
    </div>
    `;
  }
};
window.ReportsModule = ReportsModule;
