import React, { useState } from 'react';
import { TextInput, Button, Label } from 'flowbite-react';

interface AddressFormProps {
  onSubmit: (value: string) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ onSubmit }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = value.trim();
    if (!val) return;
    if (val.match(/^lnurl[a-z0-9]+$/i) || val.includes('@')) {
      setError('');
      onSubmit(val);
    } else {
      setError('Please enter a valid Lightning Address or LNURLp string.');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
      <Button type="submit" color="blue" className="w-full">Continue</Button>
    </form>
  );
};

export default AddressForm;