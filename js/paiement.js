/* ============================================
   TCHÈPE PRESTIGE — paiement.js
   Mobile Money — Instructions et redirection WhatsApp
   ============================================ */

'use strict';

const NUMERO_MARCHAND = '+225 05 861 760 86';
const WA_NUMERO       = '2250586176086';

/* Instructions par opérateur */
const INSTRUCTIONS_MOBILE = {
  orange: {
    nom:    'Orange Money',
    emoji:  '🟠',
    etapes: [
      'Composez le <strong>#144#</strong> ou ouvrez l\'application Orange Money.',
      'Sélectionnez <strong>"Paiement marchand"</strong> ou <strong>"Envoyer de l\'argent"</strong>.',
      `Entrez le numéro marchand : <strong>${NUMERO_MARCHAND}</strong>`,
      'Saisissez le <strong>montant exact</strong> de votre commande en FCFA.',
      'Validez avec votre <strong>code PIN</strong> Orange Money.',
      'Faites une <strong>capture d\'écran</strong> du reçu de paiement.',
      'Envoyez la capture à TCHÈPE PRESTIGE via WhatsApp pour confirmation.',
    ],
  },
  mtn: {
    nom:    'MTN MoMo',
    emoji:  '🟡',
    etapes: [
      'Composez le <strong>*133#</strong> ou ouvrez l\'application MTN Mobile Money.',
      'Choisissez <strong>"Paiement"</strong> puis <strong>"Paiement marchand"</strong>.',
      `Entrez le numéro : <strong>${NUMERO_MARCHAND}</strong>`,
      'Saisissez le <strong>montant</strong> de votre commande en FCFA.',
      'Confirmez avec votre <strong>code PIN</strong> MoMo.',
      'Prenez une <strong>capture d\'écran</strong> de la confirmation.',
      'Envoyez la capture via WhatsApp pour valider votre commande.',
    ],
  },
  moov: {
    nom:    'Moov Money',
    emoji:  '🔵',
    etapes: [
      'Composez le <strong>*155#</strong> ou ouvrez l\'application Moov Money.',
      'Sélectionnez <strong>"Transfert"</strong> ou <strong>"Paiement"</strong>.',
      `Entrez le numéro : <strong>${NUMERO_MARCHAND}</strong>`,
      'Saisissez le <strong>montant exact</strong> en FCFA.',
      'Validez avec votre <strong>code PIN</strong> Moov Money.',
      'Enregistrez le <strong>reçu de transaction</strong>.',
      'Partagez le reçu sur WhatsApp pour confirmation immédiate.',
    ],
  },
  wave: {
    nom:    'Wave',
    emoji:  '🌊',
    etapes: [
      'Ouvrez l\'application <strong>Wave</strong> sur votre téléphone.',
      'Appuyez sur <strong>"Envoyer"</strong> dans le menu principal.',
      `Recherchez ou entrez le numéro : <strong>${NUMERO_MARCHAND}</strong>`,
      'Saisissez le <strong>montant</strong> de votre commande.',
      'Ajoutez une note : <strong>"Commande tchèpe [votre nom]"</strong>.',
      'Confirmez l\'envoi avec votre <strong>empreinte ou PIN</strong> Wave.',
      'Faites une <strong>capture d\'écran</strong> et envoyez-la sur WhatsApp.',
    ],
  },
};

let operateurActif = null;

/* Afficher les instructions pour un opérateur */
function afficherInstructions(operateur) {
  const instructions = INSTRUCTIONS_MOBILE[operateur];
  if (!instructions) return;

  operateurActif = operateur;

  // Mise à jour visuels des cartes
  Object.keys(INSTRUCTIONS_MOBILE).forEach(op => {
    const carte = document.getElementById(`carte-${op}`);
    if (carte) carte.classList.toggle('active', op === operateur);
  });

  // Remplir le bloc instructions
  const bloc     = document.getElementById('instructionsMobile');
  const titre    = document.getElementById('instrTitre');
  const etapesEl = document.getElementById('instrEtapes');
  const btnWA    = document.getElementById('instrWhatsapp');

  if (!bloc || !titre || !etapesEl) return;

  titre.textContent = `${instructions.emoji} Paiement via ${instructions.nom}`;

  etapesEl.innerHTML = instructions.etapes.map((etape, i) => `
    <div class="mobile-money-etape">
      <span></span>
      <span>${etape}</span>
    </div>
  `).join('');

  // Mettre à jour le lien WhatsApp
  if (btnWA) {
    const texte = encodeURIComponent(
      `Bonjour TCHÈPE PRESTIGE !\n` +
      `Je vous envoie la preuve de mon paiement ${instructions.nom}.\n` +
      `Merci de confirmer ma commande.`
    );
    btnWA.href = `https://wa.me/${WA_NUMERO}?text=${texte}`;
  }

  // Afficher avec animation
  bloc.classList.add('visible');
  bloc.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* Calculer le montant selon le formulaire de commande */
function getMontantCommande() {
  const sel = document.getElementById('commande');
  if (!sel || !sel.value) return null;

  const match = sel.value.match(/[\d\s]+FCFA/);
  if (match) {
    return parseInt(match[0].replace(/\s/g, '').replace('FCFA', ''));
  }
  return null;
}
