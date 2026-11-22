/* ═══════════════════════════════════════════════════════════
   PROLAYJIT BISWAS PORTFOLIO — JavaScript
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ── CURSOR (INSTANT TRACKING & DYNAMIC HOVER EXPANSION) ──── */
(function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const glow = document.getElementById('cursorGlow');
  if (!dot || !glow) return;

  // Only run on devices with a mouse/pointer (not touchscreens)
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let mouseX = -100, mouseY = -100;
  let glowX = -100, glowY = -100;
  let isHovering = false;
  let isClicking = false;
  let isVisible = false;

  // 1. Instant 0-latency tracking for center dot via passive listener
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      dot.style.opacity = '1';
      glow.style.opacity = '1';
    }

    // Direct hardware translation for instantaneous responsiveness
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }, { passive: true });

  // 2. Hide when mouse leaves the viewport
  document.addEventListener('mouseleave', () => {
    isVisible = false;
    dot.style.opacity = '0';
    glow.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    dot.style.opacity = '1';
    glow.style.opacity = '1';
  });

  // 3. Ultra-fast lerp loop for the glow ring (factor 0.28 = tight, responsive, no sluggish drag)
  function renderCursor() {
    glowX += (mouseX - glowX) * 0.28;
    glowY += (mouseY - glowY) * 0.28;

    const scale = isClicking ? 0.85 : isHovering ? 1.65 : 1;
    glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) scale(${scale})`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // 4. Delegated hover detection (0 lag, O(1), instantaneous reaction on hover)
  const hoverSelector = 'a, button, input, textarea, select, [role="button"], .interactive, .skill-card-v2, .skill-pill, .project-card, .hp-row, .research-card, .cert-card, .contact-social-btn, .domain-card, .btn-primary, .btn-secondary, .tag, .tech-pill, .badge, [onclick]';

  document.addEventListener('mouseover', (e) => {
    if (e.target && e.target.closest && e.target.closest(hoverSelector)) {
      isHovering = true;
      glow.classList.add('is-hovering');
      dot.classList.add('is-hovering');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target && e.target.closest && e.target.closest(hoverSelector)) {
      const related = e.relatedTarget;
      if (!related || !related.closest || !related.closest(hoverSelector)) {
        isHovering = false;
        glow.classList.remove('is-hovering');
        dot.classList.remove('is-hovering');
      }
    }
  }, { passive: true });

  // 5. Tactile click feedback
  document.addEventListener('mousedown', () => {
    isClicking = true;
    glow.classList.add('is-clicking');
  }, { passive: true });

  document.addEventListener('mouseup', () => {
    isClicking = false;
    glow.classList.remove('is-clicking');
  }, { passive: true });
})();

/* ── PARTICLE CANVAS (OPTIMIZED) ─────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const PARTICLE_COUNT = 35;
  const particles = [];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x   = Math.random() * W;
      this.y   = Math.random() * H;
      this.vx  = (Math.random() - 0.5) * 0.25;
      this.vy  = (Math.random() - 0.5) * 0.25;
      this.r   = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.4 + 0.1;
      this.color = Math.random() > 0.7 ? '#D42B2B' : '#0A0A0A';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 8100) { // 90px threshold squared
          const dist = Math.sqrt(distSq);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(10,10,10,${0.035 * (1 - dist / 90)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  let animId;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    animId = requestAnimationFrame(loop);
  }
  loop();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }, 150);
  }, { passive: true });
})();

/* ── NAVBAR & SCROLL (OPTIMIZED & THROTTLED) ──────────────── */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('navHamburger');
const navLinks  = document.getElementById('navLinks');
const navLinkEls = document.querySelectorAll('.nav-link');

let isScrolling = false;
window.addEventListener('scroll', () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      if (navbar) navbar.classList.toggle('scrolled', scrollY > 20);

      // Active link scroll check
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(s => {
        if (scrollY >= s.offsetTop - 120) current = s.id;
      });
      navLinkEls.forEach(l => {
        const href = l.getAttribute('href');
        if (href) {
          l.classList.toggle('active', href === '#' + current);
        }
      });

      // Reading progress bar for active blog post
      const progressBar = document.getElementById('readingProgressBar');
      const readerView = document.getElementById('blogPostReader');
      if (progressBar) {
        if (readerView && readerView.style.display === 'block') {
          const winHeight = window.innerHeight;
          const scrolled = scrollY - (readerView.offsetTop - 100);
          const totalHeight = readerView.scrollHeight - winHeight;
          if (totalHeight > 0) {
            const pct = Math.max(0, Math.min(100, (scrolled / totalHeight) * 100));
            progressBar.style.width = pct + '%';
            progressBar.style.opacity = '1';
          } else {
            progressBar.style.width = '0%';
            progressBar.style.opacity = '0';
          }
        } else {
          progressBar.style.width = '0%';
          progressBar.style.opacity = '0';
        }
      }
      isScrolling = false;
    });
    isScrolling = true;
  }
}, { passive: true });

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
}

navLinkEls.forEach(l => l.addEventListener('click', () => {
  if (hamburger) hamburger.classList.remove('open');
  if (navLinks) navLinks.classList.remove('open');
}));


// Dark/Light Theme Switcher Logic
const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (savedTheme === 'light') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
  
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
    
    if (newTheme === 'light') {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  });
}


/* ── HERO ROLE CYCLING ────────────────────────────────────── */
(function roleTyper() {
  const roles = [
    'Hardware Systems',
    'Embedded Firmware',
    'PCB Layouts',
    'IoT Devices',
    'Robotics',
    'VLSI Circuits',
    'Edge AI Models',
    'Web Applications',
    '3D Prototypes',
    'Hackathon Projects'
  ];
  const el = document.getElementById('roleCycle');
  if (!el) return;
  let ri = 0, ci = 0, deleting = false;

  function type() {
    const word = roles[ri];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(type, 1800); return; }
      setTimeout(type, 80);
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; setTimeout(type, 400); return; }
      setTimeout(type, 40);
    }
  }
  setTimeout(type, 1000);
})();

/* ── COUNTER ANIMATION ────────────────────────────────────── */
function animateCounter(el, target, suffix='') {
  let start = 0;
  const duration = 1800;
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    start = Math.round(ease * target);
    el.textContent = start + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ── SCROLL REVEAL ────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // Counter animation
      if (entry.target.classList.contains('stat-big-number')) {
        let targetStr = entry.target.dataset.target;
        if (targetStr === 'repos') targetStr = '20'; // Fallback
        const target = parseInt(targetStr);
        const suffix = entry.target.dataset.suffix || '+';
        animateCounter(entry.target, target, suffix);
      }

      // Domain bars
      const fills = entry.target.querySelectorAll('.domain-fill');
      fills.forEach(fill => {
        setTimeout(() => {
          fill.style.width = fill.dataset.width + '%';
        }, 300);
      });

      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));
document.querySelectorAll('.stat-big-number').forEach(el => revealObserver.observe(el));
document.querySelectorAll('.about-domains').forEach(el => revealObserver.observe(el));

/* ── MINI STAT COUNTER (About Page Sidebar) ───────────────── */
const miniStatObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      if (!isNaN(target)) animateCounter(el, target, suffix);
      miniStatObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.mini-stat-num[data-target]').forEach(el => miniStatObserver.observe(el));


/* ── SKILL BARS ON SCROLL ─────────────────────────────────── */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.domain-fill').forEach(fill => {
        fill.style.width = fill.dataset.width + '%';
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.about-domains').forEach(el => skillObserver.observe(el));

/* ── PROJECT FILTERING & DOMAIN ROUTING ────────────────────── */
let activeProjectDomain = 'all';
let activeProjectTag = 'all';

window.filterProjectsDomain = function(domain, btn) {
  activeProjectDomain = domain;
  
  // Update domain tabs UI
  const domainTabs = document.querySelectorAll('.domain-tab');
  domainTabs.forEach(t => t.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const targetTab = document.querySelector(`.domain-tab[data-domain="${domain}"]`);
    if (targetTab) targetTab.classList.add('active');
  }
  
  applyProjectFilters();
};

window.filterProjectsTag = function(tag, btn) {
  activeProjectTag = tag;
  
  // Update tech tags UI
  const tagChips = document.querySelectorAll('.tech-tag-chip');
  tagChips.forEach(c => c.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const targetChip = document.querySelector(`.tech-tag-chip[data-tag="${tag}"]`);
    if (targetChip) targetChip.classList.add('active');
  }
  
  applyProjectFilters();
};

function applyProjectFilters() {
  const cards = document.querySelectorAll('#projectsGrid .project-card');
  cards.forEach(card => {
    const cats = (card.dataset.category || '').split(' ');
    const tags = (card.dataset.tags || '').split(' ');
    
    const matchesDomain = (activeProjectDomain === 'all') || cats.includes(activeProjectDomain);
    const matchesTag = (activeProjectTag === 'all') || tags.includes(activeProjectTag);
    
    if (matchesDomain && matchesTag) {
      card.style.display = '';
      card.style.animation = 'projectFadeIn 0.4s ease';
    } else {
      card.style.display = 'none';
    }
  });
}

window.switchEngToolkit = function(toolkitName, btn) {
  const buttons = document.querySelectorAll('#page-projects .engineering-toolkits-section .filter-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  const panels = document.querySelectorAll('.toolkit-panel');
  panels.forEach(p => {
    p.style.display = p.id === `toolkit-${toolkitName}` ? 'block' : 'none';
  });
};

/* ── CONTACT FORM ─────────────────────────────────────────── */
function handleFormSubmit(e) {
  e.preventDefault();
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn     = document.getElementById('formSubmitBtn');

  btn.innerHTML = '<span>Sending...</span>';
  btn.disabled = true;

  // Simulate sending (replace with real backend)
  setTimeout(() => {
    const name    = document.getElementById('contactName').value;
    const emailV  = document.getElementById('contactEmailField').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    const mailto  = `mailto:prolayjitbiswas2004@gmail.com?subject=${encodeURIComponent(subject + ' - from ' + name)}&body=${encodeURIComponent(message + '\n\nFrom: ' + name + '\nEmail: ' + emailV)}`;
    window.location.href = mailto;

    form.style.display = 'none';
    success.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<span>Send Message</span>';
  }, 800);
}
window.handleFormSubmit = handleFormSubmit;

/* ── TIMELINE ANIMATION ───────────────────────────────────── */
const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateX(0)';
      timelineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.timeline-item').forEach((item, i) => {
  item.style.opacity = '0';
  item.style.transform = 'translateX(-20px)';
  item.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
  timelineObserver.observe(item);
});

/* ── ACHIEVEMENT CARDS ANIMATION ──────────────────────────── */
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, (entry.target.dataset.delay || 0) * 100);
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.achievement-card, .research-card, .cert-card, .blog-card, .exp-card, .project-card, .skill-category, .domain-card, .skill-card-v2').forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
  card.dataset.delay = i % 4;
  cardObserver.observe(card);
});

/* ── SECTION HEADERS ANIMATION ────────────────────────────── */
const headerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      headerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.section-header').forEach(h => {
  h.style.opacity = '0';
  h.style.transform = 'translateY(30px)';
  h.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  headerObserver.observe(h);
});

/* ── GPA COUNTER ──────────────────────────────────────────── */
const gpaObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.gpa-number[data-target]').forEach(el => {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        let start = 0;
        const duration = 1500;
        const startTime = performance.now();
        function update(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = (ease * target).toFixed(2) + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      });
      gpaObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.gpa-banner').forEach(el => gpaObserver.observe(el));

/* ── HERO AVATAR TILT ─────────────────────────────────────── */
const heroAvatar = document.getElementById('heroAvatar');
if (heroAvatar) {
  document.addEventListener('mousemove', e => {
    const rect = heroAvatar.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / window.innerWidth  * 10;
    const dy = (e.clientY - cy) / window.innerHeight * 10;
    heroAvatar.style.transform = `perspective(400px) rotateY(${dx}deg) rotateX(${-dy}deg)`;
  });
  heroAvatar.addEventListener('mouseleave', () => {
    heroAvatar.style.transform = 'perspective(400px) rotateY(0) rotateX(0)';
  });
}

/* ── GLITCH EFFECT ON LOGO ─────────────────────────────────── */
const navLogo = document.getElementById('navLogo');
if (navLogo) {
  navLogo.addEventListener('mouseenter', () => {
    navLogo.style.animation = 'glitch 0.4s';
    setTimeout(() => { navLogo.style.animation = ''; }, 400);
  });
}

/* ── SPA ROUTER & NAVIGATION ──────────────────────────────── */
const pageRoutes = {
  '#home': 'page-home',
  '#about': 'page-about',
  '#expertise': 'page-expertise',
  '#projects': 'page-projects',
  '#project-details': 'page-project-details',
  '#hardware': 'page-projects',
  '#vlsi': 'page-projects',
  '#software': 'page-projects',
  '#robotic': 'page-expertise',
  '#iot': 'page-expertise',
  '#embedded': 'page-expertise',
  '#cad': 'page-projects',
  '#achievements': 'page-achievements',
  '#hackathons': 'page-hackathons',
  '#blog': 'page-blog',
  '#gallery': 'page-gallery',
  '#certificate': 'page-certificate'
};

window.activateExpertiseTab = function(tabName) {
  const filterBtn = document.querySelector(`.filter-btn[data-filter="${tabName}"]`);
  if (filterBtn) filterBtn.click();
  const skillCategory = document.querySelector(`.skill-category[data-category*="${tabName}"]`);
  if (skillCategory) {
    skillCategory.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

window.activateResearchTab = function(tabName) {
  const resCard = document.querySelector(`.research-card[id*="${tabName}"]`);
  if (resCard) {
    resCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};


window.switchExpertiseTab = function(tabName, btn) {
  // Update sidebar nav buttons
  const navBtns = document.querySelectorAll('.exp-nav-btn');
  navBtns.forEach(b => {
    b.classList.remove('active');
    b.style.removeProperty('--panel-color');
  });
  // Also handle old filter-btn style (fallback)
  const oldBtns = document.querySelectorAll('#skills-dashboard .filter-btn');
  oldBtns.forEach(b => b.classList.remove('active'));

  if (btn) {
    btn.classList.add('active');
    // Apply the domain color to the active button's CSS variable
    const color = btn.querySelector('.exp-nav-icon') 
      ? btn.querySelector('.exp-nav-icon').style.color 
      : null;
    if (color) btn.style.setProperty('--panel-color', color);
  }

  // Show/hide new .exp-panel elements
  const newPanels = document.querySelectorAll('.exp-panel');
  newPanels.forEach(p => {
    const isTarget = p.id === `exp-panel-${tabName}`;
    p.style.display = isTarget ? 'flex' : 'none';
    if (isTarget) {
      // Re-trigger animation
      p.style.animation = 'none';
      void p.offsetWidth;
      p.style.animation = '';
      // Animate skill bars
      p.querySelectorAll('.skill-bar-fill').forEach(fill => {
        fill.style.width = '0%';
        void fill.offsetWidth;
        setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, 80);
      });
    }
  });

  // Legacy: hide old expertise-tab-panel elements if present
  document.querySelectorAll('.expertise-tab-panel').forEach(p => {
    p.style.display = p.id === `exp-panel-${tabName}` ? 'block' : 'none';
  });

};

function navigateToPage() {
  const hash = window.location.hash || '#home';
  const cleanHash = hash.split('?')[0];
  const targetPageId = pageRoutes[cleanHash] || 'page-home';

  const pages = document.querySelectorAll('.portfolio-page');
  pages.forEach(p => {
    const isTarget = (p.id === targetPageId) || 
                     (targetPageId === 'page-leadership' && p.id === 'page-leadership-experience');
    if (isTarget) {
      p.style.display = 'block';
      p.classList.add('active');
    } else {
      p.style.display = 'none';
      p.classList.remove('active');
    }
  });

  // Highlight active navbar link
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === cleanHash);
  });

  // Handle sub-routing triggers & domain parameters
  const params = new URLSearchParams(hash.split('?')[1] || '');
  const domainParam = params.get('domain');

  if (cleanHash === '#hardware' || domainParam === 'hardware') {
    if (window.filterProjectsDomain) window.filterProjectsDomain('hardware');
  } else if (cleanHash === '#vlsi' || domainParam === 'vlsi') {
    if (window.filterProjectsDomain) window.filterProjectsDomain('vlsi');
  } else if (cleanHash === '#software' || domainParam === 'software') {
    if (window.filterProjectsDomain) window.filterProjectsDomain('software');
  } else if (cleanHash === '#cad' || domainParam === 'cad') {
    if (window.filterProjectsDomain) window.filterProjectsDomain('cad');
  } else if (cleanHash === '#robotic') {
    window.switchExpertiseTab('robotics', document.getElementById('expTabRobotics'));
  } else if (cleanHash === '#iot') {
    window.switchExpertiseTab('embedded', document.getElementById('expTabEmbedded'));
  } else if (cleanHash === '#embedded') {
    window.switchExpertiseTab('embedded', document.getElementById('expTabEmbedded'));
  } else if (cleanHash === '#aiml') {
    window.switchResearchTab('eso');
  } else if (cleanHash === '#research') {
    window.switchResearchTab('areas');
  } else if (cleanHash === '#project-details') {
    const projectId = params.get('id') || 'rescuebot';
    if (window.loadProjectDetails) window.loadProjectDetails(projectId);
  }


  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (cleanHash === '#expertise') {
    const activeBtn = document.querySelector('#skills-dashboard .filter-btn.active');
    const activeTab = activeBtn ? activeBtn.id.replace('expTab', '').toLowerCase() : 'electronics';
    setTimeout(() => {
      // Animate skill bars on initial navigation to expertise page
      const activePanel = document.getElementById(`exp-panel-${activeTab}`);
      if (activePanel) {
        activePanel.querySelectorAll('.skill-bar-fill').forEach(fill => {
          fill.style.width = '0%';
          void fill.offsetWidth;
          fill.style.width = fill.dataset.width + '%';
        });
      }
    }, 100);
  }
}

window.addEventListener('hashchange', navigateToPage);
window.addEventListener('load', () => {
  navigateToPage();
  setTimeout(() => {
    // Animate skill bars for default active panel
    const activePanel = document.getElementById('exp-panel-electronics');
    if (activePanel) {
      if (activePanel.style.display !== 'none') {
        activePanel.style.display = 'flex';
      }
      activePanel.querySelectorAll('.skill-bar-fill').forEach(fill => {
        fill.style.width = '0%';
        void fill.offsetWidth;
        setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, 100);
      });
    }
    // Set correct --panel-color on first active sidebar btn
    const firstNavBtn = document.getElementById('expTabElectronics');
    if (firstNavBtn) {
      const icon = firstNavBtn.querySelector('.exp-nav-icon');
      if (icon) firstNavBtn.style.setProperty('--panel-color', icon.style.color);
    }
  }, 200);
});

// Add event listener to all links for handling smooth transitions
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.startsWith('#')) {
      // Let routing hook handle the view state change
    }
  });
});

/* ── GITHUB API LIVE STATS ────────────────────────────────── */
async function loadGitHubStats() {
  try {
    const res = await fetch('https://api.github.com/users/Prolayjit-B14');
    if (!res.ok) return;
    const data = await res.json();
    const repoCount = data.public_repos;
    const followers = data.followers;

    // Update stat items if they show defaults
    const statNums = document.querySelectorAll('.stat-big-number[data-target]');
    statNums.forEach(el => {
      if (el.dataset.target === 'repos') {
        el.dataset.target = repoCount;
      }
    });
  } catch (e) { /* silently fail */ }
}
loadGitHubStats();

/* ── PROJECT CARD HOVER GLOW ──────────────────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0,212,255,0.06), rgba(255,255,255,0.03) 50%), rgba(255,255,255,0.03)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

/* ── DOMAIN CARD 3D TILT EFFECT ───────────────────────────── */
document.querySelectorAll('.domain-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateX = ((yc - y) / yc * 12).toFixed(1);
    const rotateY = ((x - xc) / xc * 12).toFixed(1);
    
    card.style.transition = 'none';
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0,229,255,0.08), rgba(255,255,255,0.02) 60%), rgba(255,255,255,0.03)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.4s ease, background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease';
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0)';
    card.style.background = '';
  });
});

/* ── TOAST NOTIFICATION ───────────────────────────────────── */
function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(60px);
    background:${type === 'success' ? '#10b981' : '#00d4ff'}; color:#000;
    padding:0.75rem 1.5rem; border-radius:50px; font-size:0.88rem; font-weight:700;
    z-index:9999; transition:transform 0.3s ease; white-space:nowrap;
    box-shadow:0 8px 30px rgba(0,0,0,0.3);
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(60px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ── RESUME BUTTON ────────────────────────────────────────── */
document.getElementById('resumeBtn').addEventListener('click', e => {
  e.preventDefault();
  showToast('📄 Resume coming soon! Email: prolayjitbiswas2004@gmail.com');
});

/* ── PROJECT SEARCH & 2-TIER FILTERS ───────────────────────── */
let currentDomainFilter = 'all';
let currentTagFilter = 'all';

window.applyProjectFilters = function() {
  const searchInput = document.getElementById('projectSearch');
  const searchQuery = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    const category = (card.dataset.category || '').toLowerCase();
    const tags = (card.dataset.tags || '').toLowerCase();
    const text = card.textContent.toLowerCase();

    // 1. Domain match
    const domainMatch = (currentDomainFilter === 'all') || category.includes(currentDomainFilter.toLowerCase());

    // 2. Tech Tag match
    const tagMatch = (currentTagFilter === 'all') || tags.includes(currentTagFilter.toLowerCase()) || category.includes(currentTagFilter.toLowerCase());

    // 3. Search query match
    const searchMatch = !searchQuery || text.includes(searchQuery) || category.includes(searchQuery) || tags.includes(searchQuery);

    const isVisible = domainMatch && tagMatch && searchMatch;
    card.style.display = isVisible ? '' : 'none';
    if (isVisible) card.style.animation = 'fadeIn 0.3s ease';
  });
};

window.filterProjectsDomain = function(domain, btn) {
  currentDomainFilter = domain || 'all';
  
  // Update domain tab buttons active state
  document.querySelectorAll('.domain-tab').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const targetBtn = document.querySelector(`.domain-tab[data-domain="${domain}"]`);
    if (targetBtn) targetBtn.classList.add('active');
  }

  window.applyProjectFilters();
};

window.filterProjectsTag = function(tag, btn) {
  currentTagFilter = tag || 'all';

  // Update tech tag chip buttons active state
  document.querySelectorAll('.tech-tag-chip').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const targetBtn = document.querySelector(`.tech-tag-chip[data-tag="${tag}"]`);
    if (targetBtn) targetBtn.classList.add('active');
  }

  window.applyProjectFilters();
};

window.searchProjects = function(query) {
  window.applyProjectFilters();
};

/* ── PROJECT SORTING ──────────────────────────────────────── */
window.sortProjects = function(sortBy) {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.project-card'));
  
  cards.sort((a, b) => {
    if (sortBy === 'newest') {
      const dateA = a.dataset.date || '';
      const dateB = b.dataset.date || '';
      return dateB.localeCompare(dateA); // Newest first
    } else if (sortBy === 'complexity') {
      const compA = parseInt(a.dataset.complexity) || 0;
      const compB = parseInt(b.dataset.complexity) || 0;
      return compB - compA; // Highest complexity first
    } else if (sortBy === 'domain') {
      const catA = (a.dataset.category || '').split(' ')[0] || '';
      const catB = (b.dataset.category || '').split(' ')[0] || '';
      return catA.localeCompare(catB); // Alphabetical category name
    }
    return 0;
  });
  
  // Re-append cards in sorted order
  cards.forEach(card => grid.appendChild(card));
};

/* ── GALLERY FILTER ───────────────────────────────────────── */
window.filterGallery = function(category, btn) {
  // Update active button
  document.querySelectorAll('#gallery .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.gallery-item').forEach(item => {
    const gal = item.dataset.gal;
    const show = category === 'all' || gal === category;
    item.style.display = show ? '' : 'none';
    if (show) item.style.animation = 'fadeIn 0.3s ease';
  });
};

/* ── GALLERY LIGHTBOX ─────────────────────────────────────── */
window.openLightbox = function(el) {
  const lightbox = document.getElementById('galleryLightbox');
  const content = document.getElementById('lightboxContent');
  if (!lightbox || !content) return;

  const title = el.querySelector('h4') ? el.querySelector('h4').textContent : '';
  const desc = el.querySelector('p:last-of-type') ? el.querySelector('p:last-of-type').textContent : '';
  const icon = el.querySelector('div[style*="font-size:3rem"]') ? el.querySelector('div[style*="font-size:3rem"]').textContent : '📷';
  const tag = el.querySelector('span[style*="font-family:var(--font-mono)"]') ? el.querySelector('span[style*="font-family:var(--font-mono)"]').textContent : '';

  content.innerHTML = `
    <div style="font-size:4rem;margin-bottom:1rem;">${icon.trim()}</div>
    <p style="font-size:0.72rem;color:var(--accent);font-family:var(--font-mono);margin-bottom:0.5rem;">${tag}</p>
    <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:0.75rem;">${title}</h3>
    <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.6;">${desc}</p>
  `;

  lightbox.style.display = 'flex';
  setTimeout(() => { lightbox.style.opacity = '1'; }, 10);
};

window.closeLightbox = function() {
  const lightbox = document.getElementById('galleryLightbox');
  if (lightbox) lightbox.style.display = 'none';
};

/* ── INTERACTIVE VLSI FLOW DATA & HANDLERS ───────────────── */
const vlsiStagesData = {
  rtl: {
    title: "1. RTL Design (HDL)",
    desc: `Implementing behavioral logic using Verilog HDL. Structuring registers, state machines, arithmetic blocks, and multiplexers.<br/><br/>
    <strong>Key Tools:</strong> Xilinx Vivado, VS Code, ModelSim compiler.<br/>
    <strong>Target:</strong> Writing synthesizable, race-condition free, clock-edge triggered logic blocks.`
  },
  sim: {
    title: "2. Functional Simulation",
    desc: `Verifying logical correctness by feeding stimuli through testbenches and analyzing output timing waveforms.<br/><br/>
    <strong>Key Tools:</strong> ModelSim, iVerilog, GTKWave viewer, Verilator.<br/>
    <strong>Target:</strong> 100% test coverage, checking corner-case inputs, and resolving race conditions prior to mapping.`
  },
  synth: {
    title: "3. Logic Synthesis",
    desc: `Translating high-level behavioral HDL description into a structural gate-level netlist using target technology cell libraries.<br/><br/>
    <strong>Key Tools:</strong> Yosys open-synthesis, Synopsys Design Compiler, Vivado Synthesizer.<br/>
    <strong>Target:</strong> Optimizing gate area, reducing leakage/dynamic power, and mapping logic gates correctly.`
  },
  netlist: {
    title: "4. Netlist Verification",
    desc: `Running Gate-Level Simulation (GLS) on the synthesized netlist to verify that logic compiler transformations did not introduce functional bugs.<br/><br/>
    <strong>Key Tools:</strong> ModelSim, Synopsys Formality (Equivalence Checking).<br/>
    <strong>Target:</strong> Checking gate propagation delays and matching behavioral model outputs exactly.`
  },
  floorplan: {
    title: "5. Floorplanning & Power Grid Design",
    desc: `Defining chip boundary sizes, placing input/output pads, creating macro blocks placements, and routing power rings/straps (VDD/GND).<br/><br/>
    <strong>Key Tools:</strong> Cadence Innovus, Synopsys IC Compiler II, OpenROAD.<br/>
    <strong>Target:</strong> Creating optimum macro spacing and establishing robust power distribution lines to prevent voltage drops.`
  },
  placement: {
    title: "6. Cell Placement",
    desc: `Placing standard technology cells (NAND, NOR, DFF) inside rows defined during the floorplanning phase. Coordinates cell positions to minimize wire lengths.<br/><br/>
    <strong>Key Tools:</strong> Cadence Innovus, OpenROAD RePlAce.<br/>
    <strong>Target:</strong> Mitigating cell density congestion issues and prepping paths to meet timing constraints.`
  },
  routing: {
    title: "7. Clock Tree Synthesis & Routing",
    desc: `Generating clock distribution networks (CTS) to ensure low clock skew, and routing signal wires between cells across metal layers.<br/><br/>
    <strong>Key Tools:</strong> Cadence Innovus, Synopsys ICC2, OpenROAD TritonRoute.<br/>
    <strong>Target:</strong> Eliminating setup/hold timing violations and routing signals without signal cross-talk.`
  },
  drc: {
    title: "8. Physical Verification (DRC & LVS)",
    desc: `Running Design Rule Checks (DRC) to ensure fab spacing compliance, and Layout vs. Schematic (LVS) to verify layout matching netlist circuits.<br/><br/>
    <strong>Key Tools:</strong> Siemens EDA Calibre, KLayout, Magic VLSI.<br/>
    <strong>Target:</strong> 100% verification matching logic netlist with zero physical design rule faults.`
  },
  gdsii: {
    title: "9. GDSII Layout Tapeout",
    desc: `Generating the binary GDSII layout database file containing lithography mask layouts for cleanroom silicon fabrication.<br/><br/>
    <strong>Key Tools:</strong> Cadence Innovus stream-out, KLayout, Magic VLSI.<br/>
    <strong>Target:</strong> Exporting error-free lithography mask layers for semiconductor manufacturing.`
  }
};

window.switchVlsiStage = function(stageName, btn) {
  const data = vlsiStagesData[stageName];
  if (!data) return;

  const container = document.getElementById('vlsiFlowContainer');
  if (container) {
    container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  }
  if (btn) btn.classList.add('active');

  const titleEl = document.getElementById('vlsiStageTitle');
  const descEl  = document.getElementById('vlsiStageDesc');
  if (titleEl) titleEl.textContent = data.title;
  if (descEl)  descEl.innerHTML = data.desc;
};

/* ── VERILOG CODE SELECTOR DATA & HANDLERS ────────────────── */
const verilogCodeData = {
  alu: {
    name: "alu.v",
    code: `// 4-bit ALU module implementation
