# 두 번째 섹션 스크롤 모션

실제 구현은 `index.html`, `css/`, `js/modules/scroll-motion.js`에 반영되어 있습니다. 아래 코드는 구조와 핵심 연결을 보여주는 발췌이며, 기존 페이지에 중복해서 붙이지 않습니다.

## HTML

CDN은 Tailwind Browser 4.1.18, GSAP/ScrollTrigger 3.13.0, Lenis 1.3.27로 고정했습니다. `index.html`의 실제 태그에는 다운로드한 파일의 SHA-384 무결성 값과 `crossorigin="anonymous"`를 적용했습니다.

```html
<script defer src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.18/dist/index.global.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.3.27/dist/lenis.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lenis@1.3.27/dist/lenis.css">

<section class="outer-box outer-box--selected" id="works"
  aria-labelledby="selected-title" data-scroll="selected-section">
  <div class="inner-box selected-screen">
    <!-- 기존 캡션 줄 -->
    <div class="part-box selected-content">
      <h2 class="selected-title" id="selected-title" data-js="selected-title">
        <span class="selected-title__word selected-title__light" data-js="selected-word">Masterful</span>
        <span class="selected-title__word selected-title__light" data-js="selected-word">aesthetics,</span>
        <span class="selected-title__word" data-js="selected-word">strategic</span>
        <span class="selected-title__word" data-js="selected-word">precision.</span>
      </h2>
      <p class="selected-description">숙련된 감각이 빚어낸 미학,<br>비즈니스의 격을 높이는 정교한 전략.</p>
      <a class="selected-link" href="https://draftx.co.kr/work">SEE WORKS</a>
    </div>
    <figure class="selected-media" data-js="selected-media">
      <video class="selected-media__video" autoplay muted loop playsinline
        preload="metadata" aria-label="디지털 브랜드 프로젝트 쇼케이스" data-js="selected-video">
        <source src="./images/img-dt/02-middle-video.mp4" type="video/mp4">
      </video>
      <!-- 실제 페이지에는 접근 가능한 일시정지/재생 버튼도 포함 -->
    </figure>
  </div>
</section>
```

## CSS

시각 값은 `css/tokens.css`, 박스 배치는 `css/layout.css`, 컴포넌트 스타일은 `css/main.css`에 있습니다. 주요 스타일은 다음과 같습니다.

```css
.outer-box--selected { background: var(--color-bg); overflow: clip; }
.selected-screen { position: relative; min-height: 100svh; }
.selected-title { color: var(--color-selected-dim); line-height: var(--selected-title-leading); }
.selected-title__word { display: inline-block; }
.selected-title__light { color: var(--color-text); }
.selected-media {
  position: absolute;
  top: var(--selected-media-top);
  right: var(--selected-media-right);
  width: var(--selected-media-width);
  aspect-ratio: var(--selected-media-ratio);
  overflow: hidden;
  border-radius: var(--radius-md);
}
.selected-media__video { display: block; width: 100%; height: 100%; object-fit: cover; }
html.lenis { scroll-behavior: auto; }
html.lenis.lenis-stopped { overflow: clip; }
```

## JavaScript 핵심

아래는 `scroll-motion.js`의 핵심 연동만 간추린 예시입니다. 전체 구현은 메뉴 잠금, 앵커 이동, 키보드 포커스, 반응형 재설정, CDN 실패 시 일반 스크롤, 모션 감소 설정도 처리합니다.

```js
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: 0.085, autoRaf: false, syncTouch: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((seconds) => lenis.raf(seconds * 1000));
gsap.ticker.lagSmoothing(0);

gsap.fromTo(media, { y: () => innerHeight * 0.18, scale: 0.96 }, {
  y: 0,
  scale: 1,
  ease: 'none',
  scrollTrigger: {
    trigger: section,
    start: 'top bottom',
    end: 'top top',
    scrub: 0.65,
    invalidateOnRefresh: true,
  },
});
```

조정값은 `js/config.js`에 모았습니다. `lerp`가 작을수록 감속이 길어지고, `scrub`이 클수록 타이틀·카드가 스크롤을 느리게 따라갑니다. 카드 이동 비율은 데스크톱 0.18, 태블릿 0.12, 모바일 0.06입니다. 이 값들은 이번 구현의 조정값입니다.

연동 기준: [Lenis 공식 GSAP 예제](https://github.com/darkroomengineering/lenis#gsap-scrolltrigger), [GSAP ScrollTrigger 문서](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

검증: JavaScript 문법, 단일 ticker/시간 단위, 헤더 표시 전환, 모바일 메뉴 잠금, 앵커 이동, 모션 감소/라이브러리 로드 실패 시 일반 스크롤과 정리 동작을 Node에서 확인했습니다. 브라우저의 실제 영상·모션 및 뷰포트별 화면은 별도 검수가 필요합니다.
