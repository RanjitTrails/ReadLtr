-- Add analytics features to the database schema

-- Create reading_sessions table to track reading activity
CREATE TABLE IF NOT EXISTS public.reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    progress_percentage INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    device_type TEXT,
    os_name TEXT,
    browser_name TEXT,
    screen_size TEXT
);

-- Create reading_goals table
CREATE TABLE IF NOT EXISTS public.reading_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    target_count INTEGER NOT NULL,
    target_unit TEXT NOT NULL, -- 'articles', 'minutes'
    start_date DATE NOT NULL,
    end_date DATE,
    is_recurring BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create reading_stats table for aggregated statistics
CREATE TABLE IF NOT EXISTS public.reading_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    articles_read INTEGER DEFAULT 0,
    articles_saved INTEGER DEFAULT 0,
    minutes_read INTEGER DEFAULT 0,
    words_read INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
);

-- Create user_preferences table for personalization
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    reading_speed INTEGER DEFAULT 200, -- words per minute
    preferred_categories TEXT[] DEFAULT '{}',
    preferred_reading_time TEXT, -- 'morning', 'afternoon', 'evening', 'night'
    font_size TEXT DEFAULT 'medium',
    theme TEXT DEFAULT 'dark',
    enable_recommendations BOOLEAN DEFAULT TRUE,
    enable_reading_reminders BOOLEAN DEFAULT FALSE,
    reminder_time TIME,
    reminder_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create article_recommendations table
CREATE TABLE IF NOT EXISTS public.article_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    reason TEXT,
    score FLOAT,
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, article_id)
);

-- Create article_topics table for content categorization
CREATE TABLE IF NOT EXISTS public.article_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    confidence FLOAT,
    UNIQUE(article_id, topic)
);

-- Create user_topic_interests table for personalization
CREATE TABLE IF NOT EXISTS public.user_topic_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    interest_level FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, topic)
);

-- Add analytics fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS reading_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_articles_read INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reading_time INTEGER DEFAULT 0, -- in minutes
ADD COLUMN IF NOT EXISTS average_reading_speed INTEGER DEFAULT 200, -- words per minute
ADD COLUMN IF NOT EXISTS favorite_topics TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS favorite_reading_time TEXT, -- 'morning', 'afternoon', 'evening', 'night'
ADD COLUMN IF NOT EXISTS last_reading_session TIMESTAMP WITH TIME ZONE;

-- Add analytics fields to articles table
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS word_count INTEGER,
ADD COLUMN IF NOT EXISTS completion_rate FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS average_reading_time INTEGER, -- in seconds
ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}';

-- Create functions for analytics

-- Function to calculate reading duration
CREATE OR REPLACE FUNCTION calculate_reading_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update reading stats
CREATE OR REPLACE FUNCTION update_reading_stats()
RETURNS TRIGGER AS $$
DECLARE
    article_word_count INTEGER;
    reading_date DATE;
    current_streak INTEGER;
    last_streak_date DATE;
