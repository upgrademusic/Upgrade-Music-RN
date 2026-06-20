const store = typeof localStorage !== 'undefined' ? localStorage : null;

export const authStorage = {
  getItem: (key: string): string | null => store?.getItem(key) ?? null,
  setItem: (key: string, value: string): void => { store?.setItem(key, value); },
  removeItem: (key: string): void => { store?.removeItem(key); },
};
