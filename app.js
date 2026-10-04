const products = [
  { id: 1, name: 'Худи "Black"', price: 9500, sizes: ['S', 'M', 'L', 'XL'] },
  { id: 2, name: 'Футболка "Classic"', price: 4900, sizes: ['S', 'M', 'L', 'XL'] },
  { id: 3, name: 'Штаны "Light"', price: 6000, sizes: ['S', 'M', 'L'] },
  { id: 4, name: 'Джерси "Club"', price: 5500, sizes: ['M', 'L', 'XL'] },
];

let cart = [];

const grid = document.getElementById('grid');
const counter = document.getElementById('cart-count');
const sizeSheet = document.getElementById('size-sheet');
const sizeTitle = document.getElementById('size-title');
const sizesBox = document.getElementById('sizes');
const cartSheet = document.getElementById('cart-sheet');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');

// Карточки товаров
products.forEach((product) => {
  const card = document.createElement('div');
  card.innerHTML =
    '<div class="photo"></div>' +
    '<div class="name">' + product.name + '</div>' +
    '<div class="price">' + product.price + ' ₽</div>' +
    '<button class="add">+ В КОРЗИНУ</button>';

  card.querySelector('.add').addEventListener('click', () => openSizes(product));
  grid.appendChild(card);
});

// Окно выбора размера
function openSizes(product) {
  sizeTitle.textContent = product.name;
  sizesBox.innerHTML = '';

  product.sizes.forEach((size) => {
    const btn = document.createElement('button');
    btn.className = 'size';
    btn.textContent = size;
    btn.addEventListener('click', () => {
      cart.push({ name: product.name, price: product.price, size: size });
      renderCart();
      sizeSheet.hidden = true;
    });
    sizesBox.appendChild(btn);
  });

  sizeSheet.hidden = false;
}

// Отрисовка корзины
function renderCart() {
  counter.textContent = cart.length;
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.textContent = 'Корзина пуста';
  }

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;

    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML =
      '<span>' + item.name + ' (' + item.size + ')</span>' +
      '<span>' + item.price + ' ₽</span>';

    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = '✕';
    del.addEventListener('click', () => {
      cart.splice(index, 1);
      renderCart();
    });

    row.appendChild(del);
    cartItems.appendChild(row);
  });

  cartTotal.textContent = total;
}

// Открытие и закрытие окон
document.getElementById('open-cart').addEventListener('click', () => { cartSheet.hidden = false; });
document.getElementById('cart-close').addEventListener('click', () => { cartSheet.hidden = true; });
document.getElementById('size-close').addEventListener('click', () => { sizeSheet.hidden = true; });

// Нажатие на тёмный фон тоже закрывает окно
[sizeSheet, cartSheet].forEach((sheet) => {
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet) sheet.hidden = true;
  });
});

// ----- Оформление заказа -----
const orderSheet = document.getElementById('order-sheet');
const doneSheet = document.getElementById('done-sheet');
const orderError = document.getElementById('order-error');

document.getElementById('checkout').addEventListener('click', () => {
  if (cart.length === 0) return;
  document.getElementById('order-total').textContent = cartTotal.textContent;
  cartSheet.hidden = true;
  orderSheet.hidden = false;
});

document.getElementById('order-close').addEventListener('click', () => {
  orderSheet.hidden = true;
  cartSheet.hidden = false;
});

document.getElementById('done-close').addEventListener('click', () => {
  doneSheet.hidden = true;
});

document.getElementById('order-send').addEventListener('click', async () => {
  const name = document.getElementById('f-name').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const address = document.getElementById('f-address').value.trim();

  const phoneDigits = phone.replace(/\D/g, '');
  if (name.length < 2 || phoneDigits.length < 10 || address.length < 5) {
    orderError.textContent = 'Проверьте имя, телефон и адрес';
    orderError.hidden = false;
    return;
  }
  orderError.hidden = true;

  const order = {
    name: name,
    phone: phone,
    address: address,
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price, 0),
  };

  try {
    await sendOrder(order);
  } catch (e) {
    orderError.textContent = 'Не удалось отправить заказ. Попробуйте ещё раз';
    orderError.hidden = false;
    return;
  }

  cart = [];
  renderCart();
  orderSheet.hidden = true;
  doneSheet.hidden = false;
});

const SERVER_URL = 'http://localhost:3010';

async function sendOrder(order) {
  const response = await fetch(SERVER_URL + '/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!response.ok) throw new Error('Ошибка отправки');
}

renderCart();