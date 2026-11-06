# NOTICE 게시판 구현

## 디자인 계획
- 목적: DRAFT.X의 공지를 찾고 글을 작성·수정합니다.
- 기준: 이 채팅에서 승인한 두 번째 Anta PNG와 바이브 코딩 프롬프트. 가상 공지 27개를 사용합니다.
- Color: 검정 #000000, 화이트 #f5f5f3, 보조 회색 #858585, 구분선 #282828, 입력 배경 #090909, 입력 테두리 #666666.
- Type: NOTICE/워드마크 Anta, 기존 DM Sans 및 한글 폴백.
- Layout: outer-box > inner-box > part-box, 가로 중앙 정렬, 본문은 흐름 배치.

HEADER
CAPTION / NOTICE
LIST 또는 DETAIL 또는 WRITE 또는 EDIT
BACK TO TOP
FOOTER

- Principles: 큰 Anta 제목 한 곳에 시선을 모으고, 구분선·표·흰색 반전 pill 버튼으로 정보를 정리합니다. 일반적인 기본 디자인 대신 승인 PNG의 레이아웃과 서체를 재현합니다.
- 기존 규약과의 차이: 사용자 명시 요청에 따라 Anta를 NOTICE에도 사용하며 화살표 버튼, 새로운 캡션·문구, 48px 여백, 809/1199px 시안을 적용합니다. 접근성과 기존 헤더·푸터는 보존합니다. 작은 버튼의 터치 영역은 44px로 확보합니다. 원본 사이트 실측값으로 주장하지 않습니다.

## 파일과 실행
- pages/notice.html: 목록
- pages/notice-view.html?id=notice-027: 상세
- pages/notice-write.html: 작성
- pages/notice-edit.html?id=notice-027: 수정
- pages/notice-auth.html: 이메일 로그인 및 회원가입
- 순수 정적 프로젝트이므로 프롬프트의 /notice 라우트를 위 HTML 파일과 쿼리로 매핑합니다. HTTP 서버에서 프로젝트 루트를 열어 사용합니다. ES Modules와 첨부파일 저장을 위해 file:// 직접 실행은 권장하지 않습니다.

