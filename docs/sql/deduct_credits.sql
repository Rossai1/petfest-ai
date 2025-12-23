-- Deduz créditos de forma atômica e retorna o novo saldo.
-- Retorna NULL quando não há créditos suficientes.
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount integer
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_credits integer;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'p_amount must be positive';
  end if;

  update public.users
  set credits = credits - p_amount
  where id = p_user_id
    and credits >= p_amount
  returning credits into new_credits;

  return new_credits;
end;
$$;

grant execute on function public.deduct_credits(uuid, integer) to anon, authenticated;
