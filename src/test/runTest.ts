/**
 * Test runner configuration
 */

import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/extension.test');

    // Download VS Code, unzip it and run the integration tests
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      vscodeExecutablePath: 'C:\Users\DELL\Desktop\CS101\FYP\verno\.vscode-test\vscode-win32-x64-archive-1.109.0\Code.exe',
    });
  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
