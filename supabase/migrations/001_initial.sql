-- ============================================================
-- Helden Editorial Calendar — Migration 001 (initial)
-- ============================================================

-- ------------------------------------
-- Enums
-- ------------------------------------
CREATE TYPE public.user_role       AS ENUM ('agencia', 'cliente');
CREATE TYPE public.calendar_status AS ENUM ('rascunho', 'enviado', 'concluido');
CREATE TYPE public.post_status     AS ENUM ('pendente', 'aprovado', 'reprovado', 'ajuste');
CREATE TYPE public.post_type       AS ENUM ('feed', 'story', 'reels', 'carrossel');
CREATE TYPE public.approval_action AS ENUM ('aprovado', 'reprovado', 'ajuste');

-- ------------------------------------
-- clients
-- ------------------------------------
CREATE TABLE public.clients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  logo_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------
-- profiles (espelha auth.users)
-- ------------------------------------
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       public.user_role NOT NULL DEFAULT 'cliente',
  client_id  UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  full_name  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cria profile automaticamente ao criar usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, client_id, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'cliente'),
    NULLIF(NEW.raw_user_meta_data->>'client_id', '')::UUID,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------
-- calendars
-- ------------------------------------
CREATE TABLE public.calendars (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  reference_month DATE,                          -- primeiro dia do mês de referência
  status          public.calendar_status NOT NULL DEFAULT 'rascunho',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------
-- posts
-- ------------------------------------
CREATE TABLE public.posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id    UUID NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
  position       INTEGER NOT NULL DEFAULT 0,
  image_url      TEXT,
  caption        TEXT,
  post_type      public.post_type,
  scheduled_date DATE,
  status         public.post_status NOT NULL DEFAULT 'pendente',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER posts_set_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------
-- approval_history
-- ------------------------------------
CREATE TABLE public.approval_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  action       public.approval_action NOT NULL,
  comment      TEXT,                          -- obrigatório via app quando action = 'ajuste'
  responded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Garante comentário quando a ação é ajuste
  CONSTRAINT comment_required_for_ajuste
    CHECK (action <> 'ajuste' OR (comment IS NOT NULL AND comment <> ''))
);

-- ------------------------------------
-- Índices úteis
-- ------------------------------------
CREATE INDEX idx_calendars_client_id  ON public.calendars(client_id);
CREATE INDEX idx_posts_calendar_id    ON public.posts(calendar_id);
CREATE INDEX idx_approval_post_id     ON public.approval_history(post_id);
CREATE INDEX idx_profiles_client_id   ON public.profiles(client_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendars        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- ------------------------------------
-- Helper: retorna o role do usuário atual
-- ------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper: retorna o client_id do usuário atual
CREATE OR REPLACE FUNCTION public.current_client_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ------------------------------------
-- clients
-- ------------------------------------
-- Agência: acesso total
CREATE POLICY "agencia_all_clients" ON public.clients
  FOR ALL
  USING  (public.current_user_role() = 'agencia')
  WITH CHECK (public.current_user_role() = 'agencia');

-- Cliente: lê somente o próprio client
CREATE POLICY "cliente_read_own_client" ON public.clients
  FOR SELECT
  USING (id = public.current_client_id());

-- ------------------------------------
-- profiles
-- ------------------------------------
CREATE POLICY "agencia_all_profiles" ON public.profiles
  FOR ALL
  USING  (public.current_user_role() = 'agencia')
  WITH CHECK (public.current_user_role() = 'agencia');

-- Cada usuário lê/edita o próprio profile
CREATE POLICY "own_profile" ON public.profiles
  FOR ALL
  USING  (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ------------------------------------
-- calendars
-- ------------------------------------
CREATE POLICY "agencia_all_calendars" ON public.calendars
  FOR ALL
  USING  (public.current_user_role() = 'agencia')
  WITH CHECK (public.current_user_role() = 'agencia');

-- Cliente: lê apenas calendários enviados/concluídos do próprio client
CREATE POLICY "cliente_read_own_calendars" ON public.calendars
  FOR SELECT
  USING (
    client_id = public.current_client_id()
    AND status IN ('enviado', 'concluido')
  );

-- ------------------------------------
-- posts
-- ------------------------------------
CREATE POLICY "agencia_all_posts" ON public.posts
  FOR ALL
  USING  (public.current_user_role() = 'agencia')
  WITH CHECK (public.current_user_role() = 'agencia');

-- Cliente: lê posts de calendários do próprio client (enviado/concluido)
CREATE POLICY "cliente_read_own_posts" ON public.posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.calendars c
      WHERE c.id = calendar_id
        AND c.client_id = public.current_client_id()
        AND c.status IN ('enviado', 'concluido')
    )
  );

-- ------------------------------------
-- approval_history
-- ------------------------------------
CREATE POLICY "agencia_all_history" ON public.approval_history
  FOR ALL
  USING  (public.current_user_role() = 'agencia')
  WITH CHECK (public.current_user_role() = 'agencia');

-- Cliente: lê histórico dos próprios posts
CREATE POLICY "cliente_read_own_history" ON public.approval_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.calendars c ON c.id = p.calendar_id
      WHERE p.id = post_id
        AND c.client_id = public.current_client_id()
    )
  );

-- Cliente: insere respostas em posts de calendários enviados/concluídos
CREATE POLICY "cliente_insert_history" ON public.approval_history
  FOR INSERT
  WITH CHECK (
    responded_by = auth.uid()
    AND public.current_user_role() = 'cliente'
    AND EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.calendars c ON c.id = p.calendar_id
      WHERE p.id = post_id
        AND c.client_id = public.current_client_id()
        AND c.status IN ('enviado', 'concluido')
    )
  );
