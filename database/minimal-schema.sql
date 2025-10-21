-- ===================================================================
-- CodeBros Minimal Database Schema
-- Essential tables for problems and submissions
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- ENUMS
-- ===================================================================

-- Problem difficulty levels
CREATE TYPE difficulty_level AS ENUM ('Novice', 'Easy', 'Medium', 'Hard');

-- Programming languages supported
CREATE TYPE programming_language AS ENUM ('javascript', 'python', 'java', 'cpp');

-- Problem output types
CREATE TYPE output_type AS ENUM ('return', 'print');

-- Submission status
CREATE TYPE submission_status AS ENUM ('Pending', 'Success', 'Error', 'Time Limit Exceeded', 'Compilation Error');

-- ===================================================================
-- CORE TABLES
-- ===================================================================

-- Problems table
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    function_name VARCHAR(100) NOT NULL,
    output_type output_type NOT NULL DEFAULT 'return',
    difficulty difficulty_level NOT NULL,
    constraints TEXT[], -- Array of constraint strings
    tags TEXT[], -- Simple array of tags
    solution_link TEXT,
    acceptance_rate DECIMAL(5,2) DEFAULT 0.00,
    total_submissions INTEGER DEFAULT 0,
    total_accepted INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Starter code for different languages
CREATE TABLE problem_starter_codes (
    id SERIAL PRIMARY KEY,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    language programming_language NOT NULL,
    starter_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(problem_id, language)
);

-- Test cases for problems (examples only for now)
CREATE TABLE problem_examples (
    id SERIAL PRIMARY KEY,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    input_data JSONB NOT NULL, -- JSON object with input parameters
    expected_output JSONB NOT NULL, -- Expected output value
    explanation TEXT,
    order_index INTEGER DEFAULT 0, -- For ordering examples
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User submissions (simplified - no user system yet)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES problems(id),
    language programming_language NOT NULL,
    code TEXT NOT NULL,
    status submission_status NOT NULL,
    execution_time INTEGER, -- in milliseconds
    memory_usage INTEGER, -- in bytes
    error_message TEXT,
    total_test_cases INTEGER DEFAULT 0,
    passed_test_cases INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

-- Problems indexes
CREATE INDEX idx_problems_slug ON problems(slug);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_is_active ON problems(is_active);

-- Submissions indexes
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);

-- ===================================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ===================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to problems table
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- FUNCTION TO UPDATE PROBLEM STATISTICS
-- ===================================================================

-- Function to update problem statistics after a submission
CREATE OR REPLACE FUNCTION update_problem_stats_after_submission()
RETURNS TRIGGER AS $$
BEGIN
    -- Update problem statistics
    UPDATE problems 
    SET total_submissions = total_submissions + 1,
        total_accepted = CASE WHEN NEW.status = 'Success' THEN total_accepted + 1 ELSE total_accepted END,
        acceptance_rate = CASE 
            WHEN (total_submissions + 1) > 0 THEN 
                ROUND((CASE WHEN NEW.status = 'Success' THEN total_accepted + 1 ELSE total_accepted END)::decimal / (total_submissions + 1) * 100, 2)
            ELSE 0
        END
    WHERE id = NEW.problem_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for submission statistics
CREATE TRIGGER trigger_update_problem_stats_after_submission
    AFTER INSERT ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_problem_stats_after_submission();