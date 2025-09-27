import { useState, useEffect, createContext, useContext } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Download, Upload, Info } from 'lucide-react';
import { usePWA } from '@/lib/pwa-manager';
import { OfflineManager } from '@/lib/offline-storage';

// Data Saver Context for global state management
interface DataSaverContextType {
  dataSaverEnabled: boolean;
  setDataSaverEnabled: (enabled: boolean) => void;
  dataUsage: { used: number; available?: number };
  isLowBandwidth: boolean;
}

const DataSaverContext = createContext<DataSaverContextType | null>(null);

export function DataSaverProvider({ children }: { children: React.ReactNode }) {
  const [dataSaverEnabled, setDataSaverEnabled] = useState(false);
  const [dataUsage, setDataUsage] = useState<{ used: number; available?: number }>({ used: 0 });
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);

  useEffect(() => {
    // Load settings from offline storage
    const loadSettings = async () => {
      try {
        const settings = await OfflineManager.getSettings();
        if (settings?.dataSaverMode) {
          setDataSaverEnabled(settings.dataSaverMode);
        }
      } catch (error) {
        console.error('Failed to load data saver settings:', error);
      }
    };

    // Check connection quality
    const checkBandwidth = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const isLow = connection?.effectiveType === '2g' || 
                     connection?.effectiveType === 'slow-2g' ||
                     connection?.saveData === true;
        setIsLowBandwidth(isLow);
        
        // Auto-enable data saver on slow connections
        if (isLow && !dataSaverEnabled) {
          setDataSaverEnabled(true);
        }
      }
    };

    // Monitor storage usage
    const updateDataUsage = async () => {
      try {
        const usage = await OfflineManager.getStorageUsage();
        setDataUsage(usage);
      } catch (error) {
        console.error('Failed to get storage usage:', error);
      }
    };

    loadSettings();
    checkBandwidth();
    updateDataUsage();

    // Listen for connection changes
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', checkBandwidth);
    }

    // Update storage usage periodically
    const interval = setInterval(updateDataUsage, 30000); // Every 30 seconds

    return () => {
      if ('connection' in navigator) {
        (navigator as any).connection?.removeEventListener('change', checkBandwidth);
      }
      clearInterval(interval);
    };
  }, [dataSaverEnabled]);

  const handleDataSaverToggle = async (enabled: boolean) => {
    setDataSaverEnabled(enabled);
    
    try {
      await OfflineManager.updateSettings({ dataSaverMode: enabled });
    } catch (error) {
      console.error('Failed to save data saver setting:', error);
    }
  };

  return (
    <DataSaverContext.Provider 
      value={{
        dataSaverEnabled,
        setDataSaverEnabled: handleDataSaverToggle,
        dataUsage,
        isLowBandwidth
      }}
    >
      {children}
    </DataSaverContext.Provider>
  );
}

export function useDataSaver() {
  const context = useContext(DataSaverContext);
  if (!context) {
    throw new Error('useDataSaver must be used within DataSaverProvider');
  }
  return context;
}

// Data Saver Toggle Component
export function DataSaverToggle() {
  const { dataSaverEnabled, setDataSaverEnabled, isLowBandwidth } = useDataSaver();
  const { isOnline } = usePWA();

  return (
    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <Wifi className={`h-4 w-4 ${isLowBandwidth ? 'text-orange-500' : 'text-green-500'}`} />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <Label htmlFor="data-saver" className="text-sm font-medium">
          Modo Ahorro de Datos
        </Label>
        {isLowBandwidth && (
          <Badge variant="outline" className="text-xs">
            Conexión Lenta
          </Badge>
        )}
      </div>
      
      <Switch
        id="data-saver"
        checked={dataSaverEnabled}
        onCheckedChange={setDataSaverEnabled}
        className="data-[state=checked]:bg-blue-600"
        data-testid="toggle-data-saver"
      />
    </div>
  );
}

// Comprehensive Data Saver Settings Panel
export function DataSaverPanel() {
  const { dataSaverEnabled, setDataSaverEnabled, dataUsage, isLowBandwidth } = useDataSaver();
  const { isOnline, isSupported, canInstall, install } = usePWA();
  const [offlineContentSize, setOfflineContentSize] = useState<number>(0);

  useEffect(() => {
    const getOfflineContentSize = async () => {
      try {
        // Estimate offline content size
        const settings = await OfflineManager.getSettings();
        if (settings) {
          // This is a rough estimate - in a real implementation you'd calculate actual sizes
          setOfflineContentSize(5.2); // MB
        }
      } catch (error) {
        console.error('Failed to calculate offline content size:', error);
      }
    };

    getOfflineContentSize();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMB = (mb: number) => {
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Configuración de Datos
        </CardTitle>
        <CardDescription>
          Optimiza el uso de datos para conexiones lentas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className={`h-4 w-4 ${isLowBandwidth ? 'text-orange-500' : 'text-green-500'}`} />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? (isLowBandwidth ? 'Conexión Lenta' : 'Conexión Buena') : 'Sin Conexión'}
            </span>
          </div>
          {isLowBandwidth && (
            <Badge variant="outline" className="text-xs">
              2G/3G
            </Badge>
          )}
        </div>

        {/* Data Saver Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="data-saver-main" className="text-sm font-medium">
              Modo Ahorro de Datos
            </Label>
            <Switch
              id="data-saver-main"
              checked={dataSaverEnabled}
              onCheckedChange={setDataSaverEnabled}
              data-testid="toggle-data-saver-panel"
            />
          </div>
          
          {dataSaverEnabled && (
            <div className="text-xs text-slate-600 dark:text-slate-400 ml-1">
              <Info className="h-3 w-3 inline mr-1" />
              Reduce calidad de imágenes y videos, desactiva auto-reproducción
            </div>
          )}
        </div>

        {/* Storage Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Almacenamiento Usado</span>
            <span className="font-medium">{formatBytes(dataUsage.used)}</span>
          </div>
          
          {dataUsage.available && (
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((dataUsage.used / dataUsage.available) * 100, 100)}%` }}
              />
            </div>
          )}
          
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Contenido offline: {formatMB(offlineContentSize)}
          </div>
        </div>

        {/* PWA Installation */}
        {isSupported && canInstall && (
          <div className="space-y-2">
            <button
              onClick={install}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              data-testid="button-install-pwa"
            >
              <Download className="h-4 w-4" />
              Instalar Aplicación
            </button>
            <div className="text-xs text-slate-600 dark:text-slate-400 text-center">
              Instala la app para mejor experiencia offline
            </div>
          </div>
        )}

        {/* Data Saving Tips */}
        {(dataSaverEnabled || isLowBandwidth) && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Consejos para Ahorrar Datos:
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Descarga contenido con WiFi</li>
              <li>• Usa modo offline cuando sea posible</li>
              <li>• Las imágenes se cargan en baja resolución</li>
              <li>• Videos no se reproducen automáticamente</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}