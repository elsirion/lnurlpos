import React, { useEffect, useState, useRef } from 'react';
import { Button, Spinner, Tooltip, Alert, TextInput } from 'flowbite-react';
import QRCode from 'qrcode';
import { bech32Decode, getLnurlpEndpoint, fetchJson } from '../utils/lnurl';

interface PaymentSectionProps {
  lnInput: string;
  amount: number;
  onBack: () => void;
}

interface PaymentDisplayProps {
  qr: string;
  invoice: string;
  paid: boolean;
  error: string;
  onCopy: () => void;
  onBack: () => void;
}

const PaymentDisplay: React.FC<PaymentDisplayProps> = ({ qr, invoice, paid, error, onCopy, onBack }) => (
  <div className="flex flex-col items-center w-full">
    <div className="mb-4 w-full flex flex-col items-center">
      {qr && <div className="mb-2 w-full" dangerouslySetInnerHTML={{ __html: qr }} />}
      <div className="flex items-center gap-2 w-full">
        <TextInput
          sizing="sm"
          aria-label="Lightning Invoice"
          value={invoice}
          className="flex-1"
        />
        <Tooltip content="Copy invoice">
          <Button size="xs" className='' color="blue" onClick={onCopy}>
            <svg className="w-4 h- text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"/>
            </svg>
          </Button>
        </Tooltip>
      </div>
    </div>
    <div className="mt-4 text-center font-semibold w-full break-words">
      {paid && (
        <Alert color="success">✅ Payment received!</Alert>
      )}
      {error && <Alert color="failure">Error: {error}</Alert>}
      {!error && !paid && invoice && <Alert color="info">🕙 Waiting for payment...</Alert>}
    </div>
    <Button className="mt-6 w-full" color="blue" onClick={onBack}>
      <svg className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M257.5 445.1c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-192-192c-12.5-12.5-12.5-32.8 0-45.3l192-192c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L109.3 224H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H109.3l148.2 149.1z"></path></svg>
      Back
    </Button>
  </div>
);

const PaymentSection: React.FC<PaymentSectionProps> = ({ lnInput, amount, onBack }) => {
  const [invoice, setInvoice] = useState('');
  const [qr, setQr] = useState('');
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');
  const pollingRef = useRef(false);

  useEffect(() => {
    let abort = false;
    async function requestInvoice() {
      try {
        setError('');
        // 1. Get LNURLp endpoint
        const lnurlp = getLnurlpEndpoint(lnInput);
        const lnurlpResp = await fetchJson(lnurlp);
        // 2. Request invoice
        const callback = lnurlpResp.callback;
        const min = lnurlpResp.minSendable / 1000, max = lnurlpResp.maxSendable / 1000;
        if (amount < min || amount > max) throw new Error(`Amount must be between ${min} and ${max} sats`);
        const cbUrl = `${callback}?amount=${amount * 1000}`;
        const invoiceResp = await fetchJson(cbUrl);
        if (invoiceResp.status === "ERROR") throw new Error(invoiceResp.reason);
        const pr = invoiceResp.pr;
        setInvoice(pr);
        setVerifyUrl(invoiceResp.verify || null);
        // Generate QR
        const svg = await QRCode.toString(pr, { type: 'svg', margin: 2 });
        setQr(svg.replace('<svg', `<svg class=\"rounded-lg border border-gray-300 w-full\"`));
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      }
    }
    requestInvoice();
    return () => { abort = true; };
  }, [lnInput, amount]);

  // Poll for payment
  useEffect(() => {
    if (!verifyUrl || paid || error) return;
    pollingRef.current = true;
    let tries = 0;
    async function poll() {
      while (pollingRef.current && !paid) {
        await new Promise(res => setTimeout(res, 2000));
        try {
          if (typeof verifyUrl === 'string') {
            const v = await fetchJson(verifyUrl);
            if (v.settled) {
              setPaid(true);
              break;
            }
          }
        } catch (e) {
          // ignore polling errors
        }
      }
    }
    poll();
    return () => { pollingRef.current = false; };
  }, [verifyUrl, paid, error]);

  const handleCopy = () => {
    if (invoice) {
      navigator.clipboard.writeText(invoice);
    }
  };

  return (
    <PaymentDisplay
      qr={qr}
      invoice={invoice}
      paid={paid}
      error={error}
      onCopy={handleCopy}
      onBack={onBack}
    />
  );
};

export default PaymentSection;
