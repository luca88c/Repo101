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

CSS e JS finiscono inline in ogni pagina di `dist/`. Restano esterne solo le
cartelle di `assets/` (`fonts/`, `img/`, …), copiate tali e quali in
`dist/assets/`: inlinearle come `data:` URI vorrebbe dire ripeterle su ognuna
delle nove pagine — i soli font sono 170 kB. Il percorso `assets/img/foo.jpg`
vale quindi identico nei sorgenti e nella pagina generata.
Serve quindi un server anche per `dist/` — Chrome tratta ogni file `file://`
come origine opaca e rifiuta di caricare il font (il testo ripiega su
Helvetica, il resto funziona).

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
  o dimensioni hardcoded fuori da lì: fuori dai tre blocchi di token non deve
  comparire nessun `rgba()` con canali scritti a mano, si usa
  `color-mix(in srgb, var(--c-…) N%, transparent)`.
- **Ogni pagina deve funzionare senza JS** per navigazione e contenuto. Le
  funzioni interattive (filtri, confronto, configuratore) possono richiederlo.

## Struttura

```
index.html              home: hero parete video, showcase sticky, configuratore LED
catalogo.html           filtri a faccette + confronto prodotti  → array P
prodotto.html           scheda Le Mans AI: viste, config, specifiche, download
dove-acquistare.html    distributori e negozi online            → array DIST/RET
supporto.html           richiesta driver + modulo RMA
azienda.html            storia, conformità, Business Club
referenze.html          committenti per settore                  → array R
eventi.html             archivio eventi (fermo al 2013)          → array E
area-dealer.html        area riservata: cosa c'è, come si accede
privacy.html            informativa art. 13 GDPR
cookie.html             dichiarazione cookie (il sito non ne imposta)
404.html
assets/yashi.css        font, token, tipografia, header, footer, confronto, stampa
assets/yashi.js         template header/footer, sprite icone, disegni, comportamenti
assets/fonts/           Archivo variabile (latin, latin-ext) + licenza OFL
assets/img/             foto prodotto da yashiweb.com; il README spiega le convenzioni
assets/img/partner/     loghi di distributori e negozi online
assets/doc/             brochure PDF scaricate dal sito
.htaccess               ErrorDocument 404, CSP, cache, compressione
build.py                genera dist/
dist/                   GENERATA — non toccare
```

I dati sono array JS in fondo a ciascuna pagina. In produzione arrivano dal CMS:
la struttura è piatta apposta, un oggetto per record.

**Quasi tutto viene dal sito attuale.** Catalogo, referenze, distributori,
eventi e anagrafica sono stati presi da yashiweb.com. Dove il sito non pubblica
un dato, il prototipo non lo inventa: lo dice e offre la strada che l'azienda
usa davvero (di norma una mail precompilata).

**Il catalogo è reale.** I 154 prodotti dell'array `P`, le foto e le brochure
vengono da yashiweb.com: codice articolo, nome, specifiche e categoria sono
quelli a listino. È una fotografia presa una volta, non un aggancio in tempo
reale: quando il listino cambia va rifatta. Le specifiche sono testo libero
estratto dalle schede, quindi `pollici`, `ris`, `hz` e `pannello` ci sono solo
dove erano ricavabili — i filtri lo reggono, i prodotti senza quel dato
semplicemente non compaiono sotto quella faccetta.

## Design

Sono scelte motivate, non preferenze. Se vanno cambiate, va detto perché.

Il linguaggio è cambiato una volta, su richiesta esplicita: era una geometria
da scheda tecnica (angoli a zero, nessuna ombra, griglie a filo, nero
dominante), ora è la forma dei grandi marchi di elettronica di consumo —
samsung.com come riferimento — cioè fondo chiaro, superfici arrotondate che
galleggiano su un'ombra, bottoni a pillola. La tavolozza però non è cambiata:
è la forma ad essere Samsung, non il marchio.

- **Tre fondi, non due.** `--c-light` `#EFF1F2` è il terreno della pagina
  (alluminio anodizzato freddo, non bianco); `--c-card` `#FFF` è la superficie
  che ci galleggia sopra; `#000` puro resta per le sezioni in cui il prodotto
  va guardato acceso. Le sezioni si marcano `.s-light` (terreno), `.s-paper`
  (carta bianca, per non far fondere due sezioni chiare vicine) e `.s-dark`.
- **Il nero è rimasto in quattro punti in tutto:** apertura della vetrina in
  home, testata della scheda prodotto, pagina 404, barra di confronto. Se ne
  aggiungi altri, il chiaro smette di essere dominante e l'effetto svanisce.
- **Nero puro `#000` dove il nero c'è.** È un brand di display: il black level
  è un valore del settore. Non usare grigi tipo `#111`.
- **Rosso `#E1261C` solo per segnali attivi** — stato live, sottolineature attive,
  errori. Mai come accento decorativo o come tinta di sfondo: nel confronto il
  valore migliore si marca con un filo rosso a sinistra della cella, non con una
  campitura rosa.
- **Archivo variabile, unica famiglia, servita da noi.** I titoli usano l'asse
  `wdth` (112–122), il corpo sta a 100. Niente seconda famiglia, niente monospace
  per i dati: si usa `font-variant-numeric: tabular-nums`. Il font sta in
  `assets/fonts/`, mai su un CDN: mandare l'IP dei visitatori a Google per un
  carattere è proprio quello che il Garante contesta.
