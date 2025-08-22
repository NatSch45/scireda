# Scireda - Documentation Technique d'Exploitation

Scireda est une plateforme de gestion de réseaux de connaissances permettant aux utilisateurs de créer, organiser et partager leurs notes dans un environnement collaboratif structuré.

## Architecture du Système

### Vue d'ensemble
- **Frontend** : Application React 18 + TypeScript avec Vite, TailwindCSS, TanStack Query
- **Backend** : API AdonisJS 6 avec base de données PostgreSQL
- **Déploiement** : Fly.io pour l'API, CI/CD avec GitHub Actions
- **Authentification** : JWT Bearer tokens avec système d'access tokens

### Structure du Monorepo
```
scireda/
├── scireda-api/          # Backend AdonisJS
│   ├── app/              # Application logic
│   ├── config/           # Configuration files
│   ├── database/         # Migrations et modèles
│   └── start/            # Bootstrap et routes
└── scireda-ui/           # Frontend React
    ├── src/              # Code source
    ├── tests/            # Tests unitaires et E2E
    └── public/           # Assets statiques
```

---

## 📋 Manuel de Déploiement

### Prérequis Système

#### Environnement de Développement
- **Node.js** : Version 18.18.0 minimum (recommandé 20+)
- **npm** : Version 8+
- **PostgreSQL** : Version 15+
- **Git** : Version 2.30+

#### Environnement de Production
- **Fly.io CLI** : Pour le déploiement backend
- **Secrets GitHub** : `FLY_API_TOKEN`, `SONAR_TOKEN`
- **Base de données** : PostgreSQL managée (Fly.io Postgres)

### Configuration des Variables d'Environnement

#### Backend (scireda-api)
Créer un fichier `.env` dans `scireda-api/` :
```env
NODE_ENV=development
PORT=3333
APP_KEY=<générer avec node ace generate:key>
HOST=localhost
LOG_LEVEL=info
DATABASE_URL=postgresql://username:password@localhost:5432/scireda
```

#### Frontend (scireda-ui)
Créer un fichier `.env` dans `scireda-ui/` :
```env
VITE_API_URL=http://localhost:3333/scireda-api
```

### Déploiement Local

#### 1. Installation des Dépendances
```bash
# Backend
cd scireda-api
npm install

# Frontend
cd ../scireda-ui
npm install
```

#### 2. Configuration Base de Données
```bash
cd scireda-api

# Créer la base de données
createdb scireda

# Exécuter les migrations
node ace migration:run
```

#### 3. Démarrage des Services
```bash
# Terminal 1 - Backend
cd scireda-api
npm run dev

# Terminal 2 - Frontend
cd scireda-ui
npm run dev
```

L'application sera accessible sur :
- Frontend : `http://localhost:5173`
- Backend API : `http://localhost:3333`

### Déploiement Production

#### 1. Configuration Fly.io
Le backend est automatiquement déployé sur Fly.io via GitHub Actions lors des pushs sur `main`.

**Configuration requise :**
- App Fly.io : `scireda-api`
- Région : `cdg` (Paris)
- Base de données PostgreSQL Fly.io attachée

#### 2. Variables d'Environnement Production
```bash
# Définir les secrets Fly.io
flyctl secrets set APP_KEY=<production-key>
flyctl secrets set DATABASE_URL=<postgres-connection-string>
flyctl secrets set NODE_ENV=production
```

#### 3. Déploiement Manuel
```bash
cd scireda-api
flyctl deploy --remote-only --build-arg NODE_ENV=production
```

#### 4. Vérification Déploiement
```bash
# Health check automatique
curl -f https://scireda-api.fly.dev/health

# Logs en temps réel
flyctl logs
```

### Pipeline CI/CD

#### Déclencheurs Automatiques
- **CI** : Pull requests vers `main`
- **Déploiement** : Push sur `main` avec modifications dans `scireda-api/`

#### Étapes CI
1. **Frontend** : Lint, TypeCheck, Tests, Build
2. **Backend** : Lint, TypeCheck, Tests avec PostgreSQL
3. **SonarCloud** : Analyse qualité code
4. **Lighthouse** : Tests performance frontend

#### Étapes Déploiement
1. Build Docker image
2. Déploiement Fly.io
3. Exécution migrations (`node ace migration:run --force`)
4. Health check automatique

### Surveillance et Monitoring

#### Logs
```bash
# Logs production
flyctl logs -a scireda-api

# Logs avec filtrage
flyctl logs -a scireda-api --region cdg
```

