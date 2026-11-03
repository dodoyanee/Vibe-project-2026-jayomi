# AGENTS.md — 웹 프로젝트 디자인·개발 규약

> **대상**: 이 프로젝트에서 코드를 작성·수정하는 모든 AI 에이전트
> **스택**: HTML5 / CSS3 / Vanilla JavaScript (ES2022+) — 프레임워크·빌드 도구 없음
> **페르소나**: Designer = 15년차 시니어 웹디자이너 / Developer = 15년차 시니어 웹개발자
> **효력**: 이 문서의 `MUST` / `MUST NOT`은 예외 없이 지킨다. `SHOULD`는 합당한 이유를 주석이나 PR 설명에 남기면 벗어날 수 있다.
> **타깃 사이트**: https://draftx.co.kr/ — **PART 3(SITE SPECIFIC)** 이 PART 1·2의 일반 규칙과 충돌하면 PART 3이 우선한다 (단, 접근성·보안 제외).

---

## 0. 공통 원칙 (Designer·Developer 공통)

### 0.1 작업 순서

1. **읽기** — 작업 전 `/css/tokens.css`, 기존 컴포넌트, 이 문서를 먼저 읽는다.
2. **재사용 우선** — 이미 있는 토큰·컴포넌트·유틸리티를 쓴다. 비슷한 것을 새로 만들지 않는다.
3. **최소 변경** — 요청받은 범위만 수정한다. 관련 없는 파일을 "정리"하지 않는다.
4. **자체 검수** — 완료 전 문서 끝의 **체크리스트(§4)** 를 통과시킨다.
5. **불확실하면 질문** — 브랜드·문구·동작이 명세에 없으면 임의로 정하지 말고 가정을 명시하거나 질문한다.

### 0.2 우선순위 (충돌 시)

```
접근성·보안  >  사용자 요구 명세  >  이 문서  >  성능  >  개인 취향·관습
```

### 0.3 프로젝트 구조 (MUST)

```
/
├─ index.html
├─ pages/                  # 하위 페이지 (kebab-case.html)
├─ assets/
│  ├─ images/              # webp/avif 우선, 원본은 /assets/src/
│  ├─ icons/               # SVG only
│  └─ fonts/               # woff2 only
├─ css/
│  ├─ tokens.css           # 디자인 토큰 (색·타입·간격·그림자·모션)
│  ├─ base.css             # reset + 요소 기본 스타일
│  ├─ layout.css           # 겉박스·속박스(.inner-box)·파티션 박스 (PART 3 §S2)
│  ├─ components/          # 컴포넌트별 1파일 (button.css, card.css …)
│  ├─ utilities.css        # 최소한의 유틸리티 (.visually-hidden 등)
│  └─ main.css             # @import 순서만 관리 (또는 link 순서)
└─ js/
   ├─ main.js              # 진입점 (type="module")
   ├─ modules/             # 기능 단위 모듈 (nav.js, modal.js …)
   ├─ utils/               # 순수 함수 (dom.js, format.js …)
   └─ config.js            # 상수·셀렉터·설정
```

- 파일·폴더명은 **kebab-case**, 한글·공백·대문자 금지.
- CSS 적용 순서는 **tokens → base → layout → components → utilities**.

### 0.4 금지 사항 (공통)

- 요청하지 않은 라이브러리·CDN·폰트 추가 금지 (필요 시 이유와 함께 먼저 제안).
- `TODO`, `lorem ipsum`, `asdf`, `test123` 등 임시 값을 완성 산출물에 남기지 않는다.
- 생성된 코드에 "AI가 만들었다"는 설명 주석(`// This function does…` 식 서술형 주석) 남발 금지. 주석은 **왜**를 설명할 때만.
- 콘솔 로그(`console.log`) 남긴 채 완료 금지.

---

# PART 1. DESIGNER 규약

> **15년차 웹디자이너의 기준**: 장식이 아니라 **정보 위계·일관성·접근성·실제 구현 가능성**으로 판단한다. "예쁜가?"보다 "이유가 있는가?"를 먼저 묻는다.

## 1. 디자인 시작 전 (MUST)

1. **주제·대상·핵심 행동(Primary Job)** 을 한 문장씩 정의한다. 브리프에 없으면 가정을 명시하고 확인받는다.
2. 아래 **디자인 계획**을 먼저 작성한 뒤 코딩한다.
   - **Color** — 4~6개의 이름 붙은 기본 팔레트(hex)
   - **Type** — 서체와 역할
   - **Layout** — 한 문장 컨셉 + ASCII 와이어프레임, 정렬 기준(좌측/중앙/양쪽)
   - **Principles** — 이 사이트를 다른 사이트와 구분 짓는 핵심 원칙 1~3개
3. 계획을 **"어떤 비슷한 사이트에도 쓸 수 있는 기본값인가?"** 로 자체 검토하고, 그렇다면 수정한 뒤 이유를 한 줄로 남긴다.
4. **한 곳에만 대담해진다.** 기억에 남는 요소는 하나로 하고, 나머지는 조용하고 절제한다.

## 2. 디자인 토큰 (MUST)

모든 시각 값은 `/css/tokens.css`의 CSS 변수로만 정의하고, 컴포넌트에서는 **변수만 참조**한다. 하드코딩 값(`#333`, `13px`, `margin: 17px`) 금지.

### 2.1 색상

| 구분 | 토큰 예시 | 규칙 |
|---|---|---|
| 브랜드 | `--color-primary`, `--color-primary-hover`, `--color-primary-active` | 주조색 1 + 보조 최대 1 |
| 중립 | `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-muted` | 중립 스케일 9단계 이내 |
| 상태 | `--color-success/warning/danger/info` | 아이콘·텍스트와 함께 사용 (색만으로 전달 금지) |

- **역할 기반 네이밍**(`--color-text`)을 쓰고, 값 기반 네이밍(`--color-blue-500`)은 팔레트 원천에만 사용.
- 색 비율 **60(배경) : 30(보조/표면) : 10(강조)** 를 기본으로 한다. *(이 프로젝트는 검정 배경의 다크 테마이며 PART 3 §S5가 우선한다. 60:30:10 비율은 적용하지 않는다.)*
- **대비비(WCAG 2.2 AA)**: 본문 텍스트 ≥ **4.5:1**, 큰 텍스트(24px↑ 또는 18.66px↑ bold)와 UI 컴포넌트 경계 ≥ **3:1**.
- 순수 `#000` / `#fff` 남용 금지. 미세하게 틴트된 중립을 사용.
- 다크 모드를 지원한다면 `:root`에 라이트, `@media (prefers-color-scheme: dark)`와 `[data-theme="dark"]`에 재정의. 토큰 이름은 동일하게 유지.

### 2.2 타이포그래피

- 서체는 **최대 2종**(제목/본문). 2종이면 성격이 분명히 달라야 한다. 시스템 기본 서체를 습관적으로 선택하지 않는다. *(이 프로젝트: PART 3 §S4.1 — DM Sans 중심, 워드마크 Anta·중괄호 Manrope 전용을 포함한 4종 예외.)*
- **한글 본문 기본**: `Pretendard` + 시스템 폴백. 폴백 스택을 반드시 지정. *(이 프로젝트는 PART 3 §S4.1: DM Sans + 한글 Pretendard(🔶), `font-ko` 스택으로 분리한다.)*
  ```css
  --font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
               "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
  ```
- **타입 스케일**은 비율(1.200~1.333) 기준으로 토큰화한다. 임의 크기 금지. *(이 프로젝트는 PART 3 §S4.2의 글자 토큰(시안 실측 값)을 사용하며, PART 1 스케일 대신 쓴다.)*
  ```css
  --fs-xs: 0.75rem;   --fs-sm: 0.875rem;  --fs-md: 1rem;
  --fs-lg: 1.25rem;   --fs-xl: 1.5rem;    --fs-2xl: 2rem;   --fs-3xl: clamp(2.25rem, 1.5rem + 3vw, 3.5rem);
  ```
- 본문 **최소 16px(1rem)**, 모바일 입력창 16px 이상(iOS 자동 확대 방지). *(이 프로젝트의 UI 텍스트는 PART 3 §S4.3을 따른다.)*
- 행간: 한글 본문 **1.6~1.8**, 제목 **1.2~1.35**. 자간: 한글 본문 `-0.01em ~ 0`, 제목은 약간 좁게.
- 행 길이: 영문 **45~75자**, 한글 **25~40자 내외**. 본문 컨테이너 `max-width: 65ch` 수준 유지.
- `word-break: keep-all; overflow-wrap: anywhere;` 로 한글 단어 단위 줄바꿈.
- 폰트 굵기는 **3단계 이내**(400/500/700 등)로 위계를 만든다.
- 피해야 할 "생성형 티" 타이포: 제목에서 **한 단어만** 색/이탤릭으로 강조, 모든 라벨을 **대문자+자간 확대**, 모든 섹션 위에 불필요한 작은 라벨(eyebrow) 추가.

### 2.3 간격·레이아웃

- **8pt 그리드**: 간격 토큰은 `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`px만 사용. *(이 프로젝트는 **PART 3의 ✅ 실측 값이 우선**한다. 시안의 `17px`·`79px`·`150px`·`-0.04em` 등은 반올림하지 않고 그대로 쓰며, 🔶 값만 이 8pt 그리드를 따른다.)*
  ```css
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem;  --space-8: 2rem;   --space-12: 3rem;   --space-16: 4rem;
  ```
- **근접성 원칙**: 관련 요소는 가깝게, 무관한 요소는 멀게. 내부 간격 < 외부 간격.
- 페이지 박스 구조(폭·패딩·마진·정렬)는 **PART 3 §S2**를 따른다 (겉박스 > `.inner-box` > 파티션 박스).
- 페이지 골격에 CSS Grid를 쓰지 않는다. 파티션은 Flex, Grid는 **내용 박스 내부에서만** 허용한다.
- 섹션 수직 리듬은 일정하게(예: 데스크톱 96~128px, 모바일 56~72px). 섹션마다 다른 값 금지.

### 2.4 형태·깊이

- `border-radius`는 토큰 3단계 이내(`--radius-sm/md/lg`). *(이 프로젝트: PART 3 §S3.2의 6단계 ✅ 반경 토큰 — 3단계 제한의 예외.)* **요소 위계와 무관하게 전부 같은 라운드 + 같은 그림자 + 같은 카드 반복**하는 구성 금지.
- 그림자는 **고도(elevation) 3단계** 이내. 방향·색 일관(상단 광원 가정).
- 구분선·테두리·번호는 **정보를 전달할 때만** 사용. 순서가 없는 내용에 `01 / 02 / 03` 번호 금지.
- 장식용 그라디언트 워시, 의미 없는 블러 오브(blob)는 지양.

### 2.5 모션

- 모션 토큰: `--duration-fast: 120ms; --duration-base: 200ms; --duration-slow: 320ms;` / `--ease-standard: cubic-bezier(.2,0,0,1);`
- **사용자 행동에 반응하는 모션**(열림·닫힘·확정·피드백)을 우선한다.
- 사용자 행동과 무관한 모션은 **페이지당 1개의 연출**만. 모든 섹션에 페이드+슬라이드업, 모든 카드에 hover 변형을 넣는 습관 금지.
- `transform`, `opacity`만 애니메이션 (레이아웃 속성 `width/height/top/left` 애니메이션 금지).
- **`prefers-reduced-motion: reduce` 대응 필수**.

## 3. 컴포넌트 디자인 규칙

### 3.1 공통 상태 (모든 인터랙티브 요소 MUST)

`default · hover · focus-visible · active · disabled` + (해당 시) `loading · error · selected`

- **포커스 링은 반드시 보여야 한다.** `outline: none` 단독 사용 금지. 대체 시 동등한 시각 표시 제공.
  ```css
  :focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
  ```
- 터치 타깃 **최소 44×44px** (WCAG 2.2 AA 최소 24×24, 권장 44).
- hover만으로 정보·기능을 제공하지 않는다 (모바일 대체 수단 필수).

### 3.2 버튼

- 위계: **Primary(페이지당 1개 중심) → Secondary → Tertiary(텍스트)**.
- 라벨은 **행동을 정확히 설명하는 능동형**: "저장하기", "문의 보내기" (✕ "확인", "Submit").
- 같은 행동은 흐름 전체에서 같은 이름을 유지 ("발행" 버튼 → "발행되었습니다" 토스트).
- 로딩 중에는 중복 클릭 방지 + 상태 표시.

### 3.3 폼

- 라벨은 **항상 보이는 `<label>`** 사용 (placeholder를 라벨로 쓰지 않는다).
- 필수/선택 표시 일관, 오류 메시지는 **무엇이 잘못됐고 어떻게 고치는지** 설명. 사과·모호한 표현 금지.
  - ✕ "오류가 발생했습니다." → ✓ "이메일 형식이 올바르지 않습니다. 예: name@example.com"
- 오류는 필드 근처에 표시하고 `aria-describedby`로 연결, 색 + 아이콘 + 텍스트 병행.

### 3.4 내비게이션

- 1차 메뉴 **7개 이내**. 현재 위치를 시각 + `aria-current="page"`로 표시.
- 모바일 메뉴는 포커스 트랩·ESC 닫기·열림 상태 표시 포함.
- 로고는 홈 링크. 스킵 링크(`본문 바로가기`) 제공.

### 3.5 이미지·아이콘

- 아이콘은 **하나의 세트**에서만 (선 굵기·모서리·크기 그리드 통일). SVG, `currentColor` 사용.
- 의미 있는 이미지는 `alt` 필수, 장식 이미지는 `alt=""`.
- 이미지 위 텍스트는 대비 확보(오버레이 또는 배치 조정). 이미지에 텍스트를 구워 넣지 않는다.
- 종횡비를 고정(`aspect-ratio`)해 레이아웃 이동(CLS)을 방지.

## 4. 반응형 디자인 규칙

- **모바일 퍼스트**로 설계하고 `min-width` 미디어 쿼리로 확장. *(이 프로젝트도 `min-width`만 사용한다.)*
- 브레이크포인트 토큰 (기기가 아닌 **콘텐츠가 깨지는 지점** 기준으로 보정 가능). *(이 프로젝트는 아래 표 대신 **PART 3 §S3.1의 810 / 1200px(🔶)**를 사용한다.)*

