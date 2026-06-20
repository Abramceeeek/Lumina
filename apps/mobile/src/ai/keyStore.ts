import * as SecureStore from 'expo-secure-store';

// BYOK key lives in the device keychain — never the DB, never logs (CLAUDE.md §6).
const KEY = 'lumina_anthropic_key';

export async function getApiKey(): Promise<string | null> {
  try {
    return (await SecureStore.getItemAsync(KEY)) || null;
  } catch {
    return null;
  }
}

export async function setApiKey(value: string): Promise<void> {
  await SecureStore.setItemAsync(KEY, value);
}

export async function clearApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
