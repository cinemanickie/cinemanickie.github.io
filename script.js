const STEP = 25;
let showHistoric = false;
let visibleCount = STEP;
let scheduleData = [];
let announcementsData = [];

const container = document.getElementById('movies-container');
const showMoreBtn = document.getElementById('show-more-btn');
const announcementBtn = document.getElementById('announcement-btn');
const scrollTopBtn = document.getElementById('scroll-top-btn');
const overlay = document.getElementById('popup-overlay');
const popupContent = document.getElementById('popup-content');

let currentTab = 'upcoming';

function getReleaseYear(yearStr) {
    return yearStr.split('-')[0];
}

function formatGenres(genres) {
    return genres && genres.length ? genres.join(', ') : 'N/A';
}

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

function showPopup(html) {
    popupContent.innerHTML = html;
    overlay.classList.remove('hidden');
}

function renderPopUp(movie) {
	const releaseYear = getReleaseYear(movie.year);
	const genres = formatGenres(movie.genres);

	const html = `
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
	
	showPopup(html);
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

	showMoreBtn.style.display = visibleCount >= filteredData.length ? 'none' : 'block';
}

function showAnnouncements(announcements) {
	let html = `<h3>Announcements</h3>`;

	if (!announcements || announcements.length === 0) {
		html += '<p>No announcements at this time.</p>';
	} else {
		html += '<div class="popup-overview">';
		html += announcements.map(item => {
			let iconHtml = item.icon
                ? `<img src="icons/${item.icon}.png" alt="${item.icon}" class="logo-${item.icon}"> `
                : '';
			let titleLine = item.title ? `<p>${iconHtml}<strong>${item.title}</strong></p>` : '';
			let messageLine = item.message ? `<p>${item.message}</p>` : '';
			return titleLine + messageLine;
		}).join('');
		html += '</div>';
	}

	showPopup(html);
}

function handleShowMore() {
	visibleCount += STEP;
	renderMovies(scheduleData);
}

function setTab(tabName) {
	currentTab = tabName;
	showHistoric = tabName === 'history';
	visibleCount = STEP;
	renderMovies(scheduleData);
}

function scrollToMostRecent() {
	const today = new Date().toLocaleDateString('en-CA');
	const filtered = getFilteredData(scheduleData);
	const firstUpcomingIndex = filtered.findIndex(day => day.date >= today);
	const targetIndex = firstUpcomingIndex === -1 ? filtered.length - 1 : firstUpcomingIndex - 1;

	if (targetIndex < 0) return;
	while (visibleCount <= targetIndex) visibleCount += STEP;

	renderMovies(scheduleData);

	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			const blocks = document.querySelectorAll('.date-block');
			const targetBlock = blocks[targetIndex];
			if (targetBlock) targetBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});
}

document.querySelectorAll('.tab').forEach(tab => {
	tab.addEventListener('click', () => {
		const tabName = tab.dataset.tab;
		const now = Date.now();

		if (tabName === 'history' && currentTab === 'history') {
			scrollToMostRecent();
			return;
        }

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        setTab(tabName);
	});
});

overlay.addEventListener('click', (e) => {
	if (e.target === overlay) overlay.classList.add('hidden');
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});


fetch('movies.json')
	.then(res => res.json())
	.then(data => {
		scheduleData = data.schedule;
		announcementsData = data.announcements || [];
		renderMovies(data.schedule);
	})
	.catch(err => console.error('Error loading movies.json:', err));

showMoreBtn.addEventListener('click', handleShowMore);

announcementBtn.addEventListener('click', () => {
	showAnnouncements(announcementsData);
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

scrollTopBtn.style.display = 'none';
