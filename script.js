let questions = [];
let currentIndex = 0;
let score = 0;
let correct = 0;
let wrong = 0;
let timer;
let timeLeft = 15;
let playerName = "Guest";

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const questionText = document.getElementById("question-text");
const optionsDiv = document.getElementById("options");
const timerElement = document.getElementById("timer");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const nextBtn = document.getElementById("next-btn");
const finalScore = document.getElementById("final-score");
const scoreDetails = document.getElementById("score-details");
const leaderboard = document.getElementById("leaderboard");

async function startQuiz() {
  playerName = document.getElementById("player-name").value || "Guest";
  const category = document.getElementById("category").value;
  const difficulty = document.getElementById("difficulty").value;

  const url = `https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    questions = data.results.map(q => ({
      q: decodeHTML(q.question),
      opts: shuffle([...q.incorrect_answers, q.correct_answer]),
      ans: decodeHTML(q.correct_answer)
    }));
  } catch (err) {
    alert("⚠️ Error loading questions. Using fallback set.");
    questions = [
      { q: "What does HTML stand for?", opts: ["HyperText Markup Language", "HighText Machine Language", "Hyper Tool Multi Language", "None"], ans: "HyperText Markup Language" },
      { q: "Which is a JS Framework?", opts: ["React", "Laravel", "Django", "Flask"], ans: "React" }
    ];
  }

  currentIndex = 0;
  score = 0;
  correct = 0;
  wrong = 0;

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  loadQuestion();
}

function loadQuestion() {
  resetState();
  let q = questions[currentIndex];
  questionText.textContent = q.q;
  progressText.textContent = `${currentIndex + 1} / ${questions.length}`;
  progressFill.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;

  q.opts.forEach(opt => {
    const btn = document.createElement("button");
    btn.classList.add("option-btn");
    btn.textContent = decodeHTML(opt);
    btn.onclick = () => selectOption(opt, q.ans, btn);
    optionsDiv.appendChild(btn);
  });

  startTimer();
}

function resetState() {
  clearInterval(timer);
  timeLeft = 15;
  timerElement.textContent = `⏱ ${timeLeft}`;
  optionsDiv.innerHTML = "";
  nextBtn.disabled = true;
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `⏱ ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      showAnswer(null, questions[currentIndex].ans);
    }
  }, 1000);
}

function selectOption(selected, correctAns, btn) {
  clearInterval(timer);
  const allBtns = document.querySelectorAll(".option-btn");
  allBtns.forEach(b => b.disabled = true);

  if (selected === correctAns) {
    btn.classList.add("correct");
    score++;
    correct++;
  } else {
    btn.classList.add("wrong");
    wrong++;
    allBtns.forEach(b => {
      if (b.textContent === correctAns) b.classList.add("correct");
    });
  }

  nextBtn.disabled = false;
}

function showAnswer(_, correctAns) {
  const allBtns = document.querySelectorAll(".option-btn");
  allBtns.forEach(b => {
    b.disabled = true;
    if (b.textContent === correctAns) b.classList.add("correct");
  });
  nextBtn.disabled = false;
  wrong++;
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  finalScore.textContent = `${playerName}, your score is ${score} / ${questions.length}`;
  scoreDetails.textContent = `✅ Correct: ${correct}, ❌ Wrong: ${wrong}`;

  saveLeaderboard(playerName, score);
  renderLeaderboard();
}

function restartQuiz() {
  startQuiz();
}

function goHome() {
  resultScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
}

function saveLeaderboard(name, newScore) {
  let scores = JSON.parse(localStorage.getItem("quizScores")) || [];
  scores.push({ name, score: newScore });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 5);
  localStorage.setItem("quizScores", JSON.stringify(scores));
}

function renderLeaderboard() {
  let scores = JSON.parse(localStorage.getItem("quizScores")) || [];
  leaderboard.innerHTML = scores.map((s, i) => `<li>${i + 1}. ${s.name} - ${s.score} pts</li>`).join("");
}

function decodeHTML(html) {
  let txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
