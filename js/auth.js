import { registrar, login } from "./api.js";
import { renderNav } from "./nav.js";

renderNav("login");

const msgLogin = document.getElementById("msg-login");
const msgCad = document.getElementById("msg-cad");

function mostrar(el, texto, tipo) {
  el.textContent = texto;
  el.className = "msg " + tipo;
}

document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const { user } = await login({
      email: document.getElementById("email-login").value,
      password: document.getElementById("senha-login").value
    });
    mostrar(msgLogin, "Login realizado! Redirecionando...", "sucesso");
    setTimeout(() => {
      window.location.href = user.role === "admin" ? "admin.html" :
                             user.role === "seller" ? "cadastro.html" : "index.html";
    }, 800);
  } catch (err) {
    mostrar(msgLogin, err.message, "erro");
  }
});

document.getElementById("form-cadastro").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await registrar({
      email: document.getElementById("email-cad").value,
      password: document.getElementById("senha-cad").value,
      role: document.getElementById("role-cad").value
    });
    mostrar(msgCad, "Cadastro feito! Faça login.", "sucesso");
    document.getElementById("form-cadastro").reset();
  } catch (err) {
    mostrar(msgCad, err.message, "erro");
  }
});