'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Users,
  Syringe,
  CalendarDays,
  DollarSign,
} from 'lucide-react';

const PROCEDURE_STATS = [
  { name: 'Botox', count: 0, revenue: 0, category: 'facial_botox' },
  { name: 'Preenchimento', count: 0, revenue: 0, category: 'facial_filler' },
  { name: 'Skinbooster', count: 0, revenue: 0, category: 'facial_skinbooster' },
  { name: 'Ultraformer', count: 0, revenue: 0, category: 'facial_ultraformer' },
  { name: 'Bioestimuladores', count: 0, revenue: 0, category: 'facial_stimulator' },
  { name: 'Peeling', count: 0, revenue: 0, category: 'facial_peel' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatorios</h1>
        <p className="text-muted-foreground">Metricas e relatorios da clinica</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessoes este Mes</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">vs mes anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">faturamento bruto</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">cadastrados este mes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Retorno</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">clientes recorrentes</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evolucao Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-2 text-sm">Grafico sera exibido com dados reais</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Syringe className="h-5 w-5" />
                Procedimentos Mais Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PROCEDURE_STATS.map((proc) => (
                  <div key={proc.category} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">{proc.name}</div>
                    <div className="flex-1">
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${proc.count > 0 ? Math.max(5, (proc.count / 100) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {proc.count} sessoes
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clientes por Tipo de Pele</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Normal', 'Seca', 'Oleosa', 'Mista', 'Sensivel'].map((tipo) => (
                    <div key={tipo} className="flex items-center justify-between text-sm">
                      <span>{tipo}</span>
                      <Badge variant="outline">--</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Faixa Etaria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['18-25', '26-35', '36-45', '46-55', '55+'].map((faixa) => (
                    <div key={faixa} className="flex items-center justify-between text-sm">
                      <span>{faixa} anos</span>
                      <Badge variant="outline">--</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
