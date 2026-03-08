module.exports = {
  apps: [
    {
      name: 'test_aws_be',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 3001,
      },
      watch: false,
    },
  ],
};
