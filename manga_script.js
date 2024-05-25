let topManga = [];
let winningManga;
let guessedTitles = new Set();

const searchBox = document.querySelector(".search-box");
const resultBox = document.querySelector(".result-box");
const inputBox = document.getElementById("input-box");
const guessDiv = document.querySelector(".guess"); 

fetchData();

function fetchData() {
    fetch('manga.json')
        .then(response => response.json())
        .then(data => {
            topManga = data.map(entry => ({
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
                num_chatpers: entry.node.num_chapters,
                num_volumes: entry.node.num_volumes,
            }));
            winningManga = localStorage.getItem('randomManga') === null ? chooseRandomManga() : loadWinner();
            saveWinner();
            loadGuesses();
        })
        .catch(error => console.error('Error fetching data:', error));
}

function chooseRandomManga() {
    return topManga[Math.floor(Math.random() * topManga.length)];
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
        result = topManga.filter((keyword) => {
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
    const selectedManga = topManga.find(manga => manga.name.toLowerCase() === guess.toLowerCase());
    if (selectedManga) {
        guessedTitles.add(guess.toLowerCase());
        const { name, image, alternative_titles, start_date, end_date, mean, rank, popularity, genres, media_type, status, num_chapters, num_volumes } = selectedManga;
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
        rankElement.style.backgroundColor = rank === winningManga.rank ? 'green' : 'red';
        if (rank !== winningManga.rank) {
            rankElement.innerHTML += rank > winningManga.rank ? ' &uarr;' : ' &darr;';
        }
        newGuess.appendChild(rankElement);

        const popularityElement = document.createElement('div');
        popularityElement.textContent = `${popularity}`;
        popularityElement.style.backgroundColor = popularity === winningManga.popularity ? 'green' : 'red';
        if (popularity !== winningManga.popularity) {
            popularityElement.innerHTML += popularity > winningManga.popularity ? ' &uarr;' : ' &darr;';
        }
        newGuess.appendChild(popularityElement);

        const meanElement = document.createElement('div');
        meanElement.textContent = `${mean}`;
        meanElement.style.backgroundColor = mean === winningManga.mean ? 'green' : 'red';
        if (mean !== winningManga.mean) {
            meanElement.innerHTML += mean > winningManga.mean ? ' &uarr;' : ' &darr;';
        } 
        newGuess.appendChild(meanElement);

        const mediaTypeElement = document.createElement('div');
        mediaTypeElement.textContent = `${media_type.split("_").join(" ")}`;
        mediaTypeElement.style.backgroundColor = media_type === winningManga.media_type ? 'green' : 'red';
        newGuess.appendChild(mediaTypeElement);

        const genresElement = document.createElement('div');
        genresElement.textContent = `${genres.join(', ')}`;
        const commonGenres = genres.filter(genre => winningManga.genres.includes(genre));
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
        startDateElement.style.backgroundColor = start_date === winningManga.start_date ? 'green' : 'red';
        const guessStartDate = start_date.split("-").map(time_period => parseInt(time_period));
        const winningStartDate = winningManga.start_date.split("-").map(time_period => parseInt(time_period));
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

        const statusElement = document.createElement('div');
        statusElement.textContent = `${status.split('_').join(' ')}`;
        if (status === winningManga.status) {
            statusElement.style.backgroundColor = 'green';
        } else {
            statusElement.style.backgroundColor = 'red';
        }
        newGuess.appendChild(statusElement);

        guessDiv.appendChild(newGuess);

        saveGuesses();

        if (name.toLowerCase() === winningManga.name.toLowerCase()) {
            searchBox.style.display = 'none'; // Hide the input box
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
    localStorage.setItem('guessedManga', JSON.stringify(guesses));
}

function loadGuesses() {
    const savedGuesses = JSON.parse(localStorage.getItem('guessedManga')) || [];
    savedGuesses.forEach(savedGuess => {
        guessedTitles.add(savedGuess.name);
        guessDiv.innerHTML = savedGuess.div;
    });
}

function saveWinner() {
    localStorage.setItem('randomManga', JSON.stringify(winningManga));
}

function loadWinner() {
    return JSON.parse(localStorage.getItem('randomManga'));
}


function resetMangaSection() {
    guessedTitles.clear();
    winningManga = chooseRandomManga();
    localStorage.clear();
    guessDiv.innerHTML = '';
    searchBox.style.display = 'block';
}
