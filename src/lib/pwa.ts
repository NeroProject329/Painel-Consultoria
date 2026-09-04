type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let installPrompt: InstallEvent | null = null;
const listeners = new Set<() => void>();
export function captureInstallPrompt(event: Event) {
  event.preventDefault();
  installPrompt = event as InstallEvent;
  listeners.forEach((listener) => listener());
}
export function clearInstallPrompt() {
  installPrompt = null;
  listeners.forEach((listener) => listener());
}
export const getInstallPrompt = () => installPrompt;
export const getServerInstallPrompt = () => null;
export function subscribeInstallPrompt(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
