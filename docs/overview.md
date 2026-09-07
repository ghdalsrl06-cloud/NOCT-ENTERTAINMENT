# NOCT ENTERTAINMENT — 홈페이지 · 유튜브 채널 정리

작성일: 2026-09-07
저장소: https://github.com/ghdalsrl06-cloud/Runa-Cafe_project

---

## 1. 브랜드

| 항목 | 내용 |
| --- | --- |
| 이름 | NOCT ENTERTAINMENT |
| 한 줄 | 밤에 만드는 음악, 웹툰, 영상 |
| 소속 아티스트 | SHINYA / 深夜 (다크 일렉트로닉 J-POP) · https://shinya-music.com/ko/ |
| 심벌 | 초승달(밤) 안에서 흘러나오는 사운드 바(음악). 워드마크는 NOCT의 C 자리에 달 마크 |
| 색 | 미드나잇 네이비 `#0a0b10` · 일렉트릭 블루 `#6f8cff` · 소프트 블루 `#a9b8ff` · 웜 화이트 `#ecebe6` |
| 글꼴 | Space Grotesk (영문) · Noto Sans KR (한글) |
| 분위기 | 미래지향 · 시네마틱 · 자정 이후 |

### 로고 파일

| 파일 | 용도 |
| --- | --- |
| `assets/logo-mark.svg` | 컬러 심벌 (달 + 사운드 바) |
| `assets/logo-mark-mono.svg` | 단색 심벌, CSS 색 상속 |
| `assets/logo-wordmark.svg` / `.png` | 심벌 + NOCT ENTERTAINMENT 가로 조합 |
| `assets/logo-noct.svg` / `.png` | NOCT 단독 워드마크, C = 달 마크, 아래 ENTERTAINMENT |
| `assets/favicon.svg` | 브라우저 탭 아이콘 |
| `data/assets.json` → `logo3d` | 심벌 3D 렌더 (1:1) |
| `data/assets.json` → `logoLockup` | 심벌 + 글자 3D 렌더 (16:9), 링크 미리보기(og:image) |
| `data/assets.json` → `logoNoct` | NOCT + ENTERTAINMENT 3D 렌더 (16:9) |
| `data/assets.json` → `heroLogo` | 히어로용 배경 제거 렌더 |

---

## 2. 홈페이지

- 주소: https://ghdalsrl06-cloud.github.io/Runa-Cafe_project/
- 호스팅: GitHub Pages (main 브랜치)
- 기술: HTML / CSS / JavaScript, 프레임워크 없음. Three.js r128로 3D 장면.
- 콘텐츠: 전부 `data/*.json` 에 분리. 코드 수정 없이 항목 추가.

### 화면 구성 (상단 탭 = 뷰, 주소 `#works` 식으로 공유 가능)

| 탭 | 내용 | 수익 모델 |
| --- | --- | --- |
| 홈 | 히어로(3D 파편 다면체 + NOCT 로고) → 뉴스 티커 → 릴리즈 피드(가까운 발매 스포트라이트 + 커버 5장 + 스탯) → 아티스트 대형 프로필 + 오디션 카드 → 최근 뉴스 3건 → 서비스 타일 → 문의 배너 | — |
| 아티스트 | 소속 아티스트 소개 · 링크 (정사각 이미지) | — |
| 작업 | 음반 · 웹툰 · 영상 포트폴리오 + 발매 일정 + 3D 커버플로우 | — |
| 뉴스 | 발매 · 웹툰 · 비하인드 · 공지, 태그 필터 | — |
| 서비스 | 음악 · MV · 웹툰 · 영상 제작 의뢰 | 제작 의뢰 |
| 라이선싱 | 곡 카탈로그(78곡, 검색·필터) + 라이선스 등급 | 음원 라이선싱 |
| 스토어 | 디지털 앨범 · 단행본 · 샘플팩 · 굿즈 | 디지털 상품 · 굿즈 |
| 오디션 | 키비주얼 · 찾는 아티스트 · 절차 타임라인 → 데모 보내기 | 신규 아티스트 |
| 클럽 · 파트너 | 팬 멤버십(준비 중) · 브랜드 협업 | 멤버십 · 협업 |
| 문의 | 구글 폼 실시간 접수 | — |

### 3D · 디테일

- 히어로 파편 다면체: 스크롤 분해·재조립, 클릭 파동, 마우스 시차
- 홈 전체 별먼지 필드(고정 배경), 지구본(대기 글로우 · SEOUL/TOKYO 라벨 · 드래그 · 위성), 스포트라이트 레코드판
- HUD 라벨, 도쿄 실시간 시계, 커서 글로우, 카드 틸트, 필름 그레인

### 데이터 파일

| 파일 | 내용 | 현재 |
| --- | --- | --- |
| `data/artists.json` | 아티스트 (`image` 세로, `imageSquare` 정사각) | 1명 |
| `data/works.json` | 음반 · 웹툰 · 영상, `release` 날짜로 홈 피드·일정·뉴스 자동 | 17건 |
| `data/news.json` | 뉴스 (BLOG / WEBTOON / NOTICE) | 36건 |
| `data/licensing.json` | 라이선싱 곡 | 78곡 |
| `data/services.json` | 제작 서비스 | — |
| `data/store.json` | 스토어 상품 (`status: live` 로 판매 시작) | — |
| `data/assets.json` | 키비주얼 · 로고 렌더 · 유튜브 이미지 주소 | — |

