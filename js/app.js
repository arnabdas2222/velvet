/**
 * Velvet Media Portal - Application Logic
 * Mobile-responsive interactive controller with image aspect ratio management,
 * lightbox modal, live search, and live image updater.
 */

// State
let currentItems = [];
let activeFilter = 'all';
let currentLightboxIndex = 0;
let currentFitMode = 'cover'; // 'cover' or 'smart-contain'

// DOM Elements
const sectionsContainer = document.getElementById('sections-container');
const searchInput = document.getElementById('search-input');
const filterPills = document.querySelectorAll('.filter-pill');
const sidebar = document.getElementById('sidebar');
const menuToggleBtn = document.getElementById('menu-toggle');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const lightboxModal = document.getElementById('lightbox-modal');
const customizerDrawer = document.getElementById('customizer-drawer');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  renderAllSections();
  setupCustomizerSlots();
});

// Load data (supports localStorage override if customized in-browser)
function loadData() {
  const STORAGE_KEY = 'velvet_gallery_data_v6';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 16) {
        currentItems = parsed;
        return;
      }
    } catch (e) {
      console.warn('Failed to parse saved gallery data, using defaults.', e);
    }
  }
  // Clear any outdated cache from older iterations
  localStorage.removeItem('velvet_gallery_data');
  localStorage.removeItem('velvet_gallery_data_v2');
  localStorage.removeItem('velvet_gallery_data_v3');
  localStorage.removeItem('velvet_gallery_data_v4');
  localStorage.removeItem('velvet_gallery_data_v5');
  // Clone from data.js
  currentItems = JSON.parse(JSON.stringify(GALLERY_DATA));
}

// Save data to localStorage
function saveData() {
  localStorage.setItem('velvet_gallery_data_v6', JSON.stringify(currentItems));
  renderAllSections();
  setupCustomizerSlots();
}

// Reset to factory defaults
function resetToDefaults() {
  if (confirm('Reset all 16 cards back to original defaults?')) {
    localStorage.removeItem('velvet_gallery_data_v6');
    localStorage.removeItem('velvet_gallery_data_v5');
    localStorage.removeItem('velvet_gallery_data_v4');
    localStorage.removeItem('velvet_gallery_data_v3');
    localStorage.removeItem('velvet_gallery_data_v2');
    localStorage.removeItem('velvet_gallery_data');
    currentItems = JSON.parse(JSON.stringify(GALLERY_DATA));
    renderAllSections();
    setupCustomizerSlots();
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Mobile drawer toggle
  if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      drawerBackdrop.classList.toggle('active');
    });
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      drawerBackdrop.classList.remove('active');
    });
  }

  // Filter pills
  filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.getAttribute('data-filter');
      renderAllSections();
    });
  });

  // Search input with instant filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      filterCardsBySearch(query);
    });
  }

  // Keyboard navigation for Lightbox
  window.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
  });

  // Fit mode toggle
  const fitBtns = document.querySelectorAll('.view-btn[data-fit]');
  fitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      fitBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-fit');
      setFitMode(mode);
    });
  });
}

// Set Image Fit Mode (Cover vs Smart Contain with Ambient Backdrop)
function setFitMode(mode) {
  currentFitMode = mode;
  const cards = document.querySelectorAll('.card-media-box');
  cards.forEach(box => {
    const img = box.querySelector('.card-media-img');
    const ambient = box.querySelector('.card-media-ambient');
    if (mode === 'smart-contain') {
      img.style.objectFit = 'contain';
      ambient.style.opacity = '0.85';
      ambient.style.filter = 'blur(28px) brightness(0.7)';
    } else {
      img.style.objectFit = 'cover';
      ambient.style.opacity = '0.55';
    }
  });
}

