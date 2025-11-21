import React, { useState, useRef, useEffect } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { verifyPin, checkLockout, getRemainingAttempts } from '../../utils/pinProtection';

const EnterPinModal = ({ onClose, onSuccess }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [lockoutMessage, setLockoutMessage] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    // Check for lockout
    const lockout = checkLockout();
    if (lockout) {
      setLockoutMessage(lockout);
    }

    // Focus first input
    if (inputRefs.current[0] && !lockout) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handlePinChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (index === 3 && value) {
      setTimeout(() => handleSubmit(newPin), 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (pinToVerify = pin) => {
    const pinString = pinToVerify.join('');

    if (pinString.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    const result = verifyPin(pinString);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error);
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();

      // Check if now locked out
      const lockout = checkLockout();
      if (lockout) {
        setLockoutMessage(lockout);
      }
    }
  };

  const isLockedOut = !!lockoutMessage;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-fadeIn">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className={`inline-block p-4 rounded-2xl ${isLockedOut ? 'bg-red-100' : 'bg-blue-100'}`}>
              {isLockedOut ? (
                <AlertTriangle className="w-8 h-8 text-red-600" />
              ) : (
                <Lock className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {isLockedOut ? 'Access Locked' : 'Enter Analytics PIN'}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {isLockedOut
                  ? lockoutMessage
                  : 'Enter your 4-digit PIN to access analytics'}
              </p>
            </div>
          </div>

          {!isLockedOut && (
            <>
              {/* PIN Input */}
              <div className="space-y-4">
                <div className="flex justify-center space-x-3">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-16 h-16 text-center text-3xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-white/80"
                      autoComplete="off"
                    />
                  ))}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-red-800 text-center text-sm font-medium">{error}</p>
                    {!error.includes('Locked') && (
                      <p className="text-red-600 text-center text-xs mt-1">
                        {getRemainingAttempts()} attempts remaining
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSubmit()}
                  disabled={pin.join('').length !== 4}
                  className={`w-full px-6 py-3 rounded-xl font-medium transition-all ${
                    pin.join('').length === 4
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Unlock Analytics
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {isLockedOut && (
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterPinModal;
