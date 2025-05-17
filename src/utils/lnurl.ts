import { bech32 } from 'bech32';

export function bech32Decode(bech32str: string): string {
  const decoded = bech32.decode(bech32str, 1500);
  const bytes = bech32.fromWords(decoded.words);
  return new TextDecoder().decode(Uint8Array.from(bytes));
}

export function getLnurlpEndpoint(input: string): string {
  input = input.trim();
  if (input.match(/^lnurl[a-z0-9]+$/i)) {
    return bech32Decode(input);
  } else if (input.includes("@")) {
    const [name, domain] = input.split("@");
    return `https://${domain}/.well-known/lnurlp/${name}`;
  } else {
    throw new Error("Input must be a Lightning Address or LNURLp string");
  }
}

export async function fetchJson(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}