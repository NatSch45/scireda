# Sécurité - Scireda

## 🔒 Mesures de sécurité implémentées

### Authentification et mots de passe

- **Hachage sécurisé** : Utilisation de `scrypt` avec des paramètres robustes
- **Politique de mots de passe forts** :
  - Minimum 8 caractères
  - Au moins une majuscule
  - Au moins une minuscule  
  - Au moins un chiffre
  - Au moins un caractère spécial (@$!%*?&)
- **Tokens JWT** avec expiration (24h)
- **Protection contre les fuites** : Mots de passe jamais exposés dans les réponses API

### Sécurité des communications

- **Headers de sécurité** :
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` configurée
- **CORS** configuré pour les domaines autorisés
- **HTTPS recommandé** en production

### Protection des données

- **UUID** pour les identifiants utilisateurs (pas d'énumération)
- **Validation stricte** des entrées utilisateur
- **Sérialisation sécurisée** (mots de passe exclus)

## 🚨 Alertes de sécurité du navigateur

Si vous voyez une alerte Chrome "Modifiez votre mot de passe", cela signifie :

1. **Ce n'est PAS un problème avec l'application Scireda**
2. Chrome détecte que votre mot de passe personnel a été compromis dans une violation de données
3. **Action recommandée** : Changez votre mot de passe personnel comme suggéré par Chrome

## 🔧 Recommandations pour les utilisateurs

1. **Utilisez des mots de passe uniques** pour chaque service
2. **Activez l'authentification à deux facteurs** quand disponible
3. **Mettez à jour régulièrement** vos mots de passe
4. **Utilisez un gestionnaire de mots de passe** (comme Google Password Manager, 1Password, etc.)

## 📋 Checklist de sécurité pour le déploiement

- [ ] Variables d'environnement sécurisées
- [ ] HTTPS activé
- [ ] Base de données avec accès restreint
- [ ] Logs de sécurité configurés
- [ ] Sauvegardes régulières
- [ ] Monitoring des accès

---

**Note** : Cette application suit les meilleures pratiques de sécurité. Les alertes de navigateur concernent généralement la sécurité de vos comptes personnels, pas l'application elle-même.
