const fs = require('fs');
const file = fs.readFileSync('../public/storage/documents/erd.pdf' , 'utf8')
console.log(Buffer.from(file).toString('base64'));


