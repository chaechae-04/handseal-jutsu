let video = document.getElementById('webcam');
let currentIn = document.getElementById('current-in');
let statusEl = document.getElementById('status');

const sequence = ['뱀','염소','원숭이','돼지','말','호랑이'];
let step = 0;
let holdTime = 0;
const HOLD_THRESHOLD = 2000; // 2초 유지

let classifier;

// 모델 로드
ml5.imageClassifier('models/model.json')
  .then(c => {
    classifier = c;
    statusEl.innerText = "모델 로딩 완료. 웹캠 시작 중...";
    startWebcam();
  })
  .catch(err => {
    console.error(err);
    statusEl.innerText = "모델 로드 실패, 더미 테스트로 전환";
    dummyClassify();
  });

// 웹캠 시작
function startWebcam(){
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.play();
      predictLoop();
    });
}

// 예측 루프
function predictLoop(){
  if(!classifier) return;
  classifier.classify(video).then(results => {
    const label = results[0].label;
    checkPrediction(label, 100);
    requestAnimationFrame(predictLoop);
  }).catch(() => {
    // 예외 시 더미 테스트
    dummyClassify();
  });
}

// 더미 분류 함수 (모델 없을 때)
function dummyClassify(){
  const labels = ['뱀','염소','원숭이','돼지','말','호랑이'];
  const randomLabel = labels[Math.floor(Math.random()*labels.length)];
  checkPrediction(randomLabel, 100);
  requestAnimationFrame(dummyClassify);
}

// 시퀀스 체크
function checkPrediction(predictedLabel, deltaTime){
  currentIn.innerText = `현재 인: ${predictedLabel}`;

  if(predictedLabel === sequence[step]){
    holdTime += deltaTime;
    statusEl.innerText = '상태: 유지 중...';
    statusEl.className = '';

    if(holdTime >= HOLD_THRESHOLD){
      step++;
      holdTime = 0;
      statusEl.innerText = '상태: ✅ 성공!';
      statusEl.className = 'success';

      if(step === sequence.length){
        statusEl.innerText = '🔥 화둔 호화구의 술 발동! 🔥';
        showFireball();
        step = 0;
      }
    }
  } else {
    if(holdTime > 0){
      statusEl.innerText = '상태: ❌ 실패';
      statusEl.className = 'fail';
    } else {
      statusEl.innerText = '상태: 대기 중';
      statusEl.className = '';
    }
    holdTime = 0;
  }
}

// 불덩어리 애니메이션
function showFireball(){
  const canvas = document.getElementById('fireCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);

  let radius = 10;
  const anim = setInterval(() => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(240,180,radius,0,Math.PI*2);
    ctx.fill();
    radius += 5;
    if(radius > 100) clearInterval(anim);
  }, 50);
}
