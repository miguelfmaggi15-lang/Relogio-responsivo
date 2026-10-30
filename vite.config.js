import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/Relogio-responsivo/" : "/",
  server:{watch:{ignored:['**/evidence/**','**/references/**','**/.tools/**']}},
});
