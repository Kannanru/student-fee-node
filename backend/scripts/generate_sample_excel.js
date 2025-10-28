// Generate sample Excel file for bulk fee upload testing
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Sample data - mix of valid and test scenarios
const sampleData = [
  // Valid entries
  {
    'Student ID': 'STU001234',
    'Fee Year': '1',
    'Payment Status': 'Paid'
  },
  {
    'Student ID': 'BDS000030',
    'Fee Year': '1',
    'Payment Status': 'Paid'
  },
  {
    'Student ID': 'EN2024BDS030',
    'Fee Year': '1st Year',
    'Payment Status': 'Not Paid'
  },
  // More samples
  {
    'Student ID': 'STU001235',
    'Fee Year': '2',
    'Payment Status': 'Paid'
  },
  {
    'Student ID': 'STU001236',
    'Fee Year': '1',
    'Payment Status': 'Not Paid'
  },
  // Example with different formats
  {
    'Student ID': 'STU001237',
    'Fee Year': '2nd Year',
    'Payment Status': 'Paid'
  },
  {
    'Student ID': 'STU001238',
    'Fee Year': '3',
    'Payment Status': 'Not Paid'
  }
];

// Create workbook
const worksheet = XLSX.utils.json_to_sheet(sampleData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Upload');

// Set column widths
worksheet['!cols'] = [
  { wch: 15 },
  { wch: 12 },
  { wch: 15 }
];

// Add header styling (basic - Excel will interpret)
const range = XLSX.utils.decode_range(worksheet['!ref']);
for (let C = range.s.c; C <= range.e.c; ++C) {
  const address = XLSX.utils.encode_col(C) + "1";
  if (!worksheet[address]) continue;
  worksheet[address].s = {
    font: { bold: true },
    fill: { fgColor: { rgb: "CCCCCC" } }
  };
}

// Write file
const outputDir = path.join(__dirname, '..', 'public', 'templates');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'sample_fee_upload.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`✓ Sample Excel file created: ${outputPath}`);
console.log('\nSample data includes:');
console.log(`- ${sampleData.length} rows`);
console.log(`- Mix of "Paid" and "Not Paid" statuses`);
console.log(`- Different year formats (1, 2, "1st Year", "2nd Year")`);
console.log('\nYou can use this file for testing bulk upload!');
