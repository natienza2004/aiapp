const EYE_LIMIT = 6;
const TILT_LIMIT = 8;
const EYE_FOCUS_LIMIT = 8;
const MOBILE_QUERY = '(max-width: 720px), (pointer: coarse)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function scheduleBlink(box) {
  const delay = 3000 + Math.random() * 3000;
  const blinkId = window.setTimeout(() => {
    box.classList.add('is-blinking');
    window.setTimeout(() => box.classList.remove('is-blinking'), 120);
    box.dataset.blinkId = String(scheduleBlink(box));
  }, delay);

  return blinkId;
}

export function initAuthMascots() {
  const scene = document.querySelector('.auth-mascot-scene');
  const boxes = Array.from(document.querySelectorAll('.mascot-box'));
  const authPage = document.querySelector('.auth-page');

  if (!scene || boxes.length === 0 || !authPage) return () => {};

  const mobileQuery = window.matchMedia(MOBILE_QUERY);
  const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  const cleanupCallbacks = [];

  if (reducedMotionQuery.matches) {
    scene.classList.add('is-static');
    return () => {};
  }

  boxes.forEach((box) => {
    box.dataset.blinkId = String(scheduleBlink(box));
  });

  cleanupCallbacks.push(() => {
    boxes.forEach((box) => {
      if (box.dataset.blinkId) {
        window.clearTimeout(Number(box.dataset.blinkId));
      }
    });
  });

  if (mobileQuery.matches) {
    scene.classList.add('is-static');
    return () => cleanupCallbacks.forEach((cleanup) => cleanup());
  }

  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let frameId = 0;

  function updateMascots() {
    boxes.forEach((box) => {
      const rect = box.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = cursorX - centerX;
      const dy = cursorY - centerY;
      const distance = Math.max(Math.hypot(dx, dy), 1);
      const normalizedX = dx / distance;
      const normalizedY = dy / distance;
      const eyeX = `${clamp(normalizedX * EYE_LIMIT, -EYE_LIMIT, EYE_LIMIT)}px`;
      const eyeY = `${clamp(normalizedY * EYE_LIMIT, -EYE_LIMIT, EYE_LIMIT)}px`;

      box.style.setProperty('--eye-x', eyeX);
      box.style.setProperty('--eye-y', eyeY);
      box.style.setProperty('--tilt-x', `${clamp(-normalizedY * TILT_LIMIT, -TILT_LIMIT, TILT_LIMIT)}deg`);
      box.style.setProperty('--tilt-y', `${clamp(normalizedX * TILT_LIMIT, -TILT_LIMIT, TILT_LIMIT)}deg`);
      box.querySelectorAll('.eye').forEach((eye) => {
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;
        const eyeDx = cursorX - eyeCenterX;
        const eyeDy = cursorY - eyeCenterY;
        const eyeDistance = Math.max(Math.hypot(eyeDx, eyeDy), 1);
        const focusX = clamp((eyeDx / eyeDistance) * EYE_FOCUS_LIMIT, -EYE_FOCUS_LIMIT, EYE_FOCUS_LIMIT);
        const focusY = clamp((eyeDy / eyeDistance) * EYE_FOCUS_LIMIT, -EYE_FOCUS_LIMIT, EYE_FOCUS_LIMIT);

        eye.style.setProperty('--eye-x', `${focusX}px`);
        eye.style.setProperty('--eye-y', `${focusY}px`);
      });
    });

    frameId = window.requestAnimationFrame(updateMascots);
  }

  function handleMouseMove(event) {
    cursorX = event.clientX;
    cursorY = event.clientY;
  }

  authPage.addEventListener('mousemove', handleMouseMove, { passive: true });
  frameId = window.requestAnimationFrame(updateMascots);

  cleanupCallbacks.push(() => {
    authPage.removeEventListener('mousemove', handleMouseMove);
    window.cancelAnimationFrame(frameId);
  });

  return () => cleanupCallbacks.forEach((cleanup) => cleanup());
}
