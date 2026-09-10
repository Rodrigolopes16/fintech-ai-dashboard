'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { mes: 'Jan', receitas: 12000, despesas: 4200 },
  { mes: 'Fev', receitas: 15000, despesas: 5100 },
  { mes: 'Mar', receitas: 14200, despesas: 4800 },
  { mes: 'Abr', receitas: 18000, despesas: 6200 },
  { mes: 'Mai', receitas: 16500, despesas: 5500 },
  { mes: 'Jun', receitas: 18450, despesas: 6120 },
];

export default function FinancialChart() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-white mb-6">Fluxo de Caixa (Receitas vs Despesas)</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} name="Receitas (R$)" />
            <Bar dataKey="despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Despesas (R$)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}