| 이름 | 값 | 비고 |
|---|---|---|
| `sm` | 480px | 큰 폰 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 소형 데스크톱 |
| `xl` | 1280px | 데스크톱 |
| `2xl` | 1536px | 와이드 |

- 필수 검수 뷰포트: **360 / 390 / 768 / 1024 / 1440px**. 가로 스크롤 발생 금지.
- 유동 타이포·간격은 `clamp()` 활용. 고정 px 레이아웃 금지.
- 가능한 곳에서는 미디어 쿼리 대신 파티션 박스의 **`flex-wrap` + `flex-basis`** (또는 내용 박스 내부의 `auto-fit/minmax` 그리드)로 해결.

## 5. 콘텐츠·카피 규칙

- 문구는 장식이 아니라 **사용 편의를 위한 설계 요소**. 사용자 관점에서 쉬운 말로 쓴다.
  - ✕ "웹훅 설정" → ✓ "알림 관리"
- 한국어 UI는 **해요체/합쇼체 중 하나로 통일**(브랜드 톤에 맞춰 사전 결정). 한 화면에서 혼용 금지.
- 문장 부호·숫자·날짜 형식 통일 (`2026.11.02` 또는 `2026-11-02` 중 하나).
- 빈 화면은 분위기가 아니라 **다음 행동을 안내**한다. 오류는 **원인 + 해결 방법**.
- 특정 브랜드·사람·제품명을 함부로 지어내지 않는다. 더미 콘텐츠는 주제에 맞는 현실적인 문구를 사용.

## 6. "범용 AI 디자인" 회피 (SHOULD → 위반 시 사유 기재)

다음은 주제와 무관하게 반복되는 기본값이므로 **브리프가 지시하지 않는 한** 선택하지 않는다.

- 크림 배경 + 고대비 세리프 + 테라코타 포인트
- 검정 배경 + 형광 단색 포인트
- 신문 스타일 헤어라인 + 직각 레이아웃
- 동일 카드 N개 + 동일 라운드 + 동일 그림자 + 그라디언트
- 모든 섹션 상단의 대문자 라벨, 중점(`·`)으로 이은 메타 문자열, `WORD — 설명` 라벨, 버튼 끝 `→`

> 브리프에 명시된 시각 방향이 있으면 **브리프가 항상 우선**한다. *(이 사이트의 검정 배경 + 형광 연두 포인트, 캡션·번호 표기 패턴은 원본 시안이므로 PART 3이 예외로 허용한다 — §S1.5, §S5.)*

---

# PART 2. DEVELOPER 규약

> **15년차 웹개발자의 기준**: 동작하는 코드가 아니라 **읽기 쉽고, 깨지지 않고, 바꾸기 쉬운** 코드를 쓴다. 단순함을 선택하고, 추상화는 반복이 증명된 뒤에만 한다.

## 1. HTML

### 1.1 문서 기본 (MUST)

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>페이지명 | 사이트명</title>
  <meta name="description" content="80~120자 내외의 페이지 요약">
  <link rel="canonical" href="https://example.com/">
  <meta property="og:title" content="…">
  <meta property="og:description" content="…">
  <meta property="og:image" content="…">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/main.css">
  <script type="module" src="/js/main.js"></script>
</head>
```

- `<html lang>` 필수. 페이지마다 **고유한 `<title>`/`description`**.
- 스크립트는 `type="module"`(자동 defer) 또는 `defer`. 동기 스크립트로 렌더링 차단 금지.
- 인라인 `style`·`onclick` 등 **인라인 이벤트 핸들러 금지**.

### 1.2 시맨틱 (MUST)

- 랜드마크: `<header> <nav> <main> <aside> <footer>`. **`<main>`은 페이지당 1개**.
- 제목은 **`h1`은 페이지당 1개**, `h1→h2→h3` 순서를 건너뛰지 않는다. 제목 레벨은 크기가 아니라 **문서 구조**로 결정(크기는 CSS).
- 클릭 동작은 `<button>`, 이동은 `<a href>`. **`<div>`/`<span>`에 클릭 이벤트 부여 금지.**
- 목록은 `ul/ol/dl`, 표 데이터는 `table` (`caption`, `th scope`). 레이아웃에 `table` 금지.
- 폼 요소는 `label[for]` + `id`, 의미 있는 `type`/`autocomplete`/`inputmode` 지정.
- `<img>`에 `width`/`height`, `alt`, `loading="lazy"`(첫 화면 밖), `decoding="async"`. LCP 이미지는 `fetchpriority="high"`, lazy 금지.
- 반응형 이미지는 `srcset`/`sizes`/`<picture>` 사용.
- 외부 링크 `target="_blank"` 시 `rel="noopener noreferrer"` 필수.

### 1.3 접근성 (WCAG 2.2 AA, MUST)

- 키보드만으로 **모든 기능** 사용 가능, 탭 순서는 시각 순서와 일치. `tabindex`는 `0`/`-1`만 (양수 금지).
- ARIA는 **시맨틱 HTML로 불가능할 때만**. "ARIA 없음이 잘못된 ARIA보다 낫다."
- 동적 변경은 `aria-live`/포커스 이동으로 알림. 모달은 `<dialog>` 우선, 포커스 트랩·ESC·복귀 포커스.
- 스킵 링크, `aria-current`, `aria-expanded`, `aria-controls` 정확히 갱신.
- 시각적 숨김은 `.visually-hidden` 유틸리티 (`display:none`은 스크린리더에서도 사라짐).

### 1.4 네이밍·포맷

- 들여쓰기 **2칸**, 속성은 **큰따옴표**, 불리언 속성은 값 생략, 속성 순서: `id → class → data-* → 기타 → aria-*`.
- `id`는 JS 훅·앵커·`label` 연결에만. 스타일링에 사용하지 않는다.
- JS 훅은 `data-js="…"` 또는 `data-*` 속성으로 분리 (스타일 클래스와 결합 금지).

## 2. CSS

### 2.1 아키텍처 (MUST)

- **BEM 변형 네이밍**: `.block`, `.block__element`, `.block--modifier`. 상태는 `.is-open`, `.is-active`, `[aria-expanded="true"]`.
  ```css
  .card { … }
  .card__title { … }
  .card--featured { … }
  ```
- **선택자 구체성 최소화**: 클래스 하나(0,1,0)를 기준. **`id` 선택자 금지, `!important` 금지**(유틸리티 예외 시 주석), 3단계 이상 중첩 금지.
- 요소 선택자(`div`, `section`)로 컴포넌트 스타일링 금지 (`base.css`의 요소 기본값 제외).
- **`@layer`로 우선순위 제어**:
  ```css
  @layer reset, tokens, base, layout, components, utilities;
  ```
- 컴포넌트는 **자체 완결**: 한 파일에 해당 컴포넌트의 모든 상태·반응형·변형 포함.
- 섹션 간 간격은 **한 가지 방식**(예: `section + section` 또는 `.section { padding-block }`)으로만 정의해 규칙이 서로 상쇄되지 않게 한다.

### 2.2 작성 규칙

- **값은 토큰만**: 색·간격·글자·그림자·라운드·모션·z-index 모두 변수.
- **논리 속성 우선**: `margin-inline`, `padding-block`, `inset-inline-start` (RTL·다국어 대비).
- 페이지 레이아웃은 **Flexbox(파티션 박스)** 로 구성하고, **Grid는 내용 박스 안에서만** 쓴다. `float`·`position:absolute`로 레이아웃 잡기 금지. 간격은 `gap` 사용 (margin 해킹 금지).
- 단위: 폰트 `rem`, 간격 `rem`/토큰, 테두리 `px`, 비율 `%`/`fr`/`ch`, 뷰포트 `dvh/svh`(모바일 주소창 대응). `vh` 높이 100% 고정 지양.
- `z-index`는 토큰 스케일(`--z-dropdown: 100; --z-sticky: 200; --z-modal: 1000; --z-toast: 1100`). 임의 `9999` 금지.
- `reset`은 최소화: `box-sizing: border-box`, 마진 제거, `img { max-width:100%; display:block }`, 폼 요소 `font: inherit`.
- 속성 순서: **위치 → 박스 모델 → 타이포 → 시각 → 기타**.
- 벤더 프리픽스 수동 작성 금지. 지원 필요 시 `@supports` 사용.
- **Hover**는 `@media (hover: hover)` 안에서만, 모션은 아래처럼:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
  }
  ```
- 다크 모드·고대비(`prefers-contrast`)·강제 색상(`forced-colors`) 환경에서 깨지지 않게 한다.

### 2.3 성능

- 첫 화면에 필요한 CSS는 가볍게 유지, 사용하지 않는 규칙을 남기지 않는다.
- `will-change` 남용 금지. 애니메이션은 `transform/opacity`.
- 폰트: `woff2`, `font-display: swap`, 필요한 글리프/굵기만 로드, 핵심 폰트 `preload`.

## 3. JavaScript

### 3.1 기본 규칙 (MUST)

- **ES Modules** 사용, 전역 변수·전역 함수 금지. `"use strict"`는 모듈에서 기본 적용.
- `const` 기본, 재할당 필요 시 `let`, **`var` 금지**. `==` 금지(`===`만).
- 최신 문법 활용: 옵셔널 체이닝, `??`, 구조 분해, `async/await`, `Array` 고차 함수, `structuredClone`.
- 함수는 **하나의 일**, 길이 **40줄 이내**, 인자 **3개 이하**(초과 시 객체). 중첩 **3단계 이내**(조기 반환 사용).
- 매직 넘버·문자열 금지 → `config.js`의 상수로.
- 네이밍: 변수·함수 `camelCase`(동사로 시작: `getUser`, `isOpen`), 상수 `UPPER_SNAKE_CASE`, 클래스 `PascalCase`, 불리언은 `is/has/can` 접두.
- 세미콜론 사용, 문자열은 작은따옴표 또는 템플릿 리터럴, 들여쓰기 2칸, 후행 쉼표(ES5+) 사용.

### 3.2 DOM·이벤트

- 셀렉터는 `data-js` 속성 기준. 클래스·태그 구조에 의존하지 않는다.
  ```js
  const toggle = document.querySelector('[data-js="nav-toggle"]');
  ```
- 쿼리는 **한 번만** 하고 캐시한다. 루프 안에서 DOM 접근·`innerHTML +=` 금지.
- **이벤트 위임** 우선. 리스너는 해제 가능하게(`AbortController` 또는 `{ once: true }`).
- 스크롤·리사이즈·입력 이벤트는 `{ passive: true }`, 필요 시 throttle/debounce. 스크롤 감지는 **`IntersectionObserver`**, 크기 감지는 **`ResizeObserver`** 사용.
- 스타일 변경은 `element.style` 직접 조작이 아니라 **클래스/데이터 속성 토글**. 동적 값만 CSS 변수로 전달(`el.style.setProperty('--x', v)`).
- **초기화 패턴**:
  ```js
  export function initNav(root = document) {
    const el = root.querySelector('[data-js="nav"]');
    if (!el) return;            // 요소가 없어도 에러 없이 종료
    // …
  }
  ```
  `main.js`는 `DOMContentLoaded` 후 각 `init*`만 호출한다.
- 상태는 **DOM이 아닌 변수/데이터 속성/ARIA**에서 단일 소스로 관리하고 UI는 그것을 반영.

### 3.3 비동기·에러 처리

- `fetch`는 래퍼 함수로 감싸 **`response.ok` 확인, 타임아웃(`AbortSignal.timeout`), 에러 처리**를 일원화.
- `try/catch`는 **의미 있는 처리**를 할 때만. 에러를 삼키지 않는다(빈 `catch` 금지). 사용자에게는 이해 가능한 문구로 표시.
- 로딩·성공·실패·빈 상태 **4가지 UI 상태**를 모두 구현.
- 사용자 입력은 **항상 검증**(클라이언트 UX용) — 신뢰는 서버에서 확정.

### 3.4 저장소·URL

- `localStorage` 접근은 `try/catch`로 감싸고(차단·용량 초과 대비), 키는 `프로젝트명:기능:키` 형식으로 네임스페이스화. **민감 정보 저장 금지.**
- 상태 공유가 필요한 화면은 URL(`searchParams`/hash)에 반영해 새로고침·공유가 되게 한다.

## 4. 보안 (MUST)

- **`innerHTML`에 사용자 입력·외부 데이터 삽입 금지** → `textContent` / `createElement` / `<template>` 사용. 불가피하면 반드시 sanitize.
- `eval`, `new Function`, `document.write`, `javascript:` URL 금지.
- 외부 스크립트는 **SRI(`integrity`) + `crossorigin`** 적용, 정확한 버전 고정(`@latest` 금지).
- 비밀키·토큰·API 키를 클라이언트 코드·저장소에 넣지 않는다.
- 서버 설정 가능 시 **CSP, `X-Content-Type-Options`, `Referrer-Policy`** 헤더 권장. 폼은 CSRF 대책 전제.
- 서드파티 임베드(`iframe`)는 `sandbox`, `loading="lazy"`, `title` 지정.

## 5. 성능 (목표: Lighthouse 모바일 ≥ 90)

| 지표 | 목표 |
|---|---|
| LCP | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |
| 총 JS (gzip) | ≤ 100KB |
| 총 CSS (gzip) | ≤ 50KB |
| 이미지 1장 | ≤ 200KB (히어로 ≤ 300KB) |

- 이미지: **AVIF/WebP + 적절한 크기 + `srcset`**. 첫 화면 외 `lazy`.
- 폰트·핵심 CSS·LCP 이미지는 `preload`, 외부 도메인은 `preconnect`.
- JS는 **필요한 페이지에서만** 동적 `import()`. 메인 스레드를 오래 점유하는 작업(50ms↑)은 분할.
- 레이아웃 스래싱 금지(읽기·쓰기 일괄 처리), `requestAnimationFrame` 활용.
- 캐시 가능하도록 파일명 해시/버전 쿼리 전략을 문서화.

## 6. SEO·메타

- 페이지당 고유 `title`·`description`·`canonical`, OG/Twitter 카드 지정.
- `h1`에 페이지 핵심 주제, 링크 텍스트는 목적지를 설명("여기를 클릭" 금지).
- `robots.txt`, `sitemap.xml`, 구조화 데이터(JSON-LD)는 해당 시 추가.
- 404 페이지 별도 제공(홈 복귀·검색 안내).

