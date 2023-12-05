import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts'),
          proxy: resolve(__dirname, 'electron/main/workers/proxy.ts'),
          process: resolve(__dirname, 'electron/main/workers/process.ts'),
          activity: resolve(__dirname, 'electron/main/workers/activity.ts'),
          'update-rule': resolve(__dirname, 'electron/main/workers/update-rule.ts'),
          'use-time': resolve(__dirname, 'electron/main/workers/use-time.ts')
        }
      }
    },
    plugins: [externalizeDepsPlugin(), swcPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts')
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: '.',
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src')
      }
    },
    plugins: [vue(), vuetify({ autoImport: true })]
  }
})
