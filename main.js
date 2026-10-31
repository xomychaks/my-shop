const FREE_FROM = 3;
const SERVER_URL = 'http://localhost:3010';
const MANAGER_URL = 'https://t.me/phomiz_brand'; // ссылка на менеджера
const TG_URL = 'https://t.me/phomiz64';      // ссылка на Telegram-канал

// ----- Подключение к Telegram (вибрация, цвета, кнопка «Назад») -----
const tg = window.Telegram && window.Telegram.WebApp;
const inTg = !!(tg && tg.initData); // true только внутри настоящего Телеграма

if (inTg) {
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0a0a0a');
    tg.setBackgroundColor('#0a0a0a');
  } catch (e) {}
}

function haptic(kind) {
  if (!inTg || !tg.HapticFeedback) return;
  try {
    if (kind === 'success') tg.HapticFeedback.notificationOccurred('success');
    else if (kind === 'heavy') tg.HapticFeedback.impactOccurred('heavy');
    else if (kind === 'rumble') tg.HapticFeedback.impactOccurred('medium');
    else tg.HapticFeedback.impactOccurred('light');
  } catch (e) {}
}

// Лёгкая вибрация на любой кнопке и ссылке
document.addEventListener('click', (e) => {
  const b = e.target.closest('button, a');
  if (b && b.id !== 'size-add') haptic();
});

// Категории (key связывает их с товарами)
const CATS = [
  { key: 'hoodie', name: 'ХУДИ', img: 'images/cat-hoodie.jpg' },
  { key: 'tshirt', name: 'ФУТБОЛКИ', img: 'images/cat-tshirt.jpg' },
  { key: 'shorts', name: 'ШОРТЫ', img: 'images/cat-shorts.jpg' },
  { key: 'longsleeve', name: 'ЛОНГСЛИВЫ', img: 'images/cat-longsleeve.jpg' },
];

// Здесь меняй названия, цены, размеры и фото товаров
// images — фото для листания на странице товара (в порядке показа)
// video — видео, которое открывается на весь экран при первом заходе на страницу товара
// soldOut: true — товар распродан: плитка темнеет, на странице нельзя выбрать размер и купить
// tags — слова для поиска (кроме названия и категории)
const CARE = 'Стирайте при температуре не выше 30 градусов в деликатном режиме. Перед стиркой выверните вещь на изнаночную сторону. Не используйте отбеливатель. Гладить лучше с изнаночной стороны. Изделия имеют слегка приталенный крой, берите вещь по своему размеру.';

const products = [
  {
    id: 2, cat: 'tshirt', name: 'Футболка "Leopard"', price: 1450, sizes: ['XS', 'S', 'M', 'L'],
    img: 'images/cat-tshirt.jpg',
    images: ['images/tshirt-1.jpg', 'images/tshirt-3.jpg', 'images/together.jpg', 'images/sizes.jpg'],
    video: 'images/fit2.mp4',
    soldOut: false,
    tags: 'майка леопард leopard',
    desc: 'Одна футболка на каждый день.',
    details: [],
    text: 'Футболка из коллекции PHOMIZ. Про спокойную уверенность: вещь, которая говорит за тебя, пока ты молчишь.',
    care: CARE,
  },
  {
    id: 4, cat: 'longsleeve', name: 'Лонгслив "Leopard"', price: 1850, sizes: ['XS', 'S', 'M', 'L'],
    img: 'images/cat-longsleeve.jpg',
    images: ['images/longsleeve-2.jpg', 'images/longsleeve-3.jpg', 'images/together.jpg', 'images/sizes.jpg'],
    video: 'images/fit2.mp4',
    soldOut: false,
    tags: 'лонг леопард leopard',
    desc: 'Один лонгслив на все случаи жизни.',
    details: [],
    text: 'Лонгслив из коллекции PHOMIZ. Леопард не доказывает, что он быстр. Он просто идёт.',
    care: CARE,
  },
  {
    id: 1, cat: 'hoodie', name: 'Худи "Saratov"', price: 6550, sizes: ['S', 'M', 'L', 'XL'],
    img: 'images/cat-hoodie.jpg',
    images: ['images/cat-hoodie.jpg'],
    soldOut: true,
    tags: 'саратов saratov толстовка',
    desc: 'Эта вещь уже распродана. Следите за новыми релизами в нашем канале.',
    details: [],
    text: 'Худи "Saratov" было в нашей коллекции раньше. Сейчас его нельзя купить.',
  },
  {
    id: 3, cat: 'shorts', name: 'Шорты "Leopard"', price: 2250, sizes: ['S', 'M', 'L'],
    img: 'images/cat-shorts.jpg',
    images: ['images/cat-shorts.jpg'],
    soldOut: true,
    tags: 'леопард leopard',
    desc: 'Эта вещь уже распродана. Следите за новыми релизами в нашем канале.',
    details: [],
    text: 'Шорты "Leopard" были в нашей коллекции раньше. Сейчас их нельзя купить.',
  },
];

