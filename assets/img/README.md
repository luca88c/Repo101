# Immagini

Qualunque file messo qui finisce in `dist/assets/img/` quando gira `build.py`,
con lo stesso nome. Il percorso da scrivere nelle pagine è quindi sempre lo
stesso nei sorgenti e nella pagina generata:

```html
<img class="photo" src="assets/img/le-mans-ai-27-fronte.jpg"
     width="1600" height="1200" loading="lazy" decoding="async"
     alt="Monitor Le Mans AI 27 pollici visto di fronte">
```

Regole, in ordine di importanza:

- **`width` e `height` sempre**, con le dimensioni reali del file. Senza, la
  pagina salta mentre l'immagine arriva.
- **`alt` che descrive**, non che ripete il nome del prodotto. Se l'immagine è
  puramente decorativa: `alt=""`.
- **`loading="lazy"`** su tutto tranne l'immagine visibile all'apertura della
  pagina (quella va caricata subito, altrimenti si vede comparire).
- **Classe `.photo`**: stesso ingombro del disegno tecnico (4/3 a piena
  larghezza, ritaglio `cover`), così sostituire un `Yashi.draw(...)` con un
  `<img>` non muove le griglie. Con `.photo .photo--contain` l'immagine viene
  contenuta invece che ritagliata — utile per prodotti su fondo neutro.
- **Niente immagini di sfondo in CSS** per contenuto vero: non hanno `alt` e
  non si stampano.

## Formati

JPEG per le foto, PNG solo se serve trasparenza, SVG per gli schemi. WebP e
AVIF vanno bene ma servono con un `<picture>` che tenga il JPEG come fallback,
non da soli.

Lato peso: un'immagine da 1600 px di lato larga basta e avanza per il layout
attuale; sopra i 300 kB conviene ricomprimere.

## Nomi

`prodotto-vista.jpg`, minuscolo, trattini, niente accenti e niente spazi:
`le-mans-ai-27-fronte.jpg`, `parete-led-showroom.jpg`.
