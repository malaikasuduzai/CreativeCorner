import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { getSettings, saveSettings, SETTINGS_SCHEMA } from '@/lib/settings';

// GET /api/settings
// Public — the Footer and other public components read the business contact
// details from here. Only the values defined in SETTINGS_SCHEMA are ever
// returned, so there's nothing sensitive to leak.
export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings, schema: SETTINGS_SCHEMA });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to load settings', error: err.message },
      { status: 500 }
    );
  }
}

// PUT /api/settings — admin only. Body is a flat { key: value } object;
// unknown keys are dropped by saveSettings().
export async function PUT(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const settings = await saveSettings(body);
    return NextResponse.json({ message: 'Settings saved', settings });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to save settings', error: err.message },
      { status: 500 }
    );
  }
}
