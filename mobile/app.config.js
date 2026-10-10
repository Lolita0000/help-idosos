// Permite publicar a versão web em um subcaminho (ex.: GitHub Pages em /help-idosos).
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL || '',
  },
});
