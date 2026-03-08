
-- ============================================
-- 1. ENUMS
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'project_owner', 'investor');
CREATE TYPE public.spv_status AS ENUM ('draft', 'active', 'funded', 'distributing', 'matured', 'closed');
CREATE TYPE public.milestone_status AS ENUM ('pending', 'disbursed');
CREATE TYPE public.investment_status AS ENUM ('active', 'distributing', 'matured');
CREATE TYPE public.oracle_event_type AS ENUM ('payment_received', 'payment_confirmed', 'milestone_verified', 'sensor_alert', 'threshold_breach', 'disbursement_triggered', 'compliance_check');
CREATE TYPE public.oracle_event_status AS ENUM ('confirmed', 'pending', 'failed');
CREATE TYPE public.sensor_status AS ENUM ('normal', 'warning', 'critical');

-- ============================================
-- 2. UTILITY FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- 3. PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. USER ROLES
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============================================
-- 5. SPVs
-- ============================================
CREATE TABLE public.spvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spv_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  full_legal_name TEXT,
  registration_no TEXT,
  jurisdiction TEXT,
  company_type TEXT,
  registered_office TEXT,
  incorporation_date TEXT,
  capital_social TEXT,
  shareholder TEXT,
  network TEXT,
  auditor TEXT,
  status spv_status NOT NULL DEFAULT 'draft',
  asset_type TEXT,
  description TEXT,
  target_amount BIGINT,
  target_amount_usd TEXT,
  funded_amount BIGINT DEFAULT 0,
  funded_percent NUMERIC(5,2) DEFAULT 0,
  total_investors INTEGER DEFAULT 0,
  listing_date TEXT,
  fully_funded_date TEXT,
  total_disbursed BIGINT DEFAULT 0,
  disbursed_percent NUMERIC(5,2) DEFAULT 0,
  remaining_in_vault BIGINT DEFAULT 0,
  dsra_reserve TEXT,
  target_irr TEXT,
  projected_irr TEXT,
  currency TEXT DEFAULT 'FCFA',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spvs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_spvs_updated_at BEFORE UPDATE ON public.spvs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. SPV SCORE DIMENSIONS
-- ============================================
CREATE TABLE public.spv_score_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  raw_input TEXT,
  standardized_output TEXT,
  weight TEXT,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spv_score_dimensions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. SPV MILESTONES
-- ============================================
CREATE TABLE public.spv_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE NOT NULL,
  milestone_code TEXT NOT NULL,
  name TEXT NOT NULL,
  amount TEXT,
  amount_raw BIGINT,
  recipients TEXT,
  oracle_trigger TEXT,
  date_disbursed TEXT,
  status milestone_status NOT NULL DEFAULT 'pending',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spv_milestones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. SPV DOCUMENTS
-- ============================================
CREATE TABLE public.spv_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  purpose TEXT,
  parties TEXT,
  signed_date TEXT,
  file_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spv_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. SPV CONTRACTS
-- ============================================
CREATE TABLE public.spv_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  deployed_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spv_contracts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. INVESTMENTS
-- ============================================
CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE NOT NULL,
  amount_invested NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  current_value NUMERIC(18,2),
  status investment_status NOT NULL DEFAULT 'active',
  invested_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_distribution TEXT,
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 11. TRANSACTIONS
-- ============================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  amount TEXT NOT NULL,
  tx_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 12. ORACLE EVENTS
-- ============================================
CREATE TABLE public.oracle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE NOT NULL,
  event_type oracle_event_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status oracle_event_status NOT NULL DEFAULT 'pending',
  tx_hash TEXT,
  amount BIGINT,
  currency TEXT,
  payment_channel JSONB,
  source TEXT,
  metadata JSONB,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.oracle_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 13. SENSOR READINGS
-- ============================================
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  location TEXT,
  metric TEXT NOT NULL,
  unit TEXT,
  value NUMERIC(10,2) NOT NULL,
  threshold_min NUMERIC(10,2),
  threshold_max NUMERIC(10,2),
  status sensor_status NOT NULL DEFAULT 'normal',
  reading_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 14. MONTHLY FINANCIALS
-- ============================================
CREATE TABLE public.monthly_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  revenue BIGINT DEFAULT 0,
  operating_cost BIGINT DEFAULT 0,
  net_margin NUMERIC(5,2) DEFAULT 0,
  collections BIGINT DEFAULT 0,
  collection_rate NUMERIC(5,2) DEFAULT 0,
  tx_count INTEGER DEFAULT 0,
  loan_repayment BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.monthly_financials ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 15. NOTIFICATIONS
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 16. HARVEST DATA
-- ============================================
CREATE TABLE public.harvest_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  cherry_intake INTEGER DEFAULT 0,
  green_yield INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  grade_a_percent NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.harvest_data ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 17. NDVI READINGS
