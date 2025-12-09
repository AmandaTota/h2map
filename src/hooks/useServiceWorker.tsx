// Hook para gerenciar o Service Worker (PWA)
import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  needsUpdate: boolean;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isOnline: navigator.onLine,
    needsUpdate: false,
  });

  useEffect(() => {
    if (!state.isSupported) {
      console.log('[PWA] Service Worker não é suportado neste navegador');
      return;
    }

    // Registrar Service Worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[PWA] Service Worker registrado:', registration.scope);
        
        setState((prev) => ({ ...prev, isRegistered: true }));

        // Verificar por atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] Nova versão disponível');
                setState((prev) => ({ ...prev, needsUpdate: true }));
              }
            });
          }
        });

        // Verificar por atualizações periodicamente
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // A cada hora

      } catch (error) {
        console.error('[PWA] Erro ao registrar Service Worker:', error);
      }
    };

    registerSW();

    // Monitorar status online/offline
    const handleOnline = () => {
      console.log('[PWA] Voltou online');
      setState((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      console.log('[PWA] Ficou offline');
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Receber mensagens do Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[PWA] Mensagem do Service Worker:', event.data);
      
      if (event.data.type === 'CACHE_CLEARED') {
        console.log('[PWA] Cache limpo com sucesso');
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.isSupported]);

  // Função para atualizar o Service Worker
  const updateServiceWorker = () => {
    if (!navigator.serviceWorker.controller) return;

    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  };

  // Função para limpar o cache
  const clearCache = () => {
    if (!navigator.serviceWorker.controller) return;

    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  };

  return {
    ...state,
    updateServiceWorker,
    clearCache,
  };
}

// Componente de notificação para atualização do PWA
interface PWAUpdateNotificationProps {
  onUpdate: () => void;
}

export function PWAUpdateNotification({ onUpdate }: PWAUpdateNotificationProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-emerald-200 rounded-lg shadow-lg p-4 max-w-sm z-50 animate-in slide-in-from-bottom">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">Atualização Disponível</h3>
          <p className="text-sm text-slate-600 mt-1">
            Uma nova versão do app está disponível. Clique para atualizar.
          </p>
          <button
            onClick={onUpdate}
            className="mt-3 w-full bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Atualizar Agora
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente de indicador offline/online
export function OnlineStatusIndicator({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white rounded-full px-4 py-2 shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-top">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
        />
      </svg>
      <span className="text-sm font-medium">Modo Offline</span>
    </div>
  );
}

// Hook para detectar instalação do PWA
export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log('[PWA] Prompt de instalação capturado');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar quando o app for instalado
    const handleAppInstalled = () => {
      console.log('[PWA] App instalado');
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) {
      console.log('[PWA] Prompt de instalação não disponível');
      return false;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    console.log('[PWA] Resultado da instalação:', outcome);
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      return true;
    }
    
    return false;
  };

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    promptInstall,
  };
}

// Componente de botão para instalar PWA
export function InstallPWAButton() {
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <button
      onClick={promptInstall}
      className="fixed bottom-4 left-4 bg-emerald-600 text-white rounded-lg px-4 py-3 shadow-lg z-50 flex items-center gap-2 hover:bg-emerald-700 transition-colors animate-in slide-in-from-left"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      <span className="text-sm font-medium">Instalar App</span>
    </button>
  );
}
