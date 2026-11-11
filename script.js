const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/EDVGVZLFZD';

(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const rub = n => Math.round(n).toLocaleString('ru-RU').replace(/\s/g, ' ');

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- header ---- */
  const header = $('#header'), burger = $('#burger'), nav = $('#nav');
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open'); nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* ---- hero title: words rise from a mask ---- */
  const title = $('[data-split]');
  if (title) {
    const words = title.textContent.trim().split(/\s+/);
    title.setAttribute('aria-label', words.join(' '));
    title.innerHTML = words.map((w, i) =>
      `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
  }

  /* ---- manifest: words light up with scroll ---- */
  const man = $('#manifest');
  let mWords = [];
  if (man) {
    const txt = man.textContent.trim();
    man.setAttribute('aria-label', txt);
    man.innerHTML = txt.split(/\s+/).map(w => `<span class="mw" aria-hidden="true">${w}</span>`).join(' ');
    mWords = $$('.mw', man);
  }

  /* ---- phone mask ---- */
  $$('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      const raw = e.target.value;
      if (/[a-zA-Zа-яА-Я@]/.test(raw)) return;
      let v = raw.replace(/\D/g, '');
      if (!v) { e.target.value = ''; return; }
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (!v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  /* ---- smooth anchors ---- */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length <= 1) return;
    const t = $(href);
    if (!t) return;
    e.preventDefault();
    const top = t.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---- reveal ---- */
  const revealEls = $$('[data-reveal]');
  const parents = new Map();
  revealEls.forEach(el => {
    const p = el.parentElement;
    const n = parents.get(p) || 0;
    el.style.setProperty('--d', Math.min(n, 4) * 90 + 'ms');
    parents.set(p, n + 1);
  });

  /* ---- hero sheet: tilted plan lies flat as you scroll ---- */
  const sheet = $('#sheetCard');
  let tiltCur = -0.5, tiltTarget = 0;
  const applyTilt = () => {
    if (!sheet || reduce) return;
    const t = tiltCur;
    sheet.style.transform =
      `rotateX(${40 * (1 - t)}deg) rotateZ(${-12 * (1 - t)}deg) scale(${1 + 0.08 * (1 - t)})`;
  };
  applyTilt();

  /* ---- services stage ---- */
  const stageImgs = $$('.stage__img');
  const svcs = $$('.svc');
  const cap = $('#stageCap');
  let svcShown = 0, z = 1;
  const updateServices = () => {
    if (!svcs.length || getComputedStyle($('#stage')).display === 'none') return;
    const vh = window.innerHeight;
    let best = 0, bd = 1e9;
    svcs.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - vh * 0.52);
      if (d < bd) { bd = d; best = i; }
    });
    if (best !== svcShown) {
      svcShown = best;
      svcs.forEach((s, i) => s.classList.toggle('is-active', i === best));
      const img = stageImgs[best];
      img.style.zIndex = ++z;
      stageImgs.forEach(im => { if (im !== img) im.classList.remove('is-on'); });
      // keep the previous one visible below while the new one wipes in
      requestAnimationFrame(() => img.classList.add('is-on'));
      cap.textContent = svcs[best].dataset.cap;
    }
  };
  // previous image must stay until the new wipe covers it: re-add after removal
  const keepPrev = (() => {
    let prev = 0;
    return () => {
      if (svcShown !== prev) {
        const p = stageImgs[prev];
        p.classList.add('is-on');
        setTimeout(() => { if (svcShown !== prev) p.classList.remove('is-on'); }, 1100);
        prev = svcShown;
      }
    };
  })();

  /* ---- vine ---- */
  const stem = $('#vineStem'), leavesG = $('#vineLeaves');
  const steps = $$('.step');
  let leaves = [], len = 0, stepShown = 0;
  if (stem) {
    len = stem.getTotalLength();
    stem.style.strokeDasharray = len;
    stem.style.strokeDashoffset = reduce ? 0 : len;
    const NS = 'http://www.w3.org/2000/svg';
    const N = 11;
    for (let i = 0; i < N; i++) {
      const at = 0.09 + (i / (N - 1)) * 0.86;
      const pt = stem.getPointAtLength(len * (1 - at)); // path runs top-down in length? stem drawn bottom→top, so length fraction = at
      const p = stem.getPointAtLength(len * at);
      const side = i % 2 ? 1 : -1;
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(${p.x} ${p.y})`);
      const e = document.createElementNS(NS, 'ellipse');
      e.setAttribute('cx', side * 34); e.setAttribute('cy', -6);
      e.setAttribute('rx', 34); e.setAttribute('ry', 15);
      e.setAttribute('transform', `rotate(${side * -22})`);
      e.setAttribute('fill', i % 3 === 0 ? '#7FA14F' : '#4E7A3A');
      e.style.transformOrigin = '0 0';
      e.style.transformBox = 'fill-box';
      e.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1)';
      e.style.transform = reduce ? 'scale(1)' : 'scale(0)';
      g.appendChild(e); leavesG.appendChild(g);
      leaves.push({ el: e, at });
    }
    // rose at the top of the stem
    const top = stem.getPointAtLength(len);
    const rose = document.createElementNS(NS, 'circle');
    rose.setAttribute('cx', top.x); rose.setAttribute('cy', top.y - 6); rose.setAttribute('r', 22);
    rose.setAttribute('fill', '#C4163F');
    rose.style.transformBox = 'fill-box'; rose.style.transformOrigin = 'center';
    rose.style.transition = 'transform .8s cubic-bezier(.2,.8,.2,1)';
    rose.style.transform = reduce ? 'scale(1)' : 'scale(0)';
    leavesG.appendChild(rose);
    leaves.push({ el: rose, at: 0.985 });
  }
  const updateVine = () => {
    const wrap = $('.process__layout');
    if (!wrap || !stem) return;
    const r = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = clamp((vh * 0.55 - r.top) / (r.height - vh * 0.2));
    if (!reduce) {
      stem.style.strokeDashoffset = len * (1 - p);
      leaves.forEach(l => { l.el.style.transform = p >= l.at ? 'scale(1)' : 'scale(0)'; });
    }
    if (getComputedStyle($('#vine')).display !== 'none') {
      let best = 0, bd = 1e9;
      steps.forEach((s, i) => {
        const sr = s.getBoundingClientRect();
        const d = Math.abs(sr.top + sr.height / 2 - vh * 0.5);
        if (d < bd) { bd = d; best = i; }
      });
      if (best !== stepShown) {
        stepShown = best;
        steps.forEach((s, i) => s.classList.toggle('is-active', i === best));
      }
    }
  };

  /* ---- objects: slow drift inside the frame ---- */
  const objImgs = $$('.obj__img img');
  const updateObjects = () => {
    if (reduce) return;
    const vh = window.innerHeight;
    objImgs.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const k = ((r.top + r.height / 2) - vh / 2) / vh;
      img.style.transform = `translateY(${k * -6}%) scale(1.12)`;
    });
  };

  /* ---- marquee reacts to scroll speed ---- */
  const mq = $('#marquee');
  let mqX = 0, lastY = window.scrollY, vel = 0;
  const mqStep = () => {
    if (!mq) return;
    const y = window.scrollY;
    vel += ((y - lastY) - vel) * 0.15;
    lastY = y;
    mqX -= 0.5 + Math.abs(vel) * 0.6;
    const half = mq.scrollWidth / 2;
    if (-mqX >= half) mqX += half;
    mq.style.transform = `translate3d(${mqX}px,0,0)`;
  };

  /* ---- master scroll loop ---- */
  let ticking = false;
  const check = () => {
    ticking = false;
    const vh = window.innerHeight;
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 8);
    revealEls.forEach(el => {
      if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < vh * 0.94) el.classList.add('is-in');
    });
    tiltTarget = clamp(y / (vh * 0.8));
    if (man) {
      const r = man.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (vh * 0.55 + r.height * 0.4));
      const n = Math.round(p * mWords.length);
      mWords.forEach((w, i) => w.classList.toggle('on', reduce || i < n));
    }
    updateServices(); keepPrev();
    updateVine(); updateObjects();
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  window.addEventListener('load', req);
  req(); setTimeout(req, 400);

  if (!reduce) {
    const loop = () => {
      tiltCur += (tiltTarget - tiltCur) * 0.07;
      if (Math.abs(tiltTarget - tiltCur) > 0.0005) applyTilt();
      mqStep();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---- magnetic buttons ---- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    $$('[data-magnet]').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .12}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* =========================================================
     Calculator: pick works, the plot grows
     ========================================================= */
  const oProject = $('#oProject'), oAgro = $('#oAgro'), oLawn = $('#oLawn'), oPlants = $('#oPlants');
  const rLawn = $('#rLawn'), rPlants = $('#rPlants');
  const guards = $$('input[name="guard"]');
  const NS = 'http://www.w3.org/2000/svg';
  const plantsG = $('#lyPlants'), guardG = $('#lyGuard');
  const lyLawn = $('#lyLawn'), lyProject = $('#lyProject'), lyZones = $('#lyZones'), lyAgro = $('#lyAgro');

  // 16 plants placed on the plot, roses and conifers
  const PLANTS = [
    [96,120,20,'c'],[148,96,14,'r'],[116,206,16,'r'],[84,262,22,'c'],[150,300,14,'r'],
    [424,110,22,'c'],[476,150,14,'r'],[452,216,16,'r'],[486,288,20,'c'],[410,330,14,'r'],
    [110,372,18,'c'],[210,366,14,'r'],[352,372,14,'r'],[470,366,18,'c'],[232,60,12,'r'],[336,60,12,'r']
  ];
  const plantEls = [], guardEls = [];
  PLANTS.forEach(([x, y, r, t]) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r);
    c.setAttribute('fill', t === 'r' ? '#C4163F' : '#2F5A33');
    plantsG.appendChild(c); plantEls.push(c);
    const g = document.createElementNS(NS, 'circle');
    g.setAttribute('cx', x); g.setAttribute('cy', y); g.setAttribute('r', r + 7);
    guardG.appendChild(g); guardEls.push(g);
  });

  const state = { sum: 0 };
  let sumShown = 0, sumRAF;
  const tween = to => {
    cancelAnimationFrame(sumRAF);
    const from = sumShown, t0 = performance.now(), dur = reduce ? 1 : 650;
    const tick = t => {
      const p = clamp((t - t0) / dur);
      sumShown = from + (to - from) * (1 - Math.pow(1 - p, 3));
      $('#tSum').textContent = rub(sumShown);
      if (p < 1) sumRAF = requestAnimationFrame(tick);
    };
    sumRAF = requestAnimationFrame(tick);
  };

  const calc = () => {
    const area = +rLawn.value, budget = +rPlants.value;
    const guard = (guards.find(g => g.checked) || {}).value === '1';
    $('#vLawn').textContent = area + ' м²';
    $('#vPlants').textContent = rub(budget) + ' ₽';
    $('#rLawnWrap').classList.toggle('off', !oLawn.checked);
    $('#rPlantsWrap').classList.toggle('off', !oPlants.checked);

    const lines = [];
    if (oProject.checked) lines.push(['Проект участка, от', 30000]);
    if (oAgro.checked) lines.push(['Консультация агронома', 10000]);
    if (oLawn.checked) lines.push([`Рулонный газон, ${area} м²`, area * 500]);
    if (oPlants.checked) lines.push([`Посадка растений, ${guard ? '50' : '30'} %`, budget * (guard ? 0.5 : 0.3)]);
    const sum = lines.reduce((a, l) => a + l[1], 0);
    state.sum = sum;
    tween(sum);
    $('#tLines').innerHTML = lines.map(l => `<li><span>${l[0]}</span><b>${rub(l[1])} ₽</b></li>`).join('');

    // plot layers
    const on = (el, v) => el.classList.toggle('off-layer', !v);
    on(lyProject, oProject.checked); on(lyZones, oProject.checked); on(lyAgro, oAgro.checked);
    const k = 0.66 + 0.34 * (area - 50) / 1950;
    $$('polygon', lyLawn).forEach((p, i) => {
      p.style.transform = oLawn.checked ? `scale(${k})` : 'scale(0)';
      p.style.opacity = oLawn.checked ? 1 : 0;
      p.style.transitionDelay = (i * 60) + 'ms';
    });
    const nPlants = oPlants.checked ? Math.round(5 + 11 * (budget - 50000) / 1950000) : 0;
    plantEls.forEach((c, i) => {
      const show = i < nPlants;
      c.style.transform = show ? 'scale(1)' : 'scale(0)';
      c.style.opacity = show ? 1 : 0;
      c.style.transitionDelay = show ? (i * 35) + 'ms' : '0ms';
    });
    guardEls.forEach((c, i) => {
      const show = oPlants.checked && guard && i < nPlants;
      c.style.transform = show ? 'scale(1)' : 'scale(.4)';
      c.style.opacity = show ? 1 : 0;
      c.style.transitionDelay = show ? (i * 35 + 150) + 'ms' : '0ms';
    });
    const any = oProject.checked || oAgro.checked || oLawn.checked || oPlants.checked;
    $('#plotCap').textContent = !any ? 'Участок до работы'
      : [oProject.checked && 'проект с зонами', oLawn.checked && 'газон', oPlants.checked && (guard ? 'посадки с гарантией' : 'посадки'), oAgro.checked && 'пробы почвы'].filter(Boolean).join(', ');

    // nudge toward a fuller package
    let n = '';
    if (!oProject.checked && (oLawn.checked || oPlants.checked)) n = 'С проектом растения встанут по плану, а не туда, куда поместилось. От 30 000 ₽.';
    else if (oPlants.checked && !guard) n = `С гарантией посадка дороже на ${rub(budget * 0.2)} ₽: всё, что не прижилось, пересадим бесплатно.`;
    else if (oPlants.checked && !oAgro.checked) n = 'Если почва на участке тяжёлая или кислая, консультация агронома за 10 000 ₽ убережёт посадки.';
    else if (sum > 0) n = 'Точную смету Анастасия назовёт после осмотра участка.';
    else n = 'Отметьте хотя бы одну работу.';
    $('#tNudge').textContent = n;
  };
  [oProject, oAgro, oLawn, oPlants, rLawn, rPlants, ...guards].forEach(el => el.addEventListener('input', calc));
  $('#oFull')?.addEventListener('click', () => {
    [oProject, oAgro, oLawn, oPlants].forEach(c => { c.checked = true; });
    rLawn.value = 500; rPlants.value = 600000;
    guards.forEach(g => { g.checked = g.value === '1'; });
    calc();
  });
  calc();
  sumShown = 0;

  // send the estimate to the form
  $('#tGo')?.addEventListener('click', () => {
    const lines = $$('#tLines li').map(li => li.textContent.replace(/ /g, ' ')).join('; ');
    const c = $('#comment');
    if (c && lines) c.value = `Смета с сайта: ${lines}. Итого около ${rub(state.sum).replace(/ /g, ' ')} ₽.`;
    const sel = $('#svcSelect');
    if (sel) {
      if (oProject.checked) sel.value = 'Ландшафтное проектирование';
      else if (oPlants.checked) sel.value = 'Посадка растений';
      else if (oLawn.checked) sel.value = 'Рулонный газон';
      else if (oAgro.checked) sel.value = 'Консультация агронома';
    }
  });

  /* ---- form -> Cloudflare Worker -> Telegram ---- */
  const form = $('#leadForm');
  const note = $('#formNote');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || !payload.phone) { note.textContent = 'Заполните имя и телефон или Telegram'; return; }
    if (!form.consent.checked) { note.textContent = 'Нужно согласие на обработку данных'; return; }
    delete payload.consent;
    btn.disabled = true;
    btn.textContent = 'Отправляем…';
    note.textContent = '';
    try {
      const resp = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена';
      note.textContent = 'Спасибо! Анастасия свяжется с вами и предложит время выезда.';
      form.reset();
    } catch (err) {
      console.error(err);
      btn.textContent = 'Ошибка, попробуйте ещё раз';
      note.textContent = 'Не удалось отправить. Напишите в Instagram: @sad_profi';
    } finally {
      setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 3500);
    }
  });
})();
