'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/hooks/use-profile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
} from 'lucide-react';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function Header() {
  const router = useRouter();
  const { data: profile } = useProfile();

  const professionalName = profile?.professional?.full_name || 'Profissional';
  const email = profile?.user?.email || '';
  const specialty = profile?.professional?.specialty || '';
  const clinicName = profile?.clinic?.name || 'AestheticTrack';
  const avatarUrl = profile?.professional?.avatar_url;
  const initials = getInitials(professionalName);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold lg:hidden">AestheticTrack</h2>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 py-1.5 h-auto">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={professionalName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initials}
                </div>
              )}
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium leading-tight">{professionalName}</span>
                {specialty && (
                  <span className="text-[11px] text-muted-foreground leading-tight">{specialty}</span>
                )}
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={professionalName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {initials}
                  </div>
                )}
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold">{professionalName}</p>
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                  {clinicName && (
                    <p className="text-[11px] text-muted-foreground">{clinicName}</p>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer gap-2">
                <User className="h-4 w-4" />
                Meu Perfil
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Settings className="h-4 w-4" />
                Configuracoes
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
