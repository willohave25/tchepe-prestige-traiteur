/* ============================================
   TCHÈPE PRESTIGE — auto-scroll.js
   W2K Signature — Auto-scroll premium
   Défilement lent, pause interaction, reprise auto
   ============================================ */

'use strict';

const AutoScroll = (() => {

  /* Configuration */
  const VITESSE_PX_PAR_SEC  = 40;    // pixels par seconde (lent = luxe)
  const DELAI_REPRISE_MS    = 45000; // 45 secondes d'inactivité → reprend
  const DELAI_NEXT_PAGE_MS  = 1200;  // pause avant redirection page suivante

  let actif        = false;
  let enPause      = false;
  let lastY        = 0;
  let lastTime     = null;
  let timerReprise = null;
  let rafId        = null;

  const indicateur = document.getElementById('scrollIndicator');

  /* Récupère l'URL de la page suivante */
  function pagesSuivante() {
    return document.body.dataset.nextPage || null;
  }

  /* Affiche / cache l'indicateur */
  function showIndicateur(visible) {
    if (indicateur) {
      indicateur.classList.toggle('visible', visible);
    }
  }

  /* Boucle principale d'animation */
  function loop(timestamp) {
    if (!actif || enPause) return;

    if (!lastTime) lastTime = timestamp;
    const delta = (timestamp - lastTime) / 1000; // secondes écoulées
    lastTime = timestamp;

    const pas = VITESSE_PX_PAR_SEC * delta;
    const newY = window.scrollY + pas;
    const maxY = document.documentElement.scrollHeight - window.innerHeight;

    if (newY >= maxY) {
      // Bas de page atteint → aller à la page suivante
      const suivante = pagesSuivante();
      if (suivante) {
        actif = false;
        showIndicateur(false);
        setTimeout(() => {
          window.location.href = suivante;
        }, DELAI_NEXT_PAGE_MS);
        return;
      } else {
        // Pas de page suivante : on revient en haut
        window.scrollTo({ top: 0, behavior: 'smooth' });
        lastTime = null;
      }
    } else {
      window.scrollTo(0, newY);
    }

    rafId = requestAnimationFrame(loop);
  }

  /* Démarre l'auto-scroll */
  function demarrer() {
    actif    = true;
    enPause  = false;
    lastTime = null;
    showIndicateur(true);
    rafId = requestAnimationFrame(loop);
  }

  /* Met en pause (interaction utilisateur) */
  function mettreEnPause() {
    if (!actif) return;
    enPause = true;
    lastTime = null;
    showIndicateur(false);
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    resetTimerReprise();
  }

  /* Reprend après inactivité */
  function reprendre() {
    if (!actif) return;
    enPause  = false;
    lastTime = null;
    showIndicateur(true);
    rafId = requestAnimationFrame(loop);
  }

  /* Remet à zéro le timer de reprise */
  function resetTimerReprise() {
    clearTimeout(timerReprise);
    timerReprise = setTimeout(reprendre, DELAI_REPRISE_MS);
  }

  /* Événements d'interaction utilisateur */
  function bindEvents() {
    const evenements = ['wheel', 'touchstart', 'touchmove', 'keydown', 'mousedown'];

    evenements.forEach(evt => {
      window.addEventListener(evt, mettreEnPause, { passive: true });
    });

    // Reprise si l'utilisateur laisse la souris au repos
    window.addEventListener('mousemove', () => {
      if (enPause) resetTimerReprise();
    }, { passive: true });
  }

  /* Initialisation */
  function init() {
    // Ne pas démarrer si page trop courte
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    if (maxY < 100) return;

    bindEvents();

    // Démarre immédiatement
    demarrer();
  }

  /* API publique */
  return { init, demarrer, mettreEnPause };

})();

/* Lance l'auto-scroll au chargement */
document.addEventListener('DOMContentLoaded', AutoScroll.init);
