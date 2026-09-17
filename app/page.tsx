'use client';

import { useState, useMemo, useEffect } from 'react';
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
  X,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock
} from 'lucide-react';
import FinancialChart from '@/components/FinancialChart';

interface Transacao {
  id: number;
  descricao: string;
  categoria: string;
  valor: number;
  data: string; // Formato YYYY-MM-DD
  tipo: 'entrada' | 'saida';
}

const CATEGORIAS_DISPONIVEIS = [
  'Receita SaaS',
  'Consultoria Dev',
  'Infraestrutura',
  'Ferramentas & Licenças',
  'Marketing & Vendas',
  'Operacional',
  'Outros'
];

const TRANSACOES_INICIAIS: Transacao[] = [
  { id: 1, descricao: 'Pagamento Cliente SaaS', categoria: 'Receita SaaS', valor: 4500, data: '2026-09-17', tipo: 'entrada' },
  { id: 2, descricao: 'Servidores AWS', categoria: 'Infraestrutura', valor: 1280, data: '2026-09-16', tipo: 'saida' },
  { id: 3, descricao: 'Licenças de Software', categoria: 'Ferramentas & Licenças', valor: 450, data: '2026-09-08', tipo: 'saida' },
  { id: 4, descricao: 'Consultoria Dev', categoria: 'Consultoria Dev', valor: 3200, data: '2026-09-07', tipo: 'entrada' },
];

