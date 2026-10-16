(function () {
  'use strict';

  // Each category has its own default size/leading and a set of snippets to cycle through.
  var SAMPLES = {
    headline: {
      label: 'Sample headline',
      short: 'Headline',
      size: 120,
      mobileSize: 48,
      leading: 1,
      texts: [
        'Spirit Untamed.',
        'Invent Tomorrow',
        'Velocity & Craft',
        'The £1bn Idea',
        'Craft Is Respect',
        'Start From One',
        '24/7 Curiosity',
        'Make It Matter',
        'Stay Unreasonable',
        'spirit@studio.one',
      ],
    },
    subheader: {
      label: 'Sample subheader',
      short: 'Subheader',
      size: 52,
      mobileSize: 32,
      leading: 1.15,
      texts: [
        'The best work comes from people who care more than they need to.',
        'An idea is only ever as good as the craft that brings it to life.',
        'Speed without direction is noise; direction without courage is a wish.',
        'A small team with a clear point of view can outpace an army.',
        'Great brands are defined by the things they refuse to compromise on.',
        'Begin with the person, not the platform, and the work will find its audience.',
        'We sketch 260 ideas, build 38 prototypes and ship the 1 that truly matters.',
      ],
    },
    paragraph: {
      label: 'Sample paragraph',
      short: 'Paragraph',
      size: 22,
      mobileSize: 16,
      leading: 1.5,
      texts: [
        'Every studio begins with a single conviction: that the work can be better than it has to be. Not louder, not busier — better. It shows in the details nobody asked for, the extra round of refinement on a Friday night, the decision to rebuild something that was already good enough. Clients may never see those hours, but they feel them in the finished thing.',
        'Technology changes every year; human nature barely changes at all. People still want to be surprised, understood and treated with respect. The most useful thing a creative team can do is hold both truths at once — to be fluent in what is new while staying fiercely loyal to what is timeless. That is where invention lives.',
        'A great idea finds its form quickly. It survives the first fifty objections, the shifting brief and the impossible deadline, because the team behind it refuses to let it go. Velocity is not about rushing; it is about removing everything that slows a good idea down — the layers, the noise, the fear of getting it wrong.',
        'One team. One standard. One shared ambition. A handful of people who fight for the work will always outrun a crowd who merely manage it. From the first sketch to the final file — fonts, films, flagship stores — the craft stays the same and the bar never moves. That is the whole idea behind Studio.One.',
      ],
    },
  };

  var ORDER = ['headline', 'subheader', 'paragraph'];
  var STORAGE_KEY = 'one-tester-v2';
  // Keep in sync with the mobile breakpoint in styles.css.
  var mobile = matchMedia('(max-width: 640px)');

  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;
  var sample = $('sample');
  var sizeInput = $('size');
  var sizeOut = $('size-out');
  var leadingInput = $('leading');
  var leadingOut = $('leading-out');
  var pickerBtn = $('picker-btn');
  var pickerLabel = $('picker-label');
  var menu = $('picker-menu');
  var styleToggle = $('style-toggle');
  var alignButtons = document.querySelectorAll('[data-align]');
  var bar = document.querySelector('.bar');
  var sheetBtn = $('sheet-btn');

  function device() { return mobile.matches ? 'mobile' : 'desktop'; }

  function defaultSize(key) {
    return mobile.matches ? SAMPLES[key].mobileSize : SAMPLES[key].size;
  }

  // Every visit opens on the first headline ("Spirit Untamed.") at its default
  // size and leading; only the alignment is remembered between visits.
  var saved = load() || {};
  var state = {
    category: 'headline',
    index: 0,
    leading: SAMPLES.headline.leading,
    align: saved.align === 'left' ? 'left' : 'center',
  };
  resetSize();

  // Sets the size to the style's default for this screen. `auto` marks it as a
  // default (not chosen on the slider), so it may be shrunk to fit — see fitSize().
  function resetSize() {
    state.size = defaultSize(state.category);
    state.device = device();
    state.auto = true;
  }

  var measure = document.createElement('canvas').getContext('2d');

  // On mobile, shrink a default size just enough that the longest word fits on one line.
  function fitSize() {
    if (!state.auto || !mobile.matches) return;
    var size = defaultSize(state.category);
    var words = sample.textContent.split(/\s+/);
    measure.font = size + 'px One';
    var widest = 0;
    words.forEach(function (w) { widest = Math.max(widest, measure.measureText(w).width); });
    var available = sample.clientWidth;
    if (widest > available) size = Math.max(Number(sizeInput.min), Math.floor(size * available / widest));
    state.size = size;
  }

  // ---- Persistence (best effort; the page works without it) ----

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---- Rendering ----

  function formatLeading(v) {
    // 1 -> "1.0", 1.25 -> "1.25"
    var s = Number(v).toFixed(2).replace(/0$/, '');
    return s;
  }

  function applyStyle() {
    sample.style.fontSize = state.size + 'px';
    sample.style.lineHeight = state.leading;
    sample.style.textAlign = state.align;
    $('hint').style.textAlign = state.align;
    sizeInput.value = state.size;
    sizeOut.textContent = state.size + 'px';
    leadingInput.value = state.leading;
    leadingOut.textContent = formatLeading(state.leading);
    // Mobile bar button: [size icon] 48px   [line-height icon] 1.0
    $('sheet-size').textContent = state.size + 'px';
    $('sheet-leading').textContent = formatLeading(state.leading);
    sheetBtn.setAttribute('aria-label', 'Tester controls, size ' + state.size +
      'px, line height ' + formatLeading(state.leading));
    alignButtons.forEach(function (b) {
      b.setAttribute('aria-checked', String(b.dataset.align === state.align));
    });
  }

  function applyText() {
    var set = SAMPLES[state.category];
    state.index = ((state.index % set.texts.length) + set.texts.length) % set.texts.length;
    sample.textContent = set.texts[state.index];
    sample.dataset.category = state.category;
    pickerLabel.textContent = set.label;
    menu.querySelectorAll('li').forEach(function (li) {
      li.setAttribute('aria-selected', String(li.dataset.category === state.category));
    });
    styleToggle.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-checked', String(b.dataset.category === state.category));
    });
  }

  function setCategory(key) {
    if (key === state.category) return;
    state.category = key;
    state.index = 0;
    resetSize();
    state.leading = SAMPLES[key].leading;
    applyText();
    fitSize();
    applyStyle();
    save();
  }

  function cycle(step) {
    state.index += step;
    applyText();
    fitSize();
    applyStyle();
    save();
  }

  // ---- Sample picker (custom listbox that opens above the bar) ----

  ORDER.forEach(function (key) {
    var li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.id = 'opt-' + key;
    li.dataset.category = key;
    li.textContent = SAMPLES[key].label;
    li.addEventListener('click', function () {
      setCategory(key);
      closeMenu(true);
    });
    menu.appendChild(li);
  });

  // Mobile toggle: same styles, short labels.
  ORDER.forEach(function (key) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.dataset.category = key;
    b.textContent = SAMPLES[key].short;
    b.addEventListener('click', function () { setCategory(key); });
    styleToggle.appendChild(b);
  });

  var activeIndex = 0;

  function setActive(i) {
    var items = menu.querySelectorAll('li');
    activeIndex = (i + items.length) % items.length;
    items.forEach(function (li, n) { li.classList.toggle('active', n === activeIndex); });
    menu.setAttribute('aria-activedescendant', items[activeIndex].id);
  }

  function positionMenu() {
    var r = pickerBtn.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(r.left, innerWidth - menu.offsetWidth - 8)) + 'px';
    menu.style.bottom = (innerHeight - r.top + 8) + 'px';
  }

  function openMenu() {
    menu.hidden = false;
    pickerBtn.setAttribute('aria-expanded', 'true');
    positionMenu();
    setActive(ORDER.indexOf(state.category));
    menu.tabIndex = -1;
    menu.focus();
  }

  function closeMenu(refocus) {
    if (menu.hidden) return;
    menu.hidden = true;
    pickerBtn.setAttribute('aria-expanded', 'false');
    if (refocus) pickerBtn.focus();
  }

  pickerBtn.addEventListener('click', function () {
    if (menu.hidden) openMenu(); else closeMenu(true);
  });

  menu.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setCategory(ORDER[activeIndex]);
      closeMenu(true);
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      closeMenu(true);
    } else if (e.key === 'Tab') closeMenu(false);
  });

  document.addEventListener('pointerdown', function (e) {
    if (!menu.hidden && !menu.contains(e.target) && !pickerBtn.contains(e.target)) closeMenu(false);
  });
  addEventListener('resize', function () { closeMenu(false); });

  // ---- Mobile: controls fold into a sheet above the bar ----

  function setSheet(open) {
    bar.classList.toggle('sheet-open', open);
    sheetBtn.setAttribute('aria-expanded', String(open));
    if (!open) closeMenu(false);
  }

  sheetBtn.addEventListener('click', function () {
    setSheet(!bar.classList.contains('sheet-open'));
  });

  // Tapping anywhere outside the bar (and the picker menu) closes the sheet.
  document.addEventListener('pointerdown', function (e) {
    if (bar.classList.contains('sheet-open') && !bar.contains(e.target)) setSheet(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && bar.classList.contains('sheet-open')) {
      setSheet(false);
      sheetBtn.focus();
    }
  });

  // Crossing the breakpoint swaps to that screen's default size for the current style.
  mobile.addEventListener('change', function () {
    setSheet(false);
    resetSize();
    fitSize();
    applyStyle();
    save();
  });

  // ---- Controls ----

  sizeInput.addEventListener('input', function () {
    state.size = Number(sizeInput.value);
    state.auto = false;
    applyStyle();
    save();
  });

  leadingInput.addEventListener('input', function () {
    state.leading = Number(leadingInput.value);
    applyStyle();
    save();
  });

  alignButtons.forEach(function (b) {
    b.addEventListener('click', function () {
      state.align = b.dataset.align;
      applyStyle();
      save();
    });
  });

  $('next-btn').addEventListener('click', function () { cycle(1); });

  $('theme-btn').addEventListener('click', function () {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('one-theme', next); } catch (e) {}
  });

  // Keep pasted text plain so the sample always renders in One.
  sample.addEventListener('paste', function (e) {
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  });

  // ---- Info modal: two image carousels with a caption beneath ----
  // Captions are trusted HTML so a word can be dimmed with <span class="dim">.

  var CAROUSELS = {
    narrative: {
      label: 'About',
      slides: [
        { src: 'Image-1.png', alt: 'A metal sort of a lowercase e',
          caption: 'For hundreds of years, type was ink pressed onto paper.' },
        { src: 'Image-2.png', alt: 'A lowercase e printed in black ink on textured paper',
          caption: 'The soft edges were how we learned to read them.' },
        { src: 'Image-3.png', alt: 'A lowercase e built from square pixels',
          caption: 'Low res screens forced a new approach from a pixel grid.' },
        { src: 'Image-4.png', alt: 'The outline of a lowercase e with its B\u00e9zier points',
          caption: 'Retina freed type from the pixel. <span class="dim">One.otf</span> gives it back its ink.' },
        { src: 'Image-5.png', alt: 'The word One.otf set in the One typeface', dark: true,
          caption: 'Bringing type’s character and legacy back to the screen.' },
      ],
    },
    details: {
      label: 'Characters',
      slides: [
        { src: 'Letter-1.png', alt: 'Capital E with the curve where its lower arm meets the serif highlighted',
          caption: 'Internal bracketed serifs soften the counterforms' },
        { src: 'Letter-2.png', alt: 'Capital R with the sweep of its leg highlighted',
          caption: 'Fluid decorative elements maintain flow' },
        { src: 'Letter-3.png', alt: 'Capital G with the join between bowl and stem highlighted',
          caption: 'Moments of contrast keep letterforms dynamic' },
        { src: 'Letter-4.png', alt: 'Capital P with the gap between bowl and stem highlighted',
          caption: 'Letterforms adopt a classical approach to their construction' },
        { src: 'Letter-5.png', alt: 'Lowercase n with the notch where the shoulder meets the stem highlighted',
          caption: 'Transitional stroke model ties the design directly to the pen' },
        { src: 'Letter-6.png', alt: 'Lowercase o with its tilted axis drawn against the vertical',
          caption: 'A 9 degree oblique angle gives long form text momentum' },
        { src: 'Letter-7.png', alt: 'Lowercase t with the angled end of its crossbar highlighted',
          caption: 'Asymmetrical elements maintain an organic texture' },
        { src: 'Letter-8.png', alt: 'Question mark with its tilted axis drawn against the vertical',
          caption: 'Off-centre balance for stand-out letterforms' },
      ],
    },
  };
  // Not a carousel: a scrolling column of panels written in index.html.
  CAROUSELS.ambition = { label: 'Ambition', stack: true };
  var SET_ORDER = ['narrative', 'details', 'ambition'];

  var modal = $('info');
  var track = $('slides');
  var dotsEl = $('dots');
  var caption = $('caption');
  var setToggle = $('set-toggle');
  var modalCard = modal.querySelector('.modal-card');
  var prevArrow = $('slide-prev');
  var nextArrow = $('slide-next');
  var currentSet = 'narrative';
  var slideIndex = 0;
  var shownCaption = null;

  function slidesOf() { return CAROUSELS[currentSet].slides; }

  // Rebuild the track and dots for the chosen carousel.
  function renderSet() {
    var list = slidesOf();
    track.innerHTML = '';
    dotsEl.innerHTML = '';
    list.forEach(function (s, i) {
      var li = document.createElement('li');
      li.className = 'slide';
      li.setAttribute('role', 'group');
      li.setAttribute('aria-roledescription', 'slide');
      li.setAttribute('aria-label', (i + 1) + ' of ' + list.length);
      var img = document.createElement('img');
      img.src = 'assets/images/' + s.src;
      img.width = 375;
      img.height = 469;
      img.alt = s.alt;
      img.draggable = false;
      if (i) img.loading = 'lazy';
      li.appendChild(img);
      track.appendChild(li);

      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.addEventListener('click', function () { goTo(i); });
      dotsEl.appendChild(d);
    });
    track.scrollLeft = 0;
  }

  function updateTabs() {
    setToggle.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-checked', String(b.dataset.set === currentSet));
    });
  }

  function isStack() { return !!CAROUSELS[currentSet].stack; }

  function showSlide(i) {
    slideIndex = i;
    // Light text on the toggle when it sits over a dark image.
    var dark = !!slidesOf()[i].dark;
    prevArrow.classList.toggle('on-dark', dark);
    nextArrow.classList.toggle('on-dark', dark);
    prevArrow.disabled = i === 0;
    nextArrow.disabled = i === slidesOf().length - 1;
    dotsEl.querySelectorAll('button').forEach(function (d, n) {
      d.setAttribute('aria-selected', String(n === i));
    });
    var key = currentSet + i;
    if (shownCaption !== key) {
      shownCaption = key;
      caption.classList.add('swap');
      // Fade out, change the words, fade back in.
      setTimeout(function () {
        caption.innerHTML = slidesOf()[slideIndex].caption;
        caption.classList.remove('swap');
      }, 120);
    }
  }

  function goTo(i, instant) {
    i = Math.max(0, Math.min(slidesOf().length - 1, i));
    track.scrollTo({ left: i * track.clientWidth, behavior: instant ? 'auto' : 'smooth' });
    showSlide(i);
  }

  function setCarousel(key) {
    if (key === currentSet) return;
    currentSet = key;
    updateTabs();
    $('carousel').hidden = isStack();
    $('ambition').hidden = !isStack();
    $('glyphs').hidden = currentSet !== 'details';
    modalCard.scrollTop = 0;
    if (!isStack()) {
      renderSet();
      showSlide(0);
    }
  }


  prevArrow.addEventListener('click', function () { goTo(slideIndex - 1); });
  nextArrow.addEventListener('click', function () { goTo(slideIndex + 1); });

  SET_ORDER.forEach(function (key) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.dataset.set = key;
    b.textContent = CAROUSELS[key].label;
    b.addEventListener('click', function () { setCarousel(key); });
    setToggle.appendChild(b);
  });

  // Swiping or trackpad-scrolling the track snaps between slides; keep the dots in step.
  track.addEventListener('scroll', function () {
    var i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== slideIndex) showSlide(i);
  }, { passive: true });

  modal.addEventListener('keydown', function (e) {
    if (isStack() || (e.target.closest && e.target.closest('.set-toggle'))) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(slideIndex + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(slideIndex - 1); }
  });

  // ---- All characters grid (Characters tab) ----
  // Every glyph in One-Regular.otf, in font order. Each group starts a new row
  // of the 5-wide grid. Ligatures are typed as their two letters; liga and dlig are on.
  var GLYPH_GROUPS = [
    ['Uppercase', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')],
    ['Lowercase', 'abcdefghijklmnopqrstuvwxyz'.split('')],
    ['Ligatures', ['fb', 'fi', 'fj', 'fk', 'fl']],
    ['Figures', '0123456789'.split('')],
    ['Punctuation', '.,:;…!¡?¿·•*#/\\-–—_()[]‚„“”‘’«»‹›"\''.split('')],
    ['Symbols', '@&|'.split('')],
    ['Currency', '$€£'.split('')],
    ['Maths', '+−×÷='.split('')],
  ];
  var COLS = 5;
  var grid = $('glyph-grid');
  GLYPH_GROUPS.forEach(function (group) {
    var chars = group[1];
    chars.forEach(function (ch) {
      var cell = document.createElement('li');
      cell.textContent = ch;
      cell.setAttribute('aria-label', group[0] + ': ' + ch);
      grid.appendChild(cell);
    });
    // Pad the row out with empty cells so the next group starts on a new row.
    for (var n = chars.length % COLS; n && n < COLS; n++) {
      var gap = document.createElement('li');
      gap.className = 'empty';
      gap.setAttribute('aria-hidden', 'true');
      grid.appendChild(gap);
    }
  });

  renderSet();
  updateTabs();
  caption.innerHTML = slidesOf()[0].caption;
  shownCaption = currentSet + 0;
  showSlide(0);

  $('info-btn').addEventListener('click', function () {
    modal.showModal();
    modalCard.scrollTop = 0;
    if (!isStack()) goTo(0, true);
  });
  $('info-close').addEventListener('click', function () { modal.close(); });
  // Close when clicking the backdrop.
  modal.addEventListener('click', function (e) {
    if (e.target === modal) modal.close();
  });

  // ---- Keyboard shortcuts (ignored while typing in the sample) ----

  document.addEventListener('keydown', function (e) {
    if (e.target === sample || modal.open || !menu.hidden || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') cycle(1);
    else if (e.key === 'ArrowLeft') cycle(-1);
  });

  applyText();
  applyStyle();

  // Measuring needs the real font, and the available width changes on rotation.
  function refit() {
    if (!state.auto) return;
    fitSize();
    applyStyle();
  }
  document.fonts.ready.then(refit);
  addEventListener('resize', refit);

  // ---- Load-in ----
  // Wait for One to load (at most 1.5s) so the name is set in it, play the
  // mark (~1.4s), hold for ~1.6s, then lift the cover. Click or any key skips.
  // Once per browser session (see the inline script in index.html).
  var intro = $('intro');
  if (intro) {
    if (!root.classList.contains('intro-on')) {
      intro.remove(); // already seen this session, or reduced motion
    } else {
      try { sessionStorage.setItem('one-intro-seen', '1'); } catch (e) {}
      var finished = false;
      var finish = function () {
        if (finished) return;
        finished = true;
        intro.classList.add('done');
        root.classList.remove('intro-on');
        setTimeout(function () { intro.remove(); }, 800);
      };
      var timeout = new Promise(function (r) { setTimeout(r, 1500); });
      Promise.race([document.fonts.load('28px One'), timeout]).then(function () {
        intro.classList.add('play');
        setTimeout(finish, 3000);
      });
      intro.addEventListener('click', finish);
      addEventListener('keydown', finish, { once: true });
    }
  }
})();
