// Job-Ready Program — landing page behavior.

var WHATSAPP_NUMBER = '918951367357';
var WHATSAPP_MESSAGE = "Hi, I'd like to reserve my seat for the Job-Ready Program (Batch 1).";
var BATCH_START_DATE = '2026-08-10T00:00:00+05:30';

document.addEventListener('DOMContentLoaded', function () {
  initNav();
  initAccordions();
  initStickyCta();
  initWhatsAppCtas();
  initScrollEffects();
  initEnrollmentCountdown();
  trackViewContent();
});

// ---------------------------------------------------------------------------
// Top navigation — mobile menu toggle, close-on-link-click, active-link highlight
// ---------------------------------------------------------------------------
function initNav() {
  var header = document.getElementById('site-header');
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!header || !toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('.site-nav__link, .site-nav__cta').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  var navLinks = nav.querySelectorAll('.site-nav__link');
  var sections = Array.prototype.map
    .call(navLinks, function (link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }
}

// ---------------------------------------------------------------------------
// Scroll-reveal (AOS) + 3D tilt cards (Vanilla-Tilt) + header shadow on scroll
// ---------------------------------------------------------------------------
function initScrollEffects() {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 600, once: true, offset: 40 });
  }

  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
      speed: 400,
      scale: 1.02
    });
  }

  var header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    });
  }
}

// ---------------------------------------------------------------------------
// Accordion (curriculum + FAQ)
// ---------------------------------------------------------------------------
function initAccordions() {
  var triggers = document.querySelectorAll('.accordion-trigger');
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });
}

// ---------------------------------------------------------------------------
// Sticky mobile CTA — hides once the pricing/reserve section is in view
// ---------------------------------------------------------------------------
function initStickyCta() {
  var stickyCta = document.getElementById('sticky-cta');
  var reserveSection = document.getElementById('reserve');
  if (!stickyCta || !reserveSection || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        stickyCta.classList.toggle('is-hidden', entry.isIntersecting);
      });
    },
    { threshold: 0.15 }
  );
  observer.observe(reserveSection);
}

// ---------------------------------------------------------------------------
// Enrollment countdown — days remaining until the batch start date
// ---------------------------------------------------------------------------
function initEnrollmentCountdown() {
  var targets = document.querySelectorAll('.js-days-left');
  if (!targets.length) return;

  var msPerDay = 1000 * 60 * 60 * 24;
  var diff = new Date(BATCH_START_DATE).getTime() - Date.now();
  var daysLeft = Math.ceil(diff / msPerDay);

  var text;
  if (daysLeft > 1) {
    text = daysLeft + ' days left to enroll';
  } else if (daysLeft === 1) {
    text = '1 day left to enroll';
  } else {
    text = 'Enrollment closing soon';
  }

  targets.forEach(function (el) {
    el.textContent = text;
  });
}

// ---------------------------------------------------------------------------
// WhatsApp CTAs — set the deep link href, track a Lead event on click
// ---------------------------------------------------------------------------
function initWhatsAppCtas() {
  var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE);

  document.querySelectorAll('.whatsapp-cta').forEach(function (cta) {
    cta.href = url;
    cta.addEventListener('click', trackLeadEvent);
  });
}

// ---------------------------------------------------------------------------
// Meta Pixel / GA4 event tracking
// Guarded with typeof checks so nothing breaks before the real IDs are added.
// ---------------------------------------------------------------------------
function trackViewContent() {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'ViewContent', { content_name: 'Job-Ready Program Landing Page' });
  }
  if (typeof gtag !== 'undefined') {
    gtag('event', 'view_content', { content_name: 'Job-Ready Program Landing Page' });
  }
}

function trackLeadEvent() {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'Lead', {
      content_name: 'Job-Ready Program',
      value: 8999,
      currency: 'INR'
    });
  }
  if (typeof gtag !== 'undefined') {
    gtag('event', 'generate_lead', {
      content_name: 'Job-Ready Program',
      value: 8999,
      currency: 'INR'
    });
  }
}
