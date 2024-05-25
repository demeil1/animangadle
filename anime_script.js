let topAnime = [];
let winningAnime;
let guessedTitles = new Set();

const searchBox = document.querySelector(".search-box");
const resultBox = document.querySelector(".result-box");
const inputBox = document.getElementById("input-box");
const guessDiv = document.querySelector(".guess");

fetchData();

function fetchData() {
    fetch('anime.json')
        .then(response => response.json())
        .then(data => {
            topAnime = data.map(entry => ({
                name: entry.node.title,
                image: entry.node.main_picture.medium,
                alternative_titles: entry.node.alternative_titles.synonyms,
                start_date: entry.node.start_date, 
                end_date: entry.node.end_date, 
                mean: entry.node.mean,
                rank: entry.node.rank,
                popularity: entry.node.popularity,
                genres: entry.node.genres.map(genre => genre.name),
                media_type: entry.node.media_type,
                status: entry.node.status,
                num_episodes: entry.node.num_episodes,
                studios: entry.node.studios.map(studio => studio.name),
            }));
            winningAnime = localStorage.getItem('randomAnime') === null ? chooseRandomAnime() : loadWinner();
            saveWinner();
            loadGuesses();
        })
        .catch(error => console.error('Error fetching anime list:', error));
}

function chooseRandomAnime() {
    return topAnime[Math.floor(Math.random() * topAnime.length)];
}

function formatDate(dateString) { 
    if (!dateString) return "Unknown";
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const [year, month, day] = dateString.split('-').map(time => parseInt(time));
    return `${months[month - 1]} ${day}, ${year}`;
}

inputBox.onkeyup = function() {
    let result = [];
    let input = inputBox.value;
    if (input.length) { 
        result = topAnime.filter((keyword) => {
            return keyword.name.toLowerCase().includes(input.toLowerCase()) && !guessedTitles.has(keyword.name.toLowerCase());
        });
    }
    display(result);
    if (!result.length) { 
        resultBox.innerHTML = '';
    }
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#39;");
}

function display(result) {
    const content = result.map((element) => {
        return `
            <li onclick=selectInput(this)>
                <img src="${escapeHTML(element.image)}" alt="${escapeHTML(element.name)}" />
                ${escapeHTML(element.name)}
            </li>
        `;
    });
    resultBox.innerHTML = "<ul>" + content.join('') + "</ul>";
}

function selectInput(list) {
    tryGuess(list.querySelector("img").alt);
}

inputBox.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        if (inputBox.value === "") {
            return;
        } else {
            selectInput(resultBox.querySelector("li"));
            event.preventDefault();
        }
    }
});

