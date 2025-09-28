// --- Contact form handling (lightweight client-side UX) ---
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const showNote = (msg, isError) => {
    let note = contactForm.querySelector('.submit-note');
    if (!note) {
      note = document.createElement('p');
      note.className = 'submit-note';
      note.style.marginTop = '8px';
      note.style.fontWeight = '600';
      contactForm.appendChild(note);
    }
    note.textContent = msg;
    note.style.color = isError ? '#c23' : 'var(--button-bg)';
  };

  contactForm.addEventListener('submit', async (evt) => {
    evt.preventDefault();

    // basic HTML5 validation
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"], input[type="submit"]');
    const origText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      // If the form has a real action, POST the data; otherwise simulate
      if (contactForm.action && contactForm.action !== '#' && contactForm.action.trim() !== '') {
        const formData = new FormData(contactForm);
        const opts = { method: contactForm.method || 'POST', body: new URLSearchParams(formData) };
        const res = await fetch(contactForm.action, opts);
        if (!res.ok) throw new Error('Network response was not ok');
      } else {
        // simulate network latency for demo
        await new Promise(r => setTimeout(r, 700));
      }

      showNote('Thanks — your message has been received. We will reply shortly.', false);
      contactForm.reset();
    } catch (err) {
      console.error('Contact form send failed:', err);
      showNote('Sorry — something went wrong. Please try again later.', true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = origText || 'Send Message';
      }
    }
  });
});