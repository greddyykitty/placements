import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
    },
    server: {
        port: 3000,
        proxy: {
            '/auth': { target: 'http://backend:8080', changeOrigin: true },
            '/admin': { target: 'http://backend:8080', changeOrigin: true },
            '/student': { target: 'http://backend:8080', changeOrigin: true },
            '/analytics': { target: 'http://backend:8080', changeOrigin: true },
        }
    }
})
