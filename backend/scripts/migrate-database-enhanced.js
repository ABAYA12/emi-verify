const db = require('../config/database');

const migrateDatabase = async () => {
  try {
    console.log('Starting enhanced database migration...');

    // First, update the insurance_cases table structure
    console.log('Updating insurance_cases table...');
    
    // Add missing columns to insurance_cases
    await db.query(`
      ALTER TABLE insurance_cases 
      ADD COLUMN IF NOT EXISTS expected_days INTEGER DEFAULT 7,
      ADD COLUMN IF NOT EXISTS processing_fee DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0;
    `);

    // Update the document_verifications table structure
    console.log('Updating document_verifications table...');
    
    // Add missing columns and fix column names for document_verifications
    await db.query(`
      ALTER TABLE document_verifications 
      ADD COLUMN IF NOT EXISTS expected_days INTEGER DEFAULT 5,
      ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0;
    `);

    // Rename agent_amount_paid to amount_paid if it exists (for consistency)
    await db.query(`
      DO $$ 
      BEGIN 
        IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='document_verifications' AND column_name='agent_amount_paid') THEN
          ALTER TABLE document_verifications RENAME COLUMN agent_amount_paid TO amount_paid;
        END IF;
      END $$;
    `);

    // Create or replace the function to calculate TAT and status
    console.log('Creating TAT and status calculation functions...');
    
    await db.query(`
      CREATE OR REPLACE FUNCTION calculate_tat_and_status()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Calculate turnaround time (TAT)
        IF NEW.date_received IS NOT NULL AND NEW.date_closed IS NOT NULL THEN
          NEW.turn_around_time = NEW.date_closed - NEW.date_received;
        ELSE
          NEW.turn_around_time = 0;
        END IF;
        
        -- Calculate case status based on TAT and expected days
        IF NEW.turn_around_time = 0 THEN
          NEW.case_status = 'Pending';
        ELSIF NEW.turn_around_time > 0 AND NEW.turn_around_time <= COALESCE(NEW.expected_days, 7) THEN
          NEW.case_status = 'Closed on time';
        ELSIF NEW.turn_around_time > COALESCE(NEW.expected_days, 7) THEN
          NEW.case_status = 'Closed - exceeded';
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create or replace the function for document verifications TAT and status
    await db.query(`
      CREATE OR REPLACE FUNCTION calculate_doc_tat_and_status()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Calculate turnaround time (TAT)
        IF NEW.date_received IS NOT NULL AND NEW.date_closed IS NOT NULL THEN
          NEW.turn_around_time = NEW.date_closed - NEW.date_received;
        ELSE
          NEW.turn_around_time = 0;
        END IF;
        
        -- Calculate status based on TAT and expected days
        IF NEW.turn_around_time = 0 THEN
          NEW.turn_around_status = 'Pending';
        ELSIF NEW.turn_around_time > 0 AND NEW.turn_around_time <= COALESCE(NEW.expected_days, 5) THEN
          NEW.turn_around_status = 'Closed on time';
        ELSIF NEW.turn_around_time > COALESCE(NEW.expected_days, 5) THEN
          NEW.turn_around_status = 'Closed - exceeded';
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Drop existing triggers if they exist and create new ones
    console.log('Setting up triggers for auto-calculation...');
    
    await db.query(`
      DROP TRIGGER IF EXISTS insurance_case_tat_trigger ON insurance_cases;
      CREATE TRIGGER insurance_case_tat_trigger
        BEFORE INSERT OR UPDATE ON insurance_cases
        FOR EACH ROW EXECUTE FUNCTION calculate_tat_and_status();
    `);

    await db.query(`
      DROP TRIGGER IF EXISTS doc_verification_tat_trigger ON document_verifications;
      CREATE TRIGGER doc_verification_tat_trigger
        BEFORE INSERT OR UPDATE ON document_verifications
        FOR EACH ROW EXECUTE FUNCTION calculate_doc_tat_and_status();
    `);

    // Update existing records to calculate TAT and status
    console.log('Updating existing records with calculated values...');
    
    await db.query(`
      UPDATE insurance_cases 
      SET 
        turn_around_time = CASE 
          WHEN date_received IS NOT NULL AND date_closed IS NOT NULL 
          THEN date_closed - date_received 
          ELSE 0 
        END,
        case_status = CASE 
          WHEN date_received IS NULL OR date_closed IS NULL 
          THEN 'Pending'
          WHEN (date_closed - date_received) <= COALESCE(expected_days, 7) 
          THEN 'Closed on time'
          ELSE 'Closed - exceeded'
        END
      WHERE turn_around_time IS NULL OR case_status IS NULL;
    `);

    await db.query(`
      UPDATE document_verifications 
      SET 
        turn_around_time = CASE 
          WHEN date_received IS NOT NULL AND date_closed IS NOT NULL 
          THEN date_closed - date_received 
          ELSE 0 
        END,
        turn_around_status = CASE 
          WHEN date_received IS NULL OR date_closed IS NULL 
          THEN 'Pending'
          WHEN (date_closed - date_received) <= COALESCE(expected_days, 5) 
          THEN 'Closed on time'
          ELSE 'Closed - exceeded'
        END
      WHERE turn_around_time IS NULL OR turn_around_status IS NULL;
    `);

    // Create indexes for better performance on new columns
    console.log('Creating performance indexes...');
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_insurance_cases_expected_days ON insurance_cases(expected_days);
      CREATE INDEX IF NOT EXISTS idx_insurance_cases_processing_fee ON insurance_cases(processing_fee);
      CREATE INDEX IF NOT EXISTS idx_insurance_cases_amount_paid ON insurance_cases(amount_paid);
      CREATE INDEX IF NOT EXISTS idx_insurance_cases_tat ON insurance_cases(turn_around_time);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_doc_verifications_expected_days ON document_verifications(expected_days);
      CREATE INDEX IF NOT EXISTS idx_doc_verifications_amount_paid ON document_verifications(amount_paid);
      CREATE INDEX IF NOT EXISTS idx_doc_verifications_tat ON document_verifications(turn_around_time);
    `);

    console.log('Enhanced database migration completed successfully!');
    console.log('✓ Added expected_days, processing_fee, amount_paid columns');
    console.log('✓ Created auto-calculation triggers for TAT and status');
    console.log('✓ Updated existing records with calculated values');
    console.log('✓ Created performance indexes');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during enhanced database migration:', error);
    process.exit(1);
  }
};

migrateDatabase();
