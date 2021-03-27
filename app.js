const bird = document.querySelector('.bird');
const gameDisplay = document.querySelector('.game-container');
const ground = document.querySelector('.ground');
const scoreSection = document.querySelector('.inner-score');
const finalScoreSection = document.querySelector('.final-score');
const gameOverSection = document.querySelector('.game-over');

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

let score = 0;
let initialSpeed = 3;
let initialInterval = 2000;
let birdLeft = 40;
let birdBottom = 55;
let gravity = 0.4; 
isGameOver = false;
let audioIntensity = 0;

function startGame() {
    birdBottom -= gravity;
    bird.style.bottom = birdBottom + '%';
    bird.style.left = birdLeft + '%';

    score += 10;
    scoreSection.innerHTML = score;
}

let gameTimerId = setInterval(startGame, 20);


function jump(){
    if(birdBottom < 100 && audioIntensity > 20)
        birdBottom = Math.round(audioIntensity/1.1) + 20;
    bird.style.bottom = birdBottom + '%';
}

let jumpTimerId = setInterval(jump, 5);


// document.addEventListener('keyup', control);

function generateObstacle(){
    let obstacleLeft = 100;
    let randomHeight = Math.random() * (15 + 10) - 10;
    let obstacleBottom = randomHeight;
    const obstacle = document.createElement('div');
    if(!isGameOver)obstacle.classList.add('obstacle');
    gameDisplay.appendChild(obstacle);
    obstacle.style.left = obstacleLeft + '%';
    obstacle.style.bottom = obstacleBottom + '%';

    let obstracleTop = -(randomHeight + 10);
    const topObstacle = document.createElement('div');
    if(!isGameOver)topObstacle.classList.add('topObstacle');
    gameDisplay.appendChild(topObstacle);
    topObstacle.style.left = obstacleLeft + '%';
    topObstacle.style.top = obstracleTop + '%';
    
    function moveObstacle(){
        if(!isGameOver){
            obstacleLeft -= ((initialSpeed/screenWidth) *100);
            obstacle.style.left = obstacleLeft + '%';
            topObstacle.style.left = obstacleLeft + '%';
        }
        if(score%5000 == 0){
            initialSpeed += 0.5;
            initialInterval -= 200;
            gravity += 0.02;
        }
        if(obstacleLeft < -2){
            clearInterval(timerId);
            gameDisplay.removeChild(obstacle);
            gameDisplay.removeChild(topObstacle);
        }
        if( obstacleLeft > 40 && obstacleLeft < (40 + ((35/screenWidth) *100)) &&
           ( birdBottom < (obstacleBottom + 40 ) || birdBottom > (100 - 40 - obstracleTop) ) ||
            birdBottom < 15){
            clearInterval(timerId)
            gameOver();             
        }
    }
    let timerId = setInterval(moveObstacle, 20);
    if(!isGameOver) setTimeout(generateObstacle, initialInterval);
    
}
generateObstacle()

function gameOver(){
    clearInterval(gameTimerId);
    clearInterval(jumpTimerId);
    isGameOver = true;
    finalScoreSection.innerHTML = score;
    gameOverSection.style.display = 'flex';
}

// Audio Section ----------------------------

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

  if (navigator.getUserMedia) {
    navigator.getUserMedia({
        audio: true
      },
      function(stream) {
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
  
        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;
  
        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
  
        javascriptNode.onaudioprocess = function() {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            var values = 0;
  
            var length = array.length;
            for (var i = 0; i < length; i++) {
              values += (array[i]);
            }
  
            audioIntensity = values / length;
          } // end fn stream
      },
      function(err) {
        gameOver();
        if(err.name == 'NotAllowedError')
            gameOverSection.innerHTML = 'Allow Microphone Access from the Settings...';
        else gameOverSection.innerHTML = "Let the Developer Know the following Error: " + err.name;
      });
  } else {
    gameOver();
    gameOverSection.innerHTML = "getUserMedia not supported";
  }