// Размерная сетка в сантиметрах: РАЗМЕР, РФ, ГРУДЬ (полуобхват), ДЛИНА, РУКАВ
const SIZE_CHART = {
  head: ['РАЗМЕР', 'РФ', 'ГРУДЬ', 'ДЛИНА', 'РУКАВ'],
  note: 'Все размеры в сантиметрах. Ориентир по росту: до 195 см. Изделия слегка приталенные, берите вещь по своему размеру.',
  tshirt: [
    ['XS', '42–44', 49, 66, 20],
    ['S', '44–46', 52, 68, 21],
    ['M', '46–48', 55, 71, 22],
    ['L', '48–50', 58, 73, 24],
  ],
  longsleeve: [
    ['XS', '42–44', 49, 66, 60],
    ['S', '44–46', 52, 68, 62],
    ['M', '46–48', 55, 70, 64],
    ['L', '48–50', 58, 72, 66],
  ],
};

// Новинки, из которых выбирают по кнопке «Заказать» на главном экране
const heroProducts = products.filter((p) => !p.soldOut);

let cart = [];
let current = null;
let chosen = null;

const $ = (id) => document.getElementById(id);
const money = (n) => n.toLocaleString('ru-RU');

$('manager').href = MANAGER_URL;
$('fit-manager').href = MANAGER_URL;
$('tg-link').href = TG_URL;

// Бегущая строка
const unit = '<span>БЕСПЛАТНАЯ ДОСТАВКА ОТ ТРЁХ ВЕЩЕЙ</span><span>/</span>';
document.querySelectorAll('.track').forEach((t) => { t.innerHTML = unit.repeat(10); });

// ----- Страницы: главная, каталог, помощь -----
const views = { home: $('view-home'), catalog: $('view-catalog'), help: $('view-help'), product: $('view-product') };

let currentView = 'home';
let productFrom = 'home'; // откуда открыли товар: туда вернёмся кнопкой «Назад»

function go(name, arg) {
  const changed = name !== currentView;
  if (name === 'product' && changed) productFrom = currentView;
  currentView = name;
  Object.keys(views).forEach((k) => { views[k].hidden = k !== name; });

  if (changed) {
    // Вперёд страница въезжает справа, назад (на главную) слева
    const v = views[name];
    v.classList.remove('in-fwd', 'in-back');
    void v.offsetWidth;
    v.classList.add(name === 'home' ? 'in-back' : 'in-fwd');
  }

  if (inTg && tg.BackButton) {
    try { if (name === 'home') tg.BackButton.hide(); else tg.BackButton.show(); } catch (e) {}
  }
  if (name === 'catalog') renderCatalog(arg || 'all', changed);
  if (name === 'product') {
    renderProduct(arg);
    if (changed) setTimeout(() => playIntro(arg), 420); // видео открывается после въезда страницы
  }
  document.querySelectorAll('.promo')[1].hidden = name === 'help'; // в «Помощи» нижняя строка не нужна
  $('menu-sheet').hidden = true;
  window.scrollTo(0, 0);
}

if (inTg && tg.BackButton) {
  try {
    tg.BackButton.onClick(() => {
      const open = [...document.querySelectorAll('.sheet')].find((x) => !x.hidden);
      if (open) open.hidden = true;
      else if (currentView === 'product') go(productFrom);
      else go('home');
    });
  } catch (e) {}
}

document.querySelectorAll('[data-go]').forEach((b) => {
  b.addEventListener('click', () => go(b.dataset.go));
});
$('logo').addEventListener('click', () => go('home'));
$('see-all').addEventListener('click', () => go('catalog'));
$('see-cats').addEventListener('click', () => go('catalog'));

// ----- Карточка товара -----
function makeCard(p) {
  const el = document.createElement('div');
  el.dataset.img = p.img;

  if (p.soldOut) {
    // Распродано: тёмная плитка с надписью. Открыть страницу посмотреть можно, купить нельзя
    el.className = 'sold';
    el.innerHTML =
      '<div class="photo tap" style="background-image:url(' + p.img + ')"><span class="sold-tag">SOLD OUT</span></div>' +
      '<div class="name tap">' + p.name + '</div>' +
      '<div class="price tap">' + money(p.price) + ' ₽</div>' +
      '<div class="sold-line">SOLD OUT</div>';
    el.querySelectorAll('.tap').forEach((t) => t.addEventListener('click', () => go('product', p)));
    return el;
  }

  el.innerHTML =
    '<div class="photo tap" style="background-image:url(' + p.img + ')"></div>' +
    '<div class="name tap">' + p.name + '</div>' +
    '<div class="price tap">' + money(p.price) + ' ₽</div>' +
    '<button class="tbtn">[ + В КОРЗИНУ ]</button>';
  // Нажали на фото, название или цену: открывается страница товара
  el.querySelectorAll('.tap').forEach((t) => t.addEventListener('click', () => go('product', p)));
  // Быстрое добавление через выбор размера
  el.querySelector('.tbtn').addEventListener('click', () => openSizes(p));
  return el;
}

