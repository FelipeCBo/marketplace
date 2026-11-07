import { criarLoja, minhaLoja, criarProduto, listarProdutos, usuarioAtual, logout } from "./api.js";

const avisoLogin = document.getElementById("aviso-login");
const areaLogado = document.getElementById("area-logado");
const btnLogout = document.getElementById("btn-logout");
const infoLoja = document.getElementById("info-loja");
const secaoLoja = document.getElementById("secao-loja");
const secaoProdutos = document.getElementById("secao-produtos");
const containerProdutos = document.getElementById("meus-produtos-container");
const gridProdutos = document.getElementById("meus-produtos");

const msgLoja = document.getElementById("msg-loja");
const msgProduto = document.getElementById("msg-produto");

// Verifica o estado de login ao carregar a página
function verificarLogin() {
  const user = usuarioAtual();
  if (!user) {
    avisoLogin.style.display = "flex";
    areaLogado.style.display = "none";
    btnLogout.style.display = "none";
  } else {
    avisoLogin.style.display = "none";
    areaLogado.style.display = "block";
    btnLogout.style.display = "block";
    atualizarPainel();
  }
}

// Função para exibir mensagens de erro/sucesso
function exibirMsg(el, texto, tipo) {
  el.style.display = "block";
  el.className = tipo === "sucesso" ? "msg-sucesso" : "msg-erro";
  el.innerText = texto;
  setTimeout(() => { el.style.display = "none"; }, 4000);
}

// Atualiza a interface dependendo se o lojista já tem uma loja ou não
async function atualizarPainel() {
  const loja = await minhaLoja();
  
  if (loja) {
    // Se tem loja, mostra os dados dela e libera o cadastro de produtos
    infoLoja.innerHTML = `
      <div class="card-recomendacao" style="background: var(--fundo-card); padding: 16px; display: block;">
        <span class="subtitulo" style="color:var(--roxo-zyra)">Minha Loja</span>
        <h3 style="margin: 4px 0 8px; font-size:18px;">${loja.store_name}</h3>
        <p style="font-size: 13px; color: var(--texto-suave); margin-bottom: 4px;">📍 ${loja.address || "Endereço não informado"}</p>
        <p style="font-size: 13px; color: var(--texto-suave);">📞 ${loja.whatsapp || "WhatsApp não informado"}</p>
      </div>
    `;
    secaoLoja.style.display = "none";
    secaoProdutos.style.display = "block";
    containerProdutos.style.display = "block";
    await carregarMeusProdutos(loja.id);
  } else {
    // Se não tem loja, mostra apenas o formulário de criar loja
    infoLoja.innerHTML = "";
    secaoLoja.style.display = "block";
    secaoProdutos.style.display = "none";
    containerProdutos.style.display = "none";
  }
}

// Carrega os produtos pertencentes a esta loja
async function carregarMeusProdutos(lojaId) {
  const todos = await listarProdutos();
  const meus = todos.filter(p => p.seller_id === lojaId);

  if (!meus.length) {
    gridProdutos.innerHTML = `<p style="font-size: 14px; color: var(--texto-suave);">Você ainda não cadastrou produtos.</p>`;
    return;
  }

  gridProdutos.innerHTML = meus.map(p => {
    const img = p.image_url || "https://via.placeholder.com/150?text=Sem+Foto";
    return `
      <div class="card-produto-mini" style="flex: 0 0 140px;">
        <img src="${img}" alt="${p.name}">
        <div class="info">
          <strong>${p.name}</strong>
          <span class="preco">R$ ${Number(p.price).toFixed(2).replace('.', ',')}</span>
          <span style="font-size: 11px; color: var(--texto-suave); margin-top:4px; display:block;">Estoque: ${p.stock}</span>
        </div>
      </div>
    `;
  }).join("");
}

// Evento de Salvar Loja
document.getElementById("form-loja").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await criarLoja({
      store_name: document.getElementById("nomeLoja").value,
      description: document.getElementById("descricao").value,
      address: document.getElementById("endereco").value,
      whatsapp: document.getElementById("whatsapp").value
    });
    exibirMsg(msgLoja, "Loja criada com sucesso!", "sucesso");
    document.getElementById("form-loja").reset();
    await atualizarPainel(); // Recarrega a tela para mostrar a loja criada
  } catch (err) {
    exibirMsg(msgLoja, err.message, "erro");
  }
});

// Evento de Salvar Produto
document.getElementById("form-produto").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await criarProduto({
      name: document.getElementById("nomeProduto").value,
      description: document.getElementById("descProduto").value,
      price: parseFloat(document.getElementById("preco").value),
      stock: parseInt(document.getElementById("estoque").value) || 0,
      image_url: document.getElementById("imagem").value
    });
    exibirMsg(msgProduto, "Produto cadastrado com sucesso!", "sucesso");
    document.getElementById("form-produto").reset();
    await atualizarPainel(); // Recarrega a lista de produtos
  } catch (err) {
    exibirMsg(msgProduto, err.message, "erro");
  }
});

// Botão de Sair
btnLogout.addEventListener("click", () => {
  logout();
  window.location.reload();
});

// Inicializa
verificarLogin();