## 7. 브라우저 지원·호환

- 지원 기준: **최근 2개 메이저 버전의 Chrome, Edge, Safari(iOS 포함), Firefox, Samsung Internet**. IE 지원하지 않음.
- 신규 CSS/JS 기능은 사용 전 지원 현황을 확인하고, 미지원 시 **점진적 향상**(`@supports`, 기능 감지)으로 대응. UA 스니핑 금지.
- JS 비활성 환경에서도 **핵심 콘텐츠와 링크는 접근 가능**해야 한다(점진적 향상).

## 8. 품질·협업

### 8.1 코드 품질

- 데드 코드·주석 처리된 코드·미사용 변수/CSS 제거.
- 주석은 **의도·배경·함정**만 기재. 코드를 그대로 번역하는 주석 금지. 파일 상단에 한 줄 목적 설명 가능.
- 복잡한 CSS 해킹·우회에는 **이유와 제거 조건**을 주석으로 남긴다.
- 코드 포맷은 프로젝트 설정(`.editorconfig`, Prettier/ESLint 사용 시 그 규칙)을 따른다.

### 8.2 Git

- 커밋 메시지 (Conventional Commits): `feat:`, `fix:`, `style:`, `refactor:`, `perf:`, `docs:`, `chore:` + 명령형 요약(한글 가능).
- 커밋은 **하나의 논리적 변경**. 디자인 토큰 변경과 기능 변경을 한 커밋에 섞지 않는다.
- 브랜치: `feature/…`, `fix/…`, `chore/…`.

### 8.3 변경 시 응답 형식 (에이전트 → 사용자)

작업 완료 보고에는 다음을 **간결하게** 포함한다.

1. **무엇을 바꿨는지** (파일 단위)
2. **적용한 가정**과 결정 이유
3. **확인 방법** (어느 뷰포트/브라우저에서 무엇을 보면 되는지)
4. **남은 이슈/제안** (있을 때만)

---

# PART 3. SITE SPECIFIC — draftx.co.kr

> **타깃**: https://draftx.co.kr/ (DRAFT.X · 드래프트엑스, 하이엔드 디지털 에이전시 포트폴리오 사이트)
> **원칙**: 이 사이트와 **구조·문구·콘텐츠 순서는 동일**하게, **내부 레이아웃은 §S2 규칙으로 재구성**한다. 시각 값(색·서체·글자 크기·간격·박스)은 사용자가 제공한 **Figma CSS 내보내기(1440px 데스크톱 프레임)** 에서 읽은 값을 ✅로 쓰고, 이 내보내기에 없는 값(모바일·태블릿·헤더·모션 타이밍·호버)은 🔶 임시로 두어 §S7에서 확인한다.
> **효력**: PART 1·2와 충돌 시 PART 3 우선. 단, §S1.4(접근성·보안)는 PART 3보다 상위다.
> **근거**: ① 원본 4개 페이지(`/`, `/work`, `/lab.x`, `/contact`)의 텍스트 스냅샷(구조·문구·링크) ② 사용자가 제공한 Figma CSS 내보내기 `1440w light`(홈 데스크톱 프레임 1개, 약 15,000줄). **렌더링 화면, 모바일·태블릿 프레임, `/work`·`/lab.x`·`/contact` 프레임은 확인하지 못했다.**

## S1. 적용 원칙

### S1.1 값의 신뢰 등급 (MUST)

| 표기 | 의미 |
|---|---|
| ✅ 확인 | 원본 페이지에서 **직접 읽은 구조·문구·링크·이미지 비율** |
| ✅ 실측 | Figma CSS 내보내기(1440px 데스크톱 프레임)에서 **직접 읽은 값** (색·서체·글자 크기·박스·간격·반경·그림자) |
| 🧮 계산 | 실측 값에서 환산한 값 (예: `px → em` 자간, 3열 폭 역산, 소수점 글자 크기 정규화) |
| 🔶 임시 | 내보내기에 없는 값(모바일·태블릿·헤더·메뉴·모션 타이밍·호버·포커스). §S7에서 확인 후 교체 |

- 실측 값은 **시안(Figma) 값**이다. 배포된 사이트와 소수점 단위로 다를 수 있으므로, 에이전트는 이를 "배포 사이트의 계산된 스타일"이라고 보고하지 않고 "시안 기준 값"이라고 보고한다.
- 값 교체는 `tokens.css`에서만 하며 **토큰 이름은 바꾸지 않는다.**
- 🔶 값은 PART 1 규칙(8pt 그리드, 타입 스케일)을 따라 임시로 정한다. ✅ 실측 값이 있는 곳은 **PART 1보다 실측 값이 우선**한다 (예: `17px`, `79px`, `-0.04em` 자간은 반올림하지 않는다).

### S1.2 원본 기술 구성 (참고)

| 항목 | 내용 |
|---|---|
| 제작 도구 | **Framer** (`meta generator`). 마크업·클래스·스크립트는 가져오지 않는다 |
| 디자인 시안 | **Figma 내보내기, 1440w 데스크톱 단일 프레임**. 프레임 이름은 `light`지만 **배경이 `#000000`인 다크 테마**다. 섹션이 `position:absolute`와 고정 `top`으로 배치된 것은 Figma 산출물이므로 가져오지 않고 일반 흐름(flow)으로 구성한다 |
| 이미지 | Framer CDN(`framerusercontent.com`)의 webp/png. **핫링크 금지**, 로컬 `/assets/images/`에 두고 사용한다 |
| 메타 | 한·영 혼용 타이틀 `DRAFT.X (드래프트엑스) \| 하이엔드 디지털 에이전시`, OG/Twitter 카드(`summary_large_image`), `robots: max-image-preview:large`, 네이버 사이트 인증 메타 |
| 원본 마크업 | 제목 레벨이 비정상(`h5`·`h6` 위주, 일부 `h1`이 중간 섹션에 있음)이고 같은 문구가 **브레이크포인트별로 2~3회 중복 렌더링**된다 → 우리는 §S2의 시맨틱 구조로 재작성하고 **한 번만** 쓴다 |
| 반응형 | 시안에 **데스크톱(1440px) 프레임만** 있고 미디어 쿼리가 없다. 모바일·태블릿 값은 🔶. 기본=모바일, `min-width`로 확장한다 |

### S1.3 페이지 구성 (✅)

**공통 헤더**: 로고 `DRAFT.X`(홈 링크) · 내비 `Home / Works / LAB.X / Contact` · 수상 배지 `2026 // GDWEB DESIGN AWARDS WINNER PRIZE`(→ `/work/dra`) · 모바일 `Menu`/`Close` 토글 · 카카오톡 채팅 링크(`https://pf.kakao.com/_ANXIX/chat`).

**홈 `/` — 섹션 순서**

| 순서 | 영역 | 내용 |
|---|---|---|
| 1 | 히어로 | 영문 4행 헤드라인 `10+ years of aesthetic mastery meets / high-end strategy, / delivering essential changes / for your brand.` + 한글 서브카피 `축적된 심미적 안목이 하이엔드 전략과 만나, 브랜드에 본질적인 변화를 선사합니다.` + `DRAFT.X` 워드마크 + 이미지 콜라주(시안 `Section - Hero` 프레임 432×270, 이미지 8개 — 텍스트 스냅샷의 7장 + `Video` 1개). 시안에서 `opacity: 0`인 인트로 상태라 최종 크기는 🔶 |
| 2 | 선택 작업 | 캡션 `© SELECTED WORKS 24/26` · `(DX. MASTERPIECE — 05)` · `STRATEGIC AESTHETICS`, 헤드라인 `Masterful aesthetics, strategic precision.`, 한글 카피, `SEE WORKS`(→ `/work`), 수상 링크, 작업 카드 6개(시안 `Project Card Item` 6개 = `dra` `muk` `arche` `velo` `otium` `aur.a`, 첫 카드에 수상 배지) |
| 3 | 작업 쇼케이스 | 캡션 `© AUR. A` · `(05. LUXURY BRANDING)` · `UNRIVALED ORIGINALITY` + 풀폭 이미지 |
| 4 | 제작 방식 | `{ High-end Digital Production }`, 제목 `How we craft essentials`, 부제 `DRAFT.X : 우리가 본질을 빚어내는 방식`, **항목 6개**(제목 + 설명) |
| 5 | 핵심 철학 | 캡션 `© BRAND NARRATIVE` · `(DRAFT.X)` · `CORE PHILOSOPHY`, 영문 문장, 한글 단락, 세로 이미지 1장, `SEE WORKS`, 캡션 `© THE ESSENCE OF PRESENCE` · `(STRATEGIC INTELLIGENCE — 27)` · `FUNCTIONAL CLARITY` |
| 6 | 수상·고객사 | 제목 `Awards`, 카운트 `(27)`, 항목: 히다랩 · 현대 한스톤 · 아모레퍼시픽 · LG그룹 · 한국은행 (각 설명·연도 포함) |
| 7 | 요금 | 제목 `Investment for Excellence`, 3단계 `Essential` / `Signature` / `Masterpiece`(시안에서 가운데 카드가 초록 `Focused` 상태), 링크 `Master Process Guide (PDF)` |
| 8 | 아카이브 | 캡션 `© DRAFT.X ARCHIVE` · `(GLOBAL STUDIO — 20Y)` · `BEYOND DIGITAL ESSENCE`, 이미지 8장, 클로징 `Defining the Essence, Designing the Future.` + 한글 인용문 |
| 9 | 푸터 | `Top` 링크, 스튜디오 소개, 이메일, 저작권 |

**하위 페이지**

| 경로 | 내용 |
|---|---|
| `/work` | 소제목 `works`, 태그라인 `Defining the Essence of Identity through Strategic Intelligence.`, 수상 배지(`dra` 카드), 프로젝트 카드(이미지 링크, 보이는 제목 없음, 필터 없음), 클로징, 푸터 |
| `/lab.x` | 제목 `LAB.X`, 부제 `Expanding the Boundaries of Design through Continuous Technical Evolution.`, 소개 `Crafting a sanctuary of minimalism and nature`, 실험 갤러리 `STUDY NO.001 ~ NO.24`(번호 + 영문 제목 + 이미지, 루프형 슬라이더로 보임), 클로징, 푸터 |
| `/contact` | 제목 `Contact`, 소개 문단, 인용 블록(`전략적 지능` 굵게), 문의 폼(`Brand Name` · `Email` · `Project Vision & Core Essence` · 제출 `Request Strategic Definition`), 푸터 |
| `/work/[slug]` | `dra` `muk` `arche` `velo` `otium` `aur.a` — **상세 내용은 확인하지 못했다.** 사용자가 요청하기 전에는 만들지 않는다 |

**홈 제작 방식 6개 항목 (✅ 문구)**

| 제목 | 설명 |
|---|---|
| 직관과 데이터의 전략적 설계 | 20년간 축적된 심미적 직관에 AI 분석 전략을 더해, 장황한 기획 대신 브랜드에 즉각적으로 필요한 핵심 방향성만을 도출합니다. |
| 고효율·고감도 디지털 빌드 시스템 | 제로 베이스의 비효율적 설계 대신 검증된 하이엔드 프레임워크를 기반으로 커스터마이징하여, 디자인 기획에 소요되는 시간과 비용을 혁신적으로 절감합니다. |
| 독보적 서사를 담은 AI 비주얼 생성 | 세상에 존재하지 않는 브랜드 고유의 이미지를 AI 기술로 직접 생성하여, 기성 스톡 이미지로는 도달할 수 없는 압도적인 브랜드 서사와 몰입감을 완성합니다. |
| 본질에 집중하는 콘텐츠 최적화 | 콘텐츠 분석부터 루틴 설계까지, 브랜드의 정체성이 디지털 환경에서 가장 강력한 힘을 발휘할 수 있도록 최적의 구현 방식을 제안합니다. |
| 미세한 감각이 만드는 시각적 조화 | 폰트의 자간과 여백의 미세한 조정을 통해 시각적 피로도를 낮추고, 브랜드의 품격이 느껴지는 DRAFT.X만의 최상위 레이아웃을 구현합니다. |
| 브랜드의 지속 가능한 성장 시스템 | 제작 이후에도 클라이언트가 직접 관리하고 확장할 수 있는 유연한 시스템을 제공하여, 브랜드가 멈추지 않고 지속적으로 성장하도록 돕습니다. |

**요금 3단계 (✅ 문구, 가격 숫자는 원본에 없다 — 만들어 넣지 않는다)**

| 단계 | 한 줄 소개 | 구성 | 태그 |
|---|---|---|---|
| Essential | 본질에 집중한 강력한 첫인상 | 원페이지 브랜드 런칭 / 데스크탑·모바일 최적화 / 커스텀 모션 적용 | Fast & Sharp |
| Signature | 비즈니스의 가치를 증명하는 플랫폼 | 멀티페이지(~10p) / 관리자 페이지(CMS) 연동 / 몰입감을 높이는 모션 디테일 | Pure Intelligence |
| Masterpiece | 정갈한 품격의 하이엔드 브랜드 | 멀티페이지(10p~) / 20년 경력 마스터 직접 디렉팅 / 독점적 브랜드 경험 설계 | Absolute Value |

**수상·고객사 항목 (✅ 문구)**

| 고객사 | 내용 | 연도 | 분류 |
|---|---|---|---|
| 히다랩 | Red Dot, iF, IDEA Design Award | 2021 | Awards |
| 현대 한스톤 | Hyundai Hanstone Construction/Architecture Grand Prize | 2020 | Awards |
| 아모레퍼시픽 | Aritaum, Mamonde, Innisfree, Etude, eSpoir | ~2018 | Brands |
| LG그룹 | LG Group Corporate Web Integrated Grand Prize | 2012 | Awards |
| 한국은행 | Bank of Korea Public Finance Grand Prize | 2012 | Awards |

**푸터·인용 문구 (✅)**: `DRAFT.X | Remote Based Global Studio 20 Years of Heritage. Defining the Essence of Identity.` / `{ Email : draftx.co@gmail.com }` / `© 2026 DRAFT.X. All Rights Reserved.` / 인용문 `"DRAFT.X의 20년 경험은 오직 당신의 브랜드가 세상에 가장 가치 있게 드러나는 순간에 기여하기 위해 존재합니다."`

