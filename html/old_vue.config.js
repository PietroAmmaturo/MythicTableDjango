module.exports = {
    devServer: {
        port: 5000,
        proxy: {
            '/api': {
                target: 'https://localhost:5001',
            },
            '/swagger': {
                target: 'https://localhost:5001',
            },
        },
    },
};
