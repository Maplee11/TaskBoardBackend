import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1720073656289_3331',
  koa: {
    port: 7001,
  },
  cors: {
    origin: '*',
  },
  upload: {
    mode: 'file',
    fileSize: '50mb',
    whitelist: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.psd', '.tif', '.heic', '.pdf', '.txt'],
    tmpdir: join(__dirname, '../uploads'),
    cleanTimeout: 60 * 60 * 1000,
  },
} as MidwayConfig;
