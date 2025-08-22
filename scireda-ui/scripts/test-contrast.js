// Script pour tester les contrastes de l'application Scireda
import { contrast } from '@adobe/leonardo-contrast-colors';

const colors = {
  // Couleurs principales
  primary: '#0D1B2A',
  accent: '#FF7F50',
  
  // Couleurs Tailwind utilisées
  slate900: '#0f172a',
  slate800: '#1e293b', 
  slate700: '#334155',
  slate600: '#475569',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  white: '#ffffff',
  black: '#000000',
  
  // Couleurs d'erreur
  red400: '#f87171',
  red600: '#dc2626',
  
  // Couleurs de succès
  green400: '#4ade80',
  green600: '#16a34a',
};

// Fonction pour évaluer le contraste WCAG
function evaluateContrast(ratio) {
  if (ratio >= 7) return '✅ AAA Normal & Large';
  if (ratio >= 4.5) return '✅ AA Normal, AAA Large';
  if (ratio >= 3) return '⚠️ AA Large seulement';
  return '❌ Non conforme';
}

console.log('🎨 AUDIT DE CONTRASTE - SCIREDA UI\n');
console.log('=' .repeat(50));

const testCombinations = [
  // Combinaisons principales
  { bg: 'slate900', fg: 'white', usage: 'Texte principal' },
  { bg: 'slate900', fg: 'slate300', usage: 'Texte secondaire' },
  { bg: 'slate900', fg: 'slate400', usage: 'Texte de support' },
  { bg: 'slate900', fg: 'accent', usage: 'Liens et éléments actifs' },
  
  // Boutons
  { bg: 'accent', fg: 'black', usage: 'Boutons principaux' },
  { bg: 'accent', fg: 'white', usage: 'Boutons (texte blanc)' },
  
  // Modales et cartes
  { bg: 'slate800', fg: 'white', usage: 'Modales - titre' },
  { bg: 'slate800', fg: 'slate300', usage: 'Modales - contenu' },
  
  // États d'erreur
  { bg: 'slate900', fg: 'red400', usage: 'Messages d\'erreur' },
  { bg: 'white', fg: 'red600', usage: 'Erreurs sur fond clair' },
  
  // États de succès
  { bg: 'slate900', fg: 'green400', usage: 'Messages de succès' },
  { bg: 'white', fg: 'green600', usage: 'Succès sur fond clair' },
  
  // Bordures et séparateurs
  { bg: 'slate900', fg: 'slate700', usage: 'Bordures subtiles' },
  { bg: 'slate800', fg: 'slate600', usage: 'Séparateurs' },
];

console.log('\n📊 RÉSULTATS DES TESTS DE CONTRASTE\n');

let totalTests = 0;
let passedAA = 0;
let passedAAA = 0;

testCombinations.forEach(({ bg, fg, usage }) => {
  const bgColor = colors[bg];
  const fgColor = colors[fg];
  
  if (!bgColor || !fgColor) {
    console.log(`❌ Couleur manquante: ${bg} ou ${fg}`);
    return;
  }
  
  try {
    const ratio = contrast(bgColor, fgColor);
    const evaluation = evaluateContrast(ratio);
    
    totalTests++;
    if (ratio >= 4.5) passedAA++;
    if (ratio >= 7) passedAAA++;
    
    console.log(`${evaluation}`);
    console.log(`   ${fgColor} sur ${bgColor} | Ratio: ${ratio.toFixed(2)}:1`);
    console.log(`   Usage: ${usage}\n`);
    
  } catch (error) {
    console.log(`❌ Erreur de calcul pour ${bg}/${fg}: ${error.message}\n`);
  }
});

console.log('=' .repeat(50));
console.log('📈 RÉSUMÉ GLOBAL\n');
console.log(`Total des tests: ${totalTests}`);
console.log(`Conformité WCAG AA (≥4.5:1): ${passedAA}/${totalTests} (${Math.round(passedAA/totalTests*100)}%)`);
console.log(`Conformité WCAG AAA (≥7:1): ${passedAAA}/${totalTests} (${Math.round(passedAAA/totalTests*100)}%)`);

if (passedAA === totalTests) {
  console.log('\n🎉 FÉLICITATIONS ! Tous les contrastes sont conformes WCAG AA !');
}

if (passedAAA >= totalTests * 0.8) {
  console.log('🌟 EXCELLENT ! Plus de 80% des contrastes atteignent le niveau AAA !');
}

console.log('\n🏆 SCORE GLOBAL DE CONTRASTE: ' + 
  (passedAA === totalTests ? '10/10' : 
   passedAA >= totalTests * 0.9 ? '9/10' : 
   passedAA >= totalTests * 0.8 ? '8/10' : '7/10 ou moins'));
