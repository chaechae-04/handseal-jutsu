# 🥷 HandSeal Jutsu
웹캠 기반 손 모션 인식으로 나루토 인술(인 결)을 수행하는 인터랙티브 웹 프로젝트

## 🎯 목표
- 웹캠으로 손 모양을 실시간 인식
- 나루토 인술의 '인'을 정확히 수행하면 분류
- MVP: **화둔 · 호화구의 술** 인식 성공

---

## 🔥 MVP 기능
- MediaPipe Hands 기반 손 관절 인식
- 인(손 모양) 룰 기반 판별
- 인술 순서(State Machine) 처리
- 성공 / 실패 이벤트 처리
- 현재 인 가이드 이미지 + 사용자 인식 결과 표시

---

## 🛠 Tech Stack
- Next.js (App Router)
- TypeScript
- MediaPipe Hands
- Canvas API
- Tailwind CSS

---

## 🗓 개발 일정 (3 Days Sprint)

### Day 1 – 프로젝트 세팅 & 손 인식
- [ ] Next.js 프로젝트 생성
- [ ] GitHub 레포 연결
- [ ] 웹캠 스트림 연결
- [ ] MediaPipe Hands 세팅
- [ ] 손 관절 21개 시각화

### Day 2 – 인 판별 & 상태 머신
- [ ] 인(손 모양) 타입 정의
- [ ] 손가락 펴짐/접힘 판별 유틸
- [ ] 인 판별 로직 구현
- [ ] 인술 상태 머신 구현
- [ ] 실패 시 초기화 처리

### Day 3 – 화둔 완성 & UX
- [ ] 화둔: 호화구의 술 인 정의
- [ ] 인 순서 연결
- [ ] 성공 / 실패 문구 이벤트
- [ ] 가이드 인 이미지 표시
- [ ] 전체 흐름 정리 및 리팩토링

---

## 🖥 실행 방법
```bash
npm install
npm run dev
