// ============================================================
// ESTUDIO TORNEO – JavaScript
// ============================================================

// ---------- YEAR ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- NAV SCROLL ----------
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ---------- MOBILE MENU ----------
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');
const burgerSpans = burger.querySelectorAll('span');

function openMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Cerrar menú de navegación');
    burgerSpans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    burgerSpans[1].style.opacity = '0';
    burgerSpans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    // Trap focus: move focus into menu
    const firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
}

function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú de navegación');
    burgerSpans[0].style.transform = '';
    burgerSpans[1].style.opacity = '1';
    burgerSpans[2].style.transform = '';
}

burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
});

mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
});

// Close menu on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMenu();
        burger.focus();
    }
});

// ---------- SCROLL ANIMATIONS ----------
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fadeEls = document.querySelectorAll(
    '.stat-item, .project-card, .service-card, .process-step, .testimonial-card, .contact-wrapper'
);

if (!prefersReducedMotion) {
    fadeEls.forEach(el => el.classList.add('fade-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const idx = Array.from(fadeEls).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 80 * (idx % 4));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeEls.forEach(el => observer.observe(el));
}

// ---------- COUNTER ANIMATION ----------
function animateCounter(el, target, suffix = '') {
    if (prefersReducedMotion) {
        el.textContent = (Number.isInteger(target) ? target : Math.round(target)) + suffix;
        return;
    }
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = eased * target;
        el.textContent = Math.round(value) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

const statNumbers = document.querySelectorAll('.stat-item__number');
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const text = el.getAttribute('aria-label') || el.textContent;
            const hasPlus = el.textContent.includes('+');
            const hasPct = el.textContent.includes('%');
            const num = parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
            const suffix = hasPlus ? '+' : hasPct ? '%' : '';
            animateCounter(el, num, suffix);
            statObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(el => statObserver.observe(el));

// ---------- CONTACT FORM ----------
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

// Live validation feedback
function setFieldError(input, message) {
    input.setAttribute('aria-invalid', 'true');
    let errorEl = document.getElementById(input.id + '-error');
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.id = input.id + '-error';
        errorEl.className = 'field-error';
        errorEl.setAttribute('role', 'alert');
        input.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = message;
    input.setAttribute('aria-describedby', errorEl.id);
}

function clearFieldError(input) {
    input.removeAttribute('aria-invalid');
    const errorEl = document.getElementById(input.id + '-error');
    if (errorEl) errorEl.remove();
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const nombre = document.getElementById('nombre');
    const email = document.getElementById('email');

    if (!nombre.value.trim()) {
        setFieldError(nombre, 'El nombre es obligatorio.');
        valid = false;
    } else {
        clearFieldError(nombre);
    }

    if (!email.value.trim()) {
        setFieldError(email, 'El email es obligatorio.');
        valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        setFieldError(email, 'Introduce un email válido.');
        valid = false;
    } else {
        clearFieldError(email);
    }

    if (!valid) {
        // Focus first error field
        const firstError = form.querySelector('[aria-invalid="true"]');
        if (firstError) firstError.focus();
        return;
    }

    submitBtn.textContent = 'Enviando…';
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');

    setTimeout(() => {
        submitBtn.textContent = '✓ Mensaje enviado';
        submitBtn.style.background = 'linear-gradient(135deg, #4ade80, #16a34a)';
        submitBtn.removeAttribute('aria-busy');
        form.reset();

        // Announce success to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = 'Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.';
        document.body.appendChild(announcement);

        setTimeout(() => {
            submitBtn.textContent = 'Enviar consulta gratuita';
            submitBtn.style.background = '';
            submitBtn.disabled = false;
            announcement.remove();
        }, 4000);
    }, 1500);
});

// ---------- SMOOTH ACTIVE NAV LINKS ----------
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                const isActive = link.getAttribute('href') === '#' + entry.target.id;
                link.style.color = isActive ? 'var(--clr-text)' : '';
                link.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
        }
    });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ---------- PROYECTO: MODAL + CARRUSEL ----------
const projectCards = document.querySelectorAll('.project-card');
const modalOverlay = document.getElementById('projectModal');
const carouselTrack = document.getElementById('carouselTrack');
const modalTitle = document.getElementById('modalTitle');
const modalMeta = document.getElementById('modalMeta');
const modalDesc = document.getElementById('modalDesc');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const modalClose = document.getElementById('modalClose');

let currentIndex = 0;

function parseMediaList(card) {
    const raw = card.dataset.media;
    if (raw) {
        try { return JSON.parse(raw); } catch (e) { return []; }
    }
    // Fallback: try to read background-image from .project-card__img
    const imgDiv = card.querySelector('.project-card__img');
    if (imgDiv) {
        const bg = getComputedStyle(imgDiv).backgroundImage; // url("file.jpg")
        const m = bg.match(/url\(["']?(.+?)["']?\)/);
        if (m && m[1]) return [m[1]];
    }
    return [];
}

function buildSlides(media) {
    carouselTrack.innerHTML = '';
    media.forEach(src => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        if (/\.(mp4|webm|ogg)$/i.test(src)) {
            const vid = document.createElement('video');
            vid.src = src;
            vid.controls = true;
            vid.playsInline = true;
            vid.preload = 'metadata';
            slide.appendChild(vid);
        } else {
            const img = document.createElement('img');
            img.src = src;
            img.alt = '';
            slide.appendChild(img);
        }
        carouselTrack.appendChild(slide);
    });
}

function updateCarousel() {
    const slides = carouselTrack.children.length;
    if (slides === 0) return;
    if (currentIndex < 0) currentIndex = slides - 1;
    if (currentIndex >= slides) currentIndex = 0;
    carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
    // Pause other videos
    carouselTrack.querySelectorAll('video').forEach((v, i) => {
        if (i === currentIndex) return;
        try { v.pause(); v.currentTime = 0; } catch (e) {}
    });
}

function openModal(card) {
    const media = parseMediaList(card);
    buildSlides(media);
    modalTitle.textContent = card.dataset.title || '';
    modalMeta.textContent = card.dataset.meta || '';
    modalDesc.textContent = card.dataset.desc || '';
    currentIndex = 0;
    updateCarousel();
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    // focus for keyboard
    document.getElementById('carousel').focus();
}

function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    // stop any playing videos
    carouselTrack.querySelectorAll('video').forEach(v => { try { v.pause(); } catch(e){} });
}

projectCards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openModal(card); });
    card.setAttribute('tabindex', '0');
});

prevBtn.addEventListener('click', () => { currentIndex -= 1; updateCarousel(); });
nextBtn.addEventListener('click', () => { currentIndex += 1; updateCarousel(); });
modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (modalOverlay.classList.contains('open')) {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') { currentIndex -= 1; updateCarousel(); }
        if (e.key === 'ArrowRight') { currentIndex += 1; updateCarousel(); }
    }
});

