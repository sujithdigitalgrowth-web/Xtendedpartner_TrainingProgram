// Job-Ready Program — registration flow (/register.html)
// Vanilla JS, no dependencies. Renders one step at a time into #register-root.

var WHATSAPP_NUMBER = '918951367357';

// Google Apps Script "Web App" URL that appends each lead as a row in a Google Sheet.
// Paste the deployed /exec URL here once the Apps Script webhook is set up.
var LEADS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwSsIhgsIdl5O_XE8vXY2KuGWmnWJIE4kMf80VjYs7CWJth9xJNEC6muRqOMCzCtdsS/exec';

// Which program this registration is for — driven by ?program=one-on-one on the URL.
// Falls back to the group Job-Ready Program for any other/missing value.
var PROGRAM = new URLSearchParams(window.location.search).get('program') === 'one-on-one' ? 'one-on-one' : 'group';

var PROGRAM_INFO = {
  group: {
    name: 'Job-Ready Program',
    tag: 'Job-Ready Program',
    price: 8999,
    clarifyHeadline: 'This Is a Job-Ready Program, Not a Job Placement Guarantee',
    clarifyBody: 'We prepare you to be genuinely interview-ready &mdash; through hands-on training, live account experience, 9 industry certifications, and 3 full mock interview rounds. What we do not do is guarantee you a job or placement. Your outcome depends on your own effort and performance in interviews.',
    commitmentQuestion: 'This program runs live, Monday&ndash;Friday, for 50 days. Can you commit to that?',
    slotQuestion: {
      text: 'Which slot would you like to join?',
      options: ['Morning: 8 AM – 9.30 AM', 'Evening: 6 PM – 7.30 PM']
    }
  },
  'one-on-one': {
    name: '1-on-1 Advanced Training',
    tag: '1-on-1 Advanced Training',
    price: 19999,
    clarifyHeadline: 'This Is a 1-on-1 Advanced Training, Not a Job Placement Guarantee',
    clarifyBody: 'We prepare you to be genuinely interview-ready &mdash; through personalized 1-on-1 training, live account experience, advanced modules like Google Tag Manager, media planning &amp; AI-powered performance decks, 9 industry certifications, and full mock interview rounds. What we do not do is guarantee you a job or placement. Your outcome depends on your own effort and performance in interviews.',
    commitmentQuestion: 'This is a 50-day program that needs consistent, regular commitment on your side. Can you commit to that?',
    slotQuestion: {
      text: 'What time of day generally works best for your 1-on-1 sessions?',
      options: ['Morning', 'Afternoon', 'Evening', 'Flexible / not sure yet']
    }
  }
};

var registerState = {
  step: 0,
  clarifyAcknowledged: false,
  answers: {
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    slot: null,
    name: '',
    whatsapp: '',
    email: ''
  }
};

var CURRENT_PROGRAM = PROGRAM_INFO[PROGRAM];

var QUESTIONS = [
  {
    key: 'q1',
    type: 'select',
    text: 'What best describes you right now?',
    options: ['Student', 'Recent Graduate', 'Working Professional', 'Career Break / Switching']
  },
  {
    key: 'q2',
    type: 'select',
    text: 'When did you graduate (or expect to)?',
    options: ['2026', '2025', '2024', 'Before 2024', 'Currently Studying']
  },
  {
    key: 'q3',
    type: 'select',
    text: "What's your experience with digital marketing so far?",
    options: ['None — complete beginner', 'Self-taught / done free courses', 'Some work experience', 'Currently working in marketing']
  },
  {
    key: 'q4',
    type: 'select',
    text: CURRENT_PROGRAM.commitmentQuestion,
    options: ['Yes, definitely', 'Mostly, with occasional misses', 'Not sure yet']
  },
  {
    key: 'slot',
    type: 'select',
    text: CURRENT_PROGRAM.slotQuestion.text,
    options: CURRENT_PROGRAM.slotQuestion.options
  },
  {
    key: 'q6',
    type: 'contact',
    text: 'Almost there — how can we reach you?'
  }
];

