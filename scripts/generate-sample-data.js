const DataImporter = require('../utils/DataImporter');

const generateSampleData = async () => {
  try {
    console.log('🎯 Generating sample data for EMI Verify...');
    
    const result = await DataImporter.generateSampleData();
    
    console.log('✅ Sample data generation completed!');
    console.log(`📊 Created ${result.insurance_cases} insurance cases`);
    console.log(`📄 Created ${result.document_verifications} document verifications`);
    console.log('');
    console.log('🚀 You can now:');
    console.log('   • View data: GET /api/insurance-cases');
    console.log('   • View data: GET /api/document-verifications');
    console.log('   • Check analytics: GET /api/analytics/dashboard');
    console.log('   • Export CSV: GET /api/export/insurance-cases');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    process.exit(1);
  }
};

generateSampleData();
