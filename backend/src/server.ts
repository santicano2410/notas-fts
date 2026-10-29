import 'dotenv/config';
import { app } from './app';
import { authService } from './config/container';

const port = Number(process.env.PORT ?? 3000);

async function start(): Promise<void> {
  await authService.register({ email: 'demo@notas.com', password: 'Demo12345' });
  app.listen(port, () => {
    console.log(`API escuchando en http://localhost:${port}`);
  });
}

void start();