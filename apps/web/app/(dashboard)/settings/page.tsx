'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building2, User, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuracoes</h1>
        <p className="text-muted-foreground">Gerencie as configuracoes da clinica</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Dados da Clinica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Clinica</Label>
              <Input placeholder="Nome da clinica" />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input placeholder="00.000.000/0001-00" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input placeholder="(11) 0000-0000" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input placeholder="contato@clinica.com" />
            </div>
            <Button>Salvar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Meu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label>Especialidade</Label>
              <Input placeholder="Ex: Dermatologista" />
            </div>
            <div className="space-y-2">
              <Label>CRM / CRF</Label>
              <Input placeholder="Numero do conselho" />
            </div>
            <Button>Salvar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Notificacoes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Mensagens pos-sessao automaticas</p>
                <p className="text-xs text-muted-foreground">
                  Gerar e enviar mensagem IA apos cada sessao
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Lembretes de retorno</p>
                <p className="text-xs text-muted-foreground">
                  Enviar lembrete na data de follow-up
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Integracoes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">WhatsApp (Evolution API)</p>
                <p className="text-xs text-muted-foreground">Envio de mensagens pos-sessao</p>
              </div>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                Configurar
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">E-mail (Resend)</p>
                <p className="text-xs text-muted-foreground">Envio de relatorios por email</p>
              </div>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                Configurar
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Claude AI (Anthropic)</p>
                <p className="text-xs text-muted-foreground">Geracao de mensagens com IA</p>
              </div>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                Configurar
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