// Каталог на главной (первые четыре)
products.slice(0, 4).forEach((p) => $('grid').appendChild(makeCard(p)));

// Страница каталога с фильтром по категориям
let swapTimer;

function renderCatalog(filter, instant) {
  const chips = $('chips');
  if (!chips.children.length) { // кнопки-фильтры создаём один раз, дальше только переключаем
    [{ key: 'all', name: 'ВСЕ' }, ...CATS].forEach((c) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.dataset.key = c.key;
      b.textContent = c.name;
      b.addEventListener('click', () => {
        renderCatalog(c.key);
        b.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
      chips.appendChild(b);
    });
  }
  chips.querySelectorAll('.chip').forEach((b) => b.classList.toggle('on', b.dataset.key === filter));

  const box = $('grid-all');
  clearTimeout(swapTimer);

  const fill = () => {
    box.innerHTML = '';
    const list = filter === 'all' ? products : products.filter((p) => p.cat === filter);
    list.forEach((p, i) => {
      const card = makeCard(p);
      card.style.setProperty('--i', i); // порядок для плавного появления по очереди
      box.appendChild(card);
    });
    if (list.every((p) => p.soldOut)) { // в категории всё распродано или пусто
      const e = document.createElement('div');
      e.className = 'empty';
      e.textContent = 'Ждите релизы в ближайшее время. Все подробности в нашем канале.';
      box.appendChild(e);
    }
    box.classList.remove('leaving');
  };

  if (instant || !box.children.length) {
    fill();
  } else {
    box.classList.add('leaving'); // сначала старые товары плавно гаснут
    swapTimer = setTimeout(fill, 170);
  }
}

// ----- Категории: плавный свайп; у компьютера перетаскивание мышкой с инерцией -----
const catBox = $('cats');
let dragging = false, moved = false, startX = 0, startLeft = 0;
let vel = 0, lastX = 0, lastT = 0, glide = 0;

catBox.addEventListener('mousedown', (e) => {
  dragging = true; moved = false; vel = 0;
  startX = lastX = e.pageX; startLeft = catBox.scrollLeft; lastT = performance.now();
  cancelAnimationFrame(glide);
});
window.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const dx = e.pageX - startX;
  if (Math.abs(dx) > 5) moved = true;
  catBox.scrollLeft = startLeft - dx;
  const now = performance.now();
  const dt = Math.max(1, now - lastT);
  vel = 0.8 * vel + 0.2 * ((lastX - e.pageX) / dt) * 16; // скорость, пикселей за кадр
  lastX = e.pageX; lastT = now;
});
window.addEventListener('mouseup', () => {
  if (!dragging) return;
  dragging = false;
  if (performance.now() - lastT > 80) vel = 0; // долго держал на месте: без инерции
  const slide = () => {
    catBox.scrollLeft += vel;
    vel *= 0.94; // чем ближе к 1, тем дольше «катится»
    if (Math.abs(vel) > 0.3) glide = requestAnimationFrame(slide);
  };
  if (moved) slide();
});

// «Ветер»: чем быстрее листаешь, тем сильнее лёгкий наклон плиток
let lastLeft = 0, speed = 0, windOn = false;
catBox.addEventListener('scroll', () => {
  const d = catBox.scrollLeft - lastLeft;
  lastLeft = catBox.scrollLeft;
  const target = Math.max(-1, Math.min(1, d / 40));
  speed += (target - speed) * 0.25; // сглаживание, чтобы не дёргалось
  if (!windOn) { windOn = true; requestAnimationFrame(wind); }
});
function wind() {
  catBox.style.setProperty('--skew', (-speed * 6).toFixed(2) + 'deg');
  speed *= 0.9;
  if (Math.abs(speed) > 0.01) {
    requestAnimationFrame(wind);
  } else {
    catBox.style.setProperty('--skew', '0deg');
    windOn = false;
  }
}

// ----- «Мыло» при прокрутке страницы и плавная прокрутка колесом мыши -----
const root = document.documentElement;
const SOAP_MAX = 0; // насколько размываются фото при быстрой прокрутке (px). 0 — выключить
let lastY = window.scrollY, soap = 0, soapOn = false;

window.addEventListener('scroll', () => {
  const d = Math.abs(window.scrollY - lastY);
  lastY = window.scrollY;
  soap += (Math.min(1, d / 60) - soap) * 0.3;
  if (!soapOn) { soapOn = true; requestAnimationFrame(soapTick); }
}, { passive: true });

function soapTick() {
  root.style.setProperty('--soap', (soap * SOAP_MAX).toFixed(2) + 'px');
  soap *= 0.88;
  if (soap > 0.01) {
    requestAnimationFrame(soapTick);
  } else {
    root.style.setProperty('--soap', '0px');
    soapOn = false;
  }
}

