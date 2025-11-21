import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Award,
  Calendar,
  ArrowLeft,
  Trash2,
  RefreshCw,
  Download,
  PieChart,
  Activity
} from 'lucide-react';
import { getAnalytics, clearAllSessions, categoryMap } from './analytics';

const AdminDashboard = ({ onBack }) => {
  const [analytics, setAnalytics] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadAnalytics();
    setFadeIn(true);
  }, []);

  const loadAnalytics = () => {
    const data = getAnalytics();
    setAnalytics(data);
  };

  const handleClearData = () => {
    clearAllSessions();
    loadAnalytics();
    setShowDeleteConfirm(false);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cybersecurity-analytics-${new Date().toISOString()}.json`;
    link.click();
  };

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="w-8 h-8 text-blue-600" />
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'from-green-500 to-green-600';
      case 'intermediate':
        return 'from-blue-500 to-blue-600';
      case 'advanced':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 70) return 'text-blue-600 bg-blue-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceColorBar = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 py-8">
      <div className={`max-w-7xl mx-auto transition-all duration-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Header */}
        <div className="mb-8 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Training</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={exportData}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 rounded-xl font-medium text-gray-700 transition-all hover:shadow-md flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-red-200 hover:border-red-300 rounded-xl font-medium text-red-600 transition-all hover:shadow-md flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Data</span>
              </button>

              <button
                onClick={loadAnalytics}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all hover:shadow-lg flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <BarChart3 className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-gray-900">Analytics Dashboard</h1>
              <p className="text-lg text-gray-600 font-light">Training performance and insights</p>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-fadeIn">
              <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-red-100 rounded-2xl">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Clear All Data?</h3>
                <p className="text-gray-600">
                  This will permanently delete all training session data and analytics. This action cannot be undone.
                </p>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearData}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {analytics.totalSessions === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-12 max-w-2xl mx-auto">
              <div className="inline-block p-6 bg-gray-100 rounded-3xl mb-6">
                <Activity className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">No Data Yet</h2>
              <p className="text-lg text-gray-600">
                Complete some training sessions to see analytics and insights here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-gray-900 mb-1">
                    {analytics.totalSessions}
                  </div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-gray-900 mb-1">
                    {analytics.averagePercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-gray-900 mb-1">
                    {analytics.averageScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg. Correct Answers</div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-gray-900 mb-1">
                    {Object.keys(analytics.categoryStats).length}
                  </div>
                  <div className="text-sm text-gray-600">Categories Covered</div>
                </div>
              </div>
            </div>

            {/* Difficulty Level Performance */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Performance by Difficulty</h2>
                  <p className="text-sm text-gray-600">Success rates across different levels</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(analytics.difficultyStats).map(([level, stats]) => (
                  <div key={level} className="bg-white/80 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 bg-gradient-to-br ${getDifficultyColor(level)} rounded-xl`}>
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">{level}</h3>
                          <p className="text-sm text-gray-600">{stats.count} sessions completed</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl font-semibold ${getPerformanceColor(stats.averagePercentage)}`}>
                        {stats.averagePercentage.toFixed(1)}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Success Rate</span>
                        <span>{stats.averageScore.toFixed(1)} / {(stats.totalPossible / stats.count).toFixed(1)} avg</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getPerformanceColorBar(stats.averagePercentage)} transition-all duration-1000`}
                          style={{ width: `${stats.averagePercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Performance by Category</h2>
                  <p className="text-sm text-gray-600">Success rates for different security topics</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analytics.categoryStats)
                  .sort((a, b) => b[1].successRate - a[1].successRate)
                  .map(([category, stats]) => {
                    const categoryInfo = categoryMap[category] || { name: category, icon: '📊' };
                    return (
                      <div key={category} className="bg-white/80 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{categoryInfo.icon}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900">{categoryInfo.name}</h3>
                              <p className="text-xs text-gray-600">{stats.attempts} attempts</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className={`text-2xl font-semibold ${getPerformanceColor(stats.successRate).split(' ')[0]}`}>
                            {stats.successRate.toFixed(1)}%
                          </div>

                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getPerformanceColorBar(stats.successRate)} transition-all duration-1000`}
                              style={{ width: `${stats.successRate}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-green-600">✓ {stats.correct}</span>
                            <span className="text-red-600">✗ {stats.incorrect}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Scenario-Specific Performance */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Scenario Performance</h2>
                  <p className="text-sm text-gray-600">Success rates for individual scenarios</p>
                </div>
              </div>

              <div className="space-y-3">
                {analytics.scenarioStats.map((scenario) => (
                  <div key={scenario.scenarioId} className="bg-white/80 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{scenario.scenarioTitle}</h3>
                        <p className="text-sm text-gray-600">
                          {scenario.attempts} attempts • {scenario.correct} correct • {scenario.incorrect} incorrect
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl font-semibold text-sm ${getPerformanceColor(scenario.successRate)}`}>
                        {scenario.successRate.toFixed(1)}%
                      </div>
                    </div>

                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPerformanceColorBar(scenario.successRate)} transition-all duration-1000`}
                        style={{ width: `${scenario.successRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Recent Sessions</h2>
                  <p className="text-sm text-gray-600">Latest training completions</p>
                </div>
              </div>

              <div className="space-y-3">
                {analytics.recentSessions.map((session) => (
                  <div key={session.id} className="bg-white/80 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 bg-gradient-to-br ${getDifficultyColor(session.difficulty)} rounded-xl`}>
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 capitalize">{session.difficulty} Level</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(session.timestamp).toLocaleDateString()} at{' '}
                            {new Date(session.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-semibold text-gray-900">
                          {session.score}/{session.totalScenarios}
                        </div>
                        <div className={`text-sm font-medium ${getPerformanceColor(session.percentage).split(' ')[0]}`}>
                          {session.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