module alu (
  input [3:0] A, B,
  input [2:0] Op,
  output reg [3:0] Out,
  output reg CarryOut
);
  always @(*) begin
    case(Op)
      3'b000: {CarryOut, Out} = A + B; // ADD
      3'b001: Out = A - B;             // SUB
      3'b010: Out = A & B;             // AND
      3'b011: Out = A | B;             // OR
      default: {CarryOut, Out} = 5'b00000;
    endcase
  end
endmodule`
  },
  fsm: {
    name: "traffic_light_fsm.v",
    code: `// Traffic Light Finite State Machine
module traffic_light_fsm (
  input clk, reset,
  input sensor,
  output reg [1:0] light // 00:Green, 01:Yellow, 10:Red
);
  parameter S0 = 2'b00, S1 = 2'b01, S2 = 2'b10;
  reg [1:0] state, next_state;

  always @(posedge clk or posedge reset) begin
    if (reset) state <= S0;
    else state <= next_state;
  end

  always @(*) begin
    case (state)
      S0: next_state = sensor ? S1 : S0;
      S1: next_state = S2;
      S2: next_state = S0;
      default: next_state = S0;
    endcase
  end

  always @(*) begin
    case (state)
      S0: light = 2'b00; // Green
      S1: light = 2'b01; // Yellow
      S2: light = 2'b10; // Red
      default: light = 2'b10;
    endcase
  end
