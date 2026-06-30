import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server });

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

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
