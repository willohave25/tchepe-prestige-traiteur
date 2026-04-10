/* ============================================
   TCHÈPE PRESTIGE — main.js
   W2K-Digital — Navigation, WhatsApp, Formulaires,
   ActualitesManager (Supabase), Carrousel, Animations
   ============================================ */

'use strict';

/* ============================================
   CONFIG SUPABASE
   ============================================ */
const SUPABASE_URL = 'https://ilycnutphhmuvaonkrsa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlseWNudXRwaGhtdXZhb25rcnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjY5NDcsImV4cCI6MjA5MDEwMjk0N30.80ipBwMVvAkC2f0Oz2Wzl8E6GjMwlLCoE72XbePtmnM';
const CLOUDFLARE_R2 = 'https://medias.w2k-digital.com/';

/* EmailJS placeholders (à configurer) */
const EMAILJS_SERVICE_ID  = 'SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'TEMPLATE_ID';
const EMAILJS_USER_ID     = 'USER_ID';

/* ============================================
   NAVIGATION — HEADER SCROLL
   ============================================ */
const header = document.getElementById('header');

if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ============================================
   MENU HAMBURGER MOBILE
   ============================================ */
const hamburger = document.getElementById('hamburger');
const navDrawer  = document.getElementById('navDrawer');

if (hamburger && navDrawer) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navDrawer.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Fermer drawer si clic en dehors
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navDrawer.contains(e.target)) {
      hamburger.classList.remove('open');
      navDrawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Fermer au clic sur un lien
  navDrawer.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navDrawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ============================================
   ANIMATIONS REVEAL (Intersection Observer)
   ============================================ */
function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ============================================
   CARROUSEL TÉMOIGNAGES
   ============================================ */
function initCarrousel() {
  const track = document.getElementById('temoignagesTrack');
  if (!track) return;

  const items = track.querySelectorAll('.temoignage-item');
  const dots  = document.querySelectorAll('.carrousel-dot');
  const prev  = document.getElementById('carrouselPrev');
  const next  = document.getElementById('carrouselNext');
  let current = 0;
  let timer   = null;

  function goTo(index) {
    current = (index + items.length) % items.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startTimer() {
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  function resetTimer() {
    clearInterval(timer);
    startTimer();
  }

  if (prev) prev.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
  if (next) next.addEventListener('click', () => { goTo(current + 1); resetTimer(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index));
      resetTimer();
    });
  });

  // Pause sur hover
  const carrousel = document.getElementById('carrousel');
  if (carrousel) {
    carrousel.addEventListener('mouseenter', () => clearInterval(timer));
    carrousel.addEventListener('mouseleave', startTimer);
    carrousel.addEventListener('touchstart', () => clearInterval(timer), { passive: true });
    carrousel.addEventListener('touchend', startTimer, { passive: true });
  }

  startTimer();
}

/* ============================================
   FILTRE ACTUALITÉS (page actualites.html)
   ============================================ */
function initFiltres() {
  const filtres = document.querySelectorAll('.filtre-btn');
  const articles = document.querySelectorAll('.actualite-carte[data-cat]');
  const noResult = document.getElementById('noActualites');
  if (!filtres.length) return;

  filtres.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;

      // Mise à jour boutons
      filtres.forEach(b => {
        b.classList.remove('btn-primary', 'filtre-actif');
        b.classList.add('btn-secondary');
      });
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary', 'filtre-actif');

      // Filtrage
      let visible = 0;
      articles.forEach(a => {
        const show = cat === 'tous' || a.dataset.cat === cat;
        a.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      if (noResult) noResult.style.display = visible === 0 ? 'block' : 'none';
    });
  });
}

/* ============================================
   FORMULAIRE COMMANDE (contact.html)
   ============================================ */
