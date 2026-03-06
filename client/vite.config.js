import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Invoice Custom Kekinian',
                short_name: 'Invoice CK',
                theme_color: '#325C74',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: '/logo.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/logo.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    server: {
        host: '127.0.0.1',
        port: 5173
    }
})
