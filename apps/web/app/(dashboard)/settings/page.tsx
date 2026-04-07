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
  Zap,
  FileText,
  Phone,
} from 'lucide-react';
import {
  useSettings, useUpdateSettings, useFlwTemplates, useFlwChannels, useTestConnection,
  DEFAULT_CLINIC_SETTINGS,
} from '@/lib/hooks/use-settings';
import type { ClinicSettings } from '@/lib/hooks/use-settings';

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const testMutation = useTestConnection();

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
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const apiToken = settings.flwApiToken || settings.aiosApiKey;
  const isConnected = Boolean(apiToken);

  const { data: templatesData } = useFlwTemplates(isConnected);
  const { data: channelsData } = useFlwChannels(isConnected);

  const templates = templatesData?.templates ?? [];
  const channels = channelsData?.channels ?? [];

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
    await updateMutation.mutateAsync({ clinic: { settings: newSettings } });
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
              <Input value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Nome da clinica" />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input value={clinicCnpj} onChange={(e) => setClinicCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={clinicPhone} onChange={(e) => setClinicPhone(e.target.value)} placeholder="(11) 0000-0000" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={clinicEmail} onChange={(e) => setClinicEmail(e.target.value)} placeholder="contato@clinica.com" />
            </div>
            <Button onClick={saveClinic} disabled={updateMutation.isPending}>
              {savedSection === 'clinic' ? <><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />Salvo</> : <><Save className="mr-2 h-4 w-4" />Salvar</>}
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
              <Input value={profName} onChange={(e) => setProfName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label>Especialidade</Label>
              <Input value={profSpecialty} onChange={(e) => setProfSpecialty(e.target.value)} placeholder="Ex: Dermatologista" />
            </div>
            <div className="space-y-2">
              <Label>CRM / CRF</Label>
              <Input value={profCrm} onChange={(e) => setProfCrm(e.target.value)} placeholder="Numero do conselho" />
            </div>
            <Button onClick={saveProfessional} disabled={updateMutation.isPending}>
              {savedSection === 'professional' ? <><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />Salvo</> : <><Save className="mr-2 h-4 w-4" />Salvar</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ============ FLW CHAT INTEGRATION ============ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plug className="h-5 w-5" />
                Integracao FLW Chat / WTS Chat
              </CardTitle>
              <CardDescription className="mt-1">
                Conecte ao FLW Chat para enviar mensagens, lembretes e sincronizar contatos via WhatsApp
              </CardDescription>
            </div>
            {isConnected ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="mr-1 h-3 w-3" />Conectado
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                <AlertCircle className="mr-1 h-3 w-3" />Pendente
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="flex items-start gap-2 text-sm text-blue-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Gere um token permanente em Ajustes &gt; Integracoes &gt; Integracao via API no painel FLW Chat.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Token da API (Bearer Token)</Label>
              <Input
                type="password"
                placeholder="pn_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={settings.flwApiToken || settings.aiosApiKey}
                onChange={(e) => setSettings({ ...settings, flwApiToken: e.target.value, aiosApiKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Canal de envio (numero)</Label>
              <Input
                placeholder="5511999999999"
                value={settings.flwFromPhone || settings.aiosFromPhone}
                onChange={(e) => setSettings({ ...settings, flwFromPhone: e.target.value, aiosFromPhone: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                Se vazio, usa o canal padrao da conta
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Switch
                checked={settings.crmSyncEnabled}
                onCheckedChange={(v) => setSettings({ ...settings, crmSyncEnabled: v })}
                disabled={!isConnected}
              />
              <div>
                <p className="text-sm font-medium">Sync automatico com CRM</p>
                <p className="text-[11px] text-muted-foreground">
                  Sincroniza dados e tags ao atualizar anamnese ou finalizar sessao
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => saveNotifications(settings)}
              disabled={updateMutation.isPending}
            >
              {savedSection === 'notifications' ? <><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />Salvo</> : <><Save className="mr-2 h-4 w-4" />Salvar Integracao</>}
            </Button>
            <Button
              variant="outline"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending || !isConnected}
            >
              {testMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Testar Conexao
            </Button>
          </div>

          {/* Test result */}
          {testMutation.isSuccess && (
            <div className={`rounded-lg border p-3 ${testMutation.data.connected ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
              {testMutation.data.connected ? (
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    Conexao bem-sucedida — {testMutation.data.channelCount} canal(is) encontrado(s)
                  </p>
                  {testMutation.data.channels && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(testMutation.data.channels as Array<{ displayName: string; platform: string; key: string }>).map((ch) => (
                        <Badge key={ch.key} variant="secondary" className="text-xs gap-1">
                          <Phone className="h-3 w-3" />
                          {ch.displayName} ({ch.platform})
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="flex items-center gap-2 text-sm text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  Falha na conexao: {testMutation.data.error}
                </p>
              )}
            </div>
          )}

          {/* Connected channels */}
          {channels.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Canais disponiveis</Label>
              <div className="flex flex-wrap gap-2">
                {channels.map((ch) => (
                  <Badge key={ch.id} variant="outline" className="text-xs gap-1">
                    <Phone className="h-3 w-3" />
                    {ch.displayName} — {ch.key}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============ TEMPLATES ============ */}
      {isConnected && templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Templates de Mensagem
            </CardTitle>
            <CardDescription>
              Selecione os modelos de mensagem aprovados no FLW Chat para cada tipo de lembrete.
              Se nenhum template for selecionado, o sistema enviara mensagem em texto livre.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs">Lembrete de Agendamento</Label>
                <Select
                  value={settings.appointmentTemplateId || '_none'}
                  onValueChange={(v) => updateSetting('appointmentTemplateId', v === '_none' ? '' : v)}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Texto livre" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Texto livre (sem template)</SelectItem>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Lembrete de Retorno</Label>
                <Select
                  value={settings.followUpTemplateId || '_none'}
                  onValueChange={(v) => updateSetting('followUpTemplateId', v === '_none' ? '' : v)}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Texto livre" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Texto livre (sem template)</SelectItem>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Mensagem Pos-sessao</Label>
                <Select
                  value={settings.postSessionTemplateId || '_none'}
                  onValueChange={(v) => updateSetting('postSessionTemplateId', v === '_none' ? '' : v)}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Texto livre" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Texto livre (sem template)</SelectItem>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Templates devem estar aprovados no WhatsApp Business. Conversas so podem ser iniciadas com templates.
              {templates.length} template(s) aprovado(s) encontrado(s).
            </p>
          </CardContent>
        </Card>
      )}

      {/* ============ NOTIFICATION AUTOMATIONS ============ */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Automacoes de Mensagem</h2>
          <p className="text-sm text-muted-foreground">
            Configure quando e como as mensagens automaticas sao enviadas via WhatsApp
          </p>
        </div>

        {!isConnected && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-amber-800">
              <AlertCircle className="h-4 w-4" />
              Configure a integracao com o FLW Chat acima para ativar as automacoes
            </p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {/* POST-SESSION */}
          <Card className={settings.postSessionMessageEnabled ? 'ring-1 ring-primary/30' : ''}>
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
                  disabled={!isConnected}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Envia mensagem personalizada apos o encerramento de cada sessao.
              </p>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">Enviar apos (minutos)</Label>
                <Select
                  value={String(settings.postSessionMessageDelay)}
                  onValueChange={(v) => updateSetting('postSessionMessageDelay', Number(v))}
                  disabled={!settings.postSessionMessageEnabled}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
                  <p className="text-[10px] text-muted-foreground">Claude AI gera mensagem unica</p>
                </div>
              </div>
              {settings.postSessionMessageEnabled && (
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {settings.postSessionMessageDelay === 0 ? 'Envio imediato ao finalizar' : `Envio ${settings.postSessionMessageDelay} min apos finalizar`}
                    {settings.postSessionTemplateId ? ' (via template)' : ' (texto livre)'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* APPOINTMENT REMINDER */}
          <Card className={settings.appointmentReminderEnabled ? 'ring-1 ring-primary/30' : ''}>
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
                  disabled={!isConnected}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Lembrete automatico antes do horario agendado.
              </p>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">Enviar com antecedencia de</Label>
                <Select
                  value={String(settings.appointmentReminderHours)}
                  onValueChange={(v) => updateSetting('appointmentReminderHours', Number(v))}
                  disabled={!settings.appointmentReminderEnabled}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
                      ? `${settings.appointmentReminderHours / 24} dia(s) antes`
                      : `${settings.appointmentReminderHours}h antes`}
                    {settings.appointmentTemplateId ? ' (via template)' : ' (texto livre)'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* FOLLOW-UP REMINDER */}
          <Card className={settings.followUpReminderEnabled ? 'ring-1 ring-primary/30' : ''}>
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
                  disabled={!isConnected}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Lembrete para agendar proximo atendimento na data de retorno.
              </p>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">Enviar com antecedencia de</Label>
                <Select
                  value={String(settings.followUpReminderDaysBefore)}
                  onValueChange={(v) => updateSetting('followUpReminderDaysBefore', Number(v))}
                  disabled={!settings.followUpReminderEnabled}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
                    {settings.followUpReminderDaysBefore === 0 ? 'No dia do retorno' : `${settings.followUpReminderDaysBefore} dia(s) antes`}
                    {settings.followUpTemplateId ? ' (via template)' : ' (texto livre)'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============ AI ============ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5" />
                Claude AI (Anthropic)
              </CardTitle>
              <CardDescription className="mt-1">IA para geracao de mensagens personalizadas pos-sessao</CardDescription>
            </div>
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Configurar no servidor</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              A chave da API do Claude (ANTHROPIC_API_KEY) deve ser configurada como variavel de ambiente no servidor.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
