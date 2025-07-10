-- Insert sample mentor users
INSERT INTO users (first_name, last_name, email, external_auth_id, role) VALUES
('Dr. Sarah', 'Johnson', 'sarah.johnson@mentors.com', 'mentor_sarah_123', 'mentor'),
('Prof. Michael', 'Chen', 'michael.chen@mentors.com', 'mentor_michael_456', 'mentor'),
('Dr. Emily', 'Rodriguez', 'emily.rodriguez@mentors.com', 'mentor_emily_789', 'mentor'),
('Dr. James', 'Thompson', 'james.thompson@mentors.com', 'mentor_james_101', 'mentor'),
('Dr. Aisha', 'Patel', 'aisha.patel@mentors.com', 'mentor_aisha_202', 'mentor'),
('Prof. David', 'Kim', 'david.kim@mentors.com', 'mentor_david_303', 'mentor')
ON CONFLICT (email) DO NOTHING;

-- Insert mentor profiles
INSERT INTO profile (user_id, bio, degree, institute, company, job_title, location, years_experience, languages, availability_status, response_time, mentee_count) 
SELECT 
  u.unique_id,
  CASE 
    WHEN u.email = 'sarah.johnson@mentors.com' THEN 'AI researcher with 12+ years in machine learning and deep learning. Published author and startup advisor.'
    WHEN u.email = 'michael.chen@mentors.com' THEN 'Business strategy expert and entrepreneur. Former McKinsey consultant, founded 2 successful startups.'
    WHEN u.email = 'emily.rodriguez@mentors.com' THEN 'Leading cardiologist and medical researcher specializing in preventive cardiology and patient care innovation.'
    WHEN u.email = 'james.thompson@mentors.com' THEN 'Software engineering leader with expertise in distributed systems and cloud architecture. Ex-Netflix, ex-Amazon.'
    WHEN u.email = 'aisha.patel@mentors.com' THEN 'Product design leader focused on UX research and design systems. Passionate about accessible and inclusive design.'
    WHEN u.email = 'david.kim@mentors.com' THEN 'Mechanical engineering professor and robotics researcher. Expert in automation and manufacturing processes.'
  END as bio,
  CASE 
    WHEN u.email = 'sarah.johnson@mentors.com' THEN 'PhD in Computer Science'
    WHEN u.email = 'michael.chen@mentors.com' THEN 'MBA'
    WHEN u.email = 'emily.rodriguez@mentors.com' THEN 'MD, PhD'
    WHEN u.email = 'james.thompson@mentors.com' THEN 'MS Computer Science'
    WHEN u.email = 'aisha.patel@mentors.com' THEN 'MS in Human-Computer Interaction'
    WHEN u.email = 'david.kim@mentors.com' THEN 'PhD in Mechanical Engineering'
  END as degree,
  CASE 
    WHEN u.email = 'sarah.johnson@mentors.com' THEN 'Stanford University'
    WHEN u.email = 'michael.chen@mentors.com' THEN 'Harvard Business School'
    WHEN u.email = 'emily.rodriguez@mentors.com' THEN 'Johns Hopkins University'
    WHEN u.email = 'james.thompson@mentors.com' THEN 'MIT'
    WHEN u.email = 'aisha.patel@mentors.com' THEN 'Carnegie Mellon University'
    WHEN u.email = 'david.kim@mentors.com' THEN 'University of California, Berkeley'
  END as institute,
  CASE 
    WHEN u.email = 'sarah.johnson@mentors.com' THEN 'Google AI'
    WHEN u.email = 'michael.chen@mentors.com' THEN 'Venture Capital Partners'
    WHEN u.email = 'emily.rodriguez@mentors.com' THEN 'Mayo Clinic'
    WHEN u.email = 'james.thompson@mentors.com' THEN 'Netflix'
    WHEN u.email = 'aisha.patel@mentors.com' THEN 'Figma'
    WHEN u.email = 'david.kim@mentors.com' THEN 'UC Berkeley'
  END as company,
  CASE 
    WHEN u.email = 'sarah.johnson@mentors.com' THEN 'Senior AI Research Scientist'
    WHEN u.email = 'michael.chen@mentors.com' THEN 'Managing Partner'
    WHEN u.email = 'emily.rodriguez@mentors.com' THEN 'Chief of Cardiology'
    WHEN u.email = 'james.thompson@mentors.com' THEN 'Staff Software Engineer'
    WHEN u.email = 'aisha.patel@mentors.com' THEN 'Senior Product Designer'
    WHEN u.email = 'david.kim@mentors.com' THEN 'Professor of Mechanical Engineering'
  END as job_title,
  CASE 
    WHEN u.email = 'sarah.johnson@mentors.com' THEN 'San Francisco, CA'
    WHEN u.email = 'michael.chen@mentors.com' THEN 'New York, NY'
    WHEN u.email = 'emily.rodriguez@mentors.com' THEN 'Rochester, MN'
    WHEN u.email = 'james.thompson@mentors.com' THEN 'Seattle, WA'
    WHEN u.email = 'aisha.patel@mentors.com' THEN 'San Francisco, CA'
    WHEN u.email = 'david.kim@mentors.com' THEN 'Berkeley, CA'
  END as location,
  CASE 
    WHEN u.email = 'sarah.johnson@mentors.com' THEN 12
    WHEN u.email = 'michael.chen@mentors.com' THEN 15
    WHEN u.email = 'emily.rodriguez@mentors.com' THEN 18
    WHEN u.email = 'james.thompson@mentors.com' THEN 10
    WHEN u.email = 'aisha.patel@mentors.com' THEN 8
    WHEN u.email = 'david.kim@mentors.com' THEN 14
  END as years_experience,
  CASE 
    WHEN u.email = 'sarah.johnson@mentors.com' THEN '["English", "Spanish"]'::json
    WHEN u.email = 'michael.chen@mentors.com' THEN '["English", "Mandarin"]'::json
    WHEN u.email = 'emily.rodriguez@mentors.com' THEN '["English", "Spanish"]'::json
    WHEN u.email = 'james.thompson@mentors.com' THEN '["English"]'::json
    WHEN u.email = 'aisha.patel@mentors.com' THEN '["English", "Hindi", "Gujarati"]'::json
    WHEN u.email = 'david.kim@mentors.com' THEN '["English", "Korean"]'::json
  END as languages,
  CASE 
    WHEN u.email = 'david.kim@mentors.com' THEN 'false'
    ELSE 'true'
  END as availability_status,
  CASE 
    WHEN u.email = 'sarah.johnson@mentors.com' THEN '< 2 hours'
    WHEN u.email = 'michael.chen@mentors.com' THEN '< 4 hours'
    WHEN u.email = 'emily.rodriguez@mentors.com' THEN '< 6 hours'
    WHEN u.email = 'james.thompson@mentors.com' THEN '< 3 hours'
    WHEN u.email = 'aisha.patel@mentors.com' THEN '< 4 hours'
    WHEN u.email = 'david.kim@mentors.com' THEN '< 12 hours'
  END as response_time,
  CASE 
    WHEN u.email = 'sarah.johnson@mentors.com' THEN 45
    WHEN u.email = 'michael.chen@mentors.com' THEN 38
    WHEN u.email = 'emily.rodriguez@mentors.com' THEN 52
    WHEN u.email = 'james.thompson@mentors.com' THEN 29
    WHEN u.email = 'aisha.patel@mentors.com' THEN 33
    WHEN u.email = 'david.kim@mentors.com' THEN 41
  END as mentee_count
