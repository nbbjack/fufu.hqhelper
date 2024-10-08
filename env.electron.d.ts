// env.electron.d.ts
export interface ElectronAPI {
  checkForUpdates: () => void;
  installUpdate: () => void;
  onUpdateReady: (callBack: Function) => void;
  minimize: () => void;
  maximize: () => void;
  restore: () => void;
  close: () => void;
  clientVersion: Promise<string>;
  httpGet: (url: string) => Promise<string>;
  simulatePing: (domain: string) => Promise<number | "error" | "timeout">;
  downloadUpdatePack: (url: string) => Promise<string>;
  openUrlByBrowser: (url: string) => void;
  copyText: (text: string) => Promise<string>;
}

// 将 `ElectronAPI` 类型暴露到全局 `window` 对象上
declare global {
  interface Window {
    electronAPI: undefined | ElectronAPI;
  }
}
