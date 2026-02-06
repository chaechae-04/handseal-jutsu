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

// 완료된 인술 처리 + 스택 쌓기
function completeIn(inName, displayName){
  statusEl.innerText = '상태: ✅ 성공!';
  statusEl.className = 'success';

  // 스택에 넣기
  inStack.push(displayName);
  updateStackDisplay();

  // 스택 마지막 7개 확인
  if(inStack.length >= fireballSequence.length){
    const last7 = inStack.slice(-fireballSequence.length);
    if(last7.join(',') === fireballSequence.join(',')){
      // 화둔 호화구 발동
      statusEl.innerText = '🔥 화둔 호화구의 술 발동! 🔥';
      showFireball();
      // 발동 후 스택 초기화(원하면 일부만 지우고 이어갈 수도 있음)
      // inStack = [];
      // updateStackDisplay();
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