export default function Home() {
  const [transacoes, setTransacoes] = useState<Transacao[]>(TRANSACOES_INICIAIS);
  const [carregado, setCarregado] = useState(false);

  // Modais
  const [modalTransacaoAberto, setModalTransacaoAberto] = useState(false);
  const [modalIaAberto, setModalIaAberto] = useState(false);
  const [carregandoIa, setCarregandoIa] = useState(false);
  const [respostaIa, setRespostaIa] = useState('');

  // Formulário de Nova Transação
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS_DISPONIVEIS[0]);
  const [valor, setValor] = useState('');
  const [dataTransacao, setDataTransacao] = useState(new Date().toISOString().split('T')[0]);
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');

  // Filtros, Busca e Ordenação
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState<'todos' | '7d' | '30d' | 'mes_atual'>('todos');
  const [ordenacao, setOrdenacao] = useState<'data-desc' | 'data-asc' | 'valor-desc' | 'valor-asc'>('data-desc');

  // Recupera as transações do navegador ao carregar a página
  useEffect(() => {
    try {
      const salvas = localStorage.getItem('@fintech:transacoes');
      if (salvas) {
        setTransacoes(JSON.parse(salvas));
      }
    } catch (err) {
      console.error('Falha ao ler dados do localStorage:', err);
    } finally {
      setCarregado(true);
    }
  }, []);

  // Salva no localStorage sempre que houver alteração
  useEffect(() => {
    if (carregado) {
      localStorage.setItem('@fintech:transacoes', JSON.stringify(transacoes));
    }
  }, [transacoes, carregado]);

  // Cálculos dinâmicos
  const totalReceitas = transacoes
    .filter((t) => t.tipo === 'entrada')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoes
    .filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoTotal = 45280 + totalReceitas - totalDespesas;

  // Filtragem e ordenação dinâmica com período
  const transacoesFiltradas = useMemo(() => {
    const hoje = new Date();

    return transacoes
      .filter((item) => {
        const atendeBusca = item.descricao.toLowerCase().includes(busca.toLowerCase());
        const atendeCategoria = filtroCategoria === 'Todas' || item.categoria === filtroCategoria;
        const atendeTipo = filtroTipo === 'todos' || item.tipo === filtroTipo;

        // Lógica de período
        let atendePeriodo = true;
        if (filtroPeriodo !== 'todos') {
          const dataItem = new Date(item.data + 'T00:00:00');
          const diferencaDias = (hoje.getTime() - dataItem.getTime()) / (1000 * 3600 * 24);

          if (filtroPeriodo === '7d') {
            atendePeriodo = diferencaDias >= 0 && diferencaDias <= 7;
          } else if (filtroPeriodo === '30d') {
            atendePeriodo = diferencaDias >= 0 && diferencaDias <= 30;
          } else if (filtroPeriodo === 'mes_atual') {
            atendePeriodo = 
              dataItem.getMonth() === hoje.getMonth() && 
              dataItem.getFullYear() === hoje.getFullYear();
          }
        }

        return atendeBusca && atendeCategoria && atendeTipo && atendePeriodo;
      })
      .sort((a, b) => {
        if (ordenacao === 'data-desc') return new Date(b.data).getTime() - new Date(a.data).getTime();
        if (ordenacao === 'data-asc') return new Date(a.data).getTime() - new Date(b.data).getTime();
        if (ordenacao === 'valor-desc') return b.valor - a.valor;
        if (ordenacao === 'valor-asc') return a.valor - b.valor;
        return 0;
      });
  }, [transacoes, busca, filtroCategoria, filtroTipo, filtroPeriodo, ordenacao]);

  const handleAdicionarTransacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || !categoria || !dataTransacao) return;

    const nova: Transacao = {
      id: Date.now(),
      descricao,
      categoria,
      valor: parseFloat(valor),
      data: dataTransacao,
      tipo
    };

    setTransacoes([nova, ...transacoes]);
    setDescricao('');
    setCategoria(CATEGORIAS_DISPONIVEIS[0]);
    setValor('');
    setDataTransacao(new Date().toISOString().split('T')[0]);
    setModalTransacaoAberto(false);
  };

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
    } catch {
      setRespostaIa('Erro de conexão ao comunicar com a inteligência artificial.');
    } finally {
      setCarregandoIa(false);
    }
  };

  const formatarData = (dataStr: string) => {
    const partes = dataStr.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataStr;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 relative">
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

        {/* Cards de Métricas */}
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

        {/* Gráfico Dinâmico */}
        <FinancialChart transacoes={transacoes} />

        {/* Seção Inferior: Insight + Tabela com Controles */}
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

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white">Últimas Transações</h3>
              <span className="text-xs text-slate-400">Exibindo {transacoesFiltradas.length} de {transacoes.length}</span>
            </div>

            {/* Barra de Filtros, Período, Busca e Ordenação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              {/* 1. Busca */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar descrição..." 
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 2. Filtro de Período */}
              <div className="relative">
                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <select 
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value as 'todos' | '7d' | '30d' | 'mes_atual')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer">
                  <option value="todos">Todo Período</option>
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="mes_atual">Este Mês</option>
                </select>
              </div>

              {/* 3. Filtro por Categoria */}
              <div className="relative">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <select 
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer">
                  <option value="Todas">Categorias</option>
                  {CATEGORIAS_DISPONIVEIS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* 4. Filtro por Tipo */}
              <div>
                <select 
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as 'todos' | 'entrada' | 'saida')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="todos">Tipos</option>
                  <option value="entrada">Entradas (+)</option>
                  <option value="saida">Saídas (-)</option>
                </select>
              </div>

              {/* 5. Ordenação */}
              <div className="relative">
                <ArrowUpDown className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <select 
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value as 'data-desc' | 'data-asc' | 'valor-desc' | 'valor-asc')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer">
                  <option value="data-desc">Mais Recentes</option>
                  <option value="data-asc">Mais Antigas</option>
                  <option value="valor-desc">Maior Valor</option>
                  <option value="valor-asc">Menor Valor</option>
                </select>
              </div>
            </div>

            {/* Tabela de Transações */}
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
                  {transacoesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                        Nenhuma transação encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    transacoesFiltradas.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 flex items-center gap-3 text-white font-medium">
                          {item.tipo === 'entrada' ? (
                            <ArrowUpCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                          ) : (
                            <ArrowDownCircle className="h-5 w-5 text-rose-400 shrink-0" />
                          )}
                          {item.descricao}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {item.categoria}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400">{formatarData(item.data)}</td>
                        <td className={`py-3 text-right font-semibold ${item.tipo === 'entrada' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.tipo === 'entrada' ? '+' : '-'}R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL 1: Adicionar Transação */}
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
                  placeholder="Ex: Venda de Licença SaaS" 
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Categoria</label>
                  <select 
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
                    {CATEGORIAS_DISPONIVEIS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Data da Transação
                </label>
                <input 
                  type="date" 
                  value={dataTransacao}
                  onChange={(e) => setDataTransacao(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
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

      {/* MODAL 2: Análise com IA */}
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
                <p className="text-slate-400 text-sm animate-pulse">Consultando modelo Gemini e analisando finanças...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-line">
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