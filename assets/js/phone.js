/* assets/js/phone.js */

document.addEventListener('DOMContentLoaded', () => {
  // Select phone elements
  const phoneSearchInput = document.querySelector('.phone-search-input');
  const searchResultsDropdown = document.querySelector('.phone-search-results');
  const addPriceModalOverlay = document.getElementById('phone-add-price-overlay');
  const closeModalBtn = document.querySelector('.phone-modal-close');
  const addPriceForm = document.getElementById('phone-add-price-form');
  const phonePricesList = document.querySelector('.phone-prices-list');
  const phoneToast = document.getElementById('phone-success-toast');
  
  // Hero trigger (button on left side of hero: "Ajouter un prix")
  const heroAddPriceBtn = document.getElementById('hero-add-price-btn');
  // Phone trigger (e.g. navigation item or secondary button)
  const phoneAddPriceNavItem = document.getElementById('phone-nav-add');
  
  // Suggested search terms
  const searchProducts = [
    { name: 'Tomates fraîches', price: '5,90 MAD/kg' },
    { name: 'Pommes de terre', price: '3,20 MAD/kg' },
    { name: 'Oignons rouges', price: '4,10 MAD/kg' },
    { name: 'Huile d\'olive', price: '75,00 MAD/L' },
    { name: 'Carottes de saison', price: '4,50 MAD/kg' }
  ];

  // 1. Search Simulation
  if (phoneSearchInput && searchResultsDropdown) {
    phoneSearchInput.addEventListener('focus', showSuggestions);
    phoneSearchInput.addEventListener('input', handleSearchInput);
    
    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!phoneSearchInput.contains(e.target) && !searchResultsDropdown.contains(e.target)) {
        searchResultsDropdown.classList.remove('active');
      }
    });
  }

  function showSuggestions() {
    renderDropdownItems(searchProducts);
    searchResultsDropdown.classList.add('active');
  }

  function handleSearchInput(e) {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      showSuggestions();
      return;
    }
    
    const filtered = searchProducts.filter(p => p.name.toLowerCase().includes(query));
    renderDropdownItems(filtered);
    searchResultsDropdown.classList.add('active');
  }

  function renderDropdownItems(items) {
    searchResultsDropdown.innerHTML = '';
    
    if (items.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'phone-search-item';
      emptyItem.style.color = 'var(--text-muted)';
      emptyItem.textContent = 'Aucun produit trouvé';
      searchResultsDropdown.appendChild(emptyItem);
      return;
    }

    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'phone-search-item';
      el.innerHTML = `<strong>${item.name}</strong> <span style="float:right; color:var(--primary); font-size:0.6rem;">${item.price}</span>`;
      
      el.addEventListener('click', () => {
        phoneSearchInput.value = item.name;
        searchResultsDropdown.classList.remove('active');
        
        // Simuler un effet de highlight sur le produit populaire s'il existe
        highlightProductInGrid(item.name);
      });
      
      searchResultsDropdown.appendChild(el);
    });
  }

  function highlightProductInGrid(name) {
    const cards = document.querySelectorAll('.phone-product-card');
    cards.forEach(card => {
      const pName = card.querySelector('.phone-product-name').textContent.toLowerCase();
      if (name.toLowerCase().includes(pName) || pName.includes(name.toLowerCase())) {
        card.style.transform = 'scale(1.08)';
        card.style.borderColor = 'var(--primary)';
        card.style.boxShadow = 'var(--shadow-glow)';
        
        setTimeout(() => {
          card.style.transform = '';
          card.style.borderColor = '';
          card.style.boxShadow = '';
        }, 1500);
      }
    });
  }

  // 2. Add Price Modal Interaction
  function openAddPriceModal() {
    if (addPriceModalOverlay) {
      addPriceModalOverlay.classList.add('active');
      // Autofocus first input inside mockup
      const firstInput = addPriceModalOverlay.querySelector('select');
      if (firstInput) setTimeout(() => firstInput.focus(), 300);
    }
  }

  function closeAddPriceModal() {
    if (addPriceModalOverlay) {
      addPriceModalOverlay.classList.remove('active');
    }
  }

  if (heroAddPriceBtn) {
    heroAddPriceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Scroll to hero section if not there
      const hero = document.getElementById('accueil');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' });
      }
      openAddPriceModal();
    });
  }

  if (phoneAddPriceNavItem) {
    phoneAddPriceNavItem.addEventListener('click', openAddPriceModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeAddPriceModal);
  }

  if (addPriceModalOverlay) {
    addPriceModalOverlay.addEventListener('click', (e) => {
      if (e.target === addPriceModalOverlay) {
        closeAddPriceModal();
      }
    });
  }

  // 3. Form Submission inside Smartphone
  if (addPriceForm) {
    addPriceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get values
      const productSelect = document.getElementById('phone-form-product');
      const storeInput = document.getElementById('phone-form-store');
      const priceInput = document.getElementById('phone-form-price');
      
      const productName = productSelect.options[productSelect.selectedIndex].text;
      const storeName = storeInput.value || 'Supermarché Local';
      const priceValue = parseFloat(priceInput.value || 0).toFixed(2);
      
      if (!priceValue || priceValue <= 0) {
        alert('Veuillez entrer un prix valide.');
        return;
      }

      // Hide Modal
      closeAddPriceModal();
      
      // Show Success Toast
      showSuccessToast(`Prix de ${productName} ajouté !`);

      // Add to recent feed in Phone list
      addPriceToFeed(productName, priceValue, storeName);

      // Reset form
      addPriceForm.reset();
    });
  }

  function showSuccessToast(message) {
    if (phoneToast) {
      const toastText = phoneToast.querySelector('.phone-toast-text');
      if (toastText) toastText.textContent = message;
      
      phoneToast.classList.add('active');
      
      setTimeout(() => {
        phoneToast.classList.remove('active');
      }, 3000);
    }
  }

  function addPriceToFeed(productName, price, store) {
    if (!phonePricesList) return;
    
    // Choose appropriate emoji or initial for avatar
    let emoji = '🛒';
    let imageSrc = '';
    
    if (productName.includes('Tomate')) {
      emoji = '🍅';
      imageSrc = 'assets/img/products/tomato.png';
    } else if (productName.includes('Pomme')) {
      emoji = '🥔';
      imageSrc = 'assets/img/products/potato.png';
    } else if (productName.includes('Oignon')) {
      emoji = '🧅';
      imageSrc = 'assets/img/products/onion.png';
    }

    const priceItem = document.createElement('div');
    priceItem.className = 'phone-price-item dash-fade-transition'; // uses fade in animation
    
    // Check if we use generated image or fallback emoji
    const imageHTML = imageSrc 
      ? `<img src="${imageSrc}" alt="${productName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
      : '';
    
    priceItem.innerHTML = `
      <div class="phone-price-item-left">
        <div class="phone-price-item-img">
          ${imageHTML}
          <span class="emoji-fallback" style="${imageSrc ? 'display:none;' : 'display:flex;'}">${emoji}</span>
        </div>
        <div class="phone-price-item-details">
          <span class="phone-price-item-name">${productName}</span>
          <span class="phone-price-item-store">${store}</span>
        </div>
      </div>
      <div class="phone-price-item-right">
        <span class="phone-price-item-val">${price} MAD/kg</span>
        <span class="phone-price-item-time">À l'instant</span>
      </div>
    `;

    // Insert at the top of the list
    phonePricesList.insertBefore(priceItem, phonePricesList.firstChild);

    // Limit recent feed to 4 items max
    if (phonePricesList.children.length > 4) {
      phonePricesList.removeChild(phonePricesList.lastChild);
    }
  }
});
