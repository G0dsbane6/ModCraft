import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

const PORT = parseInt(process.env.TERMINAL_PORT || '3002', 10);

const wss = new WebSocketServer({ port: PORT, host: '127.0.0.1' });

wss.on('connection', (ws) => {
  const shell = spawn('zsh', ['-i'], {
    env: { ...process.env, TERM: 'xterm-256color' },
    cwd: process.cwd(),
  });

  const send = (data) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(data.toString());
    }
  };

  shell.stdout.on('data', send);
  shell.stderr.on('data', send);

  ws.on('message', (data) => {
    const input = data.toString().replace(/\r/g, '\n');
    shell.stdin.write(input);
  });

  ws.on('close', () => {
    shell.kill('SIGTERM');
  });

  shell.on('exit', () => {
    ws.close();
  });
});
