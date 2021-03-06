webpack = require('webpack');

module.exports = {
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:3000', // WebpackDevServer host and port
    'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
    './src/index.js',
  ],
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        APP_ID: JSON.stringify(process.env.TFP_TODO_STITCH_APP_ID),
        STITCH_URL: JSON.stringify(process.env.STITCH_URL),
      },
    }),
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
      {
        test: /\.scss$/,
        loaders: [ 'style', 'css', 'resolve-url', 'sass?sourceMap', ],
      },
    ],
  },
  resolve: { extensions: [ '', '.js', '.jsx', ], },
  output: {
    path: `${__dirname}/${process.env.DISTROOT}/dist`,
    publicPath: '/static/',
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: './dist',
    historyApiFallback: { index: 'index.html', },
  },
};
