const User = require('./models/User');

(async () => {
  try {
    console.log('Testing database connection...');
    const user = await User.findByEmail('emiverify@insightgridanalytic.com');
    console.log('User found:', !!user);
    
    if (user) {
      console.log('User details:', { 
        id: user.id, 
        email: user.email, 
        verified: user.verified,
        passwordLength: user.password?.length 
      });
      
      // Test different common passwords
      const passwords = ['emi12345', 'password123', 'Password123', 'emiverify123', 'admin123'];
      
      for (const pwd of passwords) {
        const isValid = await User.verifyPassword(pwd, user.password);
        console.log(`Password '${pwd}' valid:`, isValid);
      }
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