// Колесо мыши на компьютере катит страницу плавно, а не ступеньками
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (window.matchMedia('(pointer: fine)').matches && !calm) {
  let target = 0, rolling = false;

  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.target.closest('.sheet') || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (!rolling) target = window.scrollY;
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    const max = root.scrollHeight - window.innerHeight;
    target = Math.max(0, Math.min(max, target + delta));
    if (!rolling) { rolling = true; requestAnimationFrame(roll); }
  }, { passive: false });

  function roll() {
    const diff = target - window.scrollY;
    if (Math.abs(diff) < 0.5) { window.scrollTo(0, target); rolling = false; return; }
    const step = Math.abs(diff * 0.12) < 1 ? Math.sign(diff) : diff * 0.12;
    window.scrollTo(0, window.scrollY + step);
    requestAnimationFrame(roll);
  }
}

CATS.forEach((c) => {
  const el = document.createElement('div');
  el.className = 'cat';
  el.innerHTML =
    '<div class="cat-img" style="background-image:url(' + c.img + ')"></div>' +
    '<div class="cat-name">' + c.name + '</div>';
  el.addEventListener('click', () => { if (!moved) go('catalog', c.key); });
  catBox.appendChild(el);
});

// Плитки проявляются, когда их долистали
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.cat').forEach((el) => io.observe(el));

// ----- Предзагрузка фото: плитки показываем, когда картинка уже готова -----
const loadedImgs = {};
function whenLoaded(src) {
  if (!src) return Promise.resolve();
  if (!loadedImgs[src]) {
    loadedImgs[src] = new Promise((resolve) => {
      const im = new Image();
      im.onload = () => (im.decode ? im.decode().catch(() => {}).then(resolve) : resolve());
      im.onerror = resolve;
      im.src = src;
      setTimeout(resolve, 4000); // не ждём дольше 4 секунд
    });
  }
  return loadedImgs[src];
}
products.forEach((p) => (p.images || [p.img]).forEach((src) => whenLoaded(src))); // заранее грузим все фото

// Появление при прокрутке: карточки на главной, линия миссии и блок Telegram
const reveal = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const el = e.target;
      reveal.unobserve(el);
      // ждём, пока фото загрузится, и только потом плавно показываем плитку
      whenLoaded(el.dataset.img).then(() => el.classList.add('in'));
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('#grid > div').forEach((el, i) => { el.style.setProperty('--i', i); el.classList.add('reveal'); reveal.observe(el); });
document.querySelectorAll('.mission .hero-line, .tg').forEach((el) => { el.classList.add('reveal'); reveal.observe(el); });

// ----- Текст «собирается» по блокам, когда до него долистали -----
// Заголовки собираются по буквам в случайном порядке, абзацы по словам
function buildText(el, byChar) {
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  el.classList.add('txt');

  text.split(' ').forEach((word, i, all) => {
    if (byChar) {
      const w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      [...word].forEach((ch) => {
        const c = document.createElement('span');
        c.className = 'c';
        c.textContent = ch;
        c.style.setProperty('--d', Math.floor(Math.random() * 500) + 'ms');
        w.appendChild(c);
      });
      el.appendChild(w);
    } else {
      const c = document.createElement('span');
      c.className = 'c';
      c.setAttribute('aria-hidden', 'true');
      c.textContent = word;
      c.style.setProperty('--d', Math.floor(i * 28 + Math.random() * 120) + 'ms');
      el.appendChild(c);
    }
    if (i < all.length - 1) el.appendChild(document.createTextNode(' '));
  });
}

const textIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('on'); textIO.unobserve(e.target); }
  });
}, { threshold: 0.2 });

document.querySelectorAll(
  '.hero .small, .hero h1, .hero p, .section-head h2, .mission .small, .mission h2, .mission p, .help h2, .help p, .tg h2'
).forEach((el) => {
  buildText(el, el.matches('h1, h2, .small'));
  textIO.observe(el);
});


// ----- «Заказать» на главном экране: сначала выбор вещи -----
$('hero-order').addEventListener('click', () => {
  const box = $('pick');
  box.innerHTML = '';
  heroProducts.forEach((p) => {
    const b = document.createElement('button');
    b.className = 'pick-btn';
    b.innerHTML = '<span>' + p.name + '</span><span>' + money(p.price) + ' ₽</span>';
    b.addEventListener('click', () => { $('pick-sheet').hidden = true; openSizes(p); });
    box.appendChild(b);
  });
  $('pick-sheet').hidden = false;
});
$('pick-close').addEventListener('click', () => { $('pick-sheet').hidden = true; });

// ----- Выбор размера -----
function openSizes(p) {
  current = p;
  chosen = null;
  $('size-title').textContent = p.name;
  $('size-price').textContent = money(p.price) + ' ₽';
  $('size-photo').style.backgroundImage = 'url(' + p.img + ')';
  $('size-add').disabled = true;

  const box = $('sizes');
  box.innerHTML = '';
  p.sizes.forEach((s) => {
    const b = document.createElement('button');
    b.className = 'size';
    b.textContent = s;
    b.addEventListener('click', () => {
      chosen = s;
      box.querySelectorAll('.size').forEach((x) => x.classList.toggle('on', x === b));
      $('size-add').disabled = false;
    });
    box.appendChild(b);
  });
  $('size-sheet').hidden = false;
}

