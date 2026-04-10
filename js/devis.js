/* ============================================
   TCHÈPE PRESTIGE — devis.js
   Calculateur de devis automatique
   ============================================ */

'use strict';

/* Grille de tarification */
const GRILLE_THERMOS = [
  { max: 6,   kg:  5,   prix_premium:   6000 },
  { max: 12,  kg: 10,   prix_premium:  12000 },
  { max: 24,  kg: 20,   prix_premium:  24000 },
  { max: 36,  kg: 30,   prix_premium:  36000 },
  { max: 50,  kg: 40,   prix_premium:  50000 },
  { max: 64,  kg: 50,   prix_premium:  64000 },
  { max: 90,  kg: 70,   prix_premium:  90000 },
  { max: 130, kg: 100,  prix_premium: 130000 },
];

const MULTIPLICATEUR_PRESTIGE = 1.30;

/* Trouver les thermos optimaux pour un nombre de personnes */
function calculerThermos(nbPersonnes) {
  let restant = nbPersonnes;
  const thermos = [];

  // Cherche la combinaison la plus efficace
  while (restant > 0) {
    // Trouve le plus grand thermos qui couvre exactement ou moins que le restant
    let trouve = null;
    for (let i = GRILLE_THERMOS.length - 1; i >= 0; i--) {
      if (GRILLE_THERMOS[i].max <= restant) {
        trouve = GRILLE_THERMOS[i];
        break;
      }
    }
    // Si aucun ne couvre exactement, prend le plus petit au-dessus
    if (!trouve) {
      trouve = GRILLE_THERMOS.find(t => t.max >= restant) || GRILLE_THERMOS[0];
    }

    thermos.push(trouve);
    restant -= trouve.max;

    // Sécurité anti-boucle infinie
    if (thermos.length > 20) break;
  }

  return thermos;
}

/* Formater un nombre en FCFA */
function formatFCFA(n) {
  return new Intl.NumberFormat('fr-CI').format(n) + ' FCFA';
}