// Render HTML Card Element
function createCardElement(item, index) {
  const card = document.createElement('div');
  const initialOrientation = item.orientation || 'auto';
  card.className = `media-card orientation-${initialOrientation}`;
  card.setAttribute('data-id', item.id);
  card.setAttribute('data-index', index);

  // Fallback for avatar if missing
  const avatarUrl = item.avatar || item.image;
  const targetLink = item.link || 'smart link';

  card.innerHTML = `
    <!-- Link directly behind the image -->
    <a href="${targetLink}" class="card-media-box ${initialOrientation !== 'auto' ? 'is-' + initialOrientation : ''}" target="_blank" rel="noopener noreferrer" title="Visit: ${targetLink}">
      <!-- Ambient blurred layer ensures zero ugly letterboxing for unusual aspect ratios -->
      <img class="card-media-ambient" src="${item.image}" alt="" aria-hidden="true" loading="lazy">
      
      <!-- Primary image with crisp high-DPI rendering -->
      <img class="card-media-img" src="${item.image}" alt="${item.creator || ''}" loading="lazy" 
           style="object-fit: ${currentFitMode === 'smart-contain' ? 'contain' : 'cover'}">
      
      ${item.badge ? `<span class="card-badge">${item.badge}</span>` : ''}
      ${item.duration ? `<span class="card-duration">${item.duration}</span>` : ''}
      
      <div class="card-hover-overlay">
        <div class="play-circle">
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
      </div>
    </a>

    <div class="card-info">
      <div class="card-avatar-wrap">
        <a href="${targetLink}" target="_blank" rel="noopener noreferrer">
          <img class="card-avatar" src="${avatarUrl}" alt="${item.creator || ''}" loading="lazy">
        </a>
      </div>
      
      <div class="card-details">
        <a href="${targetLink}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
          <p class="card-creator-name">${item.creator || ''}</p>
        </a>
        <p class="card-description" title="${item.description}">${item.description}</p>
        
        <div class="card-meta-row">
          <div class="instagram-badge">
            <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            <span class="followers-count">${item.followers || '1M'}</span>
          </div>
          
          <button class="card-actions-menu" onclick="event.stopPropagation(); openLightbox(${index});" aria-label="More options">
            <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Auto-detect image aspect ratio to format mobile display without quality loss
  const mainImg = card.querySelector('.card-media-img');
  const mediaBox = card.querySelector('.card-media-box');
  if (mainImg) {
    const handleDimensions = () => {
      if (mainImg.naturalWidth && mainImg.naturalHeight) {
        const isPortrait = mainImg.naturalHeight > mainImg.naturalWidth * 1.05;
        mediaBox.classList.toggle('is-portrait', isPortrait);
        mediaBox.classList.toggle('is-landscape', !isPortrait);
        card.classList.toggle('card-portrait', isPortrait);
        card.classList.toggle('card-landscape', !isPortrait);
      }
    };
    if (mainImg.complete) {
      handleDimensions();
    } else {
      mainImg.addEventListener('load', handleDimensions);
    }
  }

  return card;
}

// Render the sections (4 sections with 4 cards each = 16 cards total)
function renderAllSections() {
  sectionsContainer.innerHTML = '';

  const bestItems = currentItems.filter(item => item.category === 'best');
  const trendingItems = currentItems.filter(item => item.category === 'trending');
  const hotItems = currentItems.filter(item => item.category === 'hot');
  const featuredItems = currentItems.filter(item => item.category === 'featured');

  // If specific filter selected
  if (activeFilter !== 'all') {
    const filtered = currentItems.filter(item => item.category === activeFilter);
    const filterNames = {
      best: 'Best of the week',
      trending: 'Trending videos',
      hot: 'Hot Categories',
      featured: 'Featured & Recommended'
    };
    renderSection(filterNames[activeFilter] || 'Selected Videos', filtered, 'flame');
    return;
  }

  // 1. Best of the week (4 cards)
  renderSection('Best of the week', bestItems, 'calendar');

  // 2. Trending videos (4 cards)
  renderSection('Trending videos', trendingItems, 'trending');

  // 3. Hot Categories (4 cards)
  renderSection('Hot Categories', hotItems, 'flame');

  // 4. Featured & Recommended (4 cards)
  renderSection('Featured & Recommended', featuredItems, 'star');
}

function renderSection(title, items, iconType) {
  if (items.length === 0) return;

  const section = document.createElement('section');
  section.className = 'media-section';

  const iconSvg = getSectionIconSvg(iconType);

  section.innerHTML = `
    <div class="section-header">
      <div class="section-title-wrap">
        <span class="section-icon">${iconSvg}</span>
        <h2 class="section-title">${title}</h2>
      </div>
      <span class="section-count">${items.length} items</span>
    </div>
    <div class="cards-grid"></div>
  `;

  const grid = section.querySelector('.cards-grid');
  items.forEach(item => {
    const originalIndex = currentItems.findIndex(i => i.id === item.id);
    grid.appendChild(createCardElement(item, originalIndex));
  });

  sectionsContainer.appendChild(section);
}

function getSectionIconSvg(type) {
  if (type === 'calendar') {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
  }
  if (type === 'trending') {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`;
  }
  if (type === 'star') {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`;
}

// Search Filter
function filterCardsBySearch(query) {
  if (!query) {
    renderAllSections();
    return;
  }

  sectionsContainer.innerHTML = '';
  const matched = currentItems.filter(item => {
    return (item.title && item.title.toLowerCase().includes(query)) ||
           (item.creator && item.creator.toLowerCase().includes(query)) ||
           (item.description && item.description.toLowerCase().includes(query)) ||
           (item.instagram && item.instagram.toLowerCase().includes(query));
  });

  if (matched.length === 0) {
    sectionsContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <p style="font-size: 1.2rem; font-weight: 600; color: #fff;">No matching cards found for "${query}"</p>
        <p style="margin-top: 8px;">Try searching for a different name, keyword or Instagram handle.</p>
      </div>
    `;
    return;
  }

  renderSection(`Search Results for "${query}"`, matched, 'trending');
}