BEGIN
    -- Get article word count
    SELECT word_count INTO article_word_count FROM articles WHERE id = NEW.article_id;
    
    -- If word count is null, estimate based on content length
    IF article_word_count IS NULL THEN
        SELECT 
            GREATEST(200, LENGTH(COALESCE(content, '')) / 5) 
        INTO article_word_count 
        FROM articles 
        WHERE id = NEW.article_id;
        
        -- Update the article with the estimated word count
        UPDATE articles SET word_count = article_word_count WHERE id = NEW.article_id;
    END IF;
    
    -- Calculate words read based on progress
    IF NEW.progress_percentage IS NOT NULL AND article_word_count IS NOT NULL THEN
        article_word_count := (article_word_count * NEW.progress_percentage) / 100;
    END IF;
    
    -- Get the date for the reading session
    reading_date := DATE(NEW.started_at AT TIME ZONE 'UTC');
    
    -- Update or insert reading stats for the day
    INSERT INTO reading_stats (user_id, date, articles_read, minutes_read, words_read)
    VALUES (
        NEW.user_id, 
        reading_date, 
        CASE WHEN NEW.completed THEN 1 ELSE 0 END,
        CASE WHEN NEW.duration_seconds IS NOT NULL THEN NEW.duration_seconds / 60 ELSE 0 END,
        COALESCE(article_word_count, 0)
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        articles_read = reading_stats.articles_read + CASE WHEN NEW.completed AND NOT EXISTS (
            SELECT 1 FROM reading_sessions 
            WHERE user_id = NEW.user_id AND article_id = NEW.article_id AND completed = TRUE
            AND id != NEW.id
        ) THEN 1 ELSE 0 END,
        minutes_read = reading_stats.minutes_read + (COALESCE(NEW.duration_seconds, 0) / 60),
        words_read = reading_stats.words_read + COALESCE(article_word_count, 0);
    
    -- Update user profile stats
    UPDATE profiles
    SET 
        last_reading_session = NEW.ended_at,
        total_reading_time = COALESCE(total_reading_time, 0) + (COALESCE(NEW.duration_seconds, 0) / 60)
    WHERE id = NEW.user_id;
    
    -- Update article stats
    IF NEW.completed THEN
        UPDATE articles
        SET 
            completion_rate = (
                SELECT COUNT(*) * 100.0 / NULLIF(COUNT(*), 0)
                FROM reading_sessions
                WHERE article_id = NEW.article_id AND completed = TRUE
            )
        WHERE id = NEW.article_id;
    END IF;
    
    -- Update reading streak
    SELECT reading_streak, DATE(last_reading_session AT TIME ZONE 'UTC')
    INTO current_streak, last_streak_date
    FROM profiles
    WHERE id = NEW.user_id;
    
    IF current_streak IS NULL THEN
        current_streak := 0;
    END IF;
    
    -- If this is the first reading session of the day and it's consecutive to the last one
    IF last_streak_date IS NULL OR reading_date > last_streak_date THEN
        IF last_streak_date IS NULL OR reading_date = last_streak_date + INTERVAL '1 day' THEN
            -- Increment streak
            UPDATE profiles SET reading_streak = current_streak + 1 WHERE id = NEW.user_id;
            
            -- Update streak in reading_stats
            UPDATE reading_stats 
            SET streak_days = current_streak + 1
            WHERE user_id = NEW.user_id AND date = reading_date;
        ELSIF reading_date > last_streak_date + INTERVAL '1 day' THEN
            -- Reset streak
            UPDATE profiles SET reading_streak = 1 WHERE id = NEW.user_id;
            
            -- Update streak in reading_stats
            UPDATE reading_stats 
            SET streak_days = 1
            WHERE user_id = NEW.user_id AND date = reading_date;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update article completion when progress reaches 100%
CREATE OR REPLACE FUNCTION update_article_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.progress_percentage >= 90 AND (OLD.progress_percentage IS NULL OR OLD.progress_percentage < 90) THEN
        NEW.completed := TRUE;
        
        -- Update article read status
        UPDATE articles SET is_read = TRUE WHERE id = NEW.article_id;
        
        -- Update user's total articles read
        UPDATE profiles 
        SET total_articles_read = COALESCE(total_articles_read, 0) + 1
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate average reading speed
CREATE OR REPLACE FUNCTION calculate_reading_speed()
RETURNS TRIGGER AS $$
DECLARE
    article_word_count INTEGER;
    reading_speed INTEGER;
BEGIN
    -- Only calculate if we have duration and the session is completed
    IF NEW.duration_seconds IS NOT NULL AND NEW.duration_seconds > 0 AND NEW.completed = TRUE THEN
        -- Get article word count
        SELECT word_count INTO article_word_count FROM articles WHERE id = NEW.article_id;
        
        -- If word count is null, estimate based on content length
        IF article_word_count IS NULL THEN
            SELECT 
                GREATEST(200, LENGTH(COALESCE(content, '')) / 5) 
            INTO article_word_count 
            FROM articles 
            WHERE id = NEW.article_id;
        END IF;
        
        -- Calculate reading speed (words per minute)
        IF article_word_count IS NOT NULL AND article_word_count > 0 THEN
            reading_speed := (article_word_count * 60) / NEW.duration_seconds;
            
            -- Update user's average reading speed (weighted average)
            UPDATE profiles
            SET 
                average_reading_speed = (
                    CASE 
                        WHEN total_articles_read > 0 THEN
                            ((average_reading_speed * total_articles_read) + reading_speed) / (total_articles_read + 1)
                        ELSE
                            reading_speed
                    END
                )
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for analytics

-- Trigger to calculate reading duration
CREATE TRIGGER calculate_reading_duration_trigger
BEFORE INSERT OR UPDATE ON reading_sessions
FOR EACH ROW
EXECUTE FUNCTION calculate_reading_duration();

-- Trigger to update reading stats
CREATE TRIGGER update_reading_stats_trigger
AFTER INSERT OR UPDATE ON reading_sessions
FOR EACH ROW
EXECUTE FUNCTION update_reading_stats();

-- Trigger to update article completion
CREATE TRIGGER update_article_completion_trigger
BEFORE UPDATE ON reading_sessions
FOR EACH ROW
EXECUTE FUNCTION update_article_completion();

-- Trigger to calculate reading speed
CREATE TRIGGER calculate_reading_speed_trigger
AFTER INSERT OR UPDATE ON reading_sessions
FOR EACH ROW
EXECUTE FUNCTION calculate_reading_speed();

-- Create RLS policies for analytics tables

-- Reading sessions policies
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading sessions"
ON public.reading_sessions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own reading sessions"
ON public.reading_sessions
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reading sessions"
ON public.reading_sessions
FOR UPDATE
USING (user_id = auth.uid());

-- Reading goals policies
ALTER TABLE public.reading_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading goals"
ON public.reading_goals
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own reading goals"
ON public.reading_goals
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reading goals"
ON public.reading_goals
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reading goals"
ON public.reading_goals
FOR DELETE
USING (user_id = auth.uid());

-- Reading stats policies
ALTER TABLE public.reading_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading stats"
ON public.reading_stats
FOR SELECT
USING (user_id = auth.uid());

-- User preferences policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
FOR UPDATE
USING (user_id = auth.uid());

-- Article recommendations policies
ALTER TABLE public.article_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations"
ON public.article_recommendations
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own recommendations"
ON public.article_recommendations
FOR UPDATE
USING (user_id = auth.uid());

-- Article topics policies
ALTER TABLE public.article_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view article topics"
ON public.article_topics
FOR SELECT
USING (TRUE);

-- User topic interests policies
ALTER TABLE public.user_topic_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own topic interests"
ON public.user_topic_interests
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own topic interests"
ON public.user_topic_interests
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own topic interests"
ON public.user_topic_interests
FOR UPDATE
USING (user_id = auth.uid());

-- Create stored procedures for analytics

-- Procedure to generate article recommendations
CREATE OR REPLACE FUNCTION generate_article_recommendations(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
    -- Clear old recommendations that haven't been read or dismissed
    DELETE FROM article_recommendations 
    WHERE user_id = user_id_param 
    AND is_read = FALSE 
    AND is_dismissed = FALSE;
    
    -- Insert new recommendations based on user's reading history and interests
    INSERT INTO article_recommendations (user_id, article_id, reason, score)
    SELECT 
        user_id_param,
        a.id,
        CASE
            WHEN similarity_score > 0.7 THEN 'Based on your reading history'
            WHEN topic_match THEN 'Matches your interests'
            ELSE 'Popular among readers like you'
        END,
        similarity_score
    FROM articles a
    CROSS JOIN LATERAL (
        -- Calculate similarity score based on topics
        SELECT 
            COALESCE(
                (
                    SELECT AVG(uti.interest_level)
                    FROM unnest(a.topics) t
                    JOIN user_topic_interests uti ON uti.topic = t AND uti.user_id = user_id_param
                ),
                0.5
            ) AS similarity_score,
            EXISTS (
                SELECT 1
                FROM unnest(a.topics) t
                JOIN user_topic_interests uti ON uti.topic = t AND uti.user_id = user_id_param
                WHERE uti.interest_level > 0.6
            ) AS topic_match
    ) scores
    WHERE 
        -- Exclude articles the user has already read or saved
        NOT EXISTS (
            SELECT 1 FROM articles 
            WHERE user_id = user_id_param AND url = a.url
        )
        -- Exclude articles already recommended
        AND NOT EXISTS (
            SELECT 1 FROM article_recommendations 
            WHERE user_id = user_id_param AND article_id = a.id
        )
        -- Only include public articles from other users
        AND a.is_public = TRUE
        AND a.user_id != user_id_param
    ORDER BY similarity_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Procedure to update user topic interests based on reading history
CREATE OR REPLACE FUNCTION update_user_topic_interests(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
    topic_rec RECORD;
BEGIN
    -- Get topics from articles the user has read
    FOR topic_rec IN (
        SELECT 
            t AS topic,
            COUNT(*) AS frequency,
            AVG(CASE WHEN rs.completed THEN 1.0 ELSE 0.5 END) AS completion_factor
        FROM articles a
        JOIN reading_sessions rs ON rs.article_id = a.id
        CROSS JOIN LATERAL unnest(a.topics) AS t
        WHERE rs.user_id = user_id_param
        GROUP BY t
    ) LOOP
        -- Update or insert user topic interests
        INSERT INTO user_topic_interests (user_id, topic, interest_level)
        VALUES (
            user_id_param,
            topic_rec.topic,
            LEAST(1.0, (topic_rec.frequency * topic_rec.completion_factor) / 10.0)
        )
        ON CONFLICT (user_id, topic)
        DO UPDATE SET
            interest_level = LEAST(1.0, (
                user_topic_interests.interest_level + 
                LEAST(1.0, (topic_rec.frequency * topic_rec.completion_factor) / 10.0)
            ) / 2),
            updated_at = NOW();
    END LOOP;
    
    -- Update user's favorite topics
    UPDATE profiles
    SET favorite_topics = (
        SELECT array_agg(topic)
        FROM (
            SELECT topic
            FROM user_topic_interests
            WHERE user_id = user_id_param
            ORDER BY interest_level DESC
            LIMIT 5
        ) t
    )
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Procedure to update favorite reading time
CREATE OR REPLACE FUNCTION update_favorite_reading_time(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
    favorite_time TEXT;
BEGIN
    -- Determine favorite reading time based on reading sessions
    SELECT
        CASE
            WHEN COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 5 AND 11) > COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 12 AND 17)
                AND COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 5 AND 11) > COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 18 AND 23)
                AND COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 5 AND 11) > COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 0 AND 4)
                THEN 'morning'
            WHEN COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 12 AND 17) > COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 5 AND 11)
                AND COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 12 AND 17) > COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 18 AND 23)
                AND COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 12 AND 17) > COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 0 AND 4)
                THEN 'afternoon'
            WHEN COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 18 AND 23) > COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 5 AND 11)
                AND COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 18 AND 23) > COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 12 AND 17)
                AND COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 18 AND 23) > COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 0 AND 4)
                THEN 'evening'
            WHEN COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 0 AND 4) > COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 5 AND 11)
                AND COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 0 AND 4) > COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 12 AND 17)
                AND COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 0 AND 4) > COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM started_at) BETWEEN 18 AND 23)
                THEN 'night'
            ELSE NULL
        END INTO favorite_time
    FROM reading_sessions
    WHERE user_id = user_id_param
    AND started_at >= NOW() - INTERVAL '30 days';
    
    -- Update user's favorite reading time
    IF favorite_time IS NOT NULL THEN
        UPDATE profiles
        SET favorite_reading_time = favorite_time
        WHERE id = user_id_param;
    END IF;
END;
$$ LANGUAGE plpgsql;
