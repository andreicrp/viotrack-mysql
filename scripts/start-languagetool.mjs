import { spawn } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.LANGUAGETOOL_PORT || 8010);

const checkExistingLanguageTool = () => new Promise((resolve) => {
  const request = http.get({ hostname: '127.0.0.1', port, path: '/v2/languages', timeout: 1500 }, (response) => {
    response.resume();
    resolve(response.statusCode >= 200 && response.statusCode < 300);
  });

  request.on('timeout', () => request.destroy());
  request.on('error', () => resolve(false));
});

if (await checkExistingLanguageTool()) {
  console.log(`LanguageTool is already running on port ${port}; reusing the existing service.`);
  // Keep this concurrently task alive so `npm run dev` doesn't stop its API and web tasks.
  setInterval(() => {}, 60_000);
} else {
  const java = spawn('java', [
    '-cp', 'LanguageTool/*;LanguageTool/libs/*',
    'org.languagetool.server.HTTPServer',
    '--port', String(port)
  ], { cwd: projectRoot, stdio: 'inherit' });

  const stopJava = (signal) => {
    if (!java.killed) java.kill(signal);
  };

  process.once('SIGINT', () => stopJava('SIGINT'));
  process.once('SIGTERM', () => stopJava('SIGTERM'));
  java.once('error', (error) => {
    console.error(`Could not start LanguageTool: ${error.message}`);
    process.exitCode = 1;
  });
  java.once('close', (code, signal) => {
    process.exitCode = code ?? (signal ? 1 : 0);
  });
}
