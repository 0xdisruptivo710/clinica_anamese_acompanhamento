'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Send,
  CalendarClock,
  MessageCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  User,
  RefreshCw,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useReminders, useSendReminders } from '@/lib/hooks/use-reminders';
import type { ReminderItem } from '@/lib/hooks/use-reminders';

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Bell; color: string; bg: string }> = {
  appointment: { label: 'Lembrete', icon: CalendarClock, color: 'text-purple-600', bg: 'bg-purple-100' },
  post_session: { label: 'Pos-procedimento', icon: Send, color: 'text-blue-600', bg: 'bg-blue-100' },
  follow_up: { label: 'Follow-up', icon: MessageCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  pending: { label: 'Pendente', color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
  overdue: { label: 'Atrasado', color: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500' },
  sent: { label: 'Enviado', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
  skipped: { label: 'Ignorado', color: 'bg-gray-50 text-gray-600 border-gray-200', dotColor: 'bg-gray-400' },
};

const FILTER_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'today', label: 'Hoje' },
  { key: 'overdue', label: 'Atrasados' },
  { key: 'upcoming', label: 'Proximos' },
] as const;

const TYPE_TABS = [
  { key: '', label: 'Todos' },
  { key: 'appointment', label: 'Lembrete' },
  { key: 'post_session', label: 'Pos-procedimento' },
  { key: 'follow_up', label: 'Follow-up (Faltou/Desmarcou)' },
] as const;

export default function RemindersPage() {
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading, refetch, isFetching } = useReminders(filter, typeFilter || undefined);
  const sendMutation = useSendReminders();

  const reminders = data?.reminders ?? [];
  const summary = data?.summary ?? { total: 0, overdue: 0, pending: 0, sent: 0 };

  const pendingReminders = reminders.filter((r) => r.status !== 'sent');
  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectAllPending = () => {
    setSelected(new Set(pendingReminders.map((r) => r.id)));
  };

  const handleSendSelected = () => {
    if (selected.size === 0) return;
    sendMutation.mutate(
      { reminderIds: Array.from(selected) },
      { onSuccess: () => setSelected(new Set()) },
    );
  };

  const handleSendBatch = (type: 'all_today' | 'all_overdue') => {
    sendMutation.mutate(
      { type },
      { onSuccess: () => setSelected(new Set()) },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lembretes</h1>
          <p className="text-muted-foreground">
            Gerencie e dispare lembretes de agendamento, retorno e pos-sessao
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className={summary.overdue > 0 ? 'border-red-200 bg-red-50/50' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.overdue}</p>
              <p className="text-xs text-muted-foreground">Atrasados</p>
            </div>
            {summary.overdue > 0 && (
              <Button
                size="sm"
                variant="destructive"
                className="ml-auto gap-1.5 text-xs"
                onClick={() => handleSendBatch('all_overdue')}
                disabled={sendMutation.isPending}
              >
                <Zap className="h-3 w-3" />
                Enviar todos
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.sent}</p>
              <p className="text-xs text-muted-foreground">Enviados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                filter === tab.key
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-background hover:bg-muted'
              }`}
            >
              {tab.label}
              {tab.key === 'overdue' && summary.overdue > 0 && (
                <span className="ml-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                  {summary.overdue}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all ${
                typeFilter === tab.key
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-background hover:bg-muted text-muted-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Actions */}
      {pendingReminders.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <Button variant="outline" size="sm" onClick={selectAllPending} className="text-xs">
            Selecionar pendentes ({pendingReminders.length})
          </Button>
          {selected.size > 0 && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-xs text-muted-foreground">
                {selected.size} selecionado(s)
              </span>
              <Button
                size="sm"
                onClick={handleSendSelected}
                disabled={sendMutation.isPending}
                className="gap-1.5 text-xs"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                Enviar selecionados
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(new Set())}
                className="text-xs"
              >
                Limpar
              </Button>
            </>
          )}

          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendBatch('all_today')}
              disabled={sendMutation.isPending}
              className="gap-1.5 text-xs"
            >
              <Zap className="h-3 w-3" />
              Disparar do dia
            </Button>
          </div>
        </div>
      )}

      {/* Send result feedback */}
      {sendMutation.isSuccess && (
        <div className={`rounded-lg border p-3 ${sendMutation.data.failed > 0 ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <p className={`flex items-center gap-2 text-sm ${sendMutation.data.failed > 0 ? 'text-red-800' : 'text-emerald-800'}`}>
            {sendMutation.data.failed > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {sendMutation.data.sent} enviada(s) com sucesso
            {sendMutation.data.failed > 0 && `, ${sendMutation.data.failed} falha(s)`}
          </p>
          {sendMutation.data.results?.filter((r: { success: boolean; error?: string }) => !r.success).map((r: { id: string; error?: string }, i: number) => (
            <p key={i} className="mt-1 text-xs text-red-600 pl-6">
              {r.error || 'Erro desconhecido'}
            </p>
          ))}
        </div>
      )}

      {sendMutation.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="flex items-center gap-2 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4" />
            {sendMutation.error instanceof Error
              ? sendMutation.error.message
              : 'Erro ao enviar lembretes'}
          </p>
        </div>
      )}

      {/* Reminders List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reminders.length > 0 ? (
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              isSelected={selected.has(reminder.id)}
              onToggleSelect={() => toggleSelect(reminder.id)}
              onSendSingle={() =>
                sendMutation.mutate({ reminderIds: [reminder.id] })
              }
              isSending={sendMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="h-14 w-14 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-medium">Nenhum lembrete encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {filter !== 'all' || typeFilter
                ? 'Tente ajustar os filtros'
                : 'Os lembretes aparecerao conforme sessoes forem agendadas e concluidas'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReminderCard({
  reminder,
  isSelected,
  onToggleSelect,
  onSendSingle,
  isSending,
}: {
  reminder: ReminderItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onSendSingle: () => void;
  isSending: boolean;
}) {
  const typeCfg = TYPE_CONFIG[reminder.type] ?? TYPE_CONFIG.appointment;
  const statusCfg = STATUS_CONFIG[reminder.status] ?? STATUS_CONFIG.pending;
  const TypeIcon = typeCfg.icon;
  const dueDate = new Date(reminder.dueAt);
  const sessionDate = new Date(reminder.sessionDate);

  return (
    <Card
      className={`transition-all ${
        isSelected ? 'ring-1 ring-primary/30 bg-primary/5' : ''
      } ${reminder.status === 'overdue' ? 'border-red-200' : ''}`}
    >
      <CardContent className="flex items-center gap-3 p-3 sm:p-4">
        {/* Checkbox */}
        {reminder.status !== 'sent' && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 shrink-0 rounded border-gray-300"
          />
        )}

        {/* Type Icon */}
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeCfg.bg}`}>
          <TypeIcon className={`h-4 w-4 ${typeCfg.color}`} />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{reminder.clientName}</span>
            <Badge variant="outline" className={`text-[10px] ${statusCfg.color}`}>
              <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${statusCfg.dotColor}`} />
              {statusCfg.label}
            </Badge>
          </div>

          {reminder.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{reminder.description}</p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span className={`font-medium ${typeCfg.color}`}>{typeCfg.label}</span>
            {reminder.sessionStatus && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                {reminder.sessionStatus === 'scheduled' ? 'Agendada' :
                 reminder.sessionStatus === 'completed' ? 'Concluida' :
                 reminder.sessionStatus === 'no_show' ? 'Faltou' :
                 reminder.sessionStatus === 'cancelled' ? 'Cancelada' :
                 reminder.sessionStatus}
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {reminder.clientPhone}
            </span>
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              Sessao #{reminder.sessionNumber ?? '?'}: {sessionDate.toLocaleDateString('pt-BR')}{' '}
              {sessionDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Envio: {dueDate.toLocaleDateString('pt-BR')}{' '}
              {dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Link href={`/clients/${reminder.clientId}`}>
            <Button variant="ghost" size="sm" className="hidden gap-1 text-xs sm:flex">
              <User className="h-3 w-3" />
              Perfil
            </Button>
          </Link>

          {reminder.status !== 'sent' && (
            <Button
              size="sm"
              variant={reminder.status === 'overdue' ? 'destructive' : 'default'}
              onClick={onSendSingle}
              disabled={isSending}
              className="gap-1.5 text-xs"
            >
              {isSending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              Enviar
            </Button>
          )}

          {reminder.status === 'sent' && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Enviado
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
