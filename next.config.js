/* eslint-disable no-param-reassign */

module.exports = {
  webpack: (config) => {
    config.resolve.extensions = [
      ...config.resolve.extensions || [],
      'mjs',
    ];

    return config;
  },
};
