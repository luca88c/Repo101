# Yashi — sito prodotto

Prototipo di rifacimento di **yashiweb.com** (Yashi Italia Srl, Verona: monitor,
all-in-one, notebook, server, digital signage, soluzioni per la scuola).
Vendita solo tramite rivenditori, mai diretta. Riferimento visivo: unitree.com
e samsung.com — pagine a tutta larghezza, scroll narrativo, elementi interattivi.

Il sito attuale è un layout Bootstrap del 2013 su backend PHP. Questo è un
prototipo statico, non ancora collegato a niente.

## Comandi

```bash
python3 build.py          # genera dist/ — rilanciare dopo OGNI modifica
python3 -m http.server 8000   # per aprire i sorgenti (file:// blocca assets/)
node --check assets/yashi.js  # controllo sintassi
```

`build.py` richiede **Node**: esegue `yashi.js` fuori dal browser con `window` e
`document` finti per estrarne header, footer e sprite come HTML statico.
Senza Node la build va avanti lo stesso ma header e footer tornano a dipendere
dal JavaScript, che è la cosa che volevamo evitare.

Le pagine in `dist/` sono file singoli: CSS e JS finiscono inline, quindi si
aprono anche da `file://` senza server.

## Regole di lavoro

- **Non modificare mai `dist/`.** È generata. Le modifiche vanno ai sorgenti in
  radice e ad `assets/`, poi si rilancia `build.py`.
- **Niente framework, niente npm, niente bundler.** Vanilla JS in IIFE, ES5 nello
  stile (`var`, `function`), nessuna dipendenza. Deve poter finire dentro dei
  template PHP senza toolchain.
- **Un solo posto per ogni cosa.** Menu e footer stanno in `assets/yashi.js`
  (`NAV`, `MEGA`, `FOOTER_COLS`, `headerHTML()`, `footerHTML()`). Non duplicare
  markup fra pagine: il menu mobile nasce dagli stessi array del mega menu.
- **Il CSS parte dai token** in cima ad `assets/yashi.css`. Non introdurre colori
  o dimensioni hardcoded fuori da lì.
- **Ogni pagina deve funzionare senza JS** per navigazione e contenuto. Le
  funzioni interattive (filtri, confronto, configuratore) possono richiederlo.

## Struttura

```
index.html              home: hero parete video, showcase sticky, configuratore LED
catalogo.html           filtri a faccette + confronto prodotti  → array P
prodotto.html           scheda Le Mans AI: viste, config, specifiche, download
dove-acquistare.html    mappa a caselle delle 20 regioni        → array D
supporto.html           archivio driver + modulo RMA            → array F
azienda.html            storia, conformità, Business Club
404.html
assets/yashi.css        token, tipografia, header, footer, confronto, stampa
assets/yashi.js         template header/footer, sprite icone, disegni, comportamenti
build.py                genera dist/
dist/                   GENERATA — non toccare
```

I dati sono array JS in fondo a ciascuna pagina. In produzione arrivano dal CMS:
la struttura è piatta apposta, un oggetto per record.

## Design — non negoziabile

Sono scelte motivate, non preferenze. Se vanno cambiate, va detto perché.

- **Nero puro `#000` per le sezioni scure.** È un brand di display: il black
  level è un valore del settore. Non usare grigi tipo `#111`.
- **Chiaro `#EFF1F2`**, alluminio anodizzato freddo. Non bianco, non crema.
- **Rosso `#E1261C` solo per segnali attivi** — stato live, sottolineature attive,
  errori. Mai come accento decorativo o come tinta di sfondo.
- **Archivo variabile, unica famiglia.** I titoli usano l'asse `wdth` (112–122),
  il corpo sta a 100. Niente seconda famiglia, niente monospace per i dati:
  si usa `font-variant-numeric: tabular-nums`.
- **Alternanza chiaro/scuro come dispositivo narrativo:** scorrendo, la pagina
  "si accende" entrando nelle sezioni prodotto. Le sezioni si marcano con
  `.s-dark` / `.s-light`, che ridefiniscono i token di contesto (`--ink`,
  `--hair`, `--surface`). Non aggiungere un theme toggle, romperebbe il meccanismo.
