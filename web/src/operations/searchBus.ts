/**
 * Связь глобального поиска (⌘K в шапке) со страницей «Операции».
 * Поиск может сработать на любой странице: запрос запоминается и подхватывается,
 * когда страница операций откроется.
 */
export interface OperationsSearchRequest {
  query?: string;
  category?: string;
}

type Listener = (request: OperationsSearchRequest) => void;

let pending: OperationsSearchRequest | null = null;
const listeners = new Set<Listener>();

export function requestOperationsSearch(request: OperationsSearchRequest): void {
  pending = request;
  listeners.forEach((listener) => listener(request));
}

export function takePendingSearch(): OperationsSearchRequest | null {
  const request = pending;
  pending = null;
  return request;
}

export function subscribeOperationsSearch(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
