import type { ModAPI, RootState } from 'afnm-types';

type AuspiciousDaysConfig = {
  enabled: boolean;
  numerologyBase: 'date' | 'character';
};

type AuspiciousDaysDebugApi = {
  getMetadata: () => {
    name: string;
    version: string;
    author: { name: string };
    description: string;
    gameVersion?: string;
  };
  getConfig: () => AuspiciousDaysConfig;
  getLastLocation: () => string | null;
  getSnapshot: () => RootState | null;
  getStatModifiers: () => { luck: number; crafting: number; damageReduction: number };
  logSnapshot: () => void;
};

declare global {
  const MOD_METADATA: {
    name: string;
    version: string;
    author: { name: string };
    description: string;
    gameVersion?: string;
  };

  interface Window {
    modAPI?: ModAPI;
    React?: {
      createElement: (...args: any[]) => any;
      useEffect?: (
        effect: () => void | (() => void),
        deps?: readonly unknown[],
      ) => void;
      useState?: <T>(
        initialState: T,
      ) => [T, (value: T | ((previousValue: T) => T)) => void];
    };
    __afnmModInstalled?: Record<string, boolean>;
    __afnmModDebug?: Record<string, AuspiciousDaysDebugApi>;
  }
}
declare const require: any;
declare module '*.jpg' {
  const value: string;
  export default value;
}

export { };

