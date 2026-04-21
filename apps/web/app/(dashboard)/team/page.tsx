'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, ShieldCheck, Crown, User as UserIcon, MailCheck, MailX } from 'lucide-react';

type Role = 'owner' | 'admin' | 'professional';

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  specialty: string | null;
  role: Role;
  is_active: boolean;
  invited_at: string | null;
  password_set_at: string | null;
  email: string | null;
  last_sign_in_at: string | null;
}

const ROLE_LABEL: Record<Role, string> = {
  owner: 'Dono',
  admin: 'Administrador',
  professional: 'Profissional',
};

const ROLE_ICON: Record<Role, typeof Crown> = {
  owner: Crown,
  admin: ShieldCheck,
  professional: UserIcon,
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [callerRole, setCallerRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'professional'>('professional');
  const [specialty, setSpecialty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/v1/team');
    if (res.ok) {
      const data = await res.json();
      setMembers(data.professionals ?? []);
      setCallerRole(data.callerRole ?? null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const canInvite = callerRole === 'owner' || callerRole === 'admin';
  const canManageRoles = callerRole === 'owner';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, role, specialty: specialty || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao convidar');

      setFormSuccess(`Convite enviado para ${email}.`);
      setFullName('');
      setEmail('');
      setSpecialty('');
      setRole('professional');
      await load();
      setTimeout(() => {
        setInviteOpen(false);
        setFormSuccess('');
      }, 1500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    const res = await fetch(`/api/v1/team/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) await load();
  };

  const handleDeactivate = async (memberId: string) => {
    if (!confirm('Desativar este profissional? Ele perdera o acesso.')) return;
    const res = await fetch(`/api/v1/team/${memberId}`, { method: 'DELETE' });
    if (res.ok) await load();
  };

  const handleReactivate = async (memberId: string) => {
    const res = await fetch(`/api/v1/team/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true }),
    });
    if (res.ok) await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipe</h1>
          <p className="text-muted-foreground">
            Profissionais com acesso a esta clinica
          </p>
        </div>

        {canInvite && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Convidar profissional
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar novo profissional</DialogTitle>
                <DialogDescription>
                  Um link de acesso sera enviado por e-mail. Na primeira entrada,
                  o profissional define a propria senha.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Ex: Dra. Maria Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="maria@clinica.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Nivel de acesso</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'professional')}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Profissional</SelectItem>
                      {callerRole === 'owner' && (
                        <SelectItem value="admin">Administrador</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Profissional ve tudo mas nao dispara mensagens. Administrador pode disparar mensagens.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade (opcional)</Label>
                  <Input
                    id="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Ex: Esteticista, Biomedica"
                  />
                </div>

                {formError && <p className="text-sm text-destructive">{formError}</p>}
                {formSuccess && <p className="text-sm text-green-600">{formSuccess}</p>}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Enviando...' : 'Enviar convite'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid gap-4">
          {members.map((m) => {
            const Icon = ROLE_ICON[m.role];
            const pendingInvite = m.invited_at && !m.password_set_at;
            return (
              <Card key={m.id} className={!m.is_active ? 'opacity-60' : undefined}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {m.full_name}
                          {!m.is_active && <Badge variant="secondary">Inativo</Badge>}
                          {pendingInvite && (
                            <Badge variant="outline" className="gap-1">
                              <MailX className="h-3 w-3" /> Aguardando 1a entrada
                            </Badge>
                          )}
                          {!pendingInvite && m.password_set_at && (
                            <Badge variant="outline" className="gap-1 text-green-600">
                              <MailCheck className="h-3 w-3" /> Ativo
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {m.email ?? '—'}
                          {m.specialty ? ` · ${m.specialty}` : ''}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={m.role === 'owner' ? 'default' : 'secondary'}>
                      {ROLE_LABEL[m.role]}
                    </Badge>
                  </div>
                </CardHeader>
                {m.role !== 'owner' && (canManageRoles || canInvite) && (
                  <CardContent className="flex flex-wrap gap-2">
                    {canManageRoles && m.is_active && (
                      <Select
                        value={m.role}
                        onValueChange={(v) => handleRoleChange(m.id, v as Role)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="professional">Profissional</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {canManageRoles && m.is_active && (
                      <Button variant="outline" size="sm" onClick={() => handleDeactivate(m.id)}>
                        Desativar
                      </Button>
                    )}
                    {canManageRoles && !m.is_active && (
                      <Button variant="outline" size="sm" onClick={() => handleReactivate(m.id)}>
                        Reativar
                      </Button>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
