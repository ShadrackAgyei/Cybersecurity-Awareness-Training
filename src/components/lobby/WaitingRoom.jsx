import React, { useState, useEffect } from 'react';
import { Users, Clock, LogOut } from 'lucide-react';
import { getLobby, removeParticipant } from '../../utils/lobbyManagement';
import StatusBadge from '../shared/StatusBadge';

const WaitingRoom = ({ lobbyCode, username, onStartTraining, onLeave }) => {
  const [lobby, setLobby] = useState(null);
  const [fadeIn, setFadeIn] = useState(true);

  // Poll for lobby updates
  useEffect(() => {
    const loadLobby = () => {
      const loadedLobby = getLobby(lobbyCode);
      if (loadedLobby) {
        setLobby(loadedLobby);

        // Check if session started
        if (loadedLobby.status === 'in_progress') {
          onStartTraining();
        }
      }
    };

    loadLobby();
    const interval = setInterval(loadLobby, 1500);
    return () => clearInterval(interval);
  }, [lobbyCode, onStartTraining]);

  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave this lobby?')) {
      removeParticipant(lobbyCode, username);
      sessionStorage.clear();
      onLeave();
    }
  };

  if (!lobby) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className={`max-w-3xl w-full transition-all duration-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block p-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl shadow-lg animate-pulse">
              <Clock className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-gray-900">Waiting for Session to Start</h1>
              <p className="text-lg text-gray-600 font-light mt-2">
                The moderator will begin the training shortly
              </p>
            </div>
          </div>

          {/* Lobby Info */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Session Name</p>
                <h2 className="text-3xl font-semibold text-gray-900">{lobby.name}</h2>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Difficulty</p>
                  <p className="text-xl font-semibold text-gray-900 capitalize">{lobby.difficulty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Your Username</p>
                  <p className="text-xl font-semibold text-blue-600">{username}</p>
                </div>
              </div>

              <div className="pt-4">
                <StatusBadge status={lobby.status} />
              </div>
            </div>
          </div>

          {/* Participants List */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Participants</h2>
                <p className="text-sm text-gray-600">{lobby.participants.length} waiting</p>
              </div>
            </div>

            <div className="space-y-3">
              {lobby.participants.map((participant) => (
                <div
                  key={participant.username}
                  className={`flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all ${
                    participant.username === username
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white/80 border-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    participant.username === username
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    {participant.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${
                      participant.username === username ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {participant.username}
                      {participant.username === username && (
                        <span className="ml-2 text-sm font-normal text-blue-600">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <StatusBadge status={participant.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Leave Button */}
          <button
            onClick={handleLeave}
            className="w-full px-8 py-4 bg-white/80 backdrop-blur-sm hover:bg-white text-red-600 rounded-2xl font-medium border-2 border-red-200 hover:border-red-300 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Leave Lobby</span>
          </button>

          {/* Animated Waiting Indicator */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-3">Waiting for moderator to start the session...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
