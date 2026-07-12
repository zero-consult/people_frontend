import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
    },
    server: {
        host: 'people-frontend', // node container in docker (container name)
        origin: 'http://localhost:5173', // exposed node container address
    },
    plugins: [
        react(),
        tailwindcss()
    ],
})