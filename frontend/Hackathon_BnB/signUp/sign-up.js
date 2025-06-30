// Dynamic Canvas Animation
const canvas = document.getElementById('dynamicCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Button functionality
function openTaxEstimator() {
    alert('AI Tax Estimator feature coming soon! This will redirect to the tax calculation tool.');
    // You can replace this with actual navigation:
    // window.location.href = './tax-estimator/index.html';
}

function openFinanceEducation() {
    alert('Learn Finance feature coming soon! This will redirect to financial education courses.');
    // You can replace this with actual navigation:
    // window.location.href = './collegeS/collegeS.html';
}

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

import { supabase } from '../supabaseClient.js';

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'http://127.0.0.1:5500/frontend/Hackathon_BnB/login/login.html', //replace with actual url when deploying
      data: {
        full_name: name,
      },
    },
  });

  console.log({ data, error });

  if (error) {
    document.getElementById('register-message').textContent = error.message;
  } else {
    document.getElementById('register-message').textContent =
      'Signup successful! Please check your email for confirmation.';
}
});
