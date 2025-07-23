
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const fs = require('fs');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Spark ETL API',
      version: '1.0.0',
      description: 'API documentation for the Spark ETL application, generated from server actions.',
    },
    servers: [
      {
        url: '/api',
        description: 'Local API server',
      },
    ],
  },
  apis: [path.join(process.cwd(), 'src/app/api/**/*.ts')], // Path to your API route files
};

const specs = swaggerJsdoc(options);

const outputPath = path.join(process.cwd(), 'openapi.yaml');
fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));

console.log(`OpenAPI specification generated at ${outputPath}`);
