import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import {loadEnv} from "vite";


export default ({mode}: { mode: string }) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd())};

    return defineConfig({
        legacy: { inconsistentCjsInterop: true },
        test: {
            globals: true,
            environment: "jsdom",
        },
        server: {
            host: process.env.VITE_PEOPLE_HOST, // node container in docker (container name)
            origin: 'http://localhost:5173', // exposed node container address
            port: 5173,
        },
        plugins: [
            react(),
            tailwindcss()
        ],
    })
}