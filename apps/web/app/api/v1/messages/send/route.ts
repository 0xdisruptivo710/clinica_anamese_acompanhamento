import { getAuthenticatedUser, ensureClinicSetup, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient, FlwChatService } from '@aesthetic-track/infrastructure';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Not authenticated', 401);

  const clinicId = await ensureClinicSetup(user.id);
  if (!clinicId) return errorResponse('Clinic not set up', 404);

  const body = await request.json();
  const { clientId, phone, message, templateId, parameters, scheduleAt } = body as {
    clientId?: string;
    phone?: string;
    message?: string;
    templateId?: string;
    parameters?: Record<string, string>;
    scheduleAt?: string; // ISO date-time for scheduled messages
  };

  if (!phone && !clientId) {
    return errorResponse('phone or clientId is required', 400);
  }

  const admin = getSupabaseAdminClient();

  const { data: clinic } = await admin
    .from('clinics')
    .select('settings')
    .eq('id', clinicId)
    .single();

  const settings = (clinic?.settings ?? {}) as Record<string, string>;
  const token = settings.flwApiToken || settings.aiosApiKey;

  if (!token) {
    return errorResponse('FLW Chat API not configured. Go to Settings to set up.', 400);
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

  const flw = new FlwChatService(token);
  const fromPhone = settings.flwFromPhone || settings.aiosFromPhone || undefined;

  try {
    // If scheduleAt is provided and is in the future, use scheduled messages
    if (scheduleAt && new Date(scheduleAt) > new Date()) {
      if (!templateId) {
        return errorResponse('templateId is required for scheduled messages', 400);
      }

      const scheduled = await flw.createScheduledMessage({
        to: targetPhone,
        from: fromPhone,
        templateId,
        templateParams: parameters,
        scheduling: scheduleAt,
        hiddenSession: true,
      });

      if (clientId) {
        await admin.from('client_messages').insert({
          clinic_id: clinicId,
          client_id: clientId,
          channel: 'whatsapp',
          status: 'pending',
          body: `Agendado: Template ${templateId}`,
          is_ai_generated: false,
          external_message_id: scheduled.id,
          scheduled_for: scheduleAt,
          idempotency_key: `scheduled_${Date.now()}_${targetPhone}`,
        });
      }

      return successResponse({
        success: true,
        messageId: scheduled.id,
        status: scheduled.status,
        scheduled: true,
        scheduledFor: scheduleAt,
      });
    }

    // Immediate send
    const result = await flw.sendMessage({
      to: targetPhone,
      from: fromPhone,
      text: message,
      templateId,
      parameters,
      hiddenSession: true,
    });

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
