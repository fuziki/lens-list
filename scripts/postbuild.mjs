// GitHub Pages は SPA のパスフォールバックを持たないため、
// マウント別パス (/lens-list/z など) 直アクセス用に index.html を複製する。
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const MOUNT_IDS = ['z', 'e', 'rf'];
const dist = resolve(import.meta.dirname, '../dist');

for (const id of MOUNT_IDS) {
  mkdirSync(resolve(dist, id), { recursive: true });
  copyFileSync(resolve(dist, 'index.html'), resolve(dist, id, 'index.html'));
  console.log(`Copied index.html -> dist/${id}/index.html`);
}
