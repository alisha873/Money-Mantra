// Dynamic Canvas Animation
const canvas = document.getElementById('dynamicCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle System
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.life = Math.random() * 100;
        this.maxLife = this.life;
        this.size = Math.random() * 3 + 1;
        this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        if (this.life <= 0 || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.life = this.maxLife;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife * 0.6;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Connection Lines
class Connection {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    draw() {
        const distance = Math.sqrt(
            Math.pow(this.p2.x - this.p1.x, 2) + 
            Math.pow(this.p2.y - this.p1.y, 2)
        );

        if (distance < 150) {
            ctx.save();
            ctx.globalAlpha = (150 - distance) / 150 * 0.2;
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.p1.x, this.p1.y);
            ctx.lineTo(this.p2.x, this.p2.y);
            ctx.stroke();
            ctx.restore();
        }       
    }
}

// Initialize particles
const particles = [];
for (let i = 0; i < 80; i++) {
    particles.push(new Particle());
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const connection = new Connection(particles[i], particles[j]);
            connection.draw();
        }
    }

    requestAnimationFrame(animate);
}
animate();

// Mouse Trail Effect
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Create trail element
    const trail = document.createElement('div');
    trail.className = 'mouse-trail';
    trail.style.left = mouseX + 'px';
    trail.style.top = mouseY + 'px';
    document.body.appendChild(trail);

    // Remove trail after animation
    setTimeout(() => {
        trail.remove();
    }, 600);

    // Add particles near mouse
    if (Math.random() < 0.1) {
        particles.push(new Particle());
        particles[particles.length - 1].x = mouseX;
        particles[particles.length - 1].y = mouseY;
    }
});

// Floating Particles
function createFloatingParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.bottom = '-10px';
    particle.style.width = Math.random() * 4 + 2 + 'px';
    particle.style.height = particle.style.width;
    particle.style.animationDuration = Math.random() * 10 + 10 + 's';
    particle.style.animationDelay = Math.random() * 5 + 's';
    
    const colors = ['rgba(59, 130, 246, 0.6)', 'rgba(16, 185, 129, 0.6)', 'rgba(245, 158, 11, 0.6)'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 15000);
}

// Create floating particles periodically
setInterval(createFloatingParticle, 500);

// Performance optimization
let isVisible = true;
document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    
    if (!isVisible) {
        while (particles.length > 20) particles.pop();
    } else {
        while (particles.length < 80) particles.push(new Particle());
    }
});