endmodule`
  },
  uart: {
    name: "uart_tx.v",
    code: `// UART Transmitter (8-N-1 Serial Protocol)
module uart_tx (
  input clk, reset, tx_start,
  input [7:0] tx_data,
  output reg tx, tx_done
);
  parameter IDLE = 2'b00, START = 2'b01, DATA = 2'b10, STOP = 2'b11;
  reg [1:0] state, next_state;
  reg [3:0] bit_cnt;

  // Baud rate generator and bit controller state machine
  always @(posedge clk or posedge reset) begin
    if (reset) begin
      state <= IDLE;
      bit_cnt <= 0;
    end else begin
      state <= next_state;
    end
  end
  // UART transmission state transition logic omitted for brevity...
endmodule`
  },
  adder: {
    name: "ripple_carry_adder.v",
    code: `// 4-bit Structural Ripple Carry Adder
module ripple_carry_adder (
  input [3:0] A, B,
  input Cin,
  output [3:0] Sum,
  output Cout
);
  wire c1, c2, c3;

  full_adder fa0 (A[0], B[0], Cin, Sum[0], c1);
  full_adder fa1 (A[1], B[1], c1,  Sum[1], c2);
  full_adder fa2 (A[2], B[2], c2,  Sum[2], c3);
  full_adder fa3 (A[3], B[3], c3,  Sum[3], Cout);
endmodule

module full_adder (
  input a, b, cin,
  output sum, cout
);
  assign sum = a ^ b ^ cin;
  assign cout = (a & b) | (b & cin) | (a & cin);
endmodule`
  },
  full_adder: {
    name: "full_adder.v",
    code: `// 1-Bit Full Adder
module full_adder (
  input A, B, Cin,
  output Sum, Cout
);
  assign Sum  = A ^ B ^ Cin;
  assign Cout = (A & B) | (B & Cin) | (A & Cin);
endmodule`
  },
  barrel: {
    name: "barrel_shifter_8bit.v",
    code: `// 8-bit Combinational Barrel Shifter