- **I contesti ridefiniscono i token, non i singoli colori.** `.s-light`,
  `.s-paper` e `.s-dark` riscrivono `--surface`, `--ink`, `--ink-mute`,
  `--hair`, `--hair-strong`, `--fill-soft`, `--fill-hover`, `--card` e
  `--shadow-card`. Ogni superficie nera che non sia una sezione va aggiunta al
  selettore di `.s-dark` — c'è già la barra di confronto — altrimenti i suoi
  toni secondari restano quelli del chiaro e spariscono sul nero. Menu, drawer,
  footer e dialogo confronto sono passati al chiaro e non stanno più lì.
  Non aggiungere un theme toggle, romperebbe il meccanismo.
- **Foto vere, disegno come ripiego.** Le foto prodotto arrivano da
  yashiweb.com e stanno in `assets/img/`, normalizzate a 4/3 su fondo bianco.
  `Yashi.draw(tipo, etichetta, quota)` resta come segnaposto dove la foto non
  c'è: stesso ingombro 4/3, quindi le griglie non si muovono in nessuno dei due
  casi. Non reintrodurre disegni dove esiste la foto.
- **Le card galleggiano.** Fondo `--card`, `--radius-lg`, `--shadow-card`, e
  all'hover salgono di `--lift` passando a `--shadow-card-hover`. Sul nero
  l'ombra non si vede: lì `--shadow-card` è `none` e la card si stacca con un
  filo di luce. Le griglie hanno spazio vero fra le celle (`--sp-4`): la vecchia
  griglia a filo andava riempita per intero o restava scoperto il fondo grigio,
  condizione impossibile da garantire con un elenco filtrabile.
- **Bottoni e chip a pillola** (`--radius-pill`), campi e avvisi a
  `--radius-sm`, card e dialoghi a `--radius-lg`. Nessun valore scritto a mano:
  tutto passa dalla scala `--radius-sm / --radius / --radius-lg`.
- **Le ombre sono neutre e verticali** (`--shadow-1/2/3`): servono a staccare la
  superficie dal fondo, non a fare scenografia. Niente aloni colorati.
- Gli unici gradienti decorativi sono due: la luce dietro l'apertura
  (`.hero__glow`) e la parete video (`.wall`).

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
- **Le frecce sono icone, non caratteri.** Archivo non contiene `→` (U+2192): un
  glifo del genere arriverebbe da un altro font e romperebbe la famiglia unica.
  Si usa `icon('arrow')` dallo sprite. `×`, `↑`, `↓` e `−` ci sono invece tutti.
- `build.py` riscrive `url("fonts/…")` in `url("assets/fonts/…")` quando inlinea
  il CSS: nel sorgente quei percorsi sono relativi ad `assets/yashi.css`, nella
  pagina generata devono esserlo alla pagina.
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
larghezza e menu mobile generato dagli stessi dati; catalogo con i prodotti,
le foto e i codici veri; skip link, `aria-live` sui
contatori, tutto navigabile da tastiera; foglio di stampa che apre gli accordion
via `beforeprint`; Open Graph, JSON-LD, favicon inline; Archivo servito in
locale, zero richieste a domini terzi; privacy e cookie policy collegate dal
footer; distributori, negozi online e referenze veri presi dal sito; `.htaccess`
con `ErrorDocument`, CSP verificata a browser aperto su tutte le pagine, cache
lunga sugli asset.

## Aperto

Ordinati per urgenza reale.

1. **Calendario eventi da ricostruire.** `eventi.html` mostra l'archivio vero,
   che sul sito attuale si ferma a marzo 2013 e lo dichiara in pagina. O si
   riempie con gli appuntamenti veri, o la pagina va tolta dal menu.
2. **Archivio driver da costruire.** Il sito attuale non pubblica i file: si
   chiedono via modulo. `supporto.html` fa lo stesso in modo più diretto e lo
   dichiara. Quando i file esisteranno, quella sezione torna a essere un elenco.
3. **Indirizzo della sede** non pubblicato sul sito attuale: nel prototipo non
   compare. Va aggiunto in `privacy.html` e nel footer quando lo si ha.
   L'unico indirizzo trovato è in un evento del 2013 (Via Fleming 2, Settimo di
   Pescantina) ed è troppo vecchio per essere usato senza conferma.
4. **Testi legali da validare.** `privacy.html` descrive con esattezza cosa fa il
   sito, ma tempi di conservazione ed eventuale DPO vanno confermati
   dall'azienda. C'è un avviso visibile in pagina.
5. **Login area dealer da collegare** al gestionale esistente: `area-dealer.html`
   ha il modulo disattivato e lo dichiara in pagina.
6. **Verificare il dominio** nelle `rel="canonical"`: ora puntano a `www.yashiweb.com`.
7. **Multilingua IT/EN:** il selettore nell'header è finto e lo dichiara.
8. **Integrazione col PHP esistente:** header e footer diventano `include`,
   il catalogo legge dal database invece che dall'array `P`, e la fotografia
   del listino smette di essere una fotografia.
