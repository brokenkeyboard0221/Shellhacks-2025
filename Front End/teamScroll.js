(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded', function(){
    try {
      const nav = document.querySelector('.nav-actions');
      if(!nav) return;
      const links = Array.from(nav.querySelectorAll('a'));
      const teamLink = links.find(a => /our team/i.test(a.textContent) || a.getAttribute('href') === '/team');
      const teamSection = document.getElementById('team');
      if(teamLink && teamSection){
        teamLink.addEventListener('click', function(ev){
          ev.preventDefault();
          // scroll into view and add a short reveal animation
          teamSection.scrollIntoView({behavior:'smooth', block:'start'});
          teamSection.classList.add('reveal');
          window.setTimeout(()=> teamSection.classList.remove('reveal'), 1000);
        });
      }

      // Services link: smooth scroll to #services and reveal the services card
      const servicesLink = links.find(a => /services?/i.test(a.textContent) || a.getAttribute('href') === '/services' || a.getAttribute('href') === '#services');
      const servicesSection = document.getElementById('services');
      const servicesCard = document.querySelector('.services-card');
      if(servicesLink && servicesSection){
        servicesLink.addEventListener('click', function(ev){
          ev.preventDefault();
          servicesSection.scrollIntoView({behavior:'smooth', block:'start'});
          if(servicesCard){
            servicesCard.classList.add('reveal');
            window.setTimeout(()=> servicesCard.classList.remove('reveal'), 1000);
          }
        });
      }

      // If there are any in-page service CTA links pointing to #services, enable the same behavior
      const ctas = Array.from(document.querySelectorAll('.service-cta'));
      ctas.forEach(cta => {
        try{
          const href = cta.getAttribute('href') || '';
          if(href.indexOf('#services') !== -1 || href === '#services'){
            cta.addEventListener('click', function(ev){
              ev.preventDefault();
              if(servicesSection){
                servicesSection.scrollIntoView({behavior:'smooth', block:'start'});
                if(servicesCard){
                  servicesCard.classList.add('reveal');
                  window.setTimeout(()=> servicesCard.classList.remove('reveal'), 1000);
                }
              }
            });
          }
        }catch(e){/* ignore malformed hrefs */}
      });

      // Contact link: smooth scroll to #contact and reveal the contact form, focusing the first field
      const contactLink = links.find(a => /contact/i.test(a.textContent) || a.getAttribute('href') === '/contactus' || a.getAttribute('href') === '#contact');
      const contactSection = document.getElementById('contact');
      const contactForm = document.querySelector('.contact-form');
      if(contactLink && contactSection){
        contactLink.addEventListener('click', function(ev){
          ev.preventDefault();
          contactSection.scrollIntoView({behavior:'smooth', block:'start'});
          if(contactForm){
            contactForm.classList.add('reveal');
            // focus the first input for keyboard users after a short delay (allow scroll)
            window.setTimeout(()=>{
              const first = contactForm.querySelector('input, textarea, select');
              if(first && typeof first.focus === 'function') first.focus({preventScroll:true});
            }, 550);
            window.setTimeout(()=> contactForm.classList.remove('reveal'), 1100);
          }
        });
      }

      // Any inline contact CTAs
      Array.from(document.querySelectorAll('.contact-cta')).forEach(cta=>{
        cta.addEventListener('click', function(ev){
          ev.preventDefault();
          if(contactSection){
            contactSection.scrollIntoView({behavior:'smooth', block:'start'});
            if(contactForm){
              contactForm.classList.add('reveal');
              window.setTimeout(()=>{
                const first = contactForm.querySelector('input, textarea, select');
                if(first && typeof first.focus === 'function') first.focus({preventScroll:true});
              },550);
              window.setTimeout(()=> contactForm.classList.remove('reveal'), 1100);
            }
          }
        });
      });
    } catch(e) {
      // fail silently in older browsers
      console.error(e);
    }
  });
})();
