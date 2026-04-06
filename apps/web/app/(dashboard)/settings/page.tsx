'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building2,
  User,
  Bell,
  MessageCircle,
  CalendarClock,
  Sparkles,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
  Clock,
  Plug,
  Info,
} from 'lucide-react';
import { useSettings, useUpdateSettings, DEFAULT_CLINIC_SETTINGS } from '@/lib/hooks/use-settings';
import type { ClinicSettings } from '@/lib/hooks/use-settings';

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  // Clinic form
  const [clinicName, setClinicName] = useState('');
  const [clinicCnpj, setClinicCnpj] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');

  // Professional form
  const [profName, setProfName] = useState('');
  const [profSpecialty, setProfSpecialty] = useState('');
  const [profCrm, setProfCrm] = useState('');

  // Notification settings
  const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);

  // Save feedback
  const [savedSection, setSavedSection] = useState<string | null>(null);

  useEffect(() => {
    if (data?.clinic) {
      setClinicName(data.clinic.name || '');
      setClinicCnpj(data.clinic.cnpj || '');
      setClinicPhone(data.clinic.phone || '');
      setClinicEmail(data.clinic.email || '');
      if (data.clinic.settings) {
        setSettings({ ...DEFAULT_CLINIC_SETTINGS, ...data.clinic.settings });
      }
    }
    if (data?.professional) {
      setProfName(data.professional.full_name || '');
      setProfSpecialty(data.professional.specialty || '');
      setProfCrm(data.professional.crf_crm || '');
    }
  }, [data]);

  const showSaved = useCallback((section: string) => {
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2000);
  }, []);

  const saveClinic = async () => {
    await updateMutation.mutateAsync({
      clinic: { name: clinicName, cnpj: clinicCnpj, phone: clinicPhone, email: clinicEmail },
    });
    showSaved('clinic');
  };

  const saveProfessional = async () => {
    await updateMutation.mutateAsync({
      professional: { full_name: profName, specialty: profSpecialty, crf_crm: profCrm },
    });
    showSaved('professional');
  };

  const saveNotifications = async (newSettings: ClinicSettings) => {
    setSettings(newSettings);
    await updateMutation.mutateAsync({
      clinic: { settings: newSettings },
    });
    showSaved('notifications');
  };

  const updateSetting = <K extends keyof ClinicSettings>(key: K, value: ClinicSettings[K]) => {
    const updated = { ...settings, [key]: value };
    saveNotifications(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const aiosConnected = Boolean(settings.aiosApiKey);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuracoes</h1>
        <p className="text-muted-foreground">Gerencie as configuracoes da clinica e automacoes</p>
      </div>

      {/* ============ CLINIC & PROFILE ============ */}
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
              <Input
                placeholder="Nome da clinica"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                placeholder="00.000.000/0001-00"
                value={clinicCnpj}
                onChange={(e) => setClinicCnpj(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                placeholder="(11) 0000-0000"
                value={clinicPhone}
                onChange={(e) => setClinicPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                placeholder="contato@clinica.com"
                value={clinicEmail}
                onChange={(e) => setClinicEmail(e.target.value)}
              />
            </div>
            <Button onClick={saveClinic} disabled={updateMutation.isPending}>
              {savedSection === 'clinic' ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  Salvo
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
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
              <Input
                placeholder="Seu nome"
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Especialidade</Label>
              <Input
                placeholder="Ex: Dermatologista"
                value={profSpecialty}
                onChange={(e) => setProfSpecialty(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>CRM / CRF</Label>
              <Input
                placeholder="Numero do conselho"
                value={profCrm}
                onChange={(e) => setProfCrm(e.target.value)}
              />
            </div>
            <Button onClick={saveProfessional} disabled={updateMutation.isPending}>
              {savedSection === 'professional' ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  Salvo
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ============ AIOS / WTS CHAT INTEGRATION ============ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plug className="h-5 w-5" />
                Integracao Aios / WTS Chat (WhatsApp)
              </CardTitle>
              <CardDescription className="mt-1">
                Conecte ao Aios para enviar lembretes e mensagens via WhatsApp e sincronizar dados com o CRM
              </CardDescription>
            </div>
            {aiosConnected ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                <AlertCircle className="mr-1 h-3 w-3" />
                Pendente
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="flex items-start gap-2 text-sm text-blue-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              O token permanente pode ser gerado na secao de integracoes do painel WTS Chat.
              A API envia mensagens e sincroniza contatos/tags automaticamente.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Token da API (Bearer Token)</Label>
              <Input
                type="password"
                placeholder="pn_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={settings.aiosApiKey}
                onChange={(e) => setSettings({ ...settings, aiosApiKey: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                Token permanente gerado em Integracoes no painel WTS Chat
              </p>
            </div>
            <div className="space-y-2">
              <Label>Numero do canal (opcional)</Label>
              <Input
                placeholder="5511999999999"
                value={settings.aiosFromPhone}
                onChange={(e) => setSettings({ ...settings, aiosFromPhone: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                Numero de telefone do canal de envio. Se vazio, usa o canal padrao.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Switch
                checked={settings.crmSyncEnabled}
                onCheckedChange={(v) => setSettings({ ...settings, crmSyncEnabled: v })}
                disabled={!aiosConnected}
              />
              <div>
                <p className="text-sm font-medium">Sync automatico com CRM</p>
                <p className="text-[11px] text-muted-foreground">
                  Ao atualizar anamnese ou finalizar sessao, sincroniza dados e tags do cliente no Aios
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => saveNotifications(settings)}
            disabled={updateMutation.isPending}
          >
            {savedSection === 'notifications' ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Salvo
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Integracao
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ============ NOTIFICATION AUTOMATIONS ============ */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Automacoes de Mensagem</h2>
          <p className="text-sm text-muted-foreground">
            Configure quando e como as mensagens automaticas sao enviadas via Aios (WhatsApp)
          </p>
        </div>

        {!aiosConnected && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-amber-800">
              <AlertCircle className="h-4 w-4" />
              Configure a integracao com o Aios acima para ativar as automacoes
            </p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {/* POST-SESSION MESSAGE */}
          <Card className={`transition-all ${settings.postSessionMessageEnabled ? 'ring-1 ring-primary/30' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Send className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Mensagem Pos-Sessao</CardTitle>
                    <p className="text-[11px] text-muted-foreground">Apos finalizar sessao</p>
                  </div>
                </div>
                <Switch
                  checked={settings.postSessionMessageEnabled}
                  onCheckedChange={(v) => updateSetting('postSessionMessageEnabled', v)}
                  disabled={!aiosConnected}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Envia automaticamente uma mensagem personalizada para a cliente apos o encerramento de cada sessao, com resumo do procedimento e cuidados pos-tratamento.
              </p>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">Enviar apos (minutos)</Label>
                <Select
                  value={String(settings.postSessionMessageDelay)}
                  onValueChange={(v) => updateSetting('postSessionMessageDelay', Number(v))}
                  disabled={!settings.postSessionMessageEnabled}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Imediatamente</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.aiEnabled}
                  onCheckedChange={(v) => updateSetting('aiEnabled', v)}
                  disabled={!settings.postSessionMessageEnabled}
                />
                <div>
                  <p className="text-xs font-medium">Usar IA para personalizar</p>
                  <p className="text-[10px] text-muted-foreground">Claude AI gera mensagem unica para cada cliente</p>
                </div>
              </div>
              {settings.postSessionMessageEnabled && (
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {settings.postSessionMessageDelay === 0
                      ? 'A mensagem sera enviada imediatamente ao finalizar a sessao'
                      : `A mensagem sera enviada ${settings.postSessionMessageDelay} min apos finalizar`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* APPOINTMENT REMINDER */}
          <Card className={`transition-all ${settings.appointmentReminderEnabled ? 'ring-1 ring-primary/30' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                    <CalendarClock className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Lembrete de Agendamento</CardTitle>
                    <p className="text-[11px] text-muted-foreground">Antes da sessao</p>
                  </div>
                </div>
                <Switch
                  checked={settings.appointmentReminderEnabled}
                  onCheckedChange={(v) => updateSetting('appointmentReminderEnabled', v)}
                  disabled={!aiosConnected}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Envia um lembrete automatico para a cliente antes do horario agendado, reduzindo faltas e no-shows.
              </p>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">Enviar com antecedencia de</Label>
                <Select
                  value={String(settings.appointmentReminderHours)}
                  onValueChange={(v) => updateSetting('appointmentReminderHours', Number(v))}
                  disabled={!settings.appointmentReminderEnabled}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora antes</SelectItem>
                    <SelectItem value="2">2 horas antes</SelectItem>
                    <SelectItem value="4">4 horas antes</SelectItem>
                    <SelectItem value="12">12 horas antes</SelectItem>
                    <SelectItem value="24">24 horas antes (1 dia)</SelectItem>
                    <SelectItem value="48">48 horas antes (2 dias)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {settings.appointmentReminderEnabled && (
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Bell className="h-3 w-3" />
                    {settings.appointmentReminderHours >= 24
                      ? `Lembrete enviado ${settings.appointmentReminderHours / 24} dia(s) antes do agendamento`
                      : `Lembrete enviado ${settings.appointmentReminderHours}h antes do agendamento`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* FOLLOW-UP REMINDER */}
          <Card className={`transition-all ${settings.followUpReminderEnabled ? 'ring-1 ring-primary/30' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Lembrete de Retorno</CardTitle>
                    <p className="text-[11px] text-muted-foreground">Data de follow-up</p>
                  </div>
                </div>
                <Switch
                  checked={settings.followUpReminderEnabled}
                  onCheckedChange={(v) => updateSetting('followUpReminderEnabled', v)}
                  disabled={!aiosConnected}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Quando uma sessao tem data de retorno definida, envia automaticamente uma mensagem lembrando a cliente de agendar o proximo atendimento.
              </p>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">Enviar com antecedencia de</Label>
                <Select
                  value={String(settings.followUpReminderDaysBefore)}
                  onValueChange={(v) => updateSetting('followUpReminderDaysBefore', Number(v))}
                  disabled={!settings.followUpReminderEnabled}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No dia do retorno</SelectItem>
                    <SelectItem value="1">1 dia antes</SelectItem>
                    <SelectItem value="2">2 dias antes</SelectItem>
                    <SelectItem value="3">3 dias antes</SelectItem>
                    <SelectItem value="7">1 semana antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {settings.followUpReminderEnabled && (
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CalendarClock className="h-3 w-3" />
                    {settings.followUpReminderDaysBefore === 0
                      ? 'Lembrete enviado no dia do retorno agendado'
                      : `Lembrete enviado ${settings.followUpReminderDaysBefore} dia(s) antes do retorno`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============ AI INTEGRATION ============ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5" />
                Claude AI (Anthropic)
              </CardTitle>
              <CardDescription className="mt-1">
                IA para geracao de mensagens personalizadas pos-sessao
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
              Configurar no servidor
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              A chave da API do Claude (ANTHROPIC_API_KEY) deve ser configurada como variavel de ambiente no servidor.
              Quando configurada, a IA sera usada para personalizar as mensagens pos-sessao automaticamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
