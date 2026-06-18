-- =============================================================================
-- PatronFlow Migration 002: Add Slugs
-- Adds slug columns for user-friendly URLs
-- =============================================================================

-- Add slug column to restaurants if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'restaurants' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.restaurants ADD COLUMN slug text UNIQUE;
  END IF;
END $$;

-- Add slug column to events if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.events ADD COLUMN slug text UNIQUE;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
