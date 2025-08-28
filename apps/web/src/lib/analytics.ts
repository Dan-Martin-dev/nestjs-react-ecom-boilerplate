// Minimal analytics helper — emits a window event and logs when analytics enabled
export function trackEvent(name: string, payload: Record<string, unknown> = {}) {
  try {
    const enabled = typeof import.meta !== 'undefined' && (import.meta.env?.VITE_ENABLE_ANALYTICS === 'true');
    const detail = { name, payload, ts: Date.now() };
    // Emit a window event so host apps/tests can listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:analytics', { detail }));
    }
    if (enabled) {
      // In production you'd call GA/Amplitude etc. For now just console.log
      console.log('[analytics]', detail);
    }
  } catch (err) {
    // swallow errors — analytics must not break app
    console.warn('Analytics error', err);
  }
}

export default { trackEvent };
