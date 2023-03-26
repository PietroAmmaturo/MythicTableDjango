module.exports = {
    devServer: {
        port: 5000,
        proxy: {
            '/api': {
                // changed from https to http, otherwise django would not work
                target: 'http://localhost:5001',
            },
            '/swagger': {
                target: 'http://localhost:5001',
            },
        },
    },
};
