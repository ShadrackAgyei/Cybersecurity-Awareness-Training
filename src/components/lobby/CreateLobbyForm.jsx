import React, { useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { createLobby } from '../../utils/lobbyManagement';

const CreateLobbyForm = ({ onBack, onLobbyCreated }) => {
  const [sessionName, setSessionName] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [moderatorName, setModeratorName] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [fadeIn, setFadeIn] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();

    const code = createLobby(sessionName, difficulty, moderatorName, questionCount);

    // Store in sessionStorage
    sessionStorage.setItem('currentLobbyCode', code);
    sessionStorage.setItem('userRole', 'moderator');

    // Navigate to lobby dashboard
    onLobbyCreated(code);
  };

  const difficultyOptions = [
    {
      value: 'beginner',
      name: 'Beginner',
      description: 'Basic security awareness',
      color: 'from-green-500 to-green-600',
      icon: '🎯'
    },
    {
      value: 'intermediate',
      name: 'Intermediate',
      description: 'Advanced threat recognition',
      color: 'from-blue-500 to-blue-600',
      icon: '🛡️'
    },
    {
      value: 'advanced',
      name: 'Advanced',
      description: 'Expert security practices',
      color: 'from-purple-500 to-purple-600',
      icon: '🔒'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className={`max-w-2xl w-full transition-all duration-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="space-y-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg">
              <Users className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-gray-900">Create Training Session</h1>
              <p className="text-lg text-gray-600 font-light mt-2">Set up a new cybersecurity training lobby</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100 space-y-6">
            {/* Session Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Session Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., IT Department Training"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm"
                maxLength={100}
              />
            </div>

            {/* Moderator Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Your Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={moderatorName}
                onChange={(e) => setModeratorName(e.target.value)}
                placeholder="e.g., Teacher Smith"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm"
                maxLength={50}
              />
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDifficulty(option.value)}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                      difficulty === option.value
                        ? 'border-blue-400 bg-blue-50/50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className={`inline-block p-3 bg-gradient-to-br ${option.color} rounded-xl text-2xl`}>
                        {option.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{option.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                      </div>
                    </div>
                    {difficulty === option.value && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Number of Questions <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[3, 5, 10, 15].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      questionCount === count
                        ? 'border-blue-400 bg-blue-50/50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-xs text-gray-600 mt-1">questions</div>
                    </div>
                    {questionCount === count && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Select how many scenarios participants will complete in this session
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium text-lg shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-105"
            >
              Create Lobby
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLobbyForm;
