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
const products = [
  { id: 1, cat: 'hoodie', name: 'Худи "Saratov"', price: 6550, sizes: ['S', 'M', 'L', 'XL'], img: 'images/cat-hoodie.jpg' },
  { id: 2, cat: 'tshirt', name: 'Футболка "Leopard"', price: 1450, sizes: ['S', 'M', 'L', 'XL'], img: 'images/cat-tshirt.jpg' },
  { id: 3, cat: 'shorts', name: 'Шорты "Leopard"', price: 2250, sizes: ['S', 'M', 'L'], img: 'images/cat-shorts.jpg' },
  { id: 4, cat: 'longsleeve', name: 'Лонгслив "Leopard"', price: 1850, sizes: ['S', 'M', 'L', 'XL'], img: 'images/cat-longsleeve.jpg' },
];

// Новинки, из которых выбирают по кнопке «Заказать» на главном экране
const heroProducts = [products[3], products[1]];

let cart = [];
let current = null;
let chosen = null;

const $ = (id) => document.getElementById(id);
const money = (n) => n.toLocaleString('ru-RU');

$('manager').href = MANAGER_URL;
$('tg-link').href = TG_URL;

// Бегущая строка
const unit = '<span>БЕСПЛАТНАЯ ДОСТАВКА ОТ ТРЁХ ВЕЩЕЙ</span><span>/</span>';
document.querySelectorAll('.track').forEach((t) => { t.innerHTML = unit.repeat(10); });

// ----- Страницы: главная, каталог, помощь -----
const views = { home: $('view-home'), catalog: $('view-catalog'), help: $('view-help') };

let currentView = 'home';

function go(name, filter) {
  const changed = name !== currentView;
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
  if (name === 'catalog') renderCatalog(filter || 'all', changed);
    document.querySelectorAll('.promo')[1].hidden = name === 'help'; // в «Помощи» нижняя строка не нужна
  $('menu-sheet').hidden = true;
  window.scrollTo(0, 0);
}

if (inTg && tg.BackButton) {
  try {
    tg.BackButton.onClick(() => {
      const open = [...document.querySelectorAll('.sheet')].find((x) => !x.hidden);
      if (open) open.hidden = true; else go('home');
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
  el.innerHTML =
    '<div class="photo" style="background-image:url(' + p.img + ')"></div>' +
    '<div class="name">' + p.name + '</div>' +
    '<div class="price">' + money(p.price) + ' ₽</div>' +
    '<button class="tbtn">[ + В КОРЗИНУ ]</button>';
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
    if (list.length === 0) box.textContent = 'Скоро пополнение';
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
products.forEach((p) => whenLoaded(p.img)); // заранее грузим все фото

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
  $('free-bar').style.width = renderHelpOrder(); Math.min(100, (cart.length / FREE_FROM) * 100) + '%';
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