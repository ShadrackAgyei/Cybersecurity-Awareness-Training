import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Mail, Lock, Users, Wifi, Usb, AlertTriangle, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Trophy, Target, BarChart3 } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import { saveSessionData } from './analytics';
import CreateLobbyForm from './components/lobby/CreateLobbyForm';
import JoinLobbyFlow from './components/lobby/JoinLobbyFlow';
import LobbyDashboard from './components/lobby/LobbyDashboard';
import WaitingRoom from './components/lobby/WaitingRoom';
import { saveLobbySession, cleanupExpiredLobbies, getLobby } from './utils/lobbyManagement';

const CybersecurityTrainingApp = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [difficulty, setDifficulty] = useState('beginner');
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState([]);
  const [scenarioResults, setScenarioResults] = useState([]);
  const [fadeIn, setFadeIn] = useState(false);
  
  // Lobby state
  const [lobbyCode, setLobbyCode] = useState(null);
  const [username, setUsername] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Fade in effect for screen transitions
  useEffect(() => {
    setFadeIn(true);
  }, [currentScreen, currentScenarioIndex]);

  // Initialize lobby state from sessionStorage (only on mount)
  useEffect(() => {
    // Cleanup expired lobbies on mount
    cleanupExpiredLobbies();
    
    // Check if user is in a lobby from sessionStorage
    const storedLobbyCode = sessionStorage.getItem('currentLobbyCode');
    const storedUsername = sessionStorage.getItem('currentUsername');
    const storedRole = sessionStorage.getItem('userRole');
    
    if (storedLobbyCode && storedRole === 'moderator') {
      setLobbyCode(storedLobbyCode);
      setUserRole('moderator');
      setCurrentScreen('lobby-dashboard');
    } else if (storedLobbyCode && storedRole === 'participant') {
      setLobbyCode(storedLobbyCode);
      setUsername(storedUsername);
      setUserRole('participant');
      setCurrentScreen('waiting-room');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const scenarios = {
    beginner: [
      {
        id: 1,
        icon: Mail,
        title: 'Suspicious Email',
        category: 'phishing',
        situation: 'You receive an email from "IT Support" asking you to click a link to verify your account credentials. The email has your company logo but the sender\'s email is "support@company-verify.net".',
        choices: [
          {
            text: 'Click the link immediately to avoid account suspension',
            isCorrect: false,
            explanation: 'This is a phishing attempt. Legitimate IT departments never ask for credentials via email. The suspicious domain and urgent tone are red flags.',
            consequence: 'Your credentials were stolen, compromising company data.'
          },
          {
            text: 'Report the email to IT and delete it',
            isCorrect: true,
            explanation: 'Excellent! You identified the phishing attempt. Always verify suspicious emails through official channels and report potential threats.',
            consequence: 'You protected yourself and helped the company identify a phishing campaign.'
          },
          {
            text: 'Forward it to colleagues to warn them',
            isCorrect: false,
            explanation: 'While well-intentioned, forwarding phishing emails spreads the threat. Report to IT instead and let them send official warnings.',
            consequence: 'The phishing email spread to more employees, increasing risk.'
          }
        ]
      },
      {
        id: 2,
        icon: Lock,
        title: 'Password Creation',
        category: 'password',
        situation: 'You need to create a new password for your work account. Which approach is most secure?',
        choices: [
          {
            text: 'Use "CompanyName2024!" - easy to remember',
            isCorrect: false,
            explanation: 'Predictable patterns with company names and years are easily guessed. Hackers use dictionaries with common patterns like this.',
            consequence: 'Your account was compromised within weeks.'
          },
          {
            text: 'Use a password manager to generate and store a complex 16+ character password',
            isCorrect: true,
            explanation: 'Perfect! Password managers create strong, unique passwords for each account and store them securely. This is the gold standard for password security.',
            consequence: 'Your account remains secure with a strong, unique password.'
          },
          {
            text: 'Use the same strong password you use for other accounts',
            isCorrect: false,
            explanation: 'Password reuse is dangerous. If one account is breached, all accounts using that password are compromised. Always use unique passwords.',
            consequence: 'A data breach at another service exposed your password, compromising multiple accounts.'
          }
        ]
      },
      {
        id: 3,
        icon: Users,
        title: 'Social Engineering Call',
        category: 'social-engineering',
        situation: 'Someone calls claiming to be from your bank, saying there\'s suspicious activity on your account. They ask for your account number to "verify your identity".',
        choices: [
          {
            text: 'Provide the information - they already have some details',
            isCorrect: false,
            explanation: 'This is social engineering. Scammers use small pieces of information to gain trust. Real banks never ask for sensitive info over unsolicited calls.',
            consequence: 'Your account information was stolen and used for fraud.'
          },
          {
            text: 'Hang up and call your bank using the official number',
            isCorrect: true,
            explanation: 'Excellent judgment! Always verify by calling back on official numbers. This protects you from impersonation attacks.',
            consequence: 'You avoided a scam and reported the attempt to your bank.'
          },
          {
            text: 'Ask them to prove they\'re from the bank',
            isCorrect: false,
            explanation: 'Scammers are prepared with convincing stories and fake credentials. Never engage - hang up and call the official number instead.',
            consequence: 'The scammer used convincing fake information to gain your trust and steal data.'
          }
        ]
      }
    ],
    intermediate: [
      {
        id: 4,
        icon: Wifi,
        title: 'Public WiFi',
        category: 'network',
        situation: 'You\'re at a coffee shop and need to access your work email. You see two WiFi networks: "CoffeeShop_Guest" and "CoffeeShop_Free_WiFi". What\'s your best approach?',
        choices: [
          {
            text: 'Connect to either network and proceed normally',
            isCorrect: false,
            explanation: 'Public WiFi networks can be intercepted or fake. Without protection, your data including passwords can be stolen through man-in-the-middle attacks.',
            consequence: 'Your session was intercepted and credentials were stolen.'
          },
          {
            text: 'Use your phone\'s hotspot or VPN before accessing sensitive data',
            isCorrect: true,
            explanation: 'Excellent security practice! VPNs encrypt your connection, and mobile hotspots are more secure than public WiFi. Always protect sensitive work access.',
            consequence: 'Your connection was encrypted and secure, protecting company data.'
          },
          {
            text: 'Ask the barista which network is real',
            isCorrect: false,
            explanation: 'While verification is good, even legitimate public WiFi is insecure. Attackers can monitor traffic on the real network. Always use VPN protection.',
            consequence: 'Even on the legitimate network, your data was exposed to monitoring.'
          }
        ]
      },
      {
        id: 5,
        icon: Usb,
        title: 'Found USB Drive',
        category: 'physical',
        situation: 'You find a USB drive in the parking lot labeled "Executive Salary Information - Confidential". What should you do?',
        choices: [
          {
            text: 'Plug it into your work computer to see who it belongs to',
            isCorrect: false,
            explanation: 'This is a common attack vector called "USB baiting". The drive likely contains malware that auto-installs. The enticing label is designed to increase curiosity.',
            consequence: 'Malware infected your computer and spread through the network.'
          },
          {
            text: 'Turn it in to security/IT without plugging it in',
            isCorrect: true,
            explanation: 'Perfect response! Never plug unknown USB drives into company devices. IT can safely examine it in isolated systems. This protects against malware and USB-based attacks.',
            consequence: 'IT safely analyzed the drive and found it contained ransomware. You prevented a major breach.'
          },
          {
            text: 'Plug it into your personal laptop first to check it',
            isCorrect: false,
            explanation: 'Your personal device is still at risk. Malware can steal personal data, access cloud accounts, or use your device to attack company systems you connect to.',
            consequence: 'Your personal device was compromised, exposing personal and work data.'
          }
        ]
      },
      {
        id: 6,
        icon: AlertTriangle,
        title: 'Data Breach Notification',
        category: 'incident-response',
        situation: 'You receive a notification that a website where you have an account was breached. Your email and password may have been exposed. What should you do first?',
        choices: [
          {
            text: 'Wait to see if anything suspicious happens',
            isCorrect: false,
            explanation: 'Waiting gives attackers time to use your credentials. They move quickly to access accounts, steal data, or sell credentials on the dark web.',
            consequence: 'Your account was accessed and used for fraudulent activities.'
          },
          {
            text: 'Change your password on that site and any other sites using the same password',
            isCorrect: true,
            explanation: 'Correct! Immediately change compromised passwords and any duplicates. Enable 2FA if available. This limits damage from credential stuffing attacks.',
            consequence: 'You secured your accounts before attackers could exploit the breach.'
          },
          {
            text: 'Delete your account on that site',
            isCorrect: false,
            explanation: 'While closing the account helps eventually, the data is already exposed. First change passwords everywhere to prevent immediate exploitation.',
            consequence: 'While closing the account, attackers used your exposed password on other sites first.'
          }
        ]
      }
    ],
    advanced: [
      {
        id: 7,
        icon: AlertTriangle,
        title: 'Ransomware Attack',
        category: 'incident-response',
        situation: 'Your computer suddenly displays a message claiming all files are encrypted and demanding Bitcoin payment within 48 hours. Your recent work is on this machine. What\'s your best response?',
        choices: [
          {
            text: 'Pay the ransom immediately to recover your files',
            isCorrect: false,
            explanation: 'Paying ransoms funds criminal operations and doesn\'t guarantee file recovery. Many victims pay and receive nothing. It also makes you a target for future attacks.',
            consequence: 'You paid $5,000 but received no decryption key. Files remain locked.'
          },
          {
            text: 'Disconnect from network immediately and contact IT/security team',
            isCorrect: true,
            explanation: 'Excellent crisis response! Disconnecting prevents ransomware spread. Professional incident response teams can: assess damage, recover from backups, and potentially decrypt files without paying.',
            consequence: 'You contained the infection. IT restored files from backups with minimal data loss.'
          },
          {
            text: 'Try to decrypt the files yourself using online tools',
            isCorrect: false,
            explanation: 'While some decryptors exist, attempting fixes wastes critical time. Ransomware continues spreading through networks. Immediate professional response and containment is essential.',
            consequence: 'While you searched for tools, ransomware spread to shared drives, escalating the damage.'
          }
        ]
      },
      {
        id: 8,
        icon: Shield,
        title: 'Two-Factor Authentication',
        category: 'authentication',
        situation: 'Your company is implementing 2FA. You receive a 2FA code via SMS while NOT trying to log in. What should you do?',
        choices: [
          {
            text: 'Ignore it - probably a system test',
            isCorrect: false,
            explanation: 'Unsolicited 2FA codes indicate someone has your password and is attempting to access your account. This is an active attack in progress.',
            consequence: 'The attacker continued attempts and eventually succeeded through social engineering.'
          },
          {
            text: 'Immediately change your password and report to IT security',
            isCorrect: true,
            explanation: 'Perfect! This indicates credential compromise. Someone has your password. Immediate password change and security notification can prevent account takeover and identify broader attacks.',
            consequence: 'You prevented account takeover and IT discovered a credential stuffing campaign targeting the company.'
          },
          {
            text: 'Reply to the message asking why you received it',
            isCorrect: false,
            explanation: 'Never reply to automated security messages - they aren\'t monitored. Take direct action: change password and report. Delays allow attackers more attempts.',
            consequence: 'While waiting for a response, the attacker made multiple attempts and compromised your account.'
          }
        ]
      },
      {
        id: 9,
        icon: Users,
        title: 'Advanced Phishing',
        category: 'phishing',
        situation: 'You receive a DocuSign notification to review an urgent contract. The email looks perfect, uses correct branding, and you were expecting contract documents. However, you notice the "Review Document" button URL (on hover) shows "docusign-secure.net" instead of "docusign.com".',
        choices: [
          {
            text: 'Click it - everything else looks legitimate and you\'re expecting documents',
            isCorrect: false,
            explanation: 'This is a sophisticated phishing attack using domain spoofing. Attackers copy legitimate services perfectly. Always verify domains carefully - even one character difference means it\'s fake.',
            consequence: 'The fake site harvested your credentials and infected your system with info-stealing malware.'
          },
          {
            text: 'Log into DocuSign separately through your browser to check for the document',
            isCorrect: true,
            explanation: 'Outstanding security awareness! When in doubt, access services directly through official websites or apps, not email links. This defeats phishing regardless of sophistication.',
            consequence: 'You avoided the phishing trap and reported it. IT found this was part of a targeted spear-phishing campaign.'
          },
          {
            text: 'Forward to IT asking if it\'s legitimate',
            isCorrect: false,
            explanation: 'While reporting is good, you should also access DocuSign directly first. Don\'t click suspicious links even while waiting for IT response. Be proactive in protection.',
            consequence: 'While waiting for IT response, you accidentally clicked the link, compromising your account.'
          }
        ]
      }
    ]
  };

  const getCurrentScenarios = () => scenarios[difficulty];
  const currentScenario = getCurrentScenarios()[currentScenarioIndex];
  const totalScenarios = getCurrentScenarios().length;
  const progressPercentage = (completedScenarios.length / totalScenarios) * 100;

  const handleChoiceSelect = (choice, choiceIndex) => {
    setSelectedChoice({ ...choice, index: choiceIndex });
    setShowResult(true);
    if (choice.isCorrect) {
      setScore(score + 1);
    }
    setCompletedScenarios([...completedScenarios, currentScenarioIndex]);

    // Track scenario result for analytics
    const result = {
      scenarioId: currentScenario.id,
      scenarioTitle: currentScenario.title,
      category: currentScenario.category,
      isCorrect: choice.isCorrect,
      choiceIndex
    };
    setScenarioResults([...scenarioResults, result]);
  };

  const handleNextScenario = () => {
    setFadeIn(false);
    setTimeout(() => {
      if (currentScenarioIndex < totalScenarios - 1) {
        setCurrentScenarioIndex(currentScenarioIndex + 1);
        setSelectedChoice(null);
        setShowResult(false);
        setFadeIn(true);
      } else {
        // Save session data when training completes
        const sessionData = {
          difficulty,
          score,
          totalScenarios,
          percentage: (score / totalScenarios) * 100,
          scenarioResults
        };
        
        // If in lobby mode, save to lobby; otherwise save to regular analytics
        if (lobbyCode && userRole === 'participant' && username) {
          saveLobbySession(lobbyCode, username, sessionData);
          // Also save to regular analytics
          saveSessionData(sessionData);
          setCurrentScreen('completion');
        } else {
          saveSessionData(sessionData);
          setCurrentScreen('completion');
        }
        setFadeIn(true);
      }
    }, 300);
  };

  const handleDifficultySelect = (level) => {
    setDifficulty(level);
    setCurrentScreen('scenario');
    setCurrentScenarioIndex(0);
    setScore(0);
    setCompletedScenarios([]);
    setScenarioResults([]);
    setSelectedChoice(null);
    setShowResult(false);
  };

  // Lobby handlers
  const handleLobbyCreated = (code) => {
    setLobbyCode(code);
    setUserRole('moderator');
    setCurrentScreen('lobby-dashboard');
  };

  const handleLobbyJoined = (code, user) => {
    setLobbyCode(code);
    setUsername(user);
    setUserRole('participant');
    setCurrentScreen('waiting-room');
  };

  const handleStartTrainingFromLobby = useCallback(() => {
    // Get difficulty from lobby
    const lobby = getLobby(lobbyCode);
    if (lobby) {
      setDifficulty(lobby.difficulty);
      setCurrentScenarioIndex(0);
      setScore(0);
      setCompletedScenarios([]);
      setScenarioResults([]);
      setSelectedChoice(null);
      setShowResult(false);
      setCurrentScreen('scenario');
    }
  }, [lobbyCode]);

  const handleLeaveLobby = () => {
    sessionStorage.clear();
    setLobbyCode(null);
    setUsername(null);
    setUserRole(null);
    setCurrentScreen('welcome');
  };

  const handleRestart = () => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentScreen('welcome');
      setCurrentScenarioIndex(0);
      setScore(0);
      setCompletedScenarios([]);
      setScenarioResults([]);
      setSelectedChoice(null);
      setShowResult(false);
      setFadeIn(true);
    }, 300);
  };

  // Admin Dashboard Screen
  if (currentScreen === 'admin') {
    return <AdminDashboard onBack={() => setCurrentScreen('welcome')} />;
  }

  // Create Lobby Screen
  if (currentScreen === 'create-lobby') {
    return <CreateLobbyForm onBack={() => setCurrentScreen('welcome')} onLobbyCreated={handleLobbyCreated} />;
  }

  // Join Lobby Screen
  if (currentScreen === 'join-lobby') {
    return <JoinLobbyFlow onBack={() => setCurrentScreen('welcome')} onJoined={handleLobbyJoined} />;
  }

  // Lobby Dashboard Screen (Moderator)
  if (currentScreen === 'lobby-dashboard') {
    return (
      <LobbyDashboard
        lobbyCode={lobbyCode}
        onNavigateToAnalytics={() => setCurrentScreen('admin')}
        onExit={handleLeaveLobby}
      />
    );
  }

  // Waiting Room Screen (Participant)
  if (currentScreen === 'waiting-room') {
    return (
      <WaitingRoom
        lobbyCode={lobbyCode}
        username={username}
        onStartTraining={handleStartTrainingFromLobby}
        onLeave={handleLeaveLobby}
      />
    );
  }

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className={`max-w-2xl w-full transition-all duration-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center space-y-8">
            <div className="inline-block p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg">
              <Shield className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-semibold text-gray-900 tracking-tight">
                Security Awareness
              </h1>
              <p className="text-xl text-gray-600 font-light leading-relaxed max-w-xl mx-auto">
                Learn essential cybersecurity practices through interactive scenarios
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="space-y-6">
                <div className="flex items-start space-x-4 text-left">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Real-World Scenarios</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Practice making security decisions in realistic situations
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-left">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Instant Feedback</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Learn from each choice with detailed explanations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setCurrentScreen('difficulty')}
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium text-lg shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center space-x-2"
              >
                <span>Begin Training</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCurrentScreen('create-lobby')}
                  className="group px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-green-300 text-gray-700 rounded-2xl font-medium transition-all hover:shadow-lg inline-flex items-center justify-center space-x-2"
                >
                  <Users className="w-5 h-5 text-green-600" />
                  <span>Create Lobby</span>
                </button>

                <button
                  onClick={() => setCurrentScreen('join-lobby')}
                  className="group px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-purple-300 text-gray-700 rounded-2xl font-medium transition-all hover:shadow-lg inline-flex items-center justify-center space-x-2"
                >
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Join Lobby</span>
                </button>
              </div>

              <button
                onClick={() => setCurrentScreen('admin')}
                className="group px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 text-gray-700 rounded-2xl font-medium transition-all hover:shadow-lg inline-flex items-center space-x-2"
              >
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Difficulty Selection Screen
  if (currentScreen === 'difficulty') {
    const levels = [
      {
        name: 'Beginner',
        value: 'beginner',
        description: 'Basic security awareness',
        scenarios: scenarios.beginner.length,
        color: 'from-green-500 to-green-600',
        icon: '🎯'
      },
      {
        name: 'Intermediate',
        value: 'intermediate',
        description: 'Advanced threat recognition',
        scenarios: scenarios.intermediate.length,
        color: 'from-blue-500 to-blue-600',
        icon: '🛡️'
      },
      {
        name: 'Advanced',
        value: 'advanced',
        description: 'Expert security practices',
        scenarios: scenarios.advanced.length,
        color: 'from-purple-500 to-purple-600',
        icon: '🔒'
      }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className={`max-w-4xl w-full transition-all duration-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-semibold text-gray-900">Choose Your Level</h2>
              <p className="text-lg text-gray-600 font-light">Select a difficulty that matches your experience</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {levels.map((level, index) => (
                <button
                  key={level.value}
                  onClick={() => handleDifficultySelect(level.value)}
                  className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="space-y-4">
                    <div className={`inline-block p-4 bg-gradient-to-br ${level.color} rounded-2xl text-3xl shadow-lg`}>
                      {level.icon}
                    </div>

                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">{level.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{level.description}</p>
                      <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
                        <Target className="w-4 h-4" />
                        <span>{level.scenarios} scenarios</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/5 group-hover:to-blue-600/5 transition-all duration-300" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentScreen('welcome')}
              className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Scenario Screen
  if (currentScreen === 'scenario') {
    const Icon = currentScenario.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">
                Scenario {currentScenarioIndex + 1} of {totalScenarios}
              </span>
              <span className="text-gray-600">
                {completedScenarios.length} completed
              </span>
            </div>
            <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Scenario Card */}
          <div className={`transition-all duration-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100 space-y-8">
              {/* Header */}
              <div className="flex items-start space-x-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-semibold text-gray-900 mb-3">
                    {currentScenario.title}
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {currentScenario.situation}
                  </p>
                </div>
              </div>

              {/* Choices */}
              {!showResult && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    What would you do?
                  </p>
                  <div className="space-y-3">
                    {currentScenario.choices.map((choice, index) => (
                      <button
                        key={index}
                        onClick={() => handleChoiceSelect(choice, index)}
                        className="w-full group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-left border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <p className="flex-1 text-gray-800 leading-relaxed group-hover:text-gray-900">
                            {choice.text}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Result */}
              {showResult && selectedChoice && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Outcome Badge */}
                  <div className={`flex items-center justify-center space-x-3 p-6 rounded-2xl ${
                    selectedChoice.isCorrect
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-red-50 border-2 border-red-200'
                  }`}>
                    {selectedChoice.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                        <span className="text-2xl font-semibold text-green-900">Excellent Choice!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-8 h-8 text-red-600" />
                        <span className="text-2xl font-semibold text-red-900">Not Quite Right</span>
                      </>
                    )}
                  </div>

                  {/* Selected Choice */}
                  <div className="bg-white/80 rounded-2xl p-6 border-2 border-gray-300">
                    <p className="text-sm font-medium text-gray-600 mb-2">Your choice:</p>
                    <p className="text-gray-900 leading-relaxed">{selectedChoice.text}</p>
                  </div>

                  {/* Explanation */}
                  <div className="bg-blue-50/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100">
                    <p className="text-sm font-semibold text-blue-900 mb-2 uppercase tracking-wide">
                      Why?
                    </p>
                    <p className="text-gray-800 leading-relaxed mb-4">
                      {selectedChoice.explanation}
                    </p>
                    <div className="pt-4 border-t border-blue-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Consequence:</p>
                      <p className="text-gray-600 leading-relaxed italic">
                        {selectedChoice.consequence}
                      </p>
                    </div>
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleNextScenario}
                    className="w-full group px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium text-lg shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <span>{currentScenarioIndex < totalScenarios - 1 ? 'Continue' : 'View Results'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (currentScreen === 'completion') {
    const correctPercentage = Math.round((score / totalScenarios) * 100);
    const performanceLevel =
      correctPercentage >= 90 ? { text: 'Outstanding!', color: 'text-green-600', emoji: '🏆' } :
      correctPercentage >= 70 ? { text: 'Great Job!', color: 'text-blue-600', emoji: '⭐' } :
      correctPercentage >= 50 ? { text: 'Good Effort!', color: 'text-yellow-600', emoji: '👍' } :
      { text: 'Keep Learning!', color: 'text-orange-600', emoji: '📚' };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className={`max-w-2xl w-full transition-all duration-700 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="text-center space-y-8">
            {/* Trophy Icon */}
            <div className="inline-block p-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl shadow-xl animate-bounce">
              <Trophy className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h2 className="text-5xl font-semibold text-gray-900">Training Complete!</h2>
              <p className="text-xl text-gray-600 font-light">
                You've completed all scenarios
              </p>
            </div>

            {/* Score Card */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="space-y-6">
                {/* Performance Badge */}
                <div className="text-6xl mb-4">{performanceLevel.emoji}</div>
                <div>
                  <h3 className={`text-3xl font-semibold ${performanceLevel.color} mb-2`}>
                    {performanceLevel.text}
                  </h3>
                  <p className="text-gray-600">
                    You made {score} out of {totalScenarios} secure decisions
                  </p>
                </div>

                {/* Progress Circle */}
                <div className="py-6">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl">
                    <div className="text-white">
                      <div className="text-4xl font-bold">{correctPercentage}%</div>
                      <div className="text-sm font-light">Score</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{totalScenarios}</div>
                    <div className="text-sm text-gray-600">Scenarios</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-green-600">{score}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-red-600">{totalScenarios - score}</div>
                    <div className="text-sm text-gray-600">Missed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-105"
              >
                Try Another Level
              </button>
              <button
                onClick={() => {
                  setCurrentScenarioIndex(0);
                  setScore(0);
                  setCompletedScenarios([]);
                  setScenarioResults([]);
                  setSelectedChoice(null);
                  setShowResult(false);
                  setCurrentScreen('scenario');
                }}
                className="px-8 py-4 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-2xl font-medium border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                Retry This Level
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CybersecurityTrainingApp;
