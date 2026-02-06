let video = document.getElementById('webcam');
let currentIn = document.getElementById('current-in');
let statusEl = document.getElementById('status');

const sequence = ['뱀','염소','원숭이','돼지','말','호랑이'];
let step = 0;
let holdTime = 0;
const HOLD_THRESHOLD = 2000; // 2초 유지

let classifier;
let lastTime = performance.now();

// label 안정화
let lastLabel = '';
let stableFrames = 0;
const REQUIRED_FRAMES = 5; // 5프레임 연속 같아야 인정

const CONFIDENCE_THRESHOLD = 0.6; // 신뢰도 기준

// 모델 로드
ml5.imageClassifier('models/model.json')
  .then(c => {
    classifier = c;
    statusEl.innerText = "모델 로딩 완료. 웹캠 시작 중...";
    startWebcam();
  })
  .catch(err => {
    console.error(err);
    statusEl.innerText = "모델 로드 실패: 모델 파일 확인 필요";
  });

// 웹캠 시작
function startWebcam(){
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.play();
      predictLoop();
    })
    .catch(err => {
      console.error("웹캠 접근 실패:", err);
      statusEl.innerText = "웹캠 접근 실패: 권한 확인 필요";
    });
}

// 예측 루프
function predictLoop(){
  if(!classifier) return;

  const now = performance.now();
  const deltaTime = now - lastTime;
  lastTime = now;

  classifier.classify(video)
    .then(results => {
      const label = results[0].label;
      const confidence = results[0].confidence;

      if(confidence < CONFIDENCE_THRESHOLD){
        currentIn.innerText = "현재 인: ❌ 인식 실패";
        statusEl.innerText = "상태: 대기 중";
        statusEl.className = '';
        holdTime = 0;
      } else {
        checkPrediction(label, deltaTime);
      }

      requestAnimationFrame(predictLoop);
    })
    .catch(err => {
      console.error(err);
      statusEl.innerText = "모델 예측 오류 발생";
    });
}

// 시퀀스 체크
let successTimer = 0;
const SUCCESS_DISPLAY = 800; // 0.8초 동안 성공 상태 유지

function checkPrediction(predictedLabel, deltaTime){
  // label 안정화 (UI 표시용)
  if(predictedLabel === lastLabel){
    stableFrames++;
  } else {
    stableFrames = 1;
    lastLabel = predictedLabel;
  }

  if(stableFrames >= REQUIRED_FRAMES){
    currentIn.innerText = `현재 인: ${predictedLabel}`;
  }

  // 성공 표시 유지
  if(successTimer > 0){
    successTimer -= deltaTime;
    if(successTimer <= 0){
      statusEl.innerText = '상태: 대기 중';
      statusEl.className = '';
    }
    return; // 성공 유지 중에는 holdTime 증가/초기화 무시
  }

  // holdTime 누적
  if(predictedLabel === sequence[step]){
    holdTime += deltaTime;
    wrongFrames = 0;
    statusEl.innerText = '상태: 유지 중...';
    statusEl.className = '';
  } else {
    wrongFrames++;
    if(wrongFrames >= MAX_WRONG_FRAMES){
      holdTime = 0;
      statusEl.innerText = '상태: 대기 중';
      statusEl.className = '';
      wrongFrames = 0;
    }
  }

  // 완료 체크
  if(holdTime >= HOLD_THRESHOLD){
    step++;
    holdTime = 0;
    statusEl.innerText = '상태: ✅ 성공!';
    statusEl.className = 'success';
    successTimer = SUCCESS_DISPLAY; // 성공 표시 잠시 유지

    if(step === sequence.length){
      statusEl.innerText = '🔥 화둔 호화구의 술 발동! 🔥';
      showFireball();
      step = 0;
      successTimer = SUCCESS_DISPLAY;
    }
  }
}


// 불덩어리 애니메이션
function showFireball(){
  const canvas = document.getElementById('fireCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth || 480;
  canvas.height = video.videoHeight || 360;

  ctx.clearRect(0,0,canvas.width,canvas.height);
  let radius = 10;

  const anim = setInterval(() => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, radius, 0, Math.PI*2);
    ctx.fill();
    radius += 8;
    if(radius > Math.max(canvas.width, canvas.height)) clearInterval(anim);
  }, 50);
}
