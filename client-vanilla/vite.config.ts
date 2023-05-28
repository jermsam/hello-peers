import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    nodePolyfills(),
    topLevelAwait()
  ]
})
