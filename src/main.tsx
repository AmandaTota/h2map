import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Registrar Service Worker para funcionalidade offline (PWA)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registrado:', registration.scope);
      })
      .catch((error) => {
        console.error('[PWA] Erro ao registrar Service Worker:', error);
      });
  });
}
