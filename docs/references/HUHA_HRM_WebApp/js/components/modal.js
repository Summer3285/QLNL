
const Modal = {
  show(options) {
    const { title, content, size, footer, onClose } = options;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    const sizeClass = size ? ` modal-${size}` : '';
    overlay.innerHTML = `<div class="modal${sizeClass}">
      <div class="modal-header">
        <h3>${title || ''}</h3>
        <button class="modal-close" data-close>&times;</button>
      </div>
      <div class="modal-body">${content || ''}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('[data-close]').onclick = () => { this.close(overlay); if (onClose) onClose(); };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { this.close(overlay); if (onClose) onClose(); } });
    return overlay;
  },
  close(overlay) {
    if (!overlay) overlay = document.querySelector('.modal-overlay.active');
    if (overlay) { overlay.classList.remove('active'); setTimeout(() => overlay.remove(), 300); }
  },
  confirm(message, title) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'confirm-overlay';
      overlay.innerHTML = `<div class="confirm-box animate-scaleIn">
        <h3>${title || 'Xác nhận'}</h3>
        <p>${message}</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" data-cancel>Hủy</button>
          <button class="btn btn-danger" data-confirm>Xác nhận</button>
        </div>
      </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector('[data-cancel]').onclick = () => { overlay.remove(); resolve(false); };
      overlay.querySelector('[data-confirm]').onclick = () => { overlay.remove(); resolve(true); };
    });
  }
};
window.Modal = Modal;