FROM users u
WHERE u.email IN ('sarah.johnson@mentors.com', 'michael.chen@mentors.com', 'emily.rodriguez@mentors.com', 'james.thompson@mentors.com', 'aisha.patel@mentors.com', 'david.kim@mentors.com')
ON CONFLICT (user_id) DO UPDATE SET 
  bio = EXCLUDED.bio,
  degree = EXCLUDED.degree,
  institute = EXCLUDED.institute,
  company = EXCLUDED.company,
  job_title = EXCLUDED.job_title,
  location = EXCLUDED.location,
  years_experience = EXCLUDED.years_experience,
  languages = EXCLUDED.languages,
  availability_status = EXCLUDED.availability_status,
  response_time = EXCLUDED.response_time,
  mentee_count = EXCLUDED.mentee_count;

-- Insert tags for skills and interests
INSERT INTO tags (name, type, count) VALUES
('Machine Learning', 'skill', 1),
('Python', 'skill', 1),
('Data Science', 'skill', 1),
('AI', 'skill', 1),
('Deep Learning', 'skill', 1),
('Business Strategy', 'skill', 1),
('Consulting', 'skill', 1),
('Entrepreneurship', 'skill', 1),
('Venture Capital', 'skill', 1),
('Cardiology', 'skill', 1),
('Medical Research', 'skill', 1),
('Patient Care', 'skill', 1),
('Medical Education', 'skill', 1),
('Software Engineering', 'skill', 1),
('Distributed Systems', 'skill', 1),
('Cloud Computing', 'skill', 1),
('DevOps', 'skill', 1),
('UX Design', 'skill', 1),
('Product Design', 'skill', 1),
('Design Systems', 'skill', 1),
('User Research', 'skill', 1),
('Mechanical Engineering', 'skill', 1),
('Robotics', 'skill', 1),
('Automation', 'skill', 1),
('Manufacturing', 'skill', 1),
('Research', 'interest', 1),
('Startups', 'interest', 1),
('Teaching', 'interest', 1),
('Innovation', 'interest', 1),
('Technology', 'interest', 1),
('Leadership', 'interest', 1),
('Global Health', 'interest', 1),
('Healthcare', 'interest', 1),
('Product Development', 'interest', 1),
('Accessibility', 'interest', 1),
('Sustainability', 'interest', 1)
ON CONFLICT (name) DO NOTHING;

