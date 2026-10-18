
// ============================================================
// HUHA HRM - IndexedDB Database Layer
// ============================================================
const DB_NAME = 'HUHA_HRM';
const DB_VERSION = 1;

// Catalog definitions: key = store name, value = {keyPath, displayName, fields}
const CATALOG_DEFS = {
  dm_dvi:     { keyPath:'ma_dvi',     name:'Đơn vị quản lý',              fields:['ma_dvi','ten_dvi'] },
  dm_dtoc:    { keyPath:'ma_dtoc',    name:'Dân tộc',                     fields:['ma_dtoc','ten_dtoc'] },
  dm_tgiao:   { keyPath:'ma_tgiao',   name:'Tôn giáo',                    fields:['ma_tgiao','ten_tgiao'] },
  dm_xthan:   { keyPath:'ma_xthan',   name:'Thành phần xuất thân',        fields:['ma_xthan','ten_xthan'] },
  dm_tthn:    { keyPath:'ma_tthn',    name:'Tình trạng hôn nhân',         fields:['ma_tthn','ten_tthn'] },
  dm_tdhvpt:  { keyPath:'ma_tdhvpt',  name:'Trình độ học vấn phổ thông',  fields:['ma_tdhvpt','ten_tdhvpt'] },
  dm_tdcm:    { keyPath:'ma_tdcm',    name:'Trình độ chuyên môn',         fields:['ma_tdcm','ten_tdcm'] },
  dm_tdllct:  { keyPath:'ma_tdllct',  name:'Trình độ lý luận chính trị',  fields:['ma_tdllct','ten_tdllct'] },
  dm_tdqlnn:  { keyPath:'ma_tdqlnn',  name:'Trình độ quản lý nhà nước',   fields:['ma_tdqlnn','ten_tdqlnn'] },
  dm_tdqlkt:  { keyPath:'ma_tdqlkt',  name:'Trình độ quản lý kinh tế',    fields:['ma_tdqlkt','ten_tdqlkt'] },
  dm_tdthoc:  { keyPath:'ma_tdth',    name:'Trình độ tin học',             fields:['ma_tdth','ten_tdth'] },
  dm_nngu:    { keyPath:'ma_nn',      name:'Ngoại ngữ',                   fields:['ma_nn','ten_nn'] },
  dm_tdnngu:  { keyPath:'ma_tdnn',    name:'Trình độ ngoại ngữ',          fields:['ma_tdnn','ten_tdnn'] },
  dm_cviec:   { keyPath:'ma_cviec',   name:'Công việc',                   fields:['ma_cviec','ten_cviec'] },
  dm_cvcq:    { keyPath:'ma_cvcq',    name:'Chức vụ chính quyền',         fields:['ma_cvcq','ten_cvcq'] },
  dm_cvdang:  { keyPath:'ma_cvdang',  name:'Chức vụ Đảng',               fields:['ma_cvdang','ten_cvdang'] },
  dm_cvdoan:  { keyPath:'ma_cvdoan',  name:'Chức vụ Đoàn',               fields:['ma_cvdoan','ten_cvdoan'] },
  dm_ngcc:    { keyPath:'ma_ngach',   name:'Ngạch công chức',             fields:['ma_ngach','ten_ngach'] },
  dm_ngdtao:  { keyPath:'ma_nganh',   name:'Ngành đào tạo',               fields:['ma_nganh','ten_nganh'] },
  dm_trdtao:  { keyPath:'ma_truong',  name:'Trường đào tạo',              fields:['ma_truong','ten_truong','nganh_dt'] },
  dm_htdtao:  { keyPath:'ma_htdtao',  name:'Hình thức đào tạo',           fields:['ma_htdtao','ten_htdtao'] },
  dm_qham:    { keyPath:'ma_qham',    name:'Quân hàm',                    fields:['ma_qham','ten_qham'] },
  dm_cvvt:    { keyPath:'ma_cvvt',    name:'Chức vụ lực lượng vũ trang',  fields:['ma_cvvt','ten_cvvt'] },
  dm_dhieu:   { keyPath:'ma_dhieu',   name:'Danh hiệu được phong',        fields:['ma_dhieu','ten_dhieu'] },
  dm_ktkl:    { keyPath:'ma_ktkl',    name:'Hình thức khen thưởng, kỷ luật', fields:['ma_ktkl','ten_ktkl'] },
  dm_ttsk:    { keyPath:'ma_ttsk',    name:'Tình trạng sức khỏe',         fields:['ma_ttsk','ten_ttsk'] },
  dm_tbinh:   { keyPath:'ma_tbinh',   name:'Hạng thương binh',            fields:['ma_tbinh','ten_tbinh'] },
  dm_nuoc:    { keyPath:'ma_nuoc',    name:'Các nước trên thế giới',      fields:['ma_nuoc','ten_nuoc'] },
  dm_lvct:    { keyPath:'ma_lvct',    name:'Lĩnh vực công tác',           fields:['ma_lvct','ten_lvct'] },
  dm_ngng:    { keyPath:'ma_ngng',    name:'Ngành nghề trước tuyển dụng', fields:['ma_ngng','ten_ngng'] },
  dm_utgd:    { keyPath:'ma_utgd',    name:'Chính sách ưu tiên',          fields:['ma_utgd','ten_utgd'] },
};