## 저장 및 보안
- 게시글은 Firebase 프로젝트 `jayomi-web-project`의 Firestore `notices` 컬렉션에 저장합니다. 최초 접속 시 컬렉션이 비어 있으면 기본 공지 27개를 등록합니다. 이전 브라우저의 `localStorage` `draftx:notice:posts` 데이터는 Firestore에 없는 글만 한 차례 이전하며, 기존 Firestore 문서는 덮어쓰지 않습니다. 이전 표식은 해당 브라우저의 localStorage에 남습니다.
- 첨부파일 본체는 기존처럼 IndexedDB `draftx-notice-files`에 저장하고 Firestore에는 파일 메타데이터만 보관합니다. 따라서 첨부파일은 글을 올린 브라우저에서만 내려받을 수 있으며, 다른 브라우저·기기에서 사용할 수 없습니다. 기존 로컬 데이터와 첨부파일은 수동 백업 전까지 삭제하지 않습니다.
- Firebase Web SDK는 브라우저 ES Module CDN으로 불러옵니다. 실제 Firestore 읽기·쓰기 권한은 Firebase Console의 보안 규칙에 따릅니다. 로그인 없는 전체 공개 쓰기 규칙은 제3자가 게시글을 변경하거나 삭제할 수 있으므로 운영 DB에 설정하지 않습니다. 규칙을 준비하지 못한 경우 데이터 연결 오류를 화면에 표시합니다.
- Firebase 웹 API 키는 클라이언트에서 노출되는 식별자이며 비밀 키가 아닙니다. Firebase 프로젝트에서 사용할 웹사이트의 HTTP referrer 제한을 설정하고, 데이터 접근은 반드시 Firestore 보안 규칙으로 통제합니다.
- 로컬 전용 테스트용 Firestore Emulator 연결은 `js/firebase.js`의 `USE_FIRESTORE_EMULATOR`를 `true`로 바꾸고 Emulator를 실행했을 때만 사용합니다. 이 설정은 `localhost`에서만 적용됩니다. Emulator용 규칙은 Emulator에만 적용하고 실제 Firebase Console에 배포하지 않습니다.
- 로그인은 Firebase Authentication 이메일/비밀번호 방식을 사용합니다. 가입 시 이름·아이디·비밀번호·이메일을 받고, 이메일 중복은 Authentication이, 아이디 중복은 Firestore `usernames/{소문자아이디}` 문서가 검사합니다. Firebase 기본 로그인 정책상 비밀번호는 6자 이상이어야 합니다. 이메일 인증·비밀번호 재설정은 별도 구현 범위입니다.
- 일반 회원은 자신의 프로필만 읽을 수 있고, 요청 명세에 맞춰 `role: "ueser"`로 가입됩니다. 관리자 전용 아이디와 이메일은 공개 가입에서 예약합니다. 공지 작성·수정·삭제는 화면에서 숨기는 것뿐 아니라 `firestore.rules`에서도 `users/{uid}.role == "admin"`일 때만 허용합니다. 역할 문서는 클라이언트가 수정할 수 없습니다.
- 로그인 상태·환영 문구·로그아웃은 공통 사이트 헤더(홈, NOTICE, VELO)에 표시합니다. 로그인/회원가입 페이지는 전용 NOTICE 디자인을 적용하지 않고 공통 사이트 스타일을 사용하며, 로그인 전 진입했던 허용된 페이지로 돌아옵니다.
- Firebase Console의 Authentication에서 Email/Password 제공업체를 활성화하고, Firestore Rules에 저장소의 `firestore.rules` 내용을 게시해야 합니다. Firebase Console에서 관리자를 수동 생성할 때는 Authentication에 관리자의 이메일 계정을 만든 뒤, 발급된 UID로 Firestore에 `users/{uid}` (필드: `name`, `username`, `usernameKey`, `email`, `role: "admin"`, `createdAt`)와 `usernames/admin` (`uid`)를 생성합니다. `createdAt`은 타임스탬프로 입력합니다. 제공된 초기 비밀번호는 Firebase 최소 길이보다 짧으므로 Console에서 6자 이상의 임시 비밀번호를 설정하고 첫 테스트 후 교체해야 합니다. 비밀번호는 코드나 Firestore에 저장하지 않습니다.
- 로그인은 Firebase Authentication 이메일/비밀번호 방식을 사용합니다. 가입 시 이름·아이디·비밀번호·이메일을 받고, 이메일 중복은 Authentication이, 아이디 중복은 Firestore `usernames/{소문자아이디}` 문서가 검사합니다. Firebase 기본 로그인 정책상 비밀번호는 6자 이상이어야 합니다. 이메일 인증·비밀번호 재설정은 별도 구현 범위입니다.
- 일반 회원은 자신의 프로필만 읽을 수 있고, `role: "user"`로만 가입됩니다. 공지 작성·수정·삭제는 화면에서 숨기는 것뿐 아니라 `firestore.rules`에서도 `users/{uid}.role == "admin"`일 때만 허용합니다. 역할 문서는 클라이언트가 수정할 수 없습니다.
- Firebase Console의 Authentication에서 Email/Password 제공업체를 활성화하고, Firestore Rules에 저장소의 `firestore.rules` 내용을 게시해야 합니다. Firebase Console에서 관리자를 수동 생성할 때는 Authentication에 관리자의 이메일 계정을 만든 뒤, 발급된 UID로 Firestore에 `users/{uid}` (필드: `name`, `username`, `usernameKey`, `email`, `role: "admin"`, `createdAt`)와 `usernames/admin` (`uid`)를 생성합니다. `createdAt`은 타임스탬프로 입력합니다. 제공된 초기 비밀번호는 Firebase 최소 길이보다 짧으므로 Console에서 6자 이상의 임시 비밀번호를 설정하고 첫 테스트 후 교체해야 합니다. 비밀번호는 코드나 Firestore에 저장하지 않습니다.
- 첨부 총합 20MB, 필수 입력·용량 초과·저장소 차단·글 없음·검색 결과 없음 상태를 처리합니다.
- 본문은 안전한 태그와 http/https/mailto 링크만 렌더링하고, 사용자 데이터는 textContent/DOM으로 삽입합니다.
- rich editor: 선택한 텍스트를 굵게/기울임/밑줄/목록으로 변환, 링크 입력 대화상자, 붙여넣기는 일반 텍스트로 처리합니다.