### S1.4 원본을 그대로 복제하지 않는 것 (접근성·보안 우선)

- **중복 블록 금지**: 헤드라인·카피·푸터·갤러리가 2~3회 반복되는 것은 Framer 브레이크포인트 변형의 결과다. 문구와 이미지는 **페이지에 한 번만** 쓴다.
- **제목 구조 재작성**: 원본의 `h5`/`h6` 위주 구조와 중간 섹션의 `h1`(`Awards`)은 가져오지 않는다. 각 페이지의 `h1`은 하나이며 홈은 **히어로 헤드라인 4행**, `/work`는 `works`, `/lab.x`는 `LAB.X`, `/contact`는 `Contact`다. 섹션 제목(`How we craft essentials`, `Awards`, `Investment for Excellence`)은 `h2`, 항목 제목은 `h3`다.
- **`alt` 재작성**: 원본에는 내용과 맞지 않는 alt(`a person posing next to a zebra`)와 빈 alt가 있다. 실제 이미지를 보고 한국어 alt를 쓰거나, 장식이면 `alt=""`로 한다.
- **보이는 제목이 없는 링크**(작업 카드, 수상 배지)는 `.visually-hidden` 텍스트나 `aria-label`로 이름을 준다 (예: `muk 작업 보기`).
- **헤드라인 줄바꿈**은 `<br>` 대신 `<span class="line">`(`display:block`)으로 만든다.
- **외부 링크**(카카오톡, Google Drive PDF)는 `target="_blank"` + `rel="noopener noreferrer"`, 새 창 안내를 링크 이름에 포함한다.
- **Framer 산출물**(클래스명, `data-framer-*`, 검색 인덱스 URL, `generator` 메타)은 가져오지 않는다.
- 네이버 사이트 인증 메타는 **소유자 확인 후** 사용자가 값을 제공할 때만 넣는다 (§S7).
- **이메일 불일치**: 시안(Figma)의 푸터에는 `{ Email:surpas250@gmail.com }`, 배포 사이트에는 `{ Email : draftx.co@gmail.com }`이 있다. 시안 값은 가안으로 보고 **배포 사이트 값(`draftx.co@gmail.com`)** 을 쓰며 §S7 항목 11에서 확인한다. 이 문서의 이메일 값은 모두 이 기준이다.
- viewport는 PART 2 §1.1 기준을 쓴다. 확대(zoom)를 막지 않는다.

### S1.5 문구·표기 규칙 (PART 1 §5·§6의 사이트 전용 예외)

- **어체**: 한글 카피는 원본과 같은 **합쇼체**(`~합니다`)와 명사형 종결로 통일한다. 영문 카피는 원문 그대로 쓴다.
- **캡션 패턴 허용**: 이 사이트의 정체성이므로 아래 패턴은 PART 1 §6(대문자 라벨, `WORD — 설명`, 중점·메타 문자열)·§2.4(번호) 금지 규칙을 **해제**한다.
  - `© 라벨` · `(괄호 메타)` · `{ 중괄호 라벨 }` · `//` 구분 · `—` 번호 표기 · `STUDY NO.###`
  - **원본에 있는 위치에만** 쓴다. 새 섹션에 임의로 추가하지 않는다. 번호·카운트(`05`, `27`, `24/26`)는 **원본 데이터**이므로 계산해서 바꾸지 않는다.
- 대문자 표기는 시안의 `Medium upper`·`Link upper` 스타일(✅ `text-transform: uppercase`)에만 적용한다. 영문 원문은 이미 대문자로 입력되어 있으면 **그대로 두고**, 새 문구를 추가할 때만 CSS 변환에 맡긴다.
- 시안의 캡션·링크 스타일은 **자간 +0.05em(✅)** 이므로 PART 1 §2.2의 "대문자 라벨 자간 확대 금지"는 이 두 토큰(`--ls-caption`, `--ls-link-sm`)에 한해 해제한다. 그 외 텍스트에 자간 확대를 쓰지 않는다.
- 버튼·링크 끝 `→` 화살표는 원본에 없으므로 쓰지 않는다.
- 브랜드 표기는 **`DRAFT.X`**(대문자 + 마침표), 메뉴 `LAB.X`, 작업명은 원문 그대로(`aur.a`, 소문자).
- 새 문구가 필요하면 지어내지 않고 사용자에게 요청하거나, 원본에서 확인한 문구만 쓴다.
- 중괄호 `{ }`는 시안에서 **Manrope SemiBold 15px, 색 `#82FF2E`** 로 만든 장식 기호다 (`{ High-end Digital Production }`, `{ Email : … }`). 중괄호만 `<span class="brace" aria-hidden="true">`로 감싸 스크린리더가 읽지 않게 한다.

### S1.6 URL ↔ 파일 매핑 (PART 0 §0.3 kebab-case 준수)

| 원본 경로 | 우리 파일 | 비고 |
|---|---|---|
| `/` | `index.html` | |
| `/work` | `pages/work.html` | |
| `/lab.x` | `pages/lab-x.html` | 점(`.`)은 파일명에서 `-`로 바꾼다. 메뉴 표기는 `LAB.X` 유지 |
| `/contact` | `pages/contact.html` | |
| `/work/[slug]` | `pages/work/[slug].html` | `aur.a` → `aur-a.html`. 요청 전 생성 금지 |

---

## S2. 레이아웃 규칙 — 박스 구조 (MUST, 최우선)

### S2.1 계층

```
겉박스 (.outer-box)          ← header / main > section / footer
 └─ 속박스 (.inner-box)       ← max-width + 중앙 정렬
     └─ 파티션 박스 (.part-box) ← display:flex
         └─ 내용 박스          ← 컴포넌트 (필요 시 grid 허용)
```

- **박스 깊이는 최대 4단계**(겉 > 속 > 파티션 > 내용). 래퍼 `div`를 더 만들지 않는다.
- 클래스명은 `.outer-box` / `.inner-box` / `.part-box`로 **고정**한다. `.container`, `.wrapper`, `.inner`, `.row`, `.col` 등 **동의어 클래스 금지**.

> **원본과의 대응 (✅ 실측)**: 시안의 섹션 프레임은 `width: 1440px; max-width: 1440px`이며 안쪽 블록은 `padding: 0 20px`(캡션 줄·이미지 1400px)다. 즉 **`--inner-max: 1440px`, 데스크톱 `--gutter: 20px`** 가 실측값이다. 블록 폭이 다른 구간(1320·1240·1200px)은 §S3.3의 **겉박스별 `--gutter` 재정의**로 만든다.

### S2.2 겉박스 전체 구조

```html
<body>
  <header class="outer-box outer-box--header">…</header>

  <main>
    <section class="outer-box">…</section>
    <section class="outer-box">…</section>
  </main>

  <footer class="outer-box outer-box--footer">…</footer>
</body>
```

- 겉박스는 **`header`, `main > section`, `footer`** 로만 구성한다. `body`의 직계 자식은 `header`, `main`, `footer` 3개뿐이다 (고정 UI인 카카오톡 채팅 버튼·모바일 메뉴 패널은 §S2.6 예외).
- `main`은 **박스가 아니다** (래퍼). `main`에 `padding`·`background`·`max-width`를 주지 않는다.
- `section`은 `main`의 직계 자식이어야 하고, 겉박스 안에 겉박스를 중첩하지 않는다.
- 겉박스는 **전체 폭(100%)** 이며 **배경·테두리·세로 패딩·sticky/fixed 위치**만 담당한다.

### S2.3 속박스 `.inner-box`

- 모든 겉박스의 **직계 자식 1개**로 둔다.
- 필수 속성:
  ```css
  .inner-box {
    width: 100%;
    max-width: var(--inner-max);   /* 🔶 값은 §S3 */
    margin-inline: auto;           /* 중앙 정렬 */
    padding-inline: var(--gutter); /* 좌우 여백은 속박스만 담당 */
  }
  ```
- 이름은 `.inner-box`로 **일원화**한다. `.inner-box--narrow` 같은 변형을 만들지 않고, 폭이 다른 구간은 **부모 겉박스에서 `--inner-max`/`--gutter`를 재정의**한다.
- `background`, `padding-block`, `border`는 속박스에 주지 않는다 (겉박스 담당).
- **풀블리드 예외**: 히어로 이미지 콜라주·갤러리처럼 좌우 여백이 없는 블록은 겉박스 modifier `.outer-box--bleed`로 만들고 해당 겉박스에서 `--gutter: 0`으로 재정의한다.

### S2.4 파티션 박스 `.part-box`

- `.inner-box`의 직계 자식. **일반적으로 `display: flex`** 를 적용한다.
- 줄바꿈이 필요한 내용(링크 목록, 버튼 그룹, 칩 등)에는 **`flex-wrap: wrap`** 을 적용한다.
- **Grid로 만들지 않는다.** 필요하면 파티션 **안쪽 내용 박스**에 grid를 적용한다.
- 간격은 **`gap`** 으로만 만든다. 파티션에 `margin`을 쓰지 않는다.
- 파티션끼리 폭을 나눌 때는 `flex: 1 1 <basis>` 또는 `flex: 0 0 <고정폭>`을 쓰고, 모바일에서는 `flex-wrap`/`flex-direction: column`으로 쌓는다.
- 파티션 안에 파티션을 중첩하지 않는다. 더 쪼개야 하면 **내용 박스**로 만든다.
- **가로 스크롤 캐러셀·칩 탭 예외**: `flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x mandatory;` (줄바꿈 금지 영역).

```css
.part-box {
  display: flex;
  flex-wrap: wrap;            /* 줄바꿈 내용일 때. 캐러셀은 nowrap */
  gap: var(--part-gap);
  align-items: flex-start;
}
```

### S2.5 박스별 속성 분담표 (MUST)

| 속성 | 겉박스 | 속박스 | 파티션 박스 | 내용 박스 |
|---|:-:|:-:|:-:|:-:|
| `width: 100%` | ✅ | ✅ | — | — |
| `max-width` + `margin-inline:auto` | ❌ | ✅ | ❌ | ❌ |
| `padding-inline` (좌우 여백) | ❌ | ✅ | ❌ | 컴포넌트 내부만 |
| `padding-block` (섹션 세로 여백) | ✅ | ❌ | ❌ | ❌ |
| `background` / `border` | ✅ | ❌ | ❌ | 컴포넌트 내부만 |
| `position: sticky/fixed` | ✅ (header 등) | ❌ | ❌ | 플로팅 UI만 |
| `display: flex` / `gap` / `flex-wrap` | ❌ | ❌ | ✅ | 필요 시 |
| `display: grid` | ❌ | ❌ | ❌ **금지** | ✅ 허용 |
| `margin` (그 외) | ❌ | ❌ | ❌ | 최소화 (간격은 `gap`) |

### S2.6 고정 UI·반응형 처리

- 모바일 → PC로 확장(`min-width`)하며, **박스 구조는 바꾸지 않고 토큰 값만 바꾼다** (`--gutter`, `--section-pt/pb`, `--part-gap`).
- 풀블리드 이미지·배경은 **겉박스 배경**으로, 그 위의 콘텐츠는 `.inner-box` 안에 둔다.
- **카카오톡 채팅 버튼·모바일 메뉴 패널은 겉박스가 아니다.** 채팅 버튼은 `body` 마지막에 `<aside class="floating-chat">`로 두고 `position: fixed`와 `--z-*` 토큰을 쓴다. 모바일 메뉴 패널은 `header` 겉박스 안의 `<nav>`가 `<dialog>` 또는 `[hidden]` 토글로 여는 오버레이로 구현한다.
- 헤더가 `position: fixed`이므로 `main` 첫 섹션 상단에는 `--header-h`만큼의 여백을 **섹션 겉박스 `padding-block`** 으로 준다 (히어로가 헤더 아래에 깔리는 디자인이면 예외 — §S6.2).

### S2.7 `layout.css` 기준 코드

```css
@layer layout {
  .outer-box {
    width: 100%;
    padding-block: var(--section-pt) var(--section-pb);
    background: var(--color-bg);
  }
  .outer-box--bleed { --gutter: 0px; padding-block: 0; }

  .outer-box--header {
    padding-block: 0;
    position: fixed;
    inset: 0 0 auto 0;
    z-index: var(--z-header);
    background: var(--header-bg);
  }
  .outer-box--footer {
    --section-pt: var(--footer-pt);
    --section-pb: var(--footer-pb);
    background: var(--color-surface);
    position: relative;
    z-index: 1;
  }

  .inner-box {
    width: 100%;
    max-width: var(--inner-max);
    margin-inline: auto;
    padding-inline: var(--gutter);
  }

  .part-box {
    display: flex;
    flex-wrap: wrap;
    gap: var(--part-gap);
  }
  .part-box--nowrap { flex-wrap: nowrap; }   /* 캐러셀·칩 탭 가로 스크롤 */
  .part-box--column { flex-direction: column; }
  .part-box--between { justify-content: space-between; }
}
```

### S2.8 레이아웃 체크 (위반 시 재작업)

- [ ] `body > header + main + footer` 구조이고, `main`의 직계 자식은 `section`뿐이다
- [ ] 모든 `.outer-box`의 직계 자식이 `.inner-box` **하나**다
- [ ] `.inner-box`에만 `max-width`·`margin-inline:auto`가 있다
- [ ] `.part-box`가 `display:flex`이며 `grid`가 없다
- [ ] `.part-box`에 `margin`이 없고 `gap`으로 간격을 만든다
- [ ] 동의어 클래스(`container`/`wrapper`/`inner`/`row`/`col`)가 없다

---


---

## S3. 박스 관련 값 (토큰)

### S3.1 브레이크포인트 (🔶, PART 1 §4 표를 이 사이트에서는 대체한다)

| 이름 | 조건 | 의미 |
|---|---|---|
| 기본 | `< 810px` | 모바일 (🔶 시안 없음) |
| `pc` | `min-width: 810px` | 태블릿·소형 PC 전환점 (🔶) |
| `wide` | `min-width: 1200px` | **시안 데스크톱 값 적용 시작점** (🔶). 값은 1440px 프레임 기준 ✅ |

