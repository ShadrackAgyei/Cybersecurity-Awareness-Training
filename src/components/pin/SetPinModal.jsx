import React, { useState, useRef, useEffect } from 'react';
import { Lock, X } from 'lucide-react';
import { setPin as savePinToStorage } from '../../utils/pinProtection';

const SetPinModal = ({ onClose, onSuccess }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Enter PIN, 2: Confirm PIN
  const inputRefs = useRef([]);
  const confirmInputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (step === 1 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    } else if (step === 2 && confirmInputRefs.current[0]) {
      confirmInputRefs.current[0].focus();
    }
  }, [step]);

  const handlePinChange = (index, value, isConfirm = false) => {
    const refs = isConfirm ? confirmInputRefs : inputRefs;
    const currentPin = isConfirm ? [...confirmPin] : [...pin];
    const setPinFunc = isConfirm ? setConfirmPin : setPin;

    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    currentPin[index] = value;
    setPinFunc(currentPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e, isConfirm = false) => {
    const refs = isConfirm ? confirmInputRefs : inputRefs;

    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleContinue = () => {
    const pinString = pin.join('');

    if (pinString.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const pinString = pin.join('');
    const confirmPinString = confirmPin.join('');

    if (confirmPinString.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    if (pinString !== confirmPinString) {
      setError('PINs do not match');
      setConfirmPin(['', '', '', '']);
      confirmInputRefs.current[0]?.focus();
      return;
    }

    savePinToStorage(pinString);
    onSuccess();
  };

  const handleBack = () => {
    setStep(1);
    setConfirmPin(['', '', '', '']);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-fadeIn">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-blue-100 rounded-2xl">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {step === 1 ? 'Set Analytics PIN' : 'Confirm Your PIN'}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {step === 1
                  ? 'Create a 4-digit PIN to protect analytics access'
                  : 'Re-enter your PIN to confirm'}
              </p>
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-4">
            <div className="flex justify-center space-x-3">
              {(step === 1 ? pin : confirmPin).map((digit, index) => (
                <input
                  key={index}
                  ref={el => step === 1 ? inputRefs.current[index] = el : confirmInputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value, step === 2)}
                  onKeyDown={(e) => handleKeyDown(index, e, step === 2)}
                  className="w-16 h-16 text-center text-3xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-white/80"
                  autoComplete="off"
                />
              ))}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-800 text-center text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {step === 1 ? (
              <>
                <button
                  onClick={handleContinue}
                  disabled={pin.join('').length !== 4}
                  className={`w-full px-6 py-3 rounded-xl font-medium transition-all ${
                    pin.join('').length === 4
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={confirmPin.join('').length !== 4}
                  className={`w-full px-6 py-3 rounded-xl font-medium transition-all ${
                    confirmPin.join('').length === 4
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Set PIN
                </button>
                <button
                  onClick={handleBack}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPinModal;
