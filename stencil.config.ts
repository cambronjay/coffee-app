import { Config } from '@stencil/core';

export const config: Config = {
  enableCache: true,
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: false,
      baseUrl: 'https://coffee.local/',
    },
  ],
};
