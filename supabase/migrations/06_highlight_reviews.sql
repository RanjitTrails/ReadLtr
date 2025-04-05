-- Create highlight_reviews table for spaced repetition
CREATE TABLE IF NOT EXISTS public.highlight_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  highlight_id UUID REFERENCES public.highlights(id) ON DELETE CASCADE NOT NULL,
  next_review_date TIMESTAMP WITH TIME ZONE NOT NULL,
  repetition_number INTEGER DEFAULT 0 NOT NULL,
  ease_factor FLOAT DEFAULT 2.5 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS highlight_reviews_user_id_idx ON public.highlight_reviews(user_id);
CREATE INDEX IF NOT EXISTS highlight_reviews_highlight_id_idx ON public.highlight_reviews(highlight_id);
CREATE INDEX IF NOT EXISTS highlight_reviews_next_review_date_idx ON public.highlight_reviews(next_review_date);

-- Create unique constraint to prevent duplicate reviews
CREATE UNIQUE INDEX IF NOT EXISTS highlight_reviews_user_highlight_idx ON public.highlight_reviews(user_id, highlight_id);

-- Add RLS policies
ALTER TABLE public.highlight_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own highlight reviews"
  ON public.highlight_reviews
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own highlight reviews"
  ON public.highlight_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlight reviews"
  ON public.highlight_reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlight reviews"
  ON public.highlight_reviews
  FOR DELETE
  USING (auth.uid() = user_id);
