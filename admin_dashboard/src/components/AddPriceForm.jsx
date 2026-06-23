/* src/components/AddPriceForm.jsx */
import React, { useState, useEffect } from 'react';
import { PlusCircle, ShoppingCart, Tag, Store, Layers, Search, Sparkles } from 'lucide-react';
import { supabase } from '../data/services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const AddPriceForm = () => {
  const { adminUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Mode de saisie : produit existant ('select') ou nouveau produit ('new')
  const [productMode, setProductMode] = useState('select');

  // États de saisie
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Légumes');
  const [storeName, setStoreName] = useState('');
  const [submittedPrice, setSubmittedPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Récupération des produits existants
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des produits :', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      let finalProductId = selectedProductId;

      // 1. Si nouveau produit, on doit d'abord l'enregistrer dans la base
      if (productMode === 'new') {
        if (!newProductName.trim()) {
          throw new Error('Veuillez saisir un nom de produit.');
        }

        const { data: newProd, error: prodError } = await supabase
          .from('products')
          .insert([
            {
              name: newProductName.trim(),
              category: newProductCategory,
              average_price: parseFloat(submittedPrice)
            }
          ])
          .select();

        if (prodError) throw prodError;
        if (!newProd || newProd.length === 0) {
          throw new Error('Erreur lors de la création du nouveau produit.');
        }

        finalProductId = newProd[0].id;
      }

      if (!finalProductId) {
        throw new Error('Veuillez sélectionner ou créer un produit.');
      }

      // 2. Insérer la contribution avec le bon product_id
      const { error: contribError } = await supabase
        .from('contributions')
        .insert([
          {
            product_id: finalProductId,
            store_name: storeName.trim(),
            submitted_price: parseFloat(submittedPrice),
            submitted_by: adminUser?.email || 'user@example.com',
            status: 'pending' // 'pending' pour s'aligner avec le tableau de bord de modération
          }
        ]);

      if (contribError) throw contribError;

      setSuccessMsg("Votre prix a été partagé avec succès ! Il est en attente de modération.");

      // Réinitialiser les champs
      setNewProductName('');
      setStoreName('');
      setSubmittedPrice('');
      setSelectedProductId('');
      setSearchTerm('');
      setProductMode('select');

      // Recharger les produits pour inclure le nouveau si créé
      loadProducts();
    } catch (err) {
      setErrorMsg(err.message || "Une erreur s'est produite lors du partage du prix.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer la liste des produits selon la recherche
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 0',
      width: '100%'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        width: '100%',
        maxWidth: '560px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '14px',
            borderRadius: 'var(--radius-md)'
          }}>
            <PlusCircle size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)' }}>Partager un prix</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Contribuez à la transparence en enregistrant un prix réel.
            </p>
          </div>
        </div>

        {successMsg && (
          <div style={{
            marginBottom: '20px',
            padding: '14px 18px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            fontWeight: 700,
            border: '1px solid var(--primary-glow)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            marginBottom: '20px',
            padding: '14px 18px',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            fontWeight: 700,
            border: '1px solid rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sélecteur de Mode */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-main)',
          padding: '6px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setProductMode('select'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: productMode === 'select' ? 'var(--bg-card-solid)' : 'transparent',
              color: productMode === 'select' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: productMode === 'select' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Sélectionner un produit
          </button>
          <button
            type="button"
            onClick={() => { setProductMode('new'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: productMode === 'new' ? 'var(--bg-card-solid)' : 'transparent',
              color: productMode === 'new' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: productMode === 'new' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Nouveau produit
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── SECTION CHOIX DU PRODUIT ────────────────────────────────────── */}
          {productMode === 'select' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingCart size={16} /> Choisir le produit
              </label>

              {/* Barre de recherche rapide de produit */}
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '12px 16px 12px 38px',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                    fontWeight: 500
                  }}
                />
              </div>

              {loadingProducts ? (
                <div style={{ padding: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Chargement des produits...
                </div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required={productMode === 'select'}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    fontSize: '0.95rem',
                    color: 'var(--text-main)',
                    fontWeight: 500
                  }}
                >
                  <option value="">-- Sélectionnez un produit dans la liste --</option>
                  {filteredProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            // Formulaire de création de produit si inexistant
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', border: '1px dashed var(--primary-glow)', borderRadius: '16px', backgroundColor: 'var(--primary-light)' }}>

              {/* Nom du nouveau produit */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingCart size={14} /> Nom du nouveau produit
                </label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ex: Cerises, Huile de tournesol..."
                  required={productMode === 'new'}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-card-solid)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '0.9rem',
                    color: 'var(--text-dark)',
                    fontWeight: 500
                  }}
                />
              </div>

              {/* Catégorie */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} /> Catégorie
                </label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-card-solid)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '0.9rem',
                    color: 'var(--text-dark)',
                    fontWeight: 500
                  }}
                >
                  <option value="Légumes">Légumes</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Épicerie">Épicerie</option>
                  <option value="Produits Laitiers">Produits Laitiers</option>
                </select>
              </div>

            </div>
          )}

          {/* ── MAGASIN / MARCHÉ ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Store size={16} /> Lieu d'achat (Magasin / Marché)
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Ex: Hanout Ali, Marjane Maarif, Marché Central..."
              required
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '14px 16px',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                fontWeight: 500
              }}
            />
          </div>

          {/* ── PRIX DU PRODUIT ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={16} /> Prix constaté (MAD)
            </label>
            <input
              type="number"
              value={submittedPrice}
              onChange={(e) => setSubmittedPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.1"
              required
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '14px 16px',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                fontWeight: 500
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.05rem',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: 'var(--shadow-glow)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Publication en cours...' : 'Partager ce prix'}
          </button>
        </form>
      </div>
    </div>
  );
};