function tryGuess(guess) {
    if (guess === "") {
        return;
    } else if (guessedTitles.has(guess.toLowerCase())) {
        return;
    }
    const selectedAnime = topAnime.find(anime => anime.name.toLowerCase() === guess.toLowerCase());
    if (selectedAnime) {
        guessedTitles.add(guess.toLowerCase());
        const { name, image, alternative_titles, start_date, end_date, mean, rank, popularity, genres, media_type, status, num_episodes, studios } = selectedAnime;

        let newGuess = document.createElement('div');

        const imgElement = document.createElement('img');
        imgElement.src = image;
        imgElement.alt = name;
        imgElement.style.maxWidth = '100px';
        const divImgElement = document.createElement('div');
        divImgElement.appendChild(imgElement);
        newGuess.appendChild(divImgElement);

        const rankElement = document.createElement('div');
        rankElement.textContent = `${rank}`;
        rankElement.style.backgroundColor = rank === winningAnime.rank ? 'green' : 'red';
        if (rank !== winningAnime.rank) {
            rankElement.innerHTML += rank > winningAnime.rank ? ' &uarr;' : ' &darr;';
        }
        newGuess.appendChild(rankElement);

        const popularityElement = document.createElement('div');
        popularityElement.textContent = `${popularity}`;
        popularityElement.style.backgroundColor = popularity === winningAnime.popularity ? 'green' : 'red';
        if (popularity !== winningAnime.popularity) {
            popularityElement.innerHTML += popularity > winningAnime.popularity ? ' &uarr;' : ' &darr;';
        }
        newGuess.appendChild(popularityElement);

        const meanElement = document.createElement('div');
        meanElement.textContent = `${mean}`;
        meanElement.style.backgroundColor = mean === winningAnime.mean ? 'green' : 'red';
        if (mean !== winningAnime.mean) {
            meanElement.innerHTML += mean > winningAnime.mean ? ' &uarr;' : ' &darr;';
        }
        newGuess.appendChild(meanElement);

        const mediaTypeElement = document.createElement('div');
        mediaTypeElement.textContent = `${media_type.split("_").join(" ")}`;
        mediaTypeElement.style.backgroundColor = media_type === winningAnime.media_type ? 'green' : 'red';
        newGuess.appendChild(mediaTypeElement);

        const genresElement = document.createElement('div');
        genresElement.textContent = `${genres.join(', ')}`;
        const commonGenres = genres.filter(genre => winningAnime.genres.includes(genre));
        if (commonGenres.length === genres.length) {
            genresElement.style.backgroundColor = 'green';
        } else if (commonGenres.length > 0) {
            genresElement.style.backgroundColor = 'orange';
        } else {
            genresElement.style.backgroundColor = 'red';
        }
        newGuess.appendChild(genresElement);

        const startDateElement = document.createElement('div');
        startDateElement.textContent = `${formatDate(start_date)}`;
        startDateElement.style.backgroundColor = start_date === winningAnime.start_date ? 'green' : 'red';
        const guessStartDate = start_date.split("-").map(time_period => parseInt(time_period));
        const winningStartDate = winningAnime.start_date.split("-").map(time_period => parseInt(time_period));
        if (guessStartDate[0] > winningStartDate[0]) {
            startDateElement.innerHTML += ' &darr;';
        } else if (guessStartDate[0] < winningStartDate[0]) {
            startDateElement.innerHTML += ' &uarr;';
        } else {
            if (guessStartDate[1] > guessStartDate[1]) {
                startDateElement.innerHTML += ' &darr;';
            } else if (guessStartDate[1] > guessStartDate[1]) {
                startDateElement.innerHTML += ' &uarr;';
            } else {
                if (guessStartDate[2] > guessStartDate[2]) {
                    startDateElement.innerHTML += ' &darr;';
                } else if (guessStartDate[2] < guessStartDate[2]) {
                    startDateElement.innerHTML += ' &uarr;';
                }
            }
        }
        newGuess.appendChild(startDateElement);

        const studiosElement = document.createElement('div');
        studiosElement.textContent = `${studios.join(', ')}`;
        const commonStudios = studios.filter(studio => winningAnime.studios.includes(studio));
        if (commonStudios.length === studios.length) {
            studiosElement.style.backgroundColor = 'green';
        } else if (commonStudios.length > 0) {
            studiosElement.style.backgroundColor = 'orange';
        } else {
            studiosElement.style.backgroundColor = 'red';
        }
        newGuess.appendChild(studiosElement);

        guessDiv.appendChild(newGuess);

        saveGuesses();

        if (name.toLowerCase() === winningAnime.name.toLowerCase()) {
            searchBox.style.display = 'none'; 
        }
    } else {
        return;
    } 
    clearSearch(); 
}

function clearSearch() {
    inputBox.value = '';
    resultBox.innerHTML = ''; 
}

function saveGuesses() {
    const guesses = [...guessedTitles].map(title => ({
        name: title,
        div: guessDiv.innerHTML
    }));
    localStorage.setItem('guessedAnime', JSON.stringify(guesses));
}

function loadGuesses() {
    const savedGuesses = JSON.parse(localStorage.getItem('guessedAnime')) || [];
    savedGuesses.forEach(savedGuess => {
        guessedTitles.add(savedGuess.name);
        guessDiv.innerHTML = savedGuess.div;
    });
}

function saveWinner() {
    localStorage.setItem('randomAnime', JSON.stringify(winningAnime));
}

function loadWinner() {
    return JSON.parse(localStorage.getItem('randomAnime'));
}

function resetAnimeSection() {
    guessedTitles.clear();
    winningAnime = chooseRandomAnime();
    localStorage.clear();
    guessDiv.innerHTML = '';
    searchBox.style.display = 'block';
}
