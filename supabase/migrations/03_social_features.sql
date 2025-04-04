-- Add social features to the database schema

-- Update profiles table with social fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS twitter_username TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    cover_image_url TEXT,
    article_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0
);

-- Create collection_articles junction table
CREATE TABLE IF NOT EXISTS public.collection_articles (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (collection_id, article_id)
);

-- Create follows table for user relationships
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);

-- Create article_likes table
CREATE TABLE IF NOT EXISTS public.article_likes (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, article_id)
);

-- Create collection_likes table
CREATE TABLE IF NOT EXISTS public.collection_likes (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, collection_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0
);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, comment_id)
);

-- Update articles table with social fields
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create RLS policies for social features

-- Collections policies
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public collections"
ON public.collections
FOR SELECT
USING (is_public = TRUE);

CREATE POLICY "Users can view their own collections"
ON public.collections
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own collections"
ON public.collections
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own collections"
ON public.collections
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own collections"
ON public.collections
FOR DELETE
USING (user_id = auth.uid());

-- Collection articles policies
ALTER TABLE public.collection_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public collection articles"
ON public.collection_articles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.collections
        WHERE collections.id = collection_articles.collection_id
        AND (collections.is_public = TRUE OR collections.user_id = auth.uid())
    )
);

CREATE POLICY "Users can insert into their own collections"
ON public.collection_articles
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.collections
        WHERE collections.id = collection_articles.collection_id
        AND collections.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete from their own collections"
ON public.collection_articles
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.collections
        WHERE collections.id = collection_articles.collection_id
        AND collections.user_id = auth.uid()
    )
);

-- Follows policies
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follows"
ON public.follows
FOR SELECT
USING (TRUE);

CREATE POLICY "Users can follow others"
ON public.follows
FOR INSERT
WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can unfollow"
ON public.follows
FOR DELETE
USING (follower_id = auth.uid());

-- Article likes policies
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view article likes"
ON public.article_likes
FOR SELECT
USING (TRUE);

CREATE POLICY "Users can like articles"
ON public.article_likes
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike articles"
ON public.article_likes
FOR DELETE
USING (user_id = auth.uid());

-- Collection likes policies
ALTER TABLE public.collection_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collection likes"
ON public.collection_likes
FOR SELECT
USING (TRUE);

CREATE POLICY "Users can like collections"
ON public.collection_likes
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike collections"
ON public.collection_likes
FOR DELETE
USING (user_id = auth.uid());

-- Comments policies
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on public articles"
ON public.comments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.articles
        WHERE articles.id = comments.article_id
        AND (articles.is_public = TRUE OR articles.user_id = auth.uid())
    )
);

CREATE POLICY "Users can insert comments"
ON public.comments
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
USING (user_id = auth.uid());

-- Comment likes policies
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comment likes"
ON public.comment_likes
FOR SELECT
USING (TRUE);

CREATE POLICY "Users can like comments"
ON public.comment_likes
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike comments"
ON public.comment_likes
FOR DELETE
USING (user_id = auth.uid());

-- Create functions for social features

-- Function to update article counts
CREATE OR REPLACE FUNCTION update_article_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.articles
        SET like_count = like_count + 1
        WHERE id = NEW.article_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.articles
        SET like_count = like_count - 1
        WHERE id = OLD.article_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update collection counts
CREATE OR REPLACE FUNCTION update_collection_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.collections
        SET like_count = like_count + 1
        WHERE id = NEW.collection_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.collections
        SET like_count = like_count - 1
        WHERE id = OLD.collection_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.comments
        SET like_count = like_count + 1
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.comments
        SET like_count = like_count - 1
        WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update article comment counts
CREATE OR REPLACE FUNCTION update_article_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.articles
        SET comment_count = comment_count + 1
        WHERE id = NEW.article_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.articles
        SET comment_count = comment_count - 1
        WHERE id = OLD.article_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update collection article counts
CREATE OR REPLACE FUNCTION update_collection_article_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.collections
        SET article_count = article_count + 1
        WHERE id = NEW.collection_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.collections
        SET article_count = article_count - 1
        WHERE id = OLD.collection_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles
        SET follower_count = follower_count + 1
        WHERE id = NEW.following_id;
        
        UPDATE public.profiles
        SET following_count = following_count + 1
        WHERE id = NEW.follower_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles
        SET follower_count = follower_count - 1
        WHERE id = OLD.following_id;
        
        UPDATE public.profiles
        SET following_count = following_count - 1
        WHERE id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for social features

-- Article likes triggers
CREATE TRIGGER article_likes_insert_trigger
AFTER INSERT ON public.article_likes
FOR EACH ROW
EXECUTE FUNCTION update_article_counts();

CREATE TRIGGER article_likes_delete_trigger
AFTER DELETE ON public.article_likes
FOR EACH ROW
EXECUTE FUNCTION update_article_counts();

-- Collection likes triggers
CREATE TRIGGER collection_likes_insert_trigger
AFTER INSERT ON public.collection_likes
FOR EACH ROW
EXECUTE FUNCTION update_collection_counts();

CREATE TRIGGER collection_likes_delete_trigger
AFTER DELETE ON public.collection_likes
FOR EACH ROW
EXECUTE FUNCTION update_collection_counts();

-- Comment likes triggers
CREATE TRIGGER comment_likes_insert_trigger
AFTER INSERT ON public.comment_likes
FOR EACH ROW
EXECUTE FUNCTION update_comment_counts();

CREATE TRIGGER comment_likes_delete_trigger
AFTER DELETE ON public.comment_likes
FOR EACH ROW
EXECUTE FUNCTION update_comment_counts();

-- Comments triggers
CREATE TRIGGER comments_insert_trigger
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION update_article_comment_counts();

CREATE TRIGGER comments_delete_trigger
AFTER DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION update_article_comment_counts();

-- Collection articles triggers
CREATE TRIGGER collection_articles_insert_trigger
AFTER INSERT ON public.collection_articles
FOR EACH ROW
EXECUTE FUNCTION update_collection_article_counts();

CREATE TRIGGER collection_articles_delete_trigger
AFTER DELETE ON public.collection_articles
FOR EACH ROW
EXECUTE FUNCTION update_collection_article_counts();

-- Follows triggers
CREATE TRIGGER follows_insert_trigger
AFTER INSERT ON public.follows
FOR EACH ROW
EXECUTE FUNCTION update_follow_counts();

CREATE TRIGGER follows_delete_trigger
AFTER DELETE ON public.follows
FOR EACH ROW
EXECUTE FUNCTION update_follow_counts();
