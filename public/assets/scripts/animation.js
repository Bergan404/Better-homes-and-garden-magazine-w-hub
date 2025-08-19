(function () {
  // Add corner decorations to all animation containers
  function addCornerDecorations() {
    document.querySelectorAll(".animation-container").forEach((container) => {
      const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];
      corners.forEach((position) => {
        const corner = document.createElement("div");
        corner.className = `corner ${position}`;
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svg.setAttribute("width", "16");
        svg.setAttribute("height", "16");
        svg.setAttribute("viewBox", "0 0 512 512");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        const polygon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "polygon"
        );
        polygon.setAttribute(
          "points",
          "448,224 288,224 288,64 224,64 224,224 64,224 64,288 224,288 224,448 288,448 288,288 448,288"
        );
        polygon.setAttribute("fill", "currentColor");
        svg.appendChild(polygon);
        corner.appendChild(svg);
        container.appendChild(corner);
      });
    });
  }
  // Concentric Rings (unchanged)
  function setupConcentricRings() {
    const container = document.getElementById("concentric-rings");
    if (!container) return;
    container.innerHTML = "";
    const canvas = document.createElement("canvas");
    canvas.width = 180;
    canvas.height = 180;
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let time = 0;
    let lastTime = 0;
    // Ring parameters
    const ringCount = 5;
    const maxRadius = 75;

    function animate(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      time += deltaTime * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw center dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    // ctx.fillStyle = "rgba(0, 102, 0, 0.95)";
      ctx.fill();
      // Draw concentric rings of dots
      for (let r = 0; r < ringCount; r++) {
        const radius = ((r + 1) / ringCount) * maxRadius;
        const dotCount = 6 + r * 6; // More dots in outer rings
        // Phase offset for rotation based on ring index
        const phaseOffset = r % 2 === 0 ? time * 0.2 : -time * 0.2;
        // Each ring pulses at a different phase
        const ringPhase = time + r * 0.7;
        for (let i = 0; i < dotCount; i++) {
          const angle = (i / dotCount) * Math.PI * 2 + phaseOffset;
          // Add a pulsing effect to the radius (slight)
          const radiusPulse = Math.sin(ringPhase) * 3;
          const finalRadius = radius + radiusPulse;
          const x = centerX + Math.cos(angle) * finalRadius;
          const y = centerY + Math.sin(angle) * finalRadius;
          // Enhanced dot size pulsing - more pronounced
          // Base size that varies by ring position
          const baseSize = 2 + r / (ringCount - 1);
          // Size pulse effect - make it more dramatic (2x larger)
          const sizePulse = Math.sin(ringPhase) * baseSize * 0.7 + baseSize;
          // Enhanced opacity pulsing
          const opacityPulse = 0.6 + Math.sin(ringPhase) * 0.4;
          ctx.beginPath();
          ctx.arc(x, y, sizePulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacityPulse})`;
        // ctx.fillStyle = `rgba(0, 102, 0, ${opacityPulse})`;

          ctx.fill();
        }
      }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
  // Initialize all preloaders
  window.addEventListener("load", function () {
    setupConcentricRings();
    // addCornerDecorations();
  });
})();
