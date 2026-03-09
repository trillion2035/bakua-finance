
-- Create deployment stage status enum
CREATE TYPE public.deployment_stage_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create SPV deployment stages table
CREATE TABLE public.spv_deployment_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.document_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stage_order INTEGER NOT NULL,
  stage_key TEXT NOT NULL, -- 'spv_doc_creation', 'spv_incorporation', 'facility_doc_creation', 'legal_close'
  stage_label TEXT NOT NULL,
  description TEXT,
  status deployment_stage_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID, -- admin who marked complete
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, stage_key)
);

-- Create generated documents table
CREATE TABLE public.generated_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.document_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stage_key TEXT NOT NULL, -- which deployment stage this belongs to
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'articles_of_association', 'loan_agreement', etc.
  content TEXT, -- AI-generated content
  file_url TEXT, -- stored file URL
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'reviewed', 'approved', 'signed'
  signed_at TIMESTAMPTZ,
  signed_by TEXT,
  signature_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spv_deployment_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- RLS for spv_deployment_stages
CREATE POLICY "Users view own deployment stages" ON public.spv_deployment_stages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage deployment stages" ON public.spv_deployment_stages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for generated_documents
CREATE POLICY "Users view own generated documents" ON public.generated_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage generated documents" ON public.generated_documents
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add deployment_approved column to document_submissions
ALTER TABLE public.document_submissions
  ADD COLUMN IF NOT EXISTS deployment_approved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deployment_approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deployment_approved_by UUID;
