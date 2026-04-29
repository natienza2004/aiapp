const EYE_LIMIT = 6;
const TILT_LIMIT = 8;
const EYE_FOCUS_LIMIT = 8;
const MOBILE_QUERY = '(max-width: 720px), (pointer: coarse)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const ACTIVE_FLAG = 'authMascotsActive';

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

function startBlinks(boxes) {
  boxes.forEach((box) => {
    if (!box.dataset.blinkId) {
      box.dataset.blinkId = String(scheduleBlink(box));
    }
  });
}

function stopBlinks(boxes) {
  boxes.forEach((box) => {
    if (box.dataset.blinkId) {
      window.clearTimeout(Number(box.dataset.blinkId));
      delete box.dataset.blinkId;
    }
    box.classList.remove('is-blinking');
  });
}

export function initAuthMascots() {
  const scene = document.querySelector('.auth-mascot-scene');
  const boxes = Array.from(document.querySelectorAll('.mascot-box'));
  const authPage = document.querySelector('.auth-page');

  if (!scene || boxes.length === 0 || !authPage) return () => {};
  if (authPage.dataset[ACTIVE_FLAG] === 'true') return () => {};
  authPage.dataset[ACTIVE_FLAG] = 'true';

  const mobileQuery = window.matchMedia(MOBILE_QUERY);
  const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  const cleanupCallbacks = [];
  let isLoading = false;

  if (reducedMotionQuery.matches) {
    scene.classList.add('is-static');
    return () => {
      delete authPage.dataset[ACTIVE_FLAG];
    };
  }

  startBlinks(boxes);

  cleanupCallbacks.push(() => {
    stopBlinks(boxes);
  });

  if (mobileQuery.matches) {
    scene.classList.add('is-static');
    return () => {
      cleanupCallbacks.forEach((cleanup) => cleanup());
      delete authPage.dataset[ACTIVE_FLAG];
    };
  }

  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let frameId = 0;
  let needsLayout = true;
  const mascotState = boxes.map((box) => ({
    box,
    eyes: Array.from(box.querySelectorAll('.eye')),
    centerX: 0,
    centerY: 0,
    eyeCenters: [],
  }));

  function measureMascots() {
    mascotState.forEach((state) => {
      const rect = state.box.getBoundingClientRect();
      state.centerX = rect.left + rect.width / 2;
      state.centerY = rect.top + rect.height / 2;
      state.eyeCenters = state.eyes.map((eye) => {
        const eyeRect = eye.getBoundingClientRect();
        return {
          x: eyeRect.left + eyeRect.width / 2,
          y: eyeRect.top + eyeRect.height / 2,
        };
      });
    });
    needsLayout = false;
  }

  function scheduleUpdate() {
    if (!frameId && !isLoading) {
      frameId = window.requestAnimationFrame(updateMascots);
    }
  }

  function updateMascots() {
    frameId = 0;
    if (isLoading) return;
    if (needsLayout) measureMascots();

    mascotState.forEach((state) => {
      const dx = cursorX - state.centerX;
      const dy = cursorY - state.centerY;
      const distance = Math.max(Math.hypot(dx, dy), 1);
      const normalizedX = dx / distance;
      const normalizedY = dy / distance;
      const eyeX = `${clamp(normalizedX * EYE_LIMIT, -EYE_LIMIT, EYE_LIMIT)}px`;
      const eyeY = `${clamp(normalizedY * EYE_LIMIT, -EYE_LIMIT, EYE_LIMIT)}px`;

      state.box.style.setProperty('--eye-x', eyeX);
      state.box.style.setProperty('--eye-y', eyeY);
      state.box.style.setProperty('--tilt-x', `${clamp(-normalizedY * TILT_LIMIT, -TILT_LIMIT, TILT_LIMIT)}deg`);
      state.box.style.setProperty('--tilt-y', `${clamp(normalizedX * TILT_LIMIT, -TILT_LIMIT, TILT_LIMIT)}deg`);
      state.eyes.forEach((eye, index) => {
        const eyeCenter = state.eyeCenters[index];
        const eyeDx = cursorX - eyeCenter.x;
        const eyeDy = cursorY - eyeCenter.y;
        const eyeDistance = Math.max(Math.hypot(eyeDx, eyeDy), 1);
        const focusX = clamp((eyeDx / eyeDistance) * EYE_FOCUS_LIMIT, -EYE_FOCUS_LIMIT, EYE_FOCUS_LIMIT);
        const focusY = clamp((eyeDy / eyeDistance) * EYE_FOCUS_LIMIT, -EYE_FOCUS_LIMIT, EYE_FOCUS_LIMIT);

        eye.style.setProperty('--eye-x', `${focusX}px`);
        eye.style.setProperty('--eye-y', `${focusY}px`);
      });
    });
  }

  function handlePointerMove(event) {
    if (isLoading) return;
    cursorX = event.clientX;
    cursorY = event.clientY;
    scheduleUpdate();
  }

  function handleLayoutChange() {
    needsLayout = true;
    scheduleUpdate();
  }

  function handleLoadingChange(event) {
    isLoading = Boolean(event.detail?.loading);
    authPage.classList.toggle('is-auth-loading', isLoading);
    scene.classList.toggle('is-paused', isLoading);

    if (isLoading) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      stopBlinks(boxes);
      return;
    }

    startBlinks(boxes);
    handleLayoutChange();
  }

  authPage.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('resize', handleLayoutChange, { passive: true });
  document.addEventListener('auth-loading-change', handleLoadingChange);
  scheduleUpdate();

  cleanupCallbacks.push(() => {
    authPage.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('resize', handleLayoutChange);
    document.removeEventListener('auth-loading-change', handleLoadingChange);
    window.cancelAnimationFrame(frameId);
    authPage.classList.remove('is-auth-loading');
    scene.classList.remove('is-paused');
  });

  return () => {
    cleanupCallbacks.forEach((cleanup) => cleanup());
    delete authPage.dataset[ACTIVE_FLAG];
  };
}
