module.exports = {
  apps: [
    {
      name: 'midway-app',
      script: 'bootstrap.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