/* Fonction principale appelée par le bouton */
function calculerDevis() {
  const nbPersonnes  = parseInt(document.getElementById('devisPersonnes')?.value) || 0;
  const formule      = document.getElementById('devisFormule')?.value || 'premium';
  const zoneEl       = document.getElementById('devisZone');
  const fraisLivraison = parseInt(zoneEl?.value) || 1500;
  const nomZone      = zoneEl?.options[zoneEl.selectedIndex]?.dataset.nom || zoneEl?.options[zoneEl.selectedIndex]?.textContent || 'Abidjan';
  const dateEl       = document.getElementById('devisDate');
  const dateVal      = dateEl?.value || '';

  const resultatEl   = document.getElementById('calculateurResultat');
  const lignesEl     = document.getElementById('resultatLignes');
  const montantEl    = document.getElementById('resultatMontant');
  const btnWA        = document.getElementById('btnWhatsappDevis');

  if (!nbPersonnes || nbPersonnes < 1) {
    alert('Veuillez indiquer le nombre de personnes (minimum 1).');
    return;
  }

  // Calcul
  const thermosList   = calculerThermos(nbPersonnes);
  const multiplicateur = formule === 'prestige' ? MULTIPLICATEUR_PRESTIGE : 1;

  let totalThermos = 0;
  const lignesHtml = thermosList.map(t => {
    const prix = Math.round(t.prix_premium * multiplicateur);
    totalThermos += prix;
    return `
      <div class="resultat-ligne">
        <span class="label">Thermos ${t.kg} kg (${t.max} pers.) — ${formule === 'prestige' ? 'Prestige' : 'Premium'}</span>
        <span class="valeur">${formatFCFA(prix)}</span>
      </div>
    `;
  }).join('');

  const totalFinal = totalThermos + fraisLivraison;

  // Affichage
  lignesEl.innerHTML = `
    ${lignesHtml}
    <div class="resultat-ligne">
      <span class="label">Frais de livraison — ${nomZone}</span>
      <span class="valeur">${formatFCFA(fraisLivraison)}</span>
    </div>
  `;

  // Animation count-up sur le total
  animerChiffre(montantEl, totalFinal);

  resultatEl.classList.add('visible');

  // Bouton WhatsApp pré-rempli
  if (btnWA) {
    const evenement = document.getElementById('devisEvenement')?.value || '';
    const texte = encodeURIComponent(
      `Bonjour TCHÈPE PRESTIGE !\n` +
      `Je souhaite confirmer ce devis :\n` +
      `👥 Personnes : ${nbPersonnes}\n` +
      `🎉 Événement : ${evenement || 'Non précisé'}\n` +
      `✨ Formule : ${formule === 'prestige' ? 'Prestige' : 'Premium'}\n` +
      `🍲 Thermos : ${thermosList.map(t => `${t.kg}kg`).join(' + ')}\n` +
      `📍 Zone : ${nomZone}\n` +
      (dateVal ? `📅 Date : ${dateVal}\n` : '') +
      `💰 TOTAL ESTIMÉ : ${formatFCFA(totalFinal)}`
    );
    btnWA.href = `https://wa.me/2250586176086?text=${texte}`;
  }

  // Scroll vers résultat
  resultatEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* Animation count-up */
function animerChiffre(el, cible) {
  if (!el) return;
  const duree = 600;
  const debut = Date.now();
  const start = 0;

  function step() {
    const progress = Math.min((Date.now() - debut) / duree, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const valeur   = Math.round(start + (cible - start) * eased);
    el.textContent = formatFCFA(valeur);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* Génération PDF devis côté client */
function telechargerDevis() {
  const nbPersonnes  = document.getElementById('devisPersonnes')?.value || '—';
  const formule      = document.getElementById('devisFormule')?.value || 'premium';
  const zoneEl       = document.getElementById('devisZone');
  const nomZone      = zoneEl?.options[zoneEl?.selectedIndex]?.dataset.nom || '';
  const montant      = document.getElementById('resultatMontant')?.textContent || '—';
  const date         = document.getElementById('devisDate')?.value || '—';
  const evenement    = document.getElementById('devisEvenement')?.value || '—';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Devis TCHÈPE PRESTIGE</title>
<style>
  body { font-family: Georgia, serif; color: #0A0A0A; max-width: 700px; margin: 40px auto; padding: 20px; }
  h1 { color: #C8A84E; font-size: 28px; border-bottom: 2px solid #C8A84E; padding-bottom: 12px; }
  .info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
  .info-item label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #888; display: block; }
  .info-item span { font-size: 16px; font-weight: bold; }
  .total { background: #0A0A0A; color: #C8A84E; padding: 20px; text-align: center; margin-top: 24px; font-size: 24px; }
  .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 16px; }
</style>
</head>
<body>
<h1>TCHÈPE PRESTIGE — Devis</h1>
<p>Traiteur Abidjan – Tchèpe Grande Quantité | www.tchepeprestige.com</p>
<div class="info">
  <div class="info-item"><label>Événement</label><span>${evenement}</span></div>
  <div class="info-item"><label>Nombre de personnes</label><span>${nbPersonnes}</span></div>
  <div class="info-item"><label>Formule</label><span>${formule === 'prestige' ? 'Prestige (+ garnitures luxe)' : 'Premium (classique)'}</span></div>
  <div class="info-item"><label>Zone livraison</label><span>${nomZone}</span></div>
  <div class="info-item"><label>Date souhaitée</label><span>${date}</span></div>
  <div class="info-item"><label>Validité devis</label><span>30 jours</span></div>
</div>
<div class="total">TOTAL ESTIMÉ : ${montant}</div>
<p style="margin-top:16px;font-size:13px;color:#666;">
  Ce devis est indicatif. Paiement 50% à l'avance. Frais de livraison inclus.<br>
  Pour confirmer : +225 05 861 760 86 | contact@tchepeprestige.com
</p>
<div class="footer">
  TCHÈPE PRESTIGE – Produit NAYAB GROUP | RCCM CI-ABJ-2020-B-16133 | Cocody-Angré 8e Tranche, Abidjan
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `Devis-TCHEPE-PRESTIGE-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
