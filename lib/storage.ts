import type { CategoriasCustomizadas, Lancamento, Usuario } from '@/types';
import { EMPTY_CATEGORIAS_CUSTOMIZADAS, STORAGE_KEYS } from '@/lib/constants';

// Camada de acesso ao localStorage. Nunca lança exceção: SSR, storage indisponível/bloqueado
// (modo privado, quota excedida) e JSON corrompido degradam para o valor padrão em vez de quebrar o app.

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isStorageAvailable(): boolean {
  if (!isBrowser()) return false;
  try {
    const probeKey = '__bolsou_storage_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function getItem<T>(key: string, fallback: T): T {
  if (!isStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[bolsou] Falha ao ler "${key}" do localStorage, usando valor padrão.`, error);
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[bolsou] Falha ao gravar "${key}" no localStorage.`, error);
    return false;
  }
}

export function removeItem(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[bolsou] Falha ao remover "${key}" do localStorage.`, error);
  }
}

/** Remove só as chaves do BolsoU (não `localStorage.clear()`, para não afetar outros dados do domínio). */
export function clearAllBolsouData(): void {
  removeItem(STORAGE_KEYS.usuario);
  removeItem(STORAGE_KEYS.lancamentos);
  removeItem(STORAGE_KEYS.categorias);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function loadUsuario(): Usuario | null {
  return getItem<Usuario | null>(STORAGE_KEYS.usuario, null);
}

export function saveUsuario(usuario: Usuario): void {
  setItem(STORAGE_KEYS.usuario, usuario);
}

export function loadLancamentos(): Lancamento[] {
  return getItem<Lancamento[]>(STORAGE_KEYS.lancamentos, []);
}

export function saveLancamentos(lancamentos: Lancamento[]): void {
  setItem(STORAGE_KEYS.lancamentos, lancamentos);
}

export function loadCategoriasCustomizadas(): CategoriasCustomizadas {
  return getItem<CategoriasCustomizadas>(STORAGE_KEYS.categorias, EMPTY_CATEGORIAS_CUSTOMIZADAS);
}

export function saveCategoriasCustomizadas(categorias: CategoriasCustomizadas): void {
  setItem(STORAGE_KEYS.categorias, categorias);
}
