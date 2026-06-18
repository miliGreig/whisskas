(function(){
const products = [
    {
      name:'Mix de carnes',
      slug:'whiskas-mix-carnes',
      href:'#producto-mix-carnes',
      image:'assets/images/img_001_56c8548b55f9.png'
    },
    {
      name:'Sabor carne',
      slug:'whiskas-adulto-carne',
      href:'#producto-carne',
      image:'assets/images/img_002_d81e10571568.png'
    },
    {
      name:'Sabor pescado',
      slug:'whiskas-adulto-pescado',
      href:'#producto-pescado',
      image:'assets/images/img_003_581281ffeada.png'
    },
    {
      name:'Sabor pollo',
      slug:'whiskas-adulto-pollo',
      href:'#producto-pollo',
      image:'assets/images/img_004_7b5ee74ad0b8.png'
    }
  ];


  const IDLE_SPEED = 0.0026;
  const DRAG_SENS  = 0.0042;
  const FRICTION   = 0.94;
  const EASE       = 0.055;
  const MIN_SCALE  = 0.70;
  const MAX_SCALE  = 1.18;
  const TWO_PI     = Math.PI * 2;

  const stage  = document.getElementById('stage');
  const system = document.getElementById('orbitSystem');
  const ring   = document.getElementById('orbitRing');
  const toast  = document.getElementById('toast');

  if(!stage || !system || !ring){ return; }

  const N = products.length;
  const pouchEls = products.map((p) => {
    const a = document.createElement('a');
    a.className = 'pouch';
    a.href = p.href;
    a.dataset.flavor = p.name;
    a.dataset.productSlug = p.slug || '';
    a.setAttribute('aria-label', p.name);
    a.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <span class="cta">Ver producto →</span>
    `;
    system.appendChild(a);

    a.addEventListener('pointerenter', () => {
      hoverCount++;
      a.classList.add('active');
    });

    a.addEventListener('pointerleave', () => {
      hoverCount = Math.max(0, hoverCount - 1);
      a.classList.remove('active');
    });

    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (dragMoved) return;

      if (window.openWhiskasProduct && a.dataset.productSlug){
        window.openWhiskasProduct(a.dataset.productSlug);
        return;
      }

      showToast('→ Abriendo: ' + a.dataset.flavor);
    });

    return a;
  });

  let rotation = -0.15;
  let velocity = IDLE_SPEED;
  let hoverCount = 0;
  let radiusX = 300;
  let radiusY = 112;

  let dragging = false;
  let lastX = 0;
  let dragMoved = false;
  let downX = 0;

  stage.addEventListener('pointerdown', (e) => {
    dragging = true;
    dragMoved = false;
    lastX = downX = e.clientX;
    stage.classList.add('dragging');
  });

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    if (Math.abs(e.clientX - downX) > 6) dragMoved = true;
    const delta = dx * DRAG_SENS;
    rotation += delta;
    velocity = delta;
  });

  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('dragging');
    setTimeout(() => { dragMoved = false; }, 30);
  });

  function resize(){
    const w = stage.clientWidth;
    radiusX = Math.max(170, Math.min(w * 0.27, 330));
    radiusY = radiusX * 0.36;
    ring.style.width  = (radiusX * 2) + 'px';
    ring.style.height = (radiusY * 2) + 'px';
  }

  window.addEventListener('resize', resize);

  function tick(){
    if (!dragging){
      if (hoverCount > 0){
        velocity = 0;
      } else {
        if (Math.abs(velocity) > IDLE_SPEED * 1.25){
          velocity *= FRICTION;
        } else {
          velocity += (IDLE_SPEED - velocity) * EASE;
        }
        rotation += velocity;
      }
    }

    for (let i = 0; i < N; i++){
      const el = pouchEls[i];
      const angle = rotation + (i * TWO_PI / N);
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      const depth = (Math.sin(angle) + 1) / 2;
      const scale = MIN_SCALE + depth * (MAX_SCALE - MIN_SCALE);
      const brightness = 0.76 + depth * 0.24;

      el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale.toFixed(3)})`;
      el.style.opacity = (0.5 + depth * 0.5).toFixed(2);
      el.style.filter = `brightness(${brightness.toFixed(2)})`;
      el.style.zIndex = el.classList.contains('active') ? 200 : Math.round(20 + depth * 120);
    }

    requestAnimationFrame(tick);
  }

  function spawnSparkles(){
    const sparkles = [
      // izquierda
      { left:'10%', top:'18%', scale:1.00, size:'22px' },
      { left:'15%', top:'31%', scale:.82, size:'18px' },
      { left:'11%', top:'52%', scale:.92, size:'20px' },
      { left:'18%', top:'68%', scale:.80, size:'17px' },

      // arriba
      { left:'28%', top:'16%', scale:.74, size:'16px' },
      { left:'72%', top:'16%', scale:.74, size:'16px' },

      // derecha
      { left:'90%', top:'18%', scale:1.00, size:'22px' },
      { left:'85%', top:'31%', scale:.82, size:'18px' },
      { left:'89%', top:'52%', scale:.92, size:'20px' },
      { left:'82%', top:'68%', scale:.80, size:'17px' }
    ];

    sparkles.forEach((pos, i) => {
      const el = document.createElement('span');
      el.className = 'sparkle';
      el.setAttribute('aria-hidden', 'true');
      el.style.left = pos.left;
      el.style.top = pos.top;
      el.style.setProperty('--s', pos.scale);
      el.style.setProperty('--size', pos.size);
      el.style.animationDuration = (4.6 + (i % 4) * 0.55).toFixed(2) + 's';
      el.style.animationDelay = (i * 0.28).toFixed(2) + 's';
      stage.appendChild(el);
    });
  }

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1600);
  }

  resize();
  spawnSparkles();
  requestAnimationFrame(tick);
})();

