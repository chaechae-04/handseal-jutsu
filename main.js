let video = document.getElementById('webcam');
let currentIn = document.getElementById('current-in');
let statusEl = document.getElementById('status');
const stackDisplay = document.getElementById('stack-display');
const resetBtn = document.getElementById('reset-stack');

// 모델 인식용 영어 이름
const sequence = [
  'rabbit','goat','monkey','pig','horse','dog',
  'cow','snake','chicken','mouse','dragon','tiger'
];

// 스택에 표시할 한글/한자 이름
const sequenceDisplay = [
  '토끼','염소','원숭이','돼지','말','개',
  '소','뱀','닭','쥐','용','호랑이'
];

let step = 0;
let holdTime = 0;
const HOLD_THRESHOLD = 2000;
let wrongFrames = 0;
const MAX_WRONG_FRAMES = 10;

let classifier;
let lastTime = performance.now();
let lastLabel = '';
let stableFrames = 0;
const REQUIRED_FRAMES = 5;
const CONFIDENCE_THRESHOLD = 0.6;

let successTimer = 0;
const SUCCESS_DISPLAY = 800;

// 인술 스택
let inStack = [];

// 화둔호화구 조건 (마지막 7개)
const fireballSequence = ['뱀','염소','원숭이','돼지','말','호랑이'];

// 리셋 버튼
resetBtn.addEventListener('click', () => {
  inStack = [];
  updateStackDisplay();
});

// 스택 UI 갱신
function updateStackDisplay(){
  stackDisplay.innerText = `스택: [${inStack.join(', ')}]`;
}

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
      requestAnimationFrame(predictLoop);
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
      const label = results[0].label.toLowerCase();
      const confidence = results[0].confidence;

      if(confidence < CONFIDENCE_THRESHOLD){
        currentIn.innerText = "현재 인: ❌ 인식 실패";
        statusEl.innerText = "상태: 대기 중";
        statusEl.className = '';
        holdTime = 0;
        wrongFrames = 0;
      } else {
        handlePrediction(label, deltaTime);
      }

      requestAnimationFrame(predictLoop);
    })
    .catch(err => {
      console.error(err);
      statusEl.innerText = "모델 예측 오류 발생";
      requestAnimationFrame(predictLoop);
    });
}

// 인술 판단 및 완료 처리
function handlePrediction(predictedLabel, deltaTime){
  // label 안정화 (UI용)
  if(predictedLabel === lastLabel){
    stableFrames++;
  } else {
    stableFrames = 1;
    lastLabel = predictedLabel;
  }

  if(stableFrames >= REQUIRED_FRAMES){
    currentIn.innerText = `현재 인: ${predictedLabel}`;
  }

  // 성공 표시 유지 중이면 holdTime 증가/초기화 무시
  if(successTimer > 0){
    successTimer -= deltaTime;
    if(successTimer <= 0){
      statusEl.innerText = '상태: 대기 중';
      statusEl.className = '';
    }
    return;
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
      holdTime = Math.max(holdTime - deltaTime, 0);
      statusEl.innerText = '상태: 대기 중';
      statusEl.className = '';
      wrongFrames = 0;
    }
  }

  // 완료 체크
  if(holdTime >= HOLD_THRESHOLD){
    completeIn(sequence[step], sequenceDisplay[step]);
    step = (step + 1) % sequence.length;
    holdTime = 0;
    successTimer = SUCCESS_DISPLAY;
  }
}

// 완료된 인술 처리 + 스택 쌓기 + 화둔호화구 발동
function completeIn(inName, displayName){
  statusEl.innerText = '상태: ✅ 성공!';
  statusEl.className = 'success';

  // 스택에 넣기
  inStack.push(displayName);
  updateStackDisplay();

  // 화둔호화구 발동 체크
  if(inStack.length >= fireballSequence.length){
    const last7 = inStack.slice(-fireballSequence.length);
    if(last7.join(',') === fireballSequence.join(',')){
      statusEl.innerText = '🔥 화둔 호화구의 술 발동! 🔥';
      showFireball();
    }
  }

  // 2초 뒤 상태 초기화
  setTimeout(() => {
    statusEl.innerText = '상태: 대기 중';
    statusEl.className = '';
  }, 2000);
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