module barrel_shifter_8bit (
  input [7:0] in,
  input [2:0] shift,
  input lr, // 0: Left, 1: Right
  output reg [7:0] out
);
  always @(*) begin
    if (lr == 1'b0)
      out = in << shift;
    else
      out = in >> shift;
  end
endmodule`
  },
  ff: {
    name: "d_ff.v",
    code: `// Edge-Triggered D Flip-Flop with Asynchronous Reset
module d_ff (
  input clk, reset, d,
  output reg q
);
  always @(posedge clk or posedge reset) begin
    if (reset)
      q <= 1'b0;
    else
      q <= d;
  end
endmodule`
  },
  counter: {
    name: "sync_counter_4bit.v",
    code: `// 4-bit Synchronous Up Counter
module sync_counter_4bit (
  input clk, reset, enable,
  output reg [3:0] count
);
  always @(posedge clk or posedge reset) begin
    if (reset)
      count <= 4'b0000;
    else if (enable)
      count <= count + 1'b1;
  end
endmodule`
  },
  shift_reg: {
    name: "universal_shift_reg.v",
    code: `// 4-bit Universal Shift Register
module universal_shift_reg (
  input clk, reset,
  input [1:0] mode, // 00: Hold, 01: Shift Right, 10: Shift Left, 11: Load
  input [3:0] d_in,
  input s_in_r, s_in_l, // Serial inputs
  output reg [3:0] q_out
);
  always @(posedge clk or posedge reset) begin
    if (reset)
      q_out <= 4'b0000;
    else begin
      case(mode)
        2'b00: q_out <= q_out;
        2'b01: q_out <= {s_in_r, q_out[3:1]}; // Shift Right
        2'b10: q_out <= {q_out[2:0], s_in_l}; // Shift Left
        2'b11: q_out <= d_in;                // Parallel Load
      endcase
    end
  end
endmodule`
  },
  mux: {
    name: "mux_4to1.v",
    code: `// 4-to-1 Multiplexer
module mux_4to1 (
  input [3:0] in,
  input [1:0] sel,
  output reg out
);
  always @(*) begin
    case(sel)
      2'b00: out = in[0];
      2'b01: out = in[1];
      2'b10: out = in[2];
      2'b11: out = in[3];
      default: out = 1'b0;
    endcase
  end
endmodule`
  },
  vending: {
    name: "vending_machine_fsm.v",
    code: `// Vending Machine Controller FSM
// Accepts Nickels (5c) and Dimes (10c) to dispense 15c item
module vending_machine_fsm (
  input clk, reset,
  input coin_5, coin_10,
  output reg dispense
);
  parameter S_0c  = 2'b00, S_5c  = 2'b01, S_10c = 2'b10, S_15c = 2'b11;
  reg [1:0] state, next_state;

  always @(posedge clk or posedge reset) begin
    if (reset) state <= S_0c;
    else state <= next_state;
  end

  always @(*) begin
    case(state)
      S_0c:  next_state = coin_10 ? S_10c : (coin_5 ? S_5c : S_0c);
      S_5c:  next_state = coin_10 ? S_15c : (coin_5 ? S_10c : S_5c);
      S_10c: next_state = (coin_5 || coin_10) ? S_15c : S_10c;
      S_15c: next_state = S_0c; // Reset after dispensing
      default: next_state = S_0c;
    endcase
  end

  always @(*) begin
    dispense = (state == S_15c);
  end
endmodule`
  },
  seq_det: {
    name: "sequence_detector_1011.v",
    code: `// Moore 1011 Sequence Detector (Overlapping)
module sequence_detector_1011 (
  input clk, reset, x_in,
  output reg z_out
);
  parameter S_RESET = 3'b000, S_1 = 3'b001, S_10 = 3'b010, S_101 = 3'b011, S_1011 = 3'b100;
  reg [2:0] state, next_state;

  always @(posedge clk or posedge reset) begin
    if (reset) state <= S_RESET;
    else state <= next_state;
  end

  always @(*) begin
    case(state)
      S_RESET: next_state = x_in ? S_1 : S_RESET;
      S_1:     next_state = x_in ? S_1 : S_10;
      S_10:    next_state = x_in ? S_101 : S_RESET;
      S_101:   next_state = x_in ? S_1011 : S_10;
      S_1011:  next_state = x_in ? S_1 : S_10;
      default: next_state = S_RESET;
    endcase
  end

  always @(*) begin
    z_out = (state == S_1011);
  end
endmodule`
  }
};
window.switchVerilogCode = function(moduleName, btn) {
  const data = verilogCodeData[moduleName];
  if (!data) return;

  // Update active state of buttons
  const buttons = document.querySelectorAll('[id^="btnVerilog"]');
  buttons.forEach(b => {
    b.style.borderColor = 'var(--border)';
  });
  if (btn) btn.style.borderColor = 'var(--accent-dim)';

  const nameEl = document.getElementById('verilogCodeName');
  const boxEl  = document.getElementById('verilogCodeBox');
  if (nameEl) nameEl.textContent = data.name;
  if (boxEl)  boxEl.textContent  = data.code;
};

window.copyVerilogCode = function() {
  const boxEl = document.getElementById('verilogCodeBox');
  if (!boxEl) return;
  navigator.clipboard.writeText(boxEl.textContent).then(() => {
    showToast('📋 Verilog code copied to clipboard!', 'success');
  }).catch(() => {
    showToast('❌ Failed to copy code.');
  });
};

/* ── CAD & 3D SIMULATOR DATA & HANDLERS ───────────────────── */
const cadModelsData = {
  wearable: {
    title: "Wrist Wearable Case",
    desc: "An ergonomic wristwatch enclosure designed specifically for the Women Safety Wearable. It accommodates a custom PCB, micro-USB charging port, panic button, buzzer, and rechargeable LiPo cell.",
    dim: "46 x 42 x 16 mm",
    wall: "1.6 mm (Solid)",
    fit: "M2 Self-Tapping",
    infill: "30% Gyroid",
    time: "1h 45m",
    mat: "PETG (Flexibility & Temp)",
    layers: ["TOP ENCLOSURE LID", "CUSTOM FR4 PCB", "LIPO BATTERY 3.7V", "BASE HOUSING"]
  },
  rover: {
    title: "RescueBOT Chassis Assembly",
    desc: "Heavy-duty chassis mounts designed for high durability disaster environments. Optimized for thermal dissipation from L298N drivers and mechanical stress resilience during 1m drops.",
    dim: "180 x 120 x 85 mm",
    wall: "2.4 mm (Structural)",
    fit: "M3 Machine Screws",
    infill: "50% Grid",
    time: "4h 20m",
    mat: "PLA / PETG Mix",
    layers: ["ROVER TOP COVER", "ESP32 & SERVO MOUNTS", "BATTERY COMPARTMENT", "ALUMINUM BASE CHASSIS"]
  }
};

let currentCadModel = 'wearable';

window.selectCadModel = function(modelName) {
  currentCadModel = modelName;
  const data = cadModelsData[modelName];
  if (!data) return;

  // Toggle button active classes
  const btnWearable = document.getElementById('btnCadWearable');
  const btnRover = document.getElementById('btnCadRover');
  if (modelName === 'wearable') {
    if (btnWearable) btnWearable.classList.add('active');
    if (btnRover) btnRover.classList.remove('active');
  } else {
    if (btnWearable) btnWearable.classList.remove('active');
    if (btnRover) btnRover.classList.add('active');
  }

  // Update text values
  const titleEl = document.getElementById('cadModelTitle');
  const descEl = document.getElementById('cadModelDesc');
  const dimEl = document.getElementById('cadSpecDim');
  const wallEl = document.getElementById('cadSpecWall');
  const fitEl = document.getElementById('cadSpecFit');
  const infillEl = document.getElementById('cadSpecInfill');
  const timeEl = document.getElementById('cadSpecTime');
  const matEl = document.getElementById('cadSpecMat');

  if (titleEl) titleEl.textContent = data.title;
  if (descEl) descEl.textContent = data.desc;
  if (dimEl) dimEl.textContent = data.dim;
  if (wallEl) wallEl.textContent = data.wall;
  if (fitEl) fitEl.textContent = data.fit;
  if (infillEl) infillEl.textContent = data.infill;
  if (timeEl) timeEl.textContent = data.time;
  if (matEl) matEl.textContent = data.mat;

  // Update visual layer texts
  const lidEl = document.getElementById('cadLayerLid');
  const pcbEl = document.getElementById('cadLayerPcb');
  const batEl = document.getElementById('cadLayerBat');
  const baseEl = document.getElementById('cadLayerBase');

  if (lidEl) lidEl.textContent = data.layers[0];
  if (pcbEl) pcbEl.textContent = data.layers[1];
  if (batEl) batEl.textContent = data.layers[2];
  if (baseEl) baseEl.textContent = data.layers[3];

  // Reset slider
  const slider = document.getElementById('cadExplodeSlider');
  if (slider) {
    slider.value = 0;
    window.updateExplodeView(0);
  }
};

window.updateExplodeView = function(value) {
  const val = parseFloat(value);
  const lidEl = document.getElementById('cadLayerLid');
  const pcbEl = document.getElementById('cadLayerPcb');
  const batEl = document.getElementById('cadLayerBat');
  const baseEl = document.getElementById('cadLayerBase');

  if (lidEl) lidEl.style.transform = `rotateX(55deg) rotateZ(-45deg) translateZ(${60 + val * 1.0}px)`;
  if (pcbEl) pcbEl.style.transform = `rotateX(55deg) rotateZ(-45deg) translateZ(${20 + val * 0.3}px)`;
  if (batEl) batEl.style.transform = `rotateX(55deg) rotateZ(-45deg) translateZ(${-10 + val * -0.2}px)`;
  if (baseEl) baseEl.style.transform = `rotateX(55deg) rotateZ(-45deg) translateZ(${-50 + val * -0.8}px)`;
};

/* ── RESUME MOCK PDF PAGE SWITCHER ────────────────────────── */
let currentResumePage = 1;

window.changeResumePage = function(direction) {
  const page1 = document.getElementById('resumePdfPage1');
  const page2 = document.getElementById('resumePdfPage2');
  const indicator = document.getElementById('resumePageIndicator');

  if (direction === 1 && currentResumePage === 1) {
    currentResumePage = 2;
  } else if (direction === -1 && currentResumePage === 2) {
    currentResumePage = 1;
  }

  if (page1 && page2 && indicator) {
    if (currentResumePage === 1) {
      page1.style.display = 'block';
      page2.style.display = 'none';
      indicator.textContent = 'Page 1 / 2';
    } else {
      page1.style.display = 'none';
      page2.style.display = 'block';
      indicator.textContent = 'Page 2 / 2';
    }
  }
};

const componentWallData = {
  esp32: {
    title: "ESP32 MCU Module (Espressif Systems)",
    desc: `<strong>Core Specs:</strong> Dual-core Tensilica LX6 @ 240MHz, 520KB SRAM, Integrated Wi-Fi & Bluetooth BLE.<br/>
    <strong>Pin Integrations:</strong> GPIOs for PWM motor controls, SPI bus for SD cards, and hardware UART for GPS/GSM interfaces.<br/>
    <strong>System Role:</strong> Serves as the primary coordinator for RescueBOT and Krishi Setu, handling web server broadcasting, local ML pose parsing, and RF multiplexing.`
  },
  lora: {
    title: "LoRa SX1278 Transceiver (Semtech)",
    desc: `<strong>Core Specs:</strong> Frequency range 433MHz, Sensitivity down to -148dBm, SPI host interface, low current sleep (100nA).<br/>
    <strong>Pin Integrations:</strong> SPI bus (MISO, MOSI, SCK, NSS), DIO0 interrupt pin for packet-received callbacks.<br/>
    <strong>System Role:</strong> Established long-range communication links (>1km) in RescueBOT and agricultural setups, ensuring reliable data packets through rubble.`
  },
  sim800l: {
    title: "SIM800L GSM/GPRS Module",
    desc: `<strong>Core Specs:</strong> Quad-band 850/900/1800/1900MHz, GPRS class 12, UART serial control interface, 3.4V-4.4V power supply.<br/>
    <strong>Pin Integrations:</strong> Hardware/Software Serial RX/TX, Ring Indicator pin to catch incoming calls.<br/>
    <strong>System Role:</strong> Integrated into the Women Safety Wearable to transmit silent alarm SMS messages and dial warning numbers without cellphone synchronization.`
  },
  neo6m: {
    title: "NEO-6M GPS Receiver (u-blox)",
    desc: `<strong>Core Specs:</strong> 50-channel tracking engine, Update rate 1Hz-5Hz, EEPROM for data saving, UART interface (9600 baud).<br/>
    <strong>Pin Integrations:</strong> Serial TX/RX pins, PPS pulse-per-second pin for microsecond timing synchronization.<br/>
    <strong>System Role:</strong> Extracted real-time coordinates, speed vectors, and satellite timing for the Women Safety Device and autonomous RescueBOT mapping loops.`
  },
  l298n: {
    title: "L298N Dual H-Bridge Motor Driver",
    desc: `<strong>Core Specs:</strong> Operating voltage up to 46V, Output current 2A continuous per channel, onboard 5V regulator logic supply.<br/>
    <strong>Pin Integrations:</strong> IN1-IN4 logic control pins, ENA/ENB analog PWM speed pins, GND reference coupling.<br/>
    <strong>System Role:</strong> Controlled 4 high-torque DC gear motors on the RescueBOT chassis, adjusting speed and direction commands from the Arduino Nano.`
  },
  adxl345: {
    title: "ADXL345 3-Axis Digital Accelerometer",
    desc: `<strong>Core Specs:</strong> Resolution up to 13-bit, measurement range up to ±16g, I2C/SPI digital output interface, low power (23uA in measurement).<br/>
    <strong>Pin Integrations:</strong> I2C interface pins (SDA, SCL), INT1 interrupt pin bound to activity thresholds.<br/>
    <strong>System Role:</strong> Utilized in the Women Safety Wearable to monitor sudden deceleration vectors, triggering emergency warnings on fall events.`
  },
  dht22: {
    title: "DHT22 Temperature & Humidity Sensor",
    desc: `<strong>Core Specs:</strong> Temperature range -40 to 80°C (±0.5°C), Humidity range 0-100% (±2%), 1-Wire proprietary serial interface.<br/>
    <strong>Pin Integrations:</strong> Single digital data bus pin pulled high with a 10K resistor, VCC, GND.<br/>
    <strong>System Role:</strong> Gathered environmental parameters in the RescueBOT search zone and local Krishi Setu soil environment chambers.`
  },
  mq135: {
    title: "MQ-135 Hazardous Gas Sensor",
    desc: `<strong>Core Specs:</strong> Detects NH3, NOx, Alcohol, Benzene, Smoke, CO2. Analog voltage output proportional to concentration, heater current 150mA.<br/>
    <strong>Pin Integrations:</strong> Analog input channel (ADC), digital comparison toggle pin, VCC, GND.<br/>
    <strong>System Role:</strong> Monitored air toxicity inside disaster rubble, raising visual threshold alarms on the dashboard when gas leaks are detected.`
  },
  nrf24l01: {
    title: "nRF24L01+ 2.4GHz RF Transceiver",
    desc: `<strong>Core Specs:</strong> 2.4GHz ISM band operation, 250kbps to 2Mbps data rate, ultra-low power ShockBurst™ engine, 11.3mA TX / 13.5mA RX peak current.<br/>
    <strong>Pin Integrations:</strong> SPI bus interface (CSN, SCK, MISO, MOSI) plus CE (Chip Enable) control pin and IRQ interrupt pin.<br/>
    <strong>System Role:</strong> Handles low-latency local telemetry transmissions (up to 100m) in the RescueBOT system as a fast backup link for manual controls.`
  },
  hcsr04: {
    title: "HC-SR04 Ultrasonic Distance Sensor",
    desc: `<strong>Core Specs:</strong> Supply voltage 5V DC, operating range 2cm to 400cm, resolution 3mm, measuring angle 15 degrees.<br/>
    <strong>Pin Integrations:</strong> Trigger Input (10us TTL pulse trigger) and Echo Output (TTL pulse width proportional to distance).<br/>
    <strong>System Role:</strong> Standard distance detector on the Smart Blind Stick and RescueBOT bumpers to prevent forward collision events dynamically.`
  },
  nrf52: {
    title: "nRF52840 Bluetooth 5.4 SoC (Nordic Semiconductor)",
    desc: `<strong>Core Specs:</strong> 32-bit ARM Cortex-M4 @ 64MHz, 1MB Flash, 256KB RAM, Bluetooth Low Energy, Zigbee, Thread support, NFC-A tag.<br/>
    <strong>Pin Integrations:</strong> High-speed SPI, QSPI, hardware USB, PWM channels, and multi-channel 12-bit ADC.<br/>
    <strong>System Role:</strong> Advanced research platform node for next-generation safety wearables, supporting low-power BLE mesh broadcasting without gateways.`
  },
  mpu6050: {
    title: "MPU-6050 6-Axis Motion Tracking IMU",
    desc: `<strong>Core Specs:</strong> Integrated 3-axis gyroscope, 3-axis accelerometer, onboard Digital Motion Processor (DMP) resolving 6-axis algorithms.<br/>
    <strong>Pin Integrations:</strong> I2C interface pins (SDA, SCL), INT interrupt pin to trigger threshold alarm interrupts.<br/>
    <strong>System Role:</strong> Provides real-time inclination angles and movement acceleration logs in RescueBOT and safety systems to trigger fall detection alerts.`
  },
  servos: {
    title: "SG90 & MG996R Servo Motors",
    desc: `<strong>Core Specs:</strong> Operating voltage 4.8V-6V, Stall torque 1.8 kg-cm (SG90) to 11 kg-cm (MG996R), 180-degree rotation angle.<br/>
    <strong>Pin Integrations:</strong> Single wire PWM signal control (50Hz frequency, 1ms to 2ms pulse width for angle mapping), VCC, GND.<br/>
    <strong>System Role:</strong> Actuates the joints of the 4-DOF Robotic Gripper Arm and camera tilt assemblies on RescueBOT.`
  },
  relay: {
    title: "Relay Controller Module (Optocoupler Isolated)",
    desc: `<strong>Core Specs:</strong> Control input 5V, contacts rated for 10A @ 250V AC / 30V DC, onboard optocoupler isolation protecting the MCU.<br/>
    <strong>Pin Integrations:</strong> IN control pin (active low/high), VCC, GND, and screw terminals for Normally Open (NO) / Normally Closed (NC) load lines.<br/>
    <strong>System Role:</strong> Power gates the high-power water pumps and high-voltage self-defense circuits on agricultural and safety wearables.`
  }
};

window.showComponentDetail = function(compName, btn) {
  const data = componentWallData[compName];
  if (!data) return;

  const grid = document.getElementById('componentWallGrid');
  if (grid) {
    grid.querySelectorAll('.component-chip').forEach(b => {
      b.style.borderColor = 'rgba(0,212,255,0.15)';
    });
  }
  if (btn) btn.style.borderColor = 'var(--accent)';

  const titleEl = document.getElementById('compDetailTitle');
  const descEl  = document.getElementById('compDetailDesc');
  if (titleEl) titleEl.textContent = data.title;
  if (descEl)  descEl.innerHTML = data.desc;
};

/* ── RESEARCH SUB-TAB HANDLERS ────────────────────────────── */
window.switchResearchTab = function(tabName, btn) {
  const container = document.getElementById('page-research');
  if (!container) return;
  const buttons = container.querySelectorAll('.filter-btn');
  buttons.forEach(b => b.classList.remove('active'));
  
  if (btn) {
    btn.classList.add('active');
  } else {
    const targetBtn = Array.from(buttons).find(b => b.getAttribute('onclick')?.includes(tabName));
    if (targetBtn) targetBtn.classList.add('active');
  }
  
  const panels = container.querySelectorAll('.research-tab-panel');
  panels.forEach(p => {
    p.style.display = p.id === `res-panel-${tabName}` ? 'block' : 'none';
  });
};

/* ── CERTIFICATES FILTER ──────────────────────────────────── */
window.filterCertificates = function(category, btn) {
  const buttons = document.querySelectorAll('#certificates-page .filter-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  const cards = document.querySelectorAll('#certificates-page .cert-card');
  cards.forEach(card => {
    const cat = card.dataset.certCat || '';
    if (category === 'all' || cat === category) {
      card.style.display = '';
      card.style.animation = 'fadeIn 0.3s ease';
    } else {
      card.style.display = 'none';
    }
  });
};

/* ── BLOG POSTS DATA & READER ──────────────────────────────── */
const blogPostsData = {
  'raw-first-year': {
    tag: 'Personal & Journey',
    title: 'My Raw First Year in Engineering',
    meta: 'Published: June 2025 · Reading Time: 12 mins · By Prolayjit Biswas',
    content: `<p>My first year as an Electronics Engineering student at MAKAUT has been a whirlwind of late nights, caffeine, code compilers, and circuit boards. Entering college, I was eager to build, but I didn't expect the intense pace that followed. Over the course of two semesters, I competed in 10 student hackathons, winning twice and reaching several finals.</p>
    <p>Managing this workload alongside class schedules was a major challenge. However, the pressure pushed me to improve my skills. I went from coding basic Arduino loops to designing synthesizable Verilog modules and routing 4-layer high-frequency PCBs in KiCad.</p>
    <p>Academically, I stayed focused, finishing the year with a 9.41 YGPA and topping my department in Semester II with a 9.63 SGPA. This first year taught me that the best way to learn engineering is to build, break, and validate things in the real world.</p>
    <p>Looking ahead to Year 2, I'm focusing on chip architectures (VLSI) and Edge AI. The journey has just begun!</p>`
  },
  'lora-esp32': {
    tag: 'Wireless Comms',
    title: 'Setting Up LoRa SX1278 with ESP32',
    meta: 'Status: Draft · Expected: July 2025 · By Prolayjit Biswas',
    content: `<p>LoRa (Long Range) technology is a game-changer for low-power IoT telemetry. In this article, I will walk through setting up the Semtech SX1278 transceiver with an ESP32 microcontroller using Arduino C++.</p>
    <h4>Wiring Connections:</h4>
    <pre style="background:rgba(0,0,0,0.2); padding:1rem; border-radius:4px; font-family:var(--font-mono); font-size:0.8rem; overflow-x:auto;">
SX1278 Pin  -->  ESP32 GPIO
VCC         -->  3.3V
GND         -->  GND
SCK         -->  GPIO 18
MISO        -->  GPIO 19
MOSI        -->  GPIO 23
NSS (CS)    -->  GPIO 5
RST         -->  GPIO 14
DIO0 (IRQ)  -->  GPIO 2
    </pre>
    <p>In our field tests for the RescueBOT project, we achieved a reliable line-of-sight transmission range of over 1.1km using a simple spring antenna, with an average signal-to-noise ratio (SNR) of +7dB.</p>`
  },
  'pcb-routing': {
    tag: 'PCB Design',
    title: 'Routing My First 4-Layer PCB in KiCAD',
    meta: 'Status: Draft · Expected: July 2025 · By Prolayjit Biswas',
    content: `<p>Moving from double-sided boards to 4-layer PCBs allows for much better signal integrity and compact routing. Here are the core guidelines I followed when routing the motherboard for our wearable safety tracker:</p>
    <ol style="margin-left: 1.5rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
      <li><strong>Stackup Selection:</strong> Signal - Ground Plane - Power Plane - Signal. This ensures every high-speed signal trace has an adjacent return path, minimizing loop inductance.</li>
      <li><strong>Decoupling Capacitors:</strong> Place 0.1uF ceramic capacitors as close as possible to the VCC pins of the microcontroller to filter out high-frequency switching noise.</li>
      <li><strong>Impedance Control:</strong> For the GPS and GSM antenna tracks, calculate trace widths to match 50-ohm characteristic impedance using KiCad's Calculator tool.</li>
    </ol>`
  },
  'sargamai-ai': {
    tag: 'AI & Software',
    title: 'Building Sargam AI — Gemini AI for Indian Classical Music',
    meta: 'Status: Planned · Expected: August 2025 · By Prolayjit Biswas',
    content: `<p>Sargam is an educational AI assistant that analyzes Indian Classical Music structures. Developed for the Google Solution Challenge 2025, it utilizes Gemini 2.5 Flash API to parse vocal waveforms and identify ragas and talas.</p>
    <p>By capturing short audio snippets through a Web Audio API recorder, the client sends base64 PCM data to our backend. The backend constructs a structured prompt instructing the model to compare the frequency transitions against historical swara sequences, returning a raga breakdown.</p>
    <p>The system was recognized in the top 105 projects in India, validating the potential of generative AI in music education.</p>`
  },
  'fpga-accelerators': {
    tag: 'VLSI & FPGA',
    title: 'Designing Low-Power FPGA Accelerators for Edge AI Models',
    meta: 'Published: August 2026 · Reading Time: 5 mins · By Prolayjit Biswas',
    content: `<p>Deploying deep neural networks on edge devices presents significant power and throughput challenges. In this article, I explore microarchitecture optimization, clock domain crossing, and pipelining techniques for TinyML inference on Xilinx FPGAs using Verilog and Vivado.</p>
    <h4>Key Architecture Takeaways:</h4>
    <ol style="margin-left: 1.5rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
      <li><strong>Fixed-Point Quantization:</strong> Converting 32-bit floating-point weights into INT8/INT4 reduces DSP block consumption by over 60% without significant accuracy loss.</li>
      <li><strong>Systolic Array Processing:</strong> Pipelined multiply-accumulate (MAC) units maximize clock frequency while reducing global routing congestion.</li>
      <li><strong>AXI-Stream DMA Integration:</strong> High-bandwidth DMA streaming transfers enable real-time camera feed processing with minimal CPU overhead.</li>
    </ol>`
  },
  'esp32-telemetry': {
    tag: 'Embedded & IoT',
    title: 'Building Real-Time Telemetry Systems with ESP32 & WebSockets',
    meta: 'Published: July 2026 · Reading Time: 7 mins · By Prolayjit Biswas',
    content: `<p>A deep dive into constructing high-frequency, low-latency telemetry pipelines for field robotics and IoT monitoring devices using ESP32, FreeRTOS, and WebSockets.</p>
    <h4>Pipeline Architecture:</h4>
    <p>Using dual-core ESP32 processors, Core 0 is dedicated to handling network buffers and WebSocket frame dispatch, while Core 1 executes deterministic sensor reading loops via FreeRTOS priority queues.</p>
    <p>Combined with a lightweight Node.js/Next.js dashboard frontend, latency dropped below 45ms over local Wi-Fi, making remote robotic rover control feel instant and responsive.</p>`
  },
  'tcad-cmos': {
    tag: 'Semiconductors & TCAD',
    title: 'From Schematic to Silicon: CMOS Logic Simulation in TCAD',
    meta: 'Published: June 2026 · Reading Time: 6 mins · By Prolayjit Biswas',
    content: `<p>Understanding transistor behavior beyond idealized BSIM models requires deep semiconductor physics simulation. In this study, I examine MOSFET gate oxide capacitance, short-channel effects, and subthreshold leakage using Silvaco TCAD.</p>
    <h4>Physical Simulations:</h4>
    <p>By simulating 2D doping profiles and electrical field distributions under varying gate biases, we observed the precise onset of Drain-Induced Barrier Lowering (DIBL) and threshold voltage roll-off in sub-45nm gate lengths.</p>`
  }
};

