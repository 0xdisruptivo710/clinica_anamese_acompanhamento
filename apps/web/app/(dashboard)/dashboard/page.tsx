'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarDays, DollarSign, TrendingUp } from 'lucide-react';

const stats = [
  {
    title: 'Total Clientes',
    value: '--',
    description: 'clientes ativos',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Sessoes do Mes',
    value: '--',
    description: 'este mes',
    icon: CalendarDays,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    title: 'Receita Mensal',
    value: '--',
    description: 'faturamento',
    icon: DollarSign,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: 'Taxa de Retorno',
    value: '--',
    description: 'clientes recorrentes',
    icon: TrendingUp,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visao geral da sua clinica</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sessoes de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhuma sessao agendada para hoje
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhuma atividade recente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
