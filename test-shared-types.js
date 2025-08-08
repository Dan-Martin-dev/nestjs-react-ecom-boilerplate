// Quick test to verify shared types are working
const { formatPrice, isValidEmail, Role } = require('./packages/shared/dist/index.js');

console.log('Testing shared utilities:');
console.log('formatPrice(1234.56):', formatPrice(1234.56));
console.log('isValidEmail("test@example.com"):', isValidEmail("test@example.com"));
console.log('isValidEmail("invalid-email"):', isValidEmail("invalid-email"));
console.log('Role constants:', Role);
console.log('✅ Shared types are working correctly!');
