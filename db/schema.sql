-- ============================================================
--  Serap Ercan B2B — Vercel Postgres şeması
--  Vercel > Storage > (Postgres) > Query bölümüne yapıştırıp çalıştır.
-- ============================================================

-- ÜYELER ----------------------------------------------------
create table if not exists users (
  id            serial primary key,
  company_name  text,
  tax_no        text,
  full_name     text not null,
  email         text unique not null,
  phone         text,
  password_hash text not null,
  requested_type text default 'perakende',          -- üyenin talep ettiği tip
  status        text default 'pending'               -- pending | approved | rejected
                  check (status in ('pending','approved','rejected')),
  tier          text                                 -- perakende | temsilci (admin atar)
                  check (tier in ('perakende','temsilci')),
  is_admin      boolean default false,
  created_at    timestamptz default now()
);

-- ÜRÜNLER ---------------------------------------------------
create table if not exists products (
  id              serial primary key,
  title           text not null,
  description     text,
  image_url       text,
  category        text,
  badge           text,
  price_perakende numeric default 0,
  price_temsilci  numeric default 0,
  in_stock        boolean default true,
  rating          numeric default 0,
  review_count    integer default 0,
  created_at      timestamptz default now()
);

-- SİPARİŞ TALEPLERİ -----------------------------------------
create table if not exists orders (
  id            serial primary key,
  code          text unique not null,
  user_id       integer references users(id) on delete set null,
  items         jsonb,
  total         numeric,
  status        text default 'Onay bekliyor',
  customer_name text,
  phone         text,
  email         text,
  address       text,
  note          text,
  created_at    timestamptz default now()
);

-- ============================================================
--  KURULUM SONRASI: kendi admin hesabını oluştur
--  1) Siteden /kayit ile bu e-posta ile kayıt ol
--  2) Sonra aşağıdaki satırı (e-postayı kendi adminininle değiştirip) çalıştır:
-- update users set is_admin = true, status = 'approved', tier = 'temsilci'
--   where email = 'serapercan@gmail.com';
-- ============================================================
