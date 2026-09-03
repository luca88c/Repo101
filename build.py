#!/usr/bin/env python3
"""Genera dist/ a partire dai sorgenti in radice.

Cosa fa, in ordine:

1. esegue assets/yashi.js in Node con `window` e `document` finti e ne estrae
   header, footer e sprite come HTML statico, uno per pagina (l'header cambia
   perché segna la voce di menu corrente);
2. inserisce quell'HTML dentro ogni pagina, così la navigazione e il contenuto
   funzionano anche senza JavaScript;
3. inlinea CSS e JS e copia le cartelle di assets/ (fonts/, img/, …) in
   dist/assets/: sono le uniche risorse che restano esterne, perché inlinearle
   come data: URI vorrebbe dire ripeterle su ognuna delle nove pagine;
4. scrive tutto in dist/.

Senza Node la build va avanti lo stesso, ma header e footer tornano a dipendere
dal JavaScript — che è esattamente la cosa che volevamo evitare.

    python3 build.py
"""

import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
CSS = ROOT / "assets" / "yashi.css"
JS = ROOT / "assets" / "yashi.js"
ASSETS = ROOT / "assets"

PAGES = [
    "index.html",
    "catalogo.html",
    "prodotto.html",
    "dove-acquistare.html",
    "supporto.html",
    "azienda.html",
    "referenze.html",
    "eventi.html",
    "area-dealer.html",
    "privacy.html",
    "cookie.html",
    "404.html",
]

# Ambiente minimo per far girare yashi.js fuori dal browser: headerHTML,
# footerHTML e spriteHTML sono funzioni pure, mount() si autoesclude perché
# document.createElement non esiste.
NODE_SHIM = r"""
const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
const pages = process.argv.slice(3);

global.window = {
  addEventListener() {},
  requestAnimationFrame() {},
  matchMedia() { return { matches: false }; },
  scrollY: 0,
};
global.document = {                 // niente createElement: mount() si ferma qui
  body: null,
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {},
};
global.location = { pathname: '/index.html', search: '' };
global.alert = function () {};

new Function(src)();

const Y = global.window.Yashi;
if (!Y || !Y.headerHTML || !Y.footerHTML || !Y.spriteHTML) {
  throw new Error('yashi.js non ha esposto headerHTML/footerHTML/spriteHTML');
}

const out = { sprite: Y.spriteHTML(), footer: Y.footerHTML(), headers: {} };
pages.forEach(function (p) { out.headers[p] = Y.headerHTML(p); });
process.stdout.write(JSON.stringify(out));
"""

BODY_RE = re.compile(r"<body[^>]*>")
# Gli url dei font nel CSS sono relativi ad assets/yashi.css; una volta
# inlineato, il CSS vive dentro la pagina e vanno riferiti alla pagina.
FONT_URL_RE = re.compile(r'url\("fonts/')
CSS_LINK_RE = re.compile(r'[ \t]*<link rel="stylesheet" href="assets/yashi\.css">\n?')
JS_TAG_RE = re.compile(r'[ \t]*<script src="assets/yashi\.js"></script>\n?')


def extract_shell():
    """Header (per pagina), footer e sprite come HTML statico. None senza Node."""
    if shutil.which("node") is None:
        return None
    with tempfile.NamedTemporaryFile("w", suffix=".cjs", delete=False) as fh:
        fh.write(NODE_SHIM)
        shim = fh.name
    try:
        res = subprocess.run(
            ["node", shim, str(JS), *PAGES],
            capture_output=True, text=True, timeout=60,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        print(f"  ! Node non eseguibile: {exc}", file=sys.stderr)
        return None
    finally:
        Path(shim).unlink(missing_ok=True)

    if res.returncode != 0:
        print(f"  ! Node ha fallito:\n{res.stderr.strip()}", file=sys.stderr)
        return None
    try:
        return json.loads(res.stdout)
    except json.JSONDecodeError as exc:
        print(f"  ! Output di Node illeggibile: {exc}", file=sys.stderr)
        return None


def inline_css(src: str) -> str:
    """Inlinea yashi.css riportando gli url dei font al livello della pagina."""
    return FONT_URL_RE.sub('url("assets/fonts/', src)


def inline_js(src: str) -> str:
    """Inlinea yashi.js. `</script` va spezzato o chiude il tag che lo contiene."""
    return src.replace("</script", r"<\/script")


def build_page(name: str, css: str, js: str, shell) -> str:
    html = (ROOT / name).read_text(encoding="utf-8")

    # Sempre con una lambda: nel testo di sostituzione re.sub interpreterebbe
    # gli escape (\n, \1, \g) presenti in CSS e JavaScript.
    html = CSS_LINK_RE.sub(lambda _m: f"<style>\n{css}\n</style>\n", html, count=1)

    if shell:
        head = shell["sprite"] + "\n" + shell["headers"][name]
        html = BODY_RE.sub(lambda m: m.group(0) + "\n" + head, html, count=1)
        html = html.replace(
            '<script src="assets/yashi.js"></script>',
            shell["footer"] + '\n<script src="assets/yashi.js"></script>',
            1,
        )

    html = JS_TAG_RE.sub(lambda _m: f"<script>\n{inline_js(js)}\n</script>\n", html, count=1)
    return html


def main() -> int:
    for path in (CSS, JS):
        if not path.exists():
            print(f"manca {path.relative_to(ROOT)}", file=sys.stderr)
            return 1

    missing = [p for p in PAGES if not (ROOT / p).exists()]
    if missing:
        print("pagine mancanti: " + ", ".join(missing), file=sys.stderr)
        return 1

    print("Yashi — build")
    shell = extract_shell()
    if shell:
        print("  · shell statica estratta con Node (header, footer, sprite)")
    else:
        print("  ! senza Node: header e footer restano a carico del JavaScript")

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    css = inline_css(CSS.read_text(encoding="utf-8"))
    js = JS.read_text(encoding="utf-8")

    # Ogni sottocartella di assets/ (fonts/, img/, …) finisce in dist/assets/
    # con lo stesso nome: così "assets/img/foo.jpg" è un percorso valido sia
    # nei sorgenti sia nella pagina generata, e non serve riscrivere niente.
    htaccess = ROOT / ".htaccess"
    if htaccess.is_file():
        shutil.copy2(htaccess, DIST / ".htaccess")
        print("  · .htaccess copiato (ErrorDocument 404, CSP, cache)")

    for folder in sorted(d for d in ASSETS.iterdir() if d.is_dir()):
        dest = DIST / "assets" / folder.name
        shutil.copytree(folder, dest, ignore=shutil.ignore_patterns("*.md"))
        n = sum(1 for f in dest.rglob("*") if f.is_file())
        print(f"  · assets/{folder.name}/ copiata in dist/ ({n} file)")
    if not (ASSETS / "fonts").is_dir():
        print("  ! assets/fonts/ manca: le pagine ripiegheranno su Helvetica", file=sys.stderr)

    total = 0
    for name in PAGES:
        html = build_page(name, css, js, shell)
        (DIST / name).write_text(html, encoding="utf-8")
        size = len(html.encode("utf-8"))
        total += size
        print(f"  · dist/{name:<22} {size / 1024:6.1f} kB")

    print(f"  = {len(PAGES)} pagine, {total / 1024:.1f} kB totali")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
