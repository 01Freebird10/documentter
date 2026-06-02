import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RepoMind AI — REST Engine Specifications',
      version: '1.0.0',
      description: 'Production-ready OpenAPI API specifications for the RepoMind AI SaaS repository-to-documentation platform.',
      contact: {
        name: 'RepoMind Dev Support',
        email: 'support@repomind.ai'
      }
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Local Developer Node Gateway'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token below to authenticate requests.'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Parse routes and controllers documentation
  apis: ['./src/routes/*.js', './src/routes/api/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
