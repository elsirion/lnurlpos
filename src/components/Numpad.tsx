import React, { useState, useEffect } from 'react';
import { Button, Label, TextInput, Select } from 'flowbite-react';
import { getCurrencyRateMap } from '../utils/currency';
import { getParam, setParam } from '../utils/urlParams';

interface NumpadProps {
  onSubmit: (amount: number) => void;
}

interface NumpadGridProps {
  value: string;
  onNumpadClick: (val: string) => void;
}

const NumpadGrid: React.FC<NumpadGridProps> = ({ value, onNumpadClick }) => {
  const buttons = [
    '1','2','3',
    '4','5','6',
    '7','8','9',
    '.','0','⌫'
  ];
  return (
    <div className="grid grid-cols-3 gap-2 mb-2">
      {buttons.map((b, i) => (
        <Button
          key={i}
          type="button"
          color="alternative"
          className="py-4 text-xl"
          onClick={() => onNumpadClick(b)}
        >
          {b === '⌫' ? (
            <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 6a1 1 0 0 0-1-1H8.372a1.5 1.5 0 0 0-1.138.523C6.156 6.779 3.423 9.962 2.241 11.338a1 1 0 0 0 0 1.324c1.182 1.38 3.915 4.575 4.994 5.835A1.5 1.5 0 0 0 8.375 19H21a1 1 0 0 0 1-1V6Zm-13.628.5H20.5v11H8.374l-4.715-5.51Zm5.637 4.427 1.71-1.71A.75.75 0 0 1 17 10.25c0 .193-.073.384-.219.531l-1.711 1.711 1.728 1.728c.147.147.22.339.22.53a.75.75 0 0 1-.75.751.75.75 0 0 1-.531-.219l-1.728-1.729-1.728 1.729A.75.75 0 0 1 10 14.75a.75.75 0 0 1-.75-.751c0-.191.073-.383.22-.53l1.728-1.728-1.788-1.787A.75.75 0 0 1 10 9.25c.192 0 .384.073.53.219Z" fill="currentColor"/></svg>
          ) : b}
        </Button>
      ))}
    </div>
  );
};

// Helper to format large numbers with k, M, B, etc.
function formatAbbrev(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toFixed(1).replace(/\.0$/, '');
}

const Numpad: React.FC<NumpadProps> = ({ onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [currencies, setCurrencies] = useState<string[]>(['sat']);
  const [currency, setCurrency] = useState<string>(getParam('currency') || 'sat');
  const [rateMap, setRateMap] = useState<{ [k: string]: number }>({ sat: 1e8 });

  useEffect(() => {
    const update = () => {
      const map = getCurrencyRateMap();
      setRateMap(map);
      setCurrencies(Object.keys(map));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setParam('currency', currency);
  }, [currency]);

  const handleNumpad = (val: string) => {
    if (val === '.') {
      if (amount === '' || amount.includes('.')) return;
      setAmount(amount + '.');
    } else if (val === '⌫') {
      setAmount(amount.slice(0, -1));
    } else {
      if (amount.length >= 9) return;
      if (amount === '0' && val !== '.') return;
      if (amount.includes('.')) {
        const [intPart, decPart] = amount.split('.');
        if (decPart.length >= 2) return;
      }
      setAmount(amount + val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount === '.' || amount.endsWith('.')) {
      setError('Please enter a valid amount.');
      return;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0.01) {
      setError('Please enter a valid amount.');
      return;
    }
    setError('');
    // Convert to sats for onSubmit
    const sats = currency === 'sat' ? num : Math.round((num * rateMap[currency]) * 1e8);
    onSubmit(sats);
  };

  // Calculate sats for label
  let satsValue = 0;
  if (amount && !isNaN(Number(amount)) && rateMap[currency]) {
    if (currency === 'sat') {
      satsValue = parseFloat(amount);
    } else {
      satsValue = Math.round(parseFloat(amount) * rateMap[currency] * 1e8);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="amount">Amount ({currency})</Label>
        <TextInput
          id="amount"
          type="text"
          min={0.01}
          readOnly
          value={amount}
          className="text-2xl text-center"
          placeholder="0"
        />
        <div className="text-xs text-gray-500 mt-1 ml-2 flex items-center justify-between">
          <span>≈ {satsValue} sats</span>
          {rateMap[currency] && (
            <span className="ml-auto pl-2 mr-1">{formatAbbrev(1 / rateMap[currency])} {currency}/BTC</span>
          )}
        </div>
      </div>
      <NumpadGrid value={amount} onNumpadClick={handleNumpad} />
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      <Button type="submit" className="w-full" color="blue">Request Invoice</Button>
      <div className="flex justify-center items-center gap-2 mb-2">
        <span className="text-xs text-gray-500">Currency</span>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="text-xs text-gray-700 outline-none focus:ring-0 border-none bg-transparent p-0 m-0 appearance-none"
        >
          {currencies.map(cur => (
            <option key={cur} value={cur}>{cur}</option>
          ))}
        </select>
      </div>
    </form>
  );
};

export default Numpad;