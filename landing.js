/*
  Mi Alarma · landing — el movimiento de la página.
  Sin este archivo la página se ve completa (todo lo que aparece al bajar solo
  se esconde si hay JavaScript: ver «.js .revela» en estilos.css).
  Con «reducir movimiento» no se anima nada.
*/
(() => {
  // Número de WhatsApp para «Quiero mi alarma», con código de país y sin «+».
  // Vacío = los botones llevan a la demostración.
  const WHATSAPP = '';
  const MENSAJE = 'Hola, quiero información de Mi Alarma.';
  const DEMO = 'https://alvarolobooooooooooooooooooo.github.io/mi-alarma/';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  const SALE = 'cubic-bezier(.16, 1, .3, 1)';

  // Llama a «hacer» la primera vez que el elemento entra en pantalla
  function alVer(el, hacer, opciones = {}) {
    const io = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) { io.unobserve(e.target); hacer(e.target); }
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px', ...opciones });
    io.observe(el);
  }

  /* ── «Quiero mi alarma» ── */
  if (WHATSAPP) {
    for (const a of $$('[data-pedir]')) {
      a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAJE)}`;
      a.target = '_blank';
      a.rel = 'noopener';
    }
  }

  /* ── Código QR de la demostración (en computadoras, para abrirla en el celular) ── */
  if (window.qrcode && $('#qr-codigo')) {
    const q = window.qrcode(0, 'M');
    q.addData(DEMO);
    q.make();
    $('#qr-codigo').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true, alt: 'Código QR de la demostración' });
    $('#qr').classList.add('listo');
  }

  /* ── Lo que aparece al bajar ── */
  for (const el of $$('.revela')) alVer(el, (x) => x.classList.add('visto'));

  if (quieto) return;  // de aquí para abajo, solo movimiento

  /* ── Titulares que se escriben letra por letra ── */
  function partir(h) {
    const letras = [];
    const dentro = document.createElement('span');
    dentro.setAttribute('aria-hidden', 'true');
    const copiar = (origen, destino) => {
      for (const n of [...origen.childNodes]) {
        if (n.nodeType === Node.TEXT_NODE) {
          for (const trozo of n.textContent.split(/(\s+)/)) {
            if (!trozo) continue;
            if (/^\s+$/.test(trozo)) { destino.append(' '); continue; }
            const palabra = document.createElement('span');
            palabra.className = 'palabra';
            for (const c of trozo) {
              const l = document.createElement('span');
              l.className = 'letra';
              l.textContent = c;
              l.style.opacity = '0';
              palabra.append(l);
              letras.push(l);
            }
            destino.append(palabra);
          }
        } else if (n.nodeType === Node.ELEMENT_NODE) {
          const copia = n.cloneNode(false);
          destino.append(copia);
          copiar(n, copia);
        }
      }
    };
    h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
    copiar(h, dentro);
    h.replaceChildren(dentro);
    return letras;
  }

  for (const h of $$('[data-escribe]')) {
    const letras = partir(h);
    const paso = Math.min(24, 900 / letras.length);
    alVer(h, () => {
      letras.forEach((l, i) => {
        const a = l.animate([
          { opacity: 0, transform: 'translateY(.35em)', filter: 'blur(8px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' },
        ], { duration: 700, delay: i * paso, easing: SALE, fill: 'both' });
        a.onfinish = () => { l.style.opacity = ''; a.cancel(); };
      });
    });
  }

  /* ── Cifras que cuentan hasta su número ── */
  for (const el of $$('[data-cuenta]')) {
    const fin = Number(el.dataset.cuenta);
    el.textContent = '0';
    alVer(el, () => {
      const inicio = performance.now();
      const dura = 1400;
      const cuadro = (t) => {
        const x = Math.min(1, (t - inicio) / dura);
        el.textContent = String(Math.round(fin * (1 - Math.pow(2, -10 * x))));
        if (x < 1) requestAnimationFrame(cuadro);
        else el.textContent = String(fin);
      };
      requestAnimationFrame(cuadro);
    });
  }

  /* ── Íconos que se dibujan solos ── */
  function dibujar(formas, { duracion = 1100, escalon = 110, retraso = 0 } = {}) {
    formas.forEach((f, i) => {
      f.setAttribute('pathLength', '1');
      f.style.strokeDasharray = '1 2';
      f.style.strokeDashoffset = '1';
      const a = f.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
        { duration: duracion, delay: retraso + i * escalon, easing: SALE, fill: 'forwards' });
      a.onfinish = () => { f.style.strokeDasharray = ''; f.style.strokeDashoffset = ''; a.cancel(); };
    });
  }
  const FORMAS = 'path, line, circle, rect, ellipse, polyline';
  for (const caja of $$('[data-dibuja]')) {
    const formas = $$(FORMAS, caja);
    formas.forEach((f) => { f.setAttribute('pathLength', '1'); f.style.strokeDasharray = '1 2'; f.style.strokeDashoffset = '1'; });
    alVer(caja, () => dibujar(formas, { retraso: 250 }));
  }

  /* ── Qué trae: alarma → conexión cifrada → celular se dibujan, y un pulso lleva el aviso ── */
  const kit = $('[data-dibuja-kit]');
  if (kit) {
    const piezas = $$('.pieza *', kit).filter((f) => f.matches(FORMAS));
    const cables = $$('.cable', kit);
    const textos = $$('text', kit);
    const pulsos = $$('.pulso', kit);
    piezas.forEach((f) => { f.setAttribute('pathLength', '1'); f.style.strokeDasharray = '1 2'; f.style.strokeDashoffset = '1'; });
    textos.forEach((t) => { t.style.opacity = '0'; });
    cables.forEach((c) => { c.style.opacity = '0'; });
    pulsos.forEach((p) => { p.style.opacity = '0'; });
    alVer(kit, () => {
      dibujar(piezas, { duracion: 1400, escalon: 40 });
      cables.forEach((c) => {
        const a = c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 700, fill: 'forwards' });
        a.onfinish = () => { c.style.opacity = ''; a.cancel(); };
      });
      textos.forEach((t, i) => {
        const a = t.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
          { duration: 700, delay: 900 + i * 60, easing: SALE, fill: 'forwards' });
        a.onfinish = () => { t.style.opacity = ''; a.cancel(); };
      });
      // Sensor → placa, después placa → sirena, y otra vez
      setTimeout(() => {
        pulsos.forEach((p, i) => {
          p.style.opacity = '';
          const largo = p.getTotalLength();
          const desde = i === 0 ? 0 : 0.5;
          p.animate([
            { strokeDashoffset: '26px', offset: 0 },
            { strokeDashoffset: '26px', offset: desde },
            { strokeDashoffset: `${-largo}px`, offset: desde + 0.42 },
            { strokeDashoffset: `${-largo}px`, offset: 1 },
          ], { duration: 2600, iterations: Infinity, easing: 'linear' });
        });
      }, 1800);
    }, { threshold: 0.3 });
  }

  /* ── Sensibilidad: el selector se pasea y vuelve a «Normal» ── */
  const selector = $('#selector');
  if (selector) {
    const opciones = $$('span', selector);
    alVer(selector, async () => {
      for (const n of [0, 2, 1]) {
        await espera(750);
        opciones.forEach((o, i) => o.classList.toggle('elegido', i === n));
      }
    }, { threshold: 0.6 });
  }

  /* ── La app: el teléfono se queda y la pantalla cambia al bajar ── */
  const fija = $('#pantalla-recorrido');
  if (fija) {
    const imagenes = $$('img', fija);
    const io = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        imagenes.forEach((img) => img.classList.toggle('activa', img.dataset.p === e.target.dataset.p));
      }
    }, { rootMargin: '-45% 0px -45% 0px' });
    $$('.momento').forEach((m) => io.observe(m));
  }

  /* ── El héroe: la app cuenta su propia historia ──
     vigila → alguien entra (rojo, aviso) → la apagas → la vuelves a armar y vigila. */
  const escena = $('#escena');
  if (escena) {
    const pantallas = $$('.pantalla img', escena);
    const aviso = $('#aviso-heroe');
    const dedo = $('#dedo');
    // Dónde están los botones en las capturas (fracción del ancho y del alto de la captura)
    const BOTON = { apagar: [0.875, 0.73], armar: [0.88, 0.813] };
    let enPantalla = true;
    new IntersectionObserver(([e]) => { enPantalla = e.isIntersecting; }).observe(escena);

    const mostrar = (nombre) => pantallas.forEach((img) => img.classList.toggle('activa', img.dataset.p === nombre));
    const turno = async (ms) => {
      await espera(ms);
      while (!enPantalla || document.hidden) await espera(400);
    };
    const punto = ([fx, fy]) => {
      const p = $('.pantalla img', escena).getBoundingClientRect();
      const e = escena.getBoundingClientRect();
      return [p.left - e.left + fx * p.width, p.top - e.top + fy * p.height];
    };
    const ponerDedo = ([x, y]) => {
      dedo.style.transition = 'none';
      dedo.style.left = `${x}px`;
      dedo.style.top = `${y}px`;
      void dedo.offsetWidth;
      dedo.style.transition = '';
    };
    // El dedo entra desde abajo a la derecha, presiona y se va
    const tocar = async (boton) => {
      const [x, y] = punto(boton);
      ponerDedo([x + 70, y + 160]);
      dedo.classList.add('visible');
      await espera(60);
      dedo.style.left = `${x}px`;
      dedo.style.top = `${y}px`;
      await espera(950);
      dedo.classList.add('toca');
      await espera(190);
      dedo.classList.remove('toca');
    };
    const soltar = async () => {
      await espera(350);
      dedo.classList.remove('visible');
    };

    (async () => {
      for (;;) {
        await turno(2800);
        // Alguien entra
        escena.classList.add('alarma', 'tiembla');
        mostrar('alarma');
        await espera(350);
        aviso.classList.add('visible');
        await espera(1000);
        escena.classList.remove('tiembla');
        await turno(1800);
        // La apagas desde el celular
        await tocar(BOTON.apagar);
        escena.classList.remove('alarma');
        escena.classList.add('desarmada');
        aviso.classList.remove('visible');
        mostrar('desarmada');
        await soltar();
        await turno(2200);
        // La vuelves a armar
        await tocar(BOTON.armar);
        escena.classList.remove('desarmada');
        mostrar('vigilando');
        await soltar();
      }
    })();
  }
})();
