import { INestApplication } from '@nestjs/common';

export async function gracefulShutdown(signal: NodeJS.Signals, app: INestApplication<any>) {
  try {
    await app.close();
  } catch (error) {
    console.error('Error during app shutdown:', error);
  } finally {
    process.kill(process.pid, signal);
  }
}
