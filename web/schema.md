create table public.fleet_mag (
  id bigserial not null,
  car_number text not null,
  driver text not null,
  capacity integer not null,
  image_url text null,
  avatar_url text null,
  route_id integer null,
  d_username text null,
  location geography null,
  longitude double precision GENERATED ALWAYS as (extensions.st_x ((location)::extensions.geometry)) STORED null,
  latitude double precision GENERATED ALWAYS as (extensions.st_y ((location)::extensions.geometry)) STORED null,
  d_user_uuid uuid null,
  constraint fleet_mag_pkey primary key (id),
  constraint fk_fleet_user_uuid foreign KEY (d_user_uuid) references users (user_uuid) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_fleetmag_d_user_uuid on public.fleet_mag using btree (d_user_uuid) TABLESPACE pg_default;

create index IF not exists idx_fleetmag_route_id on public.fleet_mag using btree (route_id) TABLESPACE pg_default;

create table public.profiles (
  id uuid not null,
  updated_at timestamp with time zone null,
  email text null,
  username text null,
  full_name text null,
  avatar_url text null,
  website text null,
  role text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_username_key unique (username),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint username_length check ((char_length(username) >= 3))
) TABLESPACE pg_default;

create table public.routes (
  id bigserial not null,
  route_id text not null,
  name text null,
  line_string geometry not null,
  optimize_order jsonb null,
  users jsonb null,
  driver_name text null,
  description text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint routes_pkey primary key (id)
) TABLESPACE pg_default;

create table public.users (
  id bigserial not null,
  user_uuid uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  username text not null,
  location geography null,
  created_at timestamp with time zone null default now(),
  longitude double precision GENERATED ALWAYS as (extensions.st_x ((location)::extensions.geometry)) STORED null,
  latitude double precision GENERATED ALWAYS as (extensions.st_y ((location)::extensions.geometry)) STORED null,
  status boolean null default true,
  last_status_change timestamp with time zone null,
  constraint users_pkey primary key (id, username),
  constraint users_team_code_key unique (username),
  constraint users_user_uuid_key unique (user_uuid)
) TABLESPACE pg_default;

