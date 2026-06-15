-- ============================================================
--  Serap Ercan B2B — MySQL şeması (Alastyr cPanel)
--  cPanel > phpMyAdmin > (veritabanını seç) > SQL sekmesine
--  yapıştırıp çalıştır.
-- ============================================================

-- ÜYELER ----------------------------------------------------
create table if not exists users (
  id             int auto_increment primary key,
  company_name   varchar(255),
  tax_no         varchar(64),
  full_name      varchar(255) not null,
  email          varchar(191) unique not null,
  phone          varchar(32) unique not null,   -- her üye tek telefonla kayıt olur
  password_hash  varchar(255) not null,
  requested_type varchar(32) default 'perakende',   -- üyenin talep ettiği tip
  status         varchar(16) default 'pending',     -- pending | approved | rejected
  tier           varchar(16),                       -- perakende | temsilci (admin atar)
  note           text,                              -- yöneticinin üyeye özel notu
  is_admin       boolean default false,
  created_at     timestamp default current_timestamp
) engine=InnoDB default charset=utf8mb4;

-- ÜRÜNLER ---------------------------------------------------
create table if not exists products (
  id              int auto_increment primary key,
  title           varchar(255) not null,
  description     text,
  image_url       text,
  category        varchar(128),
  badge           varchar(64),
  price_perakende decimal(10,2) default 0,
  price_temsilci  decimal(10,2) default 0,
  in_stock        boolean default true,
  rating          decimal(3,2) default 0,
  review_count    int default 0,
  created_at      timestamp default current_timestamp
) engine=InnoDB default charset=utf8mb4;

-- SİPARİŞ TALEPLERİ -----------------------------------------
create table if not exists orders (
  id            int auto_increment primary key,
  code          varchar(64) unique not null,
  user_id       int,
  items         json,
  total         decimal(10,2),
  status        varchar(32) default 'Onay bekliyor',
  customer_name varchar(255),
  phone         varchar(64),
  email         varchar(255),
  address       text,
  note          text,
  created_at    timestamp default current_timestamp,
  constraint fk_orders_user foreign key (user_id)
    references users(id) on delete set null
) engine=InnoDB default charset=utf8mb4;

-- ============================================================
--  KURULUM SONRASI: kendi admin hesabını oluştur
--  1) Siteden /kayit ile bu e-posta ile kayıt ol
--  2) Sonra aşağıdaki satırı (e-postayı kendi adminininle değiştirip) çalıştır:
-- update users set is_admin = true, status = 'approved', tier = 'temsilci'
--   where email = 'serapercan71@gmail.com';
-- ============================================================
