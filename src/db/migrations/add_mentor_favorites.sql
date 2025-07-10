-- Create mentor favorites table
CREATE TABLE mentor_favorites (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(unique_id),
  mentor_id VARCHAR NOT NULL REFERENCES users(unique_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(user_id, mentor_id)
);

-- Create indexes for performance
CREATE INDEX idx_mentor_favorites_user_id ON mentor_favorites(user_id);
CREATE INDEX idx_mentor_favorites_mentor_id ON mentor_favorites(mentor_id);