// Process (quá trình) stores
const PROCESS_STORES = {
  qt_congtac:  { keyPath:'id', autoIncrement:true, name:'Quá trình công tác' },
  qt_daotao:   { keyPath:'id', autoIncrement:true, name:'Quá trình đào tạo' },
  qt_luong:    { keyPath:'id', autoIncrement:true, name:'Quá trình lương' },
  qt_ktkl:     { keyPath:'id', autoIncrement:true, name:'Khen thưởng, kỷ luật' },
  qt_qhgd:     { keyPath:'id', autoIncrement:true, name:'Quan hệ gia đình' },
  qt_danhgia:  { keyPath:'id', autoIncrement:true, name:'Đánh giá công chức' },
  qt_bonhiem:  { keyPath:'id', autoIncrement:true, name:'Quá trình bổ nhiệm' },
};

let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      // Users
      if (!d.objectStoreNames.contains('users')) {
        const us = d.createObjectStore('users', { keyPath: 'user_id', autoIncrement: true });
        us.createIndex('name', 'name', { unique: true });
      }
      // Logon
      if (!d.objectStoreNames.contains('logon')) {
        d.createObjectStore('logon', { keyPath: 'id', autoIncrement: true });
      }
      // Config
      if (!d.objectStoreNames.contains('config')) {
        d.createObjectStore('config', { keyPath: 'key' });
      }
      // Personnel (Sơ yếu lý lịch)
      if (!d.objectStoreNames.contains('personnel')) {
        const ps = d.createObjectStore('personnel', { keyPath: 'ma_cc' });
        ps.createIndex('ma_dvi', 'ma_dvi', { unique: false });
        ps.createIndex('ho_ten', 'ho_ten', { unique: false });
      }
      // Transfers
      if (!d.objectStoreNames.contains('transfers')) {
        const ts = d.createObjectStore('transfers', { keyPath: 'id', autoIncrement: true });
        ts.createIndex('ma_cc', 'ma_cc', { unique: false });
      }
      // Catalogs
      for (const [store, def] of Object.entries(CATALOG_DEFS)) {
        if (!d.objectStoreNames.contains(store)) {
          d.createObjectStore(store, { keyPath: def.keyPath });
        }
      }
      // Process stores
      for (const [store, def] of Object.entries(PROCESS_STORES)) {
        if (!d.objectStoreNames.contains(store)) {
          const os = d.createObjectStore(store, { keyPath: def.keyPath, autoIncrement: def.autoIncrement });
          os.createIndex('ma_cc', 'ma_cc', { unique: false });
        }
      }
    };
    req.onsuccess = () => { db = req.result; resolve(db); };
  });
}