const CART_STORAGE_KEY = 'whiskasCartItems';

    function getCartItems(){
      try{
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
      }catch(error){
        return [];
      }
    }

    function saveCartItems(items){
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }

    function getCartTotal(){
      return getCartItems().reduce((total, item) => total + (Number(item.quantity) || 0), 0);
    }

    function updateCartCount(){
      const total = getCartTotal();
      document.querySelectorAll('.cart-count').forEach((count) => {
        count.textContent = total;
        count.classList.toggle('show', total > 0);
      });
    }

    function showCartToast(message){
      let toast = document.querySelector('.cart-toast');

      if(!toast){
        toast = document.createElement('div');
        toast.className = 'cart-toast';
        document.body.appendChild(toast);
      }

      toast.textContent = message;
      toast.classList.add('show');

      clearTimeout(showCartToast.timer);
      showCartToast.timer = setTimeout(() => {
        toast.classList.remove('show');
      }, 1500);
    }

    function bumpCartIcon(){
      document.querySelectorAll('.cart-link').forEach((cartLink) => {
        cartLink.classList.remove('bump');
        void cartLink.offsetWidth;
        cartLink.classList.add('bump');
      });
    }

    function addToCart(product){
      const items = getCartItems();
      const existing = items.find((item) => item.id === product.id);

      if(existing){
        existing.quantity += 1;
      }else{
        items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        });
      }

      saveCartItems(items);
      updateCartCount();
      bumpCartIcon();
      showCartToast(product.name + ' se agregó al carrito');
    }

    function setupCartButtons(){
      document.querySelectorAll('[data-add-cart]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();

          addToCart({
            id: button.dataset.productId,
            name: button.dataset.productName,
            price: button.dataset.productPrice
          });
        });
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      updateCartCount();
      setupCartButtons();
    });

    window.addEventListener('storage', updateCartCount);

