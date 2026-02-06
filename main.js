let video = document.getElementById('webcam');
let status = document.getElementById('status');

const sequence = ['인1','인2','인3','인4','인5','인6','인7'];
let step = 0;
let holdTime = 0;
const HOLD_THRESHOLD = 2000; // ms

// 웹캠 연결
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
    video.play();
    dummyClassify(); // 모델 없는 테스트용
  });

// 더미 분류 함수: 랜덤으로 인 출력
function dummyClassify(){
  const labels = ['인1','인2','인3','인4','인5','인6','인7'];
  const randomLabel = labels[Math.floor(Math.random()*labels.length)];
  checkPrediction(randomLabel, 100);
  requestAnimationFrame(dummyClassify);
}

// 시퀀스 체크
function checkPrediction(predictedLabel, deltaTime){
  if(predictedLabel === sequence[step]){
    holdTime += deltaTime;
    if(holdTime >= HOLD_THRESHOLD){
      step++;
      holdTime = 0;
      status.innerText = `${predictedLabel} 성공!`;
      if(step === sequence.length){
        status.innerText = "🔥 화둔 호화구의 술 발동! 🔥";
        showFireball();
        step = 0;
      }
    }
  } else {
    holdTime = 0;
    status.innerText = `현재 인: ${predictedLabel} (순서: ${step+1})`;
  }
}

// 간단한 불덩어리 애니메이션
function showFireball(){
  const canvas = document.getElementById('fireCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = 'orange';
  ctx.beginPath();
  ctx.arc(160,120,50,0,Math.PI*2);
  ctx.fill();
}
