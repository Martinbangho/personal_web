// Footer SVG star animations for .footer-shape elements
// Applies to .theme-footer-three .footer-shape.shape-1b ... shape-5b

document.addEventListener('DOMContentLoaded', function () {
  // Helper: Animate with random rotation and floating
  function animateStar(el, options) {
    const rotBase = options.rotate || 0;
    const rotRange = options.rotateRange || 30;
    const floatBase = options.float || 0;
    const floatRange = options.floatRange || 20;
    const duration = options.duration || 20;
    let angle = rotBase;
    let dir = 1;
    let floatY = floatBase;
    let floatDir = 1;
    function step() {
      // Rotation
      angle += dir * 0.2;
      if (angle > rotBase + rotRange || angle < rotBase - rotRange) dir *= -1;
      // Floating
      floatY += floatDir * 0.15;
      if (floatY > floatBase + floatRange || floatY < floatBase - floatRange) floatDir *= -1;
      el.style.transform = `rotate(${angle}deg) translateY(${floatY}px)`;
      requestAnimationFrame(step);
    }
    step();
  }

  // Animate each star with different params
  const s1 = document.querySelector('.theme-footer-three .footer-shape.shape-1b');
  if (s1) animateStar(s1, { rotate: 0, rotateRange: 20, float: 0, floatRange: 10, duration: 30 });
  const s2 = document.querySelector('.theme-footer-three .footer-shape.shape-2b');
  if (s2) animateStar(s2, { rotate: 0, rotateRange: 15, float: 0, floatRange: 8, duration: 25 });
  const s3 = document.querySelector('.theme-footer-three .footer-shape.shape-3b');
  if (s3) animateStar(s3, { rotate: 0, rotateRange: 30, float: 0, floatRange: 12, duration: 20 });
  const s4 = document.querySelector('.theme-footer-three .footer-shape.shape-4b');
  if (s4) animateStar(s4, { rotate: 0, rotateRange: 18, float: 0, floatRange: 7, duration: 22 });
  const s5 = document.querySelector('.theme-footer-three .footer-shape.shape-5b');
  if (s5) animateStar(s5, { rotate: 0, rotateRange: 25, float: 0, floatRange: 9, duration: 28 });
});
