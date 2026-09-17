'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Transacao {
  id: number;
  descricao: string;
  categoria: string;
  valor: number;
  data: string; // Formato YYYY-MM-DD
  tipo: 'entrada' | 'saida';
}

interface FinancialChartProps {
  transacoes?: Transacao[];
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function FinancialChart({ transacoes = [] }: FinancialChartProps) {
  // Agrupa receitas e despesas por mês com base nas transações reais
  const dadosGrafico = useMemo(() => {
    // Inicializa os 12 meses zerados
    const mapaMeses = MESES.map((mes) => ({
      mes,
      receitas: 0,
      despesas: 0,
    }));

    transacoes.forEach((item) => {
      if (!item.data) return;
      const partes = item.data.split('-');
      if (partes.length < 2) return;

      const indiceMes = parseInt(partes[1], 10) - 1;
      if (indiceMes >= 0 && indiceMes < 12) {
        if (item.tipo === 'entrada') {
          mapaMeses[indiceMes].receitas += item.valor;
        } else {
          mapaMeses[indiceMes].despesas += item.valor;
        }
      }
    });

    // Filtra para exibir apenas os últimos 6 meses ou meses com movimentação
    const mesesComMovimento = mapaMeses.filter((m) => m.receitas > 0 || m.despesas > 0);
    return mesesComMovimento.length >= 3 ? mesesComMovimento : mapaMeses.slice(4, 10);
  }, [transacoes]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Fluxo de Caixa (Receitas vs Despesas)</h3>
          <p className="text-xs text-slate-400 mt-0.5">Valores calculados em tempo real a partir das transações</p>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              tickFormatter={(valor) => `R$${valor >= 1000 ? (valor / 1000).toFixed(0) + 'k' : valor}`} 
            />
            <Tooltip 
              formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} name="Receitas" />
            <Bar dataKey="despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}