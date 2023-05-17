module.exports = {
    devServer: {
        port: process.env.FRONTEND_PORT || 5000,
        proxy: {
            '/api': {
                target: process.env.SERVER_URL || 'http://127.0.0.1:5001',
            },
            '/swagger': {
                target: process.env.SERVER_URL || 'http://127.0.0.1:5001',
            },
        },
    },
};