window.readPost = function(postId) {
  const post = blogPostsData[postId];
  if (!post) return;

  const listView = document.getElementById('blogListView');
  const readerView = document.getElementById('blogPostReader');
  if (listView && readerView) {
    listView.style.display = 'none';
    readerView.style.display = 'block';
  }

  const tagEl = document.getElementById('postTag');
  const titleEl = document.getElementById('postTitle');
  const metaEl = document.getElementById('postMeta');
  const contentEl = document.getElementById('postContent');

  if (tagEl) tagEl.textContent = post.tag;
  if (titleEl) titleEl.textContent = post.title;
  if (metaEl) metaEl.textContent = post.meta;
  if (contentEl) contentEl.innerHTML = post.content;

  const section = document.getElementById('blogs');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
};

window.backToBlogList = function() {
  const listView = document.getElementById('blogListView');
  const readerView = document.getElementById('blogPostReader');
  if (listView && readerView) {
    listView.style.display = 'block';
    readerView.style.display = 'none';
  }
};

window.filterBlog = function(category, btn) {
  const container = document.getElementById('blogs');
  if (container) {
    container.querySelectorAll('.project-filters .filter-btn').forEach(b => {
      b.classList.remove('active');
    });
  }
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('#blogsGrid .blog-card');
  cards.forEach(card => {
    const cat = card.dataset.blogCat || '';
    if (category === 'all' || cat === category) {
      card.style.display = '';
      card.style.animation = 'fadeIn 0.3s ease';
    } else {
      card.style.display = 'none';
    }
  });
};