document.addEventListener('DOMContentLoaded', function () {
  applyProgramBranding();
  renderStep(0);
});

// ---------------------------------------------------------------------------
// Reflect the selected program in the page chrome (title + header brand tag)
// ---------------------------------------------------------------------------
function applyProgramBranding() {
  document.title = 'Register — ' + CURRENT_PROGRAM.name + ' | Xtended Partner';
  var brandTag = document.querySelector('.register-header__brand .site-header__brand-tag');
  if (brandTag) brandTag.textContent = CURRENT_PROGRAM.tag;
}

// ---------------------------------------------------------------------------
// Step router
// ---------------------------------------------------------------------------
function renderStep(step) {
  registerState.step = step;
  if (step === 0) return renderClarify();
  if (step >= 1 && step <= QUESTIONS.length) return renderQuestion(step);
  return renderConfirm();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Section 1 — Program clarification (mandatory)
// ---------------------------------------------------------------------------
function renderClarify() {
  var root = document.getElementById('register-root');
  if (!root) return;

  root.innerHTML =
    '<section class="clarify register-step" aria-labelledby="clarify-heading">' +
      '<p class="clarify__eyebrow">Before You Continue</p>' +
      '<h1 class="clarify__headline" id="clarify-heading">' + CURRENT_PROGRAM.clarifyHeadline + '</h1>' +
      '<p class="clarify__body">' + CURRENT_PROGRAM.clarifyBody + '</p>' +
      '<p class="clarify__note">Takes about 30 seconds</p>' +
      '<label class="clarify__checkbox" for="clarify-checkbox">' +
        '<input type="checkbox" id="clarify-checkbox">' +
        '<span>I understand this is a training program focused on interview readiness, not a job placement guarantee.</span>' +
      '</label>' +
      '<button type="button" class="btn btn--primary btn--large clarify__continue" id="clarify-continue" disabled>Continue</button>' +
    '</section>';

  var checkbox = document.getElementById('clarify-checkbox');
  var continueBtn = document.getElementById('clarify-continue');

  checkbox.checked = registerState.clarifyAcknowledged;
  continueBtn.disabled = !registerState.clarifyAcknowledged;

  checkbox.addEventListener('change', function () {
    registerState.clarifyAcknowledged = checkbox.checked;
    continueBtn.disabled = !checkbox.checked;
  });

  continueBtn.addEventListener('click', function () {
    if (continueBtn.disabled) return;
    renderStep(1);
  });
}

// ---------------------------------------------------------------------------
// Section 2 — Qualifying questions (one per screen)
// ---------------------------------------------------------------------------
function renderQuestion(step) {
  var root = document.getElementById('register-root');
  if (!root) return;

  var q = QUESTIONS[step - 1];
  var progressPct = Math.round((step / QUESTIONS.length) * 100);

  var topBar =
    '<div class="qual__top">' +
      '<button type="button" class="qual__back" id="qual-back">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>' +
        'Back' +
      '</button>' +
      '<span class="qual__progress-label">Step ' + step + ' of ' + QUESTIONS.length + '</span>' +
    '</div>' +
    '<div class="qual__progress-track"><div class="qual__progress-fill" style="width:' + progressPct + '%"></div></div>';

  var bodyHtml = '';
  if (q.type === 'select') {
    bodyHtml =
      '<h2 class="qual__question">' + escapeHtml(q.text) + '</h2>' +
      '<div class="qual__options" id="qual-options">' +
      q.options.map(function (opt, idx) {
        var selected = registerState.answers[q.key] === opt ? ' is-selected' : '';
        var letter = String.fromCharCode(65 + idx);
        return '<button type="button" class="qual__option' + selected + '" data-value="' + escapeHtml(opt) + '">' +
          '<span class="qual__option-index">' + letter + '</span>' +
          '<span class="qual__option-label">' + escapeHtml(opt) + '</span>' +
          '</button>';
      }).join('') +
      '</div>';
  } else if (q.type === 'contact') {
    bodyHtml =
      '<h2 class="qual__question">' + escapeHtml(q.text) + '</h2>' +
      '<div class="qual__field">' +
        '<label class="qual__label" for="qual-name">Full Name</label>' +
        '<input type="text" class="qual__input" id="qual-name" placeholder="Your full name" value="' + escapeHtml(registerState.answers.name) + '">' +
        '<p class="qual__error" id="qual-name-error">Please enter your name.</p>' +
      '</div>' +
      '<div class="qual__field">' +
        '<label class="qual__label" for="qual-whatsapp">WhatsApp Number</label>' +
        '<input type="tel" class="qual__input" id="qual-whatsapp" placeholder="10-digit mobile number" value="' + escapeHtml(registerState.answers.whatsapp) + '">' +
        '<p class="qual__error" id="qual-whatsapp-error">Please enter a valid 10-digit Indian mobile number.</p>' +
      '</div>' +
      '<div class="qual__field">' +
        '<label class="qual__label" for="qual-email">Email <span style="font-weight:400;">(optional)</span></label>' +
        '<input type="email" class="qual__input" id="qual-email" placeholder="you@example.com" value="' + escapeHtml(registerState.answers.email) + '">' +
      '</div>' +
      '<button type="button" class="btn btn--primary btn--large qual__continue" id="qual-continue">Continue</button>';
  }

  root.innerHTML = '<section class="qual register-step" aria-labelledby="qual-heading">' + topBar + bodyHtml + '</section>';

  document.getElementById('qual-back').addEventListener('click', function () {
    renderStep(step - 1);
  });

  if (q.type === 'select') {
    bindSelectOptions(q, step);
  } else if (q.type === 'contact') {
    bindContactQuestion(step);
  }
}

function bindSelectOptions(q, step) {
  var buttons = document.querySelectorAll('#qual-options .qual__option');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Brief visual confirmation before auto-advancing.
      buttons.forEach(function (b) { b.disabled = true; });
      buttons.forEach(function (b) { b.classList.toggle('is-selected', b === btn); });
      registerState.answers[q.key] = btn.getAttribute('data-value');

      setTimeout(function () {
        renderStep(step + 1);
      }, 380);
    });
  });
}

