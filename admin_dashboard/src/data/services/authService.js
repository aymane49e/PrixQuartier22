import { supabase } from './supabaseClient';
import { supabaseAdmin } from './supabaseAdmin';



export const signInUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signUpUser = async (name, email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  }, {
    data: {
      full_name: name,
    },
  }); 

  if (error) {
    return { data, error };
  }

  const profile = {
    name,
    email,
    role: 'Utilisateur',
    reputation_points: 0,
    last_active: new Date().toISOString(),
  };

  const { error: profileError } = await supabase
    .from('users')
    .upsert(profile, { onConflict: ['email'] });

  return { data, error: profileError || error };
};

export const getUserProfile = async (email) => {
  const cleanEmail = email.trim().toLowerCase(); 

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, reputation_points, last_active')
    .ilike('email', cleanEmail); 

  if (error) return { data: null, error };
  if (!data || data.length === 0) {
    return { data: null, error: { message: "Utilisateur non trouvé" } };
  }

  return { data: data[0], error: null };
};

export const resetPassword = async (email) => {
  return await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: 'http://localhost:3000/update-password',
  });
};

export const requestPasswordReset = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  const { error } = await supabase
    .from('password_resets')
    .insert([{ email: email.trim().toLowerCase(), otp: otp }]);

  if (error) return { error };

  
  
  console.log("OTP Generated:", otp);
  return { success: true };
};

export const verifyOtp = async (email, otp) => {
  const { data, error } = await supabase
    .from('password_resets')
    .select('otp, expires_at')
    .eq('email', email.trim().toLowerCase())
    .order('expires_at', { ascending: false }) 
    .limit(1)
    .single();

  if (error || !data) return { error: "Le code est invalide ou expiré" };

  if (data.otp !== otp) return { error: "Le code est invalide ou expiré" };

  return { success: true };
};

export const getUserIdByEmail = async (email) => {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) return { error };
  
  const user = data.users.find(u => u.email === email.trim().toLowerCase());
  return user ? { userId: user.id } : { error: "المستخدم غير موجود" };
};

export const updatePasswordAdmin = async (userId, newPassword) => {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );
  return { data, error };
};
