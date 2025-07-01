// Floating Particles
const particles = document.getElementById('particles');
for (let i = 0; i < 50; i++) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.left = Math.random() * 100 + 'vw';
  particle.style.top = Math.random() * 100 + 'vh';
  particle.style.width = Math.random() * 10 + 5 + 'px';
  particle.style.height = particle.style.width;
  particle.style.background = `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.2})`;
  particle.style.borderRadius = '50%';
  particle.style.position = 'absolute';
  particles.appendChild(particle);
}

// Floating Elements (optional: add animated shapes/icons)
const floatingElements = document.getElementById('floatingElements');
for (let i = 0; i < 10; i++) {
  const elem = document.createElement('div');
  elem.className = 'floating-element';
  elem.style.left = Math.random() * 100 + 'vw';
  elem.style.top = Math.random() * 100 + 'vh';
  elem.style.width = Math.random() * 30 + 20 + 'px';
  elem.style.height = elem.style.width;
  elem.style.background = `rgba(59, 130, 246, ${Math.random() * 0.3 + 0.1})`;
  elem.style.borderRadius = '8px';
  elem.style.position = 'absolute';
  elem.style.animation = `float ${Math.random() * 10 + 5}s infinite ease-in-out`;
  floatingElements.appendChild(elem);
}

// Mouse Trail Effect
document.addEventListener('mousemove', (e) => {
  const trail = document.createElement('div');
  trail.className = 'mouse-trail';
  trail.style.left = e.clientX + 'px';
  trail.style.top = e.clientY + 'px';
  document.body.appendChild(trail);
  setTimeout(() => {
    if (trail.parentNode) trail.parentNode.removeChild(trail);
  }, 1000);
});

// Add float animation to CSS if not present
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
`;
document.head.appendChild(style);
