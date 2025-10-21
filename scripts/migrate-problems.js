import { PROBLEMS } from '../constants/problems.js';
import { connect, getPool, disconnect } from '../database/db.js';

// Convert problem ID to slug format
const createSlugFromId = (id) => {
  return id.replace(/_/g, '-').toLowerCase();
};

// Migrate all problems from constants to database
export const migrateProblems = async () => {
  console.log('🚀 Starting problems migration...');
  console.log(`Found ${PROBLEMS.length} problems to migrate`);

  try {
    await connect();
    console.log('🔗 Database connected successfully');
    
    const pool = getPool();
    
    // Check if problems already exist
    const existingProblemsResult = await pool.query('SELECT COUNT(*) as count FROM problems');
    const existingCount = parseInt(existingProblemsResult.rows[0].count);

    if (existingCount > 0) {
      console.log(`⚠️  Database already contains ${existingCount} problems.`);
      console.log('Continuing with migration - duplicates will be skipped...');
    }

    let migratedCount = 0;
    let skippedCount = 0;

    // Start migration
    for (const problem of PROBLEMS) {
      try {
        const result = await migrateSingleProblem(problem);
        if (result === 'skipped') {
          skippedCount++;
        } else {
          migratedCount++;
          console.log(`✅ Migrated: ${problem.title}`);
        }
      } catch (error) {
        console.error(`❌ Failed to migrate ${problem.title}:`, error.message);
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} problems`);
    console.log(`⏭️  Skipped existing: ${skippedCount} problems`);

  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    throw error;
  } finally {
    await disconnect();
  }
};

// Migrate a single problem
const migrateSingleProblem = async (problem) => {
  const slug = createSlugFromId(problem.id);
  const pool = getPool();

  // Check if problem already exists
  const existingProblem = await pool.query('SELECT id FROM problems WHERE slug = $1', [slug]);
  
  if (existingProblem.rows.length > 0) {
    console.log(`⏭️  Skipping ${problem.title} - already exists`);
    return 'skipped';
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    // 1. Insert the problem
    const problemQuery = `
      INSERT INTO problems (
        slug, title, description, function_name, output_type, 
        difficulty, constraints, tags, solution_link
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const problemResult = await client.query(problemQuery, [
      slug,
      problem.title,
      problem.description,
      problem.functionName,
      problem.outputType || 'return',
      problem.difficulty,
      problem.constraints || [],
      problem.tags || [],
      problem.solutionLink || null
    ]);

    const problemId = problemResult.rows[0].id;

    // 2. Insert starter codes
    if (problem.starterCode) {
      for (const [language, code] of Object.entries(problem.starterCode)) {
        const starterCodeQuery = `
          INSERT INTO problem_starter_codes (problem_id, language, starter_code)
          VALUES ($1, $2, $3)
        `;
        await client.query(starterCodeQuery, [problemId, language, code]);
      }
    }

    // 3. Insert examples
    if (problem.examples && problem.examples.length > 0) {
      for (let i = 0; i < problem.examples.length; i++) {
        const example = problem.examples[i];
        const exampleQuery = `
          INSERT INTO problem_examples (
            problem_id, input_data, expected_output, explanation, order_index
          )
          VALUES ($1, $2, $3, $4, $5)
        `;
        
        await client.query(exampleQuery, [
          problemId,
          JSON.stringify(example.input),
          JSON.stringify(example.output),
          example.explanation || null,
          i
        ]);
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  
  return 'migrated';
};

// Run migration directly
migrateProblems()
  .then(() => {
    console.log('✅ Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });