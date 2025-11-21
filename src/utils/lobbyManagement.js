// Lobby Management Utilities

// Generate unique 6-character lobby code (uppercase alphanumeric, no confusing chars)
export const generateLobbyCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  const lobbies = JSON.parse(localStorage.getItem('lobbies') || '{}');
  return lobbies[code] ? generateLobbyCode() : code;
};

// Create new lobby
export const createLobby = (name, difficulty, moderatorName) => {
  const code = generateLobbyCode();
  const lobby = {
    code,
    name: name || `Training Session - ${new Date().toLocaleDateString()}`,
    difficulty,
    moderatorName: moderatorName || '',
    createdAt: new Date().toISOString(),
    status: 'active',
    startedAt: null,
    closedAt: null,
    participants: [],
    sessions: []
  };

  const lobbies = JSON.parse(localStorage.getItem('lobbies') || '{}');
  lobbies[code] = lobby;
  localStorage.setItem('lobbies', JSON.stringify(lobbies));
  return code;
};

// Get lobby by code
export const getLobby = (code) => {
  const lobbies = JSON.parse(localStorage.getItem('lobbies') || '{}');
  return lobbies[code] || null;
};

// Join lobby as participant
export const joinLobby = (code, username) => {
  const lobbies = JSON.parse(localStorage.getItem('lobbies') || '{}');
  const lobby = lobbies[code];

  if (!lobby) return { success: false, error: 'Lobby not found' };
  if (lobby.status === 'expired') return { success: false, error: 'Lobby has expired' };
  if (lobby.status === 'completed') return { success: false, error: 'Lobby is closed' };
  if (lobby.status === 'in_progress') return { success: false, error: 'Session already started' };

  const usernameExists = lobby.participants.some(p => p.username === username);
  if (usernameExists) return { success: false, error: 'Username already taken in this lobby' };

  lobby.participants.push({
    username,
    joinedAt: new Date().toISOString(),
    status: 'waiting',
    score: null,
    totalScenarios: null,
    percentage: null,
    completedAt: null
  });

  lobbies[code] = lobby;
  localStorage.setItem('lobbies', JSON.stringify(lobbies));
  return { success: true, lobby };
};

// Remove participant from lobby
export const removeParticipant = (code, username) => {
  const lobbies = JSON.parse(localStorage.getItem('lobbies') || '{}');
  const lobby = lobbies[code];
  if (!lobby) return false;

  lobby.participants = lobby.participants.filter(p => p.username !== username);
  lobbies[code] = lobby;
  localStorage.setItem('lobbies', JSON.stringify(lobbies));
  return true;
};

// Start training session
export const startLobbySession = (code) => {
  const lobbies = JSON.parse(localStorage.getItem('lobbies') || '{}');
  if (lobbies[code]) {
    lobbies[code].status = 'in_progress';
    lobbies[code].startedAt = new Date().toISOString();

    // Update all participants to 'in_progress'
    lobbies[code].participants.forEach(p => {
      if (p.status === 'waiting') {
        p.status = 'in_progress';
      }
    });

    localStorage.setItem('lobbies', JSON.stringify(lobbies));
    return true;
  }
  return false;
};

// Save completed training session
export const saveLobbySession = (code, username, sessionData) => {
  const lobbies = JSON.parse(localStorage.getItem('lobbies') || '{}');
  const lobby = lobbies[code];
  if (!lobby) return false;

  // Add complete session data
  lobby.sessions.push({
    username,
    score: sessionData.score,
    totalScenarios: sessionData.totalScenarios,
    percentage: sessionData.percentage,
    completedAt: new Date().toISOString(),
    scenarioResults: sessionData.scenarioResults
  });

  // Update participant status
  const participant = lobby.participants.find(p => p.username === username);
  if (participant) {
    participant.status = 'completed';
    participant.score = sessionData.score;
    participant.totalScenarios = sessionData.totalScenarios;
    participant.percentage = sessionData.percentage;
    participant.completedAt = new Date().toISOString();
  }

  lobbies[code] = lobby;
  localStorage.setItem('lobbies', JSON.stringify(lobbies));
  return true;
};

// Close lobby
export const closeLobby = (code) => {
  const lobbies = JSON.parse(localStorage.getItem('lobbies') || '{}');
  if (lobbies[code]) {
    lobbies[code].status = 'completed';
    lobbies[code].closedAt = new Date().toISOString();
    localStorage.setItem('lobbies', JSON.stringify(lobbies));
    return true;
  }
  return false;
};