- 시안에는 1440px 프레임만 있다. 810 / 1200은 Framer 기본값으로 **추정한 전환점**이며 §S7 항목 1에서 배포 사이트의 실제 전환점으로 교체한다.
- `min-width` 방향만 사용한다. 이 외 브레이크포인트를 새로 만들지 않는다.
- 1440px 초과에서는 `--inner-max`로 폭을 고정하고 중앙 정렬한다 (✅ 시안 `max-width: 1440px`).

### S3.2 박스 토큰

```css
:root {
  /* 속박스 */
  --inner-max: 1440px;                 /* ✅ */
  --gutter: 20px;                      /* ✅ 시안 데스크톱(캡션 줄 padding 0 20px, 이미지 폭 1400px). 모바일은 🔶 */
  --part-gap: 24px;                    /* 🔶 */

  /* 겉박스: 섹션 세로 여백 — 섹션별 값은 §S3.3 */
  --section-pt: 72px;                  /* 🔶 모바일 기본 */
  --section-pb: 0px;                   /* ✅ 시안은 위 패딩만 사용 */

  /* 캡션 줄 */
  --caption-pad: 20px;                 /* ✅ padding 0 20px */
  --caption-h: 16px;                   /* ✅ */
  --caption-line-gap: 16px;            /* ✅ 캡션 ↔ 구분선 */
  --line-w: 1px;                       /* ✅ */

  /* 고정 UI */
  --header-h: 64px;                    /* 🔶 시안에 헤더 없음 */
  --chat-size: 60px;                   /* ✅ 채팅 버튼 */
  --chat-offset: 32px;                 /* ✅ right / bottom */

  /* 내용 박스 */
  --card-pad: 20px;                    /* ✅ 작업 카드 720px − 이미지 680px = 좌우 20px */
  --card-gap-y: 20px;                  /* 🧮 3행 1882.42 = 3×614.14 + 2×20 */
  --tier-gap: 20px;                    /* 🧮 3×386.67 + 2×20 = 1200 */
  --list-gap: 10px;                    /* ✅ 아카이브 이미지 간격 */

  /* 모서리 (✅ 시안에서 쓰는 값 전부, PART 1 §2.4 3단계 제한의 예외) */
  --radius-xs: 4px;                    /* 아이콘 박스 */
  --radius-sm: 8px;                    /* 그림자 있는 콜라주 이미지, 큰 이미지 링크 */
  --radius-md: 10px;                   /* 이미지, 요금 카드 */
  --radius-tag: 17px;                  /* 태그 */
  --radius-lg: 24px;                   /* 제작 방식 아코디언 */
  --radius-pill: 259px;                /* SEE WORKS 버튼. 원형 버튼은 100px·200px(= pill로 통일) */

  /* 히트 영역 */
  --hit-min: 44px;                     /* 접근성 기준 */

  /* z-index (PART 2 §2.2 스케일 기반) */
  --z-chat: 150;
  --z-header: 200;
  --z-menu: 1000;
}

@media (min-width: 810px) {
  :root {
    --part-gap: 32px;                  /* 🔶 */
    --header-h: 80px;                  /* 🔶 */
  }
}
```

### S3.3 섹션 박스 값 (✅ 데스크톱 1440px, 모바일은 🔶)

겉박스 modifier에서 `--section-pt`·`--gutter`·`--part-gap`만 재정의한다 (S2.3: 폭이 다른 구간은 부모 겉박스에서 재정의). PART 1 §2.3 "섹션 세로 리듬 일정" 규칙은 **시안의 섹션별 값이 우선**한다. 블록 폭 = `1440 − 2 × --gutter`.

| 영역 | 겉박스 클래스 | `--section-pt` | `--part-gap` | `--gutter` (→ 블록 폭) | 근거 |
|---|---|---|---|---|---|
| 히어로 | `.outer-box--hero` | 0 (`min-height: 900px`) | — | 0 (풀블리드) | 시안 `bodyStart min-height: 900px` |
| 선택 작업 | `.outer-box--works` | 100px | 100px | 20px (캡션 줄 1400) / 제목 블록 60px (1320) / 카드 그리드 0 | `Section - Projects: padding 100px 0 0; gap 100px` |
| 작업 쇼케이스 | `.outer-box--showcase` | 150px | 30px | 20px (이미지 1400) | `Section - Brand: padding 150px 0 0; gap 30px`, 이미지 컨테이너 `padding 60px 20px 0` |
| 제작 방식 | `.outer-box--craft` | 200px | 58px (좌우 열 간격) | 100px (1240) | `Tools: padding 200px 100px 0`, 컨테이너 `gap 58px` |
| 핵심 철학 | `.outer-box--about` | 200px | — | 20px | `Section - About: padding 200px 0 0` |
| 수상·고객사 | `.outer-box--awards` | 72px | 80px | 🔶 | `Section - Awards: padding 72px 0 0; gap 80px; align-items: flex-end` |
| 요금 | `.outer-box--plans` | 160px (`padding-bottom` 30px) | 50px | 120px (1200) | `Section - Programs: padding 160px 80px 30px`, 내용 `padding 0 40px; gap 50px` |
| 아카이브 | `.outer-box--bleed` | 🔶 | `--list-gap` 10px | 20px | 목록 `left: 20px; gap: 10px; height 267px` |
| 푸터 | `.outer-box--footer` | 160px | 50px | 20px | `Footer - Desktop: padding 160px 0 0; gap 50px` |

- 모바일·태블릿 값은 시안에 없으므로 데스크톱 값의 `clamp()` 축소를 🔶로 쓴다. 예: `--section-pt: clamp(72px, 10vw, 200px)`. §S7 항목 1.
- 시안의 `position: absolute; top: …` 좌표는 Figma의 배치 산출물이므로 **쓰지 않는다.** 섹션 순서와 위 패딩·gap만 따른다.

### S3.4 작업 카드·그리드 (✅)

- 카드 그리드: **2열**, 카드 폭 720px(= 1440 ÷ 2), 카드 높이 614.14px, 행 간격 20px(🧮), 카드 6개 = 3행.
- 카드 안: 이미지 680×522.14px(비율 ≈ 1.302), 카드 `padding` 20px → 이미지 좌우 간격 40px. 카드 하단 약 72px(🧮 614.14 − 522.14 − 20)의 내용은 확인하지 못했다 (§S7 항목 8).
- 이미지는 `aspect-ratio: 680 / 522.14`를 유지하고 `object-fit: cover`로 채운다. 모서리 `--radius-sm` ✅.
- 수상 배지: 156×40px, 첫 카드 이미지 위 (§S6.5).
- 쇼케이스 이미지: 컨테이너 1400×780px(`--radius-md`), 안의 이미지는 1400×1068.59px(`--radius-sm`)로 **컨테이너보다 크게** 두어 시차(parallax) 이동을 만든다 (§S6.13).

### S3.5 이미지 비율 (✅ 비율 / 🔶 원본 해상도)

원본 이미지 URL의 `width`·`height`는 **리사이즈된 크기**이므로 비율만 ✅로 쓴다. 모든 `<img>`에 `width`·`height`를 이 값으로 지정해 CLS를 막고, 파일은 사용자에게 원본 해상도로 받는다.

| 위치 | 원본 이름(alt 작성 참고) | 크기(비율) |
|---|---|---|
| 히어로 콜라주 | Woman Garden Pose / Room / Black Man / Woman In The Red BG / Man Reading / Woman / Woman On The Grass | 600×449 · 400×522 · 600×341 · 429×341 · 600×344 · 1000×746 · 1392×752 |
| 선택 작업·쇼케이스 | Modern building facade against a clear blue sky | 2048×1168 |
| 핵심 철학 | Woman with flower in mouth, palm trees, ocean view | 673×1064 |
| 아카이브 (8장) | Car Alone / Man / Black Man / Woman Side Pose / Woman Glasses / Woman / Woman / Woman Sit On The Floor | 800×594 · 800×452 · 1000×537 · 800×805 · 1600×905 · 856×1510 · 1000×624 · 1000×570 |

- 비율이 제각각이므로 **`object-fit: cover`로 이미지 자체의 비율을 바꾸지 않는다** (카드·쇼케이스처럼 **프레임 비율이 고정된 곳만** cover).
- 첫 화면 이미지만 `fetchpriority="high"`, 나머지는 `loading="lazy"`. 파일은 `webp`, 이미지당 ≤ 200KB(히어로 ≤ 300KB).

### S3.6 박스 규칙 (MUST)

- `box-sizing: border-box` 전역 상속 (`html { box-sizing: border-box } *, ::before, ::after { box-sizing: inherit }`).
- 섹션 사이 간격은 **겉박스의 `padding-block`** 하나로만 만든다 (섹션 간 `margin` 금지).
- 이미지 갤러리·콜라주·요금 3열·작업 2열 그리드는 **내용 박스 안에서** grid 또는 flex로 구성한다. 파티션 박스를 grid로 만들지 않는다.
- 가로 스크롤 갤러리(`/lab.x`, 아카이브)는 `.part-box--nowrap` + `overflow-x: auto` + `scroll-snap-type`을 기본으로 하고, 자동 이동은 §S6.9를 따른다.

---

## S4. 글자 관련 값

### S4.1 서체 (✅ 시안)

| 서체 | 용도 | 굵기 | 비고 |
|---|---|---|---|
| **DM Sans** | 영문 전반(제목·캡션·링크·푸터), 한글 제목 일부(요금 단계명 `700`) | 400 · 500 · 600 · 700 | 시안 111회 사용 |
| **Anta** | `DRAFT.X` 워드마크(히어로 88.4px, 푸터 338.3px) **전용** | 400 | |
| **Manrope** | 중괄호 `{` `}` **전용** (15px) | 600 | |
| `SansSerif` | 한글 본문(시안 스타일명 `SansSerif/Regular`) | 400 | **시안의 이름은 시스템 기본 산세리프를 가리키는 자리표시자**로 보인다. 실제 한글 서체는 🔶 → **Pretendard**로 시작 |

```css
:root {
  --font-sans: "DM Sans", "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
               "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
  --font-ko:   "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
               "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;   /* 🔶 한글 본문 서체 */
  --font-logo: "Anta", "DM Sans", sans-serif;                                        /* DRAFT.X 전용 */
  --font-brace: "Manrope", "DM Sans", sans-serif;                                    /* { } 전용 */
}
```

- **PART 1 §2.2 "서체 최대 2종" 예외**: 이 사이트는 4종(DM Sans, Anta, Manrope, 한글)이다. Anta는 워드마크, Manrope는 중괄호에만 쓰고 그 외에 쓰지 않는다. 코드 주석에 예외 사유를 남긴다.
- 서체 파일은 `woff2`로 `/assets/fonts/`에 self-host한다 (PART 2 §2.3). **외부 CDN·Google Fonts `<link>`를 임의로 추가하지 않는다.** 파일은 사용자가 제공하거나, 사용자 승인 후 공식 배포처(SIL OFL)에서 받는다. Manrope는 `{` `}` 글리프만 서브셋한다.
- 한글이 섞인 줄은 `--font-sans`의 DM Sans가 한글을 갖지 않으므로 Pretendard로 폴백된다. 시안도 한글 제목(`DM Sans 700`)이 같은 방식으로 폴백된다.
- `html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }`

### S4.2 글자 토큰 (✅ 데스크톱 1440px → 🔶 모바일은 `clamp` 하한)

시안의 `15.8px`·`14.3px` 같은 소수점 크기는 Figma 텍스트 맞춤의 산출물이므로 **16px / 14px로 정규화**한다 (🧮). 자간은 `px → em`으로 환산한다 (🧮).

| 역할 | 서체 | 크기 / 행간 (✅ px) | 굵기 | 자간 | 색 | 사용처 |
|---|---|---|---|---|---|---|
| `display-1` | DM Sans | 166 / 183 | 600 | -0.04em | `--color-text` | `Awards` 제목 |
| `display-2` | DM Sans | 88 / 79 | 400 | -0.03em | `--color-text` | `How we craft essentials` |
| `display-2b` | DM Sans | 88 / 78 | 500 | -0.045em | `--color-text` | `Masterful aesthetics, strategic precision.` |
| `display-3` | DM Sans | 79 / 79 | 500 | -0.063em | `--color-text` | 핵심 철학 문장(영문) |
| `title-1` | DM Sans | 44 / 48 | 500 | -0.04em | `--color-text` | `(27)` 카운트 |
| `title-2` | DM Sans | 40 / 44 | 500 | -0.04em | `--color-text` | `Investment for Excellence` |
| `title-3` | DM Sans | 22 / 24 | 700 | -0.04em | `--color-text` | 요금 단계 한 줄 소개 (한글) |
| `label-lg` | DM Sans | 17 / 20 | 500 | -0.04em | `--color-text` | `Awards`·`Brands` 분류, 클로징 문구 |
| `link-lg` | DM Sans | 23 / 20 | 700 | -0.013em (-0.3px) | `--color-text` | `SEE WORKS` (대문자) |
| `body` | 한글 `--font-ko` | 16 / 22~23 | 400 | -0.04px → 0 | `--color-text` / `--color-text-muted` | 한글 본문·목록 |
| `body-sm` | 한글 `--font-ko` | 14 / 22 | 400 | 0 | `--color-text-muted` | 요금 구성 항목 |
| `body-en` | DM Sans | 16 / 18 | 400 | -0.04px → 0 | `--color-text` | 영문 본문 (`High-end Digital Production` 등) |
| `caption` | DM Sans | 13 / 16 | 500 | **+0.05em** (0.65px) | `--color-text-muted` (일부 `--color-text`) | `© …`, `( … )`, 대문자 |
| `link-sm` | DM Sans | 12 / 13 | 500 | **+0.05em** (0.6px) | `--color-text` | 수상 배지, 내비 링크 계열 |
| `footer` | DM Sans | 14 / 17 | 400 | -0.02em ~ +0.01em (🧮 -0.28px / +0.14px) | `--color-text-faint` | 푸터 소개·저작권 |
| `email` | DM Sans | 16 / 19 | 400 | +0.01em (0.16px) | `--color-accent` | 푸터 이메일 |
| `brace` | Manrope | 15 / 15 | 600 | -0.04em (-0.6px) | `--color-accent` | `{` `}` |
| `wordmark-lg` | Anta | 338.3 / 304 | 400 | 0 | `--color-text` | 푸터 거대 워드마크 |
| `wordmark-md` | Anta | 88.4 / 88 | 400 | +0.08em (7.07px) | `--color-text` | 히어로 워드마크 |

