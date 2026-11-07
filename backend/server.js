const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CONEXÃO COM O MYSQL (Altere sua senha aqui)
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'SUA_SENHA_AQUI', 
  database: 'zyra_db',
  waitForConnections: true,
  connectionLimit: 10
});

// ================= ROTAS DE PRODUTOS =================
// Listar todos
app.get('/api/products', (req, res) => {
  const sql = `
    SELECT p.*, s.store_name 
    FROM products p 
    JOIN sellers s ON p.seller_id = s.id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Criar produto
app.post('/api/products', (req, res) => {
  const { seller_id, name, description, price, stock, image_url } = req.body;
  const sql = `INSERT INTO products (seller_id, name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [seller_id, name, description, price, stock, image_url], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// ================= ROTAS DE LOJAS =================
// Criar loja
app.post('/api/sellers', (req, res) => {
  const { user_id, store_name, description, address, whatsapp } = req.body;
  const sql = `INSERT INTO sellers (user_id, store_name, description, address, whatsapp) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [user_id, store_name, description, address, whatsapp], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// Buscar loja por usuário
app.get('/api/sellers/:userId', (req, res) => {
  db.query('SELECT * FROM sellers WHERE user_id = ?', [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || null);
  });
});

// ================= ROTAS DE LOGIN/CADASTRO =================
app.post('/api/register', (req, res) => {
  const { email, password, role } = req.body;
  db.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, password, role], (err, result) => {
    if (err) return res.status(500).json({ error: "Email já cadastrado." });
    res.json({ id: result.insertId, email, role });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: "Credenciais inválidas" });
    const user = results[0];
    res.json({ id: user.id, email: user.email, role: user.role });
  });
});

// ================= ROTAS DE PEDIDOS =================
app.post('/api/orders', (req, res) => {
  const { buyer_id, seller_id, total, delivery_address, items } = req.body;
  
  db.query('INSERT INTO orders (buyer_id, seller_id, total, delivery_address) VALUES (?, ?, ?, ?)', 
  [buyer_id, seller_id, total, delivery_address], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const orderId = result.insertId;

    const orderItems = items.map(i => [orderId, i.id, i.qtd, i.price]);
    db.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?', [orderItems], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ id: orderId, message: "Pedido criado!" });
    });
  });
});

app.listen(3000, () => {
  console.log('Servidor Zyra rodando na porta 3000');
});