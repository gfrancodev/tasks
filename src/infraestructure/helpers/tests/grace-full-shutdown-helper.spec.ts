import { describe, it, expect, vi } from 'vitest';
import { gracefulShutdown } from '../grace-full-shutdown-helper';

describe('gracefulShutdown', () => {
  it('should call app.close and process.kill with the correct signal', async () => {
    const mockApp = {
      close: vi.fn().mockResolvedValueOnce(undefined),
    };

    const signal = 'SIGINT' as NodeJS.Signals;

    const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => null);

    await gracefulShutdown(signal, mockApp as any);

    expect(mockApp.close).toHaveBeenCalledTimes(1);
    expect(killSpy).toHaveBeenCalledWith(process.pid, signal);

    killSpy.mockRestore();
  });

  it('should handle the case where app.close throws an error', async () => {
    const mockApp = {
      close: vi.fn().mockRejectedValueOnce(new Error('Failed to close app')),
    };

    const signal = 'SIGTERM' as NodeJS.Signals;

    const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => null);

    await gracefulShutdown(signal, mockApp as any);

    expect(mockApp.close).toHaveBeenCalledTimes(1);
    expect(killSpy).toHaveBeenCalledWith(process.pid, signal);

    killSpy.mockRestore();
  });
});