```css
:root {
  --fs-d1: clamp(3.5rem, 11.53vw, 10.375rem);      /* 166px ✅ 상한, 하한 🔶 */
  --fs-d2: clamp(2.5rem, 6.11vw, 5.5rem);          /* 88px */
  --fs-d3: clamp(2.25rem, 5.49vw, 4.9375rem);      /* 79px */
  --fs-t1: clamp(1.75rem, 3.06vw, 2.75rem);        /* 44px */
  --fs-t2: clamp(1.75rem, 2.78vw, 2.5rem);         /* 40px */
  --fs-t3: 1.375rem;                               /* 22px */
  --fs-link-lg: 1.4375rem;                         /* 23px */
  --fs-label-lg: 1.0625rem;                        /* 17px */
  --fs-body: 1rem;                                 /* 16px */
  --fs-body-sm: 0.875rem;                          /* 14px */
  --fs-caption: 0.8125rem;                         /* 13px */
  --fs-link-sm: 0.75rem;                           /* 12px */
  --fs-wordmark-lg: clamp(5rem, 23.5vw, 21.14rem); /* 338.3px */
  --fs-wordmark-md: clamp(2.75rem, 6.14vw, 5.525rem); /* 88.4px */

  --ls-display: -0.04em;                           /* 🧮 display·title·label */
  --ls-caption: 0.05em;                            /* 🧮 */
  --ls-link-sm: 0.05em;                            /* 🧮 */
  --lh-d1: 1.1;  --lh-d2: 0.9;  --lh-d3: 1;  --lh-title: 1.1;  --lh-body: 1.4;  --lh-caption: 1.23;
}
```

### S4.3 글자 규칙 (MUST)

- 문단 본문은 16px(`--fs-body`). 12~13px(`caption`, `link-sm`)는 **보조 메타**에만 쓰고, 사용자가 읽어야 하는 필수 정보는 14px 이상을 쓴다.
- `display-*`는 **영문 제목**에만 쓴다. 한글 제목에 `-0.04em` 이상의 좁은 자간을 쓰지 않는다 (시안의 한글 `title-3`는 -0.04em이지만 22px 한 줄이라 허용, 그 외 한글 제목은 `0 ~ -0.02em`).
- 한글 `word-break: keep-all; overflow-wrap: anywhere;`.
- 영문 제목의 단어 단위 줄바꿈은 `.line` 또는 `text-wrap: balance`로 처리한다.
- 이메일은 `mailto:` 링크로 만들고 `overflow-wrap: anywhere`.

---

## S5. 색상 관련 값 (✅ 시안 — 다크 테마)

### S5.1 팔레트

시안의 색은 **6개 hex + 불투명도 변형**뿐이다. 배경은 검정, 글자는 흰색, 보조는 회색, 포인트는 형광 연두다.

```css
:root {
  /* 배경·표면 */
  --color-bg:            #000000;                    /* ✅ Black */
  --color-surface:       #121212;                    /* ✅ Cod Gray — 아코디언 항목 */
  --color-surface-2:     #222222;                    /* ✅ Mine Shaft — 태그, 아이콘 박스, 채팅 버튼 */

  /* 글자 */
  --color-text:          #ffffff;                    /* ✅ White */
  --color-text-muted:    #a6a6a6;                    /* ✅ Silver Chalice */
  --color-text-faint:    rgba(166, 166, 166, 0.6);   /* ✅ 푸터 소개·저작권 (대비 주의: §S5.2) */
  --color-text-inverse:  #000000;                    /* ✅ 초록 카드 위 글자 */

  /* 선 */
  --color-border:        rgba(166, 166, 166, 0.2);   /* ✅ 구분선, 표 행 */
  --color-border-strong: rgba(166, 166, 166, 0.3);   /* ✅ 요금 카드 테두리 */
  --color-border-soft:   rgba(255, 255, 255, 0.08);  /* ✅ 아코디언 테두리 */
  --color-fill-soft:     rgba(255, 255, 255, 0.08);  /* ✅ 아코디언 토글 버튼 배경 */

  /* 포인트 */
  --color-accent:        #82ff2e;                    /* ✅ Green Yellow */
  --color-on-accent:     #000000;                    /* ✅ */

  /* 이미지 */
  --overlay-image:       rgba(0, 0, 0, 0.51);        /* ✅ 히어로 콜라주 이미지 위 오버레이 */

  /* 상태 */
  --color-focus:         #ffffff;                    /* 🔶 시안에 없음. 검정 배경용 */
  --color-danger:        #ff6b6b;                    /* 🔶 폼 오류 전용. 검정 배경 대비 4.5:1 이상 확인 후 사용 */

  /* 그림자 (✅ 시안 그대로) */
  --shadow-image: -0.772618px -0.587862px 1.7475px -0.46875px rgba(0,0,0,.07), -1.83124px -1.39334px 4.14189px -0.9375px rgba(0,0,0,.07), -3.34037px -2.54159px 7.55523px -1.40625px rgba(0,0,0,.06), -5.55336px -4.22539px 12.5606px -1.875px rgba(0,0,0,.06), -8.96823px -6.82365px 20.2843px -2.34375px rgba(0,0,0,.06), -14.6801px -11.1696px 33.2034px -2.8125px rgba(0,0,0,.05), -25.2781px -19.2334px 57.1739px -3.28125px rgba(0,0,0,.04), -46px -35px 104.042px -3.75px rgba(0,0,0,.02);
  --shadow-float: 0 0.636953px 1.14652px -1.125px rgba(0,0,0,.26), 0 1.9316px 3.47689px -2.25px rgba(0,0,0,.25), 0 5.10612px 9.19102px -3.375px rgba(0,0,0,.19), 0 16px 28.8px -4.5px rgba(0,0,0,.03);
}
```

### S5.2 색상 규칙 (MUST)

- **PART 1 §2.1 예외(✅ 시안 우선)**: 배경 `#000000`, 글자 `#ffffff`를 그대로 쓴다 (순수 흑·백 남용 금지 규칙의 예외, 코드 주석에 기록). 60:30:10 비율 규칙은 적용하지 않는다.
- **연두 `--color-accent`는 시안에서 3곳에서만 쓴다**: 중괄호 `{ }`, 푸터 이메일, 요금 `Focused` 카드 배경. 새 위치에 연두를 쓰지 않는다. 상태 전달(성공·오류)에도 쓰지 않는다.
- 활성·선택 상태는 연두 배경 + 검정 글자(요금 카드) 또는 밑줄·굵기로 표현한다. 색만으로 전달하지 않는다.
- 이미지 위 텍스트는 `--overlay-image`로 대비를 확보한다.
- **대비(✅ 계산)**: `#A6A6A6` / `#000000` ≈ **8.6:1** (AA 통과), `#82FF2E` / `#000000` 매우 높음, `#A6A6A6` / `#121212` ≈ 7.7:1.
  **`rgba(166,166,166,0.6)` / `#000000` ≈ 3.5:1 → 본문 AA(4.5:1) 미달.** 푸터 소개·저작권(14px)에 쓰이므로 **보고서에 대비 미달을 기록**하고, 사용자가 승인하면 `--color-text-muted`(`#a6a6a6`)로 올린다. 승인 전에는 시안 값을 유지한다.
- 포커스 링은 시안에 없으므로 **반드시 추가**한다: `outline: 2px solid var(--color-focus); outline-offset: 2px` (🔶).
- `mix-blend-mode: difference`·`exclusion`은 시안에서 워드마크·서브타이틀·SEE WORKS 버튼에 쓰인다 (§S6.4, §S6.11). 이 외에 쓰지 않는다.

---

## S6. 컴포넌트 값 & 박스 매핑

### S6.1 영역별 박스 구성

| 영역 | 겉박스 | 파티션 박스 구성 | 내용 박스 |
|---|---|---|---|
| 헤더 | `header.outer-box--header` | ① 로고 ② 내비 + 수상 배지 + 메뉴 버튼 | `nav` |
| 히어로 (홈) | `section.outer-box--hero` | 콜라주 + 워드마크 + 서브타이틀 | `.collage` |
| 선택 작업 (홈) | `section.outer-box--works` | ① 캡션 줄 ② 제목 블록 ③ 카드 그리드 | `.caption`, `.work-card` |
| 작업 쇼케이스 (홈) | `section.outer-box--showcase` | 캡션 줄 + 이미지 컨테이너 | `.caption`, `.parallax` |
| 제작 방식 (홈) | `section.outer-box--craft` | ① 라벨 + 제목 + 부제 ② 아코디언 | `.accordion` |
| 핵심 철학 (홈) | `section.outer-box--about` | ① 캡션 + 문장 ② 이미지 + 단락 | `.reveal-text`, `.caption` |
| 수상·고객사 (홈) | `section.outer-box--awards` | ① 제목 + 카운트 ② 표 | `table.awards` |
| 요금 (홈) | `section.outer-box--plans` | ① 제목 ② 단계 3개 ③ PDF 링크 | `.plan` |
| 아카이브 (홈) | `section.outer-box--bleed` | ① 캡션 ② 이미지 트랙 ③ 클로징 | `.gallery` |
| `/work` 목록 | `section.outer-box` | ① 소제목 + 태그라인 + 배지 ② 카드 목록 | `.work-card` |
| `/lab.x` 갤러리 | `section.outer-box--bleed` | ① 제목 + 부제 ② STUDY 트랙 | `.study-card` |
| `/contact` | `section.outer-box` | ① 제목 + 소개 + 인용 ② 폼 | `form.contact-form` |
| 푸터 | `footer.outer-box--footer` | ① 이메일 ② 워드마크 ③ 저작권 ④ 하단 줄 | — |
| 채팅 버튼 | (겉박스 밖, fixed) | — | `.floating-chat` |

### S6.2 헤더

- 시안에 헤더가 **없다**(1440 프레임에 내비 요소 없음). 아래는 🔶 임시이며 §S7 항목 2에서 확인한다.
- `position: fixed; inset: 0 0 auto 0; z-index: var(--z-header)`. 배경은 **투명**(`--color-bg` 위에 겹침)으로 시작하고 스크롤 시 `--color-bg`로 전환한다 (🔶).
- 구성: 로고(홈 링크, `aria-label="DRAFT.X 홈"`) · 내비 4개(`Home` `Works` `LAB.X` `Contact`, `link-sm` 스타일) · 수상 배지 · 모바일 메뉴 버튼. 현재 페이지 링크에 `aria-current="page"`.
- **모바일 메뉴**: `button[aria-expanded][aria-controls]`로 `Menu`/`Close`를 토글. 패널은 열릴 때 포커스를 안으로 옮기고 ESC·바깥 클릭으로 닫으며 닫힐 때 버튼으로 포커스를 돌려준다. 패널 안에는 내비 4개 + 수상 배지 + 카카오톡 링크.
- 스킵 링크 `본문 바로가기`를 헤더 앞에 둔다. 헤더 높이만큼 `main` 첫 섹션 상단에 여백을 둔다 (히어로는 풀블리드로 헤더 아래에 깔릴 수 있음 🔶).

### S6.3 캡션 줄 (`.caption-bar`)

```html
<div class="caption-bar">
  <p class="caption"><span>© SELECTED WORKS 24/26</span> <span>(DX. MASTERPIECE — 05)</span></p>
  <p class="caption caption--end">STRATEGIC AESTHETICS</p>
</div>
<hr class="line">
```

- ✅ 시안: 캡션 줄 `padding: 0 20px`, 높이 16px, 좌측 두 요소(`© …`, `( … )`)와 **우측 정렬 한 요소**, 아래 `16px` 간격 후 **전폭 1px 구분선** `--color-border`.
- 좌측 첫 요소 색 `--color-text-muted`, 둘째 요소는 `--color-text`, 우측 요소는 `--color-text-muted` (시안 `© AUR. A` · `(05. LUXURY BRANDING)` · `UNRIVALED ORIGINALITY`에서 확인한 패턴, 섹션마다 첫째·둘째 색이 같은지는 🔶).
- 캡션 줄은 `.part-box`(flex, `justify-content: space-between`)로 만들고 구분선은 겉박스 내부 별도 내용 박스(`hr`)로 둔다.
- 캡션 텍스트는 **원문 그대로** 입력한다. 순서·카운트는 원본 데이터다 (§S1.5).

### S6.4 히어로 (홈)

- 시안 `Section - Hero`: **432×270px 프레임, 검정 배경, 이미지 8개 + 워드마크 + 서브타이틀**. 시안에서 `opacity: 0`이므로 인트로(프리로더) 단계의 상태일 가능성이 있고, **최종 히어로의 크기·배치는 🔶**(§S7 항목 3). 확정 전에는 아래 구성을 `aspect-ratio: 432 / 270`인 **내용 박스(`.collage`) 안에서 %로 배치**한다.
- 이미지 8개(✅ 위치·크기를 프레임 폭 432px, 높이 270px 기준 %로 환산, 🧮):

| # | 이미지 | left | top | 폭 | 비율(w×h) | 투명도 | 모서리·그림자 |
|---|---|---|---|---|---|---|---|
| 1 | Woman On The Grass | 3.84% | 33.35% | 15.07% | 65.1×46.8 | 1 | `--radius-md` |
| 2 | Woman | 31.88% | 14.78% | 10.56% | 45.6×66.6 | 1 | `--radius-sm` + `--shadow-image` |
| 3 | Video(영상 자리, 정지 이미지로 대체) | 62.05% | 21.70% | 11.94% | 51.6×66.6 | 0.8 | `--radius-md` |
| 4 | Man Reading | 84.19% | 38.95% | 12.29% | 53.1×38.1 | 0.86 | `--radius-md` |
| 5 | Woman In The Red BG | 7.27% | 59.61% | 15.07% | 65.1×66.6 | 1 | `--radius-md` |
| 6 | Black Man | 31.84% | 73.87% | 12.29% | 53.1×38.1 | 1 | `--radius-sm` + `--shadow-image` |
| 7 | Room | 54.56% | 61.40% | 13.19% | 57×46.2 | 1 | `--radius-md` |
| 8 | Woman Garden Pose | 77.86% | 66.83% | 9.51% | 41.1×54.6 | 1 | `--radius-sm` + `--shadow-image` |

