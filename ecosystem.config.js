module.exports = {
  apps: [
    {
      name: 'test_aws_be',
      script: 'dist/main.js',
      // Trước khi chạy PM2 production, build trước:
      //   cd test_aws_be && npm install && npm run build
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch: false,
    },
  ],
};

