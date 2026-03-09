
CREATE TABLE public.term_sheet_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  submission_id uuid REFERENCES public.document_submissions(id) ON DELETE CASCADE NOT NULL,
  analysis_report_id uuid REFERENCES public.asset_analysis_reports(id) ON DELETE CASCADE NOT NULL,
  signature_type text NOT NULL CHECK (signature_type IN ('draw', 'type', 'upload')),
  signature_data text NOT NULL,
  signer_name text NOT NULL,
  signed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.term_sheet_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own signatures"
  ON public.term_sheet_signatures
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own signatures"
  ON public.term_sheet_signatures
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all signatures"
  ON public.term_sheet_signatures
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
