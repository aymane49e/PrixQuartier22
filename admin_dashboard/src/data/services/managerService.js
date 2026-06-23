/* src/data/services/managerService.js */
import { supabase } from './supabaseClient';

/**
 * Fetch all managers from Supabase, applying optional search and role filtering.
 */
export const getManagers = async (search = '', roleFilter = 'all') => {
  let query = supabase
    .from('gestionnaires')
    .select('*')
    .order('created_at', { ascending: false });

  if (roleFilter !== 'all') {
    query = query.eq('role', roleFilter);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (search) {
    const lowerSearch = search.toLowerCase();
    return data.filter(
      (m) =>
        (m.nom && m.nom.toLowerCase().includes(lowerSearch)) ||
        (m.email && m.email.toLowerCase().includes(lowerSearch)) ||
        (m.telephone && m.telephone.toLowerCase().includes(lowerSearch)) ||
        (m.ville && m.ville.toLowerCase().includes(lowerSearch))
    );
  }

  return data;
};

/**
 * Add a new manager to the Supabase database.
 */
export const addManager = async (managerData) => {
  const cleanData = {
    nom: managerData.nom,
    email: managerData.email,
    telephone: managerData.telephone,
    ville: managerData.ville,
    role: managerData.role,
    statut: managerData.statut || 'Actif',
    photo_url: managerData.photo_url || '',
  };

  const { data, error } = await supabase
    .from('gestionnaires')
    .insert([cleanData])
    .select();

  if (error) throw error;
  return data && data[0];
};

/**
 * Update an existing manager in Supabase.
 */
export const updateManager = async (id, managerData) => {
  const cleanData = {
    nom: managerData.nom,
    email: managerData.email,
    telephone: managerData.telephone,
    ville: managerData.ville,
    role: managerData.role,
    statut: managerData.statut,
    photo_url: managerData.photo_url || '',
  };

  const { data, error } = await supabase
    .from('gestionnaires')
    .update(cleanData)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data && data[0];
};

/**
 * Delete a manager from Supabase.
 */
export const deleteManager = async (id) => {
  const { error } = await supabase
    .from('gestionnaires')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

/**
 * Fetch mock or derived recent activities for managers.
 * Since Supabase table doesn't have an actions/logs table, we can generate activity logs 
 * based on recently created or updated managers to keep it fully connected.
 */
export const getRecentActivities = async () => {
  const { data, error } = await supabase
    .from('gestionnaires')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw error;

  // Map managers to recent activity descriptions
  return data.map((m) => {
    const dateStr = new Date(m.created_at).toLocaleDateString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      id: m.id,
      description: `Gestionnaire ${m.nom} (${m.role}) a été configuré pour la ville de ${m.ville}.`,
      status: m.statut,
      time: dateStr,
    };
  });
};
