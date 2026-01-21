let currentQuestion = 0;

let userProfile = {
  action: 0,
  romance: 0,
  dark: 0,
  comedy: 0
};

const genreMap = {
  action: "Action",
  romance: "Romance",
  dark: "Psychological",
  comedy: "Comedy"
};

const questions = [
  {
    q: "What do you enjoy the most?",
    options: [
      { text: "🔥 Intense fights", scores: { action: 3 } },
      { text: "💔 Emotional stories", scores: { romance: 3 } },
      { text: "🌑 Dark themes", scores: { dark: 3 } },
      { text: "😂 Comedy", scores: { comedy: 3 } }
    ]
  },
  {
    q: "Pick a vibe:",
    options: [
      { text: "Fast & hype", scores: { action: 2 } },
      { text: "Deep & emotional", scores: { romance: 2 } },
      { text: "Serious & dark", scores: { dark: 2 } },
      { text: "Chill & funny", scores: { comedy: 2 } }
    ]
  },
  {
    q: "How dark can it get?",
    options: [
      { text: "Very dark", scores: { dark: 3 } },
      { text: "Moderate", scores: { dark: 1 } },
      { text: "Keep it light", scores: {} }
    ]
  },
  {
    q: "Comedy level?",
    options: [
      { text: "A lot 😂", scores: { comedy: 3 } },
      { text: "Some", scores: { comedy: 1 } },
      { text: "None", scores: {} }
    ]
  }
];

document.getElementById("nextBtn").onclick = nextQuestion;

function startQuiz() {
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");
  loadQuestion();
}

function loadQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("question").innerText = q.q;
  updateProgress();

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach(option => {
    const div = document.createElement("div");
    div.className = "option";
    div.innerText = option.text;
    div.onclick = () => selectOption(option.scores);
    optionsDiv.appendChild(div);
  });
}

function updateProgress() {
  const progress = (currentQuestion / questions.length) * 100;
  document.getElementById("progress-bar").style.width = progress + "%";
}

function selectOption(scores) {
  for (let key in scores) {
    userProfile[key] += scores[key];
  }
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    getRecommendations();
  }
}

/* =========================
   SMART RECOMMENDATION
========================= */

async function getRecommendations() {
  document.getElementById("quiz").innerHTML =
    "<p>Analyzing your taste… 🎯</p>";

  const topPrefs = Object.entries(userProfile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  let allAnime = [];

  for (let [pref] of topPrefs) {
    const anime = await fetchAnimeByGenre(genreMap[pref]);
    allAnime.push(...anime);
  }

  const scored = scoreAnime(allAnime);
  showResults(scored.slice(0, 6));
}

async function fetchAnimeByGenre(genre) {
  const query = `
  query ($genre: String) {
    Page(perPage: 10) {
      media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
        id
        title { romaji }
        genres
        averageScore
        coverImage { large }
      }
    }
  }`;

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { genre }
    })
  });

  const data = await res.json();
  return data.data.Page.media;
}

function scoreAnime(animeList) {
  const unique = {};

  animeList.forEach(anime => {
    if (!unique[anime.id]) {
      let score = anime.averageScore || 50;

      anime.genres.forEach(g => {
        for (let key in genreMap) {
          if (genreMap[key] === g) {
            score += userProfile[key] * 5;
          }
        }
      });

      unique[anime.id] = { ...anime, finalScore: score };
    }
  });

  return Object.values(unique).sort(
    (a, b) => b.finalScore - a.finalScore
  );
}

/* =========================
   RESULTS + RESTART
========================= */

function showResults(animeList) {
  const resultDiv = document.getElementById("result");
  resultDiv.classList.remove("hidden");

  resultDiv.innerHTML = `
    <h2>Your Anime Matches 🎌</h2>
    <button onclick="restartQuiz()">Restart Quiz 🔄</button>
  `;

  animeList.forEach(anime => {
    resultDiv.innerHTML += `
      <div class="result-card">
        <img src="${anime.coverImage.large}">
        <div class="result-info">
          <strong>${anime.title.romaji}</strong>
          ⭐ ${anime.averageScore || "N/A"}
        </div>
      </div>
    `;
  });
}

function restartQuiz() {
  currentQuestion = 0;
  userProfile = { action: 0, romance: 0, dark: 0, comedy: 0 };

  document.getElementById("result").classList.add("hidden");
  document.getElementById("intro").classList.remove("hidden");
}