- **Prodotti come disegni tecnici SVG** (`Yashi.draw(tipo, etichetta, quota)`),
  non foto. Segnaposto onesto finché non arrivano le immagini vere, e non si
  rompe mai.
- **Griglie a filo:** `gap:1px` su sfondo `--hair` invece dei bordi sulle card.
  Attenzione: la griglia va riempita per intero o resta scoperto il fondo grigio
  (per questo `.regions` usa colonne esatte, non `auto-fit`).
- Niente ombre morbide, niente card che si sollevano all'hover, niente gradienti
  decorativi fuori dal motivo "parete video".

## Trappole

- `mount()` in `yashi.js` è **idempotente**: inietta header, footer e sprite solo
  se non ci sono già. In `dist/` ci sono, quindi si limita a collegare gli eventi.
  Se lo modifichi, mantieni questa proprietà.
- `window.Yashi` è assegnato come **prima istruzione** dell'IIFE. Le pagine lo
  leggono subito dopo, e ogni pagina ha una guardia che segnala se manca.
- `mount()` gira **sincrono**, non su `DOMContentLoaded`: lo script sta in fondo al
  `<body>`, e lo sprite deve esistere prima che le pagine disegnino i loro `<use>`.
- `headerHTML()`, `footerHTML()` e `spriteHTML()` sono **funzioni pure**: non
  toccano il DOM, o `build.py` non potrebbe eseguirle in Node.
- `build.py` sostituisce sempre con una **lambda**: nel testo di sostituzione
  `re.sub` interpreterebbe gli escape (`\n`, `\1`) presenti in CSS e JS. E fa
  escape di `</script` in `<\/script` quando inlinea il JavaScript.
- Le icone dello sprite non hanno `viewBox`: senza la regola di default in
  `yashi.css` diventerebbero 300 × 150.
- L'inversione di contrasto dell'header guarda quale sezione attraversa la sua
  mezzeria; `elementFromPoint` restituirebbe l'header stesso.
- Nessun backend: tutte le azioni ("richiedi preventivo", "apri RMA", "confronta")
  compongono un `mailto:` con corpo precompilato. È un pattern voluto, va mantenuto
  finché non c'è un endpoint vero.

## Fatto

Filtri a faccette con conteggi incrociati e stato nella query string;
confronto fino a 3 prodotti in `<dialog>` nativo, con evidenza del valore
migliore; configuratore parete LED con calcolo di superficie, risoluzione, peso
e assorbimento; modulo RMA che prepara la mail; showcase con media sticky;
header che inverte contrasto sulle sezioni scure; mega menu con pannello a tutta
larghezza e menu mobile generato dagli stessi dati; skip link, `aria-live` sui
contatori, tutto navigabile da tastiera; foglio di stampa che apre gli accordion
via `beforeprint`; Open Graph, JSON-LD, favicon inline.

## Aperto

Ordinati per urgenza reale.

1. **Font Archivo servito da Google Fonts CDN.** Va scaricato e servito locale:
   il Garante privacy considera problematico l'invio dell'IP degli utenti a Google.
   Si cambia nel `<link>` dell'head di ogni pagina.
2. **Dati rivenditori inventati** in `dove-acquistare.html` (array `D`). C'è un
   avviso visibile in pagina. Vanno sostituiti prima di qualunque pubblicazione.
3. **Foto prodotto** al posto degli SVG, dove disponibili.
4. **Verificare il dominio** nelle `rel="canonical"`: ora puntano a `www.yashiweb.com`.
5. **404 da collegare al server** (`ErrorDocument 404 /404.html` in Apache).
6. **Pagine mancanti:** eventi, referenze, login area dealer, privacy, cookie.
   Seguono lo schema `pagehead` + sezioni, si fanno in fretta.
7. **Multilingua IT/EN:** il selettore nell'header è finto e lo dichiara.
8. **Integrazione col PHP esistente:** header e footer diventano `include`,
   il catalogo legge dal database invece che dall'array `P`.
