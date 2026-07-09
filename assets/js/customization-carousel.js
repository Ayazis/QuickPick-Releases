const customizationCarousel = document.querySelector('[data-customization-carousel]');

if (customizationCarousel) {
  const images = Array.from(customizationCarousel.querySelectorAll('.customization-image'));
  let currentIndex = 0;

  function rotateImages() {
    images.forEach((img, index) => {
      img.classList.toggle('is-active', index === currentIndex);
    });

    currentIndex = (currentIndex + 1) % images.length;
  }

  // Rotate every 4 seconds
  setInterval(rotateImages, 4000);
}
