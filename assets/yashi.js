/* ==========================================================================
   Yashi — comportamenti e template condivisi
   Vanilla ES5 in IIFE, nessuna dipendenza: deve poter finire dentro template
   PHP senza toolchain. Header, footer e sprite vivono SOLO qui.
   build.py esegue questo file in Node con window/document finti per estrarne
   l'HTML statico: per questo headerHTML/footerHTML/spriteHTML sono funzioni
   pure che non toccano il DOM.
   ========================================================================== */
(function () {
  'use strict';

  /* window.Yashi è la PRIMA istruzione: le pagine lo leggono subito dopo
     l'inclusione dello script, e ognuna ha una guardia se manca. */
  var Y = (window.Yashi = {});

  var hasDOM = typeof document !== 'undefined' && !!document.createElement;

  /* -- Dati di navigazione ------------------------------------------------ */

  var NAV = [
    { id: 'prodotti', label: 'Prodotti', href: 'catalogo.html', mega: 'prodotti' },
    { id: 'soluzioni', label: 'Soluzioni', href: 'catalogo.html?uso=scuola', mega: 'soluzioni' },
    { id: 'dove', label: 'Dove acquistare', href: 'dove-acquistare.html' },
    { id: 'supporto', label: 'Supporto', href: 'supporto.html' },
    { id: 'azienda', label: 'Azienda', href: 'azienda.html' }
  ];

  var MEGA = {
    prodotti: {
      cols: [
        { title: 'Monitor', links: [
          { label: 'Serie Office', href: 'catalogo.html?cat=monitor&serie=office' },
          { label: 'Serie Pro', href: 'catalogo.html?cat=monitor&serie=pro' },
          { label: 'Serie Gaming', href: 'catalogo.html?cat=monitor&serie=gaming' },
          { label: 'Tutti i monitor', href: 'catalogo.html?cat=monitor' }
        ] },
        { title: 'Computer', links: [
          { label: 'All-in-One', href: 'catalogo.html?cat=aio' },
          { label: 'Notebook', href: 'catalogo.html?cat=notebook' },
          { label: 'Mini PC', href: 'catalogo.html?cat=minipc' },
          { label: 'Server', href: 'catalogo.html?cat=server' }
        ] },
        { title: 'Digital signage', links: [
          { label: 'Display professionali', href: 'catalogo.html?cat=signage' },
          { label: 'Pareti LED', href: 'index.html#configuratore' },
          { label: 'Totem e chioschi', href: 'catalogo.html?cat=kiosk' },
          { label: 'Monitor touch', href: 'catalogo.html?cat=touch' }
        ] }
      ],
      feature: {
        kicker: 'Novità 2026',
        title: 'Le Mans AI 27"',
        text: 'QD-OLED 240 Hz con motore di upscaling on-device.',
        href: 'prodotto.html',
        draw: 'monitor'
      }
    },
    soluzioni: {
      cols: [
        { title: 'Settori', links: [
          { label: 'Scuola e formazione', href: 'catalogo.html?uso=scuola' },
          { label: 'Ufficio e PA', href: 'catalogo.html?uso=ufficio' },
          { label: 'Retail e horeca', href: 'catalogo.html?uso=retail' },
          { label: 'Sanità', href: 'catalogo.html?uso=sanita' }
        ] },
        { title: 'Per i rivenditori', links: [
          { label: 'Business Club', href: 'azienda.html#business-club' },
          { label: 'Diventa rivenditore', href: 'dove-acquistare.html#diventa-rivenditore' },
          { label: 'Materiali marketing', href: 'supporto.html#materiali' },
          { label: 'Garanzia e RMA', href: 'supporto.html#rma' },
          { label: 'Referenze', href: 'referenze.html' },
          { label: 'Eventi', href: 'eventi.html' },
          { label: 'Area dealer', href: 'area-dealer.html' }
        ] }
      ],
      feature: {
        kicker: 'Bando scuola',
        title: 'Aule connesse',
        text: 'Monitor touch 65–86" con staffa, PC OPS e formazione inclusa.',
        href: 'catalogo.html?uso=scuola',
        draw: 'signage'
      }
    }
  };

  var FOOTER_COLS = [
    { title: 'Prodotti', links: [
      { label: 'Monitor', href: 'catalogo.html?cat=monitor' },
      { label: 'All-in-One', href: 'catalogo.html?cat=aio' },
      { label: 'Notebook', href: 'catalogo.html?cat=notebook' },
      { label: 'Server', href: 'catalogo.html?cat=server' },
      { label: 'Digital signage', href: 'catalogo.html?cat=signage' }
    ] },
    { title: 'Supporto', links: [
      { label: 'Driver e manuali', href: 'supporto.html#driver' },
      { label: 'Apri una RMA', href: 'supporto.html#rma' },
      { label: 'Garanzia', href: 'supporto.html#garanzia' },
      { label: 'Contatti', href: 'supporto.html#contatti' }
    ] },
    { title: 'Azienda', links: [
      { label: 'Chi siamo', href: 'azienda.html' },
      { label: 'Referenze', href: 'referenze.html' },
      { label: 'Eventi', href: 'eventi.html' },
      { label: 'Conformità', href: 'azienda.html#conformita' },
      { label: 'Business Club', href: 'azienda.html#business-club' },
      { label: 'Dove acquistare', href: 'dove-acquistare.html' }
    ] }
  ];

  /* -- Icone: uno sprite unico, disegnato una volta sola ------------------ */

  var ICONS = {
    menu: '<path d="M2 5h20M2 12h20M2 19h20"/>',
    close: '<path d="M4 4l16 16M20 4L4 20"/>',
    chevron: '<path d="M4 8l8 8 8-8"/>',
    arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    download: '<path d="M12 3v13M6 11l6 6 6-6M4 21h16"/>',
    check: '<path d="M4 12.5l5.5 5.5L20 6"/>',
    alert: '<path d="M12 3l9.5 17h-19L12 3zM12 9v5M12 17.5v.5"/>',
    pin: '<path d="M12 22s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/>',
    compare: '<path d="M4 5h6v14H4zM14 5h6v14h-6zM10 12h4"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    mail: '<path d="M3 5h18v14H3zM3 6l9 7 9-7"/>',
    phone: '<path d="M6 3h4l2 5-2.5 1.5a12 12 0 005 5L16 12l5 2v4a2 2 0 01-2 2A16 16 0 014 6a2 2 0 012-3z"/>',
    print: '<path d="M7 9V3h10v6M7 19H4V9h16v10h-3M7 14h10v7H7z"/>',
    grid: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>',
    rotate: '<path d="M20 12a8 8 0 11-2.4-5.7M20 3v4h-4"/>'
  };

  function spriteHTML() {
    var out = '<svg id="yashi-sprite" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">';
    for (var name in ICONS) {
      if (!ICONS.hasOwnProperty(name)) continue;
      out += '<symbol id="i-' + name + '" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
          +  ' stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter">'
          +  ICONS[name] + '</symbol>';
    }
    return out + '</svg>';
  }

  function icon(name, cls) {
    return '<svg class="' + (cls || '') + '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>';
  }

  /* -- Disegni tecnici ----------------------------------------------------
     Segnaposto onesto finché non arrivano le foto: non si rompe mai, non
     finge di essere una fotografia e comunica la misura reale. */

  var DRAWINGS = {
    monitor: '<rect class="tech-draw__screen" x="46" y="34" width="228" height="128"/>'
      + '<rect class="tech-draw__line" x="46" y="34" width="228" height="128"/>'
      + '<rect class="tech-draw__line" x="52" y="40" width="216" height="116"/>'
      + '<path class="tech-draw__line" d="M150 162v28h20v-28M126 196h68"/>'
      + '<path class="tech-draw__line" d="M126 196c0-4 3-6 8-6h52c5 0 8 2 8 6"/>',
    aio: '<rect class="tech-draw__screen" x="52" y="30" width="216" height="126"/>'
      + '<rect class="tech-draw__line" x="52" y="30" width="216" height="126"/>'
      + '<path class="tech-draw__line" d="M52 156h216v14H52zM140 170l-16 30h72l-16-30"/>'
      + '<path class="tech-draw__line" d="M112 200h96"/>',
    notebook: '<path class="tech-draw__line" d="M74 44h172v104H74z"/>'
      + '<rect class="tech-draw__screen" x="82" y="52" width="156" height="88"/>'
      + '<path class="tech-draw__line" d="M52 148h216l14 26H38z"/>'
      + '<path class="tech-draw__line" d="M132 160h56"/>',
    server: '<rect class="tech-draw__line" x="60" y="52" width="200" height="36"/>'
      + '<rect class="tech-draw__line" x="60" y="98" width="200" height="36"/>'
      + '<rect class="tech-draw__line" x="60" y="144" width="200" height="36"/>'
      + '<path class="tech-draw__line" d="M74 66h18M74 112h18M74 158h18"/>'
      + '<circle class="tech-draw__line" cx="238" cy="70" r="4"/>'
      + '<circle class="tech-draw__line" cx="238" cy="116" r="4"/>'
      + '<circle class="tech-draw__line" cx="238" cy="162" r="4"/>',
    signage: '<rect class="tech-draw__screen" x="38" y="28" width="244" height="146"/>'
      + '<rect class="tech-draw__line" x="38" y="28" width="244" height="146"/>'
      + '<path class="tech-draw__line" d="M155 174v22M120 196h80M60 50h40M60 60h24"/>',
    kiosk: '<rect class="tech-draw__line" x="104" y="24" width="112" height="150"/>'
      + '<rect class="tech-draw__screen" x="112" y="32" width="96" height="112"/>'
      + '<path class="tech-draw__line" d="M104 174h112v22H104zM92 196h136"/>',
    touch: '<rect class="tech-draw__screen" x="44" y="36" width="232" height="130"/>'
      + '<rect class="tech-draw__line" x="44" y="36" width="232" height="130"/>'
      + '<circle class="tech-draw__line" cx="160" cy="101" r="18"/>'
      + '<path class="tech-draw__line" d="M160 83v-10M160 129v10M142 101h-10M188 101h10"/>'
      + '<path class="tech-draw__line" d="M104 178h112"/>',
    minipc: '<rect class="tech-draw__line" x="90" y="72" width="140" height="76"/>'
      + '<path class="tech-draw__line" d="M90 132h140"/>'
      + '<circle class="tech-draw__line" cx="110" cy="92" r="4"/>'
      + '<path class="tech-draw__line" d="M150 92h60M150 104h40"/>',
    wall: '<g class="tech-draw__line">'
      + '<rect x="52" y="44" width="68" height="52"/><rect x="126" y="44" width="68" height="52"/>'
      + '<rect x="200" y="44" width="68" height="52"/><rect x="52" y="102" width="68" height="52"/>'
      + '<rect x="126" y="102" width="68" height="52"/><rect x="200" y="102" width="68" height="52"/></g>'
      + '<rect class="tech-draw__screen" x="52" y="44" width="216" height="110"/>'
  };

  /* draw(kind, label, dim) → SVG in stile disegno quotato. */
  function draw(kind, label, dim) {
    var body = DRAWINGS[kind] || DRAWINGS.monitor;
    var out = '<span class="tech-draw" role="img" aria-label="' + esc(label || 'Disegno tecnico prodotto') + '">'
      + '<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid meet">'
      /* squadrette di registro agli angoli */
      + '<g class="tech-draw__line" opacity=".45">'
      + '<path d="M14 30V14h16M290 14h16v16M306 210v16h-16M30 226H14v-16"/></g>'
      + body;
    if (dim) {
      out += '<g class="tech-draw__dim"><path d="M46 216h228M46 211v10M274 211v10"/></g>'
          +  '<text class="tech-draw__label" x="160" y="232" text-anchor="middle">' + esc(dim) + '</text>';
    }
    if (label) {
      out += '<text class="tech-draw__label" x="14" y="248" opacity="0">' + esc(label) + '</text>';
    }
    return out + '</svg></span>';
  }

  /* -- Utility ------------------------------------------------------------ */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }

  function currentPage() {
    if (typeof location === 'undefined') return '';
    var p = location.pathname.split('/').pop();
    return p || 'index.html';
  }

  function isActive(href, page) {
    return href.split('?')[0].split('#')[0] === page;
  }

  /* -- Template ----------------------------------------------------------- */

  function headerHTML(page) {
    page = page || currentPage();
    var i, item, html;

    html = '<a class="skip-link" href="#main">Vai al contenuto</a>'
      + '<header class="site-header" id="site-header" data-scrolled="false" data-contrast="dark">'
      + '<div class="header-bar">'
      + '<a class="brand" href="index.html" aria-label="Yashi, home">'
      + '<svg viewBox="0 0 24 24" aria-hidden="true" class="brand__mark" fill="currentColor">'
      + '<path d="M2 3h5l5 8 5-8h5l-7.5 12V21h-5v-6z"/></svg>Yashi</a>'
      + '<nav class="nav" aria-label="Principale">';

    var marked = false;   /* una sola voce corrente: catalogo.html sta sotto due */
    for (i = 0; i < NAV.length; i++) {
      item = NAV[i];
      var cur = '';
      if (!marked && isActive(item.href, page)) { cur = ' aria-current="page"'; marked = true; }
      html += '<div class="nav__item">';
      if (item.mega) {
        html += '<button type="button" class="nav__link" data-mega="' + item.id + '"'
             +  ' aria-expanded="false" aria-controls="mega-' + item.id + '"' + cur + '>'
             +  esc(item.label) + icon('chevron') + '</button>';
      } else {
        html += '<a class="nav__link" href="' + item.href + '"' + cur + '>' + esc(item.label) + '</a>';
      }
      html += '</div>';
    }

    html += '</nav><div class="header-tools">'
      + '<a class="dealer-link" href="area-dealer.html">Area dealer</a>'
      + '<button type="button" class="lang" data-lang aria-label="Lingua del sito, italiano">IT<span aria-hidden="true">/</span><span class="muted">EN</span></button>'
      + '<a class="btn btn--sm" href="dove-acquistare.html"><span>Trova un rivenditore</span></a>'
      + '<button type="button" class="burger" data-drawer aria-expanded="false" aria-controls="drawer" aria-label="Apri il menu">'
      + icon('menu') + '</button>'
      + '</div></header>';

    /* pannelli mega, uno per voce che ne ha uno */
    for (var key in MEGA) {
      if (!MEGA.hasOwnProperty(key)) continue;
      var m = MEGA[key];
      html += '<div class="mega" id="mega-' + key + '" data-open="false"><div class="mega__inner">'
        + '<div class="mega__cols">';
      for (i = 0; i < m.cols.length; i++) {
        html += '<div><p class="mega__title">' + esc(m.cols[i].title) + '</p><ul class="mega__list">';
        for (var j = 0; j < m.cols[i].links.length; j++) {
          var l = m.cols[i].links[j];
          html += '<li><a href="' + l.href + '">' + esc(l.label) + icon('arrow') + '</a></li>';
        }
        html += '</ul></div>';
      }
      html += '</div><a class="mega__feature" href="' + m.feature.href + '">'
        + draw(m.feature.draw, m.feature.title)
        + '<p class="eyebrow">' + esc(m.feature.kicker) + '</p>'
        + '<h3>' + esc(m.feature.title) + '</h3>'
        + '<p class="small muted">' + esc(m.feature.text) + '</p></a>'
        + '</div></div>';
    }

    /* menu mobile: stesse fonti, nessun markup duplicato a mano */
    html += '<div class="drawer" id="drawer" data-open="false">';
    for (i = 0; i < NAV.length; i++) {
      item = NAV[i];
      html += '<div class="drawer__group">';
      if (item.mega) {
        html += '<button type="button" class="drawer__toggle" aria-expanded="false"'
             +  ' aria-controls="dpanel-' + item.id + '">' + esc(item.label) + icon('chevron') + '</button>'
             +  '<div class="drawer__panel" id="dpanel-' + item.id + '" data-open="false">';
        var cols = MEGA[item.mega].cols;
        for (var c = 0; c < cols.length; c++) {
          html += '<div><p class="mega__title">' + esc(cols[c].title) + '</p><ul class="mega__list">';
          for (var k = 0; k < cols[c].links.length; k++) {
            html += '<li><a href="' + cols[c].links[k].href + '">' + esc(cols[c].links[k].label)
              + icon('arrow') + '</a></li>';
          }
          html += '</ul></div>';
        }
        html += '</div>';
      } else {
        html += '<a href="' + item.href + '">' + esc(item.label) + icon('arrow') + '</a>';
      }
      html += '</div>';
    }
    html += '<div class="drawer__group"><a href="dove-acquistare.html">Trova un rivenditore' + icon('arrow') + '</a></div>'
         +  '<div class="drawer__group"><a href="area-dealer.html">Area dealer' + icon('arrow') + '</a></div>'
      + '</div>';

    return html;
  }

  function footerHTML() {
    var html = '<footer class="site-footer" id="site-footer"><div class="wrap">'
      + '<div class="footer-top"><div class="footer-brand">'
      + '<p class="display">Yashi</p>'
      + '<p class="small muted">Yashi Italia Srl · Via Torricelli 15, 37135 Verona<br>'
      + 'P. IVA 03616270234 · <a href="mailto:info@yashiweb.com">info@yashiweb.com</a></p>'
      + '<p class="small muted">Vendiamo esclusivamente attraverso rivenditori autorizzati.<br>'
      + '<a class="link-arrow" href="dove-acquistare.html">Trova il tuo</a></p>'
      + '</div><div class="footer-cols">';

    for (var i = 0; i < FOOTER_COLS.length; i++) {
      html += '<div><h3>' + esc(FOOTER_COLS[i].title) + '</h3><ul>';
      for (var j = 0; j < FOOTER_COLS[i].links.length; j++) {
        var l = FOOTER_COLS[i].links[j];
        html += '<li><a href="' + l.href + '">' + esc(l.label) + '</a></li>';
      }
      html += '</ul></div>';
    }

    html += '</div></div><div class="footer-legal">'
      + '<p>© ' + (new Date().getFullYear()) + ' Yashi Italia Srl · Tutti i marchi appartengono ai rispettivi proprietari.</p>'
      + '<p class="row"><a href="privacy.html">Privacy</a><a href="cookie.html">Cookie</a><a href="azienda.html#conformita">Conformità</a></p>'
      + '</div></div></footer>';
    return html;
  }

  /* -- Comportamenti ------------------------------------------------------ */

  function bindHeader() {
    var header = qs('#site-header');
    if (!header || header.dataset.bound === 'true') return;
    header.dataset.bound = 'true';

    var megas = qsa('.mega');
    var drawer = qs('#drawer');

    function closeMegas(except) {
      qsa('.nav__link[data-mega]').forEach(function (b) {
        if (b.getAttribute('data-mega') === except) return;
        b.setAttribute('aria-expanded', 'false');
      });
      megas.forEach(function (m) {
        if (m.id === 'mega-' + except) return;
        m.setAttribute('data-open', 'false');
      });
      if (!except && drawer && drawer.getAttribute('data-open') !== 'true') {
        header.setAttribute('data-open', 'false');
      }
    }

    var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    qsa('.nav__link[data-mega]').forEach(function (btn) {
      var id = btn.getAttribute('data-mega');
      var panel = qs('#mega-' + id);
      var byHover = false;

      function open(state) {
        btn.setAttribute('aria-expanded', state ? 'true' : 'false');
        if (panel) panel.setAttribute('data-open', state ? 'true' : 'false');
        header.setAttribute('data-open', state ? 'true' : 'false');
        if (state) closeMegas(id);
        if (!state) byHover = false;
      }

      on(btn, 'click', function () {
        /* Il pannello aperto passando col mouse non deve richiudersi al primo
           clic: il clic lo "conferma", il secondo lo chiude. */
        if (byHover) { byHover = false; return; }
        open(btn.getAttribute('aria-expanded') !== 'true');
      });

      if (!canHover) return;
      on(btn, 'mouseenter', function () {
        if (btn.getAttribute('aria-expanded') !== 'true') { open(true); byHover = true; }
      });
      on(btn.parentNode, 'mouseleave', function (e) {
        if (panel && panel.contains(e.relatedTarget)) return;
        open(false);
      });
      if (panel) on(panel, 'mouseleave', function () { open(false); });
    });

    on(document, 'keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeMegas();
      if (drawer && drawer.getAttribute('data-open') === 'true') toggleDrawer(false);
    });
    on(document, 'click', function (e) {
      if (header.contains(e.target)) return;
      var inMega = false;
      megas.forEach(function (m) { if (m.contains(e.target)) inMega = true; });
      if (!inMega) closeMegas();
    });

    var burger = qs('[data-drawer]');
    function toggleDrawer(state) {
      if (!drawer || !burger) return;
      drawer.setAttribute('data-open', state ? 'true' : 'false');
      burger.setAttribute('aria-expanded', state ? 'true' : 'false');
      burger.setAttribute('aria-label', state ? 'Chiudi il menu' : 'Apri il menu');
      burger.innerHTML = icon(state ? 'close' : 'menu');
      header.setAttribute('data-open', state ? 'true' : 'false');
      document.documentElement.style.overflow = state ? 'hidden' : '';
    }
    on(burger, 'click', function () {
      toggleDrawer(drawer.getAttribute('data-open') !== 'true');
    });

    qsa('.drawer__toggle').forEach(function (btn) {
      on(btn, 'click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        var panel = qs('#' + btn.getAttribute('aria-controls'));
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (panel) panel.setAttribute('data-open', open ? 'true' : 'false');
      });
    });

    on(qs('[data-lang]'), 'click', function () {
      /* Il multilingua non esiste ancora: lo diciamo invece di fingere. */
      alert('La versione inglese del sito è in preparazione.');
    });

    /* Stato scroll + inversione di contrasto sopra le sezioni chiare.
       Si guarda quale sezione attraversa la mezzeria dell'header: elementFromPoint
       restituirebbe l'header stesso, che è fisso e sopra a tutto. */
    var tones = qsa('.s-light, .s-dark');
    var ticking = false;
    function syncHeader() {
      ticking = false;
      header.setAttribute('data-scrolled', window.scrollY > 8 ? 'true' : 'false');
      var y = header.offsetHeight / 2, tone = 'dark';
      for (var i = 0; i < tones.length; i++) {
        var r = tones[i].getBoundingClientRect();
        if (r.top <= y && r.bottom > y) {
          tone = tones[i].classList.contains('s-light') ? 'light' : 'dark';
        }
      }
      header.setAttribute('data-contrast', tone);
    }
    on(window, 'scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncHeader);
    });
    on(window, 'resize', syncHeader);
    syncHeader();
  }

  function bindReveal() {
    var items = qsa('[data-reveal]:not([data-shown])');
    if (!items.length) return;
    if (!window.IntersectionObserver) {
      items.forEach(function (el) { el.setAttribute('data-shown', 'true'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.setAttribute('data-shown', 'true');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .12 });
    items.forEach(function (el) { io.observe(el); });
  }

  function bindShowcase() {
    var steps = qsa('.showcase__step');
    if (!steps.length || !window.IntersectionObserver) {
      steps.forEach(function (s) { s.setAttribute('data-active', 'true'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        steps.forEach(function (s) { s.setAttribute('data-active', 'false'); });
        en.target.setAttribute('data-active', 'true');
        var media = qs('[data-showcase-media]');
        var kind = en.target.getAttribute('data-draw');
        if (media && kind) media.innerHTML = draw(kind, en.target.getAttribute('data-draw-label') || '', en.target.getAttribute('data-draw-dim') || '');
      });
    }, { threshold: .5 });
    steps.forEach(function (s) { io.observe(s); });
  }

  function bindAccordions() {
    qsa('.acc__btn').forEach(function (btn) {
      if (btn.dataset.bound === 'true') return;
      btn.dataset.bound = 'true';
      var panel = qs('#' + btn.getAttribute('aria-controls'));
      on(btn, 'click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (panel) panel.setAttribute('data-open', open ? 'true' : 'false');
      });
    });
  }

  function bindPrint() {
    /* In stampa tutto deve essere leggibile: gli accordion si aprono da soli. */
    function openAll() {
      qsa('.acc__btn').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
      qsa('.acc__panel').forEach(function (p) { p.setAttribute('data-open', 'true'); });
      qsa('[data-reveal]').forEach(function (el) { el.setAttribute('data-shown', 'true'); });
    }
    on(window, 'beforeprint', openAll);
    qsa('[data-print]').forEach(function (b) {
      on(b, 'click', function () { openAll(); window.print(); });
    });
  }

  /* mailto: nessun backend, tutte le azioni compongono una mail precompilata.
     È un pattern voluto finché non c'è un endpoint vero. */
  function mailto(to, subject, lines) {
    return 'mailto:' + to + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  /* -- mount --------------------------------------------------------------
     Idempotente: inietta sprite, header e footer solo se non ci sono già.
     In dist/ ci sono, quindi qui si collegano soltanto gli eventi.
     Gira sincrono (lo script sta in fondo al body) perché lo sprite deve
     esistere prima che le pagine disegnino i loro <use>. */
  function mount() {
    if (!hasDOM || !document.body) return;
    var body = document.body;
    body.classList.remove('no-js');

    if (!document.getElementById('yashi-sprite')) {
      body.insertAdjacentHTML('afterbegin', spriteHTML());
    }
    if (!document.getElementById('site-header')) {
      var anchor = document.getElementById('yashi-sprite');
      if (anchor) anchor.insertAdjacentHTML('afterend', headerHTML());
      else body.insertAdjacentHTML('afterbegin', headerHTML());
    }
    if (!document.getElementById('site-footer')) {
      body.insertAdjacentHTML('beforeend', footerHTML());
    }

    bindHeader();
    bindReveal();
    bindShowcase();
    bindAccordions();
    bindPrint();
  }

  Y.NAV = NAV;
  Y.MEGA = MEGA;
  Y.FOOTER_COLS = FOOTER_COLS;
  Y.headerHTML = headerHTML;
  Y.footerHTML = footerHTML;
  Y.spriteHTML = spriteHTML;
  Y.icon = icon;
  Y.draw = draw;
  Y.esc = esc;
  Y.qs = qs;
  Y.qsa = qsa;
  Y.on = on;
  Y.mailto = mailto;
  Y.mount = mount;
  Y.bindAccordions = bindAccordions;
  Y.bindReveal = bindReveal;

  mount();
})();
