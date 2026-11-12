#!/usr/bin/env python3
"""Assemble pilotage.html (fichier unique, autonome, sans dépendance) à partir de outils/pilotage/source/.

Usage :  python3 outils/pilotage/construire.py            -> écrit pilotage.html à la racine du dépôt
         python3 outils/pilotage/construire.py --corps F  -> écrit aussi la variante « corps seul » dans F
"""
import base64, pathlib, sys

ICI = pathlib.Path(__file__).resolve().parent
SRC = ICI / "source"
RACINE = ICI.parent.parent

FACES = [("Big Shoulders Display", 700, "big-shoulders-display-latin-700-normal.woff2"),
         ("Big Shoulders Display", 900, "big-shoulders-display-latin-900-normal.woff2"),
         ("Lexend", 400, "lexend-latin-400-normal.woff2"),
         ("Lexend", 500, "lexend-latin-500-normal.woff2"),
         ("Lexend", 700, "lexend-latin-700-normal.woff2")]
JS = ["30_noyau.js", "40_scene3d.js", "50_graphes.js", "60_ecrans.js", "70_appli.js"]


def polices():
    out = ["/* Polices embarquées, SIL Open Font License 1.1 : Big Shoulders Display (The Big Shoulders Project Authors), Lexend (The Lexend Project Authors). */"]
    for fam, graisse, fichier in FACES:
        b64 = base64.b64encode((SRC / "polices" / fichier).read_bytes()).decode()
        out.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{graisse};font-display:block;"
                   f"src:url(data:font/woff2;base64,{b64}) format('woff2')}}")
    return "\n".join(out)


def lire(nom):
    return (SRC / nom).read_text(encoding="utf-8")


def main():
    css, corps = lire("10_style.css"), lire("20_corps.html")
    js = "\n".join(lire(n) for n in JS)
    assert "</script" not in js.lower(), "balise </script> dans le JS"
    tete = ('<title>Pilotage Pick &amp; Pack</title>\n'
            '<meta name="claude:viewport-fit-sides" content="cover">\n'
            '<meta name="robots" content="noindex">\n'
            '<meta name="description" content="Tour de contrôle du service Pick &amp; Pack : charge du jour, reste à faire, heure de fin estimée, rejets et erreurs décelées.">\n')
    icone = ("<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
             "%3Crect width='32' height='32' rx='7' fill='%23081020'/%3E%3Cpath d='M6 21l10 5 10-5M6 15.5l10 5 10-5M16 6 6 11l10 5 10-5z' "
             "fill='none' stroke='%233987E5' stroke-width='2.4' stroke-linejoin='round'/%3E%3C/svg%3E\">\n")
    styles = f"<style>\n{css}\n</style>\n<style id=\"polices\">\n{polices()}\n</style>\n"
    script = f"<script>\n{js}\n</script>\n"
    complet = ("<!doctype html>\n<html lang=\"fr\">\n<head>\n<meta charset=\"utf-8\">\n" + tete +
               '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + icone + styles +
               "</head>\n<body>\n" + corps + "\n" + script + "</body>\n</html>\n")
    (RACINE / "pilotage.html").write_text(complet, encoding="utf-8")
    if "--corps" in sys.argv:
        cible = pathlib.Path(sys.argv[sys.argv.index("--corps") + 1])
        cible.parent.mkdir(parents=True, exist_ok=True)
        cible.write_text(tete + styles + corps + "\n" + script, encoding="utf-8")
    print(f"pilotage.html : {len(complet.encode()) / 1024:.0f} Ko  (css {len(css) / 1024:.0f} Ko, js {len(js) / 1024:.0f} Ko)")


if __name__ == "__main__":
    main()
