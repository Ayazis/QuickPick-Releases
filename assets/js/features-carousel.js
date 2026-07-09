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

  previousButton?.addEventListener('click', () => {
    renderSlides(activeIndex - 1);
  });

  nextButton?.addEventListener('click', () => {
    renderSlides(activeIndex + 1);
  });

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      renderSlides(index);
    });
  });

  renderSlides(activeIndex);
}
