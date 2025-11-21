// Data Export Utilities

import { getLobby, getAllLobbies } from './lobbyManagement';

// Export individual lobby to CSV
export const exportLobbyToCSV = (lobbyCode) => {
  const lobby = getLobby(lobbyCode);
  if (!lobby) return;

  let csv = `Lobby: ${lobby.name}\n`;
  csv += `Code: ${lobby.code}\n`;
  csv += `Difficulty: ${lobby.difficulty}\n`;
  csv += `Created: ${new Date(lobby.createdAt).toLocaleString()}\n`;
  csv += `Status: ${lobby.status}\n\n`;

  csv += 'Username,Score,Total Scenarios,Percentage,Completed At,Status\n';

  lobby.participants.forEach(participant => {
    const completedAt = participant.completedAt
      ? new Date(participant.completedAt).toLocaleString()
      : 'Not completed';
    csv += `${participant.username},${participant.score || 'N/A'},${participant.totalScenarios || 'N/A'},${participant.percentage?.toFixed(2) || 'N/A'}%,${completedAt},${participant.status}\n`;
  });

  // Add detailed scenario results
  if (lobby.sessions.length > 0) {
    csv += '\n\nDetailed Scenario Results\n';
    csv += 'Username,Scenario,Category,Result,Choice Index\n';

    lobby.sessions.forEach(session => {
      session.scenarioResults?.forEach(result => {
        csv += `${session.username},"${result.scenarioTitle}",${result.category},${result.isCorrect ? 'Correct' : 'Incorrect'},${result.choiceIndex}\n`;
      });
    });
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lobby-${lobbyCode}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Export all lobbies to CSV
export const exportAllLobbies = () => {
  const lobbies = getAllLobbies();

  let csv = 'All Lobbies Summary\n\n';
  csv += 'Lobby Code,Lobby Name,Difficulty,Created At,Participants,Completed,Avg Score %,Status\n';

  lobbies.forEach(lobby => {
    const avgScore = lobby.sessions.length > 0
      ? (lobby.sessions.reduce((sum, s) => sum + s.percentage, 0) / lobby.sessions.length).toFixed(2)
      : '0';
    csv += `${lobby.code},"${lobby.name}",${lobby.difficulty},${new Date(lobby.createdAt).toLocaleString()},${lobby.participants.length},${lobby.sessions.length},${avgScore}%,${lobby.status}\n`;
  });

  csv += '\n\nDetailed Results by Lobby\n';
  csv += 'Lobby Code,Lobby Name,Username,Score,Percentage,Completed At\n';

  lobbies.forEach(lobby => {
    lobby.sessions.forEach(session => {
      csv += `${lobby.code},"${lobby.name}",${session.username},${session.score}/${session.totalScenarios},${session.percentage.toFixed(2)}%,${new Date(session.completedAt).toLocaleString()}\n`;
    });
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `all-lobbies-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Export lobby analytics as JSON
export const exportLobbyAnalyticsJSON = (lobbyCode, analyticsData) => {
  const dataStr = JSON.stringify(analyticsData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lobby-${lobbyCode}-analytics-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

// Export aggregate analytics as JSON
export const exportAggregateAnalyticsJSON = (analyticsData) => {
  const dataStr = JSON.stringify(analyticsData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `aggregate-analytics-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
