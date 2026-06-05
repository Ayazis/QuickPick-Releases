const heroCarousel = document.querySelector('[data-hero-carousel]');

if (heroCarousel) {
  const slides = Array.from(heroCarousel.querySelectorAll('[data-hero-slide]'));
  const indicators = Array.from(heroCarousel.querySelectorAll('[data-hero-indicator]'));
  const previousButton = heroCarousel.querySelector('[data-hero-prev]');
  const nextButton = heroCarousel.querySelector('[data-hero-next]');
  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  function renderSlides(nextIndex) {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
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