#### Métriques
- URL de santé : `https://scireda-api.fly.dev/health`
- Monitoring Fly.io Dashboard
- Alertes configurées sur échecs de déploiement

### Rollback et Recovery

#### Rollback Version
```bash
# Lister les releases
flyctl releases -a scireda-api

# Rollback vers version précédente
flyctl releases rollback <release-id> -a scireda-api
```

#### Backup Base de Données
```bash
# Backup manuel
flyctl postgres backup -a <postgres-app-name>

# Restauration
flyctl postgres import <backup-file> -a <postgres-app-name>
```

---

## 🚀 Manuel d'Utilisation

### Fonctionnalités Principales

#### Gestion des Utilisateurs
- **Inscription** : Création de compte avec email/mot de passe
- **Connexion** : Authentification JWT avec tokens d'accès
- **Profil** : Gestion des informations personnelles

#### Gestion des Réseaux
- **Création** : Nouveaux réseaux de connaissances
- **Organisation** : Structure hiérarchique avec dossiers
- **Partage** : Collaboration entre utilisateurs

#### Gestion des Notes
- **Éditeur** : Interface Markdown avec prévisualisation
- **Liens** : Connexions entre notes (note_links)
- **Organisation** : Classement dans dossiers

#### Interface Utilisateur

##### Navigation Principale
- **Accueil** : Dashboard avec réseaux récents
- **Réseaux** : Liste et gestion des réseaux
- **Notes** : Accès direct aux notes
- **Profil** : Paramètres utilisateur

##### Éditeur de Notes
- **Mode Édition** : Syntaxe Markdown complète
- **Prévisualisation** : Rendu en temps réel
- **Sauvegarde** : Automatique et manuelle
- **Liens** : Création de liens inter-notes

### Utilisation API

#### Authentification
```javascript
// Login
POST /scireda-api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Réponse
{
  "token": "jwt-token",
  "user": { ... }
}
```

#### Gestion des Réseaux
```javascript
// Créer un réseau
POST /scireda-api/networks
{
  "name": "Mon Réseau",
  "description": "Description du réseau"
}

// Lister les réseaux
GET /scireda-api/networks
```

#### Gestion des Notes
```javascript
// Créer une note
POST /scireda-api/notes
{
  "title": "Ma Note",
  "content": "# Contenu Markdown",
  "folderId": 1
}

// Modifier une note
PUT /scireda-api/notes/:id
{
  "title": "Titre Modifié",
  "content": "Nouveau contenu"
}
```

### Workflows Utilisateur

#### Workflow Création de Réseau
1. Connexion à l'application
2. Navigation vers "Réseaux"
3. Clic "Nouveau Réseau"
4. Saisie nom et description
5. Validation et création

#### Workflow Création de Note
1. Sélection d'un réseau
2. Navigation dans l'arborescence
3. Clic "Nouvelle Note"
4. Édition en Markdown
5. Sauvegarde automatique

#### Workflow Collaboration
1. Partage du réseau avec utilisateurs
2. Attribution des permissions
3. Notification aux collaborateurs
4. Édition collaborative des notes

### Bonnes Pratiques

#### Organisation des Contenus
- **Structure hiérarchique** : Utiliser les dossiers pour organiser
- **Nommage cohérent** : Convention de noms pour les notes
- **Liens pertinents** : Créer des connexions logiques
- **Tags** : Utiliser les métadonnées pour la recherche

#### Performance
- **Sauvegarde régulière** : Ne pas perdre le travail
- **Navigation optimisée** : Utiliser les raccourcis clavier
- **Prévisualisation** : Vérifier le rendu avant publication

---

## 🔄 Manuel de Mise à Jour

### Politique de Versioning

