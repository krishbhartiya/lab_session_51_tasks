// === Sample Product Data ===
const products = [
    { id: 1, name: 'Focus Timer App', image: 'https://source.unsplash.com/300x200/?timer' },
    { id: 2, name: 'Noise-Cancelling Headphones', image: 'https://source.unsplash.com/300x200/?headphones' },
    { id: 3, name: 'Desk Organizer', image: 'https://source.unsplash.com/300x200/?desk' },
    { id: 4, name: 'Blue Light Glasses', image: 'https://source.unsplash.com/300x200/?glasses' },
    { id: 5, name: 'Study Lamp', image: 'https://source.unsplash.com/300x200/?lamp' },
    { id: 6, name: 'Productivity Planner', image: 'https://source.unsplash.com/300x200/?planner' }
  ];
  
  // Mood Emojis and Phrases
  const moodEmojis = ['😍', '🙂', '😐', '😠'];
  const moodPhrases = {
    '😍': 'Loved it!',
    '🙂': 'Pretty good!',
    '😐': 'It’s okay.',
    '😠': 'Not helpful!'
  };
  const moodScores = {
    '😍': 5,
    '🙂': 4,
    '😐': 3,
    '😠': 1
  };
  
  // State
  let selectedMoods = {};
  let userRated = {};
  
  // === DOM References ===
  const productContainer = document.getElementById('productContainer');
  const reviewsModal = document.getElementById('reviewsModal');
  const modalTitle = document.getElementById('modalTitle');
  const reviewList = document.getElementById('reviewList');
  const searchInput = document.getElementById('searchInput');
  const filterButtons = document.querySelector('.review-filter');
  
  // === Load & Render Products ===
  function renderProducts(productList) {
    productContainer.innerHTML = '';
    productList.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
  
      card.innerHTML = `
        <img src="${product.image}" class="product-img" alt="${product.name}">
        <h3 class="product-name">${product.name}</h3>
        <div class="emoji-picker" data-id="${product.id}">
          ${moodEmojis.map(emoji => `<button>${emoji}</button>`).join('')}
        </div>
        <p class="mood-phrase" id="phrase-${product.id}"></p>
        <button class="submit-rating" data-id="${product.id}">Submit Rating</button>
        <p class="rating-feedback" id="feedback-${product.id}"></p>
        <p class="average-rating" id="average-${product.id}"></p>
        <button class="view-reviews" data-id="${product.id}">View Reviews</button>
      `;
  
      productContainer.appendChild(card);
      updateAverageMood(product.id);
    });
  }
  
  // === Emoji Selection Handler ===
  productContainer.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON' && e.target.parentElement.classList.contains('emoji-picker')) {
      const productId = e.target.parentElement.dataset.id;
      const emoji = e.target.textContent;
      selectedMoods[productId] = emoji;
  
      // Highlight selection
      [...e.target.parentElement.children].forEach(btn => btn.classList.remove('selected'));
      e.target.classList.add('selected');
  
      // Update phrase
      document.getElementById(`phrase-${productId}`).textContent = moodPhrases[emoji];
    }
  });
  
  // === Submit Rating ===
  productContainer.addEventListener('click', e => {
    if (e.target.classList.contains('submit-rating')) {
      const productId = e.target.dataset.id;
      const mood = selectedMoods[productId];
  
      if (!mood) {
        alert('Please select a mood before submitting!');
        return;
      }
  
      const ratingKey = `ratings-${productId}`;
      const ratings = JSON.parse(localStorage.getItem(ratingKey)) || [];
      const timestamp = new Date().toISOString();
  
      // Prevent multiple ratings
      if (sessionStorage.getItem(`rated-${productId}`)) {
        alert('You have already rated this product in this session.');
        return;
      }
  
      ratings.push({ mood, timestamp });
      localStorage.setItem(ratingKey, JSON.stringify(ratings));
      sessionStorage.setItem(`rated-${productId}`, true);
  
      document.getElementById(`feedback-${productId}`).textContent = 'Thanks for rating!';
      updateAverageMood(productId);
    }
  });
  
  // === Update Average Mood Display ===
  function updateAverageMood(productId) {
    const ratingKey = `ratings-${productId}`;
    const ratings = JSON.parse(localStorage.getItem(ratingKey)) || [];
    if (ratings.length === 0) {
      document.getElementById(`average-${productId}`).textContent = 'No ratings yet.';
      return;
    }
  
    const total = ratings.reduce((sum, r) => sum + moodScores[r.mood], 0);
    const avg = total / ratings.length;
  
    let closestMood = '😐';
    let minDiff = Infinity;
  
    for (let emoji in moodScores) {
      const diff = Math.abs(avg - moodScores[emoji]);
      if (diff < minDiff) {
        minDiff = diff;
        closestMood = emoji;
      }
    }
  
    document.getElementById(`average-${productId}`).textContent = `Average Mood: ${closestMood} (${ratings.length} ratings)`;
  }
  
  // === View Reviews Modal ===
  productContainer.addEventListener('click', e => {
    if (e.target.classList.contains('view-reviews')) {
      const productId = e.target.dataset.id;
      reviewsModal.classList.remove('hidden');
      modalTitle.textContent = `Reviews for ${products.find(p => p.id == productId).name}`;
      reviewsModal.dataset.productId = productId;
      populateReviews(productId);
    }
  });
  
  // === Populate Reviews in Modal ===
  function populateReviews(productId, filterMood = null) {
    const ratings = JSON.parse(localStorage.getItem(`ratings-${productId}`)) || [];
    reviewList.innerHTML = '';
  
    const filtered = filterMood ? ratings.filter(r => r.mood === filterMood) : ratings;
  
    if (filtered.length === 0) {
      reviewList.innerHTML = '<li>No reviews to show.</li>';
      return;
    }
  
    filtered.forEach(rating => {
      const timeAgo = getRelativeTime(new Date(rating.timestamp));
      const item = document.createElement('li');
      item.textContent = `${rating.mood} - ${moodPhrases[rating.mood]} (${timeAgo})`;
      reviewList.appendChild(item);
    });
  }
  
  // === Relative Time Formatter ===
  function getRelativeTime(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
  
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }
  
  // === Close Modal ===
  document.getElementById('closeModal').addEventListener('click', () => {
    reviewsModal.classList.add('hidden');
  });
  
  // === Filter Reviews ===
  filterButtons.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') {
      const emoji = e.target.textContent;
      const productId = reviewsModal.dataset.productId;
      populateReviews(productId, emoji);
    }
  });
  
  // === Search Products ===
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term));
    renderProducts(filtered);
  });
  
  // === On Load ===
  renderProducts(products);