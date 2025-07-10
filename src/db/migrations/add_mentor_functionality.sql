-- Additional schema modifications needed for mentor functionality
-- These should be added to the existing schema.ts file

-- 1. Add mentor-specific fields to the profile table
ALTER TABLE profile ADD COLUMN company VARCHAR;
ALTER TABLE profile ADD COLUMN job_title VARCHAR;
ALTER TABLE profile ADD COLUMN location VARCHAR;
ALTER TABLE profile ADD COLUMN years_experience INTEGER DEFAULT 0;
ALTER TABLE profile ADD COLUMN languages JSON DEFAULT '["English"]';
ALTER TABLE profile ADD COLUMN availability_status BOOLEAN DEFAULT true;
ALTER TABLE profile ADD COLUMN response_time VARCHAR DEFAULT '< 24 hours';
ALTER TABLE profile ADD COLUMN mentee_count INTEGER DEFAULT 0;

-- 2. Create mentor ratings table
CREATE TABLE mentor_ratings (
  id SERIAL PRIMARY KEY,
  mentor_id VARCHAR NOT NULL REFERENCES users(unique_id),
  reviewer_id VARCHAR NOT NULL REFERENCES users(unique_id),
  rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 5.0),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- 3. Create mentor requests/relationships table
CREATE TABLE mentor_relationships (
  id SERIAL PRIMARY KEY,
  mentor_id VARCHAR NOT NULL REFERENCES users(unique_id),
  mentee_id VARCHAR NOT NULL REFERENCES users(unique_id),
  status VARCHAR NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, completed
  request_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- 4. Create indexes for performance
CREATE INDEX idx_mentor_ratings_mentor_id ON mentor_ratings(mentor_id);
CREATE INDEX idx_mentor_ratings_reviewer_id ON mentor_ratings(reviewer_id);
CREATE INDEX idx_mentor_relationships_mentor_id ON mentor_relationships(mentor_id);
CREATE INDEX idx_mentor_relationships_mentee_id ON mentor_relationships(mentee_id);
CREATE INDEX idx_mentor_relationships_status ON mentor_relationships(status);

-- 5. Create mentor favorites table
CREATE TABLE mentor_favorites (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(unique_id),
  mentor_id VARCHAR NOT NULL REFERENCES users(unique_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(user_id, mentor_id)
);

-- 6. Create index for mentor favorites
CREATE INDEX idx_mentor_favorites_user_id ON mentor_favorites(user_id);
CREATE INDEX idx_mentor_favorites_mentor_id ON mentor_favorites(mentor_id);

-- 7. Add mentor role if it doesn't exist
INSERT INTO roles (name, role_type, slug) 
VALUES ('mentor', 'user_role', 'mentor') 
ON CONFLICT (name) DO NOTHING;
