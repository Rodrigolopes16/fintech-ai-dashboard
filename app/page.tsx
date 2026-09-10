'use client';

import { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Wallet, 
  BrainCircuit, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Sparkles,
  PlusCircle,
  X
} from 'lucide-react';
import FinancialChart from '@/components/FinancialChart';

interface Transacao {
  id: number;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  tipo: 'entrada' | 'saida';
}

export default function Home() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([
    { id: 1, descricao: 'Pagamento Cliente SaaS', categoria: 'Receita', valor: 4500, data: 'Hoje, 14:32', tipo: 'entrada' },
    { id: 2, descricao: 'Servidores AWS', categoria: 'Infraestrutura', valor: 1280, data: 'Ontem, 09:15', tipo: 'saida' },
    { id: 3, descricao: 'Licenças de Software', categoria: 'Ferramentas', valor: 450, data: '08/09/2026', tipo: 'saida' },
    { id: 4, descricao: 'Consultoria Dev', categoria: 'Serviços', valor: 3200, data: '07/09/2026', tipo: 'entrada' },
  ]);

  // Modais
  const [modalTransacaoAberto, setModalTransacaoAberto] = useState(false);
  const [modalIaAberto, setModalIaAberto] = useState(false);
  const [carregandoIa, setCarregandoIa] = useState(false);
  const [respostaIa, setRespostaIa] = useState('');

  // Formulário de Nova Transação
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');

  // Cálculos dinâmicos das métricas
  const totalReceitas = transacoes
    .filter((t) => t.tipo === 'entrada')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoes
    .filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoTotal = 45280 + totalReceitas - totalDespesas;

  // Função para adicionar nova transação
  const handleAdicionarTransacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || !categoria) return;

    const nova: Transacao = {
      id: Date.now(),
      descricao,
      categoria,
      valor: parseFloat(valor),
      data: 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tipo
    };

    setTransacoes([nova, ...transacoes]);
    setDescricao('');
    setCategoria('');
    setValor('');
    setModalTransacaoAberto(false);
  };

  // Chamada Real para a API de IA do Gemini (backend)
  const handleGerarAnaliseIA = async () => {
    setModalIaAberto(true);
    setCarregandoIa(true);
    setRespostaIa('');

    try {
      const response = await fetch('/api/analise-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saldoTotal, totalReceitas, totalDespesas }),
      });

      const data = await response.json();

      if (data.analise) {
        setRespostaIa(data.analise);
      } else {
        setRespostaIa('Não foi possível gerar a análise no momento. Verifique sua chave de API.');
      }
    } catch (err) {
      setRespostaIa('Erro de conexão ao gerar análise inteligente.');
    } finally {
      setCarregandoIa(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Wallet className="h-8 w-8 text-emerald-400" />
              Fintech AI Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Visão geral das finanças e inteligência preditiva.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setModalTransacaoAberto(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-lg border border-slate-700 transition-colors">
              <PlusCircle className="h-5 w-5 text-emerald-400" />
              Nova Transação
            </button>

            <button 
              onClick={handleGerarAnaliseIA}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2 rounded-lg transition-colors">
              <BrainCircuit className="h-5 w-5" />
              Gerar Análise com IA
            </button>
          </div>
        </div>

        {/* Cards de Métricas Dinâmicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-4">
              <span className="text-sm font-medium">Saldo Total Calculado</span>
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm mt-2 font-medium">
              <ArrowUpRight className="h-4 w-4" />
              <span>Atualizado dinamicamente</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-4">
              <span className="text-sm font-medium">Receitas Acumuladas</span>
              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-slate-400 text-sm mt-2">
              {transacoes.filter(t => t.tipo === 'entrada').length} entradas registradas
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-4">
              <span className="text-sm font-medium">Despesas Acumuladas</span>
              <ArrowDownRight className="h-5 w-5 text-rose-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-rose-400 text-sm mt-2 font-medium">
              <ArrowDownRight className="h-4 w-4" />
              <span>{transacoes.filter(t => t.tipo === 'saida').length} saídas registradas</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Fluxo de Caixa */}
        <FinancialChart />

        {/* Seção Inferior: IA + Tabela */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3">
                <Sparkles className="h-5 w-5" />
                <span>Insight Inteligente</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Análise de Redução de Custo</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Suas despesas com serviços em nuvem cresceram <strong className="text-rose-400">18%</strong> nas últimas 3 semanas. Recomenda-se revisar as instâncias ociosas para economizar até <strong className="text-emerald-400">R$ 850,00/mês</strong>.
              </p>
            </div>
            <button 
              onClick={handleGerarAnaliseIA}
              className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-sm font-medium rounded-lg border border-slate-700 transition-colors">
              Consultar IA Preditiva
            </button>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Últimas Transações</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="pb-3 font-medium">Descrição</th>
                    <th className="pb-3 font-medium">Categoria</th>
                    <th className="pb-3 font-medium">Data</th>
                    <th className="pb-3 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {transacoes.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 flex items-center gap-3 text-white font-medium">
                        {item.tipo === 'entrada' ? (
                          <ArrowUpCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-rose-400 shrink-0" />
                        )}
                        {item.descricao}
                      </td>
                      <td className="py-3 text-slate-400">{item.categoria}</td>
                      <td className="py-3 text-slate-400">{item.data}</td>
                      <td className={`py-3 text-right font-semibold ${item.tipo === 'entrada' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.tipo === 'entrada' ? '+' : '-'}R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL 1: Nova Transação */}
      {modalTransacaoAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Adicionar Transação</h3>
              <button onClick={() => setModalTransacaoAberto(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdicionarTransacao} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Descrição</label>
                <input 
                  type="text" 
                  placeholder="Ex: Venda de Licença" 
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Categoria</label>
                  <input 
                    type="text" 
                    placeholder="Ex: SaaS / Infra" 
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Tipo de Operação</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipo('entrada')}
                    className={`py-2 rounded-lg text-sm font-medium border ${tipo === 'entrada' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'border-slate-800 text-slate-400'}`}
                  >
                    Entrada (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('saida')}
                    className={`py-2 rounded-lg text-sm font-medium border ${tipo === 'saida' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'border-slate-800 text-slate-400'}`}
                  >
                    Saída (-)
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition-colors mt-2">
                Salvar Transação
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Análise da IA */}
      {modalIaAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <BrainCircuit className="h-5 w-5" />
                <span>Análise Preditiva de IA</span>
              </div>
              <button onClick={() => setModalIaAberto(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {carregandoIa ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm animate-pulse">Conectando ao modelo Gemini 2.5 e analisando finanças...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-200 text-sm leading-relaxed">
                  {respostaIa}
                </div>
                <button 
                  onClick={() => setModalIaAberto(false)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition-colors">
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  );
}