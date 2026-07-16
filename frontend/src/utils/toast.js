// Lightweight toast implementation to avoid external dependency during debugging
const containerId = 'simple-toast-container';

function ensureContainer() {
  let c = document.getElementById(containerId);
  if (!c) {
    c = document.createElement('div');
    c.id = containerId;
    Object.assign(c.style, {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none'
    });
    document.body.appendChild(c);
  }
  return c;
}

function show(msg, type = 'info', timeout = 3000) {
  try {
    const c = ensureContainer();
    const el = document.createElement('div');
    el.textContent = msg;
    Object.assign(el.style, {
      background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      boxShadow: '0 6px 18px rgba(2,6,23,0.2)',
      pointerEvents: 'auto',
      maxWidth: '320px',
      fontSize: '14px'
    });
    c.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 300ms ease, transform 300ms ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-8px)';
    }, timeout - 300);
    setTimeout(() => {
      try { c.removeChild(el); } catch (e) {}
    }, timeout);
  } catch (err) {
    console.error('Simple toast error:', err);
    try { alert(msg); } catch (e) {}
  }
}

export const success = (m) => show(m, 'success');
export const error = (m) => show(m, 'error');
export const info = (m) => show(m, 'info');
export default { success, error, info };
