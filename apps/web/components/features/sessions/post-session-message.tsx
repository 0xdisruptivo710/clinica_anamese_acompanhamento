'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Send, MessageCircle, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PostSessionAIOutput {
  whatsappMessage: string;
  emailSubject: string;
  emailBody: string;
  postCareTips: string[];
  expectedResultsTimeline: string;
  motivationalNote: string;
}

async function generateMessage(sessionId: string, professionalName: string) {
  const res = await fetch('/api/v1/ai/post-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, professionalName }),
  });
  if (!res.ok) throw new Error('Failed to generate message');
  return res.json() as Promise<PostSessionAIOutput>;
}

interface PostSessionMessageProps {
  sessionId: string;
  professionalName: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  preferredChannel: 'whatsapp' | 'email' | 'sms';
}

export function PostSessionMessage({
  sessionId,
  professionalName,
  clientName,
  clientPhone,
  clientEmail,
  preferredChannel,
}: PostSessionMessageProps) {
  const [editedWhatsapp, setEditedWhatsapp] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [sent, setSent] = useState(false);

  const generateMutation = useMutation({
    mutationFn: () => generateMessage(sessionId, professionalName),
    onSuccess: (data) => {
      setEditedWhatsapp(data.whatsappMessage);
      setEditedEmail(data.emailBody);
    },
  });

  const data = generateMutation.data;

  if (sent) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-3 p-6">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Mensagem enviada com sucesso!</p>
            <p className="text-sm text-green-700">
              {clientName} recebera a mensagem via {preferredChannel === 'email' ? 'e-mail' : 'WhatsApp'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!data && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">AestheticAI Assistant</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Gere uma mensagem personalizada pos-sessao para {clientName}
              </p>
            </div>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              size="lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Mensagem
                </>
              )}
            </Button>
            {generateMutation.isError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Erro ao gerar mensagem. Tente novamente.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <Tabs defaultValue={preferredChannel === 'email' ? 'email' : 'whatsapp'}>
            <TabsList>
              <TabsTrigger value="whatsapp" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />
                E-mail
              </TabsTrigger>
            </TabsList>

            <TabsContent value="whatsapp" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Mensagem WhatsApp</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {clientPhone || 'Sem telefone'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editedWhatsapp}
                    onChange={(e) => setEditedWhatsapp(e.target.value)}
                    rows={8}
                    className="resize-none font-mono text-sm"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {editedWhatsapp.split(/\s+/).length} palavras
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">E-mail</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {clientEmail || 'Sem e-mail'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 rounded border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Assunto:</p>
                    <p className="text-sm font-medium">{data.emailSubject}</p>
                  </div>
                  <Textarea
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    rows={8}
                    className="resize-none text-sm"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cuidados Pos-Procedimento</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.postCareTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {tip}
                  </li>
                ))}
              </ul>
              <Separator className="my-3" />
              <p className="text-sm">
                <span className="font-medium">Resultados esperados:</span>{' '}
                {data.expectedResultsTimeline}
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
            <p className="text-sm italic text-muted-foreground">{data.motivationalNote}</p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => generateMutation.mutate()}>
              <Sparkles className="mr-2 h-4 w-4" />
              Regenerar
            </Button>
            <Button onClick={() => setSent(true)}>
              <Send className="mr-2 h-4 w-4" />
              Enviar via {preferredChannel === 'email' ? 'E-mail' : 'WhatsApp'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
