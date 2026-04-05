'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const supabase = createClient();

      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
        } else if (data.session) {
          // Email confirmation disabled — user is logged in
          router.push('/dashboard');
          router.refresh();
        } else {
          setSuccess('Conta criada! Verifique seu e-mail para confirmar.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('E-mail ou senha incorretos');
          } else if (signInError.message.includes('Email not confirmed')) {
            setError('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.');
          } else {
            setError(signInError.message);
          }
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-8 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none ring-ring focus:ring-2"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimo 6 caracteres"
          required
          minLength={6}
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none ring-ring focus:ring-2"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{success}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === 'login' ? (
          <>
            Nao tem conta?{' '}
            <button type="button" onClick={() => { setMode('signup'); setError(''); setSuccess(''); }} className="text-primary underline hover:no-underline">
              Criar conta
            </button>
          </>
        ) : (
          <>
            Ja tem conta?{' '}
            <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-primary underline hover:no-underline">
              Entrar
            </button>
          </>
        )}
      </p>
    </form>
  );
}
