 // Dynamic Canvas Animation
const canvas = document.getElementById('dynamicCanvas');
const ctx = canvas.getContext('2d');
        
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
        
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function openTaxEstimator() {
    window.location.href = './collegeS/collegeS.html';
}

function openFinanceEducation() {
    window.location.href = './collegeS/collegeS.html';
}

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const authToken = localStorage.getItem('sb-auth-token') || sessionStorage.getItem('sb-auth-token');
    const loginBtn = document.querySelector('.login-btn');
            
    if (authToken) {
        // User is logged in
        loginBtn.textContent = 'Logout';
        loginBtn.href = './index.html';
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('sb-auth-token');
            sessionStorage.removeItem('sb-auth-token');
            window.location.reload();
    });
    } else {
        // User not logged in
        loginBtn.textContent = 'Login';
        loginBtn.href = './login/login.html';
    }
});

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
const mouseTrails = [];
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Create trail element
    const trail = document.createElement('div');
    trail.className = 'mouse-trail';
    trail.style.left = mouseX + 'px';
    trail.style.top = mouseY + 'px';
    document.body.appendChild(trail);

    // Remove trail after animation
    setTimeout(() => {
        if (trail.parentNode) {
            trail.parentNode.removeChild(trail);
        }
    }, 1000);

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
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 15000);
}

// Create floating particles periodically
setInterval(createFloatingParticle, 500);


// Interactive hover effects
document.querySelectorAll('.cta-btn, .nav-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        // Create ripple effect
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const ripple = document.createElement('div');
                ripple.style.position = 'absolute';
                ripple.style.width = '4px';
                ripple.style.height = '4px';
                ripple.style.background = 'rgba(59, 130, 246, 0.8)';
                ripple.style.borderRadius = '50%';
                ripple.style.left = btn.offsetLeft + Math.random() * btn.offsetWidth + 'px';
                ripple.style.top = btn.offsetTop + Math.random() * btn.offsetHeight + 'px';
                ripple.style.animation = 'float 2s ease-out forwards';
                ripple.style.pointerEvents = 'none';
                ripple.style.zIndex = '999';
                
                document.body.appendChild(ripple);
                
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 2000);
            }, i * 100);
        }
    });
});

// Scroll-based animations
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    // Header transparency effect
    const header = document.querySelector('header');
    if (scrolled > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.8)';
    }
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

// Observe all elements with animate-on-scroll class
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Number counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            // Format final number based on target
            if (target >= 100000) {
                element.textContent = Math.floor(target / 1000) + 'K+';
            } else if (target >= 10000000) {
                element.textContent = '₹' + Math.floor(target / 10000000) + 'Cr+';
            } else if (target === 98) {
                element.textContent = '98%';
            } else if (target === 247) {
                element.textContent = '24/7';
            } else {
                element.textContent = target.toLocaleString();
            }
        }
    }
    
    updateCounter();
}

// Trigger counter animations when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            const targets = [50000, 10000000, 98, 247]; // 50K+, ₹10Cr+, 98%, 24/7
            
            statNumbers.forEach((stat, index) => {
                animateCounter(stat, targets[index]);
            });
            
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Performance optimization - pause animations when tab is not visible
let isVisible = true;
document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    
    // Pause/resume particle animations based on visibility
    if (!isVisible) {
        // Reduce particle count when tab is hidden
        while (particles.length > 20) {
            particles.pop();
        }
    } else {
        // Restore particle count when tab is visible
        while (particles.length < 80) {
            particles.push(new Particle());
        }
    }
});

// Add dynamic text typing effect to tagline
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect after page load
window.addEventListener('load', () => {
    const tagline = document.querySelector('.tagline');
    const originalText = tagline.textContent;
    setTimeout(() => {
        typeWriter(tagline, originalText, 50);
    }, 1000);
});

// Add loading screen effect
function createLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #000 0%, #1e40af 50%, #000 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        transition: opacity 0.5s ease;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 3px solid rgba(59, 130, 246, 0.3);
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;
    
    loadingScreen.appendChild(spinner);
    document.body.appendChild(loadingScreen);
    
    // Remove loading screen after page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 500);
        }, 1000);
    });
}

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize loading screen
createLoadingScreen();

// document.addEventListener('DOMContentLoaded', () => {
//   const protectedButtons = [
//     document.getElementById('ai-tax-summarizer-btn'),
//     document.getElementById('learn-finance-btn')
//   ].filter(Boolean);

//   protectedButtons.forEach(btn => {
//     btn.addEventListener('click', (e) => {
//       if (!isUserLoggedIn()) {
//         e.preventDefault();
//         alert('Please log in to access this feature');
//         window.location.href = './login/login.html';
//       }
//     });
//   });
// });