/* ── CONTACT MODE & FORM ADJUSTMENTS ────────────────────── */
window.switchContactMode = function(mode, btn) {
  const formWrapper = document.getElementById('contactFormWrapper');
  if (!formWrapper) return;

  const buttons = formWrapper.querySelectorAll('.filter-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const formTitle = document.getElementById('formTitle');
  const projectFields = document.getElementById('projectFields');
  const subjectField = document.getElementById('subjectField');

  if (mode === 'project') {
    if (formTitle) formTitle.textContent = 'Start a Project Inquiry';
    if (projectFields) projectFields.style.display = 'flex';
    if (subjectField) subjectField.style.display = 'none';
  } else {
    if (formTitle) formTitle.textContent = 'Send a Message';
    if (projectFields) projectFields.style.display = 'none';
    if (subjectField) subjectField.style.display = 'flex';
  }
};

/* ── TERMINAL PING SIMULATOR ──────────────────────────────── */
window.handleTerminalCommand = function(event) {
  if (event.key !== 'Enter') return;
  const inputEl = document.getElementById('terminalInput');
  const cmd = inputEl.value.trim().toLowerCase();
  inputEl.value = '';

  const bodyEl = document.getElementById('terminalBody');
  if (!bodyEl) return;

  const userLine = document.createElement('div');
  userLine.innerHTML = `<span style="color: var(--accent);">prolayjit@makaut-edge:~$</span> ${cmd}`;
  bodyEl.appendChild(userLine);

  if (cmd === 'clear') {
    bodyEl.innerHTML = '';
    return;
  }

  const outputDiv = document.createElement('div');
  outputDiv.style.color = '#fff';
  outputDiv.style.whiteSpace = 'pre-line';

  switch (cmd) {
    case 'help':
      outputDiv.innerHTML = `Available commands:
      <span style="color:var(--accent);">ping</span>        - Ping remote ESP32 edge node
      <span style="color:var(--accent);">about</span>       - Print bio overview
      <span style="color:var(--accent);">projects</span>    - List core systems
      <span style="color:var(--accent);">stats</span>       - Display performance stats
      <span style="color:var(--accent);">education</span>   - Show academic info
      <span style="color:var(--accent);">contact</span>     - Display email and socials
      <span style="color:var(--accent);">clear</span>       - Clear terminal window`;
      break;
    case 'ping':
      outputDiv.innerHTML = `PING makaut-edge.prolayjit.dev (192.168.1.104) 56(84) bytes of data.
      64 bytes from 192.168.1.104: icmp_seq=1 ttl=64 time=12.4 ms
      64 bytes from 192.168.1.104: icmp_seq=2 ttl=64 time=8.1 ms
      64 bytes from 192.168.1.104: icmp_seq=3 ttl=64 time=15.2 ms
      --- makaut-edge.prolayjit.dev ping statistics ---
      3 packets transmitted, 3 received, 0% packet loss, time 2003ms
      rtt min/avg/max/mdev = 8.1/11.9/15.2/2.9 ms`;
      break;
    case 'about':
      outputDiv.innerHTML = `Prolayjit Biswas - Multidisciplinary Engineer specializing in VLSI.
      Hardware Lead, IoT Developer, PCB Designer. Winner of MAKATHON '25.
      Passionate about bridging silicon RTL design with physical board layouts and edge computing.`;
      break;
    case 'projects':
      outputDiv.innerHTML = `- RescueBOT Rover: IoT Disaster Response Telemetry Rover
      - Krishi Setu: Smart Soil Sensing & Edge AI Advisor
      - Women Safety Wearable: GPS/GSM Alert Tracker (MAKATHON '25 Winner)
      - Sargam AI: Indian Classical Musicology Platform (Google SC Top 105)`;
      break;
    case 'stats':
      outputDiv.innerHTML = `🏆 Hackathon Wins: 2
      ⚡ Hackathons Competed: 10
      📁 GitHub Repos: 20+
      💼 LinkedIn Followers: 5000+
      📈 YGPA: 9.41`;
      break;
    case 'education':
      outputDiv.innerHTML = `Degree: B.Tech in Electronics Engineering (VLSI Specialization)
      Institution: Maulana Abul Kalam Azad University of Technology (MAKAUT)
      Location: West Bengal, India · Batch: 2024 - 2028
      YGPA: 9.41 (Sem I: 9.20, Sem II: 9.63 Department Topper)`;
      break;
    case 'contact':
      outputDiv.innerHTML = `Email: prolayjitbiswas2004@gmail.com
      LinkedIn: linkedin.com/in/prolayjit-biswas
      GitHub: github.com/Prolayjit-B14
      X/Twitter: twitter.com/pro_lay04`;
      break;
    default:
      outputDiv.innerHTML = `Command not found: "${cmd}". Type <span style="color:var(--accent);">help</span> for options.`;
  }

  bodyEl.appendChild(outputDiv);
  bodyEl.scrollTop = bodyEl.scrollHeight;
};

/* ── DYNAMIC PROJECT DETAILS DATA & POPULATOR ─────────────── */
const projectDetailsData = {
  rescuebot: {
    title: "RescueBOT Multi-Disaster Response Rover",
    subtitle: "Robotics & IoT · Self-Directed · 2024–Present",
    gitLink: "https://github.com/Prolayjit-B14/RescueBOT",
    liveLink: "",
    tags: ["ESP32", "LoRa SX1278", "ESP32-CAM", "Robotics ARM", "Arduino", "KiCad"],
    stats: {
      "Form Factor": "220x180mm Chassis",
      "Wireless Range": ">1km Line-of-Sight",
      "Power Grid": "12V Li-ion (3S)",
      "DOF Arm": "4-Degrees-of-Freedom"
    },
    overview: "RescueBOT is a rugged, dual-MCU wireless response rover designed for search-and-rescue operations in collapsed structures. Combining remote camera navigation with environmental monitoring sensors, it provides rescuers with a virtual presence in hazardous areas.",
    problem: "Natural disasters and industrial accidents leave survivors trapped in structural voids that are unsafe for human rescue teams. Immediate detection of gas leaks, fire risks, and survivor locations is critical but hampered by signal degradation in reinforced concrete structures.",
    objectives: "1. Establish a redundant wireless transmission link capable of penetrating rubble.\n2. Design a mobile rover with multi-terrain capability and servo-actuated debris clearing.\n3. Integrate real-time gas, temperature, and visual feeds into a unified dashboard.",
    architecture: "The system uses a hierarchical dual-microcontroller topology. An ESP32 manages high-bandwidth video streaming (Wi-Fi) and sensor sampling, while an Arduino Nano handles motor driver PWM and robotic arm servo arrays. Sensor data is formatted as JSON packets and transmitted over a 433MHz LoRa link back to the base station.",
    hardware: "Designed a custom power distribution board integrating LM2596 buck converters to step down the 12V Li-Ion battery pack to 5V and 3.3V rails. Features an ADXL345 accelerometer for rollover detection, DHT22 for ambient monitoring, MQ-135 for hazardous gas levels, and L298N dual H-bridge driver for 4 DC gear motors.",
    software: "Firmware is implemented in C++ (Embedded Arduino). Implements a non-blocking scheduling loop with millis() to sample sensors at 100ms intervals and update servo angles. Implements an automatic fail-safe: if the RF handshake is lost for >3 seconds, motors are automatically cut off.",
    aiml: "ESP32-CAM hosts a local HTTP server streaming QVGA (320x240) JPEG frames at 15fps. Implements on-board color thresholding to track yellow search markers, sending coordinate offsets over serial to the servo control loops.",
    cad: "Chassis plates were modeled in Fusion 360 using 4mm acrylic profiles. The 4-DOF robotic gripper and arm linkages were designed from scratch and 3D printed in PETG for structural toughness with 35% grid infill and 4 perimeter walls.",
    results: "Field trials validated reliable video feed up to 80m through brick walls and sensor telemetry up to 1.1km line-of-sight. The 4-DOF arm successfully lifted test payloads up to 150g from restricted spaces.",
    challenges: "Power droops occurred when multiple servo motors stalled simultaneously, resetting the ESP32. Solved by isolating the motor power rail with dedicated bulk decoupling capacitors (1000uF) and using a separate linear regulator for the control logic.",
    future: "Integrating LiDAR-Lite sensors for SLAM mapping of voids and replacing the RF link with a LoRa mesh repeater system to extend operation deeper into subterranean spaces."
  },
  agrisense: {
    title: "Krishi Setu Smart Agriculture Node",
    subtitle: "IoT & Edge AI · InnovateX 2026 Techfest Finalist",
    gitLink: "https://github.com/Prolayjit-B14/AgriSense",
    liveLink: "",
    tags: ["ESP32", "RS485 NPK", "Gemini AI", "WebSockets", "Firebase", "Node-RED"],
    stats: {
      "Sensor Link": "RS485 Modbus RTU",
      "Power Cycle": "Solar + LiFePO4",
      "Update Rate": "15 Minute Intervals",
      "AI Engine": "Gemini 2.5 Flash API"
    },
    overview: "Krishi Setu is an autonomous solar-powered telemetry node that tracks real-time soil health, moisture profiles, and weather anomalies. It leverages Gemini AI to generate custom fertilization schedules based on direct soil NPK measurements.",
    problem: "Traditional farming relies on calendar-based fertilization, leading to fertilizer runoff, soil acidification, and crop failure. Smallholder farmers lack access to real-time soil analysis laboratories to adjust parameters dynamically.",
    objectives: "1. Deploy high-durability soil probes matching industrial RS485 standards.\n2. Achieve self-sustaining solar power collection for continuous year-round deployments.\n3. Deliver crop health recommendations in local languages using Generative AI.",
    architecture: "Sensors read NPK levels and moisture, sending data via RS485 Modbus protocol to an ESP32. The ESP32 connects via Wi-Fi to a Firebase database. A server-side script routes this data to the Gemini API, which generates crop-specific advice displayed on the user's dashboard.",
    hardware: "Features an industrial soil NPK sensor (RS485 interface) driven via a MAX485 TTL-to-RS485 transceiver. Powered by a 3.2V LiFePO4 battery paired with a TP5000 charger and a 5V/2W solar panel. Uses a low-dropout voltage regulator (AP2112) for ESP32 stability.",
    software: "ESP32 firmware operates in deep sleep. Every 15 minutes, it wakes up, enables transceiver power gating, queries soil registers, transmits data via HTTPS POST, and goes back to sleep, drawing less than 15uA during inactive phases.",
    aiml: "Leverages Gemini 2.5 Flash API. The prompt feeds the historical NPK logs, local temperature, and crop type, returning a structured JSON response with nitrogen replenishment levels, watering duration, and disease warning flags.",
    cad: "Enclosure was designed as a weather-resistant box in SolidWorks, featuring a sloped top to divert rain and a built-in bracket for solar panels. 3D printed in ASA filament for UV and weather resistance.",
    results: "Deployed in a local testing farm for 3 months. Reduced water usage by 30% and nitrogen overuse by 18%, while sustaining 100% battery charge level through solar harvesting.",
    challenges: "The soil NPK probe required a 9V-24V power source, whereas the system battery was 3.2V. Resolved by designing an MT3608 boost converter circuit to step up the battery to 12V only during the 2-second sensor sampling window.",
    future: "Integrating a LoRaWAN backup link for farms located outside of cellular/Wi-Fi coverage and migrating soil models to local Edge Impulse networks."
  },
  womensafety: {
    title: "Women Safety Wearable Tracker",
    subtitle: "Embedded & Safety · MAKATHON '25 First Prize Winner",
    gitLink: "https://github.com/Prolayjit-B14/MAKATHON",
    liveLink: "",
    tags: ["ATmega328P", "SIM800L GSM", "NEO-6M GPS", "ADXL345", "Shock Module", "PCB Layout"],
    stats: {
      "Form Factor": "45x45x15mm Smartwatch",
      "Response Time": "<4 Seconds Alert",
      "Battery Life": "24 Hour Active Mode",
      "SOS Alerts": "SMS + Map Coordinates"
    },
    overview: "An award-winning wearable safety tracker shaped as a wristband. When triggered, it silently records GPS coordinates, broadcasts emergency SMS messages, and activates a high-voltage shock module for self-defense.",
    problem: "Women facing safety threats in public environments need a discrete, fast, and active deterrent that works independently of a phone connection, which can easily be snatched or disabled.",
    objectives: "1. Build an active defense mechanism (voltage pulse) into a lightweight wristwatch.\n2. Ensure autonomous cellular signaling with GPS tracking in under 5 seconds.\n3. Integrate fall detection algorithms to catch accidents automatically.",
    architecture: "An ATmega328P microcontroller manages inputs from a panic button and an ADXL345 IMU. Upon activation, it queries the NEO-6M GPS for NMEA coordinates and commands the SIM800L module via serial to send emergency SMS messages to preset emergency contacts.",
    hardware: "Custom 2-layer PCB designed in KiCad. Integrates a miniature step-up transformer and capacitor grid for the self-defense shock generator. Utilizes a high-current MOSFET switch (IRF3708) to trigger the shock loop from the microcontroller.",
    software: "Firmware written in C (Arduino toolchain). Features a hardware interrupt pin bound to the panic button for instant wakeup. Implements GPS parse filters (TinyGPS++) to extract latitude and longitude rapidly.",
    aiml: "Implements a simple on-device fall detection threshold algorithm. Samples 3-axis accelerometer values at 50Hz, calculating the total acceleration vector magnitude to detect sudden drops followed by inactivity.",
    cad: "Enclosure modeled in Fusion 360 as a two-piece snap-fit wristwatch housing. 3D printed using flexible TPU for the wrist straps and durable PETG for the main casing to isolate the high-voltage module.",
    results: "Won 1st Place at MAKATHON '25. Alert latency tested at 3.8 seconds from button click to SMS arrival. The shock generator delivers a non-lethal, deterrent pulse validated safely under controlled bench criteria.",
    challenges: "The SIM800L module draws brief currents up to 2A during network search, causing voltage drops that reset the microcontroller. Solved by adding a 1000uF low-ESR capacitor adjacent to the SIM800L power input pins.",
    future: "Miniaturizing the board to a 4-layer layout using an ESP32-S3 module, and integrating Bluetooth Low Energy to sync with a mobile application for configuration."
  },
  esodisaster: {
    title: "ESO Disaster AI Monitor",
    subtitle: "AI & Computer Vision · Google Solution Challenge Top 105",
    gitLink: "https://github.com/Prolayjit-B14",
    liveLink: "",
    tags: ["YOLOv8", "Python", "MediaPipe", "OpenCV", "TensorFlow", "React Dashboard"],
    stats: {
      "Detection Speed": "35ms per Frame",
      "Model Accuracy": "92.4% mAP @ Fire",
      "Inference Engine": "ONNX Runtime Edge",
      "Dashboard Sync": "WebSocket Broadcast"
    },
    overview: "ESO Disaster AI Monitor is a local computer vision pipeline that detects wildfires, tracks smoke plumes, and maps survivor locations using camera feeds from rescue drones.",
    problem: "During forest fires or factory collapses, emergency centers are flooded with unstructured video feeds. Determining where survivors are located and prioritizing rescue routes is slow and error-prone.",
    objectives: "1. Develop a high-speed YOLO model optimized for smoke and fire detection.\n2. Implement real-time posture analysis to detect survivor movements.\n3. Construct a priority dashboard that ranks zones based on severity.",
    architecture: "Drone cameras stream video to an edge computer running the YOLOv8 model. Detections are overlaid with pose markers via MediaPipe. Frame metadata is sent to a Node.js server, which broadcasts the visual state via WebSockets to a React-based supervisor dashboard.",
    hardware: "Runs locally on an NVIDIA Jetson Nano edge processor, taking advantage of CUDA acceleration cores to achieve real-time frame rates during drone operations.",
    software: "Pipeline written in Python using OpenCV, ONNX Runtime, and MediaPipe. Incorporates a frame-skipping algorithm to run heavy inference models only on every 3rd frame, maintaining smooth video playback.",
    aiml: "Custom-trained YOLOv8 model on a dataset of 8,000 thermal and visible-spectrum disaster images. Combined with MediaPipe Pose Estimation to identify horizontal human bodies (indicating injured survivors).",
    cad: "Designed a custom lightweight camera mounting bracket for drone compatibility. Modeled in Fusion 360 and 3D printed in carbon-fiber filled PLA to ensure strength with minimal weight.",
    results: "Achieved 92.4% mAP for fire detection and 88.1% accuracy for survivor pose classification. Sustains 28fps inference rate on Jetson Nano edge units.",
    challenges: "Variable lighting and dust plumes created false positive smoke detections. Solved by integrating temporal frame analysis, requiring smoke patterns to persist for at least 15 frames before triggering alarms.",
    future: "Deploying the model on custom FPGA logic using AMD Xilinx DPU architectures to further reduce power consumption and increase drone flight times."
  },
  wastemanagement: {
    title: "IoT Smart Waste Management System",
    subtitle: "IoT & Web · Coding Ninjas Hackathon Winner · 2024",
    gitLink: "https://github.com/Prolayjit-B14",
    liveLink: "",
    tags: ["ESP8266", "Ultrasonic HC-SR04", "MQTT", "Node.js", "MongoDB", "Leaflet Maps"],
    stats: {
      "Network Protocol": "MQTT (HiveMQ)",
      "Sensor Type": "Ultrasonic Range",
      "Database": "MongoDB Atlas",
      "Dashboard": "HTML5 Leaflet.js"
    },
    overview: "An automated city-wide waste tracking system. Ultrasonic sensors mounted inside trash bins report volume levels to a central routing dashboard to optimize trash collection truck routes.",
    problem: "City trash trucks follow fixed routes daily, emptying empty bins and missing overflowing ones, wasting fuel and labor.",
    objectives: "1. Design low-power sensor modules that fit under trash bin lids.\n2. Build a mapping dashboard displaying real-time fullness levels.\n3. Implement a routing algorithm to calculate the shortest path for empty trucks.",
    architecture: "ESP8266 node measures fill level using HC-SR04 ultrasonic sensors. Level readings are published to an MQTT broker. A Node.js backend processes the messages, saves logs in MongoDB, and updates a Leaflet map dashboard via WebSockets.",
    hardware: "Powered by 2 AA batteries. Features an HC-SR04 ultrasonic sensor and an ESP8266 ESP-12F module on a custom prototype board. Operates in deep sleep mode to conserve battery.",
    software: "Node.js backend calculates optimized routes using the Dijkstra pathfinding algorithm based on coordinates of bins containing >80% waste capacity.",
    aiml: "Uses linear regression on historical fill rates to predict when a bin will overflow, enabling proactively scheduled pickups.",
    cad: "3D printed snap-on bracket designed in Fusion 360 to mount sensors safely under bin lids, protecting the electronics from dust and moisture.",
    results: "Won the Coding Ninjas Hackathon. Deployed 5 testing units across campus. Reduced collection route mileage by 40% over a 2-week period.",
    challenges: "Ultrasonic echoes bouncing off irregular garbage shapes produced noisy measurements. Resolved by implementing a software median filter on the ESP8266, taking 10 readings and discarding the extremes.",
    future: "Replacing the ultrasonic sensor with a low-cost VL53L0X Time-of-Flight sensor for higher measurement precision."
  },
  roboticarm: {
    title: "Bluetooth Multi-Joint Robotic Arm",
    subtitle: "Robotics & Hardware · Academic Project · 2024",
    gitLink: "https://github.com/Prolayjit-B14",
    liveLink: "",
    tags: ["Arduino Uno", "SG90 Servo", "HC-05 Bluetooth", "MIT App Inventor", "PWM Control"],
    stats: {
      "DOF Grid": "4 Servo Joints",
      "Communication": "Bluetooth SPP",
      "Power Draw": "5V 2A Peak",
      "Payload": "80g Maximum Lift"
    },
    overview: "A 4-axis robotic arm controlled via a custom Android application. Features smooth servo interpolation to prevent jerky movements during payload manipulation.",
    problem: "Entry-level hobby robotic arms suffer from sudden, erratic movements due to direct PWM angle writing, causing component fatigue and payload drops.",
    objectives: "1. Build a functional robotic gripper arm using hobby servo motors.\n2. Write a speed-controlled servo interpolation library.\n3. Create an intuitive mobile joystick app to control individual joints.",
    architecture: "Android app transmits axis values over Bluetooth to HC-05 connected to Arduino Uno. Arduino interpolates angles and outputs PWM signals to 4 servo motors.",
    hardware: "Arduino Uno board paired with a custom servo shield. Powered by an external 5V 3A DC power adapter. Includes an HC-05 Bluetooth module and SG90 servo motor links.",
    software: "Arduino firmware implements a simple coordinate parser that decodes packets from serial, executing an interpolation routine that ramps servo steps to smooth acceleration.",
    aiml: "Not applicable. System functions under manual kinematic control loops.",
    cad: "Robotic arm structural linkages were printed using standard PLA. Assembled with M3 hardware and nylon spacer standoffs.",
    results: "Smooth trajectory control achieved. Arm successfully handles small components (resistors, ICs, LEDs) in laboratory setups.",
    challenges: "Voltage sag occurred when starting servo motors, resetting the microcontroller. Solved by separating the Arduino 5V power supply from the servo power rail, sharing a common ground.",
    future: "Implementing inverse kinematics on the Arduino to allow coordinate-based movements (X, Y, Z coordinates) instead of joint-angle adjustments."
  },
  pcb: {
    title: "Custom PCB Design Portfolio",
    subtitle: "Hardware & Manufacturing · 2024–Present",
    gitLink: "https://github.com/Prolayjit-B14",
    liveLink: "",
    tags: ["KiCad", "Altium Designer", "Gerber Tools", "RF Routing", "BOM Optimization"],
    stats: {
      "Layers Routed": "2-Layer & 4-Layer",
      "Trace Width Min": "6 mil (0.15mm)",
      "High Frequency": "2.4GHz Wi-Fi / RF",
      "Prototypes Built": "6 Custom Boards"
    },
    overview: "A compilation of custom-designed printed circuit boards including sensor nodes, power converters, and transceiver modules designed for various hackathons and projects.",
    problem: "Using breadboards or point-to-point soldering for complex embedded systems leads to loose contacts, parasite capacitance, and large form factors.",
    objectives: "1. Design professional, compact PCBs utilizing SMD components.\n2. Maintain correct ground planes to mitigate high-frequency noise.\n3. Optimize Bill of Materials (BOM) for low-cost manufacturing.",
    architecture: "The design workflow includes schematic capture, footprint mapping, board layout routing, DRC verification, and exporting Gerber, drill, and BOM files for fabrication.",
    hardware: "Boards designed: 1. RescueBOT motherboard (ESP32 base), 2. Women Safety Wearable (ATmega + GSM), 3. Krishi Setu Solar regulator board.",
    software: "Utilized KiCad 8.0 for board layout routing and Altium Designer for high-frequency signal simulation.",
    aiml: "Not applicable. High frequency signal analysis simulated via numerical solvers.",
    cad: "Boards 3D outlines exported to Fusion 360 to verify mechanical fit inside custom 3D printed enclosures.",
    results: "Designed 6 PCBs. Five designs successfully fabricated, assembled, and tested in functional prototypes.",
    challenges: "Ground loops on the GSM board caused noise in the analog sensor inputs. Fixed by routing separate digital and analog ground planes, joining them at a single point (star ground).",
    future: "Designing high-density interconnect (HDI) PCBs using microvias and BGA package breakout layouts."
  },
  vlsi: {
    title: "Digital Logic Design & VLSI Flow",
    subtitle: "Semiconductor & RTL · MAKAUT Academics · 2024–Present",
    gitLink: "https://github.com/Prolayjit-B14",
    liveLink: "",
    tags: ["Verilog HDL", "Xilinx Vivado", "ModelSim", "ASIC Flow", "Synthesis Reports"],
    stats: {
      "HDL Language": "Verilog HDL",
      "Target FPGA": "Artix-7 (XC7A35T)",
      "Synthesis Tool": "Vivado / Yosys",
      "Simulation Tool": "ModelSim / iVerilog"
    },
    overview: "A series of RTL design representing computer arithmetic blocks, serial communication modules, and finite state machines, simulated and synthesized to verify performance.",
    problem: "Translating mathematical concepts into hardware requires digital layouts that are clock-synchronized, race-condition free, and optimized for logic utilization.",
    objectives: "1. Implement modular arithmetic RTL units in Verilog.\n2. Perform behavioral and post-synthesis timing simulation.\n3. Analyze gate count and power parameters on FPGA targets.",
    architecture: "Verilog modules are structured hierarchically, separating control units (FSMs) from data paths (registers, ALUs). Simulation testbenches feed test vectors to verify logic correctness.",
    hardware: "Targeted to Xilinx Artix-7 FPGA development platforms for physical hardware verification.",
    software: "Vivado Design Suite for synthesis, routing, and timing reports. ModelSim for waveform inspection.",
    aiml: "Not applicable. Gate layouts are synthesized from logic expressions.",
    cad: "Not applicable. Schematic views are generated from synthesizable RTL structures.",
    results: "Validated 4-bit ALU, UART block, and transition logic. Synthesis reports confirm 100MHz clock frequency compliance with zero setup/hold timing violations.",
    challenges: "Blocking assignments used inside edge-triggered blocks generated unintended latches. Corrected by replacing them with non-blocking assignments (<=).",
    future: "Implementing a complete MIPS 32-bit single-cycle CPU core in synthesizable Verilog."
  },
  uiux: {
    title: "Smart Agri App UI/UX Design",
    subtitle: "UI/UX & Mobile · Figma Showcase · 2025",
    gitLink: "https://github.com/Prolayjit-B14",
    liveLink: "",
    tags: ["Figma", "UI Design", "UX Research", "Wireframing", "Interactive Prototype"],
    stats: {
      "Design Tool": "Figma",
      "Screens Designed": "12 High-Fi Screens",
      "Design System": "Glassmorphism Dark",
      "Target Platforms": "Android / iOS App"
    },
    overview: "A mobile application UI/UX design matching the Krishi Setu ecosystem. Built to provide farmers with soil data, charts, and recommendations in an accessible interface.",
    problem: "Agricultural technology applications have cluttered, text-heavy layouts that are difficult for farmers to interpret quickly.",
    objectives: "1. Construct a clean dashboard displaying primary metrics (NPK, moisture, solar state) clearly.\n2. Design interactive charting elements for historical trends.\n3. Prototype crop advisory cards detailing suggestions.",
    architecture: "Figma project with components, typography hierarchies, auto-layout constraints, and interactive transitions.",
    hardware: "Optimized for OLED displays by using a deep charcoal dark mode background to reduce power consumption.",
    software: "Created high-fidelity interactive prototypes in Figma with micro-animations.",
    aiml: "Designed mock UI layouts displaying recommendations generated by the Gemini AI adviser.",
    cad: "Not applicable.",
    results: "Figma design system completed. Validated user flows through mock runs with student developers.",
    challenges: "Designing charts that look clear on small mobile screens. Solved by replacing line charts with simplified gauge meters for immediate parameters, keeping detailed trends behind toggle panels.",
    future: "Translating the Figma design into a responsive Flutter application dashboard."
  },
  cad: {
    title: "Mechanical CAD Assembly Models",
    subtitle: "CAD & 3D Printing · Fusion 360 · 2024–Present",
    gitLink: "https://github.com/Prolayjit-B14",
    liveLink: "",
    tags: ["Fusion 360", "SolidWorks", "STL Slicing", "Tolerance Fits", "Product Design"],
    stats: {
      "CAD Software": "Fusion 360 / SolidWorks",
      "3D Printing": "Cura / PrusaSlicer",
      "Fit Tolerances": "0.15mm Clearance",
      "Print Filaments": "PLA, PETG, ASA"
    },
    overview: "A collection of 3D mechanical designs and assemblies, including robotic arms, rover frames, and custom enclosure cases designed for functional prototypes.",
    problem: "Custom electronics lack protection from dust and moisture, and standard off-the-shelf enclosures do not match custom board dimensions.",
    objectives: "1. Model custom enclosures with exact cutouts for USB, screens, and antenna jacks.\n2. Design multi-joint mechanical link structures with proper clearance tolerances.\n3. Optimize 3D print orientations to reduce supports and improve strength.",
    architecture: "3D design files are exported as STL models, sliced in Cura with parameter tuning, and manufactured on FDM 3D printers.",
    hardware: "3D prints executed on Creality Ender-3 and Bambu Lab P1P printers.",
    software: "Fusion 360 for parametric modeling. Cura and PrusaSlicer for print path generation.",
    aiml: "Not applicable.",
    cad: "Created assemblies including: 1. RescueBOT rover base plates, 2. Wristwatch strap linkages, 3. Krishi Setu wall mount brackets.",
    results: "Successfully manufactured 8 mechanical assemblies. Achieved excellent fit alignment with fabricated PCBs.",
    challenges: "PLA models deformed when exposed to hot sunlight in agricultural setups. Solved by upgrading the Krishi Setu enclosure design to ASA filament, which supports UV stability and heat resistance up to 95°C.",
    future: "Utilizing generative design modules in Fusion 360 to minimize material weight for drone brackets."
  },
  sargamai: {
    title: "Sargam AI Indian Classical Music Platform",
    subtitle: "AI & Musicology · Google Solution Challenge Top 105 · 2025",
    gitLink: "https://github.com/Prolayjit-B14/Bugs-Fixes",
    liveLink: "https://sargamai.netlify.app/",
    tags: ["Gemini 2.5 Flash", "React", "Node.js", "Web Audio API", "Netlify"],
    stats: {
      "Inference Time": "420ms",
      "Ragas Library": "40+",
      "Validation Acc": "89.2%",
      "Development": "6 Months"
    },
    overview: "Sargam AI is an AI-powered music platform built to teach, transcribe, and analyze Indian Classical Music. Using audio recording features, it classifies ragas and talas and runs 'Beethoven AI' for classical composition assists.",
    problem: "Indian Classical Music has complex structure (swaras, ragas, talas) traditionally taught only in person. Existing tuning and teaching apps fail to identify modal transitions and melodic structures dynamically.",
    objectives: "1. Build a low-latency Web Audio API recorder to capture vocal structures.\n2. Interface with Gemini 2.5 Flash API to perform structural waveform analyses.\n3. Implement a complete digital library of ragas, talas, and artist profiles.",
    architecture: "The frontend is a React application capturing user vocals as base64 PCM chunks. The Node.js backend processes these packages and feeds them to the Gemini API with structured system instructions, returning granular notation analytics.",
    hardware: "Not applicable. Deployed on serverless architectures.",
    software: "React client, Express.js API gateway, Gemini API client, Netlify static hosting, and render-based backend microservices.",
    aiml: "Gemini 2.5 Flash API functions as a logic processor comparing input transcriptions against mathematical swara rules, achieving excellent contextual feedback for students.",
    cad: "Not applicable.",
    results: "Reached the Top 105 Teams in India in Google Solution Challenge 2025. Validated by local music students, lowering learning barriers.",
    challenges: "Noisy user microphone recordings caused incorrect classifications. Solved by implementing an audio pre-filter in React using the Web Audio API Web Workers to reduce background hum.",
    future: "Building a local TensorFlow.js model to enable real-time pitch-tracking and offline feedback without API dependency."
  },
  campusconnect: {
    title: "Campus Connect Community Platform",
    subtitle: "Full-Stack Web · Summer Hack 1.0 Winner · 2025",
    gitLink: "https://github.com/Prolayjit-B14/Campus_Connect",
    liveLink: "",
    tags: ["React", "Node.js", "Express", "MongoDB", "Vercel"],
    stats: {
      "Build Time": "36 Hours",
      "Data Model": "NoSQL Schema",
      "Auth": "JWT / Encrypted",
      "Server Delay": "<100ms"
    },
    overview: "Campus Connect is a comprehensive university club management and student communication portal built solo during a high-pressure hackathon. It streamlines announcements, club applications, and event registrations.",
    problem: "University communications are scattered across multiple WhatsApp groups, physical notice boards, and email lists, causing students to miss crucial announcements and club recruitment cycles.",
    objectives: "1. Create an authenticated portal separating admin posters and student readers.\n2. Build club registry forms with automated email notifications.\n3. Deliver a responsive dashboard compatible with low-end mobile viewports.",
    architecture: "Built as a single-page application using React.js. Express.js API endpoints interface with a cluster in MongoDB Atlas, managing JWT sessions and secure document updates.",
    hardware: "Not applicable.",
    software: "React frontend, Express.js server, MongoDB database layer, deployed on Vercel and Render.",
    aiml: "Not applicable.",
    cad: "Not applicable.",
    results: "Won first prize in the Coding Ninjas Summer Hack 1.0. App processed mock load tests of 200 concurrent student logins smoothly.",
    challenges: "Almost quit when the original deadline was set for the next day. Re-architected key UI frames using Tailwind-style modules to speed up deployment, matching the extended timeline.",
    future: "Integrating push notifications via service workers and adding an interactive campus map."
  },
  blindstick: {
    title: "Smart Assistive Blind Stick",
    subtitle: "Embedded Systems · Robocrae Project-A-Thon · 2024",
    gitLink: "",
    liveLink: "",
    tags: ["Arduino Uno", "NEO-6M GPS", "SIM800L GSM", "Ultrasonic HC-SR04", "Haptics"],
    stats: {
      "Ultrasonic Range": "2cm - 400cm",
      "GSM Network": "2G Quad-Band",
      "Power Input": "3.7V Li-ion",
      "Haptic Alert": "PWM Duty Cycle"
    },
    overview: "An assistive navigation stick for visually impaired users. Features obstacle distance warnings using haptic feedback, GPS tracking, and an emergency panic button that sends geolocation coordinates via SMS.",
    problem: "Visually impaired individuals face safety risks from low-hanging obstacles and sudden road construction. In emergencies, they cannot easily access their phones to share location data.",
    objectives: "1. Mount lightweight sensors on a walking cane without disrupting balance.\n2. Interface GPS and GSM modules under a tight power budget.\n3. Implement haptic frequency cues proportional to obstacle proximity.",
    architecture: "An Arduino Uno microcontroller reads distances from an ultrasonic sensor. If an obstacle is detected within 1 meter, it fires haptic motor pulses. A panic button triggers a SIM800L module to transmit a Google Maps coordinate link.",
    hardware: "Uses an Arduino Uno, NEO-6M GPS receiver, SIM800L cellular modem, HC-SR04 sensor, and a high-frequency vibration motor driven via a transistor switch.",
    software: "Arduino firmware written in C++. Utilizes custom interrupt vectors for the emergency button to wake the microcontroller instantly from sleep.",
    aiml: "Not applicable.",
    cad: "Designed a snap-on mounting clip to fix the control enclosure to a standard folding cane. Printed in durable PLA.",
    results: "Completed as a solo build during my first hardware hackathon. Distance sensor reliably alerts on stairs and obstacles, sending coordinate texts in 5 seconds.",
    challenges: "The SIM800L module failed to register on cell towers because of insufficient current. Solved by replacing the standard power adapter with a high-drain lithium cell and regulator.",
    future: "Replacing the ultrasonic sensor with a LiDAR sensor for narrow beam targeting and integrating bone-conduction voice readouts."
  },
  gps: {
    title: "GPS Multi-Cloud Telemetry Tracker",
    subtitle: "IoT & Cloud · Self-Directed · 2024",
    gitLink: "https://github.com/Prolayjit-B14/GPS_Email_Map",
    liveLink: "",
    tags: ["ESP32", "NEO-6M GPS", "LocationIQ API", "SMTP client", "C++"],
    stats: {
      "Position Accuracy": "<2.5m",
      "Email Latency": "<6s",
      "Power Profile": "80mA Active",
      "Data Buffering": "32KB EEPROM"
    },
    overview: "A pocket-sized tracking module that publishes coordinate streams, formats map alerts, and emails warning notices when boundaries are crossed. Features offline storage capabilities.",
    problem: "Commercial tracking setups require expensive monthly subscriptions. Additionally, standard trackers fail to log coordinates in areas without cellular coverage.",
    objectives: "1. Route location logs directly to a personal server without proprietary brokers.\n2. Format and send rich HTML emails showing map markers from the edge device.\n3. Buffer position coordinates during cell towers offline phases.",
    architecture: "The ESP32 reads NMEA sentences, queries the LocationIQ API over HTTPS for addresses, and formats an HTML email. If Wi-Fi is lost, it saves logs to flash memory, flushing them once connected.",
    hardware: "Features an ESP32 Development board, NEO-6M GPS breakout board, and a Li-Polymer charging board.",
    software: "ESP32 C++ code using SMTP Client libraries. Coordinates are cached in a structured ring-buffer array inside the Flash memory.",
    aiml: "Not applicable.",
    cad: "Designed a pocket shell case in Fusion 360 with a clip. printed in PETG.",
    results: "Tracker successfully logs coordinates with low deviation. HTML emails arrive with clickable links showing coordinates and street names.",
    challenges: "Formatting long HTML strings in ESP32 memory caused heap fragmentation. Solved by using memory-efficient string buffers and streaming email contents in chunks.",
    future: "Upgrading to a 4G LTE modem (SIM7600) to ensure high-speed global connectivity."
  },
  dashboard: {
    title: "Disaster Rover Control Dashboard",
    subtitle: "Web Dev & WebSockets · Collaboration · 2024",
    gitLink: "https://github.com/Prolayjit-B14/Diaster_Rover_Dashboard",
    liveLink: "https://diaster-rover-dashboard.vercel.app/",
    tags: ["Next.js", "WebSockets", "HTML5 Canvas", "Tailwind CSS", "Vercel"],
    stats: {
      "Refresh Rate": "60fps",
      "Latency": "<15ms",
      "Video Speed": "15fps",
      "Platform": "Vercel Edge"
    },
    overview: "The control interface for the RescueBOT rover. Displays sensor metrics, camera feeds, battery levels, and joystick inputs.",
    problem: "Controlling rovers in debris fields requires low-latency video and sensor feedback. Multi-page setups introduce lag that makes navigation unsafe.",
    objectives: "1. Implement a single-screen dashboard showing telemetry, video, and controls.\n2. Minimize input lag to keep control response under 30 milliseconds.\n3. Support mobile and keyboard joystick mappings.",
    architecture: "Next.js frontend connects to the rover gateway over WebSockets. The dashboard renders video streams on an HTML5 canvas and updates gauges using React state parameters.",
    hardware: "Tested on laptops and tablets interfacing with the ESP32 rover over local access points.",
    software: "Next.js, Tailwind CSS, socket.io client, and Canvas rendering pipelines.",
    aiml: "Shows visual bounding boxes overlaid on the camera feed, indicating targets detected by the drone CV engine.",
    cad: "Not applicable.",
    results: "Deployed on Vercel. Telemetry latency tested under 15ms. Controls remain highly responsive across multiple viewports.",
    challenges: "WebSocket packet drops occurred during high-frequency data streams. Fixed by throttling sensor updates to 50ms intervals while keeping control inputs real-time.",
    future: "Integrating a WebRTC peer-to-peer connection to stream video at 30fps with lower latency."
  }
};

window.loadProjectDetails = function(projectId) {
  const data = projectDetailsData[projectId];
  if (!data) return;

  const heroEl = document.getElementById('projectDetailsHero');
  if (heroEl) {
    let gitBtn = data.gitLink ? `<a href="${data.gitLink}" target="_blank" class="btn-secondary" style="padding:0.4rem 1rem;font-size:0.8rem;border-radius:4px;">View on GitHub</a>` : '';
    let liveBtn = data.liveLink ? `<a href="${data.liveLink}" target="_blank" class="btn-primary" style="padding:0.4rem 1rem;font-size:0.8rem;border-radius:4px;color:#000;">Live Demo</a>` : '';
    
    let statsHtml = '';
    for (const [k, v] of Object.entries(data.stats || {})) {
      statsHtml += `
        <div style="background:rgba(255,255,255,0.02); padding:0.75rem 1rem; border:1px solid var(--border); border-radius:4px; text-align:center;">
          <p style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-family:var(--font-mono); margin-bottom:0.25rem;">${k}</p>
          <p style="font-size:0.88rem; font-weight:700; color:var(--accent);">${v}</p>
        </div>
      `;
    }

    heroEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1.5rem; margin-bottom:1.5rem;">
        <div>
          <span style="font-size:0.7rem; padding:0.2rem 0.6rem; background:rgba(0,212,255,0.1); border:1px solid var(--border-accent); color:var(--accent); border-radius:4px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:0.5rem; display:inline-block;">Project Deep Dive</span>
          <h2 style="font-size:1.8rem; font-weight:800; font-family:var(--font-display); line-height:1.2; margin:0.25rem 0 0.5rem;">${data.title}</h2>
          <p style="font-size:0.9rem; color:var(--text-secondary);">${data.subtitle}</p>
        </div>
        <div style="display:flex; gap:0.75rem; align-items:center;">
          ${gitBtn}
          ${liveBtn}
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; border-top:1px solid var(--border); padding-top:1.5rem;">
        ${statsHtml}
      </div>
    `;
  }

  const sections = ['overview', 'problem', 'objectives', 'architecture', 'hardware-design', 'software-design', 'aiml-pipeline', 'cad-design', 'results', 'challenges', 'future'];
  sections.forEach(sec => {
    const el = document.getElementById(`details-${sec}-content`);
    if (el) {
      el.innerHTML = (data[sec.replace('-design', '').replace('-pipeline', '')] || 'Not applicable for this project phase.')
        .split('\n')
        .map(line => `<p style="margin-bottom:0.75rem; line-height:1.6;">${line}</p>`)
        .join('');
    }
  });
};

window.scrollToDetailSection = function(sectionId, event) {
  if (event) event.preventDefault();
  const el = document.getElementById(`details-${sectionId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const sidebar = document.querySelector('#projectDetailsBody aside');
  if (sidebar) {
    sidebar.querySelectorAll('a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${sectionId}`);
    });
  }
};

/* ── GLASS CARD HOVER GLOW (generic) ─────────────────────── */
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});
/* ── GITHUB ACTIVITY SIMULATOR ────────────────────────────── */
window.initGithubSimulator = function() {
  const grid = document.getElementById('contribGrid');
  const monthsContainer = document.getElementById('contribMonths');
  const tooltip = document.getElementById('contribTooltip');
  if (!grid || !monthsContainer || !tooltip) return;

  grid.innerHTML = '';
  monthsContainer.innerHTML = '';

  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  months.forEach(m => {
    const span = document.createElement('span');
    span.textContent = m;
    monthsContainer.appendChild(span);
  });

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 370); // 370 days ago

  for (let i = 0; i < 371; i++) {
    const cell = document.createElement('div');
    const cellDate = new Date(baseDate);
    cellDate.setDate(baseDate.getDate() + i);

    // Randomize contributions
    let count = 0;
    const r = Math.random();
    if (r > 0.85) count = Math.floor(Math.random() * 3) + 1;
    else if (r > 0.6) count = Math.floor(Math.random() * 2) + 1;
    else if (r > 0.45) count = Math.floor(Math.random() * 8) + 3;
    
    let level = 0;
    if (count > 0 && count <= 2) level = 1;
    else if (count > 2 && count <= 5) level = 2;
    else if (count > 5 && count <= 8) level = 3;
    else if (count > 8) level = 4;

    cell.className = `contrib-cell contrib-level-${level}`;
    cell.dataset.date = cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    cell.dataset.count = count;

    // Tooltip trigger
    cell.addEventListener('mouseenter', (e) => {
      const countText = count === 0 ? 'No contributions' : `${count} contribution${count > 1 ? 's' : ''}`;
      tooltip.textContent = `${countText} on ${cell.dataset.date}`;
      tooltip.style.opacity = '1';
      tooltip.style.left = (e.clientX + 10) + 'px';
      tooltip.style.top = (e.clientY - 35) + 'px';
    });

    cell.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });

    grid.appendChild(cell);
  }

  // Languages Donut Chart
  const canvas = document.getElementById('githubLangsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 140;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.45;
  const innerR = size * 0.25;

  const data = [
    { label: 'Verilog', value: 30, color: '#4B0082' },
    { label: 'C/C++', value: 25, color: '#f34b7d' },
    { label: 'JavaScript', value: 20, color: '#f1e05a' },
    { label: 'Python', value: 15, color: '#3572A5' },
    { label: 'HTML/CSS/Others', value: 10, color: '#e34c26' }
  ];

  let total = data.reduce((acc, curr) => acc + curr.value, 0);
  let currentAngle = -Math.PI / 2;

  data.forEach(slice => {
    const sliceAngle = (slice.value / total) * 2 * Math.PI;

    // Draw slice
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, currentAngle, currentAngle + sliceAngle);
    ctx.arc(cx, cy, innerR, currentAngle + sliceAngle, currentAngle, true);
    ctx.closePath();

    ctx.fillStyle = slice.color;
    ctx.fill();

    currentAngle += sliceAngle;
  });

  // Inner cutout text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CODE', cx, cy);
};

