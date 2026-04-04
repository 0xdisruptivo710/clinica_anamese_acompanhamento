'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Camera, Syringe, Clock } from 'lucide-react';

interface SessionSummary {
  sessionId: string;
  sessionNumber: number;
  sessionDate: string;
  status: string;
  procedures: string[];
  photoCount: number;
}

interface EvolutionTimelineProps {
  sessions: SessionSummary[];
  onSessionClick?: (sessionId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'border-green-500 bg-green-500',
  in_progress: 'border-blue-500 bg-blue-500',
  scheduled: 'border-yellow-500 bg-yellow-500',
  cancelled: 'border-red-500 bg-red-500',
  no_show: 'border-gray-500 bg-gray-500',
};

export function EvolutionTimeline({ sessions, onSessionClick }: EvolutionTimelineProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground/30" />
        <p className="mt-4 text-sm text-muted-foreground">Nenhuma sessao registrada</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 h-full w-0.5 bg-border" />

      <div className="space-y-6">
        {sessions.map((session, index) => {
          const date = new Date(session.sessionDate);
          const dotColor = STATUS_COLORS[session.status] || STATUS_COLORS.scheduled;

          return (
            <div
              key={session.sessionId}
              className="relative flex gap-4 pl-2"
            >
              {/* Dot */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`h-3 w-3 rounded-full border-2 ${dotColor}`} style={{ marginTop: 6, marginLeft: 14 }} />
              </div>

              {/* Card */}
              <Card
                className={`flex-1 transition-shadow ${onSessionClick ? 'cursor-pointer hover:shadow-md' : ''}`}
                onClick={() => onSessionClick?.(session.sessionId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">
                          Sessao #{session.sessionNumber}
                        </span>
                        <Badge
                          variant={session.status === 'completed' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {session.status === 'completed'
                            ? 'Concluida'
                            : session.status === 'scheduled'
                              ? 'Agendada'
                              : session.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {date.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    {session.photoCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Camera className="h-3 w-3" />
                        {session.photoCount}
                      </div>
                    )}
                  </div>

                  {session.procedures.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {session.procedures.map((proc, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
                        >
                          <Syringe className="h-3 w-3" />
                          {proc}
                        </div>
                      ))}
                    </div>
                  )}

                  {index === 0 && sessions.length > 1 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {Math.floor(
                        (date.getTime() - new Date(sessions[sessions.length - 1].sessionDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{' '}
                      dias desde a primeira sessao
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
