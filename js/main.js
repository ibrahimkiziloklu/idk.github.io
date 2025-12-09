document.addEventListener('DOMContentLoaded', () => {
  const fadeElements = document.querySelectorAll('.fade-in');
  if (!('IntersectionObserver' in window)) {
    fadeElements.forEach((el) => {
      el.style.opacity = '1';
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach((el) => observer.observe(el));
});

document.addEventListener('DOMContentLoaded', () => {
  if (typeof emailjs === 'undefined') {
    console.warn('EmailJS SDK not available; contact form disabled.');
    return;
  }

  emailjs.init({ publicKey: 'IHHA65evH707vhaFQ' });

  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (!form || !formStatus || !submitBtn) {
    return;
  }

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const subjectInput = document.getElementById('subject');
  const messageInput = document.getElementById('message');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const subjectError = document.getElementById('subjectError');
  const messageError = document.getElementById('messageError');
  const recaptchaError = document.getElementById('recaptchaError');

  const originalSubmitText = submitBtn.textContent;
  const submittingMarkup = '<span class="spinner" aria-hidden="true"></span> Sending...';

  nameInput.addEventListener('input', () => validateField(nameInput, nameError, 'Please enter your name', 2));
  emailInput.addEventListener('input', () => validateEmail(emailInput, emailError));
  subjectInput.addEventListener('input', () => validateField(subjectInput, subjectError, 'Please enter a subject', 2));
  messageInput.addEventListener('input', () => validateField(messageInput, messageError, 'Please enter your message', 10));

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    clearErrors();

    const isNameValid = validateField(nameInput, nameError, 'Please enter your name', 2);
    const isEmailValid = validateEmail(emailInput, emailError);
    const isSubjectValid = validateField(subjectInput, subjectError, 'Please enter a subject', 2);
    const isMessageValid = validateField(messageInput, messageError, 'Please enter your message', 10);

    const recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
    const isRecaptchaValid = Boolean(recaptchaResponse);

    if (!isRecaptchaValid && recaptchaError) {
      recaptchaError.textContent = 'Please complete the reCAPTCHA verification';
    }

    if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid || !isRecaptchaValid) {
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = submittingMarkup;
    showStatus('', '');

    const templateParams = {
      from_name: nameInput.value,
      from_email: emailInput.value,
      subject: subjectInput.value,
      message: messageInput.value,
      'g-recaptcha-response': recaptchaResponse,
    };

    emailjs
      .send('service_ge64scs', 'template_kf5o6we', templateParams, 'IHHA65evH707vhaFQ')
      .then(() => {
        showStatus('Thank you! Your message has been sent successfully. I will get back to you soon.', 'success');
        form.reset();
        if (typeof grecaptcha !== 'undefined') {
          grecaptcha.reset();
        }
      })
      .catch(() => {
        showStatus('Sorry, there was a problem sending your message. Please try again later.', 'error');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalSubmitText;
      });
  });

  function validateField(field, errorElement, errorMessage, minLength) {
    if (!field || !errorElement) {
      return false;
    }

    const trimmed = field.value.trim();

    if (!trimmed) {
      field.classList.add('invalid');
      errorElement.textContent = errorMessage;
      return false;
    }

    if (trimmed.length < minLength) {
      field.classList.add('invalid');
      errorElement.textContent = `Must be at least ${minLength} characters`;
      return false;
    }

    if (containsInjection(trimmed)) {
      field.classList.add('invalid');
      errorElement.textContent = 'Please remove special characters like <, >, {, }, or script tags';
      return false;
    }

    field.classList.remove('invalid');
    errorElement.textContent = '';
    return true;
  }

  function validateEmail(field, errorElement) {
    if (!field || !errorElement) {
      return false;
    }

    const value = field.value.trim();
    if (!value) {
      field.classList.add('invalid');
      errorElement.textContent = 'Please enter your email address';
      return false;
    }

    const emailPattern = /^(?:[a-zA-Z0-9_'^&+-])+(?:\.[a-zA-Z0-9_'^&+-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!emailPattern.test(value)) {
      field.classList.add('invalid');
      errorElement.textContent = 'Please enter a valid email address';
      return false;
    }

    field.classList.remove('invalid');
    errorElement.textContent = '';
    return true;
  }

  function containsInjection(value) {
    const scriptPattern = /<script|<\/script|javascript:|onerror=|onload=|onclick=|\{|\}|alert\(|document\.|window\./i;
    return scriptPattern.test(value);
  }

  function clearErrors() {
    [nameError, emailError, subjectError, messageError, recaptchaError].forEach((el) => {
      if (el) {
        el.textContent = '';
      }
    });

    [nameInput, emailInput, subjectInput, messageInput].forEach((field) => {
      if (field) {
        field.classList.remove('invalid');
      }
    });
  }

  function showStatus(message, type) {
    if (!formStatus) {
      return;
    }

    formStatus.textContent = message;
    formStatus.className = 'form-status';

    if (message) {
      formStatus.classList.add(type);
      formStatus.style.display = 'block';
      formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      if (type === 'success') {
        window.setTimeout(() => {
          formStatus.style.display = 'none';
          formStatus.textContent = '';
          formStatus.className = 'form-status';
        }, 6000);
      }
    } else {
      formStatus.style.display = 'none';
    }
  }
});