function bindContactQuestion(step) {
  var nameInput = document.getElementById('qual-name');
  var whatsappInput = document.getElementById('qual-whatsapp');
  var emailInput = document.getElementById('qual-email');
  var nameError = document.getElementById('qual-name-error');
  var whatsappError = document.getElementById('qual-whatsapp-error');
  var continueBtn = document.getElementById('qual-continue');

  [nameInput, whatsappInput].forEach(function (el) {
    el.addEventListener('input', function () {
      el.classList.remove('has-error');
      (el === nameInput ? nameError : whatsappError).classList.remove('is-visible');
    });
  });

  function isValidIndianMobile(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.length === 12 && digits.indexOf('91') === 0) {
      digits = digits.slice(2); // strip +91/91 country code
    } else if (digits.length === 11 && digits.indexOf('0') === 0) {
      digits = digits.slice(1); // strip leading trunk 0
    }
    return /^[6-9]\d{9}$/.test(digits);
  }

  continueBtn.addEventListener('click', function () {
    var name = nameInput.value.trim();
    var whatsapp = whatsappInput.value.trim();
    var email = emailInput.value.trim();
    var valid = true;

    if (!name) {
      nameInput.classList.add('has-error');
      nameError.classList.add('is-visible');
      valid = false;
    }
    if (!isValidIndianMobile(whatsapp)) {
      whatsappInput.classList.add('has-error');
      whatsappError.classList.add('is-visible');
      valid = false;
    }
    if (!valid) {
      (nameInput.classList.contains('has-error') ? nameInput : whatsappInput).focus();
      return;
    }

    registerState.answers.name = name;
    registerState.answers.whatsapp = whatsapp;
    registerState.answers.email = email;

    submitLead(registerState.answers);
    trackRegistrationComplete();
    renderStep(QUESTIONS.length + 1);
  });
}

