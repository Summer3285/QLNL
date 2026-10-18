
// ============================================================
// HUHA HRM - Utilities
// ============================================================
const Utils = {
  formatDate(dateStr) {
    if (!dateStr) return '';
    if (typeof dateStr === 'string' && dateStr.length === 8 && /^\d+$/.test(dateStr)) {
      return `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  },

  formatDateInput(dateStr) {
    if (!dateStr) return '';
    if (typeof dateStr === 'string' && dateStr.length === 8 && /^\d+$/.test(dateStr)) {
      return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  },

  today() {
    return new Date().toISOString().split('T')[0];
  },

  now() {
    return new Date().toLocaleString('vi-VN');
  },

  calculateAge(birthDate) {
    if (!birthDate) return '';
    let birth = new Date(birthDate);
    if (isNaN(birth.getTime()) && typeof birthDate === 'string' && birthDate.length === 8 && /^\d+$/.test(birthDate)) {
      birth = new Date(`${birthDate.substring(0,4)}-${birthDate.substring(4,6)}-${birthDate.substring(6,8)}`);
    }
    if (isNaN(birth.getTime())) return '';
    
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  },

  slugify(text) {
    return text.toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  },

  searchMatch(text, query) {
    if (!query) return true;
    const normalized = (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    return normalized.includes(normalizedQuery);
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },

  downloadCSV(rows, headers, filename) {
    const headerLine = headers.map(h => `"${h.label || h}"`).join(',');
    const keys = headers.map(h => h.key || h);
    const lines = rows.map(r => keys.map(k => `"${(r[k] || '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = '\uFEFF' + headerLine + '\n' + lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },

  readFileAsJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try { resolve(JSON.parse(reader.result)); }
        catch(e) { reject(e); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  getGenderText(code) {
    const map = { 'Nam': 'Nam', 'Nữ': 'Nữ', 'nam': 'Nam', 'nu': 'Nữ', 'N': 'Nam', 'F': 'Nữ' };
    return map[code] || code || '';
  },
};

window.Utils = Utils;
