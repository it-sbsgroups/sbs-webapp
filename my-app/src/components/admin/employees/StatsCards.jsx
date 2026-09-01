import React from 'react';

const statCards = [
  { label: 'Total Employees', key: 'total', icon: '👥', color: 'from-blue-500 to-blue-600' },
  { label: 'Active', key: 'active', icon: '✅', color: 'from-green-500 to-emerald-600' },
  { label: 'Inactive', key: 'inactive', icon: '❌', color: 'from-red-500 to-rose-600' },
];

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((card) => (
        <div
          key={card.key}
          className="relative overflow-hidden bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:transform hover:scale-105 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-bl-full"
            style={{ background: `linear-gradient(to bottom right, ${card.color.split(' ')[1]}, ${card.color.split(' ')[3]})` }}
          />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{card.label}</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {stats[card.key] || 0}
              </h3>
            </div>
            <div className="text-4xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}