const swaggerJsdoc = require('swagger-jsdoc');
const options = {
    swaggerDefinition: {
        info: {
            title: "Mh-app API Documentation",
            version: "1.0.0",
            description:
                "A documention of Backend API written in Nodejs.",
        },
        securityDefinitions: {
            Bearer: {
                "type": "apiKey",
                "name": "auth",
                "in": "header"
            },
        }
    },
    apis: ['./Routes/LoginRoute.js','./Routes/RegisterRoute.js','./Routes/ReviewRoute.js','./Routes/MessRoute.js','./Routes/CountRoute.js','./Routes/ForgotpassRoute.js','./Routes/PlantsRoute.js']
};
const specs = swaggerJsdoc(options);
module.exports =specs;