// ==========================================================================
// LIGHTBOX / MODAL VIEWER
// Displays full uncropped image, regardless of aspect ratio!
// ==========================================================================
function openLightbox(index) {
  currentLightboxIndex = index;
  const item = currentItems[index];
  if (!item) return;

  const modalImg = document.getElementById('modal-main-img');
  const modalAmbient = document.getElementById('modal-ambient-glow');
  const modalAvatar = document.getElementById('modal-avatar');
  const modalTitle = document.getElementById('modal-title');
  const modalCreator = document.getElementById('modal-creator');
  const modalDesc = document.getElementById('modal-desc');
  const modalFollowers = document.getElementById('modal-followers');
  const modalViews = document.getElementById('modal-views');
  const modalIgBtn = document.getElementById('modal-ig-btn');

  modalImg.src = item.image;
  modalAmbient.src = item.image;
  modalAvatar.src = item.avatar || item.image;
  modalTitle.textContent = item.creator || '';
  modalCreator.textContent = '';
  modalDesc.textContent = item.description;
  modalFollowers.textContent = item.followers || '1M';
  modalViews.textContent = item.views || '750K';
  const targetLink = item.link || 'smart link';
  modalIgBtn.href = targetLink;
  modalIgBtn.innerHTML = `
    <svg viewBox="0 0 24 24" style="width:1.125rem;height:1.125rem;fill:none;stroke:currentColor;stroke-width:2.5;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
    Visit Link (${targetLink})
  `;

  lightboxModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxModal.classList.remove('active');
  document.body.style.overflow = '';
}

function nextLightbox() {
  currentLightboxIndex = (currentLightboxIndex + 1) % currentItems.length;
  openLightbox(currentLightboxIndex);
}

function prevLightbox() {
  currentLightboxIndex = (currentLightboxIndex - 1 + currentItems.length) % currentItems.length;
  openLightbox(currentLightboxIndex);
}

function openQuickActionMenu(id) {
  const item = currentItems.find(i => i.id === id);
  if (!item) return;
  const shareText = `${item.title} - ${item.instagram} (${item.followers} followers)`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText);
    showToast(`Copied info for "${item.title}" to clipboard!`);
  } else {
    showToast(shareText);
  }
}

function showToast(msg) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 59, 105, 0.95);
      color: #fff;
      padding: 10px 20px;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      z-index: 2000;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 2600);
}

