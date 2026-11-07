import { usuarioAtual, logout } from "./api.js";

export function renderNav(paginaAtiva) {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const u = usuarioAtual();
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const qtd = cart.reduce((s, i) => s + i.qtd, 0);

  const links = [
    { href: "index.html", label: "Loja", id: "loja" },
    { href: "carrinho.html", label: `Carrinho${qtd ? ` <span id="cart-count">${qtd}</span>` : ""}`, id: "carrinho" }
  ];

  if (u?.role === "seller" || u?.role === "admin") {
    links.push({ href: "cadastro.html", label: "Minha Loja", id: "cadastro" });
  }
  if (u?.role === "admin") {
    links.push({ href: "admin.html", label: "Admin", id: "admin" });
  }

  let html = links.map(l =>
    `<a href="${l.href}" class="${l.id === paginaAtiva ? "ativo" : ""}">${l.label}</a>`
  ).join("");

  if (u) {
    html += `<a href="#" id="btn-logout">Sair (${u.email.split("@")[0]})</a>`;
  } else {
    html += `<a href="login.html" class="${paginaAtiva === "login" ? "ativo" : ""}">Entrar</a>`;
  }

  nav.innerHTML = html;
  document.getElementById("btn-logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
    window.location.href = "index.html";
  });
}