- 모든 이미지 위에 `--overlay-image`(검정 51%)를 덮고, 쌓임 순서는 1→8(뒤→앞), 워드마크가 9번째, 서브타이틀이 10번째다 (✅ `z-index 0~9`).
- **`position: absolute` 예외**: PART 2 §2.2의 "absolute 레이아웃 금지"는 **이 콜라주 내용 박스 안의 장식 이미지에 한해** 해제한다 (고정 비율 박스 안 % 배치, 모바일에서는 같은 박스를 축소). 코드 주석에 기록한다.
- 워드마크 `DRAFT.X`: `wordmark-md`(Anta 88.4px, 자간 +0.08em), `mix-blend-mode: difference`, 가운데 정렬, 프레임 폭 432px.
- 서브타이틀: 우측 정렬, `padding: 7.2px`, `gap: 9px`, `mix-blend-mode: exclusion`. 영문 4행은 `DM Sans 500 / -0.04em`, 시안 값은 12px(🔶 프레임이 축소되어 있음), 한글 서브카피는 시안에서 `4.2px`로 **축소 산출물**이라 값으로 쓰지 않는다. 실제 크기는 🔶(`body` 16px로 시작).
- `h1`은 영문 4행 헤드라인이다. 워드마크는 로고 역할이므로 `h1` 안에 넣지 않는다.
- 헤드라인 4행의 원문은 §S1.3을 따른다. `10+ years`와 다른 곳의 `20 years`가 어긋나 보이므로 **임의로 통일하지 않고** 사용자에게 확인한다 (§S7 항목 12).

### S6.5 작업 카드 (`.work-card`)

```html
<li class="work-card">
  <a class="work-card__link" href="/pages/work/muk.html">
    <img src="/assets/images/work-muk.webp" width="680" height="522" loading="lazy" alt="">
    <span class="visually-hidden">muk 작업 보기</span>
  </a>
</li>
```

- ✅ 박스: 카드 720×614.14px, `padding` 20px, 이미지 680×522.14px(`--radius-sm`). 2열 그리드는 **내용 박스(`ul.work-grid`)에서 grid**로 만든다 (`grid-template-columns: repeat(2, 1fr)`, `row-gap: var(--card-gap-y)`, 모바일 1열 🔶).
- 보이는 제목이 없으므로 링크 이름은 `.visually-hidden`으로 제공한다. 카드 하단 약 72px 영역의 내용은 §S7 항목 8에서 확인한다.
- **수상 배지(`.award-badge`)**: 첫 카드(`dra`) 이미지 위, 156×40px, 텍스트 `2026 // GDWEB DESIGN AWARDS WINNER PRIZE`(`link-sm` 12/13, 흰색, 대문자, +0.05em), 배경은 시안에서 이미지 `Rectangle`(156.27×39.61)이다. 이미지는 🔶(없으면 `--color-surface-2` 단색). 배지는 `dra` 상세로 가는 링크다.
- 호버 효과는 🔶. 확인 전에는 호버 변형을 넣지 않는다.

### S6.6 제작 방식 아코디언 (`.accordion`)

