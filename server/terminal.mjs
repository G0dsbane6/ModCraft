import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

const PORT = parseInt(process.env.TERMINAL_PORT || '3002', 10);

const wss = new WebSocketServer({ port: PORT, host: '127.0.0.1' });

wss.on('connection', (ws) => {
  const shell = spawn('script', ['-q', '-c', 'zsh -i', '/dev/null'], {
    env: { ...process.env, TERM: 'xterm-256color' },
  });

  const send = (data) => {
    if (ws.readyState === ws.OPEN) ws.send(data.toString());
  };

  shell.stdout.on('data', send);
  shell.stderr.on('data', send);

  ws.on('message', (data) => {
    shell.stdin.write(data.toString());
  });

  ws.on('close', () => shell.kill('SIGTERM'));
  shell.on('exit', () => ws.close());
});
