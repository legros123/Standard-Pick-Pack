---
name: oracle-sql
description: Écrire, relire, corriger ou accélérer des requêtes SQL et du PL/SQL Oracle — notamment des requêtes de lecture sur un WMS Oracle via ODBC (Excel, Power Query, ADODB/VBA, Python). Erreurs ORA-, plans d'exécution, index, dates, agrégats, requêtes lentes, découverte de schéma.
---

# Oracle SQL

Sélection et adaptation de la collection officielle **Oracle Skills** (github.com/oracle/skills, domaine `db/`), Copyright (c) 2025 Oracle and/or its affiliates, sous Universal Permissive License v1.0 (voir `LICENSE.txt`). Seuls les fichiers utiles à l'écriture et au réglage de requêtes ont été gardés ; un lien vers un fichier absent de cette édition (admin, features, idempotency…) n'est pas disponible.

Les fichiers de référence sont dans `references/` à côté de ce SKILL.md. Lire uniquement celui dont la tâche a besoin.

## Règles avant de livrer une requête

1. **Lecture seule par défaut.** Sur une base de production (WMS), ne livrer que des `SELECT`. Tout `INSERT/UPDATE/DELETE/DDL` exige une demande explicite et passe par `references/agent/safe-dml-patterns.md` et `references/agent/destructive-op-guards.md`.
2. **Aucun nom inventé.** Si l'utilisateur a fourni un dictionnaire de données (fichier des tables/vues et colonnes), y chercher chaque table et contrôler chaque colonne avant de livrer. Sinon, donner les requêtes de découverte de `references/agent/schema-discovery.md` (`ALL_TAB_COLUMNS`, `ALL_VIEWS`…) et le dire.
3. **Version inconnue = syntaxe prudente.** `FETCH FIRST n ROWS ONLY` demande Oracle 12c+. Si la version n'est pas connue, utiliser `ROWNUM` dans une sous-requête ou fournir les deux. Version : `SELECT banner FROM v$version` (peut être refusé selon les droits).
4. **Dates.** Jamais de comparaison de chaînes : `col >= TO_DATE('2026-11-01','YYYY-MM-DD') AND col < TO_DATE('2026-11-02','YYYY-MM-DD')` (bornes semi-ouvertes, index utilisable), plutôt que `TRUNC(col) = …` sur une grosse table. `TRUNC(SYSDATE)` pour « aujourd'hui ».
5. **Pas de fonction sur une colonne indexée du WHERE** (`UPPER(col)`, `TO_CHAR(col)`, `NVL(col,…)`) sans nécessité : voir `references/sql-dev/sql-tuning.md` et `references/performance/index-strategy.md`.
6. **Via ODBC** (Excel, Power Query, ADODB, pyodbc) : pas de `;` final (provoque souvent ORA-00911), paramètres en `?` positionnels, alias de colonnes lisibles (`AS "Nb lignes"`) car ils deviennent les en-têtes Excel.
7. **NULL** : `NVL/COALESCE` pour les sommes et les jointures externes ; `NOT IN` sur une sous-requête qui peut contenir NULL ne renvoie rien → utiliser `NOT EXISTS`.
8. **Commenter** la requête livrée : but, tables, filtres, unité de chaque colonne calculée.

## Routage

| Besoin | Fichier |
|---|---|
| Règles générales, jointures, agrégats, NULL, style | `references/sql-dev/sql-best-practices.md` |
| Analytiques (`ROW_NUMBER`, `LAG`, `SUM() OVER`), pivots, `WITH`, hiérarchies, top-N | `references/sql-dev/sql-patterns.md` |
| Requête lente : réécriture, hints, statistiques | `references/sql-dev/sql-tuning.md` puis `references/performance/explain-plan.md` |
| Choix et usage des index | `references/performance/index-strategy.md` |
| SQL dynamique, `EXECUTE IMMEDIATE`, binds | `references/sql-dev/dynamic-sql.md` |
| Injection SQL, paramètres liés | `references/sql-dev/sql-injection-avoidance.md` |
| PL/SQL : bonnes pratiques et gestion d'erreurs | `references/sql-dev/pl-sql-best-practices.md`, `references/plsql/plsql-error-handling.md` |
| Trouver tables, colonnes, clés, vues | `references/agent/schema-discovery.md` |
| Traduire une demande métier en SQL, lever les ambiguïtés | `references/agent/nl-to-sql-patterns.md`, `references/agent/intent-disambiguation.md` |
| Comprendre et corriger une erreur ORA- | `references/agent/ora-error-catalog.md` |
| Écriture en base (rare, sur demande) | `references/agent/safe-dml-patterns.md`, `references/agent/destructive-op-guards.md` |
| Python : `oracledb`, pandas | `references/appdev/python-oracledb.md`, `references/frameworks/pandas-oracle.md` |

## Enchaînements utiles

- **Requête lente** : `sql-tuning` → `explain-plan` → `index-strategy`.
- **Nouvelle requête métier** : dictionnaire ou `schema-discovery` → `nl-to-sql-patterns` → `sql-patterns` → relecture avec les règles ci-dessus.
- **Erreur ORA-** : `ora-error-catalog`, puis vérifier noms de colonnes, types et droits.

## Format de livraison

Requête dans un bloc ```sql, lisible (un mot-clé par ligne, alias courts et constants), suivie d'une ligne sur ce qu'elle renvoie et des hypothèses faites (tables, statuts, périmètre). Si la requête sert dans Excel/VBA, le skill `vba-excel` décrit l'appel ADODB.
