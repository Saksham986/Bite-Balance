/* ============================================
   BiteBalance Notification System (Toast)
   ============================================ */

export class Toast {
  static container = null;

  static init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  static show(message, type = 'info', duration = 3000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '❌';

    toast.innerHTML = `
      <span>${icon}</span>
      <div>${message}</div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

  static success(message, duration) {
    this.show(message, 'success', duration);
  }

  static warning(message, duration) {
    this.show(message, 'warning', duration);
  }

  static danger(message, duration) {
    this.show(message, 'danger', duration);
  }

  static info(message, duration) {
    this.show(message, 'info', duration);
  }
}
