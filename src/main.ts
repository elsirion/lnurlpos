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
      <div id="numpad-section">
        <div class="mb-4">
          <label for="amount" class="block mb-1 text-sm font-medium text-gray-700" id="amount-label">Amount (sats)</label>
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
          <button type="button" class="numpad-btn py-4 text-xl bg-gray-200 rounded-lg hover:bg-gray-300">
            <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" style="max-height: 1.5em; display: inline" xmlns="http://www.w3.org/2000/svg"><path d="m22 6c0-.552-.448-1-1-1h-12.628c-.437 0-.853.191-1.138.523-1.078 1.256-3.811 4.439-4.993 5.815-.16.187-.241.419-.241.651 0 .231.08.463.24.651 1.181 1.38 3.915 4.575 4.994 5.835.285.333.701.525 1.14.525h12.626c.552 0 1-.448 1-1 0-2.577 0-9.423 0-12zm-13.628.5h12.128v11h-12.126l-4.715-5.51zm5.637 4.427 1.71-1.71c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.384-.219.531l-1.711 1.711 1.728 1.728c.147.147.22.339.22.53 0 .427-.349.751-.75.751-.192 0-.384-.073-.531-.219l-1.728-1.729-1.728 1.729c-.146.146-.339.219-.531.219-.401 0-.75-.324-.75-.751 0-.191.073-.383.22-.53l1.728-1.728-1.788-1.787c-.146-.148-.219-.339-.219-.532 0-.425.346-.749.751-.749.192 0 .384.073.53.219z" fill-rule="nonzero"/></svg>
          </button>
        </div>
        <button id="request-invoice-btn" type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-3 text-center inline-flex items-center justify-center mt-4">
          <svg class="w-5 h-5 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="bitcoin" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.1-111 248-248 248S8 392.1 8 256 119 8 256 8s248 111 248 248zm-141.7-35.33c4.937-32.1-20.19-50.74-54.55-62.57l11.15-44.7-27.21-6.781-10.85 43.52c-7.154-1.783-14.5-3.464-21.8-5.13l10.93-43.81-27.2-6.781-11.15 44.69c-5.922-1.349-11.73-2.682-17.38-4.084l.031-.14-37.53-9.37-7.239 29.06s20.19 4.627 19.76 4.913c11.02 2.751 13.01 10.04 12.68 15.82l-12.7 50.92c.76 .194 1.744 .473 2.829 .907-.907-.225-1.876-.473-2.876-.713l-17.8 71.34c-1.349 3.348-4.767 8.37-12.47 6.464 .271 .395-19.78-4.937-19.78-4.937l-13.51 31.15 35.41 8.827c6.588 1.651 13.05 3.379 19.4 5.006l-11.26 45.21 27.18 6.781 11.15-44.73a1038 1038 0 0 0 21.69 5.627l-11.11 44.52 27.21 6.781 11.26-45.13c46.4 8.781 81.3 5.239 95.99-36.73 11.84-33.79-.589-53.28-25-65.99 17.78-4.098 31.17-15.79 34.75-39.95zm-62.18 87.18c-8.41 33.79-65.31 15.52-83.75 10.94l14.94-59.9c18.45 4.603 77.6 13.72 68.81 48.96zm8.417-87.67c-7.673 30.74-55.03 15.12-70.39 11.29l13.55-54.33c15.36 3.828 64.84 10.97 56.85 43.03z"></path></svg>
          Request Invoice
        </button>
      </div>
      <div id="payment-section" class="hidden flex flex-col items-center">
        <div id="qr" class="mb-4 w-full"></div>
        <div class="w-full flex flex-col items-center">
          <div class="flex items-center w-full gap-2">
            <div id="invoice" class="truncate bg-white border border-gray-200 rounded-md px-2 py-1 text-xs w-full whitespace-nowrap select-all" aria-label="Lightning Invoice"></div>
            <button id="copy-btn" type="button" class="flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:ring-2 focus:outline-none focus:ring-blue-300 transition-colors duration-200 h-[1.75rem] min-h-0" title="Copy invoice" aria-label="Copy invoice">
              <svg class="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"/>
              </svg>
            </button>
          </div>
        </div>
        <div id="status" class="mt-4 text-center font-semibold"></div>
        <button id="back-btn" type="button" class="mt-6 w-full text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 text-center inline-flex items-center justify-center">
          <svg class="w-5 h-5 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M257.5 445.1c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-192-192c-12.5-12.5-12.5-32.8 0-45.3l192-192c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L109.3 224H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H109.3l148.2 149.1z"></path></svg>
          Back
        </button>
      </div>
    </form>
    <div id="invoice-section" style="display:none;" class="mt-8">
      <div class="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
        <div id="qr" class="mb-4 w-full"></div>
        <div class="w-full flex flex-col items-center">
          <div class="flex items-center w-full gap-2">
            <div id="invoice" class="truncate bg-white border border-gray-200 rounded-md px-2 py-1 text-xs w-full whitespace-nowrap select-all" aria-label="Lightning Invoice"></div>
            <button id="copy-btn" type="button" class="flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:ring-2 focus:outline-none focus:ring-blue-300 transition-colors duration-200 h-[1.75rem] min-h-0" title="Copy invoice" aria-label="Copy invoice">
              <svg class="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"/>
              </svg>
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
  const svg = await QRCode.toString(text, { type: 'svg', margin: 2 });
  // Add Tailwind/Flowbite classes to the SVG root element
  return svg.replace('<svg', `<svg class=\"rounded-lg border border-gray-300 w-full\"`);
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

// --- Payment section logic ---
let abortPayment: (() => void) | null = null;

if (lnInputValue) {
  (document.getElementById('pos-form') as HTMLFormElement).onsubmit = async (e) => {
    e.preventDefault();
    const amount = parseInt((document.getElementById('amount') as HTMLInputElement).value, 10);
    if (!amount || amount < 1) return alert('Please enter an amount.');
    const input = lnInputValue;
    // Hide numpad, show payment section
    (document.getElementById('numpad-section') as HTMLElement).classList.add('hidden');
    (document.getElementById('payment-section') as HTMLElement).classList.remove('hidden');
    (document.getElementById('status') as HTMLElement).textContent = "Requesting invoice...";
    let abort = false;
    abortPayment = () => { abort = true; };
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
      // Back button
      (document.getElementById('back-btn') as HTMLElement).onclick = function() {
        abort = true;
        (document.getElementById('payment-section') as HTMLElement).classList.add('hidden');
        (document.getElementById('numpad-section') as HTMLElement).classList.remove('hidden');
        (document.getElementById('status') as HTMLElement).textContent = "";
        (document.getElementById('qr') as HTMLElement).innerHTML = "";
        (document.getElementById('invoice') as HTMLElement).textContent = "";
      };
      // 4. Poll LUD-21 verify endpoint
      if (!verifyUrl) {
        (document.getElementById('status') as HTMLElement).textContent = "This address does not support LUD-21 verify.";
        return;
      }
      let paid = false, tries = 0;
      while (!paid && tries < 60 && !abort) { // poll for up to 2 minutes or until abort
        await new Promise(res => setTimeout(res, 2000));
        if (abort) break;
        const v = await fetchJson(verifyUrl);
        if (v.settled) {
          paid = true;
          (document.getElementById('status') as HTMLElement).textContent = "✅ Payment received!";
        }
        tries++;
      }
      if (!paid && !abort) (document.getElementById('status') as HTMLElement).textContent = "⏰ Payment not detected (timeout).";
    } catch (err: any) {
      (document.getElementById('status') as HTMLElement).textContent = "Error: " + err.message;
    }
  };
}