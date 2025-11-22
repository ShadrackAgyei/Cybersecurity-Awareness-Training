import React, { useState, useEffect } from 'react';
import { Copy, Users, X, Play, XCircle, CheckCircle2, Clock } from 'lucide-react';
import { getLobby, startLobbySession, closeLobby, removeParticipant } from '../../utils/lobbyManagement';
import StatusBadge from '../shared/StatusBadge';
import Toast from '../shared/Toast';

const LobbyDashboard = ({ lobbyCode, onNavigateToAnalytics, onExit }) => {
  const [lobby, setLobby] = useState(null);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [previousParticipantCount, setPreviousParticipantCount] = useState(0);

  // Poll for lobby updates
  useEffect(() => {
    const loadLobby = () => {
      const loadedLobby = getLobby(lobbyCode);
      if (loadedLobby) {
        // Check if new participant joined
        if (lobby && loadedLobby.participants.length > previousParticipantCount) {
          setToast({ message: 'New participant joined!', type: 'success' });
        }
        setLobby(loadedLobby);
        setPreviousParticipantCount(loadedLobby.participants.length);
      }
    };

    loadLobby();
    const interval = setInterval(loadLobby, 2000);
    return () => clearInterval(interval);
  }, [lobbyCode, previousParticipantCount]);

  const copyCode = () => {
    navigator.clipboard.writeText(lobbyCode);
    setToast({ message: 'Lobby code copied to clipboard!', type: 'success' });
  };

  const handleStartSession = () => {
    startLobbySession(lobbyCode);
    setShowStartConfirm(false);
    setToast({ message: 'Training session started!', type: 'success' });
  };

  const handleCloseLobby = () => {
    closeLobby(lobbyCode);
    setShowCloseConfirm(false);
    sessionStorage.clear();
    setToast({ message: 'Lobby closed successfully', type: 'info' });

    // Navigate to analytics after 2 seconds
    setTimeout(() => {
      onNavigateToAnalytics();
    }, 2000);
  };

  const handleRemoveParticipant = (username) => {
    if (window.confirm(`Remove ${username} from this lobby?`)) {
      removeParticipant(lobbyCode, username);
      setToast({ message: `${username} removed`, type: 'info' });
    }
  };

  if (!lobby) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading lobby...</p>
        </div>
      </div>
    );
  }

  const canStart = lobby.participants.length > 0 && lobby.status === 'active';
  const inProgress = lobby.status === 'in_progress';
  const completed = lobby.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Lobby Code Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3">Lobby Code</p>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-6xl font-bold text-gray-900 tracking-wider font-mono">
              {lobbyCode}
            </div>
            <button
              onClick={copyCode}
              className="p-4 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-2xl transition-all hover:scale-110"
              title="Copy code"
            >
              <Copy className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-4">Share this code with participants to join</p>
        </div>

        {/* Session Info */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3">Session Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-semibold text-gray-900">{lobby.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Difficulty:</span>
                  <p className="font-semibold text-gray-900 capitalize">{lobby.difficulty}</p>
                </div>
                <div>
                  <span className="text-gray-600">Questions:</span>
                  <p className="font-semibold text-gray-900">{lobby.questionCount || 5} scenarios</p>
                </div>
                {lobby.moderatorName && (
                  <div>
                    <span className="text-gray-600">Moderator:</span>
                    <p className="font-semibold text-gray-900">{lobby.moderatorName}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3">Status</h3>
              <div className="space-y-3">
                <div>
                  <StatusBadge status={lobby.status} />
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <p className="font-semibold text-gray-900">
                    {new Date(lobby.createdAt).toLocaleString()}
                  </p>
                </div>
                {inProgress && lobby.startedAt && (
                  <div>
                    <span className="text-gray-600">Started:</span>
                    <p className="font-semibold text-gray-900">
                      {new Date(lobby.startedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Participants</h2>
                <p className="text-sm text-gray-600">{lobby.participants.length} joined</p>
              </div>
            </div>
          </div>

          {lobby.participants.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-gray-100 rounded-3xl mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-lg text-gray-600">No participants yet</p>
              <p className="text-sm text-gray-500 mt-2">Share the lobby code to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lobby.participants.map((participant) => (
                <div
                  key={participant.username}
                  className="flex items-center justify-between p-5 bg-white/80 rounded-2xl border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {participant.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{participant.username}</p>
                      <p className="text-sm text-gray-600">
                        Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={participant.status} />
                    {participant.status === 'completed' && participant.percentage !== null && (
                      <span className="text-sm font-semibold text-green-600">
                        {participant.percentage.toFixed(0)}%
                      </span>
                    )}
                    {lobby.status === 'active' && (
                      <button
                        onClick={() => handleRemoveParticipant(participant.username)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove participant"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {!completed && (
            <>
              <button
                onClick={() => setShowStartConfirm(true)}
                disabled={!canStart || inProgress}
                className={`flex-1 px-8 py-4 rounded-2xl font-medium text-lg shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                  canStart && !inProgress
                    ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-5 h-5" />
                <span>{inProgress ? 'Session In Progress' : 'Start Training'}</span>
              </button>

              <button
                onClick={() => setShowCloseConfirm(true)}
                className="flex-1 px-8 py-4 bg-white/80 backdrop-blur-sm hover:bg-white text-red-600 rounded-2xl font-medium border-2 border-red-200 hover:border-red-300 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <XCircle className="w-5 h-5" />
                <span>Close Lobby</span>
              </button>
            </>
          )}
          {completed && (
            <button
              onClick={onNavigateToAnalytics}
              className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium text-lg shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-105"
            >
              View Analytics
            </button>
          )}
        </div>
      </div>

      {/* Start Confirmation Modal */}
      {showStartConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-green-100 rounded-2xl">
                <Play className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">Start Training Session?</h3>
              <p className="text-gray-600">
                This will begin the training for all {lobby.participants.length} participant(s).
                No new participants can join once started.
              </p>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowStartConfirm(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartSession}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all"
                >
                  Start Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-red-100 rounded-2xl">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">Close This Lobby?</h3>
              <p className="text-gray-600">
                This will end the session and close the lobby. You'll be able to view analytics for completed participants.
              </p>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseLobby}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all"
                >
                  Close Lobby
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LobbyDashboard;
