
-- Add unique constraint on profiles.user_id for ON CONFLICT support
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Function to complete signup: create profile + assign role
CREATE OR REPLACE FUNCTION public.complete_signup(
  _full_name text,
  _company_name text DEFAULT NULL,
  _role app_role DEFAULT 'project_owner'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, company_name)
  VALUES (auth.uid(), _full_name, _company_name)
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
