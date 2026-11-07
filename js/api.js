const API_URL = 'http://localhost:3000/api';

export function getUsuario() {
  return JSON.parse(localStorage.getItem("user") || "null");
}

export function logout() {
  localStorage.removeItem("user");
}

export async function login({ email, password }) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error("Email ou senha inválidos");
  const user = await res.json();
  localStorage.setItem("user", JSON.stringify(user));
  return user;
}

export async function registrar({ email, password, role }) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  if (!res.ok) throw new Error("Erro ao criar conta");
  return res.json();
}

export async function listarProdutos() {
  const res = await fetch(`${API_URL}/products`);
  return res.json();
}

export async function criarProduto({ name, description, price, stock, image_url }) {
  const user = getUsuario();
  const loja = await minhaLoja();
  if (!loja) throw new Error("Crie sua loja primeiro");

  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      seller_id: loja.id, name, description, price, stock, image_url 
    })
  });
  return res.json();
}

export async function criarLoja({ store_name, description, address, whatsapp }) {
  const user = getUsuario();
  const res = await fetch(`${API_URL}/sellers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      user_id: user.id, store_name, description, address, whatsapp 
    })
  });
  return res.json();
}

export async function minhaLoja() {
  const user = getUsuario();
  if (!user) return null;
  const res = await fetch(`${API_URL}/sellers/${user.id}`);
  return res.json();
}

export async function criarPedido({ items, delivery_address }) {
  const user = getUsuario();
  if (!user) throw new Error("Faça login para finalizar o pedido");
  
  // Descobre o seller_id a partir do primeiro produto
  const todos = await listarProdutos();
  const p = todos.find(prod => prod.id === items[0].id);
  const total = items.reduce((acc, i) => acc + (i.price * i.qtd), 0);

  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      buyer_id: user.id, seller_id: p.seller_id, total, delivery_address, items 
    })
  });
  if (!res.ok) throw new Error("Erro ao finalizar pedido");
  return res.json();
}