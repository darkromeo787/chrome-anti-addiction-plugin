# Guide d'utilisation

## Installer L'extension Non Empaquetée

1. Ouvrez `chrome://extensions`.
2. Activez le mode développeur.
3. Cliquez sur Charger l'extension non empaquetée.
4. Sélectionnez le dossier du projet.
5. Épinglez l'extension si vous voulez accéder rapidement au popup.

## Première Configuration

1. Ouvrez la page d'options de l'extension.
2. Vérifiez la liste des sites surveillés. `zhihu.com` est inclus par défaut.
3. Ajoutez ou supprimez des domaines selon vos besoins.
4. Réglez la limite de session, la limite quotidienne par site et la limite quotidienne globale.
5. Choisissez un mode.
6. Activez le suivi et le blocage.
7. Enregistrez les réglages.

## Modes

- Doux : ferme l'onglet surveillé actuel lorsque la limite de session est atteinte.
- Blocage : redirige les sites surveillés vers la page de blocage interne après une limite atteinte.
- Strict : applique le blocage et retarde les changements qui assouplissent les limites.

## Popup De Barre D'outils

Cliquez sur l'icône de l'extension pour voir l'utilisation en direct :

- Session : visite continue actuelle.
- Site actuel aujourd'hui : total du jour pour le site surveillé actuel.
- Tous les sites surveillés aujourd'hui : total du jour pour tous les sites surveillés.

## Notifications

L'extension envoie des notifications Chrome à l'approche des limites, avec des jalons à 30, 20, 10 secondes et pendant les dernières secondes.

## Notes De Sécurité

- L'extension est désactivée par défaut.
- Les sites non surveillés sont ignorés.
- Les pages internes du navigateur comme `chrome://extensions` ne sont pas bloquées.
- Les données d'utilisation restent dans le stockage local du navigateur.