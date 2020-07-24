const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const entry = {};

module.exports = {
    mode: "development", //'production', //
    entry: './js/main.js',
    output: {
        filename: 'main.min.js',
        path: __dirname + "/dist"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [['@babel/preset-env', { modules: false }]]
                        }
                    }
                ]
            },
            {
                test: /\.(vert|frag|obj)$/i,
                use: 'raw-loader',
            }
        ],
    },
    // optimization: {
    //     minimize: true,
    //     minimizer: [
    //         new TerserPlugin({
    //             test: /\.js(\?.*)?$/i,
    //         })
    //     ],
    // },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: false,
        open: true,
        disableHostCheck: true
    }
};