const DB = {
  async getAll(storeName) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(storeName, 'readonly');
      const s = tx.objectStore(storeName);
      const req = s.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async get(storeName, key) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async put(storeName, data) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).put(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async add(storeName, data) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).add(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async delete(storeName, key) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async clear(storeName) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async count(storeName) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async getByIndex(storeName, indexName, value) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(storeName, 'readonly');
      const idx = tx.objectStore(storeName).index(indexName);
      const req = idx.getAll(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async search(storeName, predicate) {
    const all = await this.getAll(storeName);
    return all.filter(predicate);
  },

  async exportAll() {
    const d = await openDB();
    const result = {};
    const storeNames = Array.from(d.objectStoreNames);
    for (const name of storeNames) {
      result[name] = await this.getAll(name);
    }
    return result;
  },

  async importAll(data) {
    const d = await openDB();
    for (const [storeName, records] of Object.entries(data)) {
      if (d.objectStoreNames.contains(storeName)) {
        await this.clear(storeName);
        for (const record of records) {
          await this.put(storeName, record);
        }
      }
    }
  },

  async seedDefaults() {
    // Only seed if users table is empty
    const users = await this.getAll('users');
    if (users.length > 0) return;

    // Default admin user
    await this.put('users', {
      user_id: 1, name: 'admin', password: 'admin',
      fullname: 'Quản trị viên', admin: 1, edit_dm: 1, edit_sl: 1, view: 1
    });

    // Seed some default catalogs
    const defaultData = {
      dm_dtoc: [
        {ma_dtoc:'01',ten_dtoc:'Kinh'},{ma_dtoc:'02',ten_dtoc:'Tày'},{ma_dtoc:'03',ten_dtoc:'Thái'},
        {ma_dtoc:'04',ten_dtoc:'Mường'},{ma_dtoc:'05',ten_dtoc:'Hoa'},{ma_dtoc:'06',ten_dtoc:'Khmer'},
        {ma_dtoc:'07',ten_dtoc:'Nùng'},{ma_dtoc:'08',ten_dtoc:'H\'Mông'},{ma_dtoc:'09',ten_dtoc:'Dao'},
        {ma_dtoc:'10',ten_dtoc:'Gia Rai'},
      ],
      dm_tgiao: [
        {ma_tgiao:'00',ten_tgiao:'Không'},{ma_tgiao:'01',ten_tgiao:'Phật giáo'},
        {ma_tgiao:'02',ten_tgiao:'Công giáo'},{ma_tgiao:'03',ten_tgiao:'Tin lành'},
        {ma_tgiao:'04',ten_tgiao:'Hồi giáo'},{ma_tgiao:'05',ten_tgiao:'Cao đài'},
        {ma_tgiao:'06',ten_tgiao:'Hòa hảo'},
      ],
      dm_tthn: [
        {ma_tthn:'01',ten_tthn:'Chưa kết hôn'},{ma_tthn:'02',ten_tthn:'Đã kết hôn'},
        {ma_tthn:'03',ten_tthn:'Ly hôn'},{ma_tthn:'04',ten_tthn:'Góa'},
      ],
      dm_tdhvpt: [
        {ma_tdhvpt:'01',ten_tdhvpt:'12/12'},{ma_tdhvpt:'02',ten_tdhvpt:'10/10'},
        {ma_tdhvpt:'03',ten_tdhvpt:'9/12'},{ma_tdhvpt:'04',ten_tdhvpt:'Khác'},
      ],
      dm_tdcm: [
        {ma_tdcm:'01',ten_tdcm:'Tiến sĩ khoa học'},{ma_tdcm:'02',ten_tdcm:'Tiến sĩ'},
        {ma_tdcm:'03',ten_tdcm:'Thạc sĩ'},{ma_tdcm:'04',ten_tdcm:'Đại học'},
        {ma_tdcm:'05',ten_tdcm:'Cao đẳng'},{ma_tdcm:'06',ten_tdcm:'Trung cấp'},
        {ma_tdcm:'07',ten_tdcm:'Sơ cấp'},{ma_tdcm:'08',ten_tdcm:'Chưa qua đào tạo'},
      ],
      dm_tdllct: [
        {ma_tdllct:'01',ten_tdllct:'Cử nhân'},{ma_tdllct:'02',ten_tdllct:'Cao cấp'},
        {ma_tdllct:'03',ten_tdllct:'Trung cấp'},{ma_tdllct:'04',ten_tdllct:'Sơ cấp'},
      ],
      dm_tdqlnn: [
        {ma_tdqlnn:'01',ten_tdqlnn:'Chuyên viên cao cấp'},{ma_tdqlnn:'02',ten_tdqlnn:'Chuyên viên chính'},
        {ma_tdqlnn:'03',ten_tdqlnn:'Chuyên viên'},{ma_tdqlnn:'04',ten_tdqlnn:'Cán sự'},
      ],
      dm_nngu: [
        {ma_nn:'01',ten_nn:'Anh'},{ma_nn:'02',ten_nn:'Pháp'},{ma_nn:'03',ten_nn:'Nga'},
        {ma_nn:'04',ten_nn:'Trung'},{ma_nn:'05',ten_nn:'Nhật'},{ma_nn:'06',ten_nn:'Hàn'},
        {ma_nn:'07',ten_nn:'Đức'},
      ],
      dm_tdnngu: [
        {ma_tdnn:'A',ten_tdnn:'Trình độ A'},{ma_tdnn:'B',ten_tdnn:'Trình độ B'},
        {ma_tdnn:'C',ten_tdnn:'Trình độ C'},{ma_tdnn:'D',ten_tdnn:'Cử nhân'},
      ],
      dm_ktkl: [
        {ma_ktkl:'01',ten_ktkl:'Bằng khen Thủ tướng'},{ma_ktkl:'02',ten_ktkl:'Bằng khen Bộ/Tỉnh'},
        {ma_ktkl:'03',ten_ktkl:'Giấy khen'},{ma_ktkl:'04',ten_ktkl:'Chiến sĩ thi đua'},
        {ma_ktkl:'05',ten_ktkl:'Khiển trách'},{ma_ktkl:'06',ten_ktkl:'Cảnh cáo'},
        {ma_ktkl:'07',ten_ktkl:'Hạ bậc lương'},{ma_ktkl:'08',ten_ktkl:'Buộc thôi việc'},
      ],
      dm_ttsk: [
        {ma_ttsk:'01',ten_ttsk:'Tốt'},{ma_ttsk:'02',ten_ttsk:'Khá'},
        {ma_ttsk:'03',ten_ttsk:'Trung bình'},{ma_ttsk:'04',ten_ttsk:'Yếu'},
      ],
    };

    for (const [store, records] of Object.entries(defaultData)) {
      for (const rec of records) {
        try { await this.add(store, rec); } catch(e) { /* skip duplicates */ }
      }
    }
    console.log('Default data seeded');
  },





  async loadInitialData() {
    try {
      const personnel = await this.getAll('personnel');
      if (personnel.length > 0) return { success: false, message: 'Dữ liệu đã tồn tại' };

      const data = window.INITIAL_DATA;
      if (!data) return { success: false, message: 'Không tìm thấy dữ liệu mẫu (INITIAL_DATA)' };

      await this.importAll(data);
      console.log('Legacy data imported successfully from INITIAL_DATA');
      return { success: true, message: 'Đã nhập dữ liệu danh mục thành công!' };
    } catch (error) {
      console.error('Lỗi nhập dữ liệu:', error);
      return { success: false, message: error.message };
    }
  }

};

window.DB = DB;
window.CATALOG_DEFS = CATALOG_DEFS;
window.PROCESS_STORES = PROCESS_STORES;
