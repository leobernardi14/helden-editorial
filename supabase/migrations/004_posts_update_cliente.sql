-- Migration 004: policy UPDATE em posts para o cliente
-- Permite que o cliente atualize status dos próprios posts em calendários liberados.
-- Execute no SQL Editor do Supabase.

CREATE POLICY "cliente_update_own_posts"
ON public.posts
FOR UPDATE
USING (
  public.current_user_role() = 'cliente'
  AND EXISTS (
    SELECT 1 FROM public.calendars c
    WHERE c.id = calendar_id
      AND c.client_id = public.current_client_id()
      AND c.status IN ('enviado', 'concluido')
  )
)
WITH CHECK (
  public.current_user_role() = 'cliente'
  AND EXISTS (
    SELECT 1 FROM public.calendars c
    WHERE c.id = calendar_id
      AND c.client_id = public.current_client_id()
      AND c.status IN ('enviado', 'concluido')
  )
);
