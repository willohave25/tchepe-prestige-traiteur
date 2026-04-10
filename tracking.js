/* ============================================
   TCHÈPE PRESTIGE — tracking.js
   Suivi de commande client via Supabase
   ============================================ */

'use strict';

const SUPABASE_URL_T     = 'https://ilycnutphhmuvaonkrsa.supabase.co';
const SUPABASE_ANON_T    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlseWNudXRwaGhtdXZhb25rcnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjY5NDcsImV4cCI6MjA5MDEwMjk0N30.80ipBwMVvAkC2f0Oz2Wzl8E6GjMwlLCoE72XbePtmnM';

/* Ordre des statuts */
const STATUTS = [
  { key: 'reçue',       id: 'etape-recue',       label: 'Commande reçue' },
  { key: 'confirmée',   id: 'etape-paiement',    label: 'Paiement confirmé' },
  { key: 'préparation', id: 'etape-preparation', label: 'En préparation' },
  { key: 'livraison',   id: 'etape-livraison',   label: 'En livraison' },
  { key: 'livrée',      id: 'etape-livre',       label: 'Livré' },
];

/* Suivre une commande */
async function suivreCommande() {
  const input   = document.getElementById('numeroCommande');
  const msg     = document.getElementById('suiviMessage');
  const resultat = document.getElementById('suiviResultat');

  if (!input) return;

  let numero = input.value.trim().toUpperCase();
  if (!numero) {
    afficherMsg(msg, 'error', 'Veuillez entrer votre numéro de commande (format TCP-XXXX).');
    return;
  }

  // Normalisation : ajouter TCP- si absent
  if (!numero.startsWith('TCP-')) {
    numero = 'TCP-' + numero.replace('TCP', '').replace('-', '');
  }

  afficherMsg(msg, '', '🔍 Recherche en cours...');
  if (resultat) resultat.style.display = 'none';

  try {
    const res = await fetch(
      `${SUPABASE_URL_T}/rest/v1/commandes_prestige?numero_commande=eq.${encodeURIComponent(numero)}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_T,
          'Authorization': `Bearer ${SUPABASE_ANON_T}`,
        },
      }
    );

    if (!res.ok) throw new Error('Erreur serveur');
    const data = await res.json();

    if (!data || data.length === 0) {
      afficherMsg(msg, 'error', `Numéro "${numero}" introuvable. Vérifiez votre numéro ou contactez-nous par WhatsApp.`);
      return;
    }

    const commande = data[0];
    afficherMsg(msg, 'success', `✅ Commande trouvée : ${numero}`);
    afficherResultat(commande);

  } catch (err) {
    console.error('Erreur tracking:', err);
    afficherMsg(msg, 'error', 'Impossible de charger votre commande. Vérifiez votre connexion ou contactez-nous directement.');
  }
}

/* Affiche les détails et la timeline */
function afficherResultat(commande) {
  const resultat = document.getElementById('suiviResultat');
  if (!resultat) return;

  // Remplir les infos
  setTexte('suiviNumero',        commande.numero_commande || '—');
  setTexte('suiviDate',          formaterDate(commande.date_commande));
  setTexte('suiviClient',        commande.nom_client || '—');
  setTexte('suiviThermos',       commande.type_thermos || '—');
  setTexte('suiviMontant',       commande.montant_total ? formatFCFA(commande.montant_total) : '—');
  setTexte('suiviDateLivraison', formaterDate(commande.date_livraison));

  // Mettre à jour la timeline
  updateTimeline(commande.statut || 'reçue');

  resultat.style.display = 'block';
  resultat.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Met à jour la timeline selon le statut */
function updateTimeline(statut) {
  const indexActuel = STATUTS.findIndex(s =>
    s.key === statut || statut.toLowerCase().includes(s.key.split('é')[0])
  );

  STATUTS.forEach((s, i) => {
    const el = document.getElementById(s.id);
    if (!el) return;
    el.classList.remove('done', 'current');
    if (i < indexActuel) {
      el.classList.add('done');
    } else if (i === indexActuel) {
      el.classList.add('current');
    }
  });
}

/* Utilitaires */
function setTexte(id, valeur) {
  const el = document.getElementById(id);
  if (el) el.textContent = valeur;
}

function formaterDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-CI', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function formatFCFA(n) {
  return new Intl.NumberFormat('fr-CI').format(n) + ' FCFA';
}

function afficherMsg(el, type, texte) {
  if (!el) return;
  el.textContent = texte;
  el.className = type === 'error' ? 'form-message error'
               : type === 'success' ? 'form-message success'
               : 'form-message';
  el.style.display = texte ? 'block' : 'none';
}

/* Déclencher sur Entrée dans l'input */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('numeroCommande');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') suivreCommande();
    });
    // Mettre le focus auto
    input.focus();
  }

  // Préremplir depuis URL
  const params = new URLSearchParams(window.location.search);
  const nc = params.get('numero');
  if (nc && input) {
    input.value = nc;
    suivreCommande();
  }
});
