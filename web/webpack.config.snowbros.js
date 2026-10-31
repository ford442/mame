const createConfig = require('./webpack.config');

module.exports = (env = {}) => createConfig({ ...env, game: 'snowbros' });
