import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

const server = app.listen(env.port, () => {
  console.log(`CivicFix backend listening on http://localhost:${env.port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      [
        `Port ${env.port} is already in use.`,
        'The backend is likely already running in another terminal.',
        `Stop the existing process or start on another port, for example:`,
        `PowerShell: $env:PORT=${env.port + 1}; npm start`
      ].join('\n')
    );
    process.exit(1);
  }

  console.error('Failed to start CivicFix backend.');
  console.error(error);
  process.exit(1);
});

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
