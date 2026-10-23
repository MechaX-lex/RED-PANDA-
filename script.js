/* ==========================================
   1. PRELOADER Y REVELADO CINEMATOGRÁFICO
   ========================================== */
const preloader = document.getElementById('preloader');

window.addEventListener('load', () => {
  if (!preloader) return;

  setTimeout(() => {
    preloader.classList.add('unlocked');
    
    setTimeout(() => {
      preloader.classList.add('loaded');
      preloader.style.pointerEvents = 'none';
      
      document.body.classList.add('page-revealed');
      
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 1250);
    }, 400);
  }, 600);
});

/* ==========================================
   2. MENÚ HAMBURGUESA (MÓVIL)
   ========================================== */
const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

function setMenu(open) {
  if (!menu || !menuToggle) return;
  menu.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

if (menuToggle && menu) {
  menuToggle.addEventListener('click', () => {
    setMenu(!menu.classList.contains('open'));
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });
}

/* ==========================================
   3. PÉTALOS DE SAKURA (Fondo Animado)
   ========================================== */
const canvas = document.getElementById('sakura-canvas');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && !reduceMotion) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let petals = [];
  let accumulatedPetals = [];
  const maxAccumulated = window.innerWidth < 768 ? 40 : 80;

  function createPetal(fromTopOnly = false) {
    const fromTrees = !fromTopOnly && Math.random() < 0.65;
    let x;
    if (fromTrees) {
      x = Math.random() < 0.5 ? Math.random() * (width * 0.35) : width - Math.random() * (width * 0.35);
    } else {
      x = Math.random() * width;
    }

    const isBlur = Math.random() < 0.3;

    return {
      x: x,
      y: -20 - Math.random() * 50,
      size: isBlur ? Math.random() * 4 + 3 : Math.random() * 7 + 5,
      speedY: Math.random() * 0.9 + 0.4,
      speedX: Math.random() * 0.8 - 0.4,
      angle: Math.random() * Math.PI * 2,
      spin: Math.random() * 0.02 - 0.01,
      opacity: isBlur ? Math.random() * 0.3 + 0.2 : Math.random() * 0.4 + 0.35,
      blur: isBlur
    };
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = window.innerWidth < 768 ? 25 : 50;
    petals = Array.from({ length: count }, () => createPetal());
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 183, 197, ${p.opacity})`;
    if (p.blur) {
      ctx.filter = 'blur(1.5px)';
    }
    ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function isNearBottom() {
    const totalHeight = document.documentElement.scrollHeight;
    const currentScroll = window.scrollY + window.innerHeight;
    return totalHeight - currentScroll < 250;
  }

  let animationFrameId;

  function animate() {
    ctx.clearRect(0, 0, width, height);

    const nearBottom = isNearBottom();

    if (nearBottom) {
      accumulatedPetals.forEach(p => drawPetal(p));
    }

    petals.forEach(p => {
      p.y += p.speedY;
      p.x += Math.sin(p.y * 0.008) * 0.8 + p.speedX;
      p.angle += p.spin;

      if (nearBottom && p.y >= height - (Math.random() * 20 + 10)) {
        if (accumulatedPetals.length < maxAccumulated) {
          accumulatedPetals.push({
            x: p.x,
            y: height - (Math.random() * 25 + 5),
            size: p.size,
            angle: p.angle,
            opacity: p.opacity * 0.8,
            blur: false
          });
        }
        Object.assign(p, createPetal(true));
      } else if (p.y > height + 20) {
        Object.assign(p, createPetal(true));
      }

      if (p.x > width + 20) p.x = -10;
      if (p.x < -20) p.x = width + 10;

      drawPetal(p);
    });

    animationFrameId = requestAnimationFrame(animate);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      animate();
    }
  });

  window.addEventListener('resize', resize);
  resize();
  animate();
}

/* ==========================================
   4. INTERSECTION OBSERVERS (REVEAL Y NAV)
   ========================================== */
document.documentElement.classList.add('js');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const navLinks = document.querySelectorAll('.a-links a');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

document.querySelectorAll('main section[id]').forEach(s => sectionObserver.observe(s));

/* ==========================================
   5. FORMULARIO Y ACCESO A PLANO
   ========================================== */
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const asunto = encodeURIComponent('Mensaje de ' + d.get('nombre'));
    const cuerpo = encodeURIComponent(d.get('mensaje') + '\n\n' + d.get('nombre') + ' - ' + d.get('correo'));
    window.location.href = 'mailto:correo@ejemplo.com?subject=' + asunto + '&body=' + cuerpo;
    const msg = document.getElementById('form-msg');
    if (msg) msg.textContent = '¡Gracias! Se abrirá tu correo para enviar el mensaje. 🐼';
    form.reset();
  });
}

const openPlanContactBtn = document.getElementById('open-plan-contact');
if (openPlanContactBtn) {
  openPlanContactBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openLightbox({
      src: 'IMG/plano-3d.jpg',
      alt: 'Plano 3D isométrico del local con zonas de producción, hornos, atención al cliente y áreas de trabajo',
      title: 'Plano 3D de The Big Red Panda Bakery',
      caption: 'Distribución arquitectónica de nuestro local comercial en Chía.'
    }, openPlanContactBtn);
  });
}

/* ==========================================
   6. PESTAÑAS (HISTORIA Y PROPÓSITO)
   ========================================== */
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-selected', String(b === btn));
    });
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('active', p.id === 'tab-' + btn.dataset.tab);
    });
  });
});

/* ==========================================
   7. ANIMACIÓN DE CONTEO EN FINANZAS
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  const counterElements = document.querySelectorAll('.counter-num');
  if (reduceMotion) return;

  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetVal = parseFloat(el.dataset.target);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const duration = 1600;
        const startTime = performance.now();

        function updateCount(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const currentVal = Math.floor(easeProgress * targetVal);

          el.textContent = `${prefix}${currentVal.toLocaleString('es-CO')}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            el.textContent = `${prefix}${targetVal.toLocaleString('es-CO')}${suffix}`;
          }
        }

        requestAnimationFrame(updateCount);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  counterElements.forEach(el => countObserver.observe(el));
});

/* ==========================================
   8. VISOR LIGHTBOX GLOBAL REUTILIZABLE
   ========================================== */
let lbTriggerEl = null;
let currentZoomLevel = 100;

const lightboxOverlay = document.createElement('div');
lightboxOverlay.className = 'rp-lightbox-overlay';
lightboxOverlay.id = 'rp-lightbox';
lightboxOverlay.setAttribute('role', 'dialog');
lightboxOverlay.setAttribute('aria-modal', 'true');

