-- Create storage bucket for project documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can view their own documents (via SPV ownership)
CREATE POLICY "Users can view own project documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can upload their own documents
CREATE POLICY "Users can upload own project documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update own project documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete own project documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add category and doc_type columns to spv_documents for better organization
ALTER TABLE public.spv_documents 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS doc_type TEXT,
ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id);

-- Allow users to insert documents linked to their SPVs
CREATE POLICY "Users can insert documents for own SPVs"
ON public.spv_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM spvs 
    WHERE spvs.id = spv_documents.spv_id 
    AND spvs.owner_id = auth.uid()
  )
);

-- Create a submission_metadata table to store wizard submission info
CREATE TABLE IF NOT EXISTS public.document_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  spv_id UUID REFERENCES public.spvs(id),
  project_description TEXT,
  kyc_signatories JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT
);

-- Enable RLS on document_submissions
ALTER TABLE public.document_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users view own submissions"
ON public.document_submissions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users insert own submissions"
ON public.document_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending submissions
CREATE POLICY "Users update own submissions"
ON public.document_submissions FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');