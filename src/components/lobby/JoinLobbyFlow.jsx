import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Users, Target } from 'lucide-react';
import { getLobby, joinLobby } from '../../utils/lobbyManagement';

const JoinLobbyFlow = ({ onBack, onJoined }) => {
  const [step, setStep] = useState(1); // 1: Enter code, 2: Enter username
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [lobby, setLobby] = useState(null);
  const [error, setError] = useState('');
  const [fadeIn, setFadeIn] = useState(true);

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setError('');

    const upperCode = code.toUpperCase().trim();
    if (upperCode.length !== 6) {
      setError('Lobby code must be 6 characters');
      return;
    }

    const foundLobby = getLobby(upperCode);
    if (!foundLobby) {
      setError('Lobby not found. Please check the code.');
      return;
    }

    if (foundLobby.status === 'expired') {
      setError('This lobby has expired');
      return;
    }

    if (foundLobby.status === 'completed') {
      setError('This lobby is closed');
      return;
    }

    if (foundLobby.status === 'in_progress') {
      setError('This session has already started');
      return;
    }

    setLobby(foundLobby);
    setStep(2);
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (username.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    if (username.length > 30) {
      setError('Username must be less than 30 characters');
      return;
    }

    const result = joinLobby(lobby.code, username);

    if (!result.success) {
      setError(result.error);
      return;
    }

    // Store in sessionStorage
    sessionStorage.setItem('currentLobbyCode', lobby.code);
    sessionStorage.setItem('currentUsername', username);
    sessionStorage.setItem('userRole', 'participant');

    // Navigate to waiting room
    onJoined(lobby.code, username);
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setCode(value);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className={`max-w-2xl w-full transition-all duration-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="space-y-8">
          {/* Back Button */}
          <button
            onClick={step === 1 ? onBack : () => { setStep(1); setError(''); setLobby(null); }}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-lg">
              <Users className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-gray-900">
                {step === 1 ? 'Join Training Session' : 'Choose Your Username'}
              </h1>
              <p className="text-lg text-gray-600 font-light mt-2">
                {step === 1 ? 'Enter the 6-character lobby code' : 'Enter a name to identify yourself'}
              </p>
            </div>
          </div>

          {/* Step 1: Enter Code */}
          {step === 1 && (
            <form onSubmit={handleCodeSubmit} className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Lobby Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="ABC123"
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm text-center text-3xl font-mono font-bold tracking-wider uppercase"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-sm text-gray-500 text-center">
                  {code.length}/6 characters
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-800 text-center font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={code.length !== 6}
                className={`w-full px-8 py-4 rounded-2xl font-medium text-lg shadow-lg transition-all duration-300 ${
                  code.length === 6
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Validate Code
              </button>
            </form>
          )}

          {/* Step 2: Enter Username */}
          {step === 2 && lobby && (
            <>
              {/* Lobby Preview */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Target className="w-5 h-5" />
                    <span className="text-sm font-medium">You're joining:</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">{lobby.name}</h3>
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Difficulty:</span>{' '}
                      <span className="capitalize">{lobby.difficulty}</span>
                    </div>
                    <div>
                      <span className="font-medium">Participants:</span>{' '}
                      <span>{lobby.participants.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Username Form */}
              <form onSubmit={handleUsernameSubmit} className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Choose a Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    placeholder="e.g., alice_wonder"
                    className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm text-lg"
                    maxLength={30}
                    autoFocus
                  />
                  <p className="text-sm text-gray-500">
                    2-30 characters
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-red-800 text-center font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={username.length < 2}
                  className={`w-full px-8 py-4 rounded-2xl font-medium text-lg shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                    username.length >= 2
                      ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>Join Session</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinLobbyFlow;
