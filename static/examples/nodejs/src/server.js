import { createApp } from './http.js';
const server = createApp();
server.on('error', (error) => {
  console.error(`Server failed: ${error.message}`);
  process.exitCode = 1;
});
server.listen(3000, '127.0.0.1', () => {
  console.log('Listening at http://127.0.0.1:3000');
});
