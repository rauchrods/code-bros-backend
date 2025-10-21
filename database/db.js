import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Global variables to maintain state
let pool = null;
let isConnected = false;

// Connect to database
export const connect = async () => {
  try {
    // Create connection pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10, // Maximum number of connections in the pool
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });

    // Test the connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Release the test client back to pool
    client.release();
    isConnected = true;

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('❌ Unexpected error on idle client', err);
      isConnected = false;
    });

    return pool;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    isConnected = false;
    throw error;
  }
};

// Get the pool instance for direct usage
export const getPool = () => {
  if (!isConnected || !pool) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return pool;
};

// Get connection health status
export const healthCheck = async () => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT NOW() as current_time');
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      connected: isConnected
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      connected: false
    };
  }
};

// Auto-create database schema if it doesn't exist
export const initializeSchema = async () => {
  try {
    console.log('🔄 Initializing database schema...');
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Enable UUID extension
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

      // Create ENUMs
      await client.query(`
        DO $$ BEGIN
          CREATE TYPE difficulty_level AS ENUM ('Novice', 'Easy', 'Medium', 'Hard');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await client.query(`
        DO $$ BEGIN
          CREATE TYPE programming_language AS ENUM ('javascript', 'python', 'java', 'cpp');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await client.query(`
        DO $$ BEGIN
          CREATE TYPE output_type AS ENUM ('return', 'print');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await client.query(`
        DO $$ BEGIN
          CREATE TYPE submission_status AS ENUM ('Pending', 'Success', 'Error', 'Time Limit Exceeded', 'Compilation Error');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Create problems table
      await client.query(`
        CREATE TABLE IF NOT EXISTS problems (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          slug VARCHAR(100) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          function_name VARCHAR(100) NOT NULL,
          output_type output_type NOT NULL DEFAULT 'return',
          difficulty difficulty_level NOT NULL,
          constraints TEXT[],
          tags TEXT[],
          solution_link TEXT,
          acceptance_rate DECIMAL(5,2) DEFAULT 0.00,
          total_submissions INTEGER DEFAULT 0,
          total_accepted INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT true
        )
      `);

      // Create starter codes table
      await client.query(`
        CREATE TABLE IF NOT EXISTS problem_starter_codes (
          id SERIAL PRIMARY KEY,
          problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
          language programming_language NOT NULL,
          starter_code TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(problem_id, language)
        )
      `);

      // Create examples table
      await client.query(`
        CREATE TABLE IF NOT EXISTS problem_examples (
          id SERIAL PRIMARY KEY,
          problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
          input_data JSONB NOT NULL,
          expected_output JSONB NOT NULL,
          explanation TEXT,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create submissions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS submissions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          problem_id UUID REFERENCES problems(id),
          language programming_language NOT NULL,
          code TEXT NOT NULL,
          status submission_status NOT NULL,
          execution_time INTEGER,
          memory_usage INTEGER,
          error_message TEXT,
          total_test_cases INTEGER DEFAULT 0,
          passed_test_cases INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await client.query('CREATE INDEX IF NOT EXISTS idx_problems_slug ON problems(slug)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_problems_is_active ON problems(is_active)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at)');

      // Create update timestamp function
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      // Create trigger for problems table
      await client.query(`
        DROP TRIGGER IF EXISTS update_problems_updated_at ON problems;
        CREATE TRIGGER update_problems_updated_at 
        BEFORE UPDATE ON problems
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);

      // Create function to update problem statistics
      await client.query(`
        CREATE OR REPLACE FUNCTION update_problem_stats_after_submission()
        RETURNS TRIGGER AS $$
        BEGIN
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
      `);

      // Create trigger for submission statistics
      await client.query(`
        DROP TRIGGER IF EXISTS trigger_update_problem_stats_after_submission ON submissions;
        CREATE TRIGGER trigger_update_problem_stats_after_submission
        AFTER INSERT ON submissions
        FOR EACH ROW EXECUTE FUNCTION update_problem_stats_after_submission();
      `);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    console.log('✅ Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database schema:', error.message);
    return false;
  }
};

// Disconnect from database
export const disconnect = async () => {
  try {
    if (pool) {
      await pool.end();
      isConnected = false;
      pool = null;
      console.log('✅ Disconnected from PostgreSQL database');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error.message);
  }
};

// Export default object for backward compatibility
const database = {
  connect,
  getPool,
  healthCheck,
  initializeSchema,
  disconnect
};

export default database;