-- Seed automático de cuenta, categorías y medios de pago por defecto para cada usuario nuevo.

create function public.seed_default_user_data()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_account_id uuid;
begin
  insert into public.accounts (user_id, name, type)
  values (new.id, 'Principal', 'banco')
  returning id into v_account_id;

  update public.profiles set default_account_id = v_account_id where id = new.id;

  insert into public.payment_methods (user_id, name) values
    (new.id, 'Efectivo'),
    (new.id, 'Tarjeta débito'),
    (new.id, 'Tarjeta crédito'),
    (new.id, 'Transferencia');

  insert into public.categories (user_id, name, icon, color, type, sort_order) values
    (new.id, 'Vacaciones', 'plane', '#eab308', 'gasto', 1),
    (new.id, 'Alimentación', 'utensils', '#38bdf8', 'gasto', 2),
    (new.id, 'Transporte', 'bus', '#2563eb', 'gasto', 3),
    (new.id, 'JODA', 'party', '#f97316', 'gasto', 4),
    (new.id, 'Creaciones', 'bar-chart', '#3b82f6', 'gasto', 5),
    (new.id, 'Gastos personales', 'scissors', '#84cc16', 'gasto', 6),
    (new.id, 'Préstamo', 'link', '#1d4ed8', 'gasto', 7),
    (new.id, 'Educación', 'graduation-cap', '#ec4899', 'gasto', 8),
    (new.id, 'Otros', 'help-circle', '#ef4444', 'gasto', 9);

  insert into public.categories (user_id, name, icon, color, type, sort_order) values
    (new.id, 'Salario', 'coins', '#2563eb', 'ingreso', 1),
    (new.id, 'Otros', 'help-circle', '#22c55e', 'ingreso', 2);

  return new;
end;
$$;

create trigger on_profile_created_seed_defaults
  after insert on public.profiles
  for each row execute procedure public.seed_default_user_data();
