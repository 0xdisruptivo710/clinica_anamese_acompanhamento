'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  CalendarDays,
  Clock,
  DollarSign,
  User,
  Phone,
  Mail,
  Search,
  ChevronDown,
  ChevronUp,
  Syringe,
  Camera,
  ExternalLink,
  Droplets,
  AlertTriangle,
  Pill,
  Target,
  Image,
  FileText,
  ArrowRight,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { useSessions, useSessionDetail, useUpdateSessionStatus } from '@/lib/hooks/use-sessions';
import type { SessionListItem } from '@/lib/hooks/use-sessions';

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  scheduled: { label: 'Agendada', color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
  in_progress: { label: 'Em andamento', color: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
  completed: { label: 'Concluida', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
  cancelled: { label: 'Cancelada', color: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500' },
  no_show: { label: 'Faltou', color: 'bg-gray-50 text-gray-600 border-gray-200', dotColor: 'bg-gray-400' },
};

const PROCEDURES_MAP: Record<string, string> = {
  facial_botox: 'Botox',
  facial_filler: 'Preenchimento',
  facial_stimulator: 'Bioestimulador',
  facial_skinbooster: 'Skinbooster',
  facial_ultraformer: 'Ultraformer',
  facial_laser: 'Laser',
  facial_peel: 'Peeling',
  facial_led: 'LED',
  facial_microneedling: 'Microagulhamento',
  body_lipolysis: 'Lipolise',
  body_ultraformer: 'Ultraformer Corporal',
  body_radiofrequency: 'Radiofrequencia',
  body_cavitation: 'Cavitacao',
  body_lymphatic_drainage: 'Drenagem Linfatica',
  body_cryolipolysis: 'Criolipolise',
  other: 'Outro',
};

const SKIN_TYPES: Record<string, string> = {
  normal: 'Normal',
  dry: 'Seca',
  oily: 'Oleosa',
  combination: 'Mista',
  sensitive: 'Sensivel',
};

const procLabel = (cat: string) => PROCEDURES_MAP[cat] ?? cat;

export default function SessionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useSessions({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const sessions = data?.sessions ?? [];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: sessions.length };
    sessions.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return counts;
  }, [sessions]);

  // Agenda: group sessions by date
  const todayStr = new Date().toLocaleDateString('pt-BR');
  const todaySessions = sessions.filter((s) => {
    const d = new Date(s.sessionDate).toLocaleDateString('pt-BR');
    return d === todayStr && (s.status === 'scheduled' || s.status === 'in_progress');
  });

  const upcomingSessions = sessions.filter((s) => {
    return s.status === 'scheduled' && new Date(s.sessionDate) > new Date();
  }).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sessoes e Agenda</h1>
        <p className="text-muted-foreground">Visualize seus agendamentos e gerencie o status de cada sessao</p>
      </div>

      {/* Agenda do Dia */}
      {todaySessions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              Agenda de Hoje — {todayStr}
            </h3>
            <div className="space-y-2">
              {todaySessions.map((s) => {
                const date = new Date(s.sessionDate);
                const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.scheduled;
                return (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="text-center min-w-[50px]">
                      <p className="text-lg font-bold text-primary">{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.client?.fullName ?? 'Cliente'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cfg.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />{cfg.label}
                        </span>
                        {s.procedures?.length > 0 && (
                          <span className="text-[11px] text-muted-foreground">{s.procedures.map((p) => p.procedureName || procLabel(p.category)).join(', ')}</span>
                        )}
                      </div>
                    </div>
                    {s.client && (
                      <Link href={`/clients/${s.client.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs"><User className="h-3 w-3 mr-1" />Perfil</Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proximos agendamentos */}
      {upcomingSessions.length > 0 && todaySessions.length === 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Proximos Agendamentos
            </h3>
            <div className="space-y-1.5">
              {upcomingSessions.map((s) => {
                const date = new Date(s.sessionDate);
                return (
                  <div key={s.id} className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-primary min-w-[80px]">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                    <span className="text-muted-foreground">{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="truncate">{s.client?.fullName ?? 'Cliente'}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome da cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
            statusFilter === 'all'
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-background hover:bg-muted'
          }`}
        >
          Todas
          <span className="rounded-full bg-white/20 px-1.5 text-[10px]">{statusCounts.all || 0}</span>
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = statusCounts[key] || 0;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === key
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : `${cfg.color} border hover:opacity-80`
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusFilter === key ? 'bg-white' : cfg.dotColor}`} />
              {cfg.label}
              {count > 0 && <span className="text-[10px] opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isExpanded={expandedId === session.id}
              onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarDays className="h-14 w-14 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-medium">Nenhuma sessao encontrada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Crie sessoes a partir do perfil de um cliente'}
            </p>
            {!search && statusFilter === 'all' && (
              <Link href="/clients">
                <Button variant="outline" className="mt-4">
                  <User className="mr-2 h-4 w-4" />
                  Ir para Clientes
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ SESSION CARD ============

function SessionCard({
  session,
  isExpanded,
  onToggle,
}: {
  session: SessionListItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.scheduled;
  const date = new Date(session.sessionDate);
  const client = session.client;
  const procs = session.procedures ?? [];

  return (
    <Card className={`transition-all ${isExpanded ? 'ring-1 ring-primary/20 shadow-md' : 'hover:shadow-md'}`}>
      <CardContent className="p-0">
        {/* Main row — always visible, clickable */}
        <button onClick={onToggle} className="flex w-full items-center gap-4 p-4 text-left">
          {/* Client Avatar */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
            {client?.profilePhotoUrl ? (
              <img
                src={client.profilePhotoUrl}
                alt={client.fullName}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{client?.fullName ?? 'Cliente'}</span>
              <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                #{session.sessionNumber}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {date.toLocaleDateString('pt-BR')} as{' '}
                {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {session.durationMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {session.durationMinutes} min
                </span>
              )}
              {session.totalValue && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  R$ {Number(session.totalValue).toFixed(2)}
                </span>
              )}
            </div>

            {/* Procedure chips */}
            {procs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {procs.slice(0, 3).map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    <Syringe className="h-2.5 w-2.5" />
                    {p.procedureName || procLabel(p.category)}
                  </span>
                ))}
                {procs.length > 3 && (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    +{procs.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right side: status + counts + chevron */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              {session.procedureCount > 0 && (
                <span className="flex items-center gap-1">
                  <Syringe className="h-3 w-3" />
                  {session.procedureCount}
                </span>
              )}
              {session.photoCount > 0 && (
                <span className="flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  {session.photoCount}
                </span>
              )}
            </div>

            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${cfg.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
              {cfg.label}
            </span>

            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded details */}
        {isExpanded && <SessionExpandedDetails session={session} />}
      </CardContent>
    </Card>
  );
}

// ============ EXPANDED DETAILS ============

function SessionExpandedDetails({ session }: { session: SessionListItem }) {
  const { data: detail, isLoading } = useSessionDetail(session.id);
  const client = session.client;
  const procs = detail?.procedures ?? session.procedures ?? [];
  const photos = detail?.photos ?? [];

  return (
    <div className="border-t">
      {/* Quick navigation */}
      {client && (
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{client.fullName}</span>
            {client.phone && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {client.phone}
              </span>
            )}
            {client.email && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                {client.email}
              </span>
            )}
          </div>
          <Link href={`/clients/${client.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              Ver Perfil Completo
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 p-4 lg:grid-cols-3">
        {/* Column 1: Session Notes */}
        <div className="space-y-4 lg:col-span-2">
          {/* Session notes section */}
          {(session.clientComplaint || session.preSessionNotes || session.postSessionNotes || session.professionalNotes) && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                Notas da Sessao
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {session.clientComplaint && (
                  <div className="rounded-lg border bg-orange-50/50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-600">Queixa Principal</p>
                    <p className="mt-1 text-sm">{session.clientComplaint}</p>
                  </div>
                )}
                {session.preSessionNotes && (
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Pre-sessao</p>
                    <p className="mt-1 text-sm">{session.preSessionNotes}</p>
                  </div>
                )}
                {session.postSessionNotes && (
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Pos-sessao</p>
                    <p className="mt-1 text-sm">{session.postSessionNotes}</p>
                  </div>
                )}
                {session.professionalNotes && (
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Notas do Profissional</p>
                    <p className="mt-1 text-sm">{session.professionalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Procedures */}
          {procs.length > 0 && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <Syringe className="h-4 w-4 text-primary" />
                Procedimentos Realizados
              </h4>
              <div className="space-y-2">
                {procs.map((p) => (
                  <div key={p.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Syringe className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{p.procedureName || procLabel(p.category)}</p>
                      <p className="text-xs text-muted-foreground">{procLabel(p.category)}</p>
                      {p.treatmentAreas?.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {p.treatmentAreas.map((area) => (
                            <Badge key={area} variant="outline" className="text-[10px]">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {isLoading ? (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <Camera className="h-4 w-4 text-primary" />
                Fotos da Sessao
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            </div>
          ) : photos.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <Camera className="h-4 w-4 text-primary" />
                  Fotos da Sessao
                  <span className="text-xs font-normal text-muted-foreground">({photos.length})</span>
                </h4>
                {client && (
                  <Link href={`/clients/${client.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      <Image className="h-3 w-3" />
                      Ver Todas as Fotos
                    </Button>
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-lg border">
                    <img
                      src={photo.url}
                      alt={photo.caption || ''}
                      className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                      <Badge variant="secondary" className="text-[9px]">
                        {photo.photoType === 'before'
                          ? 'Antes'
                          : photo.photoType === 'after'
                            ? 'Depois'
                            : photo.photoType === 'during'
                              ? 'Durante'
                              : 'Progresso'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : session.photoCount > 0 && !isLoading ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              <Camera className="mx-auto h-6 w-6 mb-1 opacity-50" />
              {session.photoCount} foto{session.photoCount > 1 ? 's' : ''} registrada{session.photoCount > 1 ? 's' : ''}
            </div>
          ) : null}

          {/* Status Change */}
          <SessionStatusButtons sessionId={session.id} currentStatus={session.status} />

          {/* Financial & Follow-up */}
          {(session.totalValue || session.followUpDate || session.painScore != null) && (
            <div className="flex flex-wrap gap-3">
              {session.totalValue && (
                <div className="rounded-lg border bg-emerald-50/50 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Valor</p>
                  <p className="text-sm font-bold text-emerald-700">R$ {Number(session.totalValue).toFixed(2)}</p>
                </div>
              )}
              {session.followUpDate && (
                <div className="rounded-lg border px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Retorno</p>
                  <p className="text-sm font-medium">{new Date(session.followUpDate).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
              {session.painScore != null && (
                <div className="rounded-lg border px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Dor</p>
                  <p className="text-sm font-medium">{session.painScore}/10</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Column 2: Client Quick Profile */}
        {client && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4 text-primary" />
              Perfil da Cliente
            </h4>

            {/* Skin info */}
            {(client.skinType || client.fitzpatrick) && (
              <div className="rounded-lg border p-3 space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Droplets className="h-3 w-3" />
                  Pele
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {client.skinType && <Badge variant="secondary">{SKIN_TYPES[client.skinType] ?? client.skinType}</Badge>}
                  {client.fitzpatrick && <Badge variant="outline">Fitz {client.fitzpatrick}</Badge>}
                </div>
              </div>
            )}

            {/* Allergies alert */}
            {client.allergies && client.allergies.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-red-700">
                  <AlertTriangle className="h-3 w-3" />
                  Alergias
                </p>
                <div className="flex flex-wrap gap-1">
                  {client.allergies.map((a) => (
                    <Badge key={a} variant="destructive" className="text-[10px]">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Medications */}
            {client.medications && client.medications.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                  <Pill className="h-3 w-3" />
                  Medicamentos
                </p>
                <div className="flex flex-wrap gap-1">
                  {client.medications.map((m) => (
                    <Badge key={m} variant="secondary" className="text-[10px]">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Medical conditions */}
            {client.medicalConditions && client.medicalConditions.length > 0 && (
              <div className="rounded-lg border p-3 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground">Condicoes Medicas</p>
                <div className="flex flex-wrap gap-1">
                  {client.medicalConditions.map((c) => (
                    <Badge key={c} variant="outline" className="text-[10px]">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Goals */}
            {client.aestheticGoals && (
              <div className="rounded-lg border p-3 space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Target className="h-3 w-3" />
                  Objetivos
                </p>
                <p className="text-xs leading-relaxed">{client.aestheticGoals}</p>
              </div>
            )}

            {/* Tags */}
            {client.tags && client.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {client.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Quick links */}
            <Separator />
            <div className="space-y-1.5">
              <Link href={`/clients/${client.id}`} className="block">
                <Button variant="outline" size="sm" className="w-full justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <Camera className="h-3.5 w-3.5" />
                    Fotos e Galeria
                  </span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
              <Link href={`/clients/${client.id}`} className="block">
                <Button variant="outline" size="sm" className="w-full justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    Anamnese Completa
                  </span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
              <Link href={`/clients/${client.id}`} className="block">
                <Button variant="outline" size="sm" className="w-full justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Historico de Sessoes
                  </span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ SESSION STATUS BUTTONS ============

function SessionStatusButtons({ sessionId, currentStatus }: { sessionId: string; currentStatus: string }) {
  const statusMutation = useUpdateSessionStatus();

  const changeStatus = (newStatus: string) => {
    statusMutation.mutate({ id: sessionId, status: newStatus });
  };

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Marcar presenca</p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={currentStatus === 'completed' ? 'default' : 'outline'}
          className="gap-1.5 text-xs h-7"
          onClick={() => changeStatus('completed')}
          disabled={statusMutation.isPending || currentStatus === 'completed'}
        >
          <ExternalLink className="h-3 w-3" />
          Compareceu
        </Button>
        <Button
          size="sm"
          variant={currentStatus === 'no_show' ? 'destructive' : 'outline'}
          className="gap-1.5 text-xs h-7"
          onClick={() => changeStatus('no_show')}
          disabled={statusMutation.isPending || currentStatus === 'no_show'}
        >
          <AlertTriangle className="h-3 w-3" />
          Faltou
        </Button>
        <Button
          size="sm"
          variant={currentStatus === 'cancelled' ? 'secondary' : 'outline'}
          className="gap-1.5 text-xs h-7"
          onClick={() => changeStatus('cancelled')}
          disabled={statusMutation.isPending || currentStatus === 'cancelled'}
        >
          Desmarcou
        </Button>
        {currentStatus !== 'scheduled' && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs h-7 text-muted-foreground"
            onClick={() => changeStatus('scheduled')}
            disabled={statusMutation.isPending}
          >
            Voltar para Agendada
          </Button>
        )}
      </div>
    </div>
  );
}
