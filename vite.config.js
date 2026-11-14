import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

const entry = (path) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  build: {rollupOptions: {input: {home: entry('./index.html'), catalog: entry('./catalog/index.html')}}}
});