(function(){
  const SPA_PRODUCTS = [{"slug":"whiskas-adulto-pollo","name":"Whiskas Adulto Pollo","category":"Seco","type":"Alimento seco","size":"1.5 kg","price":"$2790","reviews":"287","tags":["Alimento seco","Adulto +1 año"],"description":"Formulado especialmente para gatos adultos. Whiskas Adulto Pollo combina ingredientes seleccionados con el sabor que más les gusta.","extra":"Cada croqueta aporta una nutrición completa que tu gato necesita para mantenerse activo, saludable y feliz todos los días.","image":"assets/images/img_005_03ab9717a3f6.webp"},{"slug":"whiskas-adulto-carne","name":"Whiskas Adulto Carne","category":"Seco","type":"Alimento seco","size":"1.5 kg","price":"$3090","reviews":"312","tags":["Alimento seco","Adulto +1 año"],"description":"Una opción completa para gatos adultos con sabor a carne y una textura crocante ideal para su alimentación diaria.","extra":"Pensado para acompañar su energía, cuidar su bienestar y ofrecerle una comida sabrosa todos los días.","image":"assets/images/img_006_a23417c2a92b.webp"},{"slug":"whiskas-pate-pescado","name":"Whiskas Paté Pescado","category":"Húmedo","type":"Alimento húmedo","size":"85 g","price":"$3250","reviews":"198","tags":["Alimento húmedo","Textura paté"],"description":"Paté suave con sabor a pescado, ideal para gatos que disfrutan una comida húmeda, sabrosa y fácil de comer.","extra":"Aporta variedad a la rutina y ayuda a sumar hidratación en la alimentación diaria.","image":"assets/images/img_007_52aa7dc3c646.webp"},{"slug":"whiskas-pate-pollo","name":"Whiskas Paté Pollo","category":"Húmedo","type":"Alimento húmedo","size":"85 g","price":"$3590","reviews":"245","tags":["Alimento húmedo","Sabor pollo"],"description":"Una receta húmeda con textura suave y sabor a pollo para complementar la alimentación de tu gato.","extra":"Perfecto para servir como comida especial o para sumar variedad durante la semana.","image":"assets/images/img_008_2dfc8c3d5573.webp"},{"slug":"whiskas-junior-gatito","name":"Whiskas Junior Gatito","category":"Gatito","type":"Alimento seco","size":"500 g","price":"$4190","reviews":"332","tags":["Gatitos","2 a 12 meses"],"description":"Alimento pensado para gatitos en crecimiento, con una fórmula adaptada a sus primeras etapas de vida.","extra":"Ayuda a acompañar su desarrollo con una comida rica, completa y fácil de incorporar a su rutina.","image":"assets/images/img_009_5ffdaca274e0.webp"},{"slug":"whiskas-sticks-premio","name":"Whiskas Sticks Premio","category":"Snack","type":"Snack & premio","size":"Pack x5","price":"$4890","reviews":"276","tags":["Snack","Premio"],"description":"Sticks sabrosos para premiar a tu gato y compartir un momento especial con él.","extra":"Ideales para usar como recompensa o mimo dentro de una rutina equilibrada.","image":"assets/images/img_010_751b306b33ff.webp"},{"slug":"whiskas-adulto-pescado","name":"Whiskas Adulto Pescado","category":"Seco","type":"Alimento seco","size":"1.5 kg","price":"$2990","reviews":"221","tags":["Alimento seco","Sabor pescado"],"description":"Alimento seco con sabor a pescado para gatos adultos que buscan una comida completa y deliciosa.","extra":"Una opción práctica para el día a día con el sabor intenso que suele encantarles.","image":"assets/images/img_011_f881f26643ab.webp"},{"slug":"whiskas-mix-carnes","name":"Whiskas Mix de Carnes","category":"Seco","type":"Alimento seco","size":"10 kg","price":"$8990","reviews":"356","tags":["Alimento seco","Bolsa grande"],"description":"Presentación grande con mix de carnes, ideal para hogares que buscan practicidad y rendimiento.","extra":"Mantiene una propuesta completa y sabrosa para alimentar a tu gato todos los días.","image":"assets/images/img_012_5e550eaa727c.webp"},{"slug":"whiskas-pollo-10kg","name":"Whiskas Pollo 10 kg","category":"Seco","type":"Alimento seco","size":"10 kg","price":"$9290","reviews":"401","tags":["Alimento seco","10 kg"],"description":"Bolsa grande sabor pollo para gatos adultos, pensada para una alimentación diaria completa.","extra":"Una opción rendidora, práctica y alineada con las necesidades de tu gato.","image":"assets/images/img_013_4a900ce850a3.webp"},{"slug":"whiskas-sobre-carne","name":"Whiskas Sobre Carne","category":"Húmedo","type":"Alimento húmedo","size":"85 g","price":"$1390","reviews":"174","tags":["Sobre húmedo","Sabor carne"],"description":"Sobre húmedo sabor carne, ideal para servir una porción fresca y sabrosa.","extra":"Perfecto para variar la alimentación y sumar un momento especial a su día.","image":"assets/images/img_014_31407b87d2d3.webp"},{"slug":"whiskas-sobre-pollo","name":"Whiskas Sobre Pollo","category":"Húmedo","type":"Alimento húmedo","size":"85 g","price":"$1390","reviews":"188","tags":["Sobre húmedo","Sabor pollo"],"description":"Sobre húmedo sabor pollo, fácil de servir y pensado para gatos adultos.","extra":"Su textura y aroma ayudan a que cada comida sea más atractiva.","image":"assets/images/img_008_2dfc8c3d5573.webp"},{"slug":"whiskas-sobre-pescado","name":"Whiskas Sobre Pescado","category":"Húmedo","type":"Alimento húmedo","size":"85 g","price":"$1490","reviews":"204","tags":["Sobre húmedo","Sabor pescado"],"description":"Sobre húmedo sabor pescado para gatos que disfrutan comidas con aroma y sabor intensos.","extra":"Una alternativa práctica para complementar su alimentación seca.","image":"assets/images/img_007_52aa7dc3c646.webp"},{"slug":"whiskas-gatito-pollo","name":"Whiskas Gatito Pollo","category":"Gatito","type":"Alimento seco","size":"1 kg","price":"$3790","reviews":"263","tags":["Gatitos","Sabor pollo"],"description":"Alimento seco sabor pollo para gatitos, pensado para acompañar su etapa de crecimiento.","extra":"Ideal para sumar energía y nutrición en sus primeros meses.","image":"assets/images/img_015_7f716e417557.webp"},{"slug":"whiskas-premios-salmon","name":"Whiskas Premios Salmón","category":"Snack","type":"Snack & premio","size":"60 g","price":"$2590","reviews":"149","tags":["Snack","Sabor salmón"],"description":"Premios sabor salmón para consentir a tu gato entre comidas.","extra":"Una forma simple de reforzar vínculos y premiar buenos momentos.","image":"assets/images/img_016_7fe4c4b681c6.webp"},{"slug":"whiskas-bocaditos-mix","name":"Whiskas Bocaditos Mix","category":"Snack","type":"Snack & premio","size":"75 g","price":"$2890","reviews":"167","tags":["Snack","Mix de sabores"],"description":"Bocaditos con mix de sabores para darle variedad y diversión a tu gato.","extra":"Ideales como premio ocasional dentro de una alimentación equilibrada.","image":"assets/images/img_017_0139621d80c2.webp"}];
  const SPA_CART_KEY = 'whiskasCartItems';

  function getItems(){
    try{
      return JSON.parse(localStorage.getItem(SPA_CART_KEY)) || [];
    }catch(error){
      return [];
    }
  }

  function saveItems(items){
    localStorage.setItem(SPA_CART_KEY, JSON.stringify(items));
  }

  function totalItems(){
    return getItems().reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  }

  function updateCounts(){
    const total = totalItems();
    document.querySelectorAll('.cart-count').forEach((count) => {
      count.textContent = total;
      count.classList.toggle('show', total > 0);
    });

    const totalNode = document.getElementById('spaCartTotal');
    if(totalNode) totalNode.textContent = total;
  }

  function bumpCart(){
    document.querySelectorAll('.cart-link').forEach((cart) => {
      cart.classList.remove('bump');
      void cart.offsetWidth;
      cart.classList.add('bump');
    });
  }

  function toast(message){
    let box = document.getElementById('spaCartToast');
    if(!box){
      box = document.createElement('div');
      box.id = 'spaCartToast';
      box.className = 'spa-cart-toast';
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => box.classList.remove('show'), 1500);
  }

  function addToCart(product){
    const items = getItems();
    const existing = items.find((item) => item.id === product.id);

    if(existing){
      existing.quantity += 1;
    }else{
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }

    saveItems(items);
    updateCounts();
    renderCart();
    bumpCart();
    toast(product.name + ' se agregó al carrito');
  }

  function showRoute(route){
    const pageMap = {
      home: 'homePage',
      products: 'spaProductsPage',
      detail: 'spaDetailPage',
      cart: 'spaCartPage',
      bienestar: 'spaBienestarPage',
      nosotros: 'spaNosotrosPage',
      preguntas: 'spaPreguntasPage'
    };

    const urlMap = {
      home: 'index.html',
      products: 'productos.html',
      cart: 'carrito.html',
      bienestar: 'bienestar.html',
      nosotros: 'nosotros.html',
      preguntas: 'preguntas.html'
    };

    const targetId = pageMap[route] || pageMap.products;
    const page = document.getElementById(targetId);

    if(!page){
      if(urlMap[route]){
        window.location.href = urlMap[route];
      }
      return;
    }

    document.querySelectorAll('.single-view').forEach((view) => view.classList.remove('active-view'));
    page.classList.add('active-view');

    if(route === 'cart') renderCart();

    window.scrollTo({top:0, behavior:'smooth'});
    updateCounts();
  }

  function openProduct(slug){
    const product = SPA_PRODUCTS.find((item) => item.slug === slug);
    if(!product) return;

    const tags = product.tags.map((tag) => `<span>${tag}</span>`).join('');
    const detail = document.getElementById('spaDetailContent');

    if(!detail){
      window.location.href = 'productos.html?producto=' + encodeURIComponent(slug);
      return;
    }

    detail.innerHTML = `
      <div class="spa-breadcrumb">
        <a data-spa-route="products">Productos</a> / ${product.name}
      </div>

      <article class="spa-detail-card">
        <div class="spa-detail-visual">
          ${product.image ? `<img class="spa-detail-img" src="${product.image}" alt="${product.name}" />` : `<div class="spa-detail-placeholder">Imagen close up del producto</div>`}
        </div>

        <div class="spa-detail-content">
          <span class="spa-category-pill">Categoría · ${product.category}</span>

          <h1>${product.name}</h1>

          <div class="spa-detail-tags">${tags}</div>

          <div class="spa-detail-price">${product.price}</div>
          <div class="spa-detail-rating">★★★★★ <small>(${product.reviews})</small></div>

          <p class="spa-detail-copy">${product.description}</p>
          <p class="spa-detail-copy">${product.extra}</p>

          <div class="spa-detail-actions">
            <button class="spa-btn spa-btn-primary" type="button" data-spa-add-cart data-product-id="${product.slug}" data-product-name="${product.name}" data-product-price="${product.price}">🛒 Agregar al carrito</button>
            <button class="spa-btn spa-btn-secondary" type="button" data-spa-route="preguntas">♡ Ver dónde encontrarlo</button>
          </div>

          <div class="spa-info-strip">
            <div class="spa-info-item">
              <strong>Tipo</strong>
              <span>${product.type}</span>
            </div>
            <div class="spa-info-item">
              <strong>Presentación</strong>
              <span>${product.size}</span>
            </div>
            <div class="spa-info-item">
              <strong>Etapa</strong>
              <span>${product.tags[product.tags.length - 1]}</span>
            </div>
          </div>

          <button class="spa-btn spa-btn-secondary" type="button" data-spa-route="products" style="margin-top:28px;">← Volver a productos</button>
        </div>
      </article>
    `;

    showRoute('detail');
  }

  window.openWhiskasProduct = openProduct;

  function renderCart(){
    const list = document.getElementById('spaCartList');
    if(!list) return;

    const items = getItems();

    if(items.length === 0){
      list.innerHTML = '<div class="spa-cart-empty">Todavía no agregaste productos al carrito.</div>';
      updateCounts();
      return;
    }

    list.innerHTML = items.map((item) => `
      <div class="spa-cart-row">
        <div>
          <h2>${item.name}</h2>
          <p>${item.price}</p>
        </div>
        <div class="spa-qty">
          <button type="button" data-spa-minus="${item.id}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-spa-plus="${item.id}">+</button>
        </div>
      </div>
    `).join('');

    updateCounts();
  }

  document.addEventListener('click', function(event){
    const addButton = event.target.closest('[data-spa-add-cart]');
    if(addButton){
      event.preventDefault();
      event.stopPropagation();
      addToCart({
        id: addButton.dataset.productId,
        name: addButton.dataset.productName,
        price: addButton.dataset.productPrice
      });
      return;
    }

    const openCard = event.target.closest('[data-spa-open-product]');
    if(openCard){
      event.preventDefault();
      openProduct(openCard.dataset.spaOpenProduct);
      return;
    }

    const plus = event.target.closest('[data-spa-plus]');
    if(plus){
      const items = getItems();
      const item = items.find((product) => product.id === plus.dataset.spaPlus);
      if(item) item.quantity += 1;
      saveItems(items);
      renderCart();
      return;
    }

    const minus = event.target.closest('[data-spa-minus]');
    if(minus){
      let items = getItems();
      const item = items.find((product) => product.id === minus.dataset.spaMinus);
      if(item) item.quantity -= 1;
      items = items.filter((product) => product.quantity > 0);
      saveItems(items);
      renderCart();
      return;
    }

    const route = event.target.closest('[data-spa-route]');
    if(route){
      event.preventDefault();
      showRoute(route.dataset.spaRoute);
      return;
    }

    const anchor = event.target.closest('a[href]');
    if(anchor){
      const href = anchor.getAttribute('href') || '';

      if(href.includes('productos.html')){
        event.preventDefault();
        showRoute('products');
        return;
      }

      if(href.includes('carrito.html')){
        event.preventDefault();
        showRoute('cart');
        return;
      }

      if(href.includes('bienestar.html')){
        event.preventDefault();
        showRoute('bienestar');
        return;
      }

      if(href.includes('preguntas.html')){
        event.preventDefault();
        showRoute('preguntas');
        return;
      }

      if(href.includes('nosotros.html') || href.includes('sustentabilidad.html')){
        event.preventDefault();
        showRoute('nosotros');
        return;
      }

      if(href === '#inicio' || href.includes('index.html#inicio')){
        event.preventDefault();
        showRoute('home');
        return;
      }
    }
  });

  const clearCart = document.getElementById('spaClearCart');
  if(clearCart){
    clearCart.addEventListener('click', function(){
      localStorage.removeItem(SPA_CART_KEY);
      renderCart();
      updateCounts();
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    updateCounts();
    renderCart();

    const productParam = new URLSearchParams(window.location.search).get('producto');
    if(productParam && document.getElementById('spaDetailContent')){
      openProduct(productParam);
    }
  });

  window.addEventListener('storage', updateCounts);
})();

(function(){
  const HERO_PRODUCT_SLUGS = {
    'Mix de carnes': 'whiskas-mix-carnes',
    'Sabor carne': 'whiskas-adulto-carne',
    'Sabor pescado': 'whiskas-adulto-pescado',
    'Sabor pollo': 'whiskas-adulto-pollo',
    '#producto-mix-carnes': 'whiskas-mix-carnes',
    '#producto-carne': 'whiskas-adulto-carne',
    '#producto-pescado': 'whiskas-adulto-pescado',
    '#producto-pollo': 'whiskas-adulto-pollo'
  };

  let heroPointerDownX = 0;
  let heroPointerDownY = 0;
  let heroMoved = false;

  document.addEventListener('pointerdown', function(event){
    const pouch = event.target.closest && event.target.closest('.pouch');
    if(!pouch) return;

    heroPointerDownX = event.clientX;
    heroPointerDownY = event.clientY;
    heroMoved = false;
  }, true);

  document.addEventListener('pointermove', function(event){
    const pouch = event.target.closest && event.target.closest('.pouch');
    if(!pouch) return;

    const dx = Math.abs(event.clientX - heroPointerDownX);
    const dy = Math.abs(event.clientY - heroPointerDownY);

    if(dx > 8 || dy > 8){
      heroMoved = true;
    }
  }, true);

  document.addEventListener('click', function(event){
    const pouch = event.target.closest && event.target.closest('.pouch');
    if(!pouch) return;

    const slug = pouch.dataset.productSlug ||
                 HERO_PRODUCT_SLUGS[pouch.dataset.flavor] ||
                 HERO_PRODUCT_SLUGS[pouch.getAttribute('href')];

    if(!slug || heroMoved) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if(window.openWhiskasProduct){
      window.openWhiskasProduct(slug);
    }
  }, true);
})();

(function(){
  function closeAllMenus(exceptNav){
    document.querySelectorAll('nav.menu-open, .spa-top-nav.menu-open').forEach((nav) => {
      if(nav === exceptNav) return;
      nav.classList.remove('menu-open');
      const btn = nav.querySelector('.mobile-menu-toggle');
      if(btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function setupResponsiveMenus(){
    document.querySelectorAll('nav, .spa-top-nav').forEach((nav, index) => {
      const links = nav.querySelector('.nav-links, .spa-nav-links');
      const logo = nav.querySelector('.logo');

      if(!links || nav.querySelector('.mobile-menu-toggle')) return;

      const button = document.createElement('button');
      button.className = 'mobile-menu-toggle';
      button.type = 'button';
      button.setAttribute('aria-label', 'Abrir menú');
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = '<span>☰</span>';

      if(logo && logo.nextSibling){
        nav.insertBefore(button, logo.nextSibling);
      }else{
        nav.insertBefore(button, links);
      }

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const isOpen = nav.classList.toggle('menu-open');
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        if(isOpen){
          closeAllMenus(nav);
        }
      });

      links.addEventListener('click', (event) => {
        if(event.target.closest('a, button')){
          nav.classList.remove('menu-open');
          button.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  document.addEventListener('click', (event) => {
    if(!event.target.closest('nav, .spa-top-nav')){
      closeAllMenus();
    }
  });

  window.addEventListener('resize', () => {
    if(window.innerWidth > 760){
      closeAllMenus();
    }
  });

  document.addEventListener('DOMContentLoaded', setupResponsiveMenus);
  setupResponsiveMenus();
})();

(function(){
  function setupFaqAccordion(){
    document.querySelectorAll('.faq-question').forEach((button) => {
      if(button.dataset.faqReady === 'true') return;
      button.dataset.faqReady = 'true';

      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        document.querySelectorAll('.faq-item').forEach((faq) => {
          faq.classList.remove('open');
          const faqButton = faq.querySelector('.faq-question');
          if(faqButton) faqButton.setAttribute('aria-expanded', 'false');
        });

        if(!isOpen){
          item.classList.add('open');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', setupFaqAccordion);
  setupFaqAccordion();
})();

(function(){
  function setupFaqV2Accordion(){
    document.querySelectorAll('.faq-v2-question').forEach((button) => {
      if(button.dataset.faqV2Ready === 'true') return;
      button.dataset.faqV2Ready = 'true';

      button.addEventListener('click', () => {
        const item = button.closest('.faq-v2-item');
        const isOpen = item.classList.contains('open');

        document.querySelectorAll('.faq-v2-item').forEach((faq) => {
          faq.classList.remove('open');
          const faqButton = faq.querySelector('.faq-v2-question');
          if(faqButton) faqButton.setAttribute('aria-expanded', 'false');
        });

        if(!isOpen){
          item.classList.add('open');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', setupFaqV2Accordion);
  setupFaqV2Accordion();
})();

(function(){
  document.addEventListener('click', function(event){
    const link = event.target.closest && event.target.closest('a[href]');
    if(!link) return;

    const href = link.getAttribute('href') || '';
    const hashRoutes = {
      '#inicio': 'home',
      '#productos': 'products',
      '#bienestar': 'bienestar',
      '#nosotros': 'nosotros',
      '#preguntas': 'preguntas',
      '#carrito': 'cart'
    };

    if(hashRoutes[href] && window.dispatchEvent){
      event.preventDefault();

      const routeTarget = document.querySelector('[data-spa-route="' + hashRoutes[href] + '"]');
      if(routeTarget){
        routeTarget.click();
      }
    }
  }, true);
})();

(function(){
  function createFluidPlaneStage(){
    const stage = document.createElement('div');
    stage.className = 'fluid-plane-stage';
    stage.innerHTML = `
      <div class="fluid-plane">
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M105 16 L12 58 C8 60 8 66 13 68 L43 80 L55 105 C57 110 64 109 66 104 L108 23 C111 18 109 14 105 16 Z" fill="#ffffff"/>
          <path d="M43 80 L105 16 L55 105 L57 72 Z" fill="#ffd7f3"/>
          <path d="M43 80 L57 72 L105 16" fill="none" stroke="#d319a7" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13 63 L105 16 L43 80 Z" fill="#fff7fd" stroke="#d319a7" stroke-width="4" stroke-linejoin="round"/>
        </svg>
      </div>
    `;
    return stage;
  }

  function setupFlyingForm(){
    document.querySelectorAll('.faq-form-v2').forEach((form) => {
      if(form.dataset.flyReady === 'true') return;
      form.dataset.flyReady = 'true';

      const panel = form.closest('.faq-contact-form');
      if(!panel) return;

      let message = panel.querySelector('.faq-form-message');
      if(!message){
        message = document.createElement('div');
        message.className = 'faq-form-message';
        message.textContent = '¡Consulta enviada! Podés escribir otra si querés.';
        form.insertAdjacentElement('afterend', message);
      }

      let stage = panel.querySelector('.fluid-plane-stage');
      if(!stage){
        stage = createFluidPlaneStage();
        panel.appendChild(stage);
      }

      const plane = stage.querySelector('.fluid-plane');

      function handleSend(event){
        event.preventDefault();
        launchFluidAnimation(form, plane, message);
      }

      form.addEventListener('submit', handleSend);

      form.querySelectorAll('.faq-submit-v2, .faq-submit').forEach((button) => {
        button.addEventListener('click', handleSend);
      });
    });
  }

  function launchFluidAnimation(form, plane, message){
    if(form.classList.contains('form-fade-out')) return;

    message.classList.remove('show');
    form.classList.remove('form-fade-in');
    form.classList.remove('form-fade-out');
    plane.classList.remove('fly');

    void form.offsetWidth;
    void plane.offsetWidth;

    form.classList.add('form-fade-out');

    setTimeout(() => {
      plane.classList.add('fly');
    }, 300);

    setTimeout(() => {
      form.reset();
    }, 950);

    setTimeout(() => {
      form.classList.remove('form-fade-out');
      form.classList.add('form-fade-in');
      message.classList.add('show');
    }, 1500);

    setTimeout(() => {
      form.classList.remove('form-fade-in');
      plane.classList.remove('fly');
    }, 2350);

    setTimeout(() => {
      message.classList.remove('show');
    }, 4100);
  }

  document.addEventListener('DOMContentLoaded', setupFlyingForm);
  setupFlyingForm();
})();

(function(){
  function setupBwAccordion(){
    document.querySelectorAll('.bw-acc-btn').forEach(function(btn){
      if(btn.dataset.bwReady === 'true') return;
      btn.dataset.bwReady = 'true';
      btn.addEventListener('click', function(){
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        // Cerrar todos los del mismo grid
        document.querySelectorAll('.bw-acc-btn').forEach(function(b){
          b.setAttribute('aria-expanded','false');
          b.querySelector('.bw-acc-btn > span:first-child') && (b.querySelector('span:first-child').textContent = 'Ver consejos');
        });
        if(!isOpen){
          btn.setAttribute('aria-expanded','true');
        }
      });
    });
  }
  document.addEventListener('DOMContentLoaded', setupBwAccordion);
  setupBwAccordion();
})();

document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.kibble, img.kibble').forEach(function(el){
    el.remove();
  });
});

(function(){
  const PRODUCT_FILTERS = {
    'whiskas-adulto-pollo':      { tipo:'seco',   etapa:'adulto', sabor:'pollo',   presentacion:'mediano' },
    'whiskas-adulto-carne':      { tipo:'seco',   etapa:'adulto', sabor:'carne',   presentacion:'mediano' },
    'whiskas-pate-pescado':      { tipo:'humedo', etapa:'adulto', sabor:'pescado', presentacion:'chico' },
    'whiskas-pate-pollo':        { tipo:'humedo', etapa:'adulto', sabor:'pollo',   presentacion:'chico' },
    'whiskas-junior-gatito':     { tipo:'seco',   etapa:'gatito', sabor:'pollo',   presentacion:'mediano' },
    'whiskas-sticks-premio':     { tipo:'snack',  etapa:'adulto', sabor:'pollo',   presentacion:'chico' },
    'whiskas-adulto-pescado':    { tipo:'seco',   etapa:'adulto', sabor:'pescado', presentacion:'mediano' },
    'whiskas-mix-carnes':        { tipo:'seco',   etapa:'gatito', sabor:'mix',     presentacion:'grande' },
    'whiskas-pollo-10kg':        { tipo:'seco',   etapa:'adulto', sabor:'pollo',   presentacion:'grande' },
    'whiskas-sobre-carne':       { tipo:'humedo', etapa:'adulto', sabor:'carne',   presentacion:'chico' },
    'whiskas-sobre-pollo':       { tipo:'humedo', etapa:'adulto', sabor:'pollo',   presentacion:'chico' },
    'whiskas-sobre-pescado':     { tipo:'humedo', etapa:'adulto', sabor:'pescado', presentacion:'chico' },
    'whiskas-gatito-pollo':      { tipo:'seco',   etapa:'gatito', sabor:'pollo',   presentacion:'mediano' },
    'whiskas-premios-salmon':    { tipo:'snack',  etapa:'adulto', sabor:'salmon',  presentacion:'chico' },
    'whiskas-bocaditos-mix':     { tipo:'snack',  etapa:'adulto', sabor:'mix',     presentacion:'chico' }
  };

  function setupProductFilters(){
    const page = document.getElementById('spaProductsPage');
    if(!page || page.dataset.filtersReady === 'true') return;
    page.dataset.filtersReady = 'true';

    const cards = Array.from(page.querySelectorAll('.spa-product-card'));
    const selects = Array.from(page.querySelectorAll('.spa-filter-select'));
    const reset = page.querySelector('#spaFilterReset');
    const count = page.querySelector('#spaFilterCount');
    const empty = page.querySelector('#spaFilterEmpty');

    cards.forEach((card) => {
      const slug = card.dataset.spaOpenProduct;
      const data = PRODUCT_FILTERS[slug];
      if(!data) return;
      card.dataset.tipo = data.tipo;
      card.dataset.etapa = data.etapa;
      card.dataset.sabor = data.sabor;
      card.dataset.presentacion = data.presentacion;
    });

    function applyFilters(){
      const active = {
        tipo: page.querySelector('[data-filter-field="tipo"]')?.value || 'all',
        etapa: page.querySelector('[data-filter-field="etapa"]')?.value || 'all',
        sabor: page.querySelector('[data-filter-field="sabor"]')?.value || 'all',
        presentacion: page.querySelector('[data-filter-field="presentacion"]')?.value || 'all'
      };

      let visible = 0;

      cards.forEach((card) => {
        const matches =
          (active.tipo === 'all' || card.dataset.tipo === active.tipo) &&
          (active.etapa === 'all' || card.dataset.etapa === active.etapa) &&
          (active.sabor === 'all' || card.dataset.sabor === active.sabor) &&
          (active.presentacion === 'all' || card.dataset.presentacion === active.presentacion);

        card.classList.toggle('is-filtered-out', !matches);
        if(matches) visible += 1;
      });

      if(count){
        count.textContent = visible === cards.length
          ? 'Mostrando todos'
          : visible + ' de ' + cards.length + ' productos';
      }

      if(empty){
        empty.classList.toggle('show', visible === 0);
      }
    }

    selects.forEach((select) => {
      select.addEventListener('change', applyFilters);
    });

    if(reset){
      reset.addEventListener('click', () => {
        selects.forEach((select) => select.value = 'all');
        applyFilters();
      });
    }

    applyFilters();
  }

  document.addEventListener('DOMContentLoaded', setupProductFilters);
  setupProductFilters();
})();