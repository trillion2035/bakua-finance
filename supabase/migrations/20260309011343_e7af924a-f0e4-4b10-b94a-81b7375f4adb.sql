-- Allow admins to view all submissions for analysis
CREATE POLICY "Admins can view all submissions"
  ON public.document_submissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Allow admins to update submission status after analysis
CREATE POLICY "Admins can update submissions"
  ON public.document_submissions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));