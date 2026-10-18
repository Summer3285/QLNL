import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  isDesktop: boolean;
  getAppVersion: () => Promise<string>;
  showNotification: (title: string, body: string) => void;
  savePdfFile: (buffer: ArrayBuffer, defaultName: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  openExternalUrl: (url: string) => void;
}

const electronAPI: ElectronAPI = {
  isDesktop: true,
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  showNotification: (title: string, body: string) => {
    ipcRenderer.send('app:notification', { title, body });
  },
  savePdfFile: async (buffer: ArrayBuffer, defaultName: string) => {
    return await ipcRenderer.invoke('app:save-pdf', { buffer, defaultName });
  },
  openExternalUrl: (url: string) => {
    ipcRenderer.send('app:open-external', url);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
