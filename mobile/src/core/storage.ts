import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Armazenamento chave-valor com fallback em memória: na web o navegador pode
// bloquear o localStorage (aba privada, iframe), e o app deve continuar funcionando.
const memory = new Map<string, string>();

function webStore(kind: 'local' | 'session'): Storage | null {
  try {
    const s = kind === 'local' ? globalThis.localStorage : globalThis.sessionStorage;
    const probe = '__elo_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/** Dados do app (base local de demonstração). */
export const dataStore = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      const s = webStore('local');
      return s ? s.getItem(key) : (memory.get(key) ?? null);
    }
    return AsyncStorage.getItem(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      const s = webStore('local');
      if (s) s.setItem(key, value);
      else memory.set(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
};

const SESSION_KEY = 'elo.session';

/**
 * Token da sessão (HU-13, cenário 1): sessionStorage na web e armazenamento
 * seguro do dispositivo (Keystore/Keychain) no aplicativo.
 */
export const sessionStore = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web') {
      const s = webStore('session');
      return s ? s.getItem(SESSION_KEY) : (memory.get(SESSION_KEY) ?? null);
    }
    return SecureStore.getItemAsync(SESSION_KEY);
  },
  async set(value: string): Promise<void> {
    if (Platform.OS === 'web') {
      const s = webStore('session');
      if (s) s.setItem(SESSION_KEY, value);
      else memory.set(SESSION_KEY, value);
      return;
    }
    await SecureStore.setItemAsync(SESSION_KEY, value);
  },
  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      webStore('session')?.removeItem(SESSION_KEY);
      memory.delete(SESSION_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
