-- Create industry types enum
CREATE TYPE public.asset_industry AS ENUM (
  'agriculture',
  'real_estate', 
  'trade_finance',
  'infrastructure',
  'renewable_energy'
);

-- Create analysis status enum
CREATE TYPE public.analysis_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

-- Table for storing AI analysis results
CREATE TABLE public.asset_analysis_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.document_submissions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  industry asset_industry NOT NULL DEFAULT 'agriculture',
  
  -- Overall score
  total_score integer NOT NULL DEFAULT 0,
  grade text, -- e.g., 'HS-88', 'HS-60'
  grade_label text, -- 'Standard Grade', 'Premium Grade', 'Fail'
  
  -- Analysis metadata
  analysis_status analysis_status NOT NULL DEFAULT 'pending',
  document_completeness_score integer DEFAULT 0,
  
  -- Dimension scores (JSONB for flexibility across industries)
  score_dimensions jsonb DEFAULT '[]'::jsonb,
  
  -- Document verification log
  document_verification_log jsonb DEFAULT '[]'::jsonb,
  
  -- AI-generated content
  project_summary text,
  recommendations jsonb DEFAULT '[]'::jsonb,
  risk_factors jsonb DEFAULT '[]'::jsonb,
  
  -- Generated PDF paths
  dossier_pdf_path text,
  term_sheet_pdf_path text,
  rejection_report_pdf_path text,
  
  -- Audit trail
  ai_model_version text DEFAULT 'Bakua AI Engine v1.0',
  human_reviewer text,
  reviewed_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create trigger for updated_at
CREATE TRIGGER update_asset_analysis_reports_updated_at
  BEFORE UPDATE ON public.asset_analysis_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.asset_analysis_reports ENABLE ROW LEVEL SECURITY;

-- RLS: Users view own reports
CREATE POLICY "Users view own analysis reports"
  ON public.asset_analysis_reports FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: Admins can manage all reports
CREATE POLICY "Admins manage analysis reports"
  ON public.asset_analysis_reports FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Term sheets table (generated for passing submissions)
CREATE TABLE public.term_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_report_id uuid REFERENCES public.asset_analysis_reports(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  
  -- Term sheet reference
  reference_code text NOT NULL,
  
  -- Extracted/generated data
  transaction_name text,
  facility_amount_fcfa bigint,
  facility_amount_usd text,
  tenor_months integer DEFAULT 36,
  target_irr text,
  effective_rate text,
  
  -- Milestones (JSONB array)
  milestones jsonb DEFAULT '[]'::jsonb,
  
  -- Repayment schedule
  repayment_schedule jsonb DEFAULT '[]'::jsonb,
  
  -- Fees
  fees jsonb DEFAULT '[]'::jsonb,
  
  -- Security package
  security_package jsonb DEFAULT '[]'::jsonb,
  
  -- Conditions precedent
  conditions_precedent jsonb DEFAULT '[]'::jsonb,
  
  -- Events of default
  events_of_default jsonb DEFAULT '[]'::jsonb,
  
  -- PDF path
  pdf_path text,
  
  -- Validity
  valid_until date,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create trigger for updated_at
CREATE TRIGGER update_term_sheets_updated_at
  BEFORE UPDATE ON public.term_sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.term_sheets ENABLE ROW LEVEL SECURITY;

-- RLS: Users view own term sheets
CREATE POLICY "Users view own term sheets"
  ON public.term_sheets FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: Admins can manage all term sheets
CREATE POLICY "Admins manage term sheets"
  ON public.term_sheets FOR ALL
  USING (has_role(auth.uid(), 'admin'));