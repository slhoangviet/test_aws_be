module.exports = {
  apps: [
    {
      name: 'test_aws_be',
      script: 'dist/main.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      watch: false,
    },
  ],
};