$('size-add').addEventListener('click', () => {
  if (!chosen) return;
  cart.push({ name: current.name, price: current.price, size: chosen, img: current.img });
  haptic('success');
  renderCart();
  $('size-sheet').hidden = true;
  $('cart-sheet').hidden = false;
});

// ----- Страница товара -----
let pdp = { p: null, size: null, qty: 1 };

function renderProduct(p) {
  if (!p) return go('home');
  pdp = { p, size: null, qty: 1 };
  const photos = p.images && p.images.length ? p.images : [p.img];

  $('pdp-crumb').textContent = p.name.toUpperCase();
  $('pdp-title').textContent = p.name;
  $('pdp-desc').textContent = p.desc || '';
  $('pdp-desc').hidden = !p.desc;
  $('pdp-price').textContent = money(p.price) + ' ₽';
  $('pdp-text').textContent = p.text || '';
  $('pdp-care').textContent = p.care || '';
  $('pdp-care-box').hidden = !p.care;

  // Распродано: размеры, сетка и покупка не показываются
  const sold = !!p.soldOut;
  $('pdp-choose').hidden = sold;
  $('pdp-buy').hidden = sold;
  $('pdp-sold').hidden = !sold;
  $('pdp-price').classList.toggle('dim', sold);
  $('gallery').classList.toggle('sold', sold);
  $('pdp-video').hidden = !p.video;

  const det = $('pdp-details');
  det.innerHTML = '';
  (p.details || []).forEach((d) => { const li = document.createElement('li'); li.textContent = d; det.appendChild(li); });
  det.hidden = !det.children.length;

  // Галерея: фото листаются пальцем, стрелками и точками
  const track = $('g-track');
  const dots = $('g-dots');
  track.innerHTML = '';
  dots.innerHTML = '';
  photos.forEach((src, i) => {
    const s = document.createElement('div');
    s.className = 'g-slide';
    s.style.backgroundImage = 'url(' + src + ')';
    track.appendChild(s);
    const d = document.createElement('button');
    d.className = 'g-dot' + (i === 0 ? ' on' : '');
    d.setAttribute('aria-label', 'Фото ' + (i + 1));
    d.addEventListener('click', () => track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' }));
    dots.appendChild(d);
  });
  track.scrollLeft = 0;
  const many = photos.length > 1;
  dots.hidden = !many;
  $('g-prev').hidden = !many;
  $('g-next').hidden = !many;
  updateGallery();

  // Размеры
  const box = $('pdp-sizes');
  box.innerHTML = '';
  p.sizes.forEach((s) => {
    const b = document.createElement('button');
    b.className = 'size';
    b.textContent = s;
    b.addEventListener('click', () => {
      pdp.size = s;
      box.querySelectorAll('.size').forEach((x) => x.classList.toggle('on', x === b));
      updateBuy();
    });
    box.appendChild(b);
  });
  updateBuy();
}

function updateGallery() {
  const t = $('g-track');
  const n = t.children.length;
  const i = Math.max(0, Math.min(n - 1, Math.round(t.scrollLeft / (t.clientWidth || 1))));
  document.querySelectorAll('#g-dots .g-dot').forEach((d, k) => d.classList.toggle('on', k === i));
  $('g-prev').classList.toggle('off', i === 0);
  $('g-next').classList.toggle('off', i === n - 1);
}
$('g-track').addEventListener('scroll', updateGallery, { passive: true });
$('g-prev').addEventListener('click', () => $('g-track').scrollBy({ left: -$('g-track').clientWidth, behavior: 'smooth' }));
$('g-next').addEventListener('click', () => $('g-track').scrollBy({ left: $('g-track').clientWidth, behavior: 'smooth' }));

function updateBuy() {
  $('pdp-size-label').textContent = pdp.size || 'НЕ ВЫБРАН';
  $('pdp-qty').textContent = pdp.qty;
  $('pdp-add').disabled = !pdp.size;
  $('pdp-add').textContent = pdp.size ? 'ДОБАВИТЬ В КОРЗИНУ' : 'ВЫБЕРИТЕ РАЗМЕР';
}
$('pdp-minus').addEventListener('click', () => { pdp.qty = Math.max(1, pdp.qty - 1); updateBuy(); });
$('pdp-plus').addEventListener('click', () => { pdp.qty = Math.min(9, pdp.qty + 1); updateBuy(); });

$('pdp-add').addEventListener('click', () => {
  if (!pdp.p || !pdp.size) return;
  for (let i = 0; i < pdp.qty; i++) {
    cart.push({ name: pdp.p.name, price: pdp.p.price, size: pdp.size, img: pdp.p.img });
  }
  haptic('success');
  renderCart();
  $('cart-sheet').hidden = false;
});

// Размерная сетка
$('pdp-fit').addEventListener('click', () => {
  const rows = SIZE_CHART[pdp.p && pdp.p.cat];
  const body = $('fit-body');
  if (rows && rows.length) {
    body.innerHTML =
      '<table class="fit-table"><thead><tr>' + SIZE_CHART.head.map((h) => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
      rows.map((r) => '<tr>' + r.map((x, i) => '<td' + (i === 1 ? ' class="ru"' : '') + '>' + x + '</td>').join('') + '</tr>').join('') +
      '</tbody></table><p class="note">' + SIZE_CHART.note + '</p>';
  } else {
    body.innerHTML = '<p class="note">Подскажем размер лично: напишите менеджеру.</p>';
  }
  $('fit-sheet').hidden = false;
});
$('fit-close').addEventListener('click', () => { $('fit-sheet').hidden = true; });

// ----- Видео товара на весь экран -----
const introSeen = {};
const introVideo = $('intro-video');

function playIntro(p, force) {
  if (!p || !p.video || (introSeen[p.id] && !force)) return;
  introSeen[p.id] = true;
  introVideo.src = p.video;
  introVideo.currentTime = 0;
  $('intro-bar').style.width = '0%';
  $('intro-sheet').hidden = false;
  const started = introVideo.play();
  if (started && started.catch) started.catch(() => { $('intro-sheet').hidden = true; }); // если телефон не дал включить
}
introVideo.addEventListener('timeupdate', () => {
  if (introVideo.duration) $('intro-bar').style.width = (introVideo.currentTime / introVideo.duration * 100) + '%';
});
introVideo.addEventListener('ended', () => { $('intro-sheet').hidden = true; });
$('intro-skip').addEventListener('click', () => { $('intro-sheet').hidden = true; });
$('pdp-video').addEventListener('click', () => playIntro(pdp.p, true));
// Когда окно закрылось (любым способом), останавливаем видео
new MutationObserver(() => { if ($('intro-sheet').hasAttribute('hidden')) introVideo.pause(); })
  .observe($('intro-sheet'), { attributes: true, attributeFilter: ['hidden'] });

// ----- Поиск по товарам -----
const catName = {};
CATS.forEach((c) => { catName[c.key] = c.name; });

function renderSearch() {
  const q = $('search-input').value.trim().toLowerCase();
  const box = $('search-results');
  box.innerHTML = '';
  const list = products.filter((p) => {
    const hay = (p.name + ' ' + (catName[p.cat] || '') + ' ' + (p.tags || '')).toLowerCase();
    return !q || q.split(/\s+/).every((w) => hay.includes(w));
  });
  if (!list.length) {
    box.innerHTML = '<div class="empty">Ничего не нашлось. Попробуйте другое слово: худи, футболка, лонгслив, шорты.</div>';
    return;
  }
  list.forEach((p) => {
    const row = document.createElement('button');
    row.className = 'res' + (p.soldOut ? ' sold' : '');
    row.innerHTML =
      '<span class="res-img" style="background-image:url(' + p.img + ')"></span>' +
      '<span class="res-info"><span class="res-name">' + p.name + '</span>' +
      '<span class="res-price">' + money(p.price) + ' ₽</span>' +
      (p.soldOut ? '<span class="res-tag">SOLD OUT</span>' : '') + '</span>';
    row.addEventListener('click', () => { $('search-sheet').hidden = true; go('product', p); });
    box.appendChild(row);
  });
}
$('search-input').addEventListener('input', renderSearch);
$('open-search').addEventListener('click', () => {
  $('search-input').value = '';
  renderSearch();
  $('search-sheet').hidden = false;
  setTimeout(() => $('search-input').focus(), 350);
});
$('search-close').addEventListener('click', () => { $('search-sheet').hidden = true; });

// ----- Леопард открывает сайт: листаешь, он рычит, из пасти свет, вспышка, и появляется магазин -----
(function () {
  const sec = $('roar');
  if (!sec || calm) return; // без анимации, если в телефоне отключены эффекты
  sec.classList.add('live');
  const leo = $('roar-leo');
  const glow = $('roar-glow');
  const flash = $('roar-flash');
  const bg = sec.querySelector('.roar-bg');
  const word = sec.querySelector('.roar-word');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);        // быстро в начале, мягко в конце
  const range = (p, a, b) => clamp((p - a) / (b - a), 0, 1);       // доля пути между a и b
  let fired = false, ticking = false, lastP = 0, lastBuzz = 0;

  function draw() {
    ticking = false;
    const r = sec.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    if (total <= 0) return;
    const p = clamp(-r.top / total, 0, 1);
    const hidden = p >= 0.8; // после вспышки сцена убрана, под ней уже магазин

    // Леопард чуть приближается и поднимается
    const move = ease(range(p, 0, 0.7));
    leo.style.transform = 'translate(0, ' + ((1 - move) * 1).toFixed(2) + '%) scale(' + (0.97 + 0.07 * move).toFixed(3) + ')';
    leo.style.opacity = hidden ? 0 : 1;
    bg.style.opacity = hidden ? 0 : 1;

    // Надпись за ним плывёт в сторону
    word.style.transform = 'translateX(' + ((p - 0.4) * -22).toFixed(2) + '%)';
    word.style.opacity = hidden ? 0 : 0.9;

    // Свет из пасти: сначала небольшое сияние, потом заливает весь экран
    const g = 0.12 + 0.88 * ease(range(p, 0.08, 0.5)) + 7 * ease(range(p, 0.5, 0.8));
    glow.style.transform = 'translate(-50%, -50%) scale(' + g.toFixed(3) + ')';
    glow.style.opacity = hidden ? 0 : ease(range(p, 0.05, 0.35));

    // Вспышка: нарастает до белого экрана, потом гаснет и открывается магазин
    const f = p < 0.8 ? ease(range(p, 0.6, 0.8)) : 1 - ease(range(p, 0.8, 1));
    flash.style.opacity = f.toFixed(3);

    // Телефон: лёгкая вибрация, пока листаешь и он рычит; «бам» на вспышке
    const now = Date.now();
    if (p > 0.1 && p < 0.72 && Math.abs(p - lastP) > 0.002 && now - lastBuzz > 130) { lastBuzz = now; haptic('rumble'); }
    if (p > 0.72 && !fired) { fired = true; haptic('heavy'); }
    if (p < 0.6) fired = false;
    lastP = p;
  }

  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
  window.addEventListener('resize', draw);
  draw();
})();

// Видео в шапке главного экрана запускается, когда до него долистали
(function () {
  const v = document.querySelector('.hero-video');
  if (!v || !('IntersectionObserver' in window)) return;
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } else v.pause();
    });
  }, { threshold: 0.05 }).observe(v);
})();

