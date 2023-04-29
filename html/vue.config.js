module.exports = {
    devServer: {
        port: 5000,
        proxy: {
            '/api': {
                // changed from https to http, otherwise django would not work
                target: 'http://127.0.0.1:5001',
            },
            '/swagger': {
                target: 'http://127.0.0.1:5001',
            },
        },
    },
};
