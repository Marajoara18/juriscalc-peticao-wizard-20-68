-- Primeiro, remover todas as políticas existentes para a tabela perfis
drop policy if exists "Permitir leitura do próprio perfil" on perfis;
drop policy if exists "Permitir criação do próprio perfil" on perfis;
drop policy if exists "Permitir atualização do próprio perfil" on perfis;
drop policy if exists "Permitir deleção do próprio perfil" on perfis;
drop policy if exists "Usuários podem ver seus próprios perfis" on perfis;
drop policy if exists "Usuários podem editar seus próprios perfis" on perfis;
drop policy if exists "Usuários podem criar seus próprios perfis" on perfis;
drop policy if exists "Usuários podem deletar seus próprios perfis" on perfis;

-- Verificar se a tabela existe e criar se não existir
create table if not exists perfis (
    id uuid references auth.users on delete cascade primary key,
    nome_completo text not null,
    email text not null,
    plano_id text default 'gratuito',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar ou atualizar a trigger para updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

drop trigger if exists update_perfis_updated_at on perfis;
create trigger update_perfis_updated_at
    before update on perfis
    for each row
    execute procedure update_updated_at_column();

-- Habilitar RLS na tabela
alter table perfis enable row level security;

-- Política para permitir todas as operações para usuários autenticados em seus próprios registros
create policy "Gerenciar próprio perfil"
on perfis
for all
using (
    auth.uid() = id
)
with check (
    auth.uid() = id
);

-- Política especial para permitir a criação inicial do perfil
create policy "Permitir criação inicial do perfil"
on perfis
for insert
with check (
    auth.uid() IS NOT NULL
);

-- Garantir que o serviço tenha acesso
alter table perfis FORCE ROW LEVEL SECURITY; 