-- Assign skills and interests to mentors
INSERT INTO user_tags (user_id, tag_id)
SELECT u.unique_id, t.id
FROM users u, tags t
WHERE (
  -- Sarah Johnson (AI/ML)
  (u.email = 'sarah.johnson@mentors.com' AND t.name IN ('Machine Learning', 'Python', 'Data Science', 'AI', 'Deep Learning', 'Research', 'Innovation', 'Technology'))
  OR
  -- Michael Chen (Business)
  (u.email = 'michael.chen@mentors.com' AND t.name IN ('Business Strategy', 'Consulting', 'Entrepreneurship', 'Venture Capital', 'Startups', 'Innovation', 'Leadership'))
  OR
  -- Emily Rodriguez (Medical)
  (u.email = 'emily.rodriguez@mentors.com' AND t.name IN ('Cardiology', 'Medical Research', 'Patient Care', 'Medical Education', 'Research', 'Global Health', 'Healthcare', 'Teaching'))
  OR
  -- James Thompson (Software)
  (u.email = 'james.thompson@mentors.com' AND t.name IN ('Software Engineering', 'Distributed Systems', 'Cloud Computing', 'DevOps', 'Technology', 'Innovation', 'Product Development'))
  OR
  -- Aisha Patel (Design)
  (u.email = 'aisha.patel@mentors.com' AND t.name IN ('UX Design', 'Product Design', 'Design Systems', 'User Research', 'Innovation', 'Accessibility', 'Product Development'))
  OR
  -- David Kim (Engineering)
  (u.email = 'david.kim@mentors.com' AND t.name IN ('Mechanical Engineering', 'Robotics', 'Automation', 'Manufacturing', 'Research', 'Innovation', 'Sustainability', 'Teaching'))
)
ON CONFLICT (user_id, tag_id) DO NOTHING;

-- Insert sample mentor ratings
INSERT INTO mentor_ratings (mentor_id, reviewer_id, rating, review_text)
SELECT 
  m.unique_id as mentor_id,
  r.unique_id as reviewer_id,
  '4.8' as rating,
  'Excellent mentor! Very knowledgeable and helpful.' as review_text
FROM users m
CROSS JOIN users r
WHERE m.role = 'mentor' 
  AND r.role = 'user'
  AND m.unique_id != r.unique_id
LIMIT 10
ON CONFLICT DO NOTHING;
