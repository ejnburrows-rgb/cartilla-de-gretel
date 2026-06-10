const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });

const schemaPath = path.join(__dirname, '../src/data/teacher-guide.schema.json');
const dataPath = path.join(__dirname, '../src/data/teacher-guide.json');

try {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    console.log("PASS");
    process.exit(0);
  } else {
    console.error("FAIL");
    console.error("Errors detail:");
    console.error(JSON.stringify(validate.errors, null, 2));
    process.exit(1);
  }
} catch (err) {
  console.error("FAIL: Error reading or compiling files:", err.message);
  process.exit(1);
}
