import { listarProdutos } from "./api.js";

const lista = document.getElementById("lista-produtos");
const buscaInput = document.getElementById("busca");
let produtosOriginais = [];

async function carregar() {
  produtosOriginais = await listarProdutos();
  render(produtosOriginais);
}

function render(produtos) {
  if (!produtos.length) {
    lista.innerHTML = `<div class="vazio-estado"><p>Nenhum produto disponível.</p></div>`;
    return;
  }

  lista.innerHTML = produtos.map(p => {
    const img = p.image_url || "https://via.placeholder.com/150?text=Sem+Foto";
    return `
    <div class="card-recomendacao">
      <img src="${img}" alt="${p.name}">
      <div class="info">
        <span class="subtitulo" style="font-size:10px;">Feito no Bairro</span>
        <strong>${p.name}</strong>
        <span class="preco">R$ ${Number(p.price).toFixed(2).replace('.', ',')}</span>
      </div>
      <button class="btn-add" data-id="${p.id}" aria-label="Adicionar ao carrinho">+</button>
    </div>
  `}).join("");

  lista.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", () => {
      adicionarAoCarrinho(btn.dataset.id);
    });
  });
}

function adicionarAoCarrinho(id) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const item = cart.find(i => i.id == id);
  
  if (item) item.qtd++;
  else cart.push({ id: Number(id), qtd: 1 });
  
  localStorage.setItem("cart", JSON.stringify(cart));
  
  const btn = document.querySelector(`.btn-add[data-id="${id}"]`);
  if(btn) {
    btn.style.backgroundColor = "#10b981"; 
    btn.innerText = "✓";
    setTimeout(() => { btn.style.backgroundColor = ""; btn.innerText = "+"; }, 1000);
  }
}

buscaInput?.addEventListener("input", () => {
  const t = buscaInput.value.toLowerCase();
  const filtrados = produtosOriginais.filter(p => 
    p.name.toLowerCase().includes(t) || (p.store_name && p.store_name.toLowerCase().includes(t))
  );
  render(filtrados);
});

carregar();