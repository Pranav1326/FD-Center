const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
      title: 'FD-Center',
      description: 'An API to make fixed deposits.'
    },
    host: 'localhost:5000',
    basePath: "",
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            name: "User",
            description: "Endpoints"
        },
        {
            name: "Wallet",
            description: "Endpoints"
        },
        {
            name: "Fd",
            description: "Endpoints"
        },
        {
            name: "Admin",
            description: "Endpoints"
        },
        {
            name: "SuperAdmin",
            description: "Endpoints"
        },
        {
            name: "Rate",
            description: "Endpoints"
        },
        {
            name: "Transaction",
            description: "Endpoints"
        },
    ],
    securityDefinitions: {},
    definitions: {}
};

const outputFile = "./swagger-output.json";
const endPointsFile = ["./app.js"];

swaggerAutogen(outputFile, endPointsFile, doc);