# ACCOUNT 페이지 구현

## 시안과 범위

`DRAFTX_Account_Revision_03_PNG`의 헤더, 로그인, 회원가입, 로그인 후 헤더 4개 시안을 기준으로 구현했다. 검정 배경, Anta 영문 제목, 기존 DM Sans/한글 폰트, 흰색 본문, 회색 보조 문구와 얇은 구분선을 유지한다. 강조색은 기존 연두 토큰만 사용한다.

헤더 오른쪽은 수상 문구와 배지 대신 로그인 / 회원가입 텍스트 링크다. 기존 HOME, WORKS, LAB.X, CONTACT, VELO, NOTICE 메뉴와 홈 본문은 그대로 유지한다. 로그인하면 Firebase 회원 프로필의 실제 이름과 로그아웃을 표시한다. 공지사항과 VELO 페이지에도 같은 헤더를 적용했다.

본문은 공지사항과 같은 겉박스·속박스·파티션 구조를 사용한다. 데스크톱에서는 왼쪽 소개와 오른쪽 폼, 모바일에서는 세로로 배치한다. 기존 푸터와 TALK 링크를 재사용한다.

## 페이지와 변경 지점

- `pages/login.html`, `pages/signup.html`: 승인 시안의 계정 페이지.
- `components/site-header.html`, `components/site-footer.html`, `js/modules/site-chrome.js`: 각 페이지에서 공통 헤더·푸터를 한 번만 정의하고 경로별 메뉴를 구성.
- `css/components/account.css`, `css/tokens.css`: 공통 회원 메뉴, 폼, 반응형과 버튼 크기.
- `js/account.js`: 입력 확인, 비밀번호 표시, 전체 동의, 약관 안내, 로그인 유지, 비밀번호 재설정.
- `js/modules/notice-auth.js`: 기존 Firebase 회원가입·로그인·로그아웃 연결 및 공통 헤더 상태.
- `js/utils/account-navigation.js`: 같은 프로젝트 안의 허용된 페이지만 로그인 후 복귀.
- `pages/notice-auth.html`, `js/notice-auth.js`: 이전 공지사항 로그인 주소를 새 페이지로 연결.
- `firestore.rules`: 기존 회원 스키마에 선택적 `agreements` 맵을 허용. 기존 관리자 권한과 데이터 접근 범위는 유지.

로그인 기본 버튼은 136×44, 회원가입 기본 버튼은 152×44다. 보조 회원가입 버튼은 128×40, 보조 로그인 버튼은 116×40이다. 호버 및 키보드 포커스는 밝은 배경/어두운 글자로 반전한다. 헤더에는 아이콘이나 캡슐 테두리를 넣지 않는다.

## 기존 Firebase와의 호환

새 인증 서비스나 브라우저에 비밀번호를 저장하는 별도 인증 구현을 추가하지 않았다. 기존 `js/firebase.js`의 프로젝트, Firebase Authentication, Firestore `users`/`usernames`를 사용한다. 회원가입에서 이름·아이디·이메일·비밀번호를 받아 아이디 중복을 트랜잭션으로 확인하고, 기존 일반 회원 역할 값 `ueser` 및 프로필 스키마를 유지한다.

‘로그인 상태 유지’를 선택하면 Firebase의 브라우저 영구 유지, 선택하지 않으면 해당 탭 세션을 사용한다. 가입 시에도 탭 세션을 사용한다. 프로필 쓰기가 실패하면 방금 생성한 Auth 계정만 정리하던 기존 동작을 유지한다. 다른 회원이나 기존 데이터를 삭제하지 않는다.

신규 가입의 아이디·약관 동의 항목은 `users/{uid}` 및 `usernames/{usernameKey}`에 저장한다. 이 필드를 저장하려면 포함한 `firestore.rules`를 기존 Firebase 프로젝트에 적용해야 한다. 사이트의 HTML/CSS/JS 업로드와 Firestore 규칙 배포는 별개다. 이 작업에서는 실제 서비스의 규칙을 원격 배포하지 않았다.

## 약관 문서

사용자가 기존 문서가 없다고 확인했다. 따라서 약관을 지어내지 않고 ‘문서가 아직 등록되지 않았습니다’ 안내 창을 연결했다. 운영자가 약관 문서를 준비하면 `js/account.js`의 약관 안내 부분을 해당 문서로 연결하면 된다.

## 검증

1920px 시안 기준 본문 배치와 4개 버튼 크기를 브라우저에서 확인했다. 360 / 390 / 768 / 1024 / 1440 / 1920px 화면에서 입력창과 버튼이 화면 밖으로 나가지 않는지 확인했다. 모바일 메뉴의 회원 링크, 페이지 왕복, 비밀번호 표시, 비밀번호 불일치 차단, 전체 동의, 약관 창의 ESC 닫기와 포커스 복귀를 확인했다.

격리된 Firebase SDK 대역으로 회원가입 스키마, 관리자 계정 예약어 차단, 실패 시 계정 정리, 세션 유지, 프로필 없는 로그인 차단, 헤더 로그인/로그아웃 상태, 비밀번호 재설정 호출, 프로젝트 밖 복귀 주소 차단을 검사했다. 실제 회원 생성이나 메일 발송은 수행하지 않았다. 실제 계정의 로그인·가입 성공과 Firebase 운영 설정은 별도 계정으로 확인해야 한다.

Firebase 공식 참고: [인증 유지 설정](https://firebase.google.com/docs/auth/web/auth-state-persistence), [회원 관리와 비밀번호 재설정](https://firebase.google.com/docs/auth/web/manage-users).
