fetch('movies.json')
  .then(response => response.json())
  .then(data => {
	let allData = data;
	
    const container = document.getElementById('movies-container');
	const toggleBtn = document.getElementById('historic-btn');
	const showMoreBtn = document.getElementById('show-more-btn');

	const overlay = document.getElementById('popup-overlay');
	//const closeBtn = document.getElementById('popup-close');

	let showHistoric = false;
	const STEP = 25;
	let visibleCount = STEP;

	function formatDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
		const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
		return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

	function getFilteredData() {
		// const today = new Date().toISOString().split('T')[0];
		const today = new Date().toLocaleDateString('en-CA');
		let filtered = showHistoric ? data : data.filter(day => day.date >= today);

		return filtered.sort((a, b) => a.date.localeCompare(b.date));
	}

	function renderMovies() {
		const filteredData = getFilteredData();
		container.innerHTML = '';

		filteredData.slice(0, visibleCount).forEach(day => {
			const dateDiv = document.createElement('div');
			dateDiv.className = 'date-block';

			const dateHeader = document.createElement('h2');
			dateHeader.textContent = formatDate(day.date);
			dateDiv.appendChild(dateHeader);

			day.movies.forEach(movie => {
			const movieDiv = document.createElement('div');
			movieDiv.className = 'movie';

			const genres = movie.genres ? movie.genres.join(", ") : "N/A";

			const releaseYear = movie.year.split('-')[0];

			const ratingDiv = movie.rating ? `<div class="movie-rating">Rating: ${movie.rating}</div>` : '';
        
			movieDiv.innerHTML = `
				<img src="${movie.poster}" alt="${movie.title} poster" class="poster" onerror="this.onerror=null; this.src='images/poster-placeholder.jpg';">
				<div class="movie-info">
				<div class="movie-title">${movie.title} (${releaseYear})</div>
				<div class="movie-genres"><strong>Genres:</strong> ${genres}</div>
				${ratingDiv}
				</div>
			`;

			dateDiv.appendChild(movieDiv);

			movieDiv.addEventListener('click', () => {
				const content = document.getElementById('popup-content');

				content.innerHTML = `
					<div class="popup-header">
						<img src="${movie.poster}"
						alt="${movie.title} poster"
						class="poster"
						onerror="this.onerror=null; this.src='images/poster-placeholder.jpg';">

						<div class="popup-meta">
						<h3>${movie.title} (${releaseYear})</h3>
						<p><strong>Genres:</strong> ${genres}</p>
						${movie.rating ? `<p><strong>Rating:</strong> ${movie.rating}</p>` : ''}
						</div>
					</div>
				
					${movie.overview ? `
					<div class="popup-overview">
						<p>${movie.overview}</p>
					</div>
					` : ''}
				`;

				overlay.classList.remove('hidden');
			});
			});

		container.appendChild(dateDiv);
		});

		showMoreBtn.style.display = visibleCount >= filteredData.length ? 'none' : 'block';
	}

	showMoreBtn.addEventListener('click', () => {
		visibleCount += STEP;
		renderMovies();
	});
	
	toggleBtn.addEventListener('click', () => {
		showHistoric = !showHistoric;
		toggleBtn.textContent = showHistoric ? "Upcoming" : "Historic";
		visibleCount = STEP;
		renderMovies();
	});

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			overlay.classList.add('hidden');
		}
	});

	renderMovies();
})
  .catch(error => {
    console.error('Error loading movies.json:', error);
  });

