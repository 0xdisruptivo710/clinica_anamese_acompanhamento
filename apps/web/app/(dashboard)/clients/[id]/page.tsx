'use client';

import { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  User, Phone, Mail, ArrowLeft, Camera, Plus, Upload, X, Save,
  Droplets, Pill, AlertTriangle, Target, CalendarDays, Syringe,
  Image, Filter, Eye, ChevronDown, ChevronUp, FileText,
  RefreshCw, CheckCircle2, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { BeforeAfterSlider } from '@/components/features/photo-comparator/before-after-slider';
import { useSyncCRM } from '@/lib/hooks/use-reminders';
import { useUpdateSessionStatus } from '@/lib/hooks/use-sessions';

// ============ TYPES ============

interface Photo {
  id: string;
  url: string;
  photo_type: string;
  angle: string | null;
  caption: string | null;
  taken_at: string;
  session_id: string | null;
  sessions?: { session_number: number; session_date: string } | null;
}

interface Procedure {
  id: string;
  category: string;
  procedure_name: string;
  treatment_areas: string[];
  technical_details: Record<string, unknown>;
}

interface Session {
  id: string;
  session_number: number;
  session_date: string;
  status: string;
  client_complaint: string | null;
  pre_session_notes: string | null;
  post_session_notes: string | null;
  professional_notes: string | null;
  total_value: number | null;
  duration_minutes: number | null;
  pain_score: number | null;
  follow_up_date: string | null;
  session_procedures: Procedure[];
  photoCount: number;
  procedures: Procedure[];
}

interface ClientData {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  whatsapp: string | null;
  date_of_birth: string | null;
  cpf: string | null;
  skin_type: string | null;
  fitzpatrick: string | null;
  allergies: string[] | null;
  medications: string[] | null;
  medical_conditions: string[] | null;
  previous_procedures: string[] | null;
  aesthetic_goals: string | null;
  notes: string | null;
  preferred_channel: string | null;
  tags: string[] | null;
}

// ============ API ============

const api = {
  getClient: async (id: string): Promise<ClientData> => {
    const r = await fetch(`/api/v1/clients/${id}`);
    if (!r.ok) throw new Error('Client not found');
    return r.json();
  },
  getPhotos: async (id: string): Promise<{ photos: Photo[] }> => {
    const r = await fetch(`/api/v1/clients/${id}/photos`);
    if (!r.ok) return { photos: [] };
    return r.json();
  },
  getSessions: async (id: string): Promise<{ sessions: Session[] }> => {
    const r = await fetch(`/api/v1/clients/${id}/sessions`);
    if (!r.ok) return { sessions: [] };
    return r.json();
  },
  updateClient: async (id: string, data: Record<string, unknown>) => {
    const r = await fetch(`/api/v1/clients/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!r.ok) throw new Error('Erro ao salvar');
    return r.json();
  },
  uploadPhoto: async (clientId: string, file: File, photoType: string, angle: string, sessionId?: string) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('photoType', photoType);
    fd.append('angle', angle);
    if (sessionId) fd.append('sessionId', sessionId);
    const r = await fetch(`/api/v1/clients/${clientId}/photos`, { method: 'POST', body: fd });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Erro no upload'); }
    return r.json();
  },
  createSession: async (clientId: string, data: Record<string, unknown>) => {
    const r = await fetch(`/api/v1/clients/${clientId}/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Erro ao criar sessao'); }
    return r.json();
  },
};

// ============ CONSTANTS ============

const PHOTO_TYPES = [
  { value: 'before', label: 'Antes' },
  { value: 'after', label: 'Depois' },
  { value: 'during', label: 'Durante' },
  { value: 'progress', label: 'Progresso' },
];

const PHOTO_ANGLES = [
  { value: 'frontal', label: 'Frontal' },
  { value: 'left_profile', label: 'Perfil Esquerdo' },
  { value: 'right_profile', label: 'Perfil Direito' },
  { value: 'left_three_quarters', label: '3/4 Esquerdo' },
  { value: 'right_three_quarters', label: '3/4 Direito' },
];

const PROCEDURES = [
  { value: 'facial_botox', label: 'Botox' },
  { value: 'facial_filler', label: 'Preenchimento' },
  { value: 'facial_stimulator', label: 'Bioestimulador' },
  { value: 'facial_skinbooster', label: 'Skinbooster' },
  { value: 'facial_ultraformer', label: 'Ultraformer' },
  { value: 'facial_laser', label: 'Laser' },
  { value: 'facial_peel', label: 'Peeling' },
  { value: 'facial_microneedling', label: 'Microagulhamento' },
  { value: 'body_radiofrequency', label: 'Radiofrequencia' },
  { value: 'body_cryolipolysis', label: 'Criolipolise' },
  { value: 'body_lymphatic_drainage', label: 'Drenagem Linfatica' },
  { value: 'other', label: 'Outro' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Agendada', color: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Concluida', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  no_show: { label: 'Faltou', color: 'bg-gray-100 text-gray-800' },
};

const SKIN_TYPES = [
  { value: 'normal', label: 'Normal' }, { value: 'dry', label: 'Seca' },
  { value: 'oily', label: 'Oleosa' }, { value: 'combination', label: 'Mista' },
  { value: 'sensitive', label: 'Sensivel' },
];

const FITZPATRICK = [
  { value: 'I', label: 'I - Muito clara' }, { value: 'II', label: 'II - Clara' },
  { value: 'III', label: 'III - Morena clara' }, { value: 'IV', label: 'IV - Morena' },
  { value: 'V', label: 'V - Morena escura' }, { value: 'VI', label: 'VI - Negra' },
];

const procLabel = (cat: string) => PROCEDURES.find((p) => p.value === cat)?.label ?? cat;

// ============ MAIN PAGE ============

export default function ClientProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const qc = useQueryClient();

  const { data: client, isLoading } = useQuery({ queryKey: ['client', id], queryFn: () => api.getClient(id) });
  const { data: photosData } = useQuery({ queryKey: ['photos', id], queryFn: () => api.getPhotos(id) });
  const { data: sessionsData } = useQuery({ queryKey: ['sessions', id], queryFn: () => api.getSessions(id) });

  const photos = photosData?.photos ?? [];
  const sessions = sessionsData?.sessions ?? [];

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['photos', id] });
    qc.invalidateQueries({ queryKey: ['sessions', id] });
    qc.invalidateQueries({ queryKey: ['client', id] });
  };

  if (isLoading) return <div className="space-y-4"><div className="h-8 w-48 animate-pulse rounded bg-muted" /><div className="h-64 animate-pulse rounded-lg bg-muted" /></div>;
  if (!client) return <div className="py-12 text-center"><p className="text-lg font-medium">Cliente nao encontrado</p><Link href="/clients"><Button variant="link">Voltar</Button></Link></div>;

  const age = client.date_of_birth ? Math.floor((Date.now() - new Date(client.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clients"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"><User className="h-7 w-7 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">{client.full_name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {age && <span>{age} anos</span>}
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>
              {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>}
            </div>
          </div>
        </div>
        <CrmSyncButton clientId={id} />
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{photos.length}</p><p className="text-xs text-muted-foreground">Fotos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{sessions.length}</p><p className="text-xs text-muted-foreground">Sessoes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{sessions.filter((s) => s.status === 'completed').length}</p><p className="text-xs text-muted-foreground">Concluidas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{sessions.reduce((a, s) => a + (s.procedures?.length ?? 0), 0)}</p><p className="text-xs text-muted-foreground">Procedimentos</p></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="fotos">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="fotos" className="gap-2"><Camera className="h-4 w-4" />Fotos</TabsTrigger>
          <TabsTrigger value="sessoes" className="gap-2"><CalendarDays className="h-4 w-4" />Sessoes</TabsTrigger>
          <TabsTrigger value="anamnese" className="gap-2"><FileText className="h-4 w-4" />Anamnese</TabsTrigger>
        </TabsList>

        <TabsContent value="fotos" className="mt-4 space-y-4">
          <PhotosTab clientId={id} photos={photos} sessions={sessions} onDone={refresh} />
        </TabsContent>

        <TabsContent value="sessoes" className="mt-4 space-y-4">
          <SessionsTab clientId={id} sessions={sessions} photos={photos} client={client} onDone={refresh} />
        </TabsContent>

        <TabsContent value="anamnese" className="mt-4">
          <AnamneseTab clientId={id} client={client} onDone={refresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============ FOTOS TAB ============

function PhotosTab({ clientId, photos, sessions, onDone }: { clientId: string; photos: Photo[]; sessions: Session[]; onDone: () => void }) {
  const [filterSession, setFilterSession] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = useMemo(() => {
    let result = photos;
    if (filterSession !== 'all') {
      result = filterSession === 'no_session'
        ? result.filter((p) => !p.session_id)
        : result.filter((p) => p.session_id === filterSession);
    }
    if (filterType !== 'all') result = result.filter((p) => p.photo_type === filterType);
    return result;
  }, [photos, filterSession, filterType]);

  return (
    <>
      <PhotoUploadSection clientId={clientId} sessions={sessions} onDone={onDone} />

      {/* Filters */}
      {photos.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterSession} onValueChange={setFilterSession}>
            <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue placeholder="Sessao" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as sessoes</SelectItem>
              <SelectItem value="no_session">Sem sessao</SelectItem>
              {sessions.map((s) => <SelectItem key={s.id} value={s.id}>Sessao #{s.session_number}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {PHOTO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {(filterSession !== 'all' || filterType !== 'all') && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setFilterSession('all'); setFilterType('all'); }}>Limpar filtros</Button>
          )}
          <span className="text-xs text-muted-foreground">{filtered.length} foto{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Compare */}
      {photos.length > 1 && <CompareSection photos={photos} />}

      {/* Gallery */}
      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-lg border">
              <img src={photo.url} alt={photo.caption || ''} className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">{PHOTO_TYPES.find((t) => t.value === photo.photo_type)?.label || photo.photo_type}</Badge>
                  {photo.angle && <Badge variant="outline" className="border-white/30 text-xs text-white">{PHOTO_ANGLES.find((a) => a.value === photo.angle)?.label || photo.angle}</Badge>}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-white/80">{new Date(photo.taken_at).toLocaleDateString('pt-BR')}</p>
                  {photo.session_id && photo.sessions && <Badge className="text-xs">Sessao #{photo.sessions.session_number}</Badge>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card><CardContent className="flex flex-col items-center py-12">
          <Camera className="h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-sm font-medium">{photos.length === 0 ? 'Nenhuma foto ainda' : 'Nenhuma foto com esses filtros'}</p>
        </CardContent></Card>
      )}
    </>
  );
}

// ============ PHOTO UPLOAD ============

function PhotoUploadSection({ clientId, sessions, onDone }: { clientId: string; sessions: Session[]; onDone: () => void }) {
  const [files, setFiles] = useState<{ file: File; preview: string; type: string; angle: string; sessionId: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected.map((f) => ({ file: f, preview: URL.createObjectURL(f), type: 'before', angle: 'frontal', sessionId: '' }))]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (i: number) => { URL.revokeObjectURL(files[i].preview); setFiles((p) => p.filter((_, idx) => idx !== i)); };
  const update = (i: number, field: string, value: string) => setFiles((p) => p.map((f, idx) => idx === i ? { ...f, [field]: value } : f));

  const handleUpload = async () => {
    setUploading(true);
    try {
      for (const f of files) await api.uploadPhoto(clientId, f.file, f.type, f.angle, f.sessionId || undefined);
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      onDone();
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro no upload'); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      {files.length === 0 ? (
        <Button variant="outline" onClick={() => inputRef.current?.click()} className="w-full gap-2 border-dashed py-8">
          <Upload className="h-5 w-5" />Fazer Upload de Fotos
        </Button>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {files.map((f, i) => (
              <div key={i} className="relative rounded-lg border p-3">
                <button onClick={() => remove(i)} className="absolute right-2 top-2 z-10 rounded-full bg-destructive p-1 text-white"><X className="h-3 w-3" /></button>
                <img src={f.preview} alt="" className="mb-3 aspect-video w-full rounded object-cover" />
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-xs">Tipo</Label>
                    <Select value={f.type} onValueChange={(v) => update(i, 'type', v)}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{PHOTO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs">Angulo</Label>
                    <Select value={f.angle} onValueChange={(v) => update(i, 'angle', v)}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{PHOTO_ANGLES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs">Sessao</Label>
                    <Select value={f.sessionId} onValueChange={(v) => update(i, 'sessionId', v)}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Nenhuma</SelectItem>
                        {sessions.map((s) => <SelectItem key={s.id} value={s.id}>#{s.session_number} - {new Date(s.session_date).toLocaleDateString('pt-BR')}</SelectItem>)}
                      </SelectContent></Select></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}><Image className="mr-2 h-4 w-4" />Mais fotos</Button>
            <Button onClick={handleUpload} disabled={uploading}>{uploading ? 'Enviando...' : `Enviar ${files.length} foto${files.length > 1 ? 's' : ''}`}</Button>
          </div>
        </>
      )}
    </div>
  );
}

// ============ COMPARE SECTION ============

function CompareSection({ photos }: { photos: Photo[] }) {
  const [beforeId, setBeforeId] = useState('');
  const [afterId, setAfterId] = useState('');
  const before = photos.find((p) => p.id === beforeId);
  const after = photos.find((p) => p.id === afterId);

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm"><Eye className="h-4 w-4" />Comparar Antes / Depois</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Foto Antes</Label>
            <Select value={beforeId} onValueChange={setBeforeId}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{photos.map((p) => <SelectItem key={p.id} value={p.id}>{PHOTO_TYPES.find((t) => t.value === p.photo_type)?.label} - {new Date(p.taken_at).toLocaleDateString('pt-BR')}{p.sessions ? ` (Sessao #${p.sessions.session_number})` : ''}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs">Foto Depois</Label>
            <Select value={afterId} onValueChange={setAfterId}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{photos.map((p) => <SelectItem key={p.id} value={p.id}>{PHOTO_TYPES.find((t) => t.value === p.photo_type)?.label} - {new Date(p.taken_at).toLocaleDateString('pt-BR')}{p.sessions ? ` (Sessao #${p.sessions.session_number})` : ''}</SelectItem>)}</SelectContent></Select></div>
        </div>
        {before && after && <BeforeAfterSlider beforeUrl={before.url} afterUrl={after.url} height={400} />}
      </CardContent>
    </Card>
  );
}

// ============ SESSIONS TAB ============

function SessionsTab({ clientId, sessions, photos, client, onDone }: { clientId: string; sessions: Session[]; photos: Photo[]; client: ClientData; onDone: () => void }) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return sessions;
    return sessions.filter((s) => s.status === statusFilter);
  }, [sessions, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return counts;
  }, [sessions]);

  return (
    <>
      <div className="flex items-center justify-between">
        <NewSessionDialog clientId={clientId} client={client} onDone={onDone} />
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${statusFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
        >Todas ({sessions.length})</button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = statusCounts[key] || 0;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${statusFilter === key ? 'bg-primary text-primary-foreground' : `${cfg.color} hover:opacity-80`}`}
            >{cfg.label} ({count})</button>
          );
        })}
      </div>

      {/* Sessions List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((session) => {
            const date = new Date(session.session_date);
            const procs = session.procedures ?? session.session_procedures ?? [];
            const sessionPhotos = photos.filter((p) => p.session_id === session.id);
            const isExpanded = expandedSession === session.id;
            const cfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.scheduled;

            return (
              <Card key={session.id}>
                <CardContent className="p-0">
                  {/* Session Header - clickable */}
                  <button
                    onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        #{session.session_number}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {date.toLocaleDateString('pt-BR')} as {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                          {procs.length > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Syringe className="h-3 w-3" />{procs.length}</span>}
                          {sessionPhotos.length > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Camera className="h-3 w-3" />{sessionPhotos.length}</span>}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t px-4 pb-4 pt-3 space-y-3">
                      {session.client_complaint && (
                        <div><p className="text-xs font-medium text-muted-foreground">Queixa principal</p><p className="text-sm">{session.client_complaint}</p></div>
                      )}
                      {session.pre_session_notes && (
                        <div><p className="text-xs font-medium text-muted-foreground">Notas pre-sessao</p><p className="text-sm">{session.pre_session_notes}</p></div>
                      )}
                      {session.post_session_notes && (
                        <div><p className="text-xs font-medium text-muted-foreground">Notas pos-sessao</p><p className="text-sm">{session.post_session_notes}</p></div>
                      )}

                      {/* Procedures */}
                      {procs.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Procedimentos realizados</p>
                          <div className="space-y-2">
                            {procs.map((p, i) => (
                              <div key={i} className="flex items-center gap-2 rounded-md bg-muted p-2">
                                <Syringe className="h-4 w-4 text-primary" />
                                <div>
                                  <p className="text-sm font-medium">{p.procedure_name || procLabel(p.category)}</p>
                                  {p.treatment_areas?.length > 0 && (
                                    <p className="text-xs text-muted-foreground">{p.treatment_areas.join(', ')}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Session Photos */}
                      {sessionPhotos.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Fotos desta sessao</p>
                          <div className="grid grid-cols-4 gap-2">
                            {sessionPhotos.map((p) => (
                              <img key={p.id} src={p.url} alt="" className="aspect-square rounded object-cover" />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Anamnese snapshot */}
                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Perfil da cliente</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {client.skin_type && <span>Pele: {SKIN_TYPES.find((s) => s.value === client.skin_type)?.label}</span>}
                          {client.fitzpatrick && <span>Fitz: {client.fitzpatrick}</span>}
                          {(client.allergies?.length ?? 0) > 0 && <span className="text-red-600">Alergias: {client.allergies?.join(', ')}</span>}
                          {(client.medications?.length ?? 0) > 0 && <span>Meds: {client.medications?.join(', ')}</span>}
                        </div>
                        {client.aesthetic_goals && <p className="text-xs mt-1">Objetivo: {client.aesthetic_goals}</p>}
                      </div>

                      {session.total_value && <p className="text-sm font-medium">Valor: R$ {Number(session.total_value).toFixed(2)}</p>}
                      {session.follow_up_date && <p className="text-xs text-muted-foreground">Retorno: {new Date(session.follow_up_date).toLocaleDateString('pt-BR')}</p>}

                      {/* Status Change */}
                      <SessionStatusChanger sessionId={session.id} currentStatus={session.status} onDone={onDone} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card><CardContent className="flex flex-col items-center py-12">
          <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-sm font-medium">{sessions.length === 0 ? 'Nenhuma sessao' : 'Nenhuma sessao com esse filtro'}</p>
        </CardContent></Card>
      )}
    </>
  );
}

// ============ NEW SESSION DIALOG ============

function NewSessionDialog({ clientId, client, onDone }: { clientId: string; client: ClientData; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [status, setStatus] = useState('scheduled');
  const [complaint, setComplaint] = useState('');
  const [notes, setNotes] = useState('');
  const [postNotes, setPostNotes] = useState('');
  const [value, setValue] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [procs, setProcs] = useState([{ category: '', procedureName: '' }]);
  const [saving, setSaving] = useState(false);

  const addProc = () => setProcs([...procs, { category: '', procedureName: '' }]);
  const removeProc = (i: number) => setProcs(procs.filter((_, idx) => idx !== i));

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.createSession(clientId, {
        sessionDate: date,
        status,
        clientComplaint: complaint || undefined,
        preSessionNotes: notes || undefined,
        postSessionNotes: postNotes || undefined,
        totalValue: value ? parseFloat(value) : undefined,
        followUpDate: followUp || undefined,
        procedures: procs.filter((p) => p.category).map((p) => ({
          category: p.category,
          procedureName: p.procedureName || procLabel(p.category),
        })),
      });
      setOpen(false);
      setComplaint(''); setNotes(''); setPostNotes(''); setValue(''); setFollowUp('');
      setProcs([{ category: '', procedureName: '' }]);
      onDone();
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nova Sessao</Button></DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>Registrar Sessao</DialogTitle></DialogHeader>

        {/* Anamnese alert */}
        {((client.allergies?.length ?? 0) > 0 || (client.medications?.length ?? 0) > 0) && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-semibold text-red-800 mb-1">Atencao - Dados da anamnese:</p>
            {(client.allergies?.length ?? 0) > 0 && <p className="text-xs text-red-700">Alergias: {client.allergies?.join(', ')}</p>}
            {(client.medications?.length ?? 0) > 0 && <p className="text-xs text-red-700">Medicamentos: {client.medications?.join(', ')}</p>}
            {(client.medical_conditions?.length ?? 0) > 0 && <p className="text-xs text-red-700">Condicoes: {client.medical_conditions?.join(', ')}</p>}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Data e Hora</Label><Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="space-y-2"><Label>Status</Label>
              <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label>Queixa Principal</Label><Input value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="O que a cliente deseja tratar" /></div>
          <div className="space-y-2"><Label>Notas pre-sessao</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Procedimentos</Label>
              <Button type="button" variant="outline" size="sm" onClick={addProc}><Plus className="mr-1 h-3 w-3" />Adicionar</Button>
            </div>
            {procs.map((p, i) => (
              <div key={i} className="flex gap-2">
                <Select value={p.category} onValueChange={(v) => { const u = [...procs]; u[i].category = v; setProcs(u); }}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Procedimento" /></SelectTrigger>
                  <SelectContent>{PROCEDURES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select>
                <Input className="flex-1" value={p.procedureName} onChange={(e) => { const u = [...procs]; u[i].procedureName = e.target.value; setProcs(u); }} placeholder="Detalhes" />
                {procs.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeProc(i)}><X className="h-4 w-4" /></Button>}
              </div>
            ))}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" /></div>
            <div className="space-y-2"><Label>Data de Retorno</Label><Input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Notas pos-sessao</Label><Textarea value={postNotes} onChange={(e) => setPostNotes(e.target.value)} rows={2} /></div>

          <Button className="w-full" onClick={handleCreate} disabled={saving}>{saving ? 'Salvando...' : 'Registrar Sessao'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ ANAMNESE TAB ============

function AnamneseTab({ clientId, client, onDone }: { clientId: string; client: ClientData; onDone: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    skin_type: client.skin_type || '',
    fitzpatrick: client.fitzpatrick || '',
    allergies: (client.allergies || []).join(', '),
    medications: (client.medications || []).join(', '),
    medical_conditions: (client.medical_conditions || []).join(', '),
    previous_procedures: (client.previous_procedures || []).join(', '),
    aesthetic_goals: client.aesthetic_goals || '',
    notes: client.notes || '',
  });

  const saveMutation = useMutation({
    mutationFn: () => api.updateClient(clientId, {
      skin_type: form.skin_type || null,
      fitzpatrick: form.fitzpatrick || null,
      allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
      medications: form.medications ? form.medications.split(',').map((s) => s.trim()).filter(Boolean) : [],
      medical_conditions: form.medical_conditions ? form.medical_conditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
      previous_procedures: form.previous_procedures ? form.previous_procedures.split(',').map((s) => s.trim()).filter(Boolean) : [],
      aesthetic_goals: form.aesthetic_goals || null,
      notes: form.notes || null,
    }),
    onSuccess: () => { onDone(); setEditing(false); },
  });

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end"><Button variant="outline" size="sm" onClick={() => setEditing(true)}>Editar Anamnese</Button></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Droplets className="h-4 w-4" />Pele</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span className="font-medium">{SKIN_TYPES.find((s) => s.value === client.skin_type)?.label || '--'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fitzpatrick</span><span className="font-medium">{FITZPATRICK.find((f) => f.value === client.fitzpatrick)?.label || '--'}</span></div>
            </CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4" />Alergias</CardTitle></CardHeader>
            <CardContent>{(client.allergies?.length ?? 0) > 0 ? <div className="flex flex-wrap gap-1">{client.allergies!.map((a) => <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>)}</div> : <p className="text-sm text-muted-foreground">Nenhuma</p>}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Pill className="h-4 w-4" />Medicamentos</CardTitle></CardHeader>
            <CardContent>{(client.medications?.length ?? 0) > 0 ? <div className="flex flex-wrap gap-1">{client.medications!.map((m) => <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>)}</div> : <p className="text-sm text-muted-foreground">Nenhum</p>}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Target className="h-4 w-4" />Objetivos</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{client.aesthetic_goals || 'Nao definidos'}</p></CardContent></Card>
        </div>
        {(client.previous_procedures?.length ?? 0) > 0 && (
          <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Syringe className="h-4 w-4" />Procedimentos Anteriores</CardTitle></CardHeader>
            <CardContent><div className="flex flex-wrap gap-1">{client.previous_procedures!.map((p) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}</div></CardContent></Card>
        )}
        {client.notes ? <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Observacoes</CardTitle></CardHeader><CardContent><p className="text-sm">{client.notes}</p></CardContent></Card> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Tipo de Pele</Label>
          <Select value={form.skin_type} onValueChange={(v) => set('skin_type', v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{SKIN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Fitzpatrick</Label>
          <Select value={form.fitzpatrick} onValueChange={(v) => set('fitzpatrick', v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{FITZPATRICK.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="space-y-2"><Label>Alergias (separar por virgula)</Label><Input value={form.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="Dipirona, Latex..." /></div>
      <div className="space-y-2"><Label>Medicamentos em uso</Label><Input value={form.medications} onChange={(e) => set('medications', e.target.value)} placeholder="Roacutan..." /></div>
      <div className="space-y-2"><Label>Condicoes medicas</Label><Input value={form.medical_conditions} onChange={(e) => set('medical_conditions', e.target.value)} placeholder="Diabetes..." /></div>
      <div className="space-y-2"><Label>Procedimentos anteriores</Label><Input value={form.previous_procedures} onChange={(e) => set('previous_procedures', e.target.value)} placeholder="Botox 2023..." /></div>
      <div className="space-y-2"><Label>Objetivos esteticos</Label><Textarea value={form.aesthetic_goals} onChange={(e) => set('aesthetic_goals', e.target.value)} rows={3} /></div>
      <div className="space-y-2"><Label>Observacoes gerais</Label><Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} /></div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}><Save className="mr-2 h-4 w-4" />{saveMutation.isPending ? 'Salvando...' : 'Salvar Anamnese'}</Button>
      </div>
    </div>
  );
}

// ============ SESSION STATUS CHANGER ============

function SessionStatusChanger({ sessionId, currentStatus, onDone }: { sessionId: string; currentStatus: string; onDone: () => void }) {
  const statusMutation = useUpdateSessionStatus();

  const changeStatus = (newStatus: string) => {
    statusMutation.mutate({ id: sessionId, status: newStatus }, { onSuccess: onDone });
  };

  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <p className="text-xs font-medium text-muted-foreground mb-2">Marcar presenca:</p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={currentStatus === 'completed' ? 'default' : 'outline'}
          className="gap-1.5 text-xs"
          onClick={() => changeStatus('completed')}
          disabled={statusMutation.isPending || currentStatus === 'completed'}
        >
          <CheckCircle2 className="h-3 w-3" />
          Compareceu
        </Button>
        <Button
          size="sm"
          variant={currentStatus === 'no_show' ? 'destructive' : 'outline'}
          className="gap-1.5 text-xs"
          onClick={() => changeStatus('no_show')}
          disabled={statusMutation.isPending || currentStatus === 'no_show'}
        >
          <AlertTriangle className="h-3 w-3" />
          Faltou
        </Button>
        <Button
          size="sm"
          variant={currentStatus === 'cancelled' ? 'secondary' : 'outline'}
          className="gap-1.5 text-xs"
          onClick={() => changeStatus('cancelled')}
          disabled={statusMutation.isPending || currentStatus === 'cancelled'}
        >
          <X className="h-3 w-3" />
          Desmarcou
        </Button>
        {currentStatus !== 'scheduled' && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs text-muted-foreground"
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

// ============ CRM SYNC BUTTON ============

function CrmSyncButton({ clientId }: { clientId: string }) {
  const syncMutation = useSyncCRM();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => syncMutation.mutate(clientId)}
      disabled={syncMutation.isPending}
      className="gap-2 text-xs"
    >
      {syncMutation.isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : syncMutation.isSuccess ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      {syncMutation.isPending
        ? 'Sincronizando...'
        : syncMutation.isSuccess
          ? 'Sincronizado!'
          : 'Sync CRM'}
    </Button>
  );
}
