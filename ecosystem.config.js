module.exports = {
  apps: [
    {
      name: 'caro-be',
      script: 'dist/main.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
