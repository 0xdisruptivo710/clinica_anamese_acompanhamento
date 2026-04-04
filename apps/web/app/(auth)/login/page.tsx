import { LoginForm } from '@/components/features/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            AestheticTrack
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sistema de acompanhamento evolutivo
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