## 검증
작업 완료 시 아래에 검증 결과를 기록합니다.

### 확인 완료
- 내장 브라우저(Chromium) 360 / 390 / 768 / 809 / 810 / 1024 / 1199 / 1440px, 4개 페이지 32개 조합에서 가로 넘침·단일 main/h1·Anta 로드를 확인했습니다.
- 27개 데이터, 페이지 2의 08–14 표시, 채용 분류 4개, 검색 빈 결과, 제목/내용 필수 검증을 확인했습니다.
- 별도 검증용 출처(4181번 포트)에서 새 글 작성 → 새로고침 → 내용·굵게 서식·첨부파일 유지 → 실제 파일 다운로드 → 수정 취소 → 수정/링크/상단 고정 저장 → 재로딩을 확인했습니다. 실제 미리보기 출처(4180번 포트)의 27개 기본 데이터는 변경하지 않았습니다.
- 제목에 HTML 이벤트 문자열을 입력해도 문자로 표시되며 이미지 요소가 생성되지 않는 것을 확인했습니다. 파일 다운로드 내용도 원본과 같았습니다.
- 홈의 모바일 메뉴 → NOTICE, NOTICE → HOME, Escape 닫기를 확인했습니다. 기존 메뉴의 페이지 이동을 가로채는 동작을 수정했습니다.
- 저장 데이터 병합/손상/잘못된 ID·날짜, 제목+내용 검색, URL 인코딩, 서울 날짜, 홈 본문 보존, 자산 경로, 안전한 DOM 삽입과 CSS 용량에 대한 별도 실행 검사를 통과했습니다.
- 새 JS 파일 문법 검사를 통과했고 브라우저 오류·경고는 없었습니다.
- 시안과의 차이: 입력 테두리는 UI 대비 3:1 이상을 위해 #666666, 입력 글자는 모바일 확대 방지를 위해 16px, 작은 버튼 터치 영역은 44px입니다. 기존 프로젝트의 헤더·푸터와 모바일 메뉴를 사용합니다. 원본 서식에 있던 가상의 PDF는 실제 파일이 없으므로 넣지 않고, 사용자가 첨부한 파일만 표시합니다.
- 기존 프로젝트는 unlayered CSS를 사용하므로 notice.css도 동일한 우선순위를 유지합니다. 색·타입·간격 값은 notice-site 범위의 tokens.css 변수로 분리했습니다.
- 정적 페이지의 기존/기본 목록과 첫 공지 본문은 JS 없이도 표시됩니다. 검색·다른 글 조회·작성·수정·첨부 저장은 JavaScript가 필요합니다.
- Firebase 로그인/회원가입 및 역할 제한은 UI와 Firestore 규칙 파일에 구현했습니다. 변경한 JavaScript 문법과 diff 검사는 통과했지만, 실제 Firebase Console에서 Email/Password를 켜고 `firestore.rules`를 게시하고 관리자를 등록하기 전까지 실계정 로그인·가입·권한 검증은 완료되지 않은 상태입니다. 기존 로컬 첨부파일은 계속 IndexedDB에만 보관됩니다.