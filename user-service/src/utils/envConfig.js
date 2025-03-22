/**
 * Environment configuration utility
 * Helps validate required environment variables
 */
const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'PORT'
];

exports.validateEnv = () => {
    const missing = [];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }
};