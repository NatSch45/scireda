# Éditeur Markdown Scireda

## Solution au Problème Milkdown

### Problème Initial
Milkdown causait des erreurs d'affichage et des problèmes de compatibilité avec notre stack technique.

### Solution Implémentée
Nous avons remplacé Milkdown par une solution plus simple et robuste utilisant :
- **react-markdown** pour le rendu Markdown
- **rehype-highlight** pour la coloration syntaxique
- **remark-gfm** pour GitHub Flavored Markdown

## Fonctionnalités de l'Éditeur

### 🎨 **Modes d'Affichage**
- **Mode Édition** : Édition pure du Markdown
- **Mode Prévisualisation** : Rendu du Markdown uniquement
- **Mode Divisé** : Édition et prévisualisation côte à côte

### ✏️ **Édition**
- Textarea optimisée avec police monospace
- Placeholder informatif avec exemples
- Sauvegarde automatique après modification
- Support des tabulations et indentation

### 👁️ **Prévisualisation**
- Rendu en temps réel du Markdown
- Support complet de GitHub Flavored Markdown
- Coloration syntaxique des blocs de code
- Thème sombre cohérent avec l'application

### 📝 **Markdown Supporté**

#### Formatage de Base
- **Gras** et *italique*
- ~~Texte barré~~
- `Code inline`
- [Liens](https://example.com)

#### Titres
```markdown
# Titre 1
## Titre 2
### Titre 3
```

#### Listes
```markdown
- Liste à puces
- Autre élément

1. Liste numérotée
2. Autre élément
```

#### Citations
```markdown
> Ceci est une citation
> Sur plusieurs lignes
```

#### Tableaux
```markdown
| Colonne 1 | Colonne 2 |
|-----------|-----------|
| Données   | Données   |
```

#### Blocs de Code
```markdown
```javascript
console.log('Hello, World!');
```
```

#### Séparateurs
```markdown
---
```

## Architecture Technique

### Composants
```
NoteEditor
├── Header (Titre + Contrôles de mode)
├── Content
│   ├── Editor Panel (Mode édition/divisé)
│   └── Preview Panel (Mode prévisualisation/divisé)
└── Status Bar
```

### Props Interface
```typescript
interface NoteEditorProps {
  note?: Note;
  onSave: (content: string) => void;
  onTitleChange: (title: string) => void;
  isLoading?: boolean;
  className?: string;
}
```

### États Internes
- `content`: Contenu Markdown de la note
- `viewMode`: Mode d'affichage actuel ('edit' | 'preview' | 'split')

## Styling

### Classes CSS Personnalisées
- Typographie optimisée pour chaque élément Markdown
- Couleurs cohérentes avec le thème sombre
- Responsive design pour tous les modes
- Scrollbars stylisées

### Highlight.js
- Thème `github-dark` pour la coloration syntaxique
- Support de nombreux langages de programmation
- Intégration transparente avec react-markdown

## Avantages de cette Solution

### ✅ **Simplicité**
- Moins de dépendances complexes
- Configuration plus simple
- Maintenance facilitée

### ✅ **Performance**
- Rendu plus rapide
- Moins de JavaScript à charger
- Meilleure réactivité

### ✅ **Fiabilité**
- Moins de bugs potentiels
- Compatibilité assurée
- Écosystème mature

### ✅ **Fonctionnalités**
- Support complet du Markdown
- Prévisualisation en temps réel
- Modes d'affichage flexibles
- Coloration syntaxique

## Utilisation

### Dans un Composant
```tsx
import { NoteEditor } from '../components/NoteEditor';

function MyComponent() {
  const [note, setNote] = useState<Note>();
  
  return (
    <NoteEditor
      note={note}
      onSave={(content) => saveNote(content)}
      onTitleChange={(title) => updateTitle(title)}
      isLoading={false}
    />
  );
}
```

### Raccourcis Clavier
- **Ctrl/Cmd + S** : Sauvegarde manuelle
- **Tab** : Indentation dans l'éditeur
- **Enter dans le titre** : Focus sur l'éditeur

## Évolutions Futures

### Fonctionnalités Possibles
- [ ] Mode plein écran
- [ ] Raccourcis clavier pour le formatage
- [ ] Insertion d'images par drag & drop
- [ ] Autocomplétion de liens vers d'autres notes
- [ ] Export PDF/HTML
- [ ] Thèmes personnalisables pour l'éditeur

Cette solution offre une expérience d'édition Markdown robuste et moderne, parfaitement intégrée à l'écosystème Scireda.
