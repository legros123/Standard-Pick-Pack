# Contrôle des rejets v4 — sans base Oracle

Génère `Controle_Rejets_V4.xlsm` (macros intégrées) à partir de l'ancien fichier v3 :
l'historique et la liste des opérateurs sont repris, rien de personnel n'est versionné ici.

```bash
python3 outils/controle_rejets/build_rejets.py Controle_Rejets.xlsm --sortie Controle_Rejets_V4.xlsm --bas modules_vba
```

`--bas` écrit aussi les modules VBA en `.bas` / `.cls.txt` (Windows-1252, CRLF) : copie de secours à
importer à la main (Alt+F11) si Excel refusait le projet VBA intégré.

## Onglets

| Onglet | Rôle |
|---|---|
| **SAISIE** | Scan du contenant → date + heure auto. Type (liste ou 1-6), **2e colis** si Orientation (2 colis, 1 seule erreur), réf, **emplacement précis `06-121-05 A`** (2-3-2 chiffres + lettre A à H ; `0612105a` est remis en forme, un format faux passe en rouge), opérateur (liste ou matricule), commentaire. La prochaine case à remplir est toujours **jaune**. |
| **TABLEAU DE BORD** | Période + opérateur (cases jaunes). KPI, types (vs période précédente), top 20 opérateurs × types, allées (2 premiers chiffres de l'emplacement), tranches horaires, tendance 25 jours ouvrés, top 10 réf, 12 mois. Formules, sauf le top réf (macro). |
| **HISTORIQUE** | Tableau `T_REJETS` : 1 ligne = 1 erreur (colonnes Emplacement et Allée). Case RECHERCHE (plusieurs mots). Chaque début de journée, la veille y est rangée seule. |
| **SYNTHESE** | Tableau `T_SYNTHESE` : 1 ligne = 1 opérateur × 1 jour (erreurs, colis, détail par type). |
| **OPERATEURS** | Tableau `T_OPE`. `NOM PRÉNOM` = clé commune avec le Suivi Op. Actif = NON → retiré de la liste. |
| **REGLAGES** | Site, seuils, options, types d'erreur, allées, actions, aide Power Query. |

## Récupérer les données (Suivi Op, dashboard)

- Power Query : *Données › Obtenir des données › Classeur Excel* → `T_SYNTHESE` (ou `T_REJETS`).
- Ou le CSV `Rejets_historique.csv` écrit à chaque archivage à côté du classeur (UTF-8, `;`), lisible même
  quand le classeur est ouvert sur le poste rejet.
- Erreurs décelées d'un opérateur un jour donné :
  `SOMME.SI.ENS(T_SYNTHESE[Erreurs];T_SYNTHESE[Date];date;T_SYNTHESE[Opérateur];nom)`.

## Fichiers

| Fichier | Contenu |
|---|---|
| `build_rejets.py` | Construction du classeur (openpyxl) et reprise de l'historique v3. |
| `vba/modRejets.bas` | Toutes les macros (source UTF-8). |
| `vba/documents.py` | Code de ThisWorkbook et des feuilles (événements). |
| `vbaproj.py` | Écrit `xl/vbaProject.bin` en « source seule » (MS-OVBA) : Excel recompile à l'ouverture. |

Reprise v3 → v4 : « Manquant (qté −) » devient **Quantité -** (l'ancien fichier ne distinguait pas
ligne manquante et quantité manquante) ; « Surplus (qté +) » → Quantité + ; « Erreur de référence » →
Référence ; « Article abîmé » → Casse ; l'emplacement est repris dans sa colonne (sans lettre s'il n'en avait pas) ;
réf trouvée et écart passent dans le commentaire.
