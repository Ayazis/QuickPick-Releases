function createHexagon(x, y) {
  const hexagon = document.createElement("div");
  hexagon.style.position = "absolute";
  hexagon.style.width = "50px";
  hexagon.style.height = "50px";
  hexagon.style.background = "white";
  hexagon.style.border = "3px solid white";
  hexagon.style.clipPath = "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)";
  hexagon.style.left = `${x - 25}px`;
  hexagon.style.top = `${y - 25}px`;
  hexagon.style.pointerEvents = "none";
  hexagon.style.opacity = "0";
  hexagon.style.transition = "opacity 0.2s ease-in-out";

  document.body.appendChild(hexagon);

  // Trigger fade-in
  requestAnimationFrame(() => {
    hexagon.style.opacity = "1";
  });

  // Remove hexagon after fade-out
  setTimeout(() => {
    hexagon.style.opacity = "0";
    setTimeout(() => hexagon.remove(), 200);
  }, 500);
}

document.body.addEventListener("click", (event) => {
  createHexagon(event.pageX, event.pageY);
});

// Random hexagons
setInterval(() => {
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  createHexagon(x, y);
}, 1000);
