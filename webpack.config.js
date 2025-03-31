export default {
  plugins: [
      new webpack.ProvidePlugin({
             process: 'process/browser',
      }),
  ],
};
