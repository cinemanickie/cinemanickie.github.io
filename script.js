const STEP = 25;
let showHistoric = false;
let visibleCount = STEP;
let scheduleData = [];

const container = document.getElementById('movies-container');
const toggleBtn = document.getElementById('historic-btn');
const recentBtn = document.getElementById('recent-btn');
const showMoreBtn = document.getElementById('show-more-btn');
const overlay = document.getElementById('popup-overlay');

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
	const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
	return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getFilteredData(schedule) {
	const today = new Date().toLocaleDateString('en-CA');
	let filtered = showHistoric ? schedule : schedule.filter(day => day.date >= today);
	return filtered.sort((a, b) => a.date.localeCompare(b.date));
}

function renderPopUp(movie) {
	const content = document.getElementById('popup-content');
	const releaseYear = movie.year.split('-')[0];
	const genres = movie.genres ? movie.genres.join(', ') : 'N/A';

	content.innerHTML = `
		<div class="popup-header">
			<img src="${movie.poster}" alt="${movie.title} poster" class="poster"
				onerror="this.onerror=null;this.src='images/poster-placeholder.jpg';">
			<div class="popup-meta">
				<h3>${movie.title} (${releaseYear})</h3>
				<p><strong>Genres:</strong> ${genres}</p>
				${movie.rating ? `<p><strong>Rating:</strong> ${movie.rating}</p>` : ''}
			</div>
		</div>
		${movie.overview ? `<div class="popup-overview"><p>${movie.overview}</p></div>` : ''}
	`;
	overlay.classList.remove('hidden');
}

function renderMovies(schedule) {
	const filteredData = getFilteredData(schedule);
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
			const genres = movie.genres ? movie.genres.join(', ') : 'N/A';
			const releaseYear = movie.year.split('-')[0];
			const ratingDiv = movie.rating ? `<div class="movie-rating">Rating: ${movie.rating}</div>` : '';

			movieDiv.innerHTML = `
				<img src="${movie.poster}" alt="${movie.title} poster" class="poster"
					onerror="this.onerror=null;this.src='images/poster-placeholder.jpg';">
				<div class="movie-info">
					<div class="movie-title">${movie.title} (${releaseYear})</div>
					<div class="movie-genres"><strong>Genres:</strong> ${genres}</div>
					${ratingDiv}
				</div>
			`;

			movieDiv.addEventListener('click', () => renderPopUp(movie));
			dateDiv.appendChild(movieDiv);
		});
		
		container.appendChild(dateDiv);
	});

	recentBtn.style.display = showHistoric ? 'block' : 'none';
	showMoreBtn.style.display = visibleCount >= filteredData.length ? 'none' : 'block';
}

function renderAnnouncement(announcements) {
	const wrapper = document.querySelector('.announcement');
	const list = document.querySelector('.announcement-list');

	list.innerHTML = '';

	if (!announcements || announcements.length === 0) {
		wrapper.style.display = 'none';
		return;
	}

	wrapper.style.display = 'block';

	announcements.forEach(item => {
		const line = document.createElement('p');
		line.className = 'announcement-item';

		line.innerHTML = `
			${item.title ? `<strong>${item.title}:</strong> ` : ''}
			${item.message || ''}
		`;

		list.appendChild(line);
	});
}

function handleShowMore() {
	visibleCount += STEP;
	renderMovies(scheduleData);
}

function handleToggleHistoric() {
	showHistoric = !showHistoric;
	toggleBtn.textContent = showHistoric ? 'Upcoming' : 'Historic';
	visibleCount = STEP;
	renderMovies(scheduleData);
}

function handleMostRecent() {
	const today = new Date().toLocaleDateString('en-CA');
	const filtered = getFilteredData(scheduleData);
	const firstUpcomingIndex = filtered.findIndex(day => day.date >= today);
	const targetIndex = firstUpcomingIndex === -1 ? filtered.length - 1 : firstUpcomingIndex - 1;

	if (targetIndex < 0) return;

	while (visibleCount <= targetIndex) visibleCount += STEP;

	renderMovies(scheduleData);

	setTimeout(() => {
		const blocks = document.querySelectorAll('.date-block');
		const targetBlock = blocks[targetIndex];
		if (targetBlock) targetBlock.scrollIntoView({ behavior: 'smooth' });
	}, 100);
}


fetch('movies.json')
	.then(res => res.json())
	.then(data => {
		scheduleData = data.schedule;
		renderAnnouncement(data.announcements);
		renderMovies(data.schedule);
	})
	.catch(err => console.error('Error loading movies.json:', err));

showMoreBtn.addEventListener('click', handleShowMore);
toggleBtn.addEventListener('click', handleToggleHistoric);
recentBtn.addEventListener('click', handleMostRecent);
overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.add('hidden'); });


/*
fetch('movies.json')
  .then(response => response.json())
  .then(data => {
	let allData = data;
	
    const container = document.getElementById('movies-container');
	const toggleBtn = document.getElementById('historic-btn');
	const recentBtn = document.getElementById('recent-btn');
	const showMoreBtn = document.getElementById('show-more-btn');

	const overlay = document.getElementById('popup-overlay');
	//const closeBtn = document.getElementById('popup-close');

	let showHistoric = false;
	const STEP = 25;
	let visibleCount = STEP;

	
	
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

		recentBtn.style.display = showHistoric ? 'block' : 'none';
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
	
	recentBtn.addEventListener('click', () => {
		if (!showHistoric) {
			showHistoric = true;
			toggleBtn.textContent = "Upcoming";
		}

		const today = new Date().toLocaleDateString('en-CA');
		const sorted = getFilteredData();

		const firstUpcomingIndex = sorted.findIndex(day => day.date >= today);

		const targetIndex = firstUpcomingIndex === -1 ? sorted.length - 1 : firstUpcomingIndex - 1;

		if (targetIndex < 0) return;

		while (visibleCount <= targetIndex) {
			visibleCount += STEP;
		}
		
		renderMovies();

		setTimeout(() => {
			const blocks = document.querySelectorAll('.date-block');
			const targetBlock = blocks[targetIndex];

			if (targetBlock) {
				targetBlock.scrollIntoView({ behavior: 'smooth' });
			}
		}, 100);
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
*/
