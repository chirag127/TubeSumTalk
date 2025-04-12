const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    'content-bundle': './extension/content_scripts/content.js',
    'service-worker': './extension/background/service-worker.js',
    'popup': './extension/popup/popup.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'extension/manifest.json', to: 'manifest.json' },
        { from: 'extension/icons', to: 'icons' },
        { from: 'extension/popup/popup.html', to: 'popup/popup.html' },
        { from: 'extension/popup/popup.css', to: 'popup/popup.css' },
        { from: 'extension/content_scripts/widget.css', to: 'content_scripts/widget.css' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};