lightboxOverlay.innerHTML = `
  <div class="rp-lightbox-panel" tabIndex="-1">
    <div class="rp-lightbox-header">
      <h3 class="rp-lightbox-title" id="rp-lb-title"></h3>
      <button class="rp-lightbox-close" id="rp-lb-close" aria-label="Cerrar ventana emergente">✕</button>
    </div>
    <div class="rp-lightbox-body">
      <img src="" alt="" class="rp-lightbox-img" id="rp-lb-img" loading="lazy">
      <p class="rp-lightbox-error" id="rp-lb-error">Imagen no disponible en este momento</p>
    </div>
    <div class="rp-lightbox-footer">
      <p class="rp-lightbox-caption" id="rp-lb-caption"></p>
      <div class="rp-lightbox-controls">
        <button class="rp-lb-btn" id="rp-lb-zoom-out" title="Disminuir zoom" aria-label="Reducir zoom">−</button>
        <button class="rp-lb-btn rp-lb-btn-reset" id="rp-lb-zoom-reset" title="Restablecer tamaño">Restablecer</button>
        <button class="rp-lb-btn" id="rp-lb-zoom-in" title="Aumentar zoom" aria-label="Aumentar zoom">+</button>
      </div>
    </div>
  </div>
`;

document.body.appendChild(lightboxOverlay);

const lbImg = lightboxOverlay.querySelector('#rp-lb-img');
const lbTitle = lightboxOverlay.querySelector('#rp-lb-title');
const lbCaption = lightboxOverlay.querySelector('#rp-lb-caption');
const lbError = lightboxOverlay.querySelector('#rp-lb-error');
const lbCloseBtn = lightboxOverlay.querySelector('#rp-lb-close');
const lbZoomInBtn = lightboxOverlay.querySelector('#rp-lb-zoom-in');
const lbZoomOutBtn = lightboxOverlay.querySelector('#rp-lb-zoom-out');
const lbZoomResetBtn = lightboxOverlay.querySelector('#rp-lb-zoom-reset');

function openLightbox(data, triggerElement = null) {
  lbTriggerEl = triggerElement || document.activeElement;
  currentZoomLevel = 100;
  applyZoom();

  lbImg.style.display = 'block';
  lbError.style.display = 'none';

  lbImg.src = data.src;
  lbImg.alt = data.alt || 'Imagen ampliada';
  lbTitle.textContent = data.title || 'Vista ampliada';
  lbCaption.textContent = data.caption || '';
  lightboxOverlay.setAttribute('aria-label', data.title || 'Vista ampliada');

  lightboxOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    if (lbCloseBtn) lbCloseBtn.focus();
  }, 50);
}

function closeLightbox() {
  lightboxOverlay.classList.remove('active');
  document.body.style.overflow = '';

  if (lbTriggerEl && typeof lbTriggerEl.focus === 'function') {
    lbTriggerEl.focus();
  }
}

function applyZoom() {
  if (lbImg) lbImg.style.width = currentZoomLevel + '%';
}

if (lbZoomInBtn) {
  lbZoomInBtn.addEventListener('click', () => {
    if (currentZoomLevel < 250) {
      currentZoomLevel += 25;
      applyZoom();
    }
  });
}

if (lbZoomOutBtn) {
  lbZoomOutBtn.addEventListener('click', () => {
    if (currentZoomLevel > 100) {
      currentZoomLevel -= 25;
      applyZoom();
    }
  });
}

if (lbZoomResetBtn) {
  lbZoomResetBtn.addEventListener('click', () => {
    currentZoomLevel = 100;
    applyZoom();
  });
}

if (lbImg) {
  lbImg.addEventListener('error', () => {
    lbImg.style.display = 'none';
    if (lbError) lbError.style.display = 'block';
  });
}

if (lbCloseBtn) lbCloseBtn.addEventListener('click', closeLightbox);

lightboxOverlay.addEventListener('click', (e) => {
  if (e.target === lightboxOverlay) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (e) => {
  if (!lightboxOverlay.classList.contains('active')) return;

  if (e.key === 'Escape') {
    closeLightbox();
    return;
  }

  if (e.key === 'Tab') {
    const focusables = lightboxOverlay.querySelectorAll('button, [tabindex="0"], [tabindex="-1"]');
    const firstObj = focusables[0];
    const lastObj = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstObj) {
        lastObj.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastObj) {
        firstObj.focus();
        e.preventDefault();
      }
    }
  }
});

document.addEventListener('rp:lightbox', (e) => {
  if (e.detail) {
    openLightbox(e.detail, e.target);
  }
});

document.addEventListener('click', (e) => {
  const targetImg = e.target.closest('img[data-lightbox], [data-lightbox] img, button[data-lightbox]');
  if (targetImg) {
    let imgEl = targetImg.tagName === 'IMG' ? targetImg : targetImg.querySelector('img');
    if (!imgEl && targetImg.dataset.lightbox) {
      const container = targetImg.closest('.space-tab-container, .historia-card');
      if (container) imgEl = container.querySelector('img');
    }
    if (imgEl) {
      openLightbox({
        src: imgEl.currentSrc || imgEl.src,
        alt: imgEl.alt,
        title: imgEl.dataset.title || 'Vista ampliada',
        caption: imgEl.dataset.caption || ''
      }, imgEl);
    }
  }
});

/* ==========================================================================
   9. COMPONENTE SHADOW DOM: FICHAS TÉCNICAS E ILUSTRACIÓN DEL CHEESECAKE
   ========================================================================== */