### 운영 규칙

- JS/CSS를 고치면 `index.html` 의 `?v=` 숫자를 올린다. GitHub Pages 캐시 때문에 안 올리면 화면이 깨질 수 있다.
- 로컬 확인은 `python3 -m http.server 8000` 으로 연다 (JSON을 fetch로 읽어서 더블클릭으로는 안 보임).
- 작업 흐름: `claude/github-project-setup-co31ml` 브랜치에서 커밋 → PR → main 머지 → 브랜치 재정렬.

### 남은 일

- [ ] MV 임베드 (작업 탭 · 뉴스에 유튜브 플레이어) — 채널이 쌓이면 BGM 탭으로 대체 검토
- [ ] 헤더 · 푸터에 유튜브 채널 링크 버튼 (핸들 확정 후)
- [ ] EN / JA 다국어
- [ ] 스토어 결제 연동 (Gumroad · Stripe 등)
- [ ] NOCT CLUB 멤버십 오픈
- [ ] 커스텀 도메인 연결

---

## 3. 유튜브 채널

- 방향: **BGM 채널**. 장르 제한 없이 밤에 어울리는 음악을 한 곡씩 짧은 영상으로 올림. 롱폼(1시간 이상)은 하지 않음.
- 채널 이름: **NOCT ENTERTAINMENT**
- 핸들: **@noctent** (추천, 미확정. 중복 시 `@noct.entertainment` → `@noctofficial` → `@noct_ent` 순)

### 채널 설명 (확정, 한글)

```
자정 이후를 위한 BGM — NOCT ENTERTAINMENT 공식 채널

밤의 시간대에 어울리는 음악을 올립니다.
작업할 때, 공부할 때, 잠들기 전, 늦은 밤 드라이브까지.
장르는 정해두지 않았습니다. 일렉트로닉, 로파이, 재즈, 피아노, 앰비언트, 시티팝.
밤에 어울린다면 무엇이든 NOCT의 음악입니다.

한 곡, 한 편씩 짧게 올립니다.
구독과 알림 설정을 해두면 자정 이후의 음악을 가장 먼저 들을 수 있습니다.
```

- 번역: `docs/youtube-channel-translations.md` (15개 언어, 유튜브 채널 번역 창에 붙여넣기용. 최소 영어 · 일본어 · 스페인어 · 포르투갈어 · 인도네시아어 · 중국어(대만))

### 이미지

| 항목 | 규격 | 파일 / 주소 | 설명 |
| --- | --- | --- | --- |
| 프로필 (인물) | 2048×2048 | `data/assets.json` → `youtubeAvatar` | 매끈한 검정 풀페이스 가면 + 후드, 가면 중앙 NOCT 글로우, 파란 실크 셔츠 + 검정 정장, 정면 상반신. 현재 채널에 적용 |
| 프로필 (텍스트) | 2048×2048 | `data/assets.json` → `youtubeAvatarText` | 인물 없이 NOCT 로고 글자만, 네이비 + 블루 글로우 |
| 배너 | 2048×1152 | `data/assets.json` → `youtubeBanner` | 프로필과 같은 스타일, NOCT ENTERTAINMENT 로고를 중앙 안전 영역(1546×423)에 배치 |
| 워터마크 | 150×150 투명 PNG | `assets/youtube-watermark-mark.png` | 달 마크 블루 (추천) |
| 워터마크 | 150×150 투명 PNG | `assets/youtube-watermark-mark-white.png` | 달 마크 흰색, 밝은 영상용 |
| 워터마크 | 150×150 투명 PNG | `assets/youtube-watermark-wordmark.png` | NOCT 글자 |

원본 주소는 `data/assets.json` 에서 복사. 워터마크는 저장소 raw 주소로 받을 수 있음:
`https://raw.githubusercontent.com/ghdalsrl06-cloud/Runa-Cafe_project/main/assets/<파일명>`

### 유튜브 스튜디오에서 넣는 위치

| 항목 | 위치 |
| --- | --- |
| 이름 · 핸들 · 설명 | 맞춤설정 → 기본 정보 |
| 채널 번역 | 맞춤설정 → 기본 정보 → 채널 번역 |
| 프로필 · 배너 · 워터마크 | 맞춤설정 → 브랜딩 |
| 링크 | 맞춤설정 → 기본 정보 → 링크 (사이트 주소 등록) |

### 진행 상태

- [x] 프로필 이미지 2종 생성
- [x] 배너 2048×1152
- [x] 워터마크 3종
- [x] 채널 설명 확정
- [x] 15개 언어 번역문
- [ ] 핸들 확정
- [ ] 채널 번역 입력
- [ ] 첫 영상 업로드 (썸네일 템플릿 · 재생목록 구성은 업로드 시작할 때 정리)

### 다음에 할 만한 것

- 썸네일 템플릿: 네이비 배경 + 상단 작은 NOCT 마크 + 큰 제목 두 줄. 한 번 만들어 제목만 바꿔 씀
- 재생목록: 집중 / 휴식 / 새벽 / 드라이브 등 분위기별
- 영상 본편용 루프 배경: 3D 로고 렌더 또는 홈 3D 장면을 짧은 루프 영상으로
- 사이트 홈 티커 · 뉴스에 새 BGM 업로드 소식 자동 노출 (`data/news.json`)
