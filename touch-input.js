// Unified mobile/touch/mouse/keyboard input helper for Flappy Bird
// Usage: include this file, then listen for window 'game-input' events:
//   window.addEventListener('game-input', (e) => { /* call your jump/flap function */ });

(function () {
  // Debounce to avoid double-firing when several input events come from the same user action
  let lastInputTime = 0;
  const DEBOUNCE_MS = 60;

  function dispatchGameInput(sourceEvent) {
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (now - lastInputTime < DEBOUNCE_MS) return;
    lastInputTime = now;

    // Create a custom event that the game can listen for
    const detail = {
      type: 'tap',
      source: sourceEvent && (sourceEvent.pointerType || sourceEvent.type) || 'unknown',
      originalEvent: sourceEvent || null
    };

    const evt = new CustomEvent('game-input', { detail });
    window.dispatchEvent(evt);
  }

  // Pointer events (covers mouse + pen + some touch scenarios)
  window.addEventListener('pointerdown', function (e) {
    // only react to primary button/pointer
    if (typeof e.button === 'number' && e.button !== 0) return;
    dispatchGameInput(e);
  }, { passive: true });

  // Touch fallback: specifically handle touchstart to ensure mobile taps work
  // Use passive: false so we can call preventDefault when desired (prevent scrolling)
  window.addEventListener('touchstart', function (e) {
    // Only count the first touch (single-finger tap)
    if (e.touches && e.touches.length > 1) return;
    // prevent default so tapping on canvas doesn't scroll the page
    if (e.cancelable) e.preventDefault();
    dispatchGameInput(e);
  }, { passive: false });

  // Mouse fallback (in case pointer events not available)
  window.addEventListener('mousedown', function (e) {
    if (typeof e.button === 'number' && e.button !== 0) return;
    dispatchGameInput(e);
  }, { passive: true });

  // Keyboard spacebar / arrow / up key handling
  window.addEventListener('keydown', function (e) {
    // Space, ArrowUp, KeyW, or KeyK are commonly used for jump
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyK') {
      // Prevent page scroll on Space
      if (e.code === 'Space' && e.cancelable) e.preventDefault();
      dispatchGameInput(e);
    }
  }, { passive: false });

  // Optional: expose a simple API to trigger the event programmatically
  window.gameInput = {
    triggerTap: function () { dispatchGameInput(null); }
  };
})();
