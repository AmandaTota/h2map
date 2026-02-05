-- Add new fields to user_profiles table
-- Migration: Enhanced User Profile System
-- Add location, phone, and website fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS website TEXT;
-- Add check constraints for validation
ALTER TABLE user_profiles
ADD CONSTRAINT check_full_name_length CHECK (
        full_name IS NULL
        OR (
            char_length(full_name) >= 2
            AND char_length(full_name) <= 100
        )
    );
ALTER TABLE user_profiles
ADD CONSTRAINT check_bio_length CHECK (
        bio IS NULL
        OR char_length(bio) <= 500
    );
ALTER TABLE user_profiles
ADD CONSTRAINT check_location_length CHECK (
        location IS NULL
        OR char_length(location) <= 100
    );
ALTER TABLE user_profiles
ADD CONSTRAINT check_website_format CHECK (
        website IS NULL
        OR website ~ '^https?://.*'
    );
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles(updated_at);
-- Add comment to document changes
COMMENT ON COLUMN user_profiles.location IS 'User location (city, state)';
COMMENT ON COLUMN user_profiles.phone IS 'User phone number';
COMMENT ON COLUMN user_profiles.website IS 'User website URL';
-- Update RLS policies to include new fields
-- (Existing policies should already cover these, but we verify)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- Ensure users can update their own profiles
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'user_profiles'
        AND policyname = 'Users can update own profile'
) THEN CREATE POLICY "Users can update own profile" ON user_profiles FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
END IF;
END $$;
-- Add trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at BEFORE
UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_user_profiles_updated_at();