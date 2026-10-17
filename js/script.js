// Simple interactive features used across the website.
document.addEventListener('DOMContentLoaded', function () {
  // Feature 1: dark/light mode, with the choice remembered in this browser.
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('discoverTheme');
  if (savedTheme === 'dark') document.body.classList.add('dark-mode');
  if (themeToggle) {
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Light mode' : 'Dark mode';
    themeToggle.setAttribute('aria-pressed', document.body.classList.contains('dark-mode') ? 'true' : 'false');
    themeToggle.addEventListener('click', function () {
      document.body.classList.toggle('dark-mode');
      const dark = document.body.classList.contains('dark-mode');
      localStorage.setItem('discoverTheme', dark ? 'dark' : 'light');
      themeToggle.textContent = dark ? 'Light mode' : 'Dark mode';
      themeToggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
    });
  }

  // Feature 2 and 3: destination search and category filtering.
  const placeSearch = document.getElementById('placeSearch');
  const placeItems = Array.from(document.querySelectorAll('.place-item'));
  let activeFilter = 'all';
  function filterPlaces() {
    if (!placeSearch) return;
    const query = placeSearch.value.toLowerCase().trim();
    let shown = 0;
    placeItems.forEach(function (item) {
      const matchesText = item.textContent.toLowerCase().includes(query);
      const matchesCategory = activeFilter === 'all' || item.dataset.category === activeFilter;
      const visible = matchesText && matchesCategory;
      item.hidden = !visible;
      if (visible) shown++;
    });
    const noResults = document.getElementById('noResults');
    if (noResults) noResults.hidden = shown !== 0;
  }
  if (placeSearch) placeSearch.addEventListener('input', filterPlaces);
  document.querySelectorAll('.filter-btn').forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === button));
      filterPlaces();
    });
  });

  // Feature 4: contact form checks required fields and displays a message.
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      event.stopPropagation();
      contactForm.classList.add('was-validated');
      if (!contactForm.checkValidity()) {
        document.getElementById('formMessage').textContent = 'Please correct the fields marked above.';
        document.getElementById('formMessage').className = 'mt-3 text-danger';
        return;
      }
      const visitorName = document.getElementById('name').value.trim();
      const formMessage = document.getElementById('formMessage');
      formMessage.textContent = 'Thank you, ' + visitorName + '. Your sample enquiry passed validation. It has not been sent to a real office.';
      formMessage.className = 'mt-3 text-success';
      contactForm.reset(); contactForm.classList.remove('was-validated');
    });
  }

  // Feature 5: booking cost calculator.
  const peopleCount = document.getElementById('peopleCount');
  const activityType = document.getElementById('activityType');
  const estimatedCost = document.getElementById('estimatedCost');
  function updateCost() {
    if (!peopleCount || !activityType || !estimatedCost) return;
    const people = Math.max(1, Math.min(20, Number(peopleCount.value) || 1));
    estimatedCost.textContent = 'M' + (people * Number(activityType.value)).toLocaleString();
  }
  if (peopleCount) peopleCount.addEventListener('input', updateCost);
  if (activityType) activityType.addEventListener('change', updateCost);
  updateCost();

  // Feature 6: booking form validation and saving/retrieving a sample plan.
  const bookingForm = document.getElementById('bookingForm');
  const savedPlan = document.getElementById('savedPlan');
  function showSavedPlan() {
    if (!savedPlan) return;
    const plan = localStorage.getItem('discoverTripPlan');
    savedPlan.textContent = plan || 'No trip plan saved on this browser yet.';
  }
  if (bookingForm) {
    const dateInput = document.getElementById('travelDate');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
    bookingForm.addEventListener('submit', function (event) {
      event.preventDefault(); event.stopPropagation();
      bookingForm.classList.add('was-validated');
      if (!bookingForm.checkValidity()) {
        document.getElementById('bookingMessage').textContent = 'Please check the highlighted fields and try again.';
        document.getElementById('bookingMessage').className = 'mt-3 text-danger';
        return;
      }
      const name = document.getElementById('bookingName').value.trim();
      const date = document.getElementById('travelDate').value;
      const destination = document.getElementById('bookingDestination').value;
      const people = Number(document.getElementById('peopleCount').value);
      const cost = estimatedCost ? estimatedCost.textContent : 'Not calculated';
      const plan = name + ' — ' + destination + ', ' + date + ', ' + people + ' visitor(s), estimated activity cost ' + cost + '.';
      localStorage.setItem('discoverTripPlan', plan);
      document.getElementById('bookingMessage').textContent = 'Your sample plan has been saved in this browser. This is not a real booking.';
      document.getElementById('bookingMessage').className = 'mt-3 text-success';
      showSavedPlan();
    });
  }
  const clearPlan = document.getElementById('clearPlan');
  if (clearPlan) clearPlan.addEventListener('click', function () { localStorage.removeItem('discoverTripPlan'); showSavedPlan(); });
  showSavedPlan();

  // Feature 7: save favourite destinations using localStorage.
  const favouriteButtons = document.querySelectorAll('.favourite-btn');
  const favouriteList = document.getElementById('favouriteList');
  function getFavourites() { try { return JSON.parse(localStorage.getItem('discoverFavourites') || '[]'); } catch (e) { return []; } }
  function renderFavourites() {
    if (!favouriteList) return;
    const favourites = getFavourites();
    favouriteList.textContent = favourites.length ? favourites.join(', ') : 'No favourites saved yet.';
    favouriteButtons.forEach(button => { button.textContent = favourites.includes(button.dataset.place) ? 'Remove favourite' : 'Save favourite'; });
  }
  favouriteButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      let favourites = getFavourites();
      if (favourites.includes(button.dataset.place)) favourites = favourites.filter(place => place !== button.dataset.place);
      else favourites.push(button.dataset.place);
      localStorage.setItem('discoverFavourites', JSON.stringify(favourites));
      renderFavourites();
    });
  });
  renderFavourites();

  // Feature 8: gallery image preview in a Bootstrap modal.
  document.querySelectorAll('.gallery-thumb').forEach(function (button) {
    button.addEventListener('click', function () {
      const image = document.getElementById('modalImage');
      const title = document.getElementById('imageModalTitle');
      const caption = document.getElementById('modalCaption');
      if (!image || !window.bootstrap) return;
      image.src = button.dataset.image; image.alt = button.dataset.caption;
      title.textContent = button.dataset.caption; caption.textContent = button.dataset.caption;
      bootstrap.Modal.getOrCreateInstance(document.getElementById('imageModal')).show();
    });
  });
});
