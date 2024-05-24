const webpack = require("@nativescript/webpack");

module.exports = (env) => {
    webpack.init(env);

    // Add support for worker files
    webpack.chainWebpack(config => {
        config.module
            .rule('worker')
            .test(/\.(worker)\.(js|ts)$/)
            .use('nativescript-worker-loader')
            .loader('nativescript-worker-loader')
            .options({ inline: true });
    });

    // Learn how to customize:
    // https://docs.nativescript.org/webpack

    return webpack.resolveConfig();
};