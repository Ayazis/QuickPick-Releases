const featuresCarousel = document.querySelector('[data-features-carousel]');

if (featuresCarousel) {
  const slides = Array.from(featuresCarousel.querySelectorAll('[data-features-slide]'));
  const indicators = Array.from(featuresCarousel.querySelectorAll('[data-features-indicator]'));
  const previousButton = featuresCarousel.querySelector('[data-features-prev]');
  const nextButton = featuresCarousel.querySelector('[data-features-next]');
  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  function renderSlides(nextIndex) {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeIndex);
    });

    indicators.forEach((indicator, index) => {
      const isActive = index === activeIndex;
      indicator.classList.toggle('is-active', isActive);
      indicator.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  // Demo iframes run their own looping animation with cursor state that
  // keeps ticking while a slide is hidden (display:none doesn't pause
  // timers), so switching back can show the cursor mid-animation in the
  // wrong spot. Reloading every demo frame on navigation restarts each
  // animation cleanly from its opening frame. The frame is hidden until
  // the reload finishes so the stale pre-reset frame never flashes on
  // screen when its slide becomes active.
  function resetDemoFrames() {
    featuresCarousel.querySelectorAll('.feature-demo-frame').forEach((frame) => {
      const src = frame.getAttribute('src');
      if (!src) return;
      frame.classList.add('is-resetting');
      frame.addEventListener('load', function onLoad() {
        frame.classList.remove('is-resetting');
        frame.removeEventListener('load', onLoad);
      });
      frame.setAttribute('src', src);
    });
  }

  previousButton?.addEventListener('click', () => {
    resetDemoFrames();
    renderSlides(activeIndex - 1);
  });

  nextButton?.addEventListener('click', () => {
    resetDemoFrames();
    renderSlides(activeIndex + 1);
  });

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      resetDemoFrames();
      renderSlides(index);
    });
  });

  renderSlides(activeIndex);
}
