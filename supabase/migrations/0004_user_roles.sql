-- Add role tracking to profiles for quick admin/employer checks
alter table profiles add column if not exists role text not null default 'employer' check (role in ('employer', 'admin'));
alter table profiles add column if not exists is_active boolean not null default true;
