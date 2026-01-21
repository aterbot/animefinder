// 10 QUESTIONS
const questions = [
  { q: "What type of anime do you like?", options: ["Action", "Romance", "Comedy", "Dark"] },
  { q: "How long should the anime be?", options: ["Short (12-24 eps)", "Medium (25-49 eps)", "Long (50+ eps)"] },
  { q: "Do you like emotional stories?", options: ["Yes", "No"] },
  { q: "Do you prefer a serious or light-hearted tone?", options: ["Serious", "Light"] },
  { q: "Do you like fantasy settings?", options: ["Yes", "No"] },
  { q: "Do you prefer modern-day or historical setting?", options: ["Modern", "Historical"] },
  { q: "Do you enjoy romance subplots?", options: ["Yes", "No"] },
  { q: "Do you like action-packed fights?", options: ["Yes", "No"] },
  { q: "Do you enjoy psychological themes?", options: ["Yes", "No"] },
  { q: "Do you prefer anime targeted for teens or adults?", options: ["Teens", "Adults"] }
];

let currentQuestion = 0;
let selectedTag = ""; // first question decides main genre

// ELEMENTS
const intro = document.getElementById("intro");
const startBtn = document.getElementById("startBtn");
const quiz = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const result = document.getElementById("result");
const animeList = document.getElementById("animeList");
const restartBtn = document.getElementById("restartBtn");

// START QUIZ
startBtn.addEventListener("click", () => {
  intro.style.display = "none";
  quiz.style.display = "block";
  currentQuestion = 0;
  selectedTag = "";
  showQuestion();
});

// SHOW QUESTION
function showQuestion() {
  const q = questions[currentQuestion];
  questionEl.textContent = q.q;
  optionsEl.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      if (currentQuestion === 0) selectedTag = opt; // first question decides main tag
      nextQuestion();
    });
    optionsEl.appendChild(btn);
  });
}

// NEXT QUESTION
function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    quiz.style.display = "none";
    fetchAnime(selectedTag);
  }
}

// FETCH ANIME FROM AniList
async function fetchAnime(tag) {
  result.style.display = "block";
  animeList.innerHTML = "<p>Loading...</p>";

  const query = `
  query ($genre: String) {
    Page(perPage: 6) {
      media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
        title { romaji }
        coverImage { large }
        averageScore
      }
    }
  }`;

  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { genre: tag.toUpperCase() } })
    });

    const data = await res.json();
    animeList.innerHTML = "";

    data.data.Page.media.forEach(anime => {
      const div = document.createElement("div");
      div.className = "anime-item";
      div.innerHTML = `
        <img src="${anime.coverImage.large}" />
        <div>
          <strong>${anime.title.romaji}</strong><br>
          ⭐ ${anime.averageScore || "N/A"}
        </div>
      `;
      animeList.appendChild(div);
    });
  } catch (err) {
    animeList.innerHTML = "<p>Error fetching anime. Try again.</p>";
    console.error(err);
  }
}

// RESTART
restartBtn.addEventListener("click", () => {
  result.style.display = "none";
  intro.style.display = "block";
});
