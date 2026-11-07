import { listarProdutos, criarPedido } from "./api.js";

const container = document.getElementById("carrinho-container");
const qtdItensEl = document.getElementById("qtd-itens");
const finalizarBox = document.getElementById("finalizar-box");
const totalEl = document.getElementById("total");
const msg = document.getElementById("msg");

let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let produtos = [];

async function carregar() {
  const todos = await listarProdutos();
  produtos = todos.filter(p => cart.some(i => i.id === p.id));
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="vazio-estado">
        <div class="icone">🛍️</div>
        <h2>Seu carrinho está vazio</h2>
        <p>Adicione produtos locais para continuar.</p>
      </div>
    `;
    qtdItensEl.innerText = "0 itens";
    finalizarBox.style.display = "none";
    return;
  }

  render();
  finalizarBox.style.display = "block";
}

function render() {
  let totalGeral = 0;
  let totalQtd = 0;

  container.innerHTML = produtos.map(p => {
    const item = cart.find(i => i.id === p.id);
    totalGeral += p.price * item.qtd;
    totalQtd += item.qtd;
    const img = p.image_url || "https://via.placeholder.com/60";

    return `
      <div class="linha-carrinho">
        <img src="${img}" alt="${p.name}">
        <div class="info">
          <strong>${p.name}</strong>
          <span class="preco">R$ ${Number(p.price).toFixed(2).replace('.', ',')}</span>
          <div class="qtd">
            <button onclick="alterarQtd(${p.id}, -1)">−</button>
            <span>${item.qtd}</span>
            <button onclick="alterarQtd(${p.id}, 1)">+</button>
          </div>
        </div>
        <button class="btn-remover" onclick="removerItem(${p.id})">Remover</button>
      </div>
    `;
  }).join("");

  qtdItensEl.innerText = `${totalQtd} ${totalQtd === 1 ? 'item' : 'itens'}`;
  totalEl.innerText = "R$ " + totalGeral.toFixed(2).replace('.', ',');
}

window.alterarQtd = (id, delta) => {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qtd += delta;
  if (item.qtd <= 0) cart = cart.filter(i => i.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  carregar();
};

window.removerItem = (id) => {
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  carregar();
};

document.getElementById("form-pedido").addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.style.display = "block";
  try {
    const totalPedido = produtos.reduce((acc, p) => acc + (p.price * cart.find(i => i.id === p.id).qtd), 0);
    
    await criarPedido({
      items: produtos.map(p => ({
        id: p.id,
        qtd: cart.find(i => i.id === p.id).qtd,
        price: p.price
      })),
      delivery_address: document.getElementById("endereco").value
    });

    localStorage.removeItem("cart");
    msg.className = "msg-sucesso";
    msg.innerText = "Pedido realizado com sucesso!";
    setTimeout(() => window.location.href = "index.html", 1500);
  } catch (err) {
    msg.className = "msg-erro";
    msg.innerText = err.message;
  }
});

carregar();