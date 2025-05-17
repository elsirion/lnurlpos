export function getParam(name: string): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export function setParam(name: string, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.replaceState({}, '', url.toString());
}