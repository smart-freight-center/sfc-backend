/* eslint-disable no-console */
import { exec } from 'child_process';
import 'infrastructure/db';
export const runShellCommand = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.log(err);

        throw reject(stderr);
      }
      resolve(stdout);
    });
  });
};

export const mochaHooks = {
  async beforeAll() {
    // do something before every "integration" test

    console.log('Running BEFORE hook...');
    const stdout = await runShellCommand('npx sequelize db:migrate');
    console.log(`stdout: ${stdout}`);
  },

  async afterAll() {
    console.log('Running AFTER hook...');
    const stdout = await runShellCommand('npx sequelize db:migrate:undo:all');
    console.log(`stdout: ${stdout}`);
  },
};
