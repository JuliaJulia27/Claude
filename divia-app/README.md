# Divia Dijon — Prochains passages

Application web (PWA installable) pour consulter, en temps réel, les prochains
passages des trams et bus du réseau **DiviaMobilités** (Dijon Métropole) :
choix du mode (tram/bus), de la ligne, de l'arrêt et de la direction.

**→ Tester en ligne : https://juliajulia27.github.io/Claude/divia-app/**
(déployé automatiquement sur GitHub Pages, voir `.github/workflows/deploy-pages.yml`)

## Architecture décidée

| Question | Décision |
|---|---|
| Plateforme | Application web / PWA (React + Vite), installable sur téléphone |
| Source des données | Service temps réel de Divia, interrogé **en direct depuis le navigateur** (pas de backend) |
| Persistance | `localStorage` : dernier arrêt consulté, favoris, cache court de la liste des arrêts |

## Source des données

Il n'existe pas d'API officielle publique pour les horaires temps réel Divia.
L'application s'appuie sur le paquet npm **[`divia-api`](https://github.com/gauthier-th/divia-api)**
(non officiel, licence MIT, sans dépendance), qui interroge directement depuis
le navigateur le proxy pré-signé de Navitia (`nws-main.hove.io`, l'infrastructure
utilisée par l'appli officielle Divia Mobilités) pour la couverture
`fr-ne-dijon`. Aucune clé API n'est nécessaire côté utilisateur — c'est ce
mécanisme qui permet à cette appli de fonctionner sans backend.

Pour chaque passage renvoyé, l'API indique s'il est `realtime` (position
réelle du véhicule) ou `base_schedule` (horaire théorique, quand la donnée
temps réel n'est pas encore disponible) — l'appli affiche ce statut sous
chaque horaire.

**Limite connue** : cette dépendance à un service tiers non officiel est un
choix pragmatique, faute d'API officielle ouverte pour le temps réel. Le
réseau egress de cet environnement de build bloque `nws-main.hove.io`, donc le
bon fonctionnement n'a pas pu être vérifié en conditions réelles depuis cette
session — seuls la compilation et le typage ont été validés. Testez l'appli
une fois déployée ; si le service tiers venait à changer, `src/api/divia.ts`
est le seul point de contact avec `divia-api` à adapter.

## Fonctionnement de l'appli

1. **Choix du mode** (Tram / Bus) puis **de la ligne** — liste avec pastille
   colorée reprenant les couleurs officielles renvoyées par l'API.
2. **Choix de l'arrêt** sur cette ligne, avec recherche par nom.
3. **Tableau des horaires** : un bloc par **direction** desservant cet arrêt,
   avec les prochains passages (temps restant en minutes + heure d'horloge à
   Dijon, quel que soit le fuseau de l'appareil). Des onglets permettent de
   filtrer sur une seule direction. Rafraîchissement automatique toutes les
   30 s, plus un bouton "Actualiser" manuel.
4. **Favoris** : bouton étoile pour épingler une combinaison ligne/arrêt ;
   les favoris s'affichent en haut de l'écran pour un accès direct.
5. Le dernier arrêt consulté est mémorisé (`localStorage`) et rouvert
   automatiquement au prochain lancement.

## Développement

```bash
cd divia-app
npm install
npm run dev       # développement
npm run build      # build de prod (dist/), inclut la vérification des types
npm run preview    # aperçu local du build
```

Installation sur téléphone : ouvrir le site déployé dans le navigateur puis
« Ajouter à l'écran d'accueil » (aucune publication sur un store n'est requise).

## Pistes d'évolution

- Géolocalisation pour proposer directement les arrêts les plus proches.
- Affichage des perturbations/infos trafic (l'API `divia-api` ne les expose
  pas actuellement).
- Notification push quand un passage favori approche.