// Cleanup expired lobbies (call on app mount)
export const cleanupExpiredLobbies = () => {
  const lobbies = JSON.parse(localStorage.getItem('lobbies') || '{}');
  const now = new Date();
  let updated = false;

  Object.keys(lobbies).forEach(code => {
    const lobby = lobbies[code];
    const created = new Date(lobby.createdAt);
    const hoursSinceCreation = (now - created) / (1000 * 60 * 60);

    if (hoursSinceCreation > 24 && lobby.status !== 'completed') {
      lobbies[code].status = 'expired';
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem('lobbies', JSON.stringify(lobbies));
  }
};

// Get all lobbies
export const getAllLobbies = () => {
  const lobbies = JSON.parse(localStorage.getItem('lobbies') || '{}');
  return Object.values(lobbies).sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );
};

// Calculate category statistics from sessions
const calculateCategoryStats = (sessions) => {
  const categoryStats = {};

  sessions.forEach(session => {
    session.scenarioResults?.forEach(result => {
      const category = result.category;
      if (!categoryStats[category]) {
        categoryStats[category] = {
          attempts: 0,
          correct: 0,
          incorrect: 0,
          successRate: 0
        };
      }
      categoryStats[category].attempts++;
      if (result.isCorrect) {
        categoryStats[category].correct++;
      } else {
        categoryStats[category].incorrect++;
      }
    });
  });

  // Calculate success rates
  Object.keys(categoryStats).forEach(category => {
    const stats = categoryStats[category];
    stats.successRate = (stats.correct / stats.attempts) * 100;
  });

  return categoryStats;
};

// Calculate scenario-specific statistics
const calculateScenarioStats = (sessions) => {
  const scenarioStatsMap = {};

  sessions.forEach(session => {
    session.scenarioResults?.forEach(result => {
      const key = `${result.scenarioId}-${result.scenarioTitle}`;
      if (!scenarioStatsMap[key]) {
        scenarioStatsMap[key] = {
          scenarioId: result.scenarioId,
          scenarioTitle: result.scenarioTitle,
          category: result.category,
          attempts: 0,
          correct: 0,
          incorrect: 0,
          successRate: 0
        };
      }
      scenarioStatsMap[key].attempts++;
      if (result.isCorrect) {
        scenarioStatsMap[key].correct++;
      } else {
        scenarioStatsMap[key].incorrect++;
      }
    });
  });

  const scenarioStats = Object.values(scenarioStatsMap).map(stat => ({
    ...stat,
    successRate: (stat.correct / stat.attempts) * 100
  })).sort((a, b) => a.scenarioId - b.scenarioId);

  return scenarioStats;
};

// Get lobby analytics
export const getLobbyAnalytics = (lobbyCode) => {
  const lobby = getLobby(lobbyCode);
  if (!lobby) return null;

  const sessions = lobby.sessions;

  return {
    lobbyInfo: {
      code: lobby.code,
      name: lobby.name,
      difficulty: lobby.difficulty,
      createdAt: lobby.createdAt,
      status: lobby.status,
      moderatorName: lobby.moderatorName
    },
    totalParticipants: lobby.participants.length,
    completedCount: sessions.length,
    averageScore: sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length
      : 0,
    averagePercentage: sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.percentage, 0) / sessions.length
      : 0,
    categoryStats: calculateCategoryStats(sessions),
    scenarioStats: calculateScenarioStats(sessions),
    participants: lobby.participants,
    sessions: sessions
  };
};

// Get aggregate analytics across all lobbies
export const getAggregateAnalytics = () => {
  const lobbies = getAllLobbies();
  const allSessions = lobbies.flatMap(lobby => lobby.sessions);

  // Calculate difficulty stats
  const difficultyStats = lobbies.reduce((stats, lobby) => {
    const level = lobby.difficulty;
    const lobbySessions = lobby.sessions;

    if (!stats[level]) {
      stats[level] = {
        count: 0,
        totalScore: 0,
        totalPossible: 0,
        averageScore: 0,
        averagePercentage: 0
      };
    }

    stats[level].count += lobbySessions.length;
    stats[level].totalScore += lobbySessions.reduce((sum, s) => sum + s.score, 0);
    stats[level].totalPossible += lobbySessions.reduce((sum, s) => sum + s.totalScenarios, 0);

    return stats;
  }, {});

  // Calculate averages for each difficulty
  Object.keys(difficultyStats).forEach(level => {
    const stats = difficultyStats[level];
    if (stats.count > 0) {
      stats.averageScore = stats.totalScore / stats.count;
      stats.averagePercentage = (stats.totalScore / stats.totalPossible) * 100;
    }
  });

  return {
    totalLobbies: lobbies.length,
    activeLobbies: lobbies.filter(l => l.status === 'active').length,
    completedLobbies: lobbies.filter(l => l.status === 'completed').length,
    totalSessions: allSessions.length,
    averageScore: allSessions.length > 0
      ? allSessions.reduce((sum, s) => sum + s.score, 0) / allSessions.length
      : 0,
    averagePercentage: allSessions.length > 0
      ? allSessions.reduce((sum, s) => sum + s.percentage, 0) / allSessions.length
      : 0,
    categoryStats: calculateCategoryStats(allSessions),
    scenarioStats: calculateScenarioStats(allSessions),
    difficultyStats
  };
};