-- ============================================
CREATE TABLE public.ndvi_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE NOT NULL,
  reading_date TEXT NOT NULL,
  value NUMERIC(4,2) NOT NULL,
  source TEXT DEFAULT 'Sentinel-2',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ndvi_readings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 18. INVESTOR SEGMENTS
-- ============================================
CREATE TABLE public.investor_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id UUID REFERENCES public.spvs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  usdc_raised TEXT,
  fcfa_equivalent TEXT,
  percent_of_spv TEXT,
  investor_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investor_segments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 19. RLS POLICIES
-- ============================================

-- Profiles: users read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User roles: viewable by own user or admin
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- SPVs: public read, owners manage their own
CREATE POLICY "SPVs are publicly readable" ON public.spvs FOR SELECT USING (true);
CREATE POLICY "Owners can insert SPVs" ON public.spvs FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own SPVs" ON public.spvs FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own SPVs" ON public.spvs FOR DELETE USING (auth.uid() = owner_id);

-- SPV sub-tables: public read, owner write (via spv ownership)
-- Score dimensions
CREATE POLICY "Score dimensions publicly readable" ON public.spv_score_dimensions FOR SELECT USING (true);
CREATE POLICY "Owners manage score dimensions" ON public.spv_score_dimensions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.spvs WHERE id = spv_id AND owner_id = auth.uid())
);

-- Milestones
CREATE POLICY "Milestones publicly readable" ON public.spv_milestones FOR SELECT USING (true);
CREATE POLICY "Owners manage milestones" ON public.spv_milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM public.spvs WHERE id = spv_id AND owner_id = auth.uid())
);

-- Documents
CREATE POLICY "Documents publicly readable" ON public.spv_documents FOR SELECT USING (true);
CREATE POLICY "Owners manage documents" ON public.spv_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.spvs WHERE id = spv_id AND owner_id = auth.uid())
);

-- Contracts
CREATE POLICY "Contracts publicly readable" ON public.spv_contracts FOR SELECT USING (true);
CREATE POLICY "Owners manage contracts" ON public.spv_contracts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.spvs WHERE id = spv_id AND owner_id = auth.uid())
);

-- Investments: investors see own, owners see their SPV investments
CREATE POLICY "Investors view own investments" ON public.investments FOR SELECT USING (auth.uid() = investor_id);
CREATE POLICY "Investors can insert investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = investor_id);
CREATE POLICY "SPV owners view investments" ON public.investments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.spvs WHERE id = spv_id AND owner_id = auth.uid())
);

-- Transactions: investors see own
CREATE POLICY "Investors view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = investor_id);
CREATE POLICY "Investors can insert transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- Oracle events: public read
CREATE POLICY "Oracle events publicly readable" ON public.oracle_events FOR SELECT USING (true);
CREATE POLICY "Owners manage oracle events" ON public.oracle_events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.spvs WHERE id = spv_id AND owner_id = auth.uid())
);

-- Sensor readings: public read
CREATE POLICY "Sensor readings publicly readable" ON public.sensor_readings FOR SELECT USING (true);
CREATE POLICY "Owners manage sensor readings" ON public.sensor_readings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.spvs WHERE id = spv_id AND owner_id = auth.uid())
);

-- Monthly financials: public read
CREATE POLICY "Monthly financials publicly readable" ON public.monthly_financials FOR SELECT USING (true);
CREATE POLICY "Owners manage monthly financials" ON public.monthly_financials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.spvs WHERE id = spv_id AND owner_id = auth.uid())
);

-- Notifications: users see own
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Harvest data: public read
CREATE POLICY "Harvest data publicly readable" ON public.harvest_data FOR SELECT USING (true);
CREATE POLICY "Owners manage harvest data" ON public.harvest_data FOR ALL USING (
  EXISTS (SELECT 1 FROM public.spvs WHERE id = spv_id AND owner_id = auth.uid())
);

-- NDVI readings: public read
CREATE POLICY "NDVI readings publicly readable" ON public.ndvi_readings FOR SELECT USING (true);
CREATE POLICY "Owners manage NDVI readings" ON public.ndvi_readings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.spvs WHERE id = spv_id AND owner_id = auth.uid())
);

-- Investor segments: public read
CREATE POLICY "Investor segments publicly readable" ON public.investor_segments FOR SELECT USING (true);
CREATE POLICY "Owners manage investor segments" ON public.investor_segments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.spvs WHERE id = spv_id AND owner_id = auth.uid())
);

-- ============================================
-- 20. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
