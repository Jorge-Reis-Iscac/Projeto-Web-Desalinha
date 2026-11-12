const products = [
  { id: 1, name: 'Brincos de Croché', description: 'Brincos artesanais em croché preto e dourado.', price: 10.00, category: 'acessorios', image: 'Imagens/brincos-croche.jpg' },
  
  { id: 2, name: 'Árvore de Natal', description: 'Árvore de Natal em croché com decoração festiva.', price: 10.00, category: 'natal', image: 'Imagens/arvore-natal.jpg' },
  
  { id: 3, name: 'Biquíni em Croché', description: 'Biquíni azul em croché artesanal.', price: 10.00, category: 'biquinis', image: 'Imagens/biquini-azul.jpg' },
  
  { id: 4, name: 'Presépio em Croché', description: 'Conjunto de presépio em Croché.', price: 10.00, category: 'natal', image: 'Imagens/presepio-croche.jpg' },
  
  { id: 5, name: 'Catos Decorativos', description: 'Catos em croché.', price: 10.00, category: 'plantas', image: 'Imagens/catos-croche.jpg' },
  
  { id: 6, name: 'Prende-chupeta Bebé', description: 'Prende-chupeta artesanal com tema Harry Potter.', price: 10.00, category: 'bebe', image: 'Imagens/prende-chupeta-harry-potter.jpg' },
  
  { id: 7, name: 'Porta-chaves Gato', description: 'Porta-chaves de gato amarelo em croché.', price: 10.00, category: 'acessorios', image: 'Imagens/porta-chaves-gato.jpg' },
  
  { id: 8, name: 'Sapatinhos de Bebé', description: 'Sapatinhos brancos de bebé em croché.', price: 10.00, category: 'sapatos', image: 'Imagens/sapatinhos-bebe.jpg' }
];

const euros = amount => new Intl.NumberFormat('pt-PT', {style:'currency', currency:'EUR'}).format(amount);
const cart = new Map();
const favorites = new Set();
let activeCategory = '';
let favoritesOnly = false;
const grid = document.querySelector('#product-grid');
const onCatalogPage = document.body.classList.contains('catalog-page');
const search = document.querySelector('#search');
const drawer = document.querySelector('#cart-drawer');
const overlay = document.querySelector('#overlay');

function matchesCategory(p, category) {
  if (!category) return true;
  const extra = {decoracao:[2,4,5], bebe:[6,8]};
  return p.category === category || (extra[category] || []).includes(p.id);
}

function renderProducts() {
  const term = search.value.trim().toLocaleLowerCase('pt-PT');
  const filtered = products.filter(p => matchesCategory(p, activeCategory) && (!favoritesOnly || favorites.has(p.id)) && `${p.name} ${p.description}`.toLocaleLowerCase('pt-PT').includes(term));
  grid.innerHTML = filtered.map(p => `
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}">
        <button class="favorite ${favorites.has(p.id) ? 'active' : ''}" data-favorite="${p.id}" aria-label="${favorites.has(p.id) ? 'Remover dos' : 'Adicionar aos'} favoritos" aria-pressed="${favorites.has(p.id)}">${favorites.has(p.id) ? '♥' : '♡'}</button>
      </div>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-detail">${p.description}</p>
        <div class="product-bottom"><span class="price">${euros(p.price)}</span><button class="add-button" data-add="${p.id}">+ Adicionar</button></div>
      </div>
    </article>`).join('');
  document.querySelector('#empty-message').hidden = filtered.length > 0;
  document.querySelectorAll('[data-category]').forEach(el => el.classList.toggle('active', el.dataset.category === activeCategory));
  document.querySelector('#favorites-count').textContent = favorites.size;
}

function renderCart() {
  const entries = [...cart.entries()];
  const count = entries.reduce((sum, [,qty]) => sum + qty, 0);
  document.querySelector('#cart-count').textContent = count;
  document.querySelector('#cart-items').innerHTML = entries.length ? entries.map(([id,qty]) => {
    const p = products.find(p => p.id === id);
    return `<div class="cart-item"><img class="cart-item-thumb" src="${p.image}" alt="${p.name}"><div><strong>${p.name}</strong><small>${qty} × ${euros(p.price)}</small></div><button class="remove-item" data-remove="${id}" aria-label="Remover uma unidade de ${p.name}">−</button></div>`;
  }).join('') : '<p class="cart-empty">O teu carrinho ainda está vazio ♡</p>';
  const total = entries.reduce((sum,[id,qty]) => sum + products.find(p=>p.id===id).price * qty,0);
  document.querySelector('#cart-total').textContent = euros(total);
  const lines = entries.map(([id,qty]) => {const p=products.find(p=>p.id===id);return `${qty} x ${p.name} — ${euros(p.price*qty)}`;});
  const subject = encodeURIComponent('Pedido de peças de croché - Desalinha');
  const body = encodeURIComponent(`Olá! Quero encomendar:\n\n${lines.join('\n') || '(Ainda sem produtos)'}\n\nTotal: ${euros(total)}\n\nNome:\nMorada:\nObservações:`);
  document.querySelector('#checkout-link').href = `mailto:ola@exemplo.pt?subject=${subject}&body=${body}`;
  document.querySelector('#checkout-link').style.pointerEvents = entries.length ? 'auto' : 'none';
  document.querySelector('#checkout-link').style.opacity = entries.length ? '1' : '.45';
}

function openCart(){drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');overlay.hidden=false;document.querySelector('#close-cart').focus();}
function closeCart(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');overlay.hidden=true;document.querySelector('#cart-button').focus();}

document.addEventListener('click', event => {
  const add = event.target.closest('[data-add]');
  const fav = event.target.closest('[data-favorite]');
  const remove = event.target.closest('[data-remove]');
  const category = event.target.closest('[data-category]');
  if(add){const id=Number(add.dataset.add);cart.set(id,(cart.get(id)||0)+1);renderCart();openCart();}
  if(fav){const id=Number(fav.dataset.favorite);favorites.has(id)?favorites.delete(id):favorites.add(id);renderProducts();}
  if(remove){const id=Number(remove.dataset.remove);const qty=cart.get(id);qty<=1?cart.delete(id):cart.set(id,qty-1);renderCart();}
  if(category){
    if (!onCatalogPage) { window.location.href = `produtos.html?categoria=${encodeURIComponent(category.dataset.category)}`; return; }
    activeCategory=category.dataset.category;favoritesOnly=false;search.value='';renderProducts();document.querySelector('#produtos').scrollIntoView({behavior:'smooth'});
  }
});

search.addEventListener('input',()=>{activeCategory='';favoritesOnly=false;renderProducts();});
document.querySelector('#show-all')?.addEventListener('click',()=>{activeCategory='';favoritesOnly=false;search.value='';renderProducts();});
document.querySelector('#favorites-button').addEventListener('click',()=>{favoritesOnly=!favoritesOnly;activeCategory='';search.value='';renderProducts();document.querySelector('#produtos').scrollIntoView({behavior:'smooth'});});
document.querySelector('#cart-button').addEventListener('click',openCart);
document.querySelector('#close-cart').addEventListener('click',closeCart);
overlay.addEventListener('click',closeCart);
document.addEventListener('keydown', e=>{if(e.key==='Escape'&&drawer.classList.contains('open'))closeCart();});
const requestedCategory = new URLSearchParams(location.search).get('categoria');
if (onCatalogPage && ['biquinis','bebe','roupa','sapatos','natal','decoracao','plantas','acessorios'].includes(requestedCategory)) activeCategory=requestedCategory;
document.querySelector('#year').textContent=new Date().getFullYear();
renderProducts();
renderCart();
