import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ou l'équivalent de votre framework (Vue, Svelte, etc.)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // -------------------------------------------------------------------
  // AJOUT CRUCIAL POUR DOCKER
  server: {
    // Permet au conteneur d'écouter sur toutes les interfaces réseau (0.0.0.0)
    // ce qui est nécessaire pour que Docker puisse mapper le port 5173 à l'hôte.
    host: '0.0.0.0', 
    port: 5173
  }
  // -------------------------------------------------------------------
})