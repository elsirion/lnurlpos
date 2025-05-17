// Utility to fetch and cache currency conversion rates vs BTC
// Fetches from https://price-feed.dev.fedibtc.com/latest every 60s in the background

const PRICE_FEED_URL = 'https://price-feed.dev.fedibtc.com/latest';
const SATS_PER_BTC = 1e8;
const LOCALSTORAGE_KEY = 'currencyRatesCache';
const LOCALSTORAGE_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

export type CurrencyRateMap = Record<string, number>;

function loadRatesFromLocalStorage(): CurrencyRateMap | null {
  try {
    const item = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!item) return null;
    const { rates, timestamp } = JSON.parse(item);
    if (typeof rates !== 'object' || typeof timestamp !== 'number') return null;
    if (Date.now() - timestamp > LOCALSTORAGE_TTL_MS) return null;
    return rates;
  } catch {
    return null;
  }
}

function saveRatesToLocalStorage(rates: CurrencyRateMap) {
  try {
    localStorage.setItem(
      LOCALSTORAGE_KEY,
      JSON.stringify({ rates, timestamp: Date.now() })
    );
  } catch {
    // Ignore localStorage errors
  }
}

let cachedRates: CurrencyRateMap = loadRatesFromLocalStorage() || { sat: 1/SATS_PER_BTC };

async function fetchRates(): Promise<CurrencyRateMap> {
  const res = await fetch(PRICE_FEED_URL);
  if (!res.ok) throw new Error('Failed to fetch price feed');
  const data = await res.json();
  const prices = data.prices;
  const btcUsd = prices['BTC/USD']?.rate;
  if (!btcUsd) throw new Error('BTC/USD rate missing');
  const map: CurrencyRateMap = { sat: 1/SATS_PER_BTC };
  map["USD"] = 1 / btcUsd;
  for (const key in prices) {
    if (key === 'BTC/USD') continue;
    const [cur, quote] = key.split('/');
    if (quote !== 'USD') continue;
    const rate = prices[key].rate;
    // Conversion: 1 unit of cur = (rate / btcUsd) BTC
    map[cur] = rate / btcUsd;
  }
  return map;
}

type RateListener = (rates: CurrencyRateMap) => void;
const listeners: RateListener[] = [];

export function subscribeToRates(listener: RateListener) {
  listeners.push(listener);
  // Immediately call with current rates
  listener(cachedRates);
  return () => {
    // Unsubscribe
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  for (const listener of listeners) {
    listener(cachedRates);
  }
}

async function updateRates() {
  try {
    cachedRates = await fetchRates();
    saveRatesToLocalStorage(cachedRates);
    notifyListeners(); // Notify all subscribers
  } catch (e) {
    // Ignore fetch errors, keep old cache
  }
}

// Start background fetch loop on module load
updateRates(); // Initial fetch
setInterval(updateRates, 60 * 1000); // Every 60 seconds

export function getCurrencyRateMap(): CurrencyRateMap {
  return cachedRates;
}