function initFormCommande() {
  const form = document.getElementById('formCommande');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    const msg = document.getElementById('formCommandeMsg');
    btn.disabled = true;
    btn.textContent = 'Envoi en cours...';

    const data = {
      nom:         form.nom.value.trim(),
      tel:         form.tel.value.trim(),
      commande:    form.commande.value,
      formule:     form.formule.value,
      nbPersonnes: form.nbPersonnes.value,
      date:        form.dateCommande.value,
      localisation:form.localisation.value,
      adresse:     form.adresse.value.trim(),
      notes:       form.notes.value.trim(),
    };

    if (!data.nom || !data.tel || !data.commande || !data.date) {
      afficherMessage(msg, 'error', 'Merci de remplir tous les champs obligatoires (*).');
      btn.disabled = false;
      btn.textContent = 'Envoyer la commande';
      return;
    }

    try {
      // Envoi EmailJS
      if (typeof emailjs !== 'undefined' && EMAILJS_SERVICE_ID !== 'SERVICE_ID') {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          nom:       data.nom,
          telephone: data.tel,
          commande:  data.commande,
          formule:   data.formule,
          date:      data.date,
          zone:      data.localisation,
          adresse:   data.adresse,
          notes:     data.notes,
        }, EMAILJS_USER_ID);
      }

      // Enregistrement Supabase
      await enregistrerCommande(data);

      afficherMessage(msg, 'success', '✅ Votre commande a été enregistrée ! Nous vous contactons rapidement par WhatsApp pour confirmation.');
      form.reset();

      // Redirection WhatsApp après 1.5s
      setTimeout(() => {
        const texte = encodeURIComponent(
          `Bonjour TCHÈPE PRESTIGE ! Je viens de passer une commande :\n` +
          `👤 Nom : ${data.nom}\n` +
          `📱 Tél : ${data.tel}\n` +
          `🍲 Commande : ${data.commande}\n` +
          `✨ Formule : ${data.formule}\n` +
          `👥 Personnes : ${data.nbPersonnes || 'NC'}\n` +
          `📅 Date : ${data.date}\n` +
          `📍 Zone : ${data.localisation}\n` +
          `🏠 Adresse : ${data.adresse || 'NC'}`
        );
        window.open(`https://wa.me/2250586176086?text=${texte}`, '_blank');
      }, 1500);

    } catch (err) {
      console.error('Erreur envoi commande:', err);
      afficherMessage(msg, 'error', 'Erreur lors de l\'envoi. Veuillez nous contacter directement par WhatsApp.');
    }

    btn.disabled = false;
    btn.textContent = 'Envoyer la commande';
  });
}

/* Envoi WhatsApp pré-rempli depuis le bouton "Via WhatsApp" */
function envoyerWhatsapp() {
  const form = document.getElementById('formCommande');
  if (!form) return;

  const nom = form.nom.value.trim() || '[Votre nom]';
  const tel = form.tel.value.trim() || '[Votre tel]';
  const commande = form.commande.value || '[Thermos]';
  const formule = form.formule.value || 'Premium';
  const nbPersonnes = form.nbPersonnes.value || '';
  const date = form.dateCommande.value || '';
  const zone = form.localisation.value || '';

  const texte = encodeURIComponent(
    `Bonjour TCHÈPE PRESTIGE !\n` +
    `👤 Nom : ${nom}\n` +
    `📱 Tél : ${tel}\n` +
    `🍲 Commande : ${commande}\n` +
    `✨ Formule : ${formule}\n` +
    (nbPersonnes ? `👥 Personnes : ${nbPersonnes}\n` : '') +
    (date ? `📅 Date : ${date}\n` : '') +
    (zone ? `📍 Zone : ${zone}\n` : '')
  );
  window.open(`https://wa.me/2250586176086?text=${texte}`, '_blank');
}

/* ============================================
   FORMULAIRE ENTREPRISE (entreprise.html)
   ============================================ */
function initFormEntreprise() {
  const form = document.getElementById('formEntreprise');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    const msg = document.getElementById('formEntrepriseMsg');
    btn.disabled = true;
    btn.textContent = 'Envoi en cours...';

    const societe   = form.societe.value.trim();
    const contact   = form.contact.value.trim();
    const telephone = form.telephone.value.trim();
    const employes  = form.nbEmployes.value;

    if (!societe || !contact || !telephone || !employes) {
      afficherMessage(msg, 'error', 'Merci de remplir les champs obligatoires.');
      btn.disabled = false;
      btn.textContent = 'Envoyer la demande';
      return;
    }

    try {
      if (typeof emailjs !== 'undefined' && EMAILJS_SERVICE_ID !== 'SERVICE_ID') {
        await emailjs.send(EMAILJS_SERVICE_ID, 'TEMPLATE_ENTREPRISE', {
          societe, contact, telephone,
          employes, frequence: form.frequence.value,
          zone: form.zone.value, message: form.message.value,
        }, EMAILJS_USER_ID);
      }

      afficherMessage(msg, 'success', '✅ Votre demande a été envoyée ! Nous vous contactons sous 24h pour votre devis entreprise.');
      form.reset();

    } catch (err) {
      console.error(err);
      afficherMessage(msg, 'error', 'Erreur. Contactez-nous directement par WhatsApp.');
    }

    btn.disabled = false;
    btn.textContent = 'Envoyer la demande';
  });
}

