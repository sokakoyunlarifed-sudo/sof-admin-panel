-- Add video_url to news
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Create news_images table
CREATE TABLE IF NOT EXISTS public.news_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_news_images_news_id ON public.news_images(news_id);
