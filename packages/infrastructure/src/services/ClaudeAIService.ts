import type { IAIService, PostSessionAIInput, PostSessionAIOutput } from '@aesthetic-track/application';

export class ClaudeAIService implements IAIService {
  private readonly apiKey: string;
  private readonly model = 'claude-sonnet-4-20250514';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY ?? '';
  }

  async generatePostSessionMessage(input: PostSessionAIInput): Promise<PostSessionAIOutput> {
    const prompt = this.buildPrompt(input);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text ?? '';

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        whatsappMessage: parsed.whatsapp_message ?? '',
        emailSubject: parsed.email_subject ?? '',
        emailBody: parsed.email_body ?? '',
        postCareTips: parsed.post_care_tips ?? [],
        expectedResultsTimeline: parsed.expected_results_timeline ?? '',
        motivationalNote: parsed.motivational_note ?? '',
      };
    } catch {
      return this.getFallbackMessage(input);
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1_000_000) * 3.0;
    const outputCost = (outputTokens / 1_000_000) * 15.0;
    return inputCost + outputCost;
  }

  private buildPrompt(input: PostSessionAIInput): string {
    return `Voce e uma assistente especializada em comunicacao de clinicas de estetica de alto padrao.
Gere uma mensagem personalizada para enviar a cliente apos a sessao.

DADOS DA SESSAO:
- Cliente: ${input.clientName}${input.clientAge ? ` (${input.clientAge} anos)` : ''}
- Sessao numero: ${input.sessionNumber}
- Data: ${input.sessionDate}
- Procedimentos realizados: ${input.proceduresList.join(', ')}
- Areas tratadas: ${input.treatmentAreas.join(', ')}
- Profissional: ${input.professionalName}

HISTORICO DA CLIENTE:
- Total de sessoes anteriores: ${input.totalPreviousSessions}
- Procedimentos anteriores: ${input.previousProcedures.join(', ') || 'Nenhum'}
- Objetivo estetico declarado: ${input.aestheticGoal || 'Nao informado'}

INSTRUCOES:
1. Tom: caloroso, profissional, empatico, nunca generico
2. Inclua o nome da cliente naturalmente na mensagem
3. Mencione especificamente o que foi feito hoje
4. Forneca cuidados pos-procedimento ESPECIFICOS
5. Inclua expectativa de resultado realista para os proximos dias
6. Mencione evolucao se sessao_number > 1
7. Finalize com data sugerida de retorno: ${input.followUpDate || 'a definir'}
8. Maximo 250 palavras para WhatsApp
9. Use emojis com moderacao (2-3 no maximo)

Retorne APENAS um JSON com:
{
  "whatsapp_message": "...",
  "email_subject": "...",
  "email_body": "...",
  "post_care_tips": ["...", "..."],
  "expected_results_timeline": "...",
  "motivational_note": "..."
}`;
  }

  private getFallbackMessage(input: PostSessionAIInput): PostSessionAIOutput {
    return {
      whatsappMessage: `Ola ${input.clientName}! Sua sessao de hoje foi concluida com sucesso. Procedimentos realizados: ${input.proceduresList.join(', ')}. Cuide-se bem e siga as orientacoes do pos-procedimento. Ate a proxima!`,
      emailSubject: 'Resumo da sua sessao - AestheticTrack',
      emailBody: `<p>Ola ${input.clientName},</p><p>Sua sessao numero ${input.sessionNumber} foi realizada com sucesso.</p><p>Procedimentos: ${input.proceduresList.join(', ')}</p>`,
      postCareTips: ['Evite exposicao solar direta por 48h', 'Mantenha a area hidratada'],
      expectedResultsTimeline: 'Resultados visiveis em 7-14 dias',
      motivationalNote: 'Cada sessao e um passo a mais na sua jornada de autocuidado!',
    };
  }
}
