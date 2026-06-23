/* src/components/ProductsPanel.jsx */
import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit2, X, AlertCircle } from 'lucide-react';
import { ConfirmModal } from './Common/ConfirmModal';
import { addProduct, updateProduct, deleteProduct } from '../data/services/productService';

export const ProductsPanel = ({ products, setProducts }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Légumes');
  const [price, setPrice] = useState('');

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Légumes');
    setPrice('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.average_price ? product.average_price.toString() : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    const parsedPrice = parseFloat(price);
    const productData = { name, category, average_price: parsedPrice };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
      } else {
        await addProduct(productData);
        // إعادة جلب المنتجات لضمان تزامن الـ ID المولد من Supabase
        // يمكنك استبدالها بـ window.location.reload() أو استدعاء دالة الجلب
        setProducts([productData, ...products]); 
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        setProducts(products.filter(p => p.id !== productToDelete.id));
        setIsConfirmDeleteOpen(false);
        setProductToDelete(null);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)' }}>Base des produits</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Visualisez et gérez les produits.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: '#fff', padding: '10px 20px', borderRadius: '12px' }}>
          <Plus width="16" height="16" /> <span>Ajouter un Produit</span>
        </button>
      </div>

      {/* Filter and Search actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '360px',
        width: '100%'
      }}>
        <Search style={{
          position: 'absolute',
          left: '14px',
          color: 'var(--text-muted)',
          width: '16px',
          height: '16px'
        }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou catégorie..."
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '10px 16px 10px 38px',
            fontSize: '0.85rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
      </div>

      {/* Main Table view */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix Moyen Réf.</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle width="24" height="24" />
                    <span>Aucun produit ne correspond à votre recherche.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id || Math.random().toString()}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
                      <span style={{ fontSize: '1.25rem' }}>{product.imageFallback}</span>
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-muted)'
                    }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: 'var(--text-dark)' }}>
                    {product.average_price ? product.average_price.toFixed(2) : "0.00"} MAD
                  </td>
    
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleOpenEdit(product)}
                        style={{
                          padding: '6px',
                          borderRadius: '8px',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'transparent'
                        }}
                        className="demo-btn"
                        title="Modifier"
                      >
                        <Edit2 width="14" height="14" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(product)}
                        style={{
                          padding: '6px',
                          borderRadius: '8px',
                          color: 'var(--color-danger)',
                          border: '1px solid var(--color-danger-bg)',
                          backgroundColor: 'transparent'
                        }}
                        className="demo-btn"
                        title="Supprimer"
                      >
                        <Trash2 width="14" height="14" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit Form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                {editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X width="18" height="18" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nom du produit</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Banane, Lait, Carotte"
                  required
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="Légumes">Légumes</option>
                  <option value="Épicerie">Épicerie</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Produits Laitiers">Produits Laitiers</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prix moyen référence (MAD)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="ex: 12.50"
                  step="0.01"
                  required
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginTop: '8px'
                }}
              >
                {editingProduct ? 'Enregistrer les modifications' : 'Créer le produit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Elegant Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer le produit"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce produit de la base de référence ? Cette action est irréversible."
        itemName={productToDelete ? `${productToDelete.imageFallback} ${productToDelete.name}` : ""}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
};
