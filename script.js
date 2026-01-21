const questions = [
  {
    text: "What kind of anime do you prefer?",
    options: [
      { text: "Action", tag: "ACTION" },
      { text: "Romance", tag: "ROMANCE" },
      { text: "Comedy", tag: "COMEDY" },
      { text: "Dark", tag: "PSYCHOLOGICAL" }
    ]
  },
  {
    text: "How long should the anime be?",
    options: [
      { text: "Short (12-24)", tag: "SHORT" },
      { text: "Long (50+)", tag: "LONG" }
    ]
  },
  {
    text: "Do you like emotional stories?",
    options: [
      { text: "Yes", tag: "DRAMA" },
      { text: "No", tag: "LIGHT" }
    ]
  }
];

let currentQuestion = 0;
let selectedTags = [];

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function startQuiz() {
  currentQuestion = 0;
  selectedTags = [];
  showScreen("quiz");
  loadQuestion();
}

function loadQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("question").innerText = q.text;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt.text;
    btn.onclick = () => {
      selectedTags.push(opt.tag);
      nextQuestion();
    };
    optionsDiv.appendChild(btn);
  });

  document.getElementById("progress-bar").style.width =
    ((currentQuestion) / questions.length) * 100 + "%";
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    document.getElementById("progress-bar").style.width = "100%";
    fetchAnime();
  }
}

async function fetchAnime() {
  showScreen("result");

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<h2>Your Anime Matches 🎌</h2>";

  const genre = selectedTags[0] || "ACTION";

  const query = `
    query {
      Page(perPage: 8) {
        media(type: ANIME, genre: "${genre}", sort: POPULARITY_DESC) {
          title { romaji }
          coverImage { large }
          averageScore
        }
      }
    }
  `;

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const data = await res.json();

  data.data.Page.media.forEach(anime => {
    resultDiv.innerHTML += `
      <div class="result-card">
        <img src="${anime.coverImage.large}">
        <div class="result-info">
          <strong>${anime.title.romaji}</strong><br>
          ⭐ ${anime.averageScore || "N/A"}
        </div>
      </div>
    `;
  });

  resultDiv.innerHTML += `<button style="margin-top:16px" onclick="restartQuiz()">Restart 🔄</button>`;
}

function restartQuiz() {
  showScreen("intro");
}
