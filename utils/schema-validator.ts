import fs from 'fs/promises'; // fs is node js lib used to interact with file
import path from 'path'; // path for creating the path of several components to get the resultant path
import Ajv from 'ajv'; // Ajv is a JSON schema validator library for JavaScript, used to validate JSON data against defined schemas.

const SCHEMA_BASE_PATH = './response-schemas';
const ajv = new Ajv({allErrors: true}); // Create an instance of Ajv for JSON schema validation

export async function validateSchema(dirName:string, fileName:string, responseData:Object) {

    const schemaPath = path.join(SCHEMA_BASE_PATH,dirName,`${fileName}_schema.json`);
    const schema = await loadSchema(schemaPath);
    const validate = ajv.compile(schema);
    const valid = validate(responseData);
    if (!valid) {
        console.error(validate.errors);
        throw new Error(`Schema validation failed for ${fileName} in ${dirName}`);
    }
    console.log(schema);
}

//this func will return the JSON object reading it from the file.
async function loadSchema(schemaPath: string) {

    try {
        const schemaContent = await fs.readFile(schemaPath, 'utf-8');
        return JSON.parse(schemaContent);
    } catch (error:any) {
        throw new Error(`Failed to read the Schema file: ${error.message}`);
    }
}


