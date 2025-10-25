import React, { useState } from 'react';
import './App.css';
import { Player } from './types/tournament';
import TournamentManager from './components/TournamentManager';
import { Trophy, Users, Plus } from 'lucide-react';

function App() {
  const [showTournament, setShowTournament] = useState(false);
  const [players] = useState<Player[]>([]);

  return (
    <div className="App min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-16 h-16 text-yellow-300" />
            <h1 className="text-5xl font-bold text-white">
              Badminton Tournament Maker
            </h1>
          </div>
          <p className="text-purple-100 text-lg">
            Professional doubles tournament management made simple
          </p>
        </div>

        {/* Main Content */}
        {!showTournament ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Welcome to Tournament Maker
                </h2>
                <p className="text-gray-600 text-lg">
                  Organize and manage badminton doubles tournaments with ease
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Features */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-800">Features</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Round-robin group stage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Knockout playoffs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Live leaderboard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Visual bracket tree</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Team customization</span>
                    </li>
                  </ul>
                </div>

                {/* Quick Start */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Plus className="w-8 h-8 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-800">Quick Start</h3>
                  </div>
                  <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                    <li>Add players (minimum 4)</li>
                    <li>Generate balanced teams</li>
                    <li>Configure tournament settings</li>
                    <li>Start and manage matches</li>
                    <li>Track progress & crown champion</li>
                  </ol>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button
                  onClick={() => setShowTournament(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-4 rounded-full text-xl font-bold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all shadow-xl flex items-center gap-3 mx-auto"
                >
                  <Trophy className="w-6 h-6" />
                  Create Tournament
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-purple-100">
              <p className="text-sm">
                Perfect for clubs, leagues, and friendly competitions
              </p>
            </div>
          </div>
        ) : (
          <TournamentManager
            players={players}
            onClose={() => setShowTournament(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
