// Import styles
import "../style.css";
import "flowbite";
import { bech32 } from "bech32";
import QRCode from "qrcode";

// Insert the app HTML into #app
document.getElementById("app")!.innerHTML = `
  <div class="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-center">Lightning Point of Sale</h2>
    <div id="address-form-section" class="mb-6 hidden">
      <form id="address-form" class="space-y-4">
        <div>
          <label for="address-input" class="block mb-1 text-sm font-medium text-gray-700">Lightning Address or LNURLp</label>
          <input type="text" id="address-input" required placeholder="someone@domain.com or lnurl1..." class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        </div>
        <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center">
          Continue
        </button>
      </form>
    </div>
    <form id="pos-form" class="space-y-4 hidden">
      <div>
        <label for="amount" class="block mb-1 text-sm font-medium text-gray-700">Amount (sats)</label>
        <input type="number" id="amount" min="1" required class="bg-gray-50 border border-gray-300 text-gray-900 text-2xl rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 text-center" placeholder="0" readonly>
      </div>
      <div id="numpad" class="grid grid-cols-3 gap-2 mb-2">
        <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">1</button>
        <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">2</button>
        <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">3</button>
        <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">4</button>
        <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">5</button>
        <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">6</button>
        <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">7</button>
        <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">8</button>
        <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">9</button>
        <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">C</button>
        <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">0</button>
        <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">⌫</button>
      </div>
      <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center">
        <svg class="w-5 h-5 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="bitcoin" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.1-111 248-248 248S8 392.1 8 256 119 8 256 8s248 111 248 248zm-141.7-35.33c4.937-32.1-20.19-50.74-54.55-62.57l11.15-44.7-27.21-6.781-10.85 43.52c-7.154-1.783-14.5-3.464-21.8-5.13l10.93-43.81-27.2-6.781-11.15 44.69c-5.922-1.349-11.73-2.682-17.38-4.084l.031-.14-37.53-9.37-7.239 29.06s20.19 4.627 19.76 4.913c11.02 2.751 13.01 10.04 12.68 15.82l-12.7 50.92c.76 .194 1.744 .473 2.829 .907-.907-.225-1.876-.473-2.876-.713l-17.8 71.34c-1.349 3.348-4.767 8.37-12.47 6.464 .271 .395-19.78-4.937-19.78-4.937l-13.51 31.15 35.41 8.827c6.588 1.651 13.05 3.379 19.4 5.006l-11.26 45.21 27.18 6.781 11.15-44.73a1038 1038 0 0 0 21.69 5.627l-11.11 44.52 27.21 6.781 11.26-45.13c46.4 8.781 81.3 5.239 95.99-36.73 11.84-33.79-.589-53.28-25-65.99 17.78-4.098 31.17-15.79 34.75-39.95zm-62.18 87.18c-8.41 33.79-65.31 15.52-83.75 10.94l14.94-59.9c18.45 4.603 77.6 13.72 68.81 48.96zm8.417-87.67c-7.673 30.74-55.03 15.12-70.39 11.29l13.55-54.33c15.36 3.828 64.84 10.97 56.85 43.03z"></path></svg>
        Request Invoice
      </button>
    </form>
    <div id="invoice-section" style="display:none;" class="mt-8">
      <div class="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
        <div id="qr" class="mb-4"></div>
        <div class="w-full flex flex-col items-center">
          <strong class="mb-1">Invoice:</strong>
          <div class="flex items-center w-full gap-2">
            <div id="invoice" class="truncate bg-white border border-gray-200 rounded-md px-2 py-1 text-xs w-full whitespace-nowrap select-all" aria-label="Lightning Invoice"></div>
            <button id="copy-btn" type="button" class="ml-2 text-gray-500 hover:text-blue-700 focus:ring-2 focus:ring-blue-300 rounded-lg p-1.5" title="Copy invoice" aria-label="Copy invoice">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16 4v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4m0 0a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2zm0 0v2m0 0a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4"/></svg>
            </button>
          </div>
        </div>
        <div id="status" class="mt-4 text-center font-semibold"></div>
      </div>
    </div>
  </div>
`;

// --- URL param helpers ---
function getParam(name: string): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}
function setParam(name: string, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.location.href = url.toString();
}

// --- Show correct form depending on URL param ---
const lnurlParam = getParam('lnurl');
const lnaddressParam = getParam('lnaddress');
let lnInputValue = lnurlParam || lnaddressParam || null;
if (!lnInputValue) {
  document.getElementById('address-form-section')!.classList.remove('hidden');
  (document.getElementById('address-form') as HTMLFormElement).onsubmit = function(e) {
    e.preventDefault();
    const val = (document.getElementById('address-input') as HTMLInputElement).value.trim();
    if (!val) return;
    if (val.match(/^lnurl[a-z0-9]+$/i)) {
      setParam('lnurl', val);
    } else if (val.includes('@')) {
      setParam('lnaddress', val);
    } else {
      alert('Please enter a valid Lightning Address or LNURLp string.');
    }
  };
} else {
  document.getElementById('pos-form')!.classList.remove('hidden');
}