#### Stratégie de Branches
- **main** : Branch de production, stable
- **develop** : Branch de développement
- **feature/** : Branches de fonctionnalités
- **hotfix/** : Corrections urgentes

#### Semantic Versioning
- **MAJOR** : Changements incompatibles
- **MINOR** : Nouvelles fonctionnalités compatibles
- **PATCH** : Corrections de bugs

### Processus de Mise à Jour

#### Mise à Jour Développement

##### Backend (scireda-api)
```bash
cd scireda-api

# Mise à jour des dépendances
npm update

# Vérification de sécurité
npm audit fix

# Tests complets
npm test

# Mise à jour des migrations si nécessaire
node ace make:migration update_table_name
node ace migration:run
```

##### Frontend (scireda-ui)
```bash
cd scireda-ui

# Mise à jour des dépendances
npm update

# Vérification des vulnérabilités
npm audit fix

# Tests et build
npm run test
npm run build
```

#### Mise à Jour Production

##### 1. Préparation
```bash
# Créer une branche de release
git checkout -b release/v1.2.0

# Mise à jour des versions
# Backend
cd scireda-api
npm version minor

# Frontend
cd ../scireda-ui
npm version minor
```

##### 2. Tests Pre-Production
```bash
# Tests complets
cd scireda-api
npm test

cd ../scireda-ui
npm run test:coverage
npm run e2e
```

##### 3. Déploiement
```bash
# Merge vers main (déclenche le déploiement automatique)
git checkout main
git merge release/v1.2.0
git push origin main

# Tag de version
git tag v1.2.0
git push origin v1.2.0
```

##### 4. Vérification Post-Déploiement
```bash
# Health check
curl -f https://scireda-api.fly.dev/health

# Tests fumée
npm run e2e:prod
```

### Migrations Base de Données

#### Création de Migration
```bash
cd scireda-api

# Nouvelle migration
node ace make:migration add_column_to_table

# Structure de migration
export default class AddColumnToTable extends BaseSchema {
  async up() {
    this.schema.alterTable('table_name', (table) => {
      table.string('new_column').nullable()
    })
  }

  async down() {
    this.schema.alterTable('table_name', (table) => {
      table.dropColumn('new_column')
    })
  }
}
```

#### Exécution Migrations
```bash
# Développement
node ace migration:run

# Production (automatique via Fly.io)
# Configuré dans fly.toml : release_command = "node ace migration:run --force"
```

### Gestion des Dépendances

#### Audit Sécurité
```bash
# Backend
cd scireda-api
npm audit
npm audit fix

# Frontend
cd scireda-ui
npm audit
npm audit fix
```

#### Mise à Jour Majeure
```bash
# Vérifier les breaking changes
npm outdated

# Mise à jour progressive
npm install package@latest

# Tests après chaque mise à jour
npm test
```

### Rollback et Gestion d'Incidents

#### Rollback Automatique
```bash
# Via Fly.io
flyctl releases rollback -a scireda-api

# Vérification
flyctl releases -a scireda-api
```

#### Rollback Base de Données
```bash
# Rollback migration spécifique
node ace migration:rollback --batch=1

# Rollback vers version spécifique
node ace migration:rollback --to=20240101000000
```

#### Procédure d'Incident
1. **Détection** : Monitoring/Alertes
2. **Évaluation** : Impact et criticité
3. **Rollback** : Si nécessaire
4. **Investigation** : Analyse des logs
5. **Correction** : Hotfix si requis
6. **Post-Mortem** : Documentation

### Changelog et Documentation

#### Format Changelog
```markdown
## [1.2.0] - 2024-01-15

### Added
- Nouvelle fonctionnalité X
- Support pour Y

### Changed
- Amélioration de Z

### Fixed
- Correction bug A
- Résolution problème B

### Security
- Mise à jour dépendance vulnérable
```

#### Documentation Technique
- **API** : Swagger/OpenAPI dans `scireda-api-swagger.yaml`
- **Tests** : Couverture dans `coverage/`
- **Architecture** : Diagrammes dans `docs/`

### Monitoring des Mises à Jour

#### Métriques Clés
- **Uptime** : Disponibilité service
- **Response Time** : Performance API
- **Error Rate** : Taux d'erreur
- **Database** : Performance requêtes

#### Alertes
- **Échec déploiement** : Notification équipe
- **Performance dégradée** : Seuils configurés
- **Erreurs critiques** : Escalade automatique

---

## 📞 Support et Maintenance

### Contacts Équipe
- **Développement** : equipe-dev@scireda.com
- **Ops/Infrastructure** : ops@scireda.com
- **Support** : support@scireda.com

### Resources Techniques
- **Repository** : https://github.com/org/scireda
- **CI/CD** : GitHub Actions
- **Monitoring** : Fly.io Dashboard
- **Qualité** : SonarCloud

### Documentation Complémentaire
- **API Reference** : `/scireda-api-swagger.yaml`
- **Tests E2E** : `/scireda-ui/tests/e2e/README.md`
- **Cahier de Recettes** : `/scireda-ui/CAHIER_DE_RECETTES.md`

---

*Dernière mise à jour : Janvier 2024*
*Version documentation : 1.0.0*