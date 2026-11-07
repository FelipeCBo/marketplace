import { listarProdutos } from "./api.js";

const inputBusca = document.getElementById("busca-input");
const divResultados = document.getElementById("resultados");
const botoesFiltro = document.querySelectorAll(".btn-filtro");

let todosProdutos = [];
let termoAtual = "";
let categoriaAtual = "todos";

async function carregar() {
  todosProdutos = await listarProdutos();
  renderizar();
}

// Função que filtra e desenha os resultados na tela
function renderizar() {
  // Filtra por texto
  let filtrados = todosProdutos.filter(p => 
    p.name.toLowerCase().includes(termoAtual) || 
    (p.description && p.description.toLowerCase().includes(termoAtual))
  );

  // Se tivéssemos categorias reais no mock, filtraríamos aqui.
  // Para simular, vamos usar a categoria baseada em palavras-chave no nome.
  if (categoriaAtual !== "todos") {
    filtrados = filtrados.filter(p => {
      const nome = p.name.toLowerCase();
      if (categoriaAtual === "alimentacao") return nome.includes("pão") || nome.includes("bolo") || nome.includes("queijo") || nome.includes("comida");
      if (categoriaAtual === "moda") return nome.includes("camiseta") || nome.includes("calça") || nome.includes("roupa");
      if (categoriaAtual === "casa") return nome.includes("manta") || nome.includes("mesa") || nome.includes("decoração");
      if (categoriaAtual === "artesanato") return nome.includes("brinco") || nome.includes("artesanato") || nome.includes("feito à mão");
      return true;
    });
  }

  // Se não digitou nada e não tem filtro de categoria, mostra mensagem
  if (termoAtual.length === 0 && categoriaAtual === "todos") {
    divResultados.innerHTML = `<p style="font-size: 14px; color: var(--texto-suave);">Digite algo para buscar...</p>`;
    return;
  }

  // Se não encontrou nada
  if (filtrados.length === 0) {
    divResultados.innerHTML = `
      <div class="vazio-estado">
        <div class="icone">🔍</div>
        <h2>Nenhum resultado</h2>
        <p>Tente buscar por outro termo ou categoria.</p>
      </div>`;
    return;
  }

  // Desenha os resultados no formato de lista de recomendações
  divResultados.innerHTML = filtrados.map(p => {
    const img = p.image_url || "https://via.placeholder.com/150?text=Sem+Foto";
    return `
    <div class="card-recomendacao">
      <img src="${img}" alt="${p.name}">
      <div class="info">
        <span class="subtitulo" style="font-size:10px;">${p.store_name || 'Loja local'}</span>
        <strong>${p.name}</strong>
        <span class="preco">R$ ${Number(p.price).toFixed(2).replace('.', ',')}</span>
      </div>
      <button class="btn-add" data-id="${p.id}" aria-label="Adicionar ao carrinho">+</button>
    </div>
    `;
  }).join("");

  // Adiciona evento de clique nos botões de adicionar ao carrinho
  divResultados.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", () => {
      adicionarAoCarrinho(btn.dataset.id);
    });
  });
}

// Evento de digitar no input de busca
inputBusca.addEventListener("input", (e) => {
  termoAtual = e.target.value.toLowerCase();
  renderizar();
});

// Evento de clicar nos filtros de categoria
botoesFiltro.forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove a classe ativo de todos
    botoesFiltro.forEach(b => b.classList.remove("ativo"));
    // Adiciona no botão clicado
    btn.classList.add("ativo");
    categoriaAtual = btn.dataset.cat;
    renderizar();
  });
});

// Função para adicionar ao carrinho (mesma lógica da Home)
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

carregar();