const db = require('../config/database');

const migrateDatabase = async () => {
  try {
    console.log('Starting database migration...');

    // Add new columns to insurance_cases table
    console.log('Adding columns to insurance_cases table...');
    
    // Add expected_days column if it doesn't exist
    await db.query(`
      ALTER TABLE insurance_cases 
      ADD COLUMN IF NOT EXISTS expected_days INTEGER DEFAULT 7;
    `);

    // Add processing_fee and amount_paid columns for revenue tracking
    await db.query(`
      ALTER TABLE insurance_cases 
      ADD COLUMN IF NOT EXISTS processing_fee DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0;
    `);

    // Create a function to auto-calculate TAT
    await db.query(`
      CREATE OR REPLACE FUNCTION calculate_tat(date_received DATE, date_closed DATE)
      RETURNS INTEGER AS $$
      BEGIN
        IF date_received IS NULL OR date_closed IS NULL THEN
          RETURN 0;
        ELSE
          RETURN date_closed - date_received;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create a function to auto-calculate status
    await db.query(`
      CREATE OR REPLACE FUNCTION calculate_status(tat INTEGER, expected_days INTEGER)
      RETURNS VARCHAR(50) AS $$
      BEGIN
        IF tat = 0 THEN
          RETURN 'Pending';
        ELSIF tat <= expected_days THEN
          RETURN 'Closed on time';
        ELSE
          RETURN 'Closed - exceeded';
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger function to update TAT and status automatically
    await db.query(`
      CREATE OR REPLACE FUNCTION update_tat_and_status()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Calculate TAT
        NEW.turn_around_time = calculate_tat(NEW.date_received, NEW.date_closed);
        
        -- Calculate status based on TAT and expected_days
        NEW.case_status = calculate_status(NEW.turn_around_time, NEW.expected_days);
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger for insurance_cases
    await db.query(`
      DROP TRIGGER IF EXISTS trigger_update_tat_status_insurance ON insurance_cases;
      CREATE TRIGGER trigger_update_tat_status_insurance
        BEFORE INSERT OR UPDATE ON insurance_cases
        FOR EACH ROW EXECUTE FUNCTION update_tat_and_status();
    `);

    // Add the same columns to document_verifications table
    console.log('Adding columns to document_verifications table...');
    
    await db.query(`
      ALTER TABLE document_verifications 
      ADD COLUMN IF NOT EXISTS expected_days INTEGER DEFAULT 5;
    `);

    // Rename existing columns to match the new structure
    await db.query(`
      ALTER TABLE document_verifications 
      RENAME COLUMN agent_amount_paid TO amount_paid;
    `);

    // Create trigger for document_verifications
    await db.query(`
      CREATE OR REPLACE FUNCTION update_doc_tat_and_status()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Calculate TAT
        NEW.turn_around_time = calculate_tat(NEW.date_received, NEW.date_closed);
        
        -- Calculate status based on TAT and expected_days
        NEW.turn_around_status = calculate_status(NEW.turn_around_time, NEW.expected_days);
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await db.query(`
      DROP TRIGGER IF EXISTS trigger_update_tat_status_docs ON document_verifications;
      CREATE TRIGGER trigger_update_tat_status_docs
        BEFORE INSERT OR UPDATE ON document_verifications
        FOR EACH ROW EXECUTE FUNCTION update_doc_tat_and_status();
    `);

    // Update existing records to set default expected_days and recalculate TAT/status
    console.log('Updating existing records...');
    
    await db.query(`
      UPDATE insurance_cases 
      SET expected_days = 7 
      WHERE expected_days IS NULL;
    `);

    await db.query(`
      UPDATE document_verifications 
      SET expected_days = 5 
      WHERE expected_days IS NULL;
    `);

    // Recalculate TAT and status for existing records
    await db.query(`
      UPDATE insurance_cases 
      SET turn_around_time = calculate_tat(date_received, date_closed),
          case_status = calculate_status(
            calculate_tat(date_received, date_closed), 
            expected_days
          );
    `);

    await db.query(`
      UPDATE document_verifications 
      SET turn_around_time = calculate_tat(date_received, date_closed),
          turn_around_status = calculate_status(
            calculate_tat(date_received, date_closed), 
            expected_days
          );
    `);

    console.log('Database migration completed successfully!');
    console.log('Changes made:');
    console.log('- Added expected_days column to both tables');
    console.log('- Added processing_fee and amount_paid columns to insurance_cases');
    console.log('- Renamed agent_amount_paid to amount_paid in document_verifications');
    console.log('- Created auto-calculation functions for TAT and status');
    console.log('- Created triggers to automatically update TAT and status');
    console.log('- Updated existing records with new calculations');

  } catch (error) {
    console.error('Error during database migration:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateDatabase;
