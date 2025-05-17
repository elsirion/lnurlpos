import React, { useState } from 'react';
import AddressForm from './components/AddressForm';
import Numpad from './components/Numpad';
import PaymentSection from './components/PaymentSection';
import { Button } from 'flowbite-react';

const App: React.FC = () => {
  const [lnInput, setLnInput] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  const handleBack = () => setAmount(null);
  const handleReset = () => {
    setLnInput(null);
    setAmount(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Lightning Point of Sale</h2>
      {!lnInput ? (
        <AddressForm onSubmit={setLnInput} />
      ) : (
        <>
          {amount === null ? (
            <Numpad onSubmit={setAmount} />
          ) : (
            <PaymentSection lnInput={lnInput} amount={amount} onBack={handleBack} />
          )}
          <Button color="light" className="w-full mt-4" onClick={handleReset}>
            Reset
          </Button>
        </>
      )}
    </div>
  );
};

export default App;