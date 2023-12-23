const monster = document.querySelector(".monster");
const gameDisplay = document.querySelector(".game-container");
const ground = document.querySelector(".ground");
const scoreSection = document.querySelector(".inner-score");
const finalScoreSection = document.querySelector(".final-score");
const gameOverSection = document.querySelector(".game-over");
const restartButton = document.querySelector(".restart");

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const gameSettings = {
  score: 0,
  initialSpeed: 3,
  monsterBottom: 55,
  gravity: 0.4,
  isGameOver: false,
  gameTimerId: null,
};

const resetGame = () => {
  gameSettings.score = 0;
  gameSettings.initialSpeed = 3;
  gameSettings.monsterBottom = 55;
  gameSettings.gravity = 0.4;
  gameSettings.isGameOver = false;
  gameOverSection.style.display = "none";
  document.querySelectorAll(".obstacle").forEach((e) => e.remove());
  document.querySelectorAll(".topObstacle").forEach((e) => e.remove());
  requestAnimationFrame(moveObstacle);
  requestAnimationFrame(applyGravity);
  requestAnimationFrame(generateObstacle);
};

function applyGravity() {
  if (gameSettings.isGameOver) return;

  gameSettings.monsterBottom -= gameSettings.gravity;
  monster.style.bottom = gameSettings.monsterBottom + "%";
  gameSettings.score += 10;
  scoreSection.innerHTML = gameSettings.score;
  requestAnimationFrame(applyGravity);
}
requestAnimationFrame(applyGravity);
function moveObstacle() {
  if (gameSettings.isGameOver) return;

  document.querySelectorAll(".obstacle").forEach(move);
  document.querySelectorAll(".topObstacle").forEach(move);
  function move(element) {
    element.style.left = `${
      parseInt(element.style.left) - gameSettings.initialSpeed / screenWidth
    }%`;

    if (gameSettings.score % 5000 == 0) {
      gameSettings.initialSpeed += 0.5;
      //   gameSettings.gravity += 0.02;
    }
    if (parseInt(element.style.left) < 1) {
      element.remove();
    }
    if (
      (parseInt(element.style.left) > 40 &&
        parseInt(element.style.left) < 40 + (35 / screenWidth) * 100 &&
        (gameSettings.monsterBottom < parseInt(element.style.bottom) + 40 ||
          gameSettings.monsterBottom >
            100 - 40 - parseInt(element.style.top))) ||
      gameSettings.monsterBottom < 15
    ) {
      gameOver();
    }
  }
  requestAnimationFrame(moveObstacle);
}
requestAnimationFrame(moveObstacle);

let obstacleSeparation = 40;
function generateObstacle() {
  console.log(obstacleSeparation);
  if (gameSettings.isGameOver) return;
  if (obstacleSeparation > 40) {
    obstacleSeparation = 0;
    let obstacleLeft = 100;
    let randomHeight = Math.random() * (15 + 10) - 10;
    let obstacleBottom = randomHeight;
    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");
    gameDisplay.appendChild(obstacle);
    obstacle.style.left = obstacleLeft + "%";
    obstacle.style.bottom = obstacleBottom + "%";

    let obstracleTop = -(randomHeight + 10);
    const topObstacle = document.createElement("div");
    topObstacle.classList.add("topObstacle");
    gameDisplay.appendChild(topObstacle);
    topObstacle.style.left = obstacleLeft + "%";
    topObstacle.style.top = obstracleTop + "%";
  }
  obstacleSeparation++;
  requestAnimationFrame(generateObstacle);
}
requestAnimationFrame(generateObstacle);

function gameOver() {
  clearInterval(gameSettings.gameTimerId);
  gameSettings.isGameOver = true;
  finalScoreSection.innerHTML = gameSettings.score;
  gameOverSection.style.display = "flex";
}

// Audio Section ----------------------------

if (navigator.getUserMedia) {
  navigator.getUserMedia(
    {
      audio: true,
    },
    function (stream) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      javascriptNode.onaudioprocess = function () {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
          values += array[i];
        }

        audioIntensity = values / length;
        if (
          gameSettings.monsterBottom < 100 &&
          audioIntensity > 10 &&
          !gameSettings.isGameOver
        ) {
          gameSettings.monsterBottom = Math.min(
            Math.round(audioIntensity / 1.1) + 20,
            95
          );
          monster.style.bottom = gameSettings.monsterBottom + "%";
        }
      }; // end fn stream
    },
    function (err) {
      gameOver();
      if (err.name == "NotAllowedError")
        gameOverSection.innerHTML =
          "Allow Microphone Access from the Settings...";
      else
        gameOverSection.innerHTML =
          "Let the Developer Know the following Error: " + err.name;
    }
  );
} else {
  gameOver();
  gameOverSection.innerHTML = "getUserMedia not supported";
}

// Restart Button
restartButton.addEventListener("click", () => {
  resetGame();
});