window.initEsoSimulator = function() {
  const speedEl = document.getElementById('esoInferenceSpeed');
  const fpsEl = document.getElementById('esoFps');
  const logContainer = document.getElementById('esoTerminalLog');
  if (!speedEl || !fpsEl || !logContainer) return;

  const logs = [
    "[INFO] Capturing camera frame from ESP32-CAM stream...",
    "[MODEL] YOLOv8n: running inference on 640x640 frame...",
    "[DETECTION] Fire detected (Conf: 94.6%) in sector B3",
    "[DETECTION] Smoke plume segmented (Conf: 89.1%)",
    "[PIPELINE] Running MediaPipe keypoint extractor...",
    "[TRACKING] 1 skeleton locked. State: Crawling/Prone",
    "[PRIORITY] Risk score calculated: 0.96 (CRITICAL)",
    "[MQTT] Alert packet dispatched to local command center",
    "[SYSTEM] Syncing localized data with central database...",
    "[INFO] Latency stats updated successfully."
  ];

  let logIndex = 0;

  setInterval(() => {
    // Fluctuating values
    const fpsVal = (27.2 + Math.random() * 2.5).toFixed(1);
    const speedVal = (12.5 + Math.random() * 3.5).toFixed(1);

    fpsEl.textContent = `${fpsVal} FPS`;
    speedEl.textContent = `${speedVal} ms`;

    // Append a log line
    const span = document.createElement('span');
    const time = new Date().toLocaleTimeString().split(' ')[0];
    const logText = logs[logIndex];
    
    if (logText.includes('CRITICAL') || logText.includes('Fire')) {
      span.style.color = 'var(--red)';
    } else if (logText.includes('SUCCESS') || logText.includes('online')) {
      span.style.color = '#68d391';
    } else if (logText.includes('MQTT') || logText.includes('dispatched')) {
      span.style.color = 'var(--accent)';
    } else {
      span.style.color = 'var(--text-secondary)';
    }

    span.textContent = `[${time}] ${logText}`;
    logContainer.appendChild(span);
    logContainer.scrollTop = logContainer.scrollHeight;

    // Limit log lines to 20
    while (logContainer.children.length > 20) {
      logContainer.removeChild(logContainer.firstChild);
    }

    logIndex = (logIndex + 1) % logs.length;
  }, 2500);
};

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize GitHub activity calendar
  window.initGithubSimulator();

  // Initialize ESO Disaster AI simulator loop
  window.initEsoSimulator();

  // Trigger visible for elements already in viewport
  setTimeout(() => {
    document.querySelectorAll('.stat-big-number[data-target]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        let targetStr = el.dataset.target;
        if (targetStr === 'repos') targetStr = '20'; // Fallback
        const target = parseInt(targetStr);
        const suffix = el.dataset.suffix || '+';
        animateCounter(el, target, suffix);
      }
    });
  }, 500);

  // Hero elements stagger
  const heroEls = document.querySelectorAll('.hero-badge, .hero-avatar-wrapper, .hero-name, .hero-roles, .hero-description, .hero-stats, .hero-cta, .hero-social');
  heroEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200 + i * 100);
  });

  // Gallery items initial animation
  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s`;
  });

  const galObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        galObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.gallery-item').forEach(el => galObserver.observe(el));

  console.log('%c⚡ Prolayjit Biswas Portfolio', 'color:#00d4ff;font-size:20px;font-weight:bold;');
  console.log('%cMultidisciplinary Engineering Innovator | Hardware | IoT | VLSI | AI | Frontend', 'color:#94a3b8;font-size:12px;');
  console.log('%c📧 prolayjitbiswas2004@gmail.com', 'color:#00d4ff;font-size:12px;');
});

/* ── FEATURED PROJECT CARD ANIMATIONS ─────────────────────── */
(function initFeaturedCards() {
  const grids = document.querySelectorAll('.featured-grid');
  if (!grids.length) return;

  // Staggered entrance via IntersectionObserver
  const gridObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        gridObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  grids.forEach(grid => gridObserver.observe(grid));

  // 3D tilt on mouse move
  document.querySelectorAll('.featured-project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-6px) scale(1.01) rotateX(${(-y * 5).toFixed(1)}deg) rotateY(${(x * 5).toFixed(1)}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ── HOME CONTACT FORM HANDLER ────────────────────────────── */
window.handleHomeContactSubmit = function(e) {
  e.preventDefault();
  const nameEl = document.getElementById('homeContactName');
  const emailEl = document.getElementById('homeContactEmail');
  const subjectEl = document.getElementById('homeContactSubject');
  const messageEl = document.getElementById('homeContactMessage');

  const name = nameEl ? nameEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const subject = subjectEl ? subjectEl.value : 'Portfolio Contact';
  const message = messageEl ? messageEl.value.trim() : '';

  if (!name || !email || !message) {
    if (typeof showToast === 'function') {
      showToast('⚠️ Please fill out all required fields.', 'error');
    }
    return;
  }

  if (typeof showToast === 'function') {
    showToast(`📨 Thank you ${name}! Launching email client...`, 'success');
  } else {
    alert(`Thank you ${name}! Launching your email client...`);
  }

  // Trigger mailto link with encoded parameters
  const mailtoUrl = `mailto:prolayjitbiswas2004@gmail.com?subject=${encodeURIComponent(subject + ' - From ' + name)}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message)}`;
  setTimeout(() => {
    window.location.href = mailtoUrl;
  }, 500);

  // Reset form
  const form = document.getElementById('homeContactForm');
  if (form) form.reset();
};

/* ── HACKATHON DETAIL MODAL CONTROLLER ───────────────────── */
window.openHackathonModal = function(card) {
  if (!card) return;
  const overlay = document.getElementById('hackathonModalOverlay');
  if (!overlay) return;

  const eventName = card.dataset.event || 'Hackathon Event';
  const badgeText = card.dataset.badge || 'VERIFIED RESULT';
  const badgeClass = card.dataset.badgeClass || 'winner';
  const project = card.dataset.project || 'Project Title';
  const role = card.dataset.role || 'Contributor';
  const tech = card.dataset.tech || 'Hardware, Software';
  const result = card.dataset.result || 'Finalist';
  const desc = card.dataset.desc || 'Built under hackathon sprint conditions.';

  const badgeEl = document.getElementById('modalHackBadge');
  const eventEl = document.getElementById('modalHackEvent');
  const projectEl = document.getElementById('modalHackProject');
  const roleEl = document.getElementById('modalHackRole');
  const resultEl = document.getElementById('modalHackResult');
  const techContainer = document.getElementById('modalHackTech');
  const descEl = document.getElementById('modalHackDesc');

  if (badgeEl) {
    badgeEl.textContent = badgeText;
    badgeEl.className = `hack-log-badge ${badgeClass}`;
  }
  if (eventEl) eventEl.textContent = eventName;
  if (projectEl) projectEl.textContent = project;
  if (roleEl) roleEl.textContent = role;
  if (resultEl) resultEl.textContent = result;
  if (descEl) descEl.textContent = desc;

  if (techContainer) {
    techContainer.innerHTML = '';
    const techItems = tech.split(',').map(t => t.trim()).filter(Boolean);
    techItems.forEach(item => {
      const chip = document.createElement('span');
      chip.className = 'hack-modal-chip';
      chip.textContent = item;
      techContainer.appendChild(chip);
    });
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeHackathonModal = function() {
  const overlay = document.getElementById('hackathonModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
  document.body.style.overflow = '';
};

window.handleHackModalOverlayClick = function(e) {
  if (e && e.target && e.target.id === 'hackathonModalOverlay') {
    window.closeHackathonModal();
  }
};

// Keyboard listener (Escape closes modal)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('hackathonModalOverlay');
    if (overlay && overlay.classList.contains('active')) {
      window.closeHackathonModal();
    }
  }
});