// --- Numpad logic ---
function updateAmountInput(val: string) {
  const input = document.getElementById('amount') as HTMLInputElement;
  if (val === 'C') {
    input.value = '';
  } else if (val === '⌫') {
    input.value = input.value.slice(0, -1);
  } else {
    if (input.value.length < 9) input.value += val;
  }
}
document.querySelectorAll('.numpad-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    updateAmountInput((this as HTMLElement).textContent!);
  });
});

// --- Existing PoS logic, only run if lnInputValue is set ---
// Replace makeQR with async QR code generation using 'qrcode' as SVG
async function makeQR(text: string, size = 256): Promise<string> {
  const svg = await QRCode.toString(text, { type: 'svg', width: size, margin: 2 });
  // Add Tailwind/Flowbite classes to the SVG root element
  return svg.replace('<svg', `<svg class=\"rounded-lg border border-gray-300\" width=\"${size}\" height=\"${size}\"`);
}

async function fetchJson(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Bech32 decode for LNURLp using the official bech32 library
function bech32Decode(bech32str: string): string {
  const decoded = bech32.decode(bech32str, 1500); // 1500 for long LNURLs
  const bytes = bech32.fromWords(decoded.words);
  return new TextDecoder().decode(Uint8Array.from(bytes));
}

function getLnurlpEndpoint(input: string): string {
  input = input.trim();
  if (input.match(/^lnurl[a-z0-9]+$/i)) {
    // LNURLp bech32 string
    return bech32Decode(input);
  } else if (input.includes("@")) {
    // Lightning Address
    const [name, domain] = input.split("@");
    return `https://${domain}/.well-known/lnurlp/${name}`;
  } else {
    throw new Error("Input must be a Lightning Address or LNURLp string");
  }
}

if (lnInputValue) {
  (document.getElementById('pos-form') as HTMLFormElement).onsubmit = async (e) => {
    e.preventDefault();
    const amount = parseInt((document.getElementById('amount') as HTMLInputElement).value, 10);
    if (!amount || amount < 1) return alert('Please enter an amount.');
    const input = lnInputValue;
    (document.getElementById('invoice-section') as HTMLElement).style.display = "none";
    (document.getElementById('status') as HTMLElement).textContent = "Requesting invoice...";
    try {
      // 1. Get LNURLp endpoint
      const lnurlp = getLnurlpEndpoint(input);
      const lnurlpResp = await fetchJson(lnurlp);
      // 2. Request invoice
      const callback = lnurlpResp.callback;
      const min = lnurlpResp.minSendable / 1000, max = lnurlpResp.maxSendable / 1000;
      if (amount < min || amount > max) throw new Error(`Amount must be between ${min} and ${max} sats`);
      const cbUrl = `${callback}?amount=${amount * 1000}`;
      const invoiceResp = await fetchJson(cbUrl);
      if (invoiceResp.status === "ERROR") throw new Error(invoiceResp.reason);
      const pr = invoiceResp.pr;
      const verifyUrl = invoiceResp.verify; // LUD-21
      // 3. Show invoice
      (document.getElementById('invoice-section') as HTMLElement).style.display = "";
      (document.getElementById('invoice') as HTMLElement).textContent = pr;
      (document.getElementById('status') as HTMLElement).textContent = "Waiting for payment...";
      // Generate and display QR code
      makeQR(pr).then(qrHtml => {
        (document.getElementById('qr') as HTMLElement).innerHTML = qrHtml;
      });
      // Copy button
      (document.getElementById('copy-btn') as HTMLElement).onclick = function() {
        navigator.clipboard.writeText(pr);
        (this as HTMLButtonElement).classList.add('text-green-600');
        setTimeout(() => (this as HTMLButtonElement).classList.remove('text-green-600'), 1000);
      };
      // 4. Poll LUD-21 verify endpoint
      if (!verifyUrl) {
        (document.getElementById('status') as HTMLElement).textContent = "This address does not support LUD-21 verify.";
        return;
      }
      let paid = false, tries = 0;
      while (!paid && tries < 60) { // poll for up to 2 minutes
        await new Promise(res => setTimeout(res, 2000));
        const v = await fetchJson(verifyUrl);
        if (v.settled) {
          paid = true;
          (document.getElementById('status') as HTMLElement).textContent = "✅ Payment received!";
        }
        tries++;
      }
      if (!paid) (document.getElementById('status') as HTMLElement).textContent = "⏰ Payment not detected (timeout).";
    } catch (err: any) {
      (document.getElementById('status') as HTMLElement).textContent = "Error: " + err.message;
      (document.getElementById('invoice-section') as HTMLElement).style.display = "";
    }
  };
}