export const mockLatency = (ms = 120) =>
  new Promise((resolve) => setTimeout(resolve, ms));
