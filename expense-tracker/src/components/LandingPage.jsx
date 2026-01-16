import { useState } from 'react';

const LandingPage = ({ onStartTracking }) => {
  const [stats] = useState([
    { label: 'Total Expenses', value: '$4,250', change: '+12%' },
    { label: 'Monthly Budget', value: '$5,000', change: '-3%' },
    { label: 'Savings', value: '$750', change: '+8%' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center text-white">
        {/* Hero Content */}
        <div className="mb-16 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
            Smart Expense Tracker
          </h1>
          <p className="text-xl md:text-2xl md:w-2/3 mx-auto mb-12 opacity-90 leading-relaxed">
            Track your spending effortlessly. Gain insights into your finances with beautiful charts and real-time updates.
          </p>
          <button
            onClick={onStartTracking}
            className="bg-white text-gray-900 px-12 py-6 rounded-3xl text-xl font-bold hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-xl"
          >
            Start Tracking Now
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="group bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${idx * 200}ms` }}
            >
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:text-yellow-300 transition-colors">{stat.value}</h3>
              <p className="text-blue-100 font-semibold opacity-80">{stat.label}</p>
              <span className={`text-sm font-bold ${stat.change.startsWith('+') ? 'text-green-300' : 'text-red-300'}`}>
                {stat.change}
              </span>
            </div>
          ))}
        </div>

        {/* Features Preview */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { icon: '📱', title: 'Mobile Ready' },
            { icon: '⚡', title: 'Real-time Sync' },
            { icon: '📊', title: 'Smart Analytics' },
            { icon: '🔒', title: 'Secure Data' },
          ].map((feat, idx) => (
            <div key={feat.title} className="flex flex-col items-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all animate-fade-in-up" style={{ animationDelay: `${1200 + idx * 100}ms` }}>
              <span className="text-4xl mb-4">{feat.icon}</span>
              <h4 className="font-bold text-lg">{feat.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
