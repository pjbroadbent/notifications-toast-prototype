const path = require('path');

const outputDir = path.resolve(__dirname, './dist');

function replaceUrl(url) {
    return url && url.replace('https://cdn.openfin.co/demos/notifications-toast-prototype/', 'http://localhost:8080/');
}

module.exports = [
    {
        devtool: 'source-map',
        entry: './src/index.ts',
        output: { path: outputDir, filename: '[name]-bundle.js' },
        resolve: { extensions: ['.ts', '.tsx', '.js'] },
        module: {
            rules: [
                { test: /\.css$/, loader: 'style-loader' },
                { test: /\.css$/, loader: 'css-loader' },
                { test: /\.module.css$/, loader: 'css-loader', query: { modules: true, localIdentName: '[name]__[local]___[hash:base64:5]' } },
                { test: /\.(png|jpg|gif|otf|svg)$/, use: [{ loader: 'url-loader', options: { limit: 8192 } }] },
                { test: /\.tsx?$/, loader: 'ts-loader' }
            ]
        },
        plugins: [],
        devServer: {
            contentBase: './res',
            before: function (app, server) {
                // Replace 'cdn.openfin.co' URL's with webpack-dev-server endpoint when running locally
                app.use(/\/?(.*app\.json)/, async (req, res, next) => {
                    const configPath = req.params[0]; // app.json path, relative to dist dir
    
                    // Parse app.json
                    const config = require(path.resolve('res', configPath));
                    const {url, applicationIcon} = config.startup_app;
    
                    // Edit manifest
                    config.startup_app.url = replaceUrl(url);
                    config.startup_app.applicationIcon = replaceUrl(applicationIcon);
    
                    // Return modified JSON to client
                    res.header('Content-Type', 'application/json; charset=utf-8');
                    res.send(JSON.stringify(config, null, 4));
                });
            },
            after: async function (app, server) {
                // Server ready, launch application
                const {connect} = require('hadouken-js-adapter');
                const fin = await connect({uuid: 'wrapper', manifestUrl: 'http://localhost:8080/app.json'});

                fin.Application.wrapSync({uuid: "notifications-toast-prototype"}).addListener('closed', () => {
                    process.exit();
                });
            }
        }
    }
];