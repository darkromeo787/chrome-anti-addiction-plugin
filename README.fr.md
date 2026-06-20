# Extension Chrome Anti-Addiction

Une extension Chrome respectueuse de la vie privée pour limiter le temps passé sur des sites choisis. Elle ne suit que les sites configurés, conserve les données localement et reste désactivée par défaut par sécurité.

Langues : [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Français](README.fr.md)

## Fonctionnalités

- Limite de session pour une visite continue.
- Limite quotidienne par site.
- Limite quotidienne pour tous les sites surveillés.
- Popup de barre d'outils avec état en direct pour la session, le site actuel et l'ensemble des sites surveillés.
- Notifications de compte à rebours avant la limite.
- Sécurité d'abord : désactivé par défaut, les pages internes du navigateur ne sont jamais bloquées, les sites non surveillés sont ignorés.
- Stockage local uniquement, sans compte et sans envoi de l'historique de navigation.
- Interface localisée en anglais, chinois simplifié, chinois traditionnel et français.

## Installation Pour Tester

1. Ouvrez `chrome://extensions`.
2. Activez le mode développeur.
3. Cliquez sur Charger l'extension non empaquetée.
4. Sélectionnez le dossier du projet.
5. Ouvrez la page d'options et activez le suivi seulement après avoir vérifié les sites et les limites.

## Documentation

- [Guide d'utilisation](docs/USAGE.fr.md)
- [English Usage Guide](docs/USAGE.en.md)
- [使用帮助（简体中文）](docs/USAGE.zh-CN.md)
- [使用說明（繁體中文）](docs/USAGE.zh-TW.md)
- [Exigences](docs/REQUIREMENTS.md)

## Développement

```bash
npm install
npm test
```

L'extension utilise Chrome Manifest V3 et des modules JavaScript natifs. Les tests utilisent Vitest.

## Confidentialité

Les réglages et les compteurs d'utilisation sont stockés dans `chrome.storage.local`. Aucune donnée de navigation n'est envoyée à un serveur.

## Licence

Aucune licence n'a encore été choisie.