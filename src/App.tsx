import React, { useState, useEffect } from 'react';
import AddressForm from './components/AddressForm';
import Numpad from './components/Numpad';
import PaymentSection from './components/PaymentSection';
import { getParam, setParam } from './utils/urlParams';
// import { Button } from 'flowbite-react';

const App: React.FC = () => {
  const [lnInput, setLnInput] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    const lnurlParam = getParam('lnurl');
    const lnaddressParam = getParam('lnaddress');
    if (lnurlParam) setLnInput(lnurlParam);
    else if (lnaddressParam) setLnInput(lnaddressParam);
  }, []);

  const handleAddressSubmit = (val: string) => {
    if (val.match(/^lnurl[a-z0-9]+$/i)) {
      setParam('lnurl', val);
    } else if (val.includes('@')) {
      setParam('lnaddress', val);
    }
    setLnInput(val);
  };

  const handleBack = () => setAmount(null);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Lightning Point of Sale</h2>
      {!lnInput ? (
        <AddressForm onSubmit={handleAddressSubmit} />
      ) : (
        <>
          {amount === null ? (
            <Numpad onSubmit={setAmount} lnInput={lnInput} />
          ) : (
            <PaymentSection lnInput={lnInput} amount={amount} onBack={handleBack} />
          )}
        </>
      )}
    </div>
  );
};

export default App;