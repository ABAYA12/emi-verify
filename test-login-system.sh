#!/bin/bash

echo "🚀 Testing EMI Verify Login System"
echo "================================="

# Start the backend server in background
echo "📡 Starting backend server..."
cd /home/ubuntu/emi-verify/backend
npm start &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Test the login
echo "🧪 Testing login..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"emiverify@insightgridanalytic.com","password":"emi12345"}')

echo "📋 Login Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

# Check if login was successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ LOGIN SUCCESSFUL!"
else
    echo "❌ LOGIN FAILED"
    echo ""
    echo "🔧 Trying to reset password..."
    
    # Run password reset
    node -e "
    const bcrypt = require('bcryptjs');
    const { Pool } = require('pg');
    require('dotenv').config();
    
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    
    (async () => {
      try {
        const client = await pool.connect();
        const hashedPassword = await bcrypt.hash('emi12345', 12);
        await client.query('UPDATE users SET password = \$1 WHERE LOWER(email) = LOWER(\$2)', [hashedPassword, 'emiverify@insightgridanalytic.com']);
        console.log('✅ Password reset to: emi12345');
        client.release();
        process.exit(0);
      } catch (error) {
        console.error('❌ Reset failed:', error.message);
        process.exit(1);
      }
    })();
    "
    
    echo "🧪 Testing login again..."
    sleep 2
    RESPONSE2=$(curl -s -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"emiverify@insightgridanalytic.com","password":"emi12345"}')
    
    echo "📋 Login Response After Reset:"
    echo "$RESPONSE2" | jq . 2>/dev/null || echo "$RESPONSE2"
    
    if echo "$RESPONSE2" | grep -q '"success":true'; then
        echo "✅ LOGIN SUCCESSFUL AFTER RESET!"
    else
        echo "❌ LOGIN STILL FAILING"
    fi
fi

# Stop the server
echo "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null

echo "🏁 Test complete!"
