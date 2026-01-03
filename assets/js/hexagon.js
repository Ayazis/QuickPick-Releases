function createHexagon(x, y) {
  return;
  const hexagon = document.createElement("div");
  hexagon.classList.add("hexagon");
  hexagon.style.left = `${x - 25}px`;
  hexagon.style.top = `${y - 25}px`;

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
