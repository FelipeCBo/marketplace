import { listarLojas, listarPedidos } from "./api.js";
import { renderNav } from "./nav.js";

renderNav("admin");

async function carregar() {
  const lojas = await listarLojas();
  const tbLojas = document.querySelector("#tabela-lojas tbody");
  tbLojas.innerHTML = lojas.length ? lojas.map(l => `
    <tr>
      <td>${l.store_name}</td>
      <td>${l.address || "-"}</td>
      <td>${l.whatsapp || "-"}</td>
      <td><span class="badge ${l.status}">${l.status}</span></td>
    </tr>
  `).join("") : `<tr><td colspan="4" style="text-align:center;color:#656d76">Nenhuma loja cadastrada.</td></tr>`;

  const pedidos = await listarPedidos();
  const tbPedidos = document.querySelector("#tabela-pedidos tbody");
  tbPedidos.innerHTML = pedidos.length ? pedidos.map(p => `
    <tr>
      <td>#${p.id}</td>
      <td>R$ ${Number(p.total).toFixed(2)}</td>
      <td><span class="badge ${p.status}">${p.status}</span></td>
      <td>${p.delivery_address || "-"}</td>
      <td>${new Date(p.created_at).toLocaleString("pt-BR")}</td>
    </tr>
  `).join("") : `<tr><td colspan="5" style="text-align:center;color:#656d76">Nenhum pedido ainda.</td></tr>`;
}

carregar();