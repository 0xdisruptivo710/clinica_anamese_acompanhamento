import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Convidado: se ainda nao definiu senha, forca fluxo de set-password
  const admin = getSupabaseAdminClient();
  const { data: professional } = await admin
    .from('professionals')
    .select('password_set_at')
    .eq('user_id', data.user.id)
    .single();

  if (professional && professional.password_set_at === null) {
    return NextResponse.redirect(`${origin}/onboarding/set-password`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
