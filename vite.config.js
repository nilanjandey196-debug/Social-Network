import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the social networking application.  When deployed to
// GitHub Pages you should set the `base` property to the name of your
// repository (for example '/social-network/' if your repository is named
// social-network).  When running locally the base is '/'.
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: mode === 'production' ? '/social-network/' : '/',
    server: {
      port: 5173,
    },
  };
});