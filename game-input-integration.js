// Small integration snippet to add to your main game code (or import as a small module).
// Place this after your game objects are created so flap() / jump logic exists.

(function () {
  function callFlap() {
    // Try common names and patterns. Replace or extend with your actual game's function/call.
    if (typeof flap === 'function') {
      flap();
      return;
    }
    if (window.player && typeof window.player.jump === 'function') {
      window.player.jump();
      return;
    }
    // If your code uses a global `game` object with a method
    if (window.game && typeof window.game.flap === 'function') {
      window.game.flap();
      return;
    }
    // As a last resort, simulate a click on an on-screen button if present
    var btn = document.querySelector('[data-action="flap"], .flap-button, #flapButton');
    if (btn) {
      btn.click();
      return;
    }
    // If nothing matched, log to help integrate manually
    console.warn('game-input received but no flap/jump function found. Please replace callFlap() contents with your jump/flap function.');
  }

  // Listen for the unified 'game-input' event emitted by touch-input.js
  window.addEventListener('game-input', function (e) {
    callFlap();
  });
})();
