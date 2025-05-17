import React, { useState } from 'react';
import { Button, Label, TextInput } from 'flowbite-react';

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
    'C','0','⌫'
  ];
  return (
    <div className="grid grid-cols-3 gap-2 mb-2">
      {buttons.map((b, i) => (
        <Button
          key={i}
          type="button"
          color="gray"
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

const Numpad: React.FC<NumpadProps> = ({ onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleNumpad = (val: string) => {
    if (val === 'C') {
      setAmount('');
    } else if (val === '⌫') {
      setAmount(amount.slice(0, -1));
    } else {
      if (amount.length < 9) setAmount(amount + val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(amount, 10);
    if (!num || num < 1) {
      setError('Please enter a valid amount.');
      return;
    }
    setError('');
    onSubmit(num);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="amount">Amount (sats)</Label>
        <TextInput
          id="amount"
          type="number"
          min={1}
          readOnly
          value={amount}
          className="text-2xl text-center"
          placeholder="0"
        />
      </div>
      <NumpadGrid value={amount} onNumpadClick={handleNumpad} />
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      <Button type="submit" className="w-full" color="blue">Request Invoice</Button>
    </form>
  );
};

export default Numpad;