// ==========================================================================
// CUSTOMIZER / IMAGE REPLACEMENT DRAWER
// Makes it effortless for the user to provide 12 images, names, descriptions & follower counts!
// ==========================================================================
function toggleCustomizerDrawer() {
  customizerDrawer.classList.toggle('open');
}

function setupCustomizerSlots() {
  const container = document.getElementById('customizer-slots-container');
  if (!container) return;

  container.innerHTML = '';

  currentItems.forEach((item, idx) => {
    const slot = document.createElement('div');
    slot.className = 'customizer-slot-item';

    slot.innerHTML = `
      <div class="slot-header">
        <img class="slot-thumb" id="slot-thumb-${item.id}" src="${item.image}" alt="">
        <div>
          <strong style="color:#fff; font-size:0.92rem;">Card #${idx + 1}</strong>
          <span style="display:block; color:var(--text-muted); font-size:0.75rem;">Section: ${item.category}</span>
        </div>
      </div>

      <div class="slot-fields">
        <div>
          <label style="font-size:0.72rem; color:var(--text-muted); font-weight:600;">NAME / TITLE</label>
          <input type="text" class="custom-input" value="${item.title}" data-field="title" data-id="${item.id}">
        </div>

        <div>
          <label style="font-size:0.72rem; color:var(--text-muted); font-weight:600;">DESCRIPTION</label>
          <input type="text" class="custom-input" value="${item.description}" data-field="description" data-id="${item.id}">
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
          <div>
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:600;">INSTAGRAM</label>
            <input type="text" class="custom-input" value="${item.instagram || ''}" data-field="instagram" data-id="${item.id}">
          </div>
          <div>
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:600;">FOLLOWERS</label>
            <input type="text" class="custom-input" value="${item.followers || ''}" data-field="followers" data-id="${item.id}">
          </div>
        </div>

        <div>
          <label style="font-size:0.72rem; color:var(--text-muted); font-weight:600;">LINK BEHIND IMAGE (URL)</label>
          <input type="text" class="custom-input" value="${item.link || 'smart link'}" data-field="link" data-id="${item.id}" placeholder="smart link">
        </div>

        <div>
          <label style="font-size:0.72rem; color:var(--text-muted); font-weight:600;">IMAGE FILE OR URL</label>
          <input type="text" class="custom-input" value="${item.image}" data-field="image" data-id="${item.id}" placeholder="e.g. assets/images/model-1.jpg or URL">
        </div>

        <div style="margin-top: 4px;">
          <label class="file-upload-label">
            <svg style="width:0.875rem;height:0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Choose local image from computer
            <input type="file" accept="image/*" style="display:none;" onchange="handleFileUpload(event, ${item.id})">
          </label>
        </div>
      </div>
    `;

    // Listen to direct text changes
    slot.querySelectorAll('.custom-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const field = e.target.getAttribute('data-field');
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        const targetItem = currentItems.find(i => i.id === id);
        if (targetItem) {
          targetItem[field] = e.target.value;
          if (field === 'image') {
            const thumb = document.getElementById(`slot-thumb-${id}`);
            if (thumb) thumb.src = e.target.value;
          }
          saveData();
        }
      });
    });

    container.appendChild(slot);
  });
}

function handleFileUpload(event, itemId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result;
    const targetItem = currentItems.find(i => i.id === itemId);
    if (targetItem) {
      targetItem.image = base64Data;
      // Also update avatar preview if default
      targetItem.avatar = base64Data;
      saveData();
      showToast(`Image uploaded for Card #${itemId}!`);
    }
  };
  reader.readAsDataURL(file);
}

// Export data as JSON / ready-to-copy JS code for data.js
function exportConfigurationCode() {
  const code = `const GALLERY_DATA = ${JSON.stringify(currentItems, null, 2)};\n\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = { GALLERY_DATA };\n}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code);
    alert('Full 16-card configuration code copied to clipboard! You can paste it directly into js/data.js.');
  } else {
    prompt('Copy this code into your js/data.js file:', code);
  }
}
