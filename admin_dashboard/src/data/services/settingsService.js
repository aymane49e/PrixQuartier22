/* src/data/services/settingsService.js */
import { supabase } from './supabaseClient';

const TABLE = 'admin_settings';

/* ── Default settings ──────────────────────────────────────────────────── */
export const DEFAULT_SETTINGS = {
  /* Profile */
  admin_name:       'Admin Principal',
  admin_email:      'admin@prixquartier.ma',
  admin_phone:      '',
  admin_photo_url:  '',

  /* Platform */
  site_name:        'PrixQuartier',
  site_description: 'Plateforme collaborative de suivi des prix de quartier au Maroc.',
  contact_email:    'contact@prixquartier.ma',
  site_logo_url:    '',

  /* Security */
  two_factor_enabled: false,

  /* Users */
  allow_registrations:  true,
  auto_validate_accounts: false,
  default_user_role:    'Utilisateur',

  /* Notifications */
  email_notifications:  true,
  notify_new_users:     true,
  notify_new_prices:    true,

  /* Theme */
  theme: 'light',
};

/* ── Load settings (upsert-friendly) ──────────────────────────────────── */
export const loadSettings = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found — return defaults
    console.error('loadSettings error:', error);
    throw error;
  }

  return data ? { ...DEFAULT_SETTINGS, ...data } : { ...DEFAULT_SETTINGS };
};

/* ── Save settings ─────────────────────────────────────────────────────── */
export const saveSettings = async (settings) => {
  // Try upsert (insert or update) by checking if any row exists
  const { data: existing } = await supabase
    .from(TABLE)
    .select('id')
    .single();

  if (existing?.id) {
    const { error } = await supabase
      .from(TABLE)
      .update(settings)
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from(TABLE)
      .insert([settings]);
    if (error) throw error;
  }

  return true;
};

/* ── Supabase meta info ────────────────────────────────────────────────── */
export const getSupabaseMeta = () => ({
  url:     'https://undyixtwcvuyuijecznd.supabase.co',
  project: 'undyixtwcvuyuijecznd',
  region:  'eu-west-1',
  plan:    'Free Tier',
  lastBackup: new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }),
});

/* ── Export all data as CSV ────────────────────────────────────────────── */
export const exportDataCSV = async () => {
  const [usersRes, productsRes, pricesRes] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('products').select('*'),
    supabase.from('contributions').select('*'),
  ]);

  const toCSV = (rows, label) => {
    if (!rows || !rows.length) return `${label}\nAucune donnée\n\n`;
    const headers = Object.keys(rows[0]).join(';');
    const body    = rows.map(r => Object.values(r).map(v => `"${v ?? ''}"`).join(';')).join('\n');
    return `${label}\n${headers}\n${body}\n\n`;
  };

  const csv = [
    toCSV(usersRes.data,    '=== UTILISATEURS ==='),
    toCSV(productsRes.data, '=== PRODUITS ==='),
    toCSV(pricesRes.data,   '=== CONTRIBUTIONS ==='),
  ].join('');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `prixquartier_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
