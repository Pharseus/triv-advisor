// Global State
let currentCountry = null;
let allCountries = [];
let allPlaces = []; // Places for current country
let allPlacesGlobal = []; // All places from all countries for global search
let currentPlace = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let countryVisits = JSON.parse(localStorage.getItem('countryVisits')) || {};
let isDropdownOpen = false;
let lastCommentDoc = null; // For pagination
let hasMoreComments = true; // Flag for load more
let lastCommentTime = 0; // For spam protection (cooldown)
const COMMENTS_PER_PAGE = 10;
const COMMENT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// Apply dark mode immediately to prevent flash
if (isDarkMode) {
    document.body.classList.add('dark-mode');
}

// DOM Elements
const placesGrid = document.getElementById('placesGrid');
const searchInput = document.getElementById('searchInput');
const favoritesList = document.getElementById('favoritesList');
const placeModal = document.getElementById('placeModal');
const closeModalBtn = document.getElementById('closeModal');
const countryDropdownBtn = document.getElementById('countryDropdownBtn');
const countryDropdown = document.getElementById('countryDropdown');
const countrySearchInput = document.getElementById('countrySearchInput');
const selectedCountryName = document.getElementById('selectedCountryName');
const popularCountriesList = document.getElementById('popularCountriesList');
const allCountriesList = document.getElementById('allCountriesList');

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    await loadCountries();
    renderFavorites();
    setupEventListeners();
    initDarkMode();
});

// Setup Event Listeners
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    closeModalBtn.addEventListener('click', closeModal);
    placeModal.addEventListener('click', (e) => {
        if (e.target === placeModal) closeModal();
    });
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // Country dropdown toggle
    countryDropdownBtn.addEventListener('click', toggleCountryDropdown);
    countrySearchInput.addEventListener('input', handleCountrySearch);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!countryDropdownBtn.contains(e.target) && !countryDropdown.contains(e.target)) {
            closeCountryDropdown();
        }
    });
}

// Load Countries from Firestore
async function loadCountries() {
    try {
        const countriesSnapshot = await db.collection('countries').get();
        allCountries = countriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderCountryDropdown();
        
        // Load all places from all countries for global search
        await loadAllPlacesGlobal();
        
        // Load first country by default
        if (allCountries.length > 0) {
            selectCountry(allCountries[0].id);
        }
    } catch (error) {
        console.error('Error loading countries:', error);
        showError('Gagal memuat data negara');
    }
}

// Get Country Flag URL
function getCountryFlagUrl(countryName) {
    // Map country names to ISO 3166-1 alpha-2 codes
    const countryCodeMap = {
        'Indonesia': 'id',
        'Malaysia': 'my',
        'Singapore': 'sg',
        'Thailand': 'th',
        'Vietnam': 'vn',
        'Philippines': 'ph',
        'Japan': 'jp',
        'South Korea': 'kr',
        'China': 'cn',
        'United States': 'us',
        'United Kingdom': 'gb',
        'France': 'fr',
        'Germany': 'de',
        'Italy': 'it',
        'Spain': 'es',
        'Australia': 'au',
        'India': 'in',
        'Brazil': 'br',
        'Mexico': 'mx',
        'Canada': 'ca',
    };
    
    const code = countryCodeMap[countryName];
    if (code) {
        // Using flagcdn.com for high-quality flag images
        return `https://flagcdn.com/32x24/${code}.png`;
    }
    
    // Fallback to globe icon if country not mapped
    return null;
}

// Render Country Dropdown
function renderCountryDropdown() {
    const popularCountries = getPopularCountries();
    
    // Render popular countries
    if (popularCountries.length > 0) {
        popularCountriesList.innerHTML = popularCountries.map(country => {
            const flagUrl = getCountryFlagUrl(country.nama);
            return `
                <div class="country-item" data-country-id="${country.id}">
                    ${flagUrl ? `<img src="${flagUrl}" alt="${country.nama}" class="country-flag">` : '<i class="fas fa-map-marker-alt"></i>'}
                    <span>${country.nama}</span>
                    <span class="popular-badge">Popular</span>
                </div>
            `;
        }).join('');
    } else {
        popularCountriesList.innerHTML = '<p class="empty-message" style="padding: 0.5rem 1rem; font-size: 0.85rem;">No popular countries yet</p>';
    }

    // Render all countries
    allCountriesList.innerHTML = allCountries.map(country => {
        const flagUrl = getCountryFlagUrl(country.nama);
        return `
            <div class="country-item" data-country-id="${country.id}">
                ${flagUrl ? `<img src="${flagUrl}" alt="${country.nama}" class="country-flag">` : '<i class="fas fa-globe-americas"></i>'}
                <span>${country.nama}</span>
            </div>
        `;
    }).join('');

    // Add click listeners
    document.querySelectorAll('.country-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const countryId = e.currentTarget.dataset.countryId;
            selectCountryFromDropdown(countryId);
        });
    });

    updateSelectedCountry();
}

