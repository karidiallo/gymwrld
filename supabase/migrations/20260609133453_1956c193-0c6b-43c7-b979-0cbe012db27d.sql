CREATE TABLE IF NOT EXISTS public.recipes (
  id text PRIMARY KEY,
  title text NOT NULL,
  kcal integer NOT NULL CHECK (kcal >= 0),
  time_minutes integer NOT NULL CHECK (time_minutes > 0),
  category text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  protein integer NOT NULL DEFAULT 0 CHECK (protein >= 0),
  carbs integer NOT NULL DEFAULT 0 CHECK (carbs >= 0),
  fat integer NOT NULL DEFAULT 0 CHECK (fat >= 0),
  ingredients text[] NOT NULL DEFAULT '{}',
  steps text[] NOT NULL DEFAULT '{}',
  image_url text NOT NULL,
  image_alt text NOT NULL,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recipes TO anon;
GRANT SELECT ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Recipes are public" ON public.recipes;
CREATE POLICY "Recipes are public" ON public.recipes FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.user_app_state (
  user_id uuid NOT NULL,
  module text NOT NULL CHECK (module IN ('training','diet','steps','tasks','profile','cycle','measurements','recovery','runs','street','avatar','nutrition')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, module)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_app_state TO authenticated;
GRANT ALL ON public.user_app_state TO service_role;
ALTER TABLE public.user_app_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own app state" ON public.user_app_state;
CREATE POLICY "Users manage own app state" ON public.user_app_state FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_recipes_updated_at ON public.recipes;
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_app_state_updated_at ON public.user_app_state;
CREATE TRIGGER update_user_app_state_updated_at BEFORE UPDATE ON public.user_app_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();