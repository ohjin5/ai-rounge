export function getClientId(): string {
  const storageKey = 'ai-idea-garden-client-id';

  let clientId = localStorage.getItem(storageKey);

  if (!clientId) {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      clientId = crypto.randomUUID();
    } else {
      clientId =
        'client-' +
        Date.now().toString(36) +
        '-' +
        Math.random().toString(36).slice(2);
    }

    localStorage.setItem(storageKey, clientId);
  }

  return clientId;
}