// Select Country from Dropdown
async function selectCountryFromDropdown(countryId) {
    await selectCountry(countryId);
    closeCountryDropdown();
}

// Select Country
async function selectCountry(countryId) {
    currentCountry = countryId;
    
    // Track country visit
    trackCountryVisit(countryId);
    
    // Update selected country display
    updateSelectedCountry();

    await loadPlaces(countryId);
}

// Update Selected Country Display
function updateSelectedCountry() {
    if (currentCountry) {
        const country = allCountries.find(c => c.id === currentCountry);
        if (country) {
            selectedCountryName.textContent = country.nama;
        }
    }
    
    // Update selected state in dropdown
    document.querySelectorAll('.country-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.countryId === currentCountry);
    });
}

// Toggle Country Dropdown
function toggleCountryDropdown() {
    isDropdownOpen = !isDropdownOpen;
    countryDropdown.classList.toggle('show', isDropdownOpen);
    countryDropdownBtn.classList.toggle('active', isDropdownOpen);
    
    if (isDropdownOpen) {
        countrySearchInput.value = '';
        countrySearchInput.focus();
        showAllCountries();
    }
}

// Close Country Dropdown
function closeCountryDropdown() {
    isDropdownOpen = false;
    countryDropdown.classList.remove('show');
    countryDropdownBtn.classList.remove('active');
}

// Handle Country Search
function handleCountrySearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    document.querySelectorAll('.country-item').forEach(item => {
        const countryName = item.textContent.toLowerCase();
        const matches = countryName.includes(searchTerm);
        item.classList.toggle('hidden', !matches);
    });
}

// Show All Countries
function showAllCountries() {
    document.querySelectorAll('.country-item').forEach(item => {
        item.classList.remove('hidden');
    });
}

// Track Country Visit
function trackCountryVisit(countryId) {
    if (!countryVisits[countryId]) {
        countryVisits[countryId] = 0;
    }
    countryVisits[countryId]++;
    localStorage.setItem('countryVisits', JSON.stringify(countryVisits));
}

// Get Popular Countries (top 3 most visited)
function getPopularCountries() {
    const sortedCountries = Object.entries(countryVisits)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => allCountries.find(c => c.id === id))
        .filter(Boolean);
    
    return sortedCountries;
}

// Load All Places from All Countries (for global search)
async function loadAllPlacesGlobal() {
    try {
        allPlacesGlobal = [];
        
        // Load places for each country
        for (const country of allCountries) {
            const placesSnapshot = await db
                .collection('countries')
                .doc(country.id)
                .collection('places')
                .get();

            const countryPlaces = placesSnapshot.docs.map(doc => ({
                id: doc.id,
                countryId: country.id,
                countryName: country.nama,
                ...doc.data()
            }));

            allPlacesGlobal.push(...countryPlaces);
        }
        
        console.log(`Loaded ${allPlacesGlobal.length} places from ${allCountries.length} countries`);
    } catch (error) {
        console.error('Error loading all places:', error);
    }
}

// Load Places from Firestore
async function loadPlaces(countryId) {
    try {
        showLoading();
        
        const placesSnapshot = await db
            .collection('countries')
            .doc(countryId)
            .collection('places')
            .get();

        allPlaces = placesSnapshot.docs.map(doc => ({
            id: doc.id,
            countryId: countryId,
            ...doc.data()
        }));

        renderPlaces(allPlaces);
    } catch (error) {
        console.error('Error loading places:', error);
        showError('Gagal memuat data tempat wisata');
    }
}

