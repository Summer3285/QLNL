const PrintModule = {
  async getProfileHtml(ma_cc) {
    const p = await DB.get('personnel', ma_cc);
    if (!p) return '';

    const R = this.resolveCatalog.bind(this);
    const [dtoc, tgiao, xthan, tthn, tdhvpt, tdcm, tdllct, tdqlnn, tdth,
           cvcq, cvdang, cvdoan, cviec, ngach, ttsk, tbinh, htdtao,
           tdnn, ktkl_kt, ktkl_kl] = await Promise.all([
      R('dm_dtoc',   p.ma_dtoc,   ''),   R('dm_tgiao',  p.ma_tgiao,  'Không'),
      R('dm_xthan',  p.ma_xthan,  ''),   R('dm_tthn',   p.ma_tthn,   ''),
      R('dm_tdhvpt', p.ma_tdhvpt, ''),   R('dm_tdcm',   p.ma_tdcm,   ''),
      R('dm_tdllct', p.ma_tdllct, ''),   R('dm_tdqlnn', p.ma_tdqlnn, ''),
      R('dm_tdthoc', p.ma_tdth,   ''),   R('dm_cvcq',   p.ma_cvcq,   ''),
      R('dm_cvdang', p.ma_cvdang, ''),   R('dm_cvdoan', p.ma_cvdoan, ''),
      R('dm_cviec',  p.ma_cviec,  ''),   R('dm_ngcc',   p.ma_ngach,  ''),
      R('dm_ttsk',   p.ma_ttsk,   ''),   R('dm_tbinh',  p.ma_tbinh,  ''),
      R('dm_htdtao', p.ma_htdtao, ''),   R('dm_tdnngu', p.ma_tdnn,   ''),
      R('dm_ktkl',   p.ma_kt,     ''),   R('dm_ktkl',   p.ma_kl,     ''),
    ]);

    let qtCongTac = [], qtDaoTao = [], qtLuong = [], qtGiaDinh = [];
    try {
      qtCongTac = (await DB.getAll('qt_congtac')).filter(q => q.ma_cc === ma_cc);
      qtDaoTao = (await DB.getAll('qt_daotao')).filter(q => q.ma_cc === ma_cc);
      qtLuong = (await DB.getAll('qt_luong')).filter(q => q.ma_cc === ma_cc);
      qtGiaDinh = (await DB.getAll('qt_qhgd')).filter(q => q.ma_cc === ma_cc);
    } catch(e) {}

    const fd = (d) => d ? Utils.formatDate(d) : '';
    const v = (val) => val || '';

    return `
<div class="print-profile">
  <div class="print-header">
    <p style="font-size:12pt">BỘ NỘI VỤ</p>
    <h3>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
    <p style="font-weight:bold">Độc lập - Tự do - Hạnh phúc</p>
    <div style="width:120px;border-bottom:1px solid #000;margin:5px auto"></div>
    <h2 style="margin-top:15px">SƠ YẾU LÝ LỊCH CÁN BỘ, CÔNG CHỨC</h2>
  </div>

  <div style="display:flex;gap:20px;margin-top:20px">
    <div style="width:120px;min-width:120px;height:160px;border:1px solid #000;display:flex;align-items:center;justify-content:center;font-size:10pt">Ảnh<br>4x6</div>
    <div style="flex:1">
      <div class="pr"><span class="pl">1. Họ và tên khai sinh:</span><span class="pv"><b style="font-size:14pt;text-transform:uppercase">${v(p.ho_ten)}</b></span></div>
      <div class="pr"><span class="pl">1.1. Tên gọi khác:</span><span class="pv">${v(p.ten_khac)}</span></div>
      <div style="display:flex">
        <div style="flex:1" class="pr"><span class="pl">2. Sinh ngày:</span><span class="pv">${fd(p.ngay_sinh)}</span></div>
        <div style="flex:1" class="pr"><span class="pl">Giới tính:</span><span class="pv">${v(p.gioi_tinh)}</span></div>
      </div>
      <div class="pr"><span class="pl">3. Nơi sinh:</span><span class="pv">${v(p.noi_sinh)}</span></div>
      <div class="pr"><span class="pl">4. Quê quán:</span><span class="pv">${v(p.que_quan)}</span></div>
    </div>
  </div>

  <div style="margin-top:10px">
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">5. Dân tộc:</span><span class="pv">${dtoc}</span></div>
      <div style="flex:1" class="pr"><span class="pl">6. Tôn giáo:</span><span class="pv">${tgiao}</span></div>
    </div>
    <div class="pr"><span class="pl">7. Nơi đăng ký hộ khẩu thường trú:</span><span class="pv">${v(p.ho_khau)}</span></div>
    <div class="pr"><span class="pl">8. Nơi ở hiện nay:</span><span class="pv">${v(p.cho_o)}</span></div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">9. Nghề nghiệp khi được tuyển dụng:</span><span class="pv">${v(p.nguon_td)}</span></div>
    </div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">10. Ngày tuyển dụng:</span><span class="pv">${fd(p.ngay_td)}</span></div>
      <div style="flex:1" class="pr"><span class="pl">Cơ quan tuyển dụng:</span><span class="pv">${v(p.cq_tdung)}</span></div>
    </div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">11. Chức vụ (chức danh) hiện tại:</span><span class="pv">${cvcq}</span></div>
    </div>
    <div class="pr"><span class="pl">12. Công việc chính được giao:</span><span class="pv">${cviec}</span></div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">13. Ngạch công chức (viên chức):</span><span class="pv">${ngach}</span></div>
      <div style="width:80px" class="pr"><span class="pl">Mã ngạch:</span><span class="pv">${v(p.ma_ngach)}</span></div>
    </div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">Bậc lương:</span><span class="pv">${v(p.bac)}</span></div>
      <div style="flex:1" class="pr"><span class="pl">Hệ số:</span><span class="pv">${v(p.he_so)}</span></div>
      <div style="flex:1" class="pr"><span class="pl">Ngày hưởng:</span><span class="pv">${fd(p.huong_tu)}</span></div>
    </div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">Phụ cấp chức vụ:</span><span class="pv">${v(p.pc_cvu)}</span></div>
      <div style="flex:1" class="pr"><span class="pl">Phụ cấp khác:</span><span class="pv">${v(p.pc_khac)}</span></div>
    </div>
  </div>

  <div style="margin-top:10px">
    <p style="font-weight:bold;margin-bottom:5px">14. TRÌNH ĐỘ</p>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">- Giáo dục phổ thông:</span><span class="pv">${tdhvpt}</span></div>
      <div style="flex:1" class="pr"><span class="pl">- Chuyên môn cao nhất:</span><span class="pv">${tdcm}</span></div>
    </div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">- Lý luận chính trị:</span><span class="pv">${tdllct}</span></div>
      <div style="flex:1" class="pr"><span class="pl">- Quản lý nhà nước:</span><span class="pv">${tdqlnn}</span></div>
    </div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">- Ngoại ngữ:</span><span class="pv">${tdnn}</span></div>
      <div style="flex:1" class="pr"><span class="pl">- Tin học:</span><span class="pv">${tdth}</span></div>
    </div>
  </div>

  <div style="margin-top:10px">
    <p style="font-weight:bold;margin-bottom:5px">15. TÌNH TRẠNG SỨC KHỎE</p>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">- Loại sức khỏe:</span><span class="pv">${ttsk}</span></div>
      <div style="flex:1" class="pr"><span class="pl">- Chiều cao:</span><span class="pv">${v(p.cao)} cm</span></div>
      <div style="flex:1" class="pr"><span class="pl">- Cân nặng:</span><span class="pv">${v(p.nang)} kg</span></div>
      <div style="flex:1" class="pr"><span class="pl">- Nhóm máu:</span><span class="pv">${v(p.nhom_mau)}</span></div>
    </div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">- Hạng thương binh:</span><span class="pv">${tbinh}</span></div>
      <div style="flex:1" class="pr"><span class="pl">- Gia đình chính sách:</span><span class="pv">${v(p.ht_ttat)}</span></div>
    </div>
  </div>

  <div style="display:flex;margin-top:10px">
    <div style="flex:1" class="pr"><span class="pl">16. Số CMND/CCCD:</span><span class="pv">${v(p.so_cmnd)}</span></div>
    <div style="flex:1" class="pr"><span class="pl">Ngày cấp:</span><span class="pv">${fd(p.ngay_cap)}</span></div>
    <div style="flex:1" class="pr"><span class="pl">Nơi cấp:</span><span class="pv">${v(p.noi_cap)}</span></div>
  </div>
  <div style="display:flex">
    <div style="flex:1" class="pr"><span class="pl">17. Số sổ BHXH:</span><span class="pv">${v(p.so_bhxh)}</span></div>
  </div>

  <div style="margin-top:10px">
    <p style="font-weight:bold;margin-bottom:5px">18. ĐÀO TẠO, BỒI DƯỠNG VỀ CHUYÊN MÔN, NGHIỆP VỤ, LÝ LUẬN CHÍNH TRỊ, NGOẠI NGỮ, TIN HỌC</p>
    <table class="print-table">
      <thead><tr>
        <th>Tên trường</th><th>Chuyên ngành</th><th>Từ tháng năm</th><th>Đến tháng năm</th><th>Hình thức đào tạo</th><th>Văn bằng</th>
      </tr></thead>
      <tbody>
        ${qtDaoTao.length > 0 ? qtDaoTao.map(q => `<tr>
          <td>${v(q.ten_truong)}</td><td>${v(q.chuyen_nganh)}</td>
          <td>${fd(q.tu_ngay)}</td><td>${fd(q.den_ngay)}</td>
          <td>${v(q.hinh_thuc)}</td><td>${v(q.van_bang)}</td>
        </tr>`).join('') : '<tr><td colspan="6" style="text-align:center;height:30px"></td></tr>'}
      </tbody>
    </table>
  </div>

  <div style="margin-top:10px">
    <p style="font-weight:bold;margin-bottom:5px">19. TÓM TẮT QUÁ TRÌNH CÔNG TÁC</p>
    <table class="print-table">
      <thead><tr>
        <th style="width:120px">Từ tháng năm đến tháng năm</th><th>Chức danh, chức vụ, đơn vị công tác</th>
      </tr></thead>
      <tbody>
        ${qtCongTac.length > 0 ? qtCongTac.map(q => `<tr>
          <td>${fd(q.tu_ngay)} - ${fd(q.den_ngay)}</td><td>${v(q.noi_dung) || v(q.chuc_vu)}</td>
        </tr>`).join('') : '<tr><td colspan="2" style="height:30px"></td></tr>'}
      </tbody>
    </table>
  </div>

  <div style="margin-top:10px">
    <p style="font-weight:bold;margin-bottom:5px">20. ĐẶC ĐIỂM LỊCH SỬ BẢN THÂN</p>
    <div class="pr"><span class="pl">- Thành phần gia đình xuất thân:</span><span class="pv">${xthan}</span></div>
    <div class="pr"><span class="pl">- Tình trạng hôn nhân:</span><span class="pv">${tthn}</span></div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">- Ngày vào Đoàn:</span><span class="pv">${fd(p.ngay_doan)}</span></div>
      <div style="flex:1" class="pr"><span class="pl">- Chức vụ Đoàn:</span><span class="pv">${cvdoan}</span></div>
    </div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">- Ngày vào Đảng:</span><span class="pv">${fd(p.ngay_dang)}</span></div>
      <div style="flex:1" class="pr"><span class="pl">- Ngày chính thức:</span><span class="pv">${fd(p.ngay_cthuc)}</span></div>
    </div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">- Chức vụ Đảng hiện tại:</span><span class="pv">${cvdang}</span></div>
      <div style="flex:1" class="pr"><span class="pl">- Nơi kết nạp:</span><span class="pv">${v(p.noi_knap)}</span></div>
    </div>
  </div>

  <div style="margin-top:10px">
    <p style="font-weight:bold;margin-bottom:5px">21. QUAN HỆ GIA ĐÌNH</p>
    <table class="print-table">
      <thead><tr>
        <th>Mối quan hệ</th><th>Họ và tên</th><th>Năm sinh</th><th>Nghề nghiệp, nơi công tác</th>
      </tr></thead>
      <tbody>
        ${qtGiaDinh.length > 0 ? qtGiaDinh.map(q => `<tr>
          <td>${v(q.quan_he)}</td><td>${v(q.ho_ten)}</td>
          <td>${v(q.nam_sinh)}</td><td>${v(q.nghe_nghiep) || v(q.noi_o)}</td>
        </tr>`).join('') : '<tr><td colspan="4" style="height:30px"></td></tr>'}
      </tbody>
    </table>
  </div>

  <div style="margin-top:10px">
    <p style="font-weight:bold;margin-bottom:5px">22. DIỄN BIẾN QUÁ TRÌNH LƯƠNG</p>
    <table class="print-table">
      <thead><tr>
        <th>Tháng năm</th><th>Mã ngạch</th><th>Bậc</th><th>Hệ số</th><th>Phụ cấp</th>
      </tr></thead>
      <tbody>
        ${qtLuong.length > 0 ? qtLuong.map(q => `<tr>
          <td>${fd(q.tu_ngay)}</td><td>${v(q.ma_ngach)}</td>
          <td>${v(q.bac)}</td><td>${v(q.he_so)}</td><td>${v(q.phu_cap)}</td>
        </tr>`).join('') : '<tr><td colspan="5" style="height:30px"></td></tr>'}
      </tbody>
    </table>
  </div>

  <div style="margin-top:10px">
    <p style="font-weight:bold;margin-bottom:5px">23. KHEN THƯỞNG, KỶ LUẬT</p>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">- Hình thức khen thưởng cao nhất:</span><span class="pv">${ktkl_kt}</span></div>
    </div>
    <div style="display:flex">
      <div style="flex:1" class="pr"><span class="pl">- Hình thức kỷ luật:</span><span class="pv">${ktkl_kl}</span></div>
    </div>
  </div>

  <div style="display:flex;margin-top:10px">
    <div style="flex:1" class="pr"><span class="pl">24. Sở trường công tác:</span><span class="pv">${v(p.so_truong)}</span></div>
  </div>
  <div class="pr"><span class="pl">25. Công việc làm lâu nhất:</span><span class="pv">${v(p.viec_lnhat)}</span></div>

  <!-- SIGNATURE -->
  <table style="width:100%;text-align:center;border:none;margin-top:40px">
    <tr>
      <td style="border:none;width:50%">
        <br><br><br><br>
        <b>NGƯỜI KHAI</b><br>
        <i>(Ký, ghi rõ họ tên)</i>
      </td>
      <td style="border:none;width:50%">
        <i>........, ngày .... tháng .... năm 20....</i><br>
        <b>THỦ TRƯỞNG CƠ QUAN</b><br>
        <i>(Ký tên, đóng dấu)</i>
        <br><br><br><br>
      </td>
    </tr>
  </table>
</div>
    `;
  },

  openPrintWindow(html, title) {
    const win = window.open('', '_blank');
    if (!win) {
      alert('Vui lòng cho phép popup để mở cửa sổ in.');
      return;
    }
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 15mm 20mm; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.6; color: #000; background: #fff; padding: 20px; margin: 0; }
          .print-header { text-align: center; margin-bottom: 10px; }
          .print-header h3 { margin: 0; font-size: 13pt; font-weight: bold; }
          .print-header h2 { margin: 8px 0; font-size: 16pt; font-weight: bold; }
          .pr { display: flex; margin-bottom: 4px; }
          .pl { font-weight: normal; white-space: nowrap; margin-right: 4px; }
          .pv { flex-grow: 1; border-bottom: 1px dotted #000; min-height: 18px; padding-left: 4px; }
          .print-table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11pt; color: #000; }
          .print-table th, .print-table td { border: 1px solid #000; padding: 4px 6px; }
          .print-table th { background: #f0f0f0; font-weight: bold; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        ${html}
        <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
      </body>
      </html>
    `);
    win.document.close();
  },

  async printProfile(ma_cc) {
    try {
      const html = await this.getProfileHtml(ma_cc);
      if (!html) { alert('Không tìm thấy cán bộ'); return; }
      this.openPrintWindow(html, 'Sơ yếu lý lịch');
    } catch (e) {
      console.error(e);
      alert('Lỗi in hồ sơ: ' + e.message);
    }
  },

  async printBatch(ma_cc_list) {
    if (!ma_cc_list || ma_cc_list.length === 0) {
      alert('Vui lòng chọn ít nhất 1 cán bộ để in');
      return;
    }
    try {
      if (window.Toast) Toast.show(`Đang chuẩn bị ${ma_cc_list.length} hồ sơ...`);
      let fullHtml = '';
      for (const macc of ma_cc_list) {
        const html = await this.getProfileHtml(macc);
        fullHtml += `<div style="page-break-after: always;">${html}</div>`;
      }
      this.openPrintWindow(fullHtml, 'In hàng loạt Sơ yếu lý lịch');
      if (window.Toast) Toast.success(`Sẵn sàng in ${ma_cc_list.length} hồ sơ!`);
    } catch (e) {
      console.error(e);
      alert('Lỗi in hàng loạt: ' + e.message);
    }
  },

  async resolveCatalog(storeName, id, defaultVal) {
    if (!id || String(id).trim() === '') return defaultVal;
    try {
      const db = await DB.getDB();
      if (!db.objectStoreNames.contains(storeName)) return defaultVal;
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      return new Promise((resolve) => {
        const req = store.openCursor();
        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            const val = cursor.value;
            const maKey = Object.keys(val).find(k => k.startsWith('ma_'));
            if (maKey && String(val[maKey]).trim() === String(id).trim()) {
              const tenKey = Object.keys(val).find(k => k.startsWith('ten_'));
              resolve(tenKey ? val[tenKey] : id);
              return;
            }
            cursor.continue();
          } else {
            resolve(defaultVal);
          }
        };
        req.onerror = () => resolve(defaultVal);
      });
    } catch (e) {
      return defaultVal;
    }
  }
};
