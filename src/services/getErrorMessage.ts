import axios from 'axios';

function collectMessages(value: unknown): string[] {
  if (typeof value === 'string') {
    const message = value.trim();
    return message ? [message] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectMessages);
  }

  if (value && typeof value === 'object') {
    const response = value as Record<string, unknown>;
    if (typeof response.message === 'string' && response.message.trim()) {
      return [response.message.trim()];
    }
    return Object.values(response).flatMap(collectMessages);
  }

  return [];
}

export default function getErrorMessage(error: unknown, fallback = 'Something unexpected happened.') {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') return 'Server unavailable.';
    const messages = collectMessages(error.response?.data);
    if (messages.length) return [...new Set(messages)].join('\n');
    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}
