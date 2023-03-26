module.exports = {
    presets: ['@vue/app', ['@babel/preset-env', { targets: 'defaults' }]],
    plugins: ['@babel/proposal-class-properties', '@babel/plugin-proposal-optional-chaining'],
    env: {
        test: {
            presets: [['env', { targets: { node: 'current' } }]],
        },
    },
};