// ---------------------------------------------------------------------------
// Lead capture — fires the completed answers to a Google Sheet webhook.
// Best-effort: never blocks or breaks the confirmation screen if it fails,
// since the WhatsApp button on Section 3 is always available as a backup.
// ---------------------------------------------------------------------------
function submitLead(answers) {
  if (!LEADS_WEBHOOK_URL) {
    console.warn('LEADS_WEBHOOK_URL is not configured — this lead was not saved anywhere.');
    return;
  }

  var payload = {
    timestamp: new Date().toISOString(),
    program: CURRENT_PROGRAM.name,
    status: answers.q1,
    graduationYear: answers.q2,
    experience: answers.q3,
    commitment: answers.q4,
    slot: answers.slot,
    name: answers.name,
    whatsapp: answers.whatsapp,
    email: answers.email
  };

  // mode: 'no-cors' + text/plain avoids a CORS preflight, which Apps Script
  // Web Apps don't handle. The response is opaque (unreadable) by design —
  // this is a fire-and-forget call.
  fetch(LEADS_WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  }).catch(function (err) {
    console.error('Lead submission failed:', err);
  });
}

// ---------------------------------------------------------------------------
// Section 3 — Confirmation
// ---------------------------------------------------------------------------
function renderConfirm() {
  var root = document.getElementById('register-root');
  if (!root) return;

  var a = registerState.answers;
  var message =
    'Hi! I just registered for the ' + CURRENT_PROGRAM.name + '.\n' +
    'Status: ' + a.q1 + ' | Passed out: ' + a.q2 + ' | Experience: ' + a.q3 + '\n' +
    'Commitment: ' + a.q4 + '\n' +
    'Slot: ' + a.slot + '\n' +
    'Name: ' + a.name;
  var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);

  root.innerHTML =
    '<section class="confirm register-step" aria-labelledby="confirm-heading">' +
      '<div class="confirm__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
      '<h1 class="confirm__headline" id="confirm-heading">Thanks &mdash; we&rsquo;ve got your details!</h1>' +
      '<p class="confirm__body">We will review your application and reach out to you shortly.</p>' +
      '<div class="confirm__secondary">' +
        '<p class="confirm__secondary-text">Want to chat sooner? You can also reach out to us directly on WhatsApp.</p>' +
        '<a href="' + waUrl + '" target="_blank" rel="noopener" class="btn btn--ghost btn--large" id="confirm-whatsapp">Chat on WhatsApp</a>' +
      '</div>' +
    '</section>';

  document.getElementById('confirm-whatsapp').addEventListener('click', trackWhatsAppClick);
}

// ---------------------------------------------------------------------------
// Meta Pixel / GA4 event tracking
// Guarded with typeof checks so nothing breaks before the real IDs are added.
// ---------------------------------------------------------------------------
function trackRegistrationComplete() {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'Lead', { content_name: CURRENT_PROGRAM.name, value: CURRENT_PROGRAM.price, currency: 'INR' });
  }
  if (typeof gtag !== 'undefined') {
    gtag('event', 'generate_lead', { content_name: CURRENT_PROGRAM.name, value: CURRENT_PROGRAM.price, currency: 'INR' });
  }
}

function trackWhatsAppClick() {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'Contact', { content_name: CURRENT_PROGRAM.name });
  }
  if (typeof gtag !== 'undefined') {
    gtag('event', 'contact', { content_name: CURRENT_PROGRAM.name });
  }
}