// ----- Большая надпись PHOMIZ внизу: растягивается ровно на всю ширину -----
function fitWordmark() {
  const box = $('wordmark');
  const s = box && box.firstElementChild;
  if (!s || !box.clientWidth) return;
  s.style.fontSize = '100px';
  const k = box.clientWidth / s.getBoundingClientRect().width;
  s.style.fontSize = (100 * k).toFixed(2) + 'px';
}
fitWordmark();
window.addEventListener('resize', fitWordmark);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWordmark);

// ----- Корзина -----
function renderCart() {
  const counter = $('cart-count');
  counter.textContent = cart.length;
  counter.classList.remove('bump');
  void counter.offsetWidth;
  counter.classList.add('bump');

  const box = $('cart-items');
  box.innerHTML = cart.length ? '' : 'Корзина пуста';

  const groups = {};
  cart.forEach((it) => {
    const k = it.name + '|' + it.size;
    groups[k] = groups[k] || { item: it, qty: 0 };
    groups[k].qty++;
  });

  Object.values(groups).forEach(({ item, qty }) => {
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML =
      '<div class="thumb" style="background-image:url(' + item.img + ')"></div>' +
      '<div class="info"><div>' + item.name + '</div>' +
      '<div class="small">Размер: ' + item.size + '</div>' +
      '<div class="qty"><button>−</button><span>' + qty + '</span><button>+</button></div></div>' +
      '<div>' + money(item.price * qty) + ' ₽</div>';

    const [minus, plus] = el.querySelectorAll('.qty button');
    plus.addEventListener('click', () => { cart.push({ ...item }); renderCart(); });
    minus.addEventListener('click', () => {
      const i = cart.findIndex((c) => c.name === item.name && c.size === item.size);
      cart.splice(i, 1);
      renderCart();
    });
    box.appendChild(el);
  });

  $('cart-total').textContent = money(cart.reduce((s, it) => s + it.price, 0));

  const left = FREE_FROM - cart.length;
  $('free-note').textContent =
    cart.length === 0 ? 'Бесплатная доставка от ' + FREE_FROM + ' вещей'
    : left > 0 ? 'Ещё ' + left + (left === 1 ? ' вещь' : ' вещи') + ' до бесплатной доставки'
    : 'Бесплатная доставка включена';
  $('free-bar').style.width = Math.min(100, (cart.length / FREE_FROM) * 100) + '%';
  renderHelpOrder();
}

