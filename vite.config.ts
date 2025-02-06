
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      '8c07d244-c093-47bd-b0fa-c5f6704f7a4f-00-356mdirsccq1z.worf.replit.dev'
    ]
  }
});
