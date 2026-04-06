import { getAuthenticatedUser, ensureClinicSetup, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient, AiosMessageService } from '@aesthetic-track/infrastructure';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Not authenticated', 401);

  const clinicId = await ensureClinicSetup(user.id);
  if (!clinicId) return errorResponse('Clinic not set up', 404);

  const body = await request.json();
  const { clientId, phone, message, templateId, parameters } = body as {
    clientId?: string;
    phone?: string;
    message?: string;
    templateId?: string;
    parameters?: Record<string, string>;
  };

  if (!phone && !clientId) {
    return errorResponse('phone or clientId is required', 400);
  }

  const admin = getSupabaseAdminClient();

  // Get clinic settings for Aios token
  const { data: clinic } = await admin
    .from('clinics')
    .select('settings')
    .eq('id', clinicId)
    .single();

  const settings = (clinic?.settings ?? {}) as Record<string, string>;
  const aiosToken = settings.aiosApiKey;

  if (!aiosToken) {
    return errorResponse('Aios API not configured. Go to Settings to set up.', 400);
  }

  // Resolve phone number
  let targetPhone = phone;
  if (!targetPhone && clientId) {
    const { data: client } = await admin
      .from('clients')
      .select('phone, whatsapp')
      .eq('id', clientId)
      .single();
    targetPhone = client?.whatsapp || client?.phone;
  }

  if (!targetPhone) {
    return errorResponse('No phone number found for client', 400);
  }

  const aios = new AiosMessageService(aiosToken);

  try {
    const result = await aios.sendWhatsApp({
      to: targetPhone,
      text: message,
      templateId,
      parameters,
      hiddenSession: true,
    });

    // Log in client_messages if clientId provided
    if (clientId) {
      await admin.from('client_messages').insert({
        clinic_id: clinicId,
        client_id: clientId,
        channel: 'whatsapp',
        status: result.status === 'FAILED' ? 'failed' : 'sent',
        body: message || `Template: ${templateId}`,
        is_ai_generated: false,
        external_message_id: result.id,
        sent_at: new Date().toISOString(),
        idempotency_key: `manual_${Date.now()}_${targetPhone}`,
      });
    }

    return successResponse({
      success: true,
      messageId: result.id,
      status: result.status,
      statusUrl: result.statusUrl,
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to send message',
      500,
    );
  }
}
