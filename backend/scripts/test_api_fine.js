// Test the semester fees API endpoint
const axios = require('axios');

const studentId = '68f106652ee32a382b031c2a'; // Siva Priyan
const semester = 2;

(async function() {
  try {
    const response = await axios.get(`http://localhost:5000/api/students/${studentId}/semesters/${semester}/fees`);
    
    console.log('=== API Response ===\n');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.meta) {
      console.log('\n=== Meta Data ===');
      console.log(`Total Fine Paid: ₹${response.data.meta.totalFinePaid || 0}`);
    }
    
    if (response.data.feeHeads && response.data.feeHeads.length > 0) {
      console.log('\n=== Fee Heads with Fines ===');
      response.data.feeHeads.forEach((head, i) => {
        if (head.fineAmount && head.fineAmount > 0) {
          console.log(`${i+1}. ${head.name}`);
          console.log(`   Fine Amount: ₹${head.fineAmount}`);
          console.log(`   Days Delayed: ${head.daysDelayed}`);
          console.log(`   Fine Per Day: ₹${head.finePerDay}`);
        }
      });
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})();
