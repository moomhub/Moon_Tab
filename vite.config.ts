import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import svgLoader from 'vite-svg-loader';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import vueDevTools from 'vite-plugin-vue-devtools';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from 'unplugin-vue-components/resolvers';
import terser from '@rollup/plugin-terser';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    svgLoader({ svgoConfig: {} }),
    VueSetupExtend(),
    AutoImport({
      //  自动导入vue和vue-router相关函数
      imports: ['vue', 'vue-router', 'pinia'],
      //  生成 `auto-import.d.ts` 全局声明
      dts: './auto-imports.d.ts',
      resolvers: [
        TDesignResolver({
          library: 'vue-next',
        }),
      ],
      eslintrc: {
        // 已存在文件设置默认 false，需要更新时再打开，防止每次更新都重新生成
        enabled: false,
        // 生成文件地址和名称
        filepath: './eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),
    Components({
      resolvers: [
        TDesignResolver({
          library: 'vue-next',
        }),
      ],
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './src'),
      },
      {
        find: 'assets',
        replacement: resolve(__dirname, './src/assets'),
      },
      {
        find: 'vue',
        replacement: 'vue/dist/vue.esm-bundler.js', // compile template
      },
    ],
    extensions: ['.ts', '.js'],
  },
  define: {
    'process.env': {},
  },
  build: {
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        }),
      ],
      output: {
        sourcemap: false,
        manualChunks: {
          tdesign: ['tdesign-vue-next'],
          swiper: ['swiper'],
          aws: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
        },
        assetFileNames: (assetInfo) => {
          // 对特定类型的静态资源文件使用固定名称（不加 hash）
          const noHashExtensions = ['svg', 'webp', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'wmv'];
          if (assetInfo.name) {
            const ext = assetInfo.name.split('.').pop()?.toLowerCase();
            if (ext && noHashExtensions.includes(ext)) {
              return 'assets/[name].[ext]';
            }
          }
          // 其他资源保持默认 hash
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
