/* ============================================
   TCHÈPE PRESTIGE — chatbot.js
   Assistant virtuel tchepePrestige 24/24
   ============================================ */

'use strict';

(function () {

  /* ---- Configuration ---- */
  const WA_NUMBER  = '2250586176086';
  const WA_BASE    = `https://wa.me/${WA_NUMBER}?text=`;
  const BOT_NAME   = 'tchepePrestige';
  const BOT_AVATAR = '🤖';

  /* ---- Grille prix (250g = 1 000 FCFA → 1kg = 4 000 FCFA) ---- */
  const PRIX = {
    poulet: { base: 1000, nom: 'Tchèpe Poulet Prestige' },
    poisson: { base: 1000, nom: 'Tchèpe Poisson' },
    mouton:  { base: 1000, nom: 'Tchèpe Mouton' },
    viande:  { base: 1000, nom: 'Tchèpe Viande' },
    mixte:   { base: 1000, nom: 'Formule Mixte Prestige' },
  };

  /* ---- État de la commande en cours ---- */
  let commande = { plat: '', personnes: '', localisation: '', heure: '', nom: '', whatsapp: '' };

  /* ---- Arbre de conversation ---- */
  const ECRANS = {
    accueil: {
      msg: `Bonjour et bienvenue chez <strong>Tchèpe Prestige</strong> 👋<br>Le meilleur du tchèp livré avec élégance. Comment puis-je vous aider ?`,
      choix: [
        { label: 'Voir le menu',        ecran: 'menu' },
        { label: 'Connaître les prix',  ecran: 'prix' },
        { label: 'Livraison',           ecran: 'livraison' },
        { label: 'Commander maintenant',ecran: 'commande_1' },
        { label: 'Poser une question',  ecran: 'faq' },
      ]
    },
    menu: {
      msg: `Voici notre menu :<br><br>🍚 Tchèpe Poulet Prestige<br>🐟 Tchèpe Poisson<br>🐑 Tchèpe Mouton<br>🥩 Tchèpe Viande<br>✨ Formule Mixte Prestige<br><br>Voulez-vous voir :`,
      choix: [
        { label: 'Les prix',           ecran: 'prix' },
        { label: 'Les portions',       ecran: 'portions' },
        { label: 'Commander directement', ecran: 'commande_1' },
        { label: '← Retour',          ecran: 'accueil' },
      ]
    },
    prix: {
      msg: `Nos prix (base <strong>250g = 1 000 FCFA</strong>) :<br><br>🍚 Poulet : à partir de <strong>1 000 FCFA</strong><br>🐟 Poisson : à partir de <strong>1 000 FCFA</strong><br>🐑 Mouton : à partir de <strong>1 000 FCFA</strong><br>🥩 Viande : à partir de <strong>1 000 FCFA</strong><br>✨ Mixte : à partir de <strong>1 000 FCFA</strong><br><br>Thermos traiteur : 5kg = 20 000 FCFA | 10kg = 40 000 FCFA | 20kg = 80 000 FCFA...<br>👉 <a href="offres.html">Voir la grille complète</a>`,
      choix: [
        { label: 'Commander maintenant', ecran: 'commande_1' },
        { label: 'Voir les tailles',     ecran: 'portions' },
        { label: 'Être conseillé',       ecran: 'conseils' },
        { label: '← Retour',            ecran: 'accueil' },
      ]
    },
    portions: {
      msg: `Nous proposons plusieurs formats :<br><br>👤 <strong>Solo</strong> (1 personne) — 250g<br>👫 <strong>Duo</strong> (2 personnes) — 500g<br>👨‍👩‍👧 <strong>Famille</strong> (3-5 personnes) — 750g à 1,25kg<br>🎉 <strong>Événement</strong> (thermos 5kg à 100kg) — sur commande<br><br>Pour combien de personnes souhaitez-vous commander ?`,
      choix: [
        { label: 'Solo (1 pers.)',        action: 'set_personnes', valeur: '1' },
        { label: 'Duo (2 pers.)',         action: 'set_personnes', valeur: '2' },
        { label: 'Famille (3-5 pers.)',   action: 'set_personnes', valeur: '4' },
        { label: 'Événement (20+ pers.)', ecran: 'conseils' },
        { label: '← Retour',             ecran: 'accueil' },
      ]
    },
    livraison: {
      msg: `Nous livrons rapidement 🛵<br><br>📍 <strong>Zones :</strong> Cocody, Plateau, Marcory, Yopougon, Abobo, Bingerville...<br>⏱ <strong>Délai :</strong> 30 min à 1h<br>💰 <strong>Frais :</strong> à partir de 1 000 FCFA selon localisation<br><br>Où êtes-vous situé(e) ?`,
      choix: [
        { label: 'Cocody-Angré',     action: 'set_lieu', valeur: 'Cocody-Angré' },
        { label: 'Plateau/Marcory', action: 'set_lieu', valeur: 'Plateau/Marcory' },
        { label: 'Yopougon/Abobo', action: 'set_lieu', valeur: 'Yopougon/Abobo' },
        { label: 'Autre commune',   action: 'set_lieu', valeur: 'Abidjan (autre)' },
        { label: '← Retour',       ecran: 'accueil' },
      ]
    },
    commande_1: {
      msg: `Parfait, passons à votre commande ! 🍽<br><br><strong>1. Quel plat souhaitez-vous ?</strong>`,
      choix: [
        { label: 'Tchèpe Poulet',  action: 'set_plat', valeur: 'Tchèpe Poulet Prestige' },
        { label: 'Tchèpe Poisson', action: 'set_plat', valeur: 'Tchèpe Poisson' },
        { label: 'Tchèpe Mouton',  action: 'set_plat', valeur: 'Tchèpe Mouton' },
        { label: 'Tchèpe Viande',  action: 'set_plat', valeur: 'Tchèpe Viande' },
        { label: 'Formule Mixte',  action: 'set_plat', valeur: 'Formule Mixte Prestige' },
      ]
    },
    commande_2: {
      msg: `Super choix ! 👍<br><br><strong>2. Pour combien de personnes ?</strong>`,
      choix: [
        { label: '1 personne',    action: 'set_personnes', valeur: '1' },
        { label: '2 personnes',   action: 'set_personnes', valeur: '2' },
        { label: '3-5 personnes', action: 'set_personnes', valeur: '4' },
        { label: '10+ personnes', action: 'set_personnes', valeur: '10' },
        { label: '20+ personnes (traiteur)', action: 'set_personnes', valeur: '20' },
      ]
    },
    commande_3: {
      msg: `<strong>3. Votre localisation ?</strong>`,
      choix: [
        { label: 'Cocody-Angré',     action: 'set_lieu_cmd', valeur: 'Cocody-Angré' },
        { label: 'Plateau/Marcory', action: 'set_lieu_cmd', valeur: 'Plateau/Marcory' },
        { label: 'Yopougon/Abobo', action: 'set_lieu_cmd', valeur: 'Yopougon/Abobo' },
        { label: 'Autre commune',   action: 'set_lieu_cmd', valeur: 'Abidjan (autre)' },
      ]
    },
    commande_4: {
      msg: `<strong>4. Heure souhaitée ?</strong>`,
      choix: [
        { label: 'Dès que possible', action: 'set_heure', valeur: 'Dès que possible' },
        { label: 'Dans 1h',          action: 'set_heure', valeur: 'Dans 1h' },
        { label: 'Ce midi (12h)',    action: 'set_heure', valeur: 'Ce midi (12h)' },
        { label: 'Ce soir (19h)',    action: 'set_heure', valeur: 'Ce soir (19h)' },
        { label: 'Autre heure',      action: 'set_heure', valeur: 'À préciser' },
      ]
    },
    commande_recap: {
      msg: '', // généré dynamiquement
      choix: [
        { label: '✅ Confirmer sur WhatsApp', action: 'whatsapp_cmd' },
        { label: '🔄 Recommencer',            ecran: 'commande_1' },
        { label: '← Retour accueil',          ecran: 'accueil' },
      ]
    },
    faq: {
      msg: `Quelle est votre question ?`,
      choix: [
        { label: 'Disponible aujourd\'hui ?', ecran: 'faq_dispo' },
        { label: 'Vos horaires ?',            ecran: 'faq_horaires' },
        { label: 'Moyens de paiement ?',      ecran: 'faq_paiement' },
        { label: 'Plats épicés ?',            ecran: 'faq_epice' },
        { label: 'Événements / traiteur ?',   ecran: 'faq_evenements' },
        { label: '← Retour',                  ecran: 'accueil' },
      ]
    },
    faq_dispo: {
      msg: `Oui 🎉 nous sommes ouverts aujourd'hui.<br>Les commandes sont acceptées jusqu'à <strong>21h30</strong>.`,
      choix: [
        { label: 'Commander maintenant', ecran: 'commande_1' },
        { label: '← Autres questions',  ecran: 'faq' },
      ]
    },
    faq_horaires: {
      msg: `Nous sommes ouverts :<br>🕐 <strong>11h – 22h</strong>, tous les jours.`,
      choix: [
        { label: 'Commander maintenant', ecran: 'commande_1' },
        { label: '← Autres questions',  ecran: 'faq' },
      ]
    },
    faq_paiement: {
      msg: `Nous acceptons :<br><br>📱 <strong>Mobile Money</strong> (Orange Money, Wave, MTN MoMo)<br>💵 <strong>Espèces</strong> à la livraison<br>💳 Carte bancaire (sur demande)`,
      choix: [
        { label: 'Commander maintenant', ecran: 'commande_1' },
        { label: '← Autres questions',  ecran: 'faq' },
      ]
    },
    faq_epice: {
      msg: `Nos plats sont modérément épicés 🌶<br>Vous pouvez demander :<br><br>• Sans piment<br>• Piment léger<br>• Bien épicé`,
      choix: [
        { label: 'Commander maintenant', ecran: 'commande_1' },
        { label: '← Autres questions',  ecran: 'faq' },
      ]
    },
    faq_evenements: {
      msg: `Oui ! Tchèpe Prestige propose des services traiteur pour :<br><br>💍 Mariages<br>🎂 Anniversaires<br>🏢 Entreprises / repas d'affaires<br><br>Voulez-vous un devis ?`,
      choix: [
        { label: 'Demander un devis', action: 'whatsapp_devis' },
        { label: 'Voir les offres',   href: 'offres.html' },
        { label: '← Autres questions', ecran: 'faq' },
      ]
    },
    conseils: {
      msg: `Notre équipe est là pour vous conseiller 😊<br><br>Pour un projet sur mesure (mariage, entreprise, cantine), contactez-nous directement :<br>📱 <strong>+225 05 861 760 86</strong>`,
      choix: [
        { label: 'Contacter sur WhatsApp', action: 'whatsapp_conseil' },
        { label: 'Voir les offres traiteur', href: 'offres.html' },
        { label: '← Retour accueil',        ecran: 'accueil' },
      ]
    },
    capture: {
      msg: `Pour finaliser votre commande, pouvez-vous nous donner :<br><br>👤 Votre <strong>nom</strong><br>📱 Votre <strong>numéro WhatsApp</strong><br><br>Ou cliquez ci-dessous pour continuer directement sur WhatsApp :`,
      choix: [
        { label: '💬 Continuer sur WhatsApp', action: 'whatsapp_cmd' },
        { label: '← Retour accueil',          ecran: 'accueil' },
      ]
    },
    relance: {
      msg: `Notre tchèpe est prêt à vous régaler aujourd'hui ! 🍚✨<br>Promo du jour disponible — voulez-vous en profiter ?`,
      choix: [
        { label: 'Voir la promo !',        ecran: 'commande_1' },
        { label: 'Peut-être plus tard...',  ecran: 'accueil' },
      ]
    },
  };

  /* ---- Helpers ---- */
  function waLink(texte) {
    return WA_BASE + encodeURIComponent(texte);
  }

  function buildMsgCommande() {
    return `Bonjour TCHÈPE PRESTIGE !\nJe souhaite commander :\n🍽 Plat : ${commande.plat || '?'}\n👥 Personnes : ${commande.personnes || '?'}\n📍 Lieu : ${commande.localisation || '?'}\n⏱ Heure : ${commande.heure || '?'}\nMerci !`;
  }

  /* ---- Construction du DOM ---- */
  function creerWidget() {
    // Bouton toggle
    const btn = document.createElement('button');
    btn.className = 'chatbot-toggle';
    btn.setAttribute('aria-label', 'Ouvrir l\'assistant virtuel');
    btn.innerHTML = `
      <svg class="icon-open" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
      <svg class="icon-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
      <span class="chatbot-badge" id="chatbotBadge">1</span>`;

    // Fenêtre
    const win = document.createElement('div');
    win.className = 'chatbot-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Assistant virtuel Tchèpe Prestige');
    win.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-avatar">${BOT_AVATAR}</div>
        <div class="chatbot-header-info">
          <div class="chatbot-header-name">${BOT_NAME}</div>
          <div class="chatbot-header-status">En ligne 24/24</div>
        </div>
        <button class="chatbot-header-close" id="chatbotClose" aria-label="Fermer">✕</button>
      </div>
      <div class="chatbot-messages" id="chatbotMessages"></div>
      <div class="chatbot-quick-replies hidden" id="chatbotReplies"></div>
      <div class="chatbot-input-zone">
        <input class="chatbot-input" id="chatbotInput" type="text" placeholder="Écrivez votre message..." autocomplete="off">
        <button class="chatbot-send" id="chatbotSend" aria-label="Envoyer">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>`;

    document.body.appendChild(btn);
    document.body.appendChild(win);

    // Événements
    btn.addEventListener('click', toggleChat);
    win.querySelector('#chatbotClose').addEventListener('click', fermerChat);
    win.querySelector('#chatbotSend').addEventListener('click', envoyerTexte);
    win.querySelector('#chatbotInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') envoyerTexte();
    });

    // Afficher badge puis masquer après ouverture
    setTimeout(function () {
      const badge = document.getElementById('chatbotBadge');
      if (badge) badge.style.display = 'none';
    }, 5000);
  }

  /* ---- Toggle / fermeture ---- */
  function toggleChat() {
    const btn = document.querySelector('.chatbot-toggle');
    const win = document.querySelector('.chatbot-window');
    const isOpen = win.classList.contains('visible');
    if (isOpen) {
      fermerChat();
    } else {
      ouvrirChat();
    }
    const badge = document.getElementById('chatbotBadge');
    if (badge) badge.style.display = 'none';
  }

  function ouvrirChat() {
    const btn = document.querySelector('.chatbot-toggle');
    const win = document.querySelector('.chatbot-window');
    btn.classList.add('open');
    win.classList.add('visible');
    const msgs = document.getElementById('chatbotMessages');
    if (!msgs.children.length) {
      // Première ouverture : message de bienvenue
      setTimeout(function () { afficherEcran('accueil'); }, 300);
    }
    // Focus input
    setTimeout(function () {
      const input = document.getElementById('chatbotInput');
      if (input) input.focus();
    }, 350);
  }

  function fermerChat() {
    const btn = document.querySelector('.chatbot-toggle');
    const win = document.querySelector('.chatbot-window');
    btn.classList.remove('open');
    win.classList.remove('visible');
  }

  /* ---- Affichage messages ---- */
  function ajouterMessageBot(html, delay) {
    delay = delay || 0;
    return new Promise(function (resolve) {
      // Indicateur de frappe
      const typing = document.createElement('div');
      typing.className = 'chat-msg bot chat-typing';
      typing.innerHTML = `<div class="chat-msg-avatar">${BOT_AVATAR}</div><div class="chat-msg-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
      const msgs = document.getElementById('chatbotMessages');
      msgs.appendChild(typing);
      msgs.scrollTop = msgs.scrollHeight;

      setTimeout(function () {
        typing.remove();
        const div = document.createElement('div');
        div.className = 'chat-msg bot';
        div.innerHTML = `<div class="chat-msg-avatar">${BOT_AVATAR}</div><div class="chat-msg-bubble">${html}</div>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
        resolve();
      }, delay + 600);
    });
  }

  function ajouterMessageUser(texte) {
    const msgs = document.getElementById('chatbotMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg user';
    div.innerHTML = `<div class="chat-msg-bubble">${texte}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function afficherChoix(choix) {
    const zone = document.getElementById('chatbotReplies');
    zone.innerHTML = '';
    zone.classList.remove('hidden');
    choix.forEach(function (c) {
      const btn = document.createElement('button');
      btn.className = 'qr-btn';
      btn.textContent = c.label;
      btn.addEventListener('click', function () {
        zone.classList.add('hidden');
        ajouterMessageUser(c.label);
        traiterChoix(c);
      });
      zone.appendChild(btn);
    });
  }

  /* ---- Traitement des choix ---- */
  function traiterChoix(choix) {
    if (choix.href) {
      setTimeout(function () { window.location.href = choix.href; }, 400);
      return;
    }
    if (choix.action) {
      switch (choix.action) {
        case 'set_plat':
          commande.plat = choix.valeur;
          afficherEcran('commande_2');
          break;
        case 'set_personnes':
          commande.personnes = choix.valeur;
          if (commande.plat) {
            afficherEcran('commande_3');
          } else {
            afficherEcran('commande_1');
          }
          break;
        case 'set_lieu':
          commande.localisation = choix.valeur;
          ajouterMessageBot(`Parfait ! Nous livrons à ${choix.valeur} 📍<br>N'hésitez pas à commander directement.`, 0)
            .then(function () { afficherChoix(ECRANS.accueil.choix); });
          break;
        case 'set_lieu_cmd':
          commande.localisation = choix.valeur;
          afficherEcran('commande_4');
          break;
        case 'set_heure':
          commande.heure = choix.valeur;
          afficherEcranRecap();
          break;
        case 'whatsapp_cmd':
          window.open(waLink(buildMsgCommande()), '_blank', 'noopener');
          ajouterMessageBot('Vous allez être redirigé(e) vers WhatsApp pour confirmer votre commande 💬', 0)
            .then(function () {
              afficherChoix([{ label: '← Retour accueil', ecran: 'accueil' }]);
            });
          break;
        case 'whatsapp_devis':
          window.open(waLink('Bonjour TCHÈPE PRESTIGE ! Je souhaite un devis pour un événement (traiteur). Pouvez-vous me contacter ?'), '_blank', 'noopener');
          ajouterMessageBot('Nous allons vous préparer un devis personnalisé 🎉', 0)
            .then(function () {
              afficherChoix([{ label: '← Retour accueil', ecran: 'accueil' }]);
            });
          break;
        case 'whatsapp_conseil':
          window.open(waLink('Bonjour TCHÈPE PRESTIGE ! Je souhaite être conseillé(e) pour ma commande.'), '_blank', 'noopener');
          ajouterMessageBot('Un de nos agents va vous répondre rapidement 😊', 0)
            .then(function () {
              afficherChoix([{ label: '← Retour accueil', ecran: 'accueil' }]);
            });
          break;
      }
      return;
    }
    if (choix.ecran) {
      afficherEcran(choix.ecran);
    }
  }

  function afficherEcran(id) {
    const ecran = ECRANS[id];
    if (!ecran) return;
    ajouterMessageBot(ecran.msg, 0).then(function () {
      afficherChoix(ecran.choix);
    });
  }

  function afficherEcranRecap() {
    const recap = `Récapitulatif de votre commande :<br><br>` +
      `🍽 <strong>Plat :</strong> ${commande.plat || 'Non précisé'}<br>` +
      `👥 <strong>Personnes :</strong> ${commande.personnes || '?'}<br>` +
      `📍 <strong>Lieu :</strong> ${commande.localisation || 'Non précisé'}<br>` +
      `⏱ <strong>Heure :</strong> ${commande.heure || 'Non précisée'}<br><br>` +
      `Souhaitez-vous confirmer ?`;
    ajouterMessageBot(recap, 0).then(function () {
      afficherChoix(ECRANS.commande_recap.choix);
    });
  }

  /* ---- Saisie libre ---- */
  function envoyerTexte() {
    const input = document.getElementById('chatbotInput');
    const texte = (input.value || '').trim();
    if (!texte) return;
    input.value = '';
    ajouterMessageUser(texte);
    const zone = document.getElementById('chatbotReplies');
    zone.classList.add('hidden');

    // Détection de mots-clés simples
    const t = texte.toLowerCase();
    if (/prix|combien|tarif|coût/.test(t)) {
      setTimeout(function () { afficherEcran('prix'); }, 400);
    } else if (/menu|plat|manger|mange|tchepe|tchèpe/.test(t)) {
      setTimeout(function () { afficherEcran('menu'); }, 400);
    } else if (/livraison|livrer|livrez|délai/.test(t)) {
      setTimeout(function () { afficherEcran('livraison'); }, 400);
    } else if (/commander|commande|order/.test(t)) {
      setTimeout(function () { afficherEcran('commande_1'); }, 400);
    } else if (/horaire|ouvert|fermé|heure/.test(t)) {
      setTimeout(function () { afficherEcran('faq_horaires'); }, 400);
    } else if (/paiement|payer|mobile money|wave|orange/.test(t)) {
      setTimeout(function () { afficherEcran('faq_paiement'); }, 400);
    } else if (/épicé|piment|fort/.test(t)) {
      setTimeout(function () { afficherEcran('faq_epice'); }, 400);
    } else if (/événement|mariage|fête|anniversaire|traiteur/.test(t)) {
      setTimeout(function () { afficherEcran('faq_evenements'); }, 400);
    } else {
      ajouterMessageBot(`Je n'ai pas bien compris 😅<br>Voici ce que je peux faire pour vous :`, 0)
        .then(function () { afficherChoix(ECRANS.accueil.choix); });
    }
  }

  /* ---- Relance automatique (si inactif 90s après ouverture) ---- */
  let relanceTimer = null;
  function demarrerRelance() {
    clearTimeout(relanceTimer);
    relanceTimer = setTimeout(function () {
      const msgs = document.getElementById('chatbotMessages');
      if (msgs && msgs.children.length <= 3) {
        afficherEcran('relance');
      }
    }, 90000);
  }

  /* ---- Init ---- */
  function init() {
    creerWidget();
    // Relance après 5s si chat non ouvert
    setTimeout(function () {
      const win = document.querySelector('.chatbot-window');
      if (win && !win.classList.contains('visible')) {
        demarrerRelance();
      }
    }, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
