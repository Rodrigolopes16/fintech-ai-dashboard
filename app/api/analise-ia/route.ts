import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { saldoTotal, totalReceitas, totalDespesas } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // 1. Se houver chave configurada, tenta consumir a API do Gemini
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Analise brevemente este cenário financeiro: Saldo R$${saldoTotal}, Receitas R$${totalReceitas}, Despesas R$${totalDespesas}. Forneça uma análise prática e recomendações diretas em até 3 frases.`
                    }
                  ]
                }
              ]
            })
          }
        );

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ analise: data.candidates[0].content.parts[0].text });
        }

        console.error('Resposta da API Gemini inválida ou erro retornado:', data);
      } catch (apiError) {
        console.warn('Falha na chamada remota da API Gemini:', apiError);
      }
    } else {
      console.warn('Variável GEMINI_API_KEY não foi encontrada no ambiente de produção.');
    }

    // 2. Fallback inteligente garantido (nunca quebra na tela do usuário)
    const taxaComprometimento = ((totalDespesas / (totalReceitas || 1)) * 100).toFixed(1);
    const analiseFallback = `Seu saldo operacional acumulado é de R$ ${Number(saldoTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, com taxa de comprometimento de receitas em ${taxaComprometimento}%. Com base na média de entradas e saídas, recomenda-se reservar 20% do excedente em caixa de alta liquidez e monitorar custos fixos.`;

    return NextResponse.json({ analise: analiseFallback });
  } catch (error) {
    console.error('Erro geral no endpoint analise-ia:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a análise.' },
      { status: 500 }
    );
  }
}