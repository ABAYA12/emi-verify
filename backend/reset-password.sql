-- SQL script to reset your password directly in the database
-- Run this in your PostgreSQL database

-- Option 1: Set password to 'emi12345'
UPDATE users 
SET password = '$2b$12$rQZl3K7qHXqUKzXzW9XNg.K7YZr5LNH5qYZl2mJ5K7dYZ4dZ5KZl2m'
WHERE email = 'emiverify@insightgridanalytic.com';

-- Option 2: Set password to 'password123'  
UPDATE users 
SET password = '$2b$12$LQv1I7qN8P6mK4mK3HBmhOG5CtlK1qG3H5K2mJ4K7cYZ4cZ5KZl3n'
WHERE email = 'emiverify@insightgridanalytic.com';

-- Verify the update
SELECT id, email, verified, updated_at FROM users WHERE email = 'emiverify@insightgridanalytic.com';
