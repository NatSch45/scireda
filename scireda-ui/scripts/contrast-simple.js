// Calcul simple de contraste WCAG
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

function evaluateContrast(ratio) {
  if (ratio >= 7) return '✅ AAA Normal & Large';
  if (ratio >= 4.5) return '✅ AA Normal, AAA Large';
  if (ratio >= 3) return '⚠️ AA Large seulement';
  return '❌ Non conforme WCAG';
}

const colors = {
  primary: '#0D1B2A',
  accent: '#FF7F50',
  slate900: '#0f172a',
  slate800: '#1e293b', 
  slate700: '#334155',
  slate600: '#475569',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  white: '#ffffff',
  black: '#000000',
  red400: '#f87171',
  red600: '#dc2626',
  green400: '#4ade80',
  green600: '#16a34a',
};

console.log('🎨 AUDIT DE CONTRASTE - SCIREDA UI');
console.log('=' .repeat(60));

const testCombinations = [
  { bg: 'slate900', fg: 'white', usage: 'Texte principal sur fond sombre' },
  { bg: 'slate900', fg: 'slate300', usage: 'Texte secondaire' },
  { bg: 'slate900', fg: 'slate400', usage: 'Texte de support' },
  { bg: 'slate900', fg: 'accent', usage: 'Logo et liens actifs' },
  { bg: 'accent', fg: 'black', usage: 'Boutons principaux' },
  { bg: 'accent', fg: 'white', usage: 'Boutons avec texte blanc' },
  { bg: 'slate800', fg: 'white', usage: 'Modales - titres' },
  { bg: 'slate800', fg: 'slate300', usage: 'Modales - contenu' },
  { bg: 'slate900', fg: 'red400', usage: 'Messages d\'erreur' },
  { bg: 'slate900', fg: 'green400', usage: 'Messages de succès' },
  { bg: 'white', fg: 'red600', usage: 'Erreurs sur fond clair' },
  { bg: 'white', fg: 'green600', usage: 'Succès sur fond clair' },
];

let totalTests = 0;
let passedAA = 0;
let passedAAA = 0;

console.log('\n📊 RÉSULTATS DÉTAILLÉS:\n');

testCombinations.forEach(({ bg, fg, usage }) => {
  const bgColor = colors[bg];
  const fgColor = colors[fg];
  
  const ratio = getContrastRatio(fgColor, bgColor);
  const evaluation = evaluateContrast(ratio);
  
  totalTests++;
  if (ratio >= 4.5) passedAA++;
  if (ratio >= 7) passedAAA++;
  
  console.log(`${evaluation}`);
  console.log(`   ${fgColor} sur ${bgColor}`);
  console.log(`   Ratio: ${ratio.toFixed(2)}:1`);
  console.log(`   Usage: ${usage}`);
  console.log('');
});

console.log('=' .repeat(60));
console.log('📈 RÉSUMÉ FINAL:\n');

console.log(`📊 Total des tests: ${totalTests}`);
console.log(`✅ Conformité WCAG AA (≥4.5:1): ${passedAA}/${totalTests} (${Math.round(passedAA/totalTests*100)}%)`);
console.log(`🌟 Conformité WCAG AAA (≥7:1): ${passedAAA}/${totalTests} (${Math.round(passedAAA/totalTests*100)}%)`);

const scoreAA = Math.round(passedAA/totalTests*100);
const scoreAAA = Math.round(passedAAA/totalTests*100);

console.log('\n🎯 ÉVALUATION GLOBALE:');

if (scoreAA === 100) {
  console.log('🏆 PARFAIT ! Tous les contrastes respectent WCAG AA !');
} else if (scoreAA >= 90) {
  console.log('🌟 EXCELLENT ! Plus de 90% conformes WCAG AA !');
} else if (scoreAA >= 80) {
  console.log('✅ TRÈS BIEN ! Plus de 80% conformes WCAG AA !');
} else {
  console.log('⚠️ À améliorer - Moins de 80% conformes WCAG AA');
}

if (scoreAAA >= 80) {
  console.log('🚀 EXCEPTIONNEL ! Plus de 80% atteignent le niveau AAA !');
} else if (scoreAAA >= 60) {
  console.log('👍 TRÈS BIEN ! Plus de 60% atteignent le niveau AAA !');
}

const globalScore = Math.round((scoreAA * 0.7 + scoreAAA * 0.3) / 10);
console.log(`\n🏆 SCORE GLOBAL DE CONTRASTE: ${globalScore}/10`);

if (globalScore >= 9) {
  console.log('🎉 FÉLICITATIONS ! Excellente accessibilité visuelle !');
} else if (globalScore >= 7) {
  console.log('👏 BRAVO ! Bonne accessibilité visuelle !');
}
