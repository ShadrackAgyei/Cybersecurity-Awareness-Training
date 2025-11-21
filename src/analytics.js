// Analytics utility for tracking and storing user session data

export const saveSessionData = (sessionData) => {
  try {
    const existingSessions = getSessionsData();
    const newSession = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...sessionData
    };

    existingSessions.push(newSession);
    localStorage.setItem('cybersecurity_sessions', JSON.stringify(existingSessions));
    return true;
  } catch (error) {
    console.error('Error saving session data:', error);
    return false;
  }
};

export const getSessionsData = () => {
  try {
    const data = localStorage.getItem('cybersecurity_sessions');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting session data:', error);
    return [];
  }
};

export const clearAllSessions = () => {
  try {
    localStorage.removeItem('cybersecurity_sessions');
    return true;
  } catch (error) {
    console.error('Error clearing session data:', error);
    return false;
  }
};

export const getAnalytics = () => {
  const sessions = getSessionsData();

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      averagePercentage: 0,
      difficultyStats: {},
      categoryStats: {},
      scenarioStats: [],
      recentSessions: []
    };
  }

  // Calculate overall statistics
  const totalSessions = sessions.length;
  const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
  const totalPossible = sessions.reduce((sum, s) => sum + s.totalScenarios, 0);
  const averageScore = totalScore / totalSessions;
  const averagePercentage = (totalScore / totalPossible) * 100;

  // Difficulty level statistics
  const difficultyStats = sessions.reduce((stats, session) => {
    const level = session.difficulty;
    if (!stats[level]) {
      stats[level] = {
        count: 0,
        totalScore: 0,
        totalPossible: 0,
        averageScore: 0,
        averagePercentage: 0
      };
    }
    stats[level].count++;
    stats[level].totalScore += session.score;
    stats[level].totalPossible += session.totalScenarios;
    return stats;
  }, {});

  // Calculate averages for each difficulty
  Object.keys(difficultyStats).forEach(level => {
    const stats = difficultyStats[level];
    stats.averageScore = stats.totalScore / stats.count;
    stats.averagePercentage = (stats.totalScore / stats.totalPossible) * 100;
  });

  // Category statistics (by scenario type)
  const categoryStats = sessions.reduce((stats, session) => {
    session.scenarioResults?.forEach(result => {
      const category = result.category;
      if (!stats[category]) {
        stats[category] = {
          attempts: 0,
          correct: 0,
          incorrect: 0,
          successRate: 0
        };
      }
      stats[category].attempts++;
      if (result.isCorrect) {
        stats[category].correct++;
      } else {
        stats[category].incorrect++;
      }
    });
    return stats;
  }, {});

  // Calculate success rates
  Object.keys(categoryStats).forEach(category => {
    const stats = categoryStats[category];
    stats.successRate = (stats.correct / stats.attempts) * 100;
  });

  // Scenario-specific statistics
  const scenarioStatsMap = sessions.reduce((stats, session) => {
    session.scenarioResults?.forEach(result => {
      const key = `${result.scenarioId}-${result.scenarioTitle}`;
      if (!stats[key]) {
        stats[key] = {
          scenarioId: result.scenarioId,
          scenarioTitle: result.scenarioTitle,
          category: result.category,
          attempts: 0,
          correct: 0,
          incorrect: 0,
          successRate: 0
        };
      }
      stats[key].attempts++;
      if (result.isCorrect) {
        stats[key].correct++;
      } else {
        stats[key].incorrect++;
      }
    });
    return stats;
  }, {});

  const scenarioStats = Object.values(scenarioStatsMap).map(stat => ({
    ...stat,
    successRate: (stat.correct / stat.attempts) * 100
  })).sort((a, b) => a.scenarioId - b.scenarioId);

  // Recent sessions (last 10)
  const recentSessions = sessions
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  return {
    totalSessions,
    averageScore: Math.round(averageScore * 10) / 10,
    averagePercentage: Math.round(averagePercentage * 10) / 10,
    difficultyStats,
    categoryStats,
    scenarioStats,
    recentSessions
  };
};

// Category mapping
export const categoryMap = {
  'phishing': { name: 'Phishing', icon: '📧' },
  'password': { name: 'Password Security', icon: '🔐' },
  'social-engineering': { name: 'Social Engineering', icon: '🎭' },
  'network': { name: 'Network Security', icon: '📶' },
  'physical': { name: 'Physical Security', icon: '💾' },
  'incident-response': { name: 'Incident Response', icon: '🚨' },
  'authentication': { name: 'Authentication', icon: '🔑' }
};
