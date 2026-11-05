# Section 7 / 8 / 9 + Footer

## 구현 기준

- 대상: 기존 DRAFT.X 포트폴리오 하단에 수상 이력, 서비스 단계, 아카이브, 회사 정보 추가.
- 원본: https://draftx.co.kr/ 및 사용자가 제공한 데스크톱·태블릿·모바일 캡처 9장.
- 개발 규약: README.md, task-history/task.md, spec-kit/AGENTS.md. 규약 파일은 수정하지 않았다.
- 색: 기존 검정 / 흰색 / 회색 토큰을 사용하며 Signature 배경과 이메일 중괄호에 기존 연두 토큰을 적용했다.
- 서체: 기존 DM Sans, 한글 폴백, Anta 워드마크, 중괄호 폴백을 재사용했다. 새 폰트·라이브러리·CDN은 추가하지 않았다.
- 레이아웃: outer-box > inner-box > part-box 구조와 Flex를 유지했다.
- 큰 Awards와 DRAFT.X 워드마크, 정적인 연두 Signature 카드가 캡처의 시각적 위계를 유지한다.

```text
Section 7   캡션 ─ 제목 + (27) ─ 수상 표
Section 8   제목 ─ Essential | Signature | Masterpiece ─ PDF
Section 9   캡션 ─ 이미지 마퀴 ─ 영문 클로징 + 인용문 ─ TOP
Footer      회사 소개 ─ 이메일 ─ DRAFT.X ─ 저작권
```

## 변경 파일

- index.html: Section 7~9, 단일 Footer, 스타일 연결.
- css/tokens.css: 추가 영역의 시각 값과 1199 / 806px 반응형 토큰.
- css/components/closing-sections.css: 표, 카드, 마퀴, Footer, 버튼 상태 및 모션 감소 스타일.
- js/main.js: 아카이브 초기화 연결.
- js/modules/archive.js: 동일 이미지 세트 복제, 수동 정지, 포커스 중 정지, 화면 밖 및 숨긴 탭 정지.
- images/archive/*.webp: curr-task/009에서 확인한 원본 이미지 8장. 외부 이미지 핫링크 없음.
- task-history/task.md: 작업 이력 추가.

## 원본에서 확인한 값

- Awards: 데스크톱 166px / 600 / 1.1 / 자간 -0.04em. 카운트 44px / 500.
- 태블릿 Awards: 133px, 카운트 35px. 모바일 원본의 상한은 90px / 28px이며 좁은 폭에서는 clamp로 축소했다.
- Investment 제목: 데스크톱 40px / 500 / 44px. 카드 제목 22px / 700 / 24.2px.
- 카드: 데스크톱 최소 높이 316.64px, 패딩 20px, 아래 패딩 57px, 반경 10px, 카드 사이 20px. 콘텐츠가 길면 높이가 자연스럽게 늘어난다.
- 아카이브 카드의 서로 다른 폭·높이는 원본에서 읽은 비율을 기초로 했다. 데스크톱 세트가 표시 영역보다 짧아지는 경우를 막기 위해 1.06 배율을 적용했고 태블릿 / 모바일은 .9 / .8로 축소했다. 이동 시간 40초는 이번 구현의 조정값이다.
- PDF: 원본의 Google Drive 링크. 새 창 안내 및 noopener/noreferrer 적용.
- 이메일: draftx.co@gmail.com. 저작권 연도 2026 고정.

## 요청 우선 적용 및 가정

- 사용자 지정 데스크톱 우선, max-width:1199px / max-width:806px을 적용했다. 이전 규약의 min-width 방식을 이번 영역에는 적용하지 않았다.
- Signature는 요청대로 항상 연두색이다. 이전 규약의 hover/focus 전용 상태를 사용하지 않았다.
- 데스크톱·태블릿은 히다랩 / 현대 한스톤 / 아모레퍼시픽 / LG그룹, 모바일은 히다랩 / 현대 한스톤 / LG그룹 / 한국은행이다. 행을 중복 작성하지 않고 필요한 행만 반응형으로 표시한다. 분류는 Awards / Brands로 정리했다.
- 마퀴 반복용 복제만 aria-hidden + inert 처리했다. 원본 콘텐츠는 한 번 읽힌다.
- 프로젝트 접근성 규약에 따라 마퀴 일시정지 버튼을 제공했다. 키보드 포커스 중 정지하며 prefers-reduced-motion에서는 애니메이션을 해제하고 가로 스크롤을 허용한다. JavaScript가 없어도 원본 목록을 가로 스크롤할 수 있다.
- 푸터 회색은 접근성 우선 규칙에 따라 #a6a6a6을 사용했다. 원본의 낮은 불투명도 회색보다 밝다. 이메일 링크는 회색, 중괄호만 연두색이다.
- 반응형 간격·hover/focus 값은 캡처를 참고한 조정값이며 원본 실측값으로 주장하지 않는다.
- curr-task/009에는 영상 없이 이미지 21개가 있었다. Section 9는 요청된 이미지 마퀴로 구현했다.
- 기존 TALK 버튼을 재사용하고 모바일 하단 위치를 실제 화면 가장자리로 맞췄다.

## 검증

- Windows Chrome에서 320 / 360 / 390 / 586 / 674 / 728 / 768 / 806 / 807 / 872 / 1024 / 1199 / 1200 / 1364 / 1440 / 1920px 확인.
- 모든 폭에서 가로 넘침 없음, 올바른 수상 4행, 1200px 기준 카드 3열 / 세로 스택, 워드마크 폭 확인. 320px부터 모바일 인용문 3줄과 반복 세트의 화면 폭 커버도 확인했다.
- 1440 / 600 / 390px 화면 캡처를 직접 확인했다.
- 이미지 8개 로딩, 동일한 두 반복 세트 폭, 세트가 화면 폭을 덮는지, 이동·일시정지·재생·포커스 정지, 모션 감소에서 정지, TOP의 scrollY 0 복귀 확인.
- 단일 h1 / main / footer, 새 영역 제목 구조, 로컬 자산 누락 및 페이지 JavaScript·콘솔 오류 없음.
- JavaScript 비활성 상태에서 수상 4행 / 카드 3개 / 원본 이미지 세트 표시 확인.
- JavaScript 문법 검사 및 기존 Section 1~6 콘텐츠 보존 확인.
- 실제 iOS / Android 기기, Safari / Firefox, Lighthouse 점수는 측정하지 않았다.

## 적용

ZIP의 Vibe-project-2026-jayomi 폴더 안 파일을 기존 프로젝트 루트에 같은 경로로 덮어쓴다.
기존 images, css, js 등 다른 파일은 유지한다. 이번 ZIP은 수정·추가 파일만 포함하는 덮어쓰기 패키지다.
ES 모듈을 사용하므로 기존처럼 로컬 웹 서버로 index.html을 연다.
