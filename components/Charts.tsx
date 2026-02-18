import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MacroNutrients } from '../types';

interface WeightChartProps {
  data: { date: string; weight: number }[];
  isDarkMode?: boolean;
}

export const WeightChart: React.FC<WeightChartProps> = ({ data, isDarkMode }) => {
  return (
    <div className="h-64 w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Weight Progress</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#9CA3AF'}} 
          />
          <YAxis 
            domain={['auto', 'auto']} 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#9CA3AF'}} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              border: isDarkMode ? '1px solid #374151' : 'none', 
              backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
              color: isDarkMode ? '#F3F4F6' : '#111827',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
            }}
          />
          <Area type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface MacroChartProps {
  macros: MacroNutrients;
  isDarkMode?: boolean;
}

export const MacroChart: React.FC<MacroChartProps> = ({ macros, isDarkMode }) => {
  const data = [
    { name: 'Protein', value: macros.protein, color: '#3B82F6' },
    { name: 'Carbs', value: macros.carbs, color: '#10B981' },
    { name: 'Fats', value: macros.fats, color: '#F59E0B' },
  ];

  return (
    <div className="h-64 w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center transition-colors">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 w-full text-left mb-2">Macro Distribution</h3>
      <div className="relative w-full h-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke={isDarkMode ? '#1F2937' : '#FFFFFF'}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{macros.calories}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">kcal</span>
        </div>
      </div>
      <div className="flex gap-4 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};