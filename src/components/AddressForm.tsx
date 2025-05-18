import React, { useState, useEffect } from 'react';
import { TextInput, Button, Label } from 'flowbite-react';

interface AddressFormProps {
  onSubmit: (value: string) => void;
}

const MAX_HISTORY = 3;
const STORAGE_KEY = 'lnurlpos_address_history';

const getStoredAddresses = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredAddresses = (addresses: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
};

const AddressForm: React.FC<AddressFormProps> = ({ onSubmit }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(getStoredAddresses());
  }, []);

  const saveToHistory = (address: string) => {
    let newHistory = [address, ...history.filter(a => a !== address)];
    if (newHistory.length > MAX_HISTORY) newHistory = newHistory.slice(0, MAX_HISTORY);
    setHistory(newHistory);
    setStoredAddresses(newHistory);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = value.trim();
    if (!val) return;
    if (val.match(/^lnurl[a-z0-9]+$/i) || val.includes('@')) {
      setError('');
      saveToHistory(val);
      onSubmit(val);
    } else {
      setError('Please enter a valid Lightning Address or LNURLp string.');
    }
  };

  const handleHistoryClick = (address: string) => {
    saveToHistory(address);
    onSubmit(address);
  };

  const handleDelete = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(a => a !== address);
    setHistory(newHistory);
    setStoredAddresses(newHistory);
  };

  return (
    <form className="" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="address-input" className="text-gray-700 text-xs">Lightning Address or LNURLp</Label>
        <TextInput
          id="address-input"
          type="text"
          required
          placeholder="someone@domain.com or lnurl1..."
          value={value}
          onChange={e => setValue(e.target.value)}
          className="mt-1"
        />
        {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      </div>
      <Button type="submit" color="blue" className="w-full mt-4">Continue</Button>
      {history.length > 0 && (
        <div className="mt-6">
          <Label className="text-gray-700 text-xs mb-2">Recent addresses</Label>
          <ul className="space-y-2 mt-2">
            {history.map(addr => (
              <li key={addr}>
                <div
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-3 py-2 cursor-pointer group transition"
                  onClick={() => handleHistoryClick(addr)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Use address ${addr}`}
                >
                  <span className="truncate text-sm text-blue-700 underline max-w-[200px] group-hover:text-gray-800 group-hover:no-underline transition dark:text-blue-400 dark:group-hover:text-gray-100">{addr}</span>
                  <Button
                    size="xs"
                    color="light"
                    className="ml-2"
                    onClick={e => handleDelete(addr, e)}
                    aria-label={`Delete address ${addr}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex justify-center mt-10">
        <a
          href="https://github.com/elsirion/lnurlpos"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-gray-600 hover:text-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-5 h-5"
          >
            <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.334-5.466-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.804 5.625-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-xs">View on GitHub</span>
        </a>
      </div>
    </form>
  );
};

export default AddressForm;