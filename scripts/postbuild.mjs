// GitHub Pages は SPA のパスフォールバックを持たないため、
// マウント別パス (/lens-list/z など) 直アクセス用に index.html を複製する。
// マウント一覧は public/data/ 配下のディレクトリ (= dist/data/ にコピーされる)
// から動的に導出し、src/lib/mounts.ts の MOUNTS との二重管理を避ける。
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(import.meta.dirname, '../dist');
const MOUNT_IDS = readdirSync(resolve(dist, 'data'), { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name);

for (const id of MOUNT_IDS) {
  mkdirSync(resolve(dist, id), { recursive: true });
  copyFileSync(resolve(dist, 'index.html'), resolve(dist, id, 'index.html'));
  console.log(`Copied index.html -> dist/${id}/index.html`);
}