// Render Places Grid
function renderPlaces(places) {
    if (places.length === 0) {
        placesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Tidak ada destinasi ditemukan</p>
            </div>
        `;
        return;
    }

    placesGrid.innerHTML = places.map(place => `
        <div class="place-card" data-place-id="${place.id}" data-country-id="${place.countryId}">
            <div class="image-container">
                <img data-src="${place.url_gambar_utama}" 
                     alt="${place.nama}" 
                     class="place-image lazy-image" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(place.nama)}'">
                <div class="image-placeholder"></div>
            </div>
            <div class="place-info">
                <h3 class="place-name">${place.nama}</h3>
                <div class="rating">
                    ${renderStars(place.rating)}
                </div>
            </div>
        </div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.place-card').forEach(card => {
        card.addEventListener('click', async (e) => {
            const placeId = e.currentTarget.dataset.placeId;
            const countryId = e.currentTarget.dataset.countryId;
            
            // Load country if different from current
            if (countryId && currentCountry !== countryId) {
                await selectCountry(countryId);
            }
            
            openPlaceModal(placeId);
        });
    });

    // Initialize lazy loading
    initLazyLoading();
}

// Render Places with Country Info (for global search)
function renderPlacesWithCountry(places) {
    if (places.length === 0) {
        placesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Tidak ada destinasi ditemukan</p>
            </div>
        `;
        return;
    }

    placesGrid.innerHTML = places.map(place => `
        <div class="place-card" data-place-id="${place.id}" data-country-id="${place.countryId}">
            <div class="image-container">
                <img data-src="${place.url_gambar_utama}" 
                     alt="${place.nama}" 
                     class="place-image lazy-image" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(place.nama)}'">
                <div class="image-placeholder"></div>
            </div>
            <div class="place-info">
                <h3 class="place-name">${place.nama}</h3>
                ${place.countryName ? `<p class="place-country"><i class="fas fa-map-marker-alt"></i> ${place.countryName}</p>` : ''}
                <div class="rating">
                    ${renderStars(place.rating)}
                </div>
            </div>
        </div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.place-card').forEach(card => {
        card.addEventListener('click', async (e) => {
            const placeId = e.currentTarget.dataset.placeId;
            const countryId = e.currentTarget.dataset.countryId;
            
            // Load country if different from current
            if (countryId && currentCountry !== countryId) {
                await selectCountry(countryId);
            }
            
            openPlaceModal(placeId);
        });
    });

    // Initialize lazy loading
    initLazyLoading();
}

// Render Star Rating
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt star"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star star empty"></i>';
    }
    
    return stars;
}

// Open Place Modal
async function openPlaceModal(placeId) {
    // Try to find in current country places first, then in global places
    let place = allPlaces.find(p => p.id === placeId);
    if (!place) {
        place = allPlacesGlobal.find(p => p.id === placeId);
    }
    if (!place) return;

    currentPlace = place;

    // Set modal content
    document.getElementById('modalTitle').textContent = place.nama;
    document.getElementById('modalImage').src = place.url_gambar_utama;
    document.getElementById('modalImage').alt = place.nama;
    document.getElementById('modalRating').innerHTML = renderStars(place.rating);
    document.getElementById('modalDescription').textContent = place.deskripsi_lengkap;

    // Setup favorite button
    const favoriteBtn = document.getElementById('favoriteBtn');
    const isFavorite = favorites.some(f => f.id === placeId);
    favoriteBtn.innerHTML = isFavorite 
        ? '<i class="fas fa-star"></i> Remove Fav.'
        : '<i class="far fa-star"></i> Add Fav.';
    favoriteBtn.classList.toggle('active', isFavorite);
    
    favoriteBtn.onclick = () => toggleFavorite(place);

    // Setup location button
    document.getElementById('locationBtn').onclick = () => {
        if (place.lokasi) {
            const { latitude, longitude } = place.lokasi;
            window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
        } else {
            alert('Lokasi tidak tersedia');
        }
    };

    // Load activities
    await loadActivities(place.countryId, placeId);

    // Load similar places
    renderSimilarPlaces(place);

    // Load comments
    await loadComments(place.countryId, placeId);

    // Setup comment form
    setupCommentForm(place.countryId, placeId);

    // Show modal
    placeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Load Activities
async function loadActivities(countryId, placeId) {
    try {
        const activitiesSnapshot = await db
            .collection('countries')
            .doc(countryId)
            .collection('places')
            .doc(placeId)
            .collection('activities')
            .orderBy('order')
            .get();

        const activities = activitiesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderActivities(activities);
    } catch (error) {
        console.error('Error loading activities:', error);
        document.getElementById('activitiesList').innerHTML = 
            '<p class="empty-message">Tidak ada aktivitas tersedia</p>';
    }
}

// Render Activities
function renderActivities(activities) {
    const activitiesList = document.getElementById('activitiesList');
    
    if (activities.length === 0) {
        activitiesList.innerHTML = '<p class="empty-message">Tidak ada aktivitas tersedia</p>';
        return;
    }

    activitiesList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <input type="checkbox" class="activity-checkbox" id="activity-${activity.id}">
            <div class="activity-content">
                <label for="activity-${activity.id}" class="activity-title">${activity.nama}</label>
                <p class="activity-description">${activity.deskripsi}</p>
            </div>
        </div>
    `).join('');
}

// Render Similar Places
function renderSimilarPlaces(currentPlace) {
    const similarPlaces = allPlaces
        .filter(p => p.id !== currentPlace.id)
        .slice(0, 4); // Show max 4 similar places

    const similarContainer = document.getElementById('similarPlaces');

    if (similarPlaces.length === 0) {
        similarContainer.innerHTML = '<p class="empty-message">Tidak ada lokasi serupa</p>';
        return;
    }

    similarContainer.innerHTML = similarPlaces.map(place => `
        <div class="similar-card" data-place-id="${place.id}">
            <div class="image-container">
                <img data-src="${place.url_gambar_utama}" 
                     alt="${place.nama}" 
                     class="similar-image lazy-image"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(place.nama)}'">
                <div class="image-placeholder"></div>
            </div>
            <div class="similar-info">
                <h4 class="similar-name">${place.nama}</h4>
                <div class="rating">
                    ${renderStars(place.rating)}
                </div>
            </div>
        </div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.similar-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const placeId = e.currentTarget.dataset.placeId;
            openPlaceModal(placeId);
        });
    });

    // Initialize lazy loading for similar images
    initLazyLoading();
}