- 시안: 6개 항목이 **모두 닫힌(`Closed`) 상태**의 아코디언이다 (`All closed` 프레임). 열린 상태의 모습은 🔶(§S7 항목 4).
- 항목: `657×76px`, 배경 `--color-surface`(#121212), 테두리 1px `--color-border-soft`, 반경 `--radius-lg`(24px). 내부 제목 줄은 높이 28px, 제목 `body`(16/23, `--color-text`), 우측 **토글 버튼 28×28px 원형**(`--color-fill-soft`, 반경 100px)에 `+`/`–` 아이콘.
- 목록은 `665×499px`(6 × 76 + 5 × 약 8px 🧮), 항목 간 `gap: 8px`(🧮).
- 마크업은 `<details name="craft"><summary>…</summary><p>…</p></details>` 6개(`name`으로 하나만 열림). 토글 아이콘은 `summary::after` 또는 SVG로 만들고 `aria`는 `details`가 처리한다. 설명(`body-sm`, `--color-text-muted`)은 열렸을 때만 보인다.
- 좌측 열(517px): `{ High-end Digital Production }`(`body-en` 16px `--color-text-muted`, 중괄호 `brace`) → `h2 How we craft essentials`(`display-2`, 517×159) → 부제 `DRAFT.X : 우리가 본질을 빚어내는 방식`(`body` 14px). 열 `padding-top: 34px; gap: 10px`.
- 좌우 열은 `.part-box`(flex, `gap: 58px`)로 나눈다: 좌 `flex: 0 0 517px`, 우 `flex: 1 1 665px`. 모바일은 `flex-wrap: wrap`으로 쌓는다.
- 번호를 붙이지 않는다(원본에 없음). 6개 문구는 §S1.3을 그대로 쓴다.

### S6.7 수상·고객사 표 (`table.awards`)

- 제목 `Awards`(`display-1` 166px)와 `(27)`(`title-1` 44px)이 있고 섹션 정렬은 `align-items: flex-end`(우측 정렬, 🔶 어느 요소가 우측인지는 §S7 항목 6).
- 각 행: 위 경계선 1px `--color-border`. 셀 스타일(✅): 분류 `label-lg`(17px, `--color-text`), 고객사·연도 `body`(16/22, `--color-text-muted`), 내용 `body`(16/22, `--color-text`). 열 폭·행 높이는 🔶.
- 시안에 보이는 행은 **4개**(`Awards`, `Awards`, `Brands`, `Awards`). 텍스트 스냅샷에는 `한국은행`까지 5개이고, 분류 라벨 `Awwwards`는 **시안에 없다**(`Awards`/`Brands`만 확인) — 스냅샷의 `Awwwards`는 오타일 가능성이 높으므로 **`Awards`로 통일**하되 §S7 항목 6에서 확인한다.
- 카운트 `(27)`과 보이는 행 수가 어긋나는 것은 원본 데이터다. **숫자를 바꾸지 않는다.**
- 데이터 표이므로 `<table>` + `<caption class="visually-hidden">수상 및 고객사</caption>` + `th scope`. 모바일에서는 마크업은 `table`로 유지한 채 CSS로 행을 블록으로 쌓는다.

### S6.8 요금 3단계 (`.plan`)

- ✅ 카드: 폭 386.67px × 높이 316.64px, 3열(`--tier-gap` 20px, 합 1200px), `padding: 20px 20px 57px`, `gap: 32px`, 테두리 1px `--color-border-strong`, 반경 `--radius-md`.
- 카드 상단(높이 94px, `gap: 19px`): 아이콘 박스 40×40px(`--color-surface-2`, 반경 `--radius-xs`, 아이콘 내용 🔶) + 단계명(`Essential` 등, `body-en` 14px) + 한 줄 소개(`title-3` 22/24, 700).
- 구성 항목 3개(`body-sm`, `--color-text-muted`), 하단 **태그**(`Fast & Sharp` 등, 배경 `--color-surface-2`, 반경 `--radius-tag`, 글자 16px `--color-text-muted`).
- **`Focused` 상태**(✅): 배경 `--color-accent`, 글자 `--color-text-inverse`(태그 글자 포함), 반경 `--radius-md`. 시안에서 가운데(`Signature`) 카드에 해당한다. 정적 강조인지 호버·포커스 상태인지는 🔶 — 확인 전에는 **호버·포커스 시 반응하는 상태**로 구현하고 `Signature`를 정적 강조로 만들지 않는다. 가격 숫자·할인·`추천` 배지를 만들지 않는다.
- 구조: `h3`(한 줄 소개) + 단계명 + `ul`(구성) + 태그. 구성은 순서 정보가 아니므로 번호를 붙이지 않는다.
- `Master Process Guide (PDF)` 링크는 Google Drive 문서다. 외부 링크 규칙(§S1.4)을 따르고 이름에 `PDF`·`새 창`을 포함한다.
- PART 1 §6 "동일 카드 N개" 회피 규칙은 이 영역에 한해 **비교 목적이므로 허용**한다.

### S6.9 갤러리·슬라이더 (아카이브, `/lab.x`)

- ✅ 아카이브 트랙: 높이 267px, 목록 `padding: 20px`, 항목 간 `gap: 10px`, 항목 폭 약 154~170px(시안 5개 항목: 154×110, 165×245, 154×115.5, 154×124, 170×171.5). 시안이 **축소된 폭**일 수 있으므로 비율만 ✅, 실제 크기는 🔶(§S7 항목 9).
- 항목은 비율을 유지한 채 세로 정렬은 위 정렬(`align-items: flex-start`, 시안 `List`).
- 기본은 **가로 스크롤 + 스냅**(§S3.6). 자동 이동·무한 루프 연출을 쓴다면 반드시 지킨다.
  - **일시정지 버튼** 제공 (WCAG 2.2.2), `prefers-reduced-motion: reduce`이면 **정지 상태로 시작**.
  - 루프용 복제 요소는 `aria-hidden="true"` + `inert`로 두어 스크린리더가 **한 번만** 읽게 한다.
  - 키보드로 접근할 수 있고, 포커스가 들어가면 이동을 멈춘다.
- `/lab.x` 항목은 `STUDY NO.###` + 영문 제목 + 이미지. 시안에 이 프레임이 없고, 원본에 `001`(3자리)과 `24`(2자리)가 섞여 있으므로 **번호 형식을 임의로 통일하지 말고** §S7 항목 10에서 확인한다.
- 아카이브 아래 클로징: `Defining the Essence, Designing the Future.`(`label-lg` 17/20, `--color-text`) + 한글 인용문(738px 폭, 23px 줄 높이, `body`). 인용 블록 폭·정렬은 🔶.

### S6.10 문의 폼 (`/contact`)

시안에 `/contact` 프레임이 없으므로 모양은 🔶이고 아래는 구조·접근성 규칙이다.

| 필드 | 라벨(원문) | 입력 | 속성 |
|---|---|---|---|
| 브랜드명 | `Brand Name` | `input[type=text]` | `autocomplete="organization"`, 필수 |
| 이메일 | `Email` | `input[type=email]` | `autocomplete="email"`, `inputmode="email"`, 필수 |
| 프로젝트 비전 | `Project Vision & Core Essence` | `textarea` | 필수 |
| 제출 | `Request Strategic Definition` | `button[type=submit]` | |

- 입력 필드 색은 다크 토큰으로 시작한다: 배경 `--color-surface`, 글자 `--color-text`, 테두리 `--color-border-strong`, 포커스 `--color-focus`. 입력 글자 16px(`body`, iOS 확대 방지).
- 라벨은 항상 보이는 `<label>`(`caption` 스타일). placeholder를 라벨로 쓰지 않는다. 필수 표시는 3개 모두 필수이므로 폼 상단에 한 줄로 안내한다.
- 제출 버튼 문구는 **원문 유지**(PART 1 §3.2 "능동형·행동 설명" 규칙의 사이트 예외, 코드 주석에 기록). 버튼 스타일은 `SEE WORKS`와 같은 pill(§S6.11).
- 오류 메시지는 한국어로 **원인 + 해결 방법**: `이메일 형식이 올바르지 않습니다. 예: name@example.com`. 필드 근처에 `aria-describedby`로 연결, 색 + 아이콘 + 텍스트 병행(`--color-danger`).
- 로딩·성공·오류 3상태를 구현한다. 성공 메시지는 `aria-live="polite"` 영역에 표시.
- **전송 방식은 🔶**(§S7 항목 14). 정적 사이트에는 서버가 없으므로 `config.js`의 `CONTACT_ENDPOINT`가 **비어 있으면 `mailto:draftx.co@gmail.com` 방식으로 동작**하고, 값이 있으면 `fetch`(PART 2 §3.3 래퍼)로 전송한다. 서드파티 폼 서비스는 사용자 승인 없이 추가하지 않는다.
- 스팸 방지용 honeypot 필드(시각적·접근성 숨김)를 포함한다.

### S6.11 버튼·링크 (`SEE WORKS`)

- ✅ `SEE WORKS`: 크기 170.14×44px, `padding: 12px 18px`, 반경 `--radius-pill`, 글자 `link-lg`(23/20, 700, 대문자, 자간 -0.3px), `mix-blend-mode: difference`. 글자가 **한 글자씩 분리된 요소**(시안에서 글자 하나당 텍스트 레이어)이므로 글자 단위 모션(호버 시 굴림 효과 등)이 있었다고 보되 모션은 🔶.
- 배경·테두리·글자색은 시안에서 확인하지 못했다 (🔶, `difference` 블렌드로 흰 배경 + 반전 글자일 가능성). 확인 전에는 **테두리 1px `--color-text` + 투명 배경 + 흰 글자**의 pill로 구현하고, 블렌드 모드는 넣지 않는다.
- 클릭 영역은 높이 44px(✅ = `--hit-min`)을 지킨다. 마우스 호버(`@media (hover: hover)`)와 `:focus-visible` 상태를 정의한다.
- 라벨 끝 `→`는 쓰지 않는다 (시안 레이어 이름은 `Secondary Button → Link - Primary`일 뿐 화살표 글리프가 아니다).

### S6.12 푸터

- ✅ 구성(위→아래): ① 이메일 `{ Email : draftx.co@gmail.com }`(`email` 16/19, 연두, 중괄호는 `brace`, 가운데 정렬) ② **거대 워드마크 `DRAFT.X`**(`wordmark-lg` Anta 338.3px, 폭 1400px = 겉박스 `--gutter: 20px`, `mix-blend-mode: difference`) ③ 저작권 `© 2026 DRAFT.X. All Rights Reserved.`(`footer` 14px, 가운데) ④ 하단 줄: 위 경계선 1px `rgba(187,187,187,.2)` + 높이 17px 행(좌·우 각 572px, 우측에 소개 문구 우측 정렬).
- 소개 문구: `DRAFT.X | Remote Based Global Studio 20 Years of Heritage. Defining the Essence of Identity.`(`footer` 14px, `--color-text-faint`). 하단 줄 좌측 내용(`Top` 링크로 추정)은 🔶.
- 겉박스: `padding-top: 160px`, `gap: 50px`, 배경 `--color-bg`. 푸터는 **한 번만** 렌더링한다 (원본의 3회 중복 금지).
- 거대 워드마크는 장식이므로 `aria-hidden="true"`로 숨기고(브랜드명은 소개 문구에 이미 있음) 텍스트 선택을 막지 않는다. `Top` 링크는 `href="#top"`.
- 이메일 링크는 `mailto:`. 연도는 원문(`2026`)을 그대로 쓰고 JS로 동적 생성하지 않는다.

### S6.13 카카오톡 채팅 버튼 (`.floating-chat`)

- ✅ 시안: **60×60px 원형**(반경 200px), 배경 `--color-surface-2`(#222222), 그림자 `--shadow-float`, 위치 `right: 32px; bottom: 32px`, `z-index: 1`, 안의 아이콘 31×29px(흰 말풍선 도형 + `#222222` 점 3개).
- `body` 마지막의 `<aside>` 안 `<a>`: `href="https://pf.kakao.com/_ANXIX/chat"`, `target="_blank"`, `rel="noopener noreferrer"`, 이름 `카카오톡으로 상담하기 (새 창)`. `position: fixed; z-index: var(--z-chat)`, 60px ≥ 44px.
- 아이콘은 **직접 그린 SVG 말풍선**(`currentColor`)을 쓴다. 외부 브랜드 SDK·아이콘 파일은 추가하지 않는다.
- 푸터가 버튼에 가리지 않도록 푸터 겉박스 `padding-bottom`에 `--chat-size + --chat-offset`을 더한다.
- 헤더 메뉴(및 모바일 패널)에도 같은 링크가 있으면 **같은 문구**를 쓴다.

### S6.14 모션 (시안에서 읽은 구조 ✅ / 타이밍·이징 🔶)

시안 레이어 이름과 구조에서 확인한 모션은 아래 8가지다. **이 목록 밖의 모션을 만들지 않는다.** 모든 타이밍·이징은 🔶이며 §S7 항목 5에서 확인한다.

| # | 모션 | 근거(시안) | 구현 규칙 |
|---|---|---|---|
| 1 | **인트로(프리로더)** | `Section - Hero` 검정 화면, 이미지 8개 + 워드마크 + 서브타이틀, `Loader → Filler`(검정 `opacity .9`, 화면 밖 `left: 432px`에서 슬라이드) | JS가 꺼지거나 `prefers-reduced-motion`이면 **건너뛰고** 최종 히어로를 바로 보여준다. 콘텐츠를 가리는 시간은 🔶 상한 2초 |
| 2 | **단어 단위 리빌** | `Reveal Text`: 문장이 **단어마다 별도 요소**(`Blending `, `intuitive `…). 대상: `Masterful aesthetics, strategic precision.`(88px)과 핵심 철학 문장(79px) | 마크업은 한 문장 `<p>` 안의 `<span>` 단어. 스크롤 진입 시 단어별 `opacity` 단계 전환 (`IntersectionObserver`). 스크린리더는 전체 문장을 한 번에 읽게 한다(`aria-label` 없이 텍스트 그대로). reduced-motion이면 전부 즉시 표시 |
| 3 | **시차(parallax) 이미지** | `Section - Parallax Image`: 컨테이너 1400×780, 이미지 1400×1068.59가 `top: 75.56%`로 아래에 위치 | 이미지가 컨테이너보다 크고 `transform: translateY`로 이동. `overflow: hidden`, `transform`만 사용. reduced-motion이면 정지 |
| 4 | **아코디언 열기/닫기** | `Closed` 상태, 토글 버튼 | `<details>`; 높이 애니메이션 금지(PART 1 §2.5) — `grid-template-rows` 또는 `opacity`/`transform`로 대체 |
| 5 | **요금 카드 상태 전환** | `Default` → `Focused`(연두 배경) | 배경색 전환만 (`--duration-base`) |
| 6 | **SEE WORKS 글자 모션** | 글자마다 레이어 | 호버 시 글자 단위 전환. `aria-label`로 전체 텍스트를 제공하고 글자 `span`은 `aria-hidden` |
| 7 | **블렌드** | `mix-blend-mode: difference/exclusion` | 워드마크·서브타이틀·버튼에만. 대비가 깨지는 배경 위에서는 쓰지 않는다 |
| 8 | **아카이브 트랙 이동** | 가로 목록, 화면 밖으로 이어지는 `right: -36px` | §S6.9의 일시정지·정지 규칙 |

- PART 1 §2.5의 "사용자 행동과 무관한 모션은 페이지당 1개 연출" 제한은 이 사이트에서 **위 8종에 한해 완화**한다 (사이트의 핵심 정체성). 새 연출을 추가하지 않는다.
- 토큰은 PART 1 §2.5(`--duration-*`, `--ease-standard`)를 🔶 임시로 쓴다. `transform`·`opacity`만 애니메이션한다.
- `prefers-reduced-motion: reduce`이면 1·2·3·6·8은 **연출 없이 최종 상태**로 즉시 표시한다. JS가 꺼져도 모든 콘텐츠가 보여야 한다.
- 성능: 인트로 이미지는 8장 모두 작게(콜라주 폭의 %) 쓰므로 `loading="eager"`를 쓰는 것은 **최종 히어로에 필요한 1~2장**으로 제한한다.

---

## S7. 남은 확인 항목 (🔶 → ✅)

시안(Figma, 1440px 데스크톱)에 없는 값만 DevTools로 **배포 사이트**에서 확인한다. 뷰포트 **390px / 810px / 1200px / 1440px / 1920px**에서 실행한다. 시안 값과 배포 값이 다르면 **배포 값으로 교체**하고 변경 이력에 기록한다.

| # | 확인 항목 | 이유 |
|---|---|---|
| 1 | **브레이크포인트 전환점**과 모바일·태블릿의 섹션 패딩·gutter·글자 크기 | 시안에 1440 프레임만 있음 (§S3.1, §S3.3) |
| 2 | **헤더**(투명/불투명, 높이, 내비 글자, 모바일 메뉴 패널) | 시안에 헤더 없음 (§S6.2) |
| 3 | **히어로 최종 크기·배치**, 인트로 이후 화면 | 시안은 `opacity: 0`인 432×270 프레임 (§S6.4) |
| 4 | **아코디언 열린 상태**(설명 글자 크기·색·높이) | 시안은 닫힌 상태만 (§S6.6) |
| 5 | **모션 타이밍·이징** (인트로, 리빌, 시차, 아코디언, 카드, 글자 모션) | 레이어 구조만 확인 (§S6.14) |
| 6 | **수상 표**: 열 폭·정렬, 행 수, 분류 라벨(`Awwwards` 여부) | 시안 행 4개, 스냅샷 5개 (§S6.7) |
| 7 | **`SEE WORKS` 색·배경**, 호버 | 글자 레이어만 확인 (§S6.11) |
| 8 | **작업 카드 하단 72px 영역**과 호버 | 이미지 외 내용 불명 (§S6.5) |
| 9 | **아카이브 항목 실제 크기**(시안은 154~170px) | 축소 가능성 (§S6.9) |
| 10 | `/lab.x` **STUDY 24개 제목·번호 형식**, `/contact` **소개 문단·인용문·폼 모양** | 시안에 해당 프레임 없음 |
| 11 | **푸터 이메일**: 시안 `surpas250@gmail.com` vs 배포 `draftx.co@gmail.com` | 불일치 (§S1.4) |
| 12 | 히어로 `10+ years` vs 다른 곳 `20 years` | 원문 불일치, 임의 통일 금지 |
| 13 | **한글 본문 서체**(시안 이름 `SansSerif`), 네이버 인증 메타, 작업 상세 페이지 범위 | 자리표시자 / 소유자 확인 / 미확인 |
| 14 | **문의 폼 전송 방식**(mailto / 폼 서비스 / 서버) | 정적 사이트에서 결정 필요 |
| 15 | **포커스 링**·호버 상태 | 시안·스냅샷에 없음 |

```js
(() => {
  const pick = (el, props) => { const cs = getComputedStyle(el); return Object.fromEntries(props.map((p) => [p, cs[p]])); };
  // 서체·크기·행간·굵기·자간·색
  const sels = ['h1', 'h2', 'h3', 'p', 'nav a', 'a', 'button', 'footer p', 'footer a'];
  console.table(sels.map((s) => { const el = document.querySelector(s);
    return el ? { s, text: el.textContent.trim().slice(0, 24), ...pick(el, ['fontFamily', 'fontSize', 'lineHeight', 'fontWeight', 'letterSpacing', 'textTransform', 'color']) } : { s }; }));
  // 배경·색
  console.table([document.body, document.querySelector('header'), document.querySelector('footer')].filter(Boolean)
    .map((el) => ({ tag: el.tagName, ...pick(el, ['backgroundColor', 'color']) })));
  // 큰 박스의 폭·여백·간격 (섹션 패딩 확인)
  const boxes = [...document.querySelectorAll('div, section')].filter((d) => { const r = d.getBoundingClientRect(); return r.width > 300 && r.height > 120; }).slice(0, 40);
  console.table(boxes.map((d) => { const r = d.getBoundingClientRect(), cs = getComputedStyle(d);
    return { w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), top: Math.round(r.top + scrollY), maxW: cs.maxWidth, pad: cs.padding, gap: cs.gap, radius: cs.borderRadius }; }));
  // 로드된 폰트, 미디어쿼리(브레이크포인트)
  console.log('fonts', [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status}`));
  console.log('media', [...new Set([...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } })
    .filter((r) => r.media).map((r) => r.media.mediaText))]);
  // 포커스 링
  const a = document.querySelector('a, button'); a && a.focus();
  console.log('focus outline', a && getComputedStyle(a).outline);
})();
```

실측 후 결과를 에이전트에 전달하면 해당 🔶 항목을 ✅로 교체하고 변경 이력에 기록한다.

---

# PART 4. 최종 체크리스트 (완료 전 필수 통과)

## Designer 체크

- [ ] 모든 색·글자·간격·그림자·라운드가 **토큰**을 사용한다 (하드코딩 0건)
- [ ] 텍스트 대비 4.5:1 / UI 3:1 이상이다
- [ ] 타입 스케일·8pt 간격 규칙을 따른다
- [ ] 모든 인터랙티브 요소의 5가지 상태가 정의되어 있다 (focus-visible 포함)
- [ ] 터치 타깃이 44px 이상이다
- [ ] 360 / 390 / 768 / 1024 / 1440px에서 깨지지 않는다
- [ ] 모션은 의미가 있고 `prefers-reduced-motion`을 지원한다
- [ ] 문구가 능동형·일관된 어체이며 오류 메시지는 해결 방법을 안내한다
- [ ] "범용 AI 디자인" 패턴을 무의식적으로 쓰지 않았다
- [ ] 색·글자·박스 값이 **PART 3 토큰**과 일치한다 (🔶 항목을 실측값으로 단정하지 않았다)
- [ ] 글자·색·간격·반경이 PART 3 토큰만 사용하고(연두 `--color-accent`는 §S5.2의 위치에만), 시안에 없는 시각 값을 임의로 추가하지 않았다
- [ ] 원본의 중복 렌더링 블록을 복제하지 않았고(문구·이미지 1회), 페이지당 `h1`이 하나이며 `alt`를 실제 내용에 맞게 썼다
- [ ] 모션은 PART 3 §S6.14의 8종뿐이고, `prefers-reduced-motion`에서 최종 상태로 즉시 표시되며 자동 이동에 일시정지 버튼이 있다

## Developer 체크

- [ ] HTML 유효성: `lang`, 단일 `h1`, 단일 `main`, 제목 레벨 순서, `alt`, `label` 확인
- [ ] 클릭 가능한 모든 요소가 `button`/`a`이고 **키보드만으로 조작**된다
- [ ] 인라인 스타일·인라인 이벤트·`id` 선택자·`!important`·`var` 없음
- [ ] `innerHTML`로 외부/사용자 입력을 삽입하지 않았다
- [ ] 로딩·성공·오류·빈 상태가 모두 구현되었다
- [ ] 콘솔 에러/경고 0건, `console.log` 제거
- [ ] 이미지에 `width/height`가 있고 CLS가 발생하지 않는다
- [ ] Lighthouse(모바일): Performance / Accessibility / Best Practices / SEO 모두 **90+**
- [ ] 프로젝트 구조·네이밍 규칙을 따랐고 불필요한 파일 변경이 없다
- [ ] 변경 사항 보고(§8.3)를 작성했다
- [ ] 페이지가 **겉박스 > `.inner-box` > 파티션 박스** 구조이고, 페이지 골격에 Grid가 없다 (PART 3 §S2 체크 통과)

---

## 부록: 규약 위반 시 에이전트의 행동

1. 사용자의 요청이 이 규약과 **충돌**하면 → 규약을 지킨 대안을 제시하고, 사용자가 명시적으로 원하면 **위반 사유를 코드 주석과 보고에 기록**한 뒤 진행한다.
2. 규약에 **없는 상황**이면 → 기존 코드의 패턴을 따르고, 새 패턴을 만들었다면 이 문서에 추가할 항목을 제안한다.
3. 이 문서는 **살아있는 문서**다. 프로젝트 진행 중 합의된 변경은 즉시 반영하고, 변경 이력을 아래에 기록한다.

| 날짜 | 변경 내용 | 작성자 |
|---|---|---|
| 2026-11-02 | 최초 작성 | — |
| 2026-11-02 | PART 3(SITE SPECIFIC) 추가: 박스 구조(겉박스>속박스>파티션), 박스·글자·색상 토큰(임시), 일반 규칙 중 Grid 관련 항목 수정 | — |
| 2026-11-02 | 원본 HTML/CSS 분석 반영: PART 3의 임시값을 실측값(✅)으로 교체, 브레이크포인트 769/1280/1920, 팔레트·글자 크기·컴포넌트 값 확정, 일반 규칙의 8pt·타입·브레이크포인트 항목에 사이트 우선 주석 추가 | — |
| 2026-11-03 | 타깃 사이트를 draftx.co.kr로 변경: PART 3 전면 교체. 텍스트 스냅샷(구조·문구) + Figma CSS 1440w 내보내기(다크 테마 팔레트, 서체 4종, 글자·박스·반경·그림자 ✅ 실측) 반영, 모바일·헤더·모션 타이밍·호버는 🔶. §S2 박스 규칙 유지, 사이트 전용 규칙(캡션 표기 예외, 중복 블록 금지, 모션 8종, 갤러리 일시정지, 문의 폼 전송 방식) 추가, PART 1·4 주석 갱신 | — |
