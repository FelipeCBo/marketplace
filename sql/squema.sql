-- Lojas
create table sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  store_name text not null,
  description text,
  address text,
  whatsapp text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Categorias
create table categories (
  id serial primary key,
  name text not null unique
);
insert into categories (name) values
  ('Alimentação'), ('Moda'), ('Casa'), ('Serviços'), ('Outros');

-- Produtos
create table products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers not null,
  category_id int references categories,
  name text not null,
  description text,
  price decimal(10,2) not null,
  stock int default 0,
  image_url text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Pedidos
create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references auth.users not null,
  seller_id uuid references sellers not null,
  status text default 'pending',
  total decimal(10,2) not null,
  delivery_address text,
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders not null,
  product_id uuid references products not null,
  quantity int not null,
  unit_price decimal(10,2) not null
);

-- ===== RLS =====
alter table sellers enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Todos leem lojas e produtos ativos
create policy "leitura publica sellers" on sellers for select using (true);
create policy "leitura publica products" on products for select using (status = 'active');

-- Lojista gerencia sua própria loja
create policy "lojista insere sua loja" on sellers for insert
  with check (auth.uid() = user_id);
create policy "lojista edita sua loja" on sellers for update
  using (auth.uid() = user_id);

-- Lojista gerencia seus produtos
create policy "lojista insere produtos" on products for insert
  with check (seller_id in (select id from sellers where user_id = auth.uid()));
create policy "lojista edita produtos" on products for update
  using (seller_id in (select id from sellers where user_id = auth.uid()));

-- Pedidos: comprador vê os seus, lojista vê os da sua loja
create policy "comprador ve seus pedidos" on orders for select
  using (auth.uid() = buyer_id or seller_id in (select id from sellers where user_id = auth.uid()));
create policy "comprador cria pedido" on orders for insert
  with check (auth.uid() = buyer_id);

create policy "itens do pedido" on order_items for select using (true);
create policy "insere itens" on order_items for insert with check (true);