// Load Comments
async function loadComments(countryId, placeId) {
    try {
        const commentsSnapshot = await db
            .collection('countries')
            .doc(countryId)
            .collection('places')
            .doc(placeId)
            .collection('comments')
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        const comments = commentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderComments(comments);
    } catch (error) {
        console.error('Error loading comments:', error);
        document.getElementById('commentsList').innerHTML = 
            '<p class="comments-empty">Gagal memuat komentar</p>';
    }
}

// Render Comments
function renderComments(comments) {
    const commentsList = document.getElementById('commentsList');
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="comments-empty">Belum ada komentar. Jadilah yang pertama berkomentar!</p>';
        return;
    }

    commentsList.innerHTML = comments.map(comment => {
        const initials = getInitials(comment.userName);
        const dateStr = formatCommentDate(comment.timestamp);
        
        return `
            <div class="comment-item">
                <div class="comment-avatar">${initials}</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${escapeHtml(comment.userName)}</span>
                        <span class="comment-date">${dateStr}</span>
                    </div>
                    <p class="comment-text">${escapeHtml(comment.comment)}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Setup Comment Form
function setupCommentForm(countryId, placeId) {
    const submitBtn = document.getElementById('submitComment');
    const userNameInput = document.getElementById('commentUserName');
    const commentInput = document.getElementById('commentText');
    
    // Clear previous inputs
    userNameInput.value = '';
    commentInput.value = '';
    
    // Remove old event listeners by cloning
    const newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
    
    // Add new event listener
    newSubmitBtn.addEventListener('click', async () => {
        await submitComment(countryId, placeId);
    });
}

// Submit Comment
async function submitComment(countryId, placeId) {
    const userNameInput = document.getElementById('commentUserName');
    const commentInput = document.getElementById('commentText');
    const submitBtn = document.getElementById('submitComment');
    
    const userName = userNameInput.value.trim();
    const commentText = commentInput.value.trim();
    
    // Validation
    if (!userName) {
        alert('Silakan masukkan nama Anda');
        userNameInput.focus();
        return;
    }
    
    if (!commentText) {
        alert('Silakan tulis komentar Anda');
        commentInput.focus();
        return;
    }
    
    if (commentText.length < 3) {
        alert('Komentar terlalu pendek (minimal 3 karakter)');
        commentInput.focus();
        return;
    }
    
    // Disable button while submitting
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    
    try {
        // Add comment to Firestore
        await db
            .collection('countries')
            .doc(countryId)
            .collection('places')
            .doc(placeId)
            .collection('comments')
            .add({
                userName: userName,
                comment: commentText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        // Clear form
        userNameInput.value = '';
        commentInput.value = '';
        
        // Reload comments
        await loadComments(countryId, placeId);
        
        // Show success message
        alert('Komentar berhasil ditambahkan!');
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('Gagal menambahkan komentar. Silakan coba lagi.');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Komentar';
    }
}

// Get initials from name
function getInitials(name) {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// Format comment date
function formatCommentDate(timestamp) {
    if (!timestamp) return 'Baru saja';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close Modal
function closeModal() {
    placeModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentPlace = null;
}

// Toggle Favorite
function toggleFavorite(place) {
    const index = favorites.findIndex(f => f.id === place.id);
    
    if (index > -1) {
        // Remove from favorites
        favorites.splice(index, 1);
    } else {
        // Add to favorites
        favorites.push({
            id: place.id,
            nama: place.nama,
            countryId: place.countryId
        });
    }

    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // Update UI
    renderFavorites();
    
    // Update button if modal is open
    if (currentPlace && currentPlace.id === place.id) {
        const favoriteBtn = document.getElementById('favoriteBtn');
        const isFavorite = favorites.some(f => f.id === place.id);
        favoriteBtn.innerHTML = isFavorite 
            ? '<i class="fas fa-star"></i> Remove Fav.'
            : '<i class="far fa-star"></i> Add Fav.';
        favoriteBtn.classList.toggle('active', isFavorite);
    }
}

// Render Favorites
function renderFavorites() {
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">Belum ada favorit</p>';
        return;
    }

    favoritesList.innerHTML = favorites.map(fav => `
        <div class="favorite-item" data-place-id="${fav.id}" data-country-id="${fav.countryId}">
            <span>${fav.nama}</span>
            <button class="remove-favorite" data-place-id="${fav.id}">×</button>
        </div>
    `).join('');

    // Add click listeners for favorite items
    document.querySelectorAll('.favorite-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            if (e.target.classList.contains('remove-favorite')) {
                // Remove favorite
                const placeId = e.target.dataset.placeId;
                const place = favorites.find(f => f.id === placeId);
                if (place) toggleFavorite(place);
            } else {
                // Open place modal
                const placeId = e.currentTarget.dataset.placeId;
                const countryId = e.currentTarget.dataset.countryId;
                
                // Load country if different
                if (currentCountry !== countryId) {
                    await selectCountry(countryId);
                }
                
                openPlaceModal(placeId);
            }
        });
    });
}

// Handle Search (Global Search)
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // Show places from current country when search is empty
        renderPlaces(allPlaces);
        return;
    }

    // Search globally across all places from all countries
    const filteredPlaces = allPlacesGlobal.filter(place => 
        place.nama.toLowerCase().includes(searchTerm) ||
        (place.kategori && place.kategori.toLowerCase().includes(searchTerm)) ||
        (place.tags && place.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
        (place.countryName && place.countryName.toLowerCase().includes(searchTerm))
    );

    renderPlacesWithCountry(filteredPlaces);
}

// Show Loading
function showLoading() {
    placesGrid.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading destinations...</p>
        </div>
    `;
}

// Show Error
function showError(message) {
    placesGrid.innerHTML = `
        <div class="no-results">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Lazy Loading Implementation
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    
    // Check if browser supports Intersection Observer
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px', // Start loading 200px before image enters viewport (more aggressive)
            threshold: 0.01 // Trigger as soon as 1% is visible
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers - load all images immediately
        lazyImages.forEach(img => loadImage(img));
    }
}

function loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;

    // Create a new image to preload
    const tempImg = new Image();
    tempImg.onload = () => {
        img.src = src;
        img.classList.add('loaded');
        
        // Hide placeholder after image loads
        const placeholder = img.nextElementSibling;
        if (placeholder && placeholder.classList.contains('image-placeholder')) {
            placeholder.style.opacity = '0';
            setTimeout(() => {
                placeholder.style.display = 'none';
            }, 300);
        }
    };
    tempImg.onerror = () => {
        // Use placeholder on error
        const onerrorAttr = img.getAttribute('onerror');
        if (onerrorAttr) {
            const match = onerrorAttr.match(/this\.src='([^']+)'/);
            if (match && match[1]) {
                img.src = match[1];
            }
        }
        img.classList.add('loaded');
        const placeholder = img.nextElementSibling;
        if (placeholder && placeholder.classList.contains('image-placeholder')) {
            placeholder.style.display = 'none';
        }
    };
    tempImg.src = src;
}

// Dark Mode Functions
function initDarkMode() {
    updateDarkModeIcon();
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeIcon();
}

function updateDarkModeIcon() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    const icon = darkModeToggle.querySelector('i');
    if (isDarkMode) {
        icon.className = 'fas fa-sun';
        darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
        icon.className = 'fas fa-moon';
        darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
}