// ----- Открытие и закрытие окон -----
$('open-menu').addEventListener('click', () => { $('menu-sheet').hidden = false; });
$('menu-close').addEventListener('click', () => { $('menu-sheet').hidden = true; });
$('open-cart').addEventListener('click', () => { $('cart-sheet').hidden = false; });
$('cart-close').addEventListener('click', () => { $('cart-sheet').hidden = true; });
$('size-close').addEventListener('click', () => { $('size-sheet').hidden = true; });
document.querySelectorAll('.sheet').forEach((sheet) => {
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.hidden = true; });
});

// ----- Оформление заказа -----
// ----- Заказ через менеджера -----
function cartLines() {
  const groups = {};
  cart.forEach((it) => {
    const k = it.name + '|' + it.size;
    groups[k] = groups[k] || { item: it, qty: 0 };
    groups[k].qty++;
  });
  return Object.values(groups).map(({ item, qty }, i) =>
    (i + 1) + '. ' + item.name + ' (' + item.size + ') × ' + qty + ' — ' + money(item.price * qty) + ' ₽');
}

function cartSum() { return cart.reduce((s, it) => s + it.price, 0); }

function orderText() {
  return 'Здравствуйте! Хочу оформить заказ:\n' + cartLines().join('\n') + '\nИтого: ' + money(cartSum()) + ' ₽';
}

