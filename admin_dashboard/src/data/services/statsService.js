/* src/data/services/statsService.js */
import { supabase } from './supabaseClient';

/* ── Global counts ─────────────────────────────────────────────────────── */
export const getGlobalStats = async () => {
  const [
    { count: totalUsers,    error: e1 },
    { count: totalProducts, error: e2 },
    { count: totalPrices,   error: e3 },
    { count: totalManagers, error: e4 },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('contributions').select('*', { count: 'exact', head: true }),
    supabase.from('gestionnaires').select('*', { count: 'exact', head: true }),
  ]);

  if (e1 || e2 || e3 || e4) {
    console.error('Stats count error:', e1 || e2 || e3 || e4);
  }

  return {
    totalUsers:    totalUsers    ?? 0,
    totalProducts: totalProducts ?? 0,
    totalPrices:   totalPrices   ?? 0,
    totalManagers: totalManagers ?? 0,
  };
};

/* ── Prix par mois (12 derniers mois) ──────────────────────────────────── */
export const getPricesByMonth = async () => {
  const { data, error } = await supabase
    .from('contributions')
    .select('created_at')
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Build last-12-months buckets
  const now   = new Date();
  const buckets = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    buckets[key] = { name: label, prix: 0 };
  }

  (data || []).forEach(row => {
    const d   = new Date(row.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (buckets[key]) buckets[key].prix += 1;
  });

  return Object.values(buckets);
};

/* ── Produits par catégorie ─────────────────────────────────────────────── */
export const getProductsByCategory = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('category');

  if (error) throw error;

  const counts = {};
  (data || []).forEach(p => {
    const cat = p.category || 'Autre';
    counts[cat] = (counts[cat] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // top 8 categories
};

/* ── Utilisateurs par rôle ─────────────────────────────────────────────── */
export const getUsersByCity = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('role');

  if (error) throw error;

  const counts = {};
  (data || []).forEach(u => {
    const role = u.role || 'Inconnu';
    counts[role] = (counts[role] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // top 10 roles
};

/* ── Top 10 produits (par nb contributions) ────────────────────────────── */
export const getTopProducts = async () => {
  // Fetch all contributions with product name
  const { data, error } = await supabase
    .from('contributions')
    .select(`
      product_id,
      submitted_price,
      products ( name, category )
    `);

  if (error) throw error;

  // Aggregate per product
  const map = {};
  (data || []).forEach(c => {
    const id   = c.product_id;
    const name = c.products?.name     || 'Inconnu';
    const cat  = c.products?.category || 'Autre';
    const price = Number(c.submitted_price) || 0;

    if (!map[id]) {
      map[id] = { id, name, category: cat, consultations: 0, prices: [] };
    }
    map[id].consultations += 1;
    if (price > 0) map[id].prices.push(price);
  });

  return Object.values(map)
    .sort((a, b) => b.consultations - a.consultations)
    .slice(0, 10)
    .map(p => ({
      id:            p.id,
      name:          p.name,
      category:      p.category,
      consultations: p.consultations,
      minPrice:      p.prices.length ? Math.min(...p.prices) : null,
      maxPrice:      p.prices.length ? Math.max(...p.prices) : null,
      avgPrice:      p.prices.length
        ? Math.round(p.prices.reduce((a, b) => a + b, 0) / p.prices.length)
        : null,
    }));
};

/* ── Activités récentes ─────────────────────────────────────────────────── */
export const getRecentActivity = async () => {
  const [usersRes, productsRes, pricesRes] = await Promise.all([
    supabase.from('users').select('id, last_active, email, role').order('last_active', { ascending: false }).limit(5),
    supabase.from('products').select('id, updated_at, name, category').order('updated_at', { ascending: false }).limit(5),
    supabase.from('contributions').select('id, created_at, submitted_price, products(name)').order('created_at', { ascending: false }).limit(5),
  ]);

  const fmt = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const users = (usersRes.data || []).map(u => ({
    id:   'u_' + u.id,
    type: 'user',
    text: `Utilisateur actif — ${u.email || 'Anonyme'}${u.role ? ` (${u.role})` : ''}`,
    time: fmt(u.last_active || u.created_at || new Date()),
    raw:  u.last_active || u.created_at || new Date(),
  }));

  const products = (productsRes.data || []).map(p => ({
    id:   'p_' + p.id,
    type: 'product',
    text: `Nouveau produit — ${p.name}${p.category ? ` · ${p.category}` : ''}`,
    time: fmt(p.created_at),
    raw:  p.created_at,
  }));

  const prices = (pricesRes.data || []).map(c => ({
    id:   'c_' + c.id,
    type: 'price',
    text: `Prix enregistré — ${c.products?.name || 'Produit inconnu'} à ${c.submitted_price} DH`,
    time: fmt(c.created_at),
    raw:  c.created_at,
  }));

  // Merge & sort by date desc
  return [...users, ...products, ...prices]
    .sort((a, b) => new Date(b.raw) - new Date(a.raw))
    .slice(0, 12);
};
