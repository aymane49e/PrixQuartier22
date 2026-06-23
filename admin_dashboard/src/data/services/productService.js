/* src/data/services/productService.js */
import { supabase } from './supabaseClient';


export const getProducts = async () => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
};


export const getContributions = async () => {
  const { data, error } = await supabase
    .from('contributions')
    .select(`
      id,
      product_id,
      submitted_price,
      status,
      created_at,
      store_name,
      submitted_by,
      products (name)
    `); 

  if (error) throw error;
  
  return data.map(item => ({
    ...item,
    productName: item.products?.name || 'Inconnu',
    submittedBy: item.submitted_by || 'Anonyme',
    submittedPrice: item.submitted_price,
    store: item.store_name || 'Magasin Inconnu'
  }));
};


export const getUsers = async () => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
};

export const updateContributionStatus = async (id, newStatus) => {
  const { data, error } = await supabase
    .from('contributions')
    .update({ status: newStatus })
    .eq('id', id);
  
  if (error) throw error;
  return data;
};

export const approveContribution = async (contributionId, productId, newPrice) => {
  const { error: contribError } = await supabase
    .from('contributions')
    .update({ status: 'approved' })
    .eq('id', contributionId);
  if (contribError) throw contribError;

  const { error: productError } = await supabase
    .from('products')
    .update({ average_price: newPrice })
    .eq('id', productId); 
  if (productError) throw productError;

  return true;
};

export const addProduct = async (productData) => {
  const { data, error } = await supabase.from('products').insert([productData]);
  if (error) throw error;
  return data;
};

export const updateProduct = async (id, updatedData) => {
  const { data, error } = await supabase.from('products').update(updatedData).eq('id', id);
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
};