// Показывает на странице «Помощь» заказ из корзины и ссылку на менеджера с готовым текстом
function renderHelpOrder() {
  const has = cart.length > 0;
  $('help-order').hidden = !has;
  $('manager').hidden = has;
  if (!has) return;
  $('help-items').textContent = cartLines().join('\n');
  $('help-total').textContent = money(cartSum());
  $('manager-order').href = MANAGER_URL + (MANAGER_URL.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent(orderText());
}

$('manager-order').addEventListener('click', (e) => {
  if (inTg && tg.openTelegramLink) {
    e.preventDefault();
    const url = $('manager-order').href;
    try { tg.openTelegramLink(url); } catch (err) { window.open(url, '_blank'); }
  }
});

$('copy-order').addEventListener('click', async () => {
  const text = orderText();
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand('copy'); } catch (e2) {}
    ta.remove();
  }
  const b = $('copy-order');
  b.textContent = ok ? 'СКОПИРОВАНО ✓' : 'НЕ УДАЛОСЬ СКОПИРОВАТЬ';
  setTimeout(() => { b.textContent = 'СКОПИРОВАТЬ ЗАКАЗ'; }, 1800);
});
$('checkout').addEventListener('click', () => {
  $('cart-sheet').hidden = true;
  go('help'); // оформление проходит через менеджера
});
$('order-close').addEventListener('click', () => {
  $('order-sheet').hidden = true;
  $('cart-sheet').hidden = false;
});
$('done-close').addEventListener('click', () => { $('done-sheet').hidden = true; });

$('order-send').addEventListener('click', async () => {
  const name = $('f-name').value.trim();
  const phone = $('f-phone').value.trim();
  const address = $('f-address').value.trim();
  const err = $('order-error');

  if (name.length < 2 || phone.replace(/\D/g, '').length < 10 || address.length < 5) {
    err.textContent = 'Проверьте имя, телефон и адрес';
    err.hidden = false;
    return;
  }
  err.hidden = true;

  const order = {
    name: name,
    phone: phone,
    address: address,
    items: cart,
    total: cart.reduce((s, it) => s + it.price, 0),
  };

  try {
    await sendOrder(order);
  } catch (e) {
    err.textContent = 'Не удалось отправить заказ. Попробуйте ещё раз';
    err.hidden = false;
    return;
  }

  cart = [];
  renderCart();
  $('order-sheet').hidden = true;
  $('done-sheet').hidden = false;
});

async function sendOrder(order) {
  const response = await fetch(SERVER_URL + '/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!response.ok) throw new Error('Ошибка отправки');
}

renderCart();
// ----- Плавное закрытие окон -----
// Любое окно (корзина, меню, размер...) при закрытии плавно уезжает, а не пропадает.
// Остальной код не меняется: по-прежнему пишем window.hidden = true / false.
const calmClose = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.sheet').forEach((sheet) => {
  let timer;
  Object.defineProperty(sheet, 'hidden', {
    get() { return this.hasAttribute('hidden') || this.classList.contains('closing'); },
    set(value) {
      clearTimeout(timer);
      if (value) {
        if (this.hasAttribute('hidden')) return;
        if (calmClose) { this.classList.remove('closing'); this.setAttribute('hidden', ''); return; }
        this.classList.add('closing');
        timer = setTimeout(() => { this.classList.remove('closing'); this.setAttribute('hidden', ''); }, 300);
      } else {
        this.classList.remove('closing');
        this.removeAttribute('hidden');
      }
    },
  });
});

document.addEventListener('gesturestart', (e) => e.preventDefault());

// iPhone: двойной тап не приближает страницу, но каждый быстрый тап считается как нажатие
let lastTap = 0, tapX = 0, tapY = 0;
document.addEventListener('touchstart', (e) => { tapX = e.touches[0].clientX; tapY = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  const t = e.changedTouches[0];
  const moved = Math.abs(t.clientX - tapX) > 10 || Math.abs(t.clientY - tapY) > 10;
  if (now - lastTap < 350 && !moved) {
    e.preventDefault(); // отменяем зум
    const btn = e.target.closest('button, a, .size, [role="button"]');
    if (btn) btn.click(); // и вручную засчитываем нажатие
  }
  lastTap = now;
}, { passive: false });