(function initFichasShadowComponent() {
  const mountPoint = document.getElementById('fc-root');
  if (!mountPoint) return;

  const shadow = mountPoint.attachShadow({ mode: 'open' });

  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host {
        all: initial;
        display: block;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #fff6e8;
      }

      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      button {
        font: inherit;
        color: inherit;
        background: none;
        border: none;
        cursor: pointer;
      }

      .fc-wrap {
        max-width: 1220px;
        margin: 0 auto;
        padding: 20px;
      }

      .fc-title {
        font-family: 'Noto Serif JP', serif, Georgia;
        font-size: 2.4rem;
        color: #f5c518;
        text-align: center;
        margin-bottom: 8px;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
      }

      .fc-sub {
        text-align: center;
        color: #fff6e8;
        font-size: 1.05rem;
        margin-bottom: 45px;
        opacity: 0.9;
      }

      .fc-grid {
        display: grid;
        grid-template-columns: 1fr clamp(320px, 32vw, 420px) 1fr;
        gap: 28px;
        align-items: start;
      }

      .fc-col {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .fc-card {
        background: rgba(26, 5, 8, 0.75);
        border: 1px solid rgba(245, 197, 24, 0.25);
        border-radius: 14px;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        overflow: hidden;
        transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.3s ease;
      }

      .fc-card:hover {
        border-color: rgba(245, 197, 24, 0.5);
        transform: translateY(-2px);
      }

      .fc-card.active,
      .fc-card.highlighted {
        border-color: #f5c518;
        box-shadow: 0 0 20px rgba(245, 197, 24, 0.35), inset 0 0 15px rgba(245, 197, 24, 0.08);
      }

      .fc-head {
        width: 100%;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 14px;
        text-align: left;
        outline: none;
      }

      .fc-num {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #c1272d;
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #fff6e8;
        flex-shrink: 0;
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
      }

      .fc-card.active .fc-num,
      .fc-card.highlighted .fc-num {
        background: #f5c518;
        color: #1a0508;
        border-color: #f5c518;
      }

      .fc-card-title {
        font-family: 'Noto Serif JP', serif, Georgia;
        font-size: 1.15rem;
        color: #f5c518;
        flex: 1;
        text-align: left;
      }

      .fc-arrow {
        font-size: 0.8rem;
        color: #f5c518;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .fc-card.active .fc-arrow {
        transform: rotate(180deg);
      }

      .fc-body-wrapper {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.45s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .fc-card.active .fc-body-wrapper {
        grid-template-rows: 1fr;
      }

      .fc-body-inner {
        overflow: hidden;
        padding: 0 20px;
        opacity: 0;
        transition: opacity 0.35s ease 0.1s, transform 0.4s ease 0.1s;
      }

      .fc-col-left .fc-body-inner { transform: translateX(-20px); }
      .fc-col-right .fc-body-inner { transform: translateX(20px); }

      .fc-card.active .fc-body-inner {
        opacity: 1;
        transform: translateX(0);
        padding-bottom: 20px;
        padding-top: 8px;
      }

      .fc-kv-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        text-align: left;
      }

      .fc-kv-row {
        display: grid;
        grid-template-columns: 130px 1fr;
        gap: 10px;
        font-size: 0.92rem;
        line-height: 1.4;
      }

      .fc-key { color: #f5c518; font-weight: 600; }
      .fc-val { color: #fff6e8; }

      .fc-note {
        font-size: 0.82rem;
        color: rgba(255, 246, 232, 0.8);
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px solid rgba(245, 197, 24, 0.2);
        text-align: left;
      }

      .fc-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
      .fc-chip {
        background: rgba(193, 39, 45, 0.35);
        border: 1px solid #c1272d;
        color: #fff6e8;
        padding: 4px 12px;
        border-radius: 50px;
        font-size: 0.82rem;
        font-weight: 500;
      }

      .fc-big-stat {
        font-family: 'Noto Serif JP', serif;
        font-size: 1.15rem;
        color: #f5c518;
        font-weight: 700;
        margin-bottom: 10px;
      }

      .fc-checklist {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.88rem;
      }
      .fc-checklist li::before { content: "✓ "; color: #f5c518; font-weight: bold; }

      .fc-desc { font-size: 0.92rem; color: #fff6e8; margin-bottom: 12px; line-height: 1.5; }

      .fc-bars { display: flex; flex-direction: column; gap: 10px; }
      .fc-bar-item { display: flex; flex-direction: column; gap: 4px; }
      .fc-bar-label { display: flex; justify-content: space-between; font-size: 0.8rem; }
      .fc-bar-label strong { color: #f5c518; }
      .fc-bar-track { width: 100%; height: 7px; background: rgba(255, 255, 255, 0.12); border-radius: 10px; overflow: hidden; }
      .fc-bar-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #c1272d, #f5c518); border-radius: 10px; transition: width 1s cubic-bezier(0.25, 1, 0.5, 1); }

      /* ESCENARIO CENTRAL Y CHEESECAKE SVG */
      .fc-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: sticky;
        top: 100px;
      }

      .fc-cake-box {
        position: relative;
        width: 100%;
        max-width: 420px;
        min-height: 380px;
        aspect-ratio: 420 / 390;
      }

      .fc-svg {
        width: 100%;
        height: 100%;
        min-height: 380px;
        overflow: visible;
        display: block;
        transition: opacity 0.5s ease;
      }

      .fc-real-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 35%;
        border-radius: 24px;
        border: 1px solid rgba(245, 197, 24, 0.4);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 197, 24, 0.15);
        cursor: pointer;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s ease, transform 0.3s ease;
      }

      .fc-real-img:hover { transform: scale(1.02); }

      .fc-cake-box.show-real .fc-svg,
      .fc-cake-box.show-real .fc-spots-layer,
      .fc-cake-box.show-real .fc-overlay,
      .fc-cake-box.show-real .fc-fx-layer {
        opacity: 0 !important;
        pointer-events: none !important;
      }

      .fc-cake-box.show-real .fc-real-img {
        opacity: 1;
        pointer-events: auto;
      }

      .fc-caption {
        font-family: 'Noto Serif JP', serif, Georgia;
        font-size: 0.9rem;
        color: #f5c518;
        text-align: center;
        margin-top: 14px;
        letter-spacing: 1px;
      }

      .fc-spots-layer {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        transition: opacity 0.5s ease;
      }

      .fc-spots-layer svg {
        width: 100%;
        height: 100%;
        pointer-events: auto;
      }

      .fc-spot { cursor: pointer; outline: none; }
      .fc-spot-circle { fill: #c1272d; stroke: #fff6e8; stroke-width: 2px; transition: fill 0.3s, stroke 0.3s; }
      .fc-spot:hover .fc-spot-circle, .fc-spot.active .fc-spot-circle, .fc-spot.highlighted .fc-spot-circle { fill: #f5c518; stroke: #1a0508; }
      .fc-spot:hover text, .fc-spot.active text, .fc-spot.highlighted text { fill: #1a0508; }

      #cake-anim-group { transform-box: view-box; transform-origin: 210px 322px; }
      .jiggle-active #cake-anim-group { animation: souffleJiggle 0.8s ease-in-out infinite; }

      @keyframes souffleJiggle {
        0% { transform: scale(1) skewX(0deg); }
        25% { transform: scale(1.02, 0.98) skewX(-2deg); }
        50% { transform: scale(0.98, 1.02) skewX(2deg); }
        75% { transform: scale(1.01, 0.99) skewX(-1deg); }
        100% { transform: scale(1) skewX(0deg); }
      }

      #cake-top-mover { transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .effect-lift-top #cake-top-mover { transform: translateY(-54px); }

      .fc-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 10; transition: opacity 0.5s ease; }
      .fc-pill {
        position: absolute;
        background: rgba(26, 5, 8, 0.92);
        border: 1px solid #f5c518;
        color: #fff6e8;
        padding: 5px 12px;
        border-radius: 50px;
        font-size: 0.78rem;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        opacity: 0;
        transform: translateY(10px) scale(0.8);
        transition: opacity 0.4s ease, transform 0.4s ease;
      }

      .fc-pill.p1 { top: 8%; left: 6%; }
      .fc-pill.p2 { top: 5%; right: 8%; }
      .fc-pill.p3 { top: 22%; left: 0%; }
      .fc-pill.p4 { top: 18%; right: 2%; }

      .effect-lift-top .fc-pill.p1 { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.1s; }
      .effect-lift-top .fc-pill.p2 { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.2s; }
      .effect-lift-top .fc-pill.p3 { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.3s; }
      .effect-lift-top .fc-pill.p4 { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.4s; }

      .fc-pill.p-cold { top: 10%; left: 50%; transform: translateX(-50%) translateY(10px) scale(0.8); border-color: #70d6ff; }
      .effect-cold .fc-pill.p-cold { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }

      .fc-pill.p-geo { top: 12%; left: 50%; transform: translateX(-50%) translateY(-20px) scale(0.8); border-color: #ff3b3b; }
      .effect-geo .fc-pill.p-geo { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }

      .fc-fx-layer { position: absolute; inset: 0; pointer-events: none; z-index: 5; transition: opacity 0.5s ease; }
      .fc-icon { position: absolute; opacity: 0; transition: opacity 0.4s ease; font-size: 1.2rem; }
      .fc-icon.sn1 { top: 30%; left: 12%; }
      .fc-icon.sn2 { top: 25%; right: 18%; }
      .fc-icon.sn3 { top: 60%; right: 8%; }
      .effect-cold .fc-icon.snow { opacity: 1; animation: floatB 3s infinite ease-in-out; }

      .fc-icon.sp1 { top: 20%; left: 22%; }
      .fc-icon.sp2 { top: 15%; right: 22%; }
      .fc-icon.sp3 { top: 65%; left: 15%; }
      .effect-sparkle .fc-icon.sparkle { opacity: 1; animation: floatB 2s infinite ease-in-out; }

      .fc-icon.lf1 { top: 25%; left: 10%; }
      .fc-icon.lf2 { top: 18%; right: 12%; }
      .fc-icon.lf3 { top: 60%; right: 10%; }
      .effect-leaf .fc-icon.leaf { opacity: 1; animation: floatB 4s infinite ease-in-out; }

      @keyframes floatB {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-8px) rotate(10deg); }
      }

      .fc-media-btns {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        margin-top: 16px;
        width: 100%;
        flex-wrap: wrap;
      }

      .fc-btn-pill {
        padding: 8px 18px;
        border-radius: 50px;
        border: 1.5px solid #f5c518;
        background: transparent;
        color: #f5c518;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s, transform 0.2s, box-shadow 0.3s;
      }

      .fc-btn-pill:hover,
      .fc-btn-pill[aria-pressed="true"] {
        background: #f5c518;
        color: #1a0508;
        box-shadow: 0 0 15px rgba(245, 197, 24, 0.4);
      }

      .fc-btn-toggle {
        background: transparent;
        border: 1.5px solid #f5c518;
        color: #f5c518;
        padding: 12px 28px;
        border-radius: 50px;
        font-weight: 700;
        font-size: 0.9rem;
        transition: background-color 0.3s, color 0.3s, transform 0.2s;
      }

      .fc-btn-toggle:hover {
        background: #f5c518;
        color: #1a0508;
        transform: translateY(-2px);
      }

      .fc-bottom {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 24px;
        margin-top: 50px;
        flex-wrap: wrap;
      }

      .fc-next { font-size: 0.95rem; color: #fff6e8; opacity: 0.85; }

      @media (max-width: 980px) {
        .fc-grid { grid-template-columns: 1fr; gap: 35px; }
        .fc-center { position: relative; top: 0; order: -1; max-width: 400px; margin: 0 auto; }
        .fc-media-btns { flex-direction: column; gap: 10px; }
        .fc-btn-pill { width: 100%; text-align: center; }
      }
    </style>

    <div class="fc-wrap">
      <h2 class="fc-title">Fichas Técnicas</h2>
      <p class="fc-sub">Toca el cheesecake o una ficha para descubrir todos sus detalles.</p>

      <div class="fc-grid">
        <!-- Columna Izquierda -->
        <div class="fc-col fc-col-left">
          <article class="fc-card" data-ficha="1" id="fc-card-1">
            <button class="fc-head" aria-expanded="false" aria-controls="fc-b-1">
              <span class="fc-num">1</span>
              <span class="fc-card-title">Porción</span>
              <span class="fc-arrow">▼</span>
            </button>
            <div class="fc-body-wrapper" id="fc-b-1" role="region">
              <div class="fc-body-inner">
                <div class="fc-kv-list">
                  <div class="fc-kv-row"><span class="fc-key">Producto</span><span class="fc-val">Soufflé Cheesecake artesanal</span></div>
                  <div class="fc-kv-row"><span class="fc-key">Precio proyectado</span><span class="fc-val">$20.000 COP por unidad</span></div>
                  <div class="fc-kv-row"><span class="fc-key">Textura</span><span class="fc-val">Suave, ligera y esponjosa, tipo nube</span></div>
                  <div class="fc-kv-row"><span class="fc-key">Gramaje</span><span class="fc-val">Por definir</span></div>
                </div>
                <p class="fc-note">Presentación pensada para destacar visualmente.</p>
              </div>
            </div>
          </article>

          <article class="fc-card" data-ficha="2" id="fc-card-2">
            <button class="fc-head" aria-expanded="false" aria-controls="fc-b-2">
              <span class="fc-num">2</span>
              <span class="fc-card-title">Ingredientes</span>
              <span class="fc-arrow">▼</span>
            </button>
            <div class="fc-body-wrapper" id="fc-b-2" role="region">
              <div class="fc-body-inner">
                <div class="fc-chips">
                  <span class="fc-chip">Queso crema</span>
                  <span class="fc-chip">Huevos</span>
                  <span class="fc-chip">Leche</span>
                  <span class="fc-chip">Azúcar</span>
                  <span class="fc-chip">Otros de la formulación</span>
                </div>
                <p class="fc-note">La incorporación de claras batidas y el control del horneado dan su estructura aireada.</p>
              </div>
            </div>
          </article>

          <article class="fc-card" data-ficha="3" id="fc-card-3">
            <button class="fc-head" aria-expanded="false" aria-controls="fc-b-3">
              <span class="fc-num">3</span>
              <span class="fc-card-title">Conservación</span>
              <span class="fc-arrow">▼</span>
            </button>
            <div class="fc-body-wrapper" id="fc-b-3" role="region">
              <div class="fc-body-inner">
                <div class="fc-big-stat">≈ 5 días en refrigeración</div>
                <ul class="fc-checklist">
                  <li>Conservación refrigerada (cadena de frío)</li>
                  <li>Limpieza y desinfección</li>
                  <li>Prevención de contaminación cruzada</li>
                  <li>Control de la manipulación</li>
                </ul>
                <p class="fc-note">Vida útil estimada por el proyecto; se validará técnicamente antes de etiquetar.</p>
              </div>
            </div>
          </article>
        </div>

        <!-- Escenario Central -->
        <div class="fc-center">
          <div class="fc-cake-box" id="cake-box">
            
            <div class="fc-overlay">
              <div class="fc-pill p1">🧀 Queso crema</div>
              <div class="fc-pill p2">🥚 Huevos</div>
              <div class="fc-pill p3">🥛 Leche</div>
              <div class="fc-pill p4">☁️ Claras batidas</div>

              <div class="fc-pill p-cold">❄️ ≈ 5 días</div>
              <div class="fc-pill p-geo">📍 Chía · 79,5 %</div>
            </div>

            <div class="fc-fx-layer">
              <span class="fc-icon snow sn1">❄️</span>
              <span class="fc-icon snow sn2">❄️</span>
              <span class="fc-icon snow sn3">❄️</span>
              
              <span class="fc-icon sparkle sp1">✨</span>
              <span class="fc-icon sparkle sp2">✨</span>
              <span class="fc-icon sparkle sp3">✨</span>

              <span class="fc-icon leaf lf1">🌿</span>
              <span class="fc-icon leaf lf2">🍃</span>
              <span class="fc-icon leaf lf3">🌱</span>
            </div>

            <!-- ILUSTRACIÓN SVG DEL CHEESECAKE -->
            <svg viewBox="0 0 420 390" class="fc-svg" id="fc-svg-elem" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="fc-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#000000" flood-opacity="0.45"/>
                </filter>
                <filter id="fc-plate-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.35"/>
                </filter>

                <linearGradient id="g-plate" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#ffffff"/>
                  <stop offset="70%" stop-color="#f0ece1"/>
                  <stop offset="100%" stop-color="#d8d2c2"/>
                </linearGradient>

                <linearGradient id="g-cake-body" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#fae3a8"/>
                  <stop offset="50%" stop-color="#edd083"/>
                  <stop offset="100%" stop-color="#d49c4a"/>
                </linearGradient>

                <linearGradient id="g-cake-top" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f6c566"/>
                  <stop offset="45%" stop-color="#d8903b"/>
                  <stop offset="100%" stop-color="#b56a25"/>
                </linearGradient>

                <radialGradient id="g-sakura" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#ffffff"/>
                  <stop offset="60%" stop-color="#ffb7c5"/>
                  <stop offset="100%" stop-color="#e65c7b"/>
                </radialGradient>
              </defs>

              <g filter="url(#fc-plate-shadow)">
                <ellipse id="cold-aura-ring" cx="210" cy="318" rx="175" ry="42" fill="none" stroke="#70d6ff" stroke-width="3.5" opacity="0"/>
                <ellipse cx="210" cy="318" rx="165" ry="40" fill="url(#g-plate)"/>
                <ellipse cx="210" cy="318" rx="148" ry="34" fill="none" stroke="#e3ded0" stroke-width="1.8"/>
              </g>

              <g id="cake-anim-group">
                <g filter="url(#fc-shadow)">
                  <path d="M 75,225 C 75,295 345,295 345,225 L 345,155 C 345,225 75,225 75,155 Z" fill="url(#g-cake-body)"/>
                  <g fill="#b57e33" opacity="0.35">
                    <circle cx="115" cy="205" r="2"/><circle cx="150" cy="232" r="1.5"/><circle cx="185" cy="215" r="2.5"/>
                    <circle cx="225" cy="245" r="1.8"/><circle cx="270" cy="210" r="2.2"/><circle cx="305" cy="228" r="1.8"/>
                  </g>
                </g>

                <g id="cake-top-mover">
                  <g>
                    <ellipse cx="210" cy="155" rx="135" ry="58" fill="url(#g-cake-top)"/>
                    <ellipse cx="210" cy="155" rx="133" ry="56" fill="none" stroke="#ffe5a3" stroke-width="1.2" opacity="0.6"/>

                    <g fill="#ffffff" opacity="0.8">
                      <circle cx="175" cy="138" r="1.2"/><circle cx="192" cy="164" r="1.5"/><circle cx="235" cy="134" r="1.2"/>
                      <circle cx="260" cy="158" r="1"/><circle cx="142" cy="150" r="1.4"/><circle cx="210" cy="172" r="1.6"/>
                    </g>

                    <path id="slice-overlay" d="M 210,155 L 142,192 C 168,208 210,212 235,204 Z" fill="rgba(245, 197, 24, 0.35)" stroke="#f5c518" stroke-width="2" stroke-dasharray="4,3" opacity="0"/>

                    <g transform="translate(210, 138) scale(0.65)">
                      <path d="M0,0 C-10,-18 -18,-35 0,-48 C18,-35 10,-18 0,0" fill="url(#g-sakura)"/>
                      <path d="M0,0 C-10,-18 -18,-35 0,-48 C18,-35 10,-18 0,0" fill="url(#g-sakura)" transform="rotate(72)"/>
                      <path d="M0,0 C-10,-18 -18,-35 0,-48 C18,-35 10,-18 0,0" fill="url(#g-sakura)" transform="rotate(144)"/>
                      <path d="M0,0 C-10,-18 -18,-35 0,-48 C18,-35 10,-18 0,0" fill="url(#g-sakura)" transform="rotate(216)"/>
                      <path d="M0,0 C-10,-18 -18,-35 0,-48 C18,-35 10,-18 0,0" fill="url(#g-sakura)" transform="rotate(288)"/>
                      <circle cx="0" cy="0" r="4.5" fill="#d93856"/>
                    </g>
                  </g>
                </g>
              </g>
            </svg>

            <!-- Capa de Puntos Numerados -->
            <div class="fc-spots-layer" id="spots-layer">
              <svg viewBox="0 0 420 390" xmlns="http://www.w3.org/2000/svg">
                <g class="fc-spot" data-spot="1">
                  <g transform="translate(88, 150)">
                    <circle cx="0" cy="0" r="14" class="fc-spot-circle"/>
                    <text x="0" y="4.5" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="12">1</text>
                  </g>
                </g>

                <g class="fc-spot" data-spot="2">
                  <g transform="translate(68, 205)">
                    <circle cx="0" cy="0" r="14" class="fc-spot-circle"/>
                    <text x="0" y="4.5" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="12">2</text>
                  </g>
                </g>

                <g class="fc-spot" data-spot="3">
                  <g transform="translate(105, 262)">
                    <circle cx="0" cy="0" r="14" class="fc-spot-circle"/>
                    <text x="0" y="4.5" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="12">3</text>
                  </g>
                </g>

                <g class="fc-spot" data-spot="4">
                  <g transform="translate(332, 150)">
                    <circle cx="0" cy="0" r="14" class="fc-spot-circle"/>
                    <text x="0" y="4.5" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="12">4</text>
                  </g>
                </g>

                <g class="fc-spot" data-spot="5">
                  <g transform="translate(352, 205)">
                    <circle cx="0" cy="0" r="14" class="fc-spot-circle"/>
                    <text x="0" y="4.5" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="12">5</text>
                  </g>
                </g>

                <g class="fc-spot" data-spot="6">
                  <g transform="translate(315, 262)">
                    <circle cx="0" cy="0" r="14" class="fc-spot-circle"/>
                    <text x="0" y="4.5" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="12">6</text>
                  </g>
                </g>
              </svg>
            </div>

            <!-- Elemento Foto Real -->
            <img src="IMG/cheescake.jpeg" alt="Soufflé Cheesecake horneado, con la parte superior dorada, sobre una rejilla de enfriado" class="fc-real-img" id="fc-real-img" loading="lazy">
          </div>

          <p class="fc-caption" id="fc-caption">Soufflé Cheesecake · inspiración japonesa</p>

          <!-- Fila de Botones Píldora -->
          <div class="fc-media-btns">
            <button class="fc-btn-pill" id="btn-toggle-photo" aria-pressed="false">📷 Foto real</button>
            <button class="fc-btn-pill" id="btn-open-flowchart">📋 Proceso de elaboración</button>
          </div>
        </div>

        <!-- Columna Derecha -->
        <div class="fc-col fc-col-right">
          <article class="fc-card" data-ficha="4" id="fc-card-4">
            <button class="fc-head" aria-expanded="false" aria-controls="fc-b-4">
              <span class="fc-num">4</span>
              <span class="fc-card-title">Innovación</span>
              <span class="fc-arrow">▼</span>
            </button>
            <div class="fc-body-wrapper" id="fc-b-4" role="region">
              <div class="fc-body-inner">
                <p class="fc-desc">Repostería artesanal de inspiración japonesa, con receta estandarizada y textura distintiva.</p>
                <div class="fc-bars">
                  <div class="fc-bar-item">
                    <div class="fc-bar-label"><span>Prefiere postres esponjosos</span> <strong>73,7 %</strong></div>
                    <div class="fc-bar-track"><div class="fc-bar-fill" data-progress="73.7"></div></div>
                  </div>
                  <div class="fc-bar-item">
                    <div class="fc-bar-label"><span>Probaría un postre tipo nube</span> <strong>86,6 %</strong></div>
                    <div class="fc-bar-track"><div class="fc-bar-fill" data-progress="86.6"></div></div>
                  </div>
                  <div class="fc-bar-item">
                    <div class="fc-bar-label"><span>Interesado en postres innovadores</span> <strong>85,3 %</strong></div>
                    <div class="fc-bar-track"><div class="fc-bar-fill" data-progress="85.3"></div></div>
                  </div>
                  <div class="fc-bar-item">
                    <div class="fc-bar-label"><span>Pide más variedad escolar</span> <strong>84,8 %</strong></div>
                    <div class="fc-bar-track"><div class="fc-bar-fill" data-progress="84.8"></div></div>
                  </div>
                </div>
                <p class="fc-note">Preferencias declaradas en la encuesta del proyecto; no son ventas garantizadas.</p>
              </div>
            </div>
          </article>

          <article class="fc-card" data-ficha="5" id="fc-card-5">
            <button class="fc-head" aria-expanded="false" aria-controls="fc-b-5">
              <span class="fc-num">5</span>
              <span class="fc-card-title">Nutrición</span>
              <span class="fc-arrow">▼</span>
            </button>
            <div class="fc-body-wrapper" id="fc-b-5" role="region">
              <div class="fc-body-inner">
                <div class="fc-kv-list">
                  <div class="fc-kv-row"><span class="fc-key">Calorías</span><span class="fc-val">Por definir</span></div>
                  <div class="fc-kv-row"><span class="fc-key">Azúcares</span><span class="fc-val">Por definir</span></div>
                  <div class="fc-kv-row"><span class="fc-key">Contiene</span><span class="fc-val">Lácteos y huevo (según ingredientes listados)</span></div>
                </div>
                <p class="fc-note">Ingredientes frescos y de calidad; el proyecto considera su responsabilidad social y nutricional.</p>
              </div>
            </div>
          </article>

          <article class="fc-card" data-ficha="6" id="fc-card-6">
            <button class="fc-head" aria-expanded="false" aria-controls="fc-b-6">
              <span class="fc-num">6</span>
              <span class="fc-card-title">Datos adicionales</span>
              <span class="fc-arrow">▼</span>
            </button>
            <div class="fc-body-wrapper" id="fc-b-6" role="region">
              <div class="fc-body-inner">
                <div class="fc-kv-list">
                  <div class="fc-kv-row"><span class="fc-key">Inicio</span><span class="fc-val">Chía y la Sabana de Bogotá</span></div>
                  <div class="fc-kv-row"><span class="fc-key">Expansión</span><span class="fc-val">Bogotá y otros municipios de Cundinamarca</span></div>
                  <div class="fc-kv-row"><span class="fc-key">Público</span><span class="fc-val">Niños, jóvenes y adultos</span></div>
                  <div class="fc-kv-row"><span class="fc-key">Encuesta</span><span class="fc-val">79,5 % de las respuestas vive en Chía</span></div>
                </div>
                <p class="fc-note">Calidad: estandarización de receta, selección de materias primas y buenas prácticas de manufactura.</p>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div class="fc-bottom">
        <button class="fc-btn-toggle" id="btn-toggle-all" aria-expanded="false">Abrir todas las fichas</button>
        <span class="fc-next">🍵 Próximamente: nuevo sabor</span>
      </div>
    </div>
  `;

  shadow.appendChild(template.content.cloneNode(true));

  // Referencias Internas
  const cards = shadow.querySelectorAll('.fc-card');
  const spots = shadow.querySelectorAll('.fc-spot');
  const cakeBox = shadow.getElementById('cake-box');
  const caption = shadow.getElementById('fc-caption');
  const realImg = shadow.getElementById('fc-real-img');
  const btnTogglePhoto = shadow.getElementById('btn-toggle-photo');
  const btnOpenFlowchart = shadow.getElementById('btn-open-flowchart');
  const btnToggleAll = shadow.getElementById('btn-toggle-all');
  const sliceOverlay = shadow.getElementById('slice-overlay');
  const coldRing = shadow.getElementById('cold-aura-ring');

  let activeFichaNum = null;
  let isPhotoShowing = false;

  function setFicha(num, forceState = null) {
    const card = shadow.getElementById(`fc-card-${num}`);
    if (!card) return;

    const btn = card.querySelector('.fc-head');
    const isCurrentlyActive = card.classList.contains('active');
    const open = forceState !== null ? forceState : !isCurrentlyActive;

    if (open) {
      card.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      activeFichaNum = num;

      if (num === 4) {
        card.querySelectorAll('.fc-bar-fill').forEach(f => {
          f.style.width = '0%';
          setTimeout(() => f.style.width = f.dataset.progress + '%', 80);
        });
      }

      if (window.innerWidth <= 980 && forceState === null) {
        setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 200);
      }
    } else {
      card.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');

      if (activeFichaNum === num) {
        const remaining = shadow.querySelectorAll('.fc-card.active');
        activeFichaNum = remaining.length ? parseInt(remaining[remaining.length - 1].dataset.ficha, 10) : null;
      }
    }

    syncSpots();
    updateEffects();
    updateToggleBtn();
  }

  function syncSpots() {
    spots.forEach(s => {
      const n = parseInt(s.dataset.spot, 10);
      const card = shadow.getElementById(`fc-card-${n}`);
      s.classList.toggle('active', !!(card && card.classList.contains('active')));
    });
  }

  function updateEffects() {
    cakeBox.classList.remove(
      'effect-lift-top',
      'effect-cold',
      'jiggle-active',
      'effect-sparkle',
      'effect-leaf',
      'effect-geo'
    );
    if (sliceOverlay) sliceOverlay.style.opacity = '0';
    if (coldRing) coldRing.style.opacity = '0';

    if (!activeFichaNum || isPhotoShowing) return;

    switch (activeFichaNum) {
      case 1:
        if (sliceOverlay) sliceOverlay.style.opacity = '1';
        break;
      case 2:
        cakeBox.classList.add('effect-lift-top');
        break;
      case 3:
        cakeBox.classList.add('effect-cold');
        if (coldRing) coldRing.style.opacity = '1';
        break;
      case 4:
        cakeBox.classList.add('jiggle-active', 'effect-sparkle');
        break;
      case 5:
        cakeBox.classList.add('effect-leaf');
        break;
      case 6:
        cakeBox.classList.add('effect-geo');
        break;
    }
  }

  function updateToggleBtn() {
    if (!btnToggleAll) return;
    const allOpen = Array.from(cards).every(c => c.classList.contains('active'));
    btnToggleAll.textContent = allOpen ? 'Cerrar todas las fichas' : 'Abrir todas las fichas';
    btnToggleAll.setAttribute('aria-expanded', String(allOpen));
  }

  function dispatchLightbox(detail) {
    mountPoint.dispatchEvent(new CustomEvent('rp:lightbox', {
      bubbles: true,
      composed: true,
      detail: detail
    }));
  }

  if (btnTogglePhoto) {
    btnTogglePhoto.addEventListener('click', () => {
      isPhotoShowing = !isPhotoShowing;
      btnTogglePhoto.setAttribute('aria-pressed', String(isPhotoShowing));

      if (isPhotoShowing) {
        cakeBox.classList.add('show-real');
        btnTogglePhoto.textContent = '🎨 Ver ilustración';
        caption.textContent = 'Foto real de nuestro Soufflé Cheesecake';
      } else {
        cakeBox.classList.remove('show-real');
        btnTogglePhoto.textContent = '📷 Foto real';
        caption.textContent = 'Soufflé Cheesecake · inspiración japonesa';
      }
      updateEffects();
    });
  }

  if (realImg) {
    realImg.addEventListener('click', () => {
      dispatchLightbox({
        src: 'IMG/cheescake.jpeg',
        alt: 'Soufflé Cheesecake horneado, con la parte superior dorada, sobre una rejilla de enfriado',
        title: 'Soufflé Cheesecake Real',
        caption: 'Fotografía real del producto recién horneado y reposado en rejilla de enfriado.'
      });
    });
  }

  if (btnOpenFlowchart) {
    btnOpenFlowchart.addEventListener('click', () => {
      dispatchLightbox({
        src: 'IMG/diagrama-flujo.png',
        alt: 'Diagrama de flujo del proceso de elaboración, desde recibir y verificar materias primas hasta hornear, enfriar, desmoldar, porcionar, empacar y almacenar',
        title: 'Proceso de elaboración del Soufflé Cheesecake',
        caption: 'Diagrama de flujo: desde la recepción de materias primas hasta el almacenamiento.'
      });
    });
  }

  cards.forEach(card => {
    const num = parseInt(card.dataset.ficha, 10);
    const head = card.querySelector('.fc-head');
    if (head) head.addEventListener('click', () => setFicha(num));

    card.addEventListener('mouseenter', () => {
      const spot = shadow.querySelector(`.fc-spot[data-spot="${num}"]`);
      if (spot) spot.classList.add('highlighted');
      card.classList.add('highlighted');
    });

    card.addEventListener('mouseleave', () => {
      const spot = shadow.querySelector(`.fc-spot[data-spot="${num}"]`);
      if (spot) spot.classList.remove('highlighted');
      card.classList.remove('highlighted');
    });
  });

  spots.forEach(spot => {
    const num = parseInt(spot.dataset.spot, 10);
    spot.addEventListener('click', () => setFicha(num));

    spot.addEventListener('mouseenter', () => {
      const card = shadow.getElementById(`fc-card-${num}`);
      if (card) card.classList.add('highlighted');
      spot.classList.add('highlighted');
    });

    spot.addEventListener('mouseleave', () => {
      const card = shadow.getElementById(`fc-card-${num}`);
      if (card) card.classList.remove('highlighted');
      spot.classList.remove('highlighted');
    });
  });

  if (btnToggleAll) {
    btnToggleAll.addEventListener('click', () => {
      const allOpen = Array.from(cards).every(c => c.classList.contains('active'));
      cards.forEach(c => setFicha(parseInt(c.dataset.ficha, 10), !allOpen));
    });
  }
})();
/* ==========================================
   10. MÓDULO DE MÚSICA DE FONDO (MULTIPISTA)
   ========================================== */
(function initBackgroundAudio() {
  if (document.getElementById('rp-music')) return;

  const container = document.createElement('div');
  container.id = 'rp-music';
  container.style.position = 'fixed';
  container.style.bottom = '18px';
  container.style.left = '18px';
  container.style.zIndex = '2147483647';
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: 'open' });

  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host {
        all: initial;
        display: block;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        box-sizing: border-box;
      }

      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .music-widget {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .music-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: #2a0a0c;
        border: 2px solid #f5c518;
        color: #f5c518;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        transition: transform 0.25s ease, background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
        outline: none;
      }

      .music-btn:hover {
        background-color: #f5c518;
        color: #2a0a0c;
        transform: scale(1.08);
        border-color: #ffe5a3;
      }

      .music-btn:focus-visible {
        outline: 2px solid #fff6e8;
        outline-offset: 3px;
      }

      /* Botón secundario para cambiar de canción */
      .next-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: #2a0a0c;
        border: 1.5px solid #f5c518;
        color: #f5c518;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
      }

      .next-btn:hover {
        background-color: #f5c518;
        color: #2a0a0c;
        transform: scale(1.06);
      }

      /* Icono de altavoz tachado (Mute) */
      .mute-icon {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }

      /* Barras de Ecualizador (Sound On) */
      .eq-bars {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: 3px;
        width: 20px;
        height: 20px;
      }

      .eq-bar {
        width: 3.5px;
        height: 100%;
        background-color: currentColor;
        border-radius: 2px;
        animation: eqPulse 1.2s infinite ease-in-out alternate;
      }

      .eq-bar:nth-child(1) { animation-delay: 0.1s; }
      .eq-bar:nth-child(2) { animation-delay: 0.4s; }
      .eq-bar:nth-child(3) { animation-delay: 0.2s; }
      .eq-bar:nth-child(4) { animation-delay: 0.6s; }

      @keyframes eqPulse {
        0% { height: 25%; }
        100% { height: 100%; }
      }

      /* Aviso emergente */
      .music-toast {
        position: absolute;
        left: calc(100% + 12px);
        bottom: 4px;
        background: rgba(26, 5, 8, 0.95);
        border: 1px solid rgba(245, 197, 24, 0.5);
        color: #fff6e8;
        padding: 8px 14px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        opacity: 0;
        transform: translateX(-8px);
        pointer-events: none;
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 20;
      }

      .music-toast.show {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
      }

      @media (prefers-reduced-motion: reduce) {
        .eq-bar { animation: none !important; height: 75% !important; }
        .music-btn, .next-btn { transition: none !important; }
      }
    </style>

    <div class="music-widget">
      <button class="music-btn" id="music-toggle-btn" aria-expanded="false" aria-label="Activar música de fondo">
        <svg class="mute-icon" id="icon-mute" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.63 3.63a.996.996 0 0 0 0 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l4.29 4.29c.63.63 1.71.18 1.71-.71v-3.17l4.63 4.63c-.53.37-1.13.65-1.78.82-.41.11-.66.53-.55.94.11.41.53.66.94.55 1.05-.28 2.01-.78 2.82-1.43l1.98 1.98c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.04 3.63a.996.996 0 0 0-1.41 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.74zm-8-6.74V4.11c0-.89-1.08-1.34-1.71-.71L6.85 6.15 11 10.26V5.26z"/>
        </svg>
        <div class="eq-bars" id="icon-eq" style="display: none;">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
      </button>
      
      <!-- Botón opcional para pasar a la siguiente canción -->
      <button class="next-btn" id="music-next-btn" title="Siguiente canción" aria-label="Siguiente canción">⏭</button>

      <div class="music-toast" id="music-toast-msg">🎵 Toca para activar la música</div>
    </div>
  `;

  shadow.appendChild(template.content.cloneNode(true));

  const btn = shadow.getElementById('music-toggle-btn');
  const nextBtn = shadow.getElementById('music-next-btn');
  const iconMute = shadow.getElementById('icon-mute');
  const iconEq = shadow.getElementById('icon-eq');
  const toast = shadow.getElementById('music-toast-msg');

  // ==========================================
  // LISTA DE CANCIONES (¡CORREGIDA CON COMAS!)
  // ==========================================
  const playlist = [
    { src: 'audio/dojo.mp3', title: 'Dojo (Club Penguin)' },
    { src: 'audio/Ice.mp3', title: 'Cardjitsu hielo (Club penguin)' },
    { src: 'audio/volcan.mp3', title: 'Cardjitsu Fuego (Club penguin)' }
  ];

  let currentTrackIndex = 0;
  let audio = new Audio(playlist[currentTrackIndex].src);
  audio.loop = false;
  audio.preload = 'auto';

  let isPlaying = false;
  let audioErrorOccurred = false;
  let toastTimeout = null;

  function showToast(text, duration = 4000) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.textContent = text;
    toast.classList.add('show');
    if (duration > 0) {
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    }
  }

  function hideToast() {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.classList.remove('show');
  }

  function setUIApiPlaying(playing) {
    isPlaying = playing;
    if (playing) {
      iconMute.style.display = 'none';
      iconEq.style.display = 'flex';
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Silenciar música de fondo');
    } else {
      iconMute.style.display = 'block';
      iconEq.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Activar música de fondo');
    }
  }

  function loadTrack(index) {
    const wasPlaying = isPlaying;
    audio.pause();
    currentTrackIndex = index;
    audio = new Audio(playlist[currentTrackIndex].src);
    audio.preload = 'auto';
    
    audio.addEventListener('ended', () => {
      let nextIndex = (currentTrackIndex + 1) % playlist.length;
      loadTrack(nextIndex);
      if (wasPlaying) playMusic();
    });

    audio.addEventListener('error', () => {
      audioErrorOccurred = true;
      setUIApiPlaying(false);
      showToast(`No se encontró: ${playlist[currentTrackIndex].src}`, 0);
    });

    if (wasPlaying) {
      playMusic();
    }
  }

  audio.addEventListener('ended', () => {
    let nextIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(nextIndex);
    if (isPlaying) playMusic();
  });

  audio.addEventListener('error', () => {
    audioErrorOccurred = true;
    setUIApiPlaying(false);
    showToast(`No se encontró el audio`, 0);
  });

  function fadeVolume(targetVolume, duration, callback) {
    const startVolume = audio.volume;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = (targetVolume - startVolume) / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(0, Math.min(1, startVolume + (volumeStep * currentStep)));
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.volume = targetVolume;
        if (callback) callback();
      }
    }, stepTime);
  }

  function playMusic() {
    if (audioErrorOccurred) return;
    audio.volume = 0;
    audio.play().then(() => {
      setUIApiPlaying(true);
      fadeVolume(0.25, 1500);
      showToast(`Reproduciendo: ${playlist[currentTrackIndex].title}`, 3000);
    }).catch(() => {});
  }

  function pauseMusic() {
    if (audioErrorOccurred) return;
    fadeVolume(0, 400, () => {
      audio.pause();
      setUIApiPlaying(false);
    });
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideToast();
    if (audioErrorOccurred) return;

    if (isPlaying) {
      pauseMusic();
      showToast('Música pausada', 2000);
    } else {
      playMusic();
    }
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audioErrorOccurred) return;
    let nextIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(nextIndex);
    if (isPlaying) {
      playMusic();
    } else {
      showToast(`Siguiente: ${playlist[nextIndex].title}`, 3000);
    }
  });

  audio.volume = 0;
  audio.play().then(() => {
    setUIApiPlaying(true);
    fadeVolume(0.25, 1500);
  }).catch(() => {
    showToast('🎵 Toca la pantalla para activar la música', 5000);

    const handleFirstGesture = (e) => {
      if (e.composedPath && (e.composedPath().includes(btn) || e.composedPath().includes(nextBtn))) return;
      playMusic();
      removeGestureListeners();
    };

    const options = { capture: true, once: true };
    window.addEventListener('pointerdown', handleFirstGesture, options);
    window.addEventListener('keydown', handleFirstGesture, options);
    window.addEventListener('touchstart', handleFirstGesture, options);

    function removeGestureListeners() {
      window.removeEventListener('pointerdown', handleFirstGesture, { capture: true });
      window.removeEventListener('keydown', handleFirstGesture, { capture: true });
      window.removeEventListener('touchstart', handleFirstGesture, { capture: true });
    }
  });
})();