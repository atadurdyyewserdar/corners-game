/**
 * Web Worker for game timer
 * Runs in a separate thread to ensure accurate timing even during heavy computation
 */

export type TimerMessage = 
  | { type: 'start'; interval: number }
  | { type: 'stop' }
  | { type: 'reset' };

export type TimerResponse = 
  | { type: 'tick' }
  | { type: 'stopped' }
  | { type: 'reset' };

let intervalId: ReturnType<typeof setInterval> | null = null;

self.onmessage = (event: MessageEvent<TimerMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'start':
      // Clear any existing interval
      if (intervalId !== null) {
        clearInterval(intervalId);
      }

      // Start new interval
      intervalId = setInterval(() => {
        self.postMessage({ type: 'tick' } as TimerResponse);
      }, message.interval);
      break;

    case 'stop':
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
        self.postMessage({ type: 'stopped' } as TimerResponse);
      }
      break;

    case 'reset':
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      self.postMessage({ type: 'reset' } as TimerResponse);
      break;

    default:
      console.warn('Unknown message type received by timer worker');
  }
};

// Handle worker termination
self.addEventListener('error', (error) => {
  console.error('Timer worker error:', error);
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
});
