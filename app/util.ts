// Refresh the page and signal that it should immediately prompt to connect the wallet
export function refreshPageForReconnect() {
  const url = new URL(window.location.href);
  url.searchParams.set("reconnect", "true");
  window.location.href = url.toString();
}
