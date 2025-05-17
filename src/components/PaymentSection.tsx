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
  invoice: string | null;
  paid: boolean;
  error: string;
  onCopy: () => void;
  onBack: () => void;
}

const PaymentDisplay: React.FC<PaymentDisplayProps> = ({ invoice, paid, error, onCopy, onBack }) => {
  const [qrSvg, setQrSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function genQr() {
      if (invoice) {
        try {
          const svg = await QRCode.toString(invoice, { type: 'svg', margin: 2 });
          if (!cancelled) {
            setQrSvg(svg.replace('<svg', `<svg class=\"rounded-lg border border-gray-300 w-full\"`));
          }
        } catch (e) {
          setQrSvg(null);
        }
      } else {
        setQrSvg(null);
      }
    }
    genQr();
    return () => { cancelled = true; };
  }, [invoice]);

  const placeholder = (
    <div role="status" className="mb-2 w-full aspect-square flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300 animate-pulse">
      <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M4 4h6v6H4V4Zm10 10h6v6h-6v-6Zm0-10h6v6h-6V4Zm-4 10h.01v.01H10V14Zm0 4h.01v.01H10V18Zm-3 2h.01v.01H7V20Zm0-4h.01v.01H7V16Zm-3 2h.01v.01H4V18Zm0-4h.01v.01H4V14Z"/>
        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01v.01H7V7Zm10 10h.01v.01H17V17Z"/>
      </svg>
      <p className="text-gray-800 dark:text-white ml-2">Loading invoice ...</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-4 w-full flex flex-col items-center">
        <div className="relative mb-2 w-full aspect-square flex items-center justify-center">
          {(invoice && !error) ? (
            qrSvg ? (
              <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            ) : (
              placeholder
            )
          ) : (
            placeholder
          )}
          {paid && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-50 bg-opacity-95 z-10 rounded-lg animate-fade-in">
              <svg className="w-32 h-32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#22C55E"/>
                <path d="M20 34L29 43L44 25" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 w-full">
          <TextInput
            sizing="sm"
            aria-label="Lightning Invoice"
            value={error ? '' : invoice ?? ''}
            className="flex-1"
            readOnly
            disabled={paid}
          />
          <Tooltip content={paid ? 'Payment complete' : 'Copy invoice'}>
            <Button size="xs" className='' color="blue" onClick={onCopy} disabled={paid}>
              <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"/>
              </svg>
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="mt-4 text-center font-semibold w-full">
        {!invoice && !error && (
            <Alert color="info">🕙 Waiting for invoice...</Alert>
        )}
        {paid && (
          <Alert color="success">✅ Payment received!</Alert>
        )}
        {error && <Alert color="failure" className="max-w-xs">Error: {error}</Alert>}
        {!error && !paid && invoice && <Alert color="info">🕙 Waiting for payment...</Alert>}
      </div>
      <Button className="mt-6 w-full" color="blue" onClick={onBack}>
        <svg className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M257.5 445.1c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-192-192c-12.5-12.5-12.5-32.8 0-45.3l192-192c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L109.3 224H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H109.3l148.2 149.1z"></path></svg>
        Back
      </Button>
    </div>
  );
};

const PaymentSection: React.FC<PaymentSectionProps> = ({ lnInput, amount, onBack }) => {
  const [invoice, setInvoice] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');
  const pollingRef = useRef(false);

  useEffect(() => {
    let abort = false;
    async function requestInvoice() {
      try {
        setError('');
        setInvoice(null);
        setVerifyUrl(null);
        setPaid(false);

        // 1. Get LNURLp endpoint
        const lnurlp = getLnurlpEndpoint(lnInput);
        const lnurlpResp = await fetchJson(lnurlp);
        const callback = lnurlpResp.callback;
        const min = lnurlpResp.minSendable / 1000, max = lnurlpResp.maxSendable / 1000;
        if (amount < min || amount > max) throw new Error(`Amount must be between ${min} and ${max} sats`);
        const cbUrl = `${callback}?amount=${amount * 1000}`;
        const invoiceResp = await fetchJson(cbUrl);
        if (invoiceResp.status === "ERROR") throw new Error(invoiceResp.reason);
        const pr = invoiceResp.pr;

        // check if invoiceResp.verify is set
        if (invoiceResp.verify) {
          setVerifyUrl(invoiceResp.verify);
        } else {
          setError("Backend doesn't support LUD-21 verify");
        }

        setInvoice(pr);
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
      invoice={invoice}
      paid={paid}
      error={error}
      onCopy={handleCopy}
      onBack={onBack}
    />
  );
};

export default PaymentSection;
