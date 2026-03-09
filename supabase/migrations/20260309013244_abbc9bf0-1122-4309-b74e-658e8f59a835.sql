ALTER TABLE public.document_submissions 
ADD COLUMN IF NOT EXISTS released_to_client boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS released_at timestamp with time zone DEFAULT null;