/* ============================================
   ENREGISTREMENT COMMANDE SUPABASE
   ============================================ */
async function enregistrerCommande(data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/commandes_prestige`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        nom_client:     data.nom,
        telephone:      data.tel,
        type_thermos:   data.commande,
        formule:        data.formule?.toLowerCase() || 'premium',
        zone_livraison: data.localisation,
        date_livraison: data.date || null,
        statut:         'reçue',
        notes:          data.notes || null,
      }),
    });
    if (!res.ok) throw new Error('Supabase error');
  } catch (err) {
    console.warn('Supabase non disponible:', err.message);
  }
}

/* ============================================
   MODULE ACTUALITÉS — SUPABASE
   ============================================ */
const ActualitesManager = {
  table: 'actualites_prestige',

  async charger(conteneur = 'actualitesHome', limite = 3) {
    const el = document.getElementById(conteneur);
    if (!el) return;

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${this.table}?select=*&order=created_at.desc&limit=${limite}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!res.ok) throw new Error('Erreur Supabase');
      const data = await res.json();

      if (data && data.length > 0) {
        el.innerHTML = data.map(item => this.renderCarte(item)).join('');
      }
      // Si vide : on garde le contenu statique (fallback)

    } catch (err) {
      console.warn('Actualités Supabase non disponibles, affichage statique.');
    }
  },

  renderCarte(item) {
    const imgUrl = item.image_url
      ? (item.image_url.startsWith('http') ? item.image_url : CLOUDFLARE_R2 + item.image_url)
      : '';
    const date = item.created_at
      ? new Date(item.created_at).toLocaleDateString('fr-CI', { year: 'numeric', month: 'long' })
      : '';

    return `
      <article class="actualite-carte">
        <div class="actualite-img">
          ${imgUrl
            ? `<img src="${imgUrl}" alt="${this.escape(item.titre || '')}" loading="lazy">`
            : `<div style="background:var(--noir-3);height:220px;display:flex;align-items:center;justify-content:center;"><span style="color:var(--or);font-family:'Playfair Display',serif;">${this.escape(item.titre || '')}</span></div>`
          }
        </div>
        <div class="actualite-body">
          ${date ? `<div class="actualite-date">${date}</div>` : ''}
          <h3 class="actualite-titre">${this.escape(item.titre || 'Actualité')}</h3>
          <p class="actualite-texte">${this.escape(item.description || '')}</p>
        </div>
      </article>
    `;
  },

  escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
};

/* ============================================
   UTILITAIRE — AFFICHER MESSAGE FORMULAIRE
   ============================================ */
function afficherMessage(el, type, texte) {
  if (!el) return;
  el.className = `form-message ${type}`;
  el.textContent = texte;
  el.style.display = 'block';
  setTimeout(() => {
    el.style.display = 'none';
  }, 8000);
}

/* ============================================
   PRÉREMPLIR FORMULAIRE depuis URL params
   ============================================ */
function initURLParams() {
  const params = new URLSearchParams(window.location.search);

  const thermos = params.get('thermos');
  if (thermos) {
    const sel = document.getElementById('commande');
    if (sel) {
      const opt = Array.from(sel.options).find(o => o.value.toLowerCase().includes(thermos.toLowerCase()));
      if (opt) sel.value = opt.value;
    }
  }

  const event = params.get('event');
  if (event) {
    const sel = document.getElementById('devisEvenement');
    if (sel) {
      const opt = Array.from(sel.options).find(o => o.value === event);
      if (opt) sel.value = opt.value;
    }
  }
}

/* ============================================
   INIT GÉNÉRAL
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initCarrousel();
  initFiltres();
  initFormCommande();
  initFormEntreprise();
  initURLParams();

  // Charger actualités depuis Supabase si section présente
  if (document.getElementById('actualitesHome')) {
    ActualitesManager.charger('actualitesHome', 3);
  }
  if (document.getElementById('actualitesGrille')) {
    ActualitesManager.charger('actualitesGrille', 9);
  }
});
