# NOCT ENTERTAINMENT — 공식 홈페이지

**밤에 만드는 음악, 웹툰, 영상.**
다크 일렉트로닉 J-POP 아티스트 [SHINYA / 深夜](https://shinya-music.com/ko/)의 소속사이자, 음악·웹툰·영상 제작 스튜디오 NOCT의 비즈니스 홈페이지입니다.

🌍 사이트: https://ghdalsrl06-cloud.github.io/Runa-Cafe_project/

## 사이트 구성

상단 탭을 누르면 해당 화면만 보이는 **탭(뷰) 구조**예요. 주소는 `#works`, `#licensing`처럼 탭별로 생겨서 공유·북마크가 됩니다.
**홈**에는 중요한 것만: 히어로 → 지금 NOCT(다음 발매·웹툰 최신화·최신 영상) → 아티스트 한 줄 → 서비스 미니 타일 → 문의 배너.

| 탭 | 내용 | 수익 모델 |
|------|------|-----------|
| 아티스트 | 소속 아티스트 소개와 링크 | — |
| 작업 | 음반 · 웹툰 · 영상 포트폴리오 (필터) | — |
| 서비스 | 음악 · MV · 웹툰 · 영상 제작 의뢰 | 제작 의뢰 |
| 라이선싱 | 곡 카탈로그(검색·필터) + 라이선스 등급 | 음원 라이선싱 |
| 스토어 | 디지털 앨범 · 단행본 · 샘플팩 · 굿즈 | 디지털 상품 · 굿즈 |
| 클럽 · 파트너 | 팬 멤버십(준비 중) · 브랜드 협업 | 멤버십 · 협업 |
| 문의 | 구글 폼으로 실시간 접수 | — |

## 사용 기술

- HTML / CSS / JavaScript (프레임워크 없음, GitHub Pages 정적 호스팅)
- 콘텐츠는 `data/*.json` 에 분리 → 코드 수정 없이 항목 추가
- 문의 폼은 Google Forms 로 전송 (응답 탭 / 스프레드시트에 수집)

## 폴더 구조

```
├── index.html          ← 페이지 뼈대 (섹션 구조)
├── css/style.css       ← 디자인. 색·글꼴은 맨 위 :root 변수
├── js/main.js          ← JSON 로드 → 렌더링, 필터/검색, 문의 전송
├── data/
│   ├── artists.json    ← 소속 아티스트
│   ├── works.json      ← 작업물 (music / webtoon / video)
│   ├── services.json   ← 제작 서비스
│   ├── licensing.json  ← 라이선싱 곡 카탈로그
│   └── store.json      ← 스토어 상품
└── .gitignore
```

## 콘텐츠 추가하는 법

- **새 앨범/웹툰/영상**: `data/works.json` 에 항목 하나 추가
  ```json
  { "type": "music", "line": "CLUB", "title": "곡 제목", "subtitle": "앨범 설명", "date": "2026.10.01", "cover": "이미지 주소", "link": "링크" }
  ```
- **라이선싱 곡**: `data/licensing.json` 에 `{ title, titleKo, album, line, bpm, mood, preview }` 추가
- **새 아티스트**: `data/artists.json` 에 추가하면 카드가 자동 생성
- **상품 출시**: `data/store.json` 에서 `"status": "live"` 로 바꾸고 `link` 추가
- **브랜드 색 변경**: `css/style.css` 맨 위 `--accent` 값 하나만 수정

## 로컬에서 보기

JSON을 `fetch` 로 읽기 때문에 파일을 더블클릭하면 데이터가 안 보여요. 간단한 서버로 열어주세요.

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## 앞으로

- [x] NOCT 심볼 로고(SVG) · 키비주얼 · 서비스/스토어/클럽 비주얼 (Higgsfield 생성, `data/assets.json` 등)
- [x] 미래지향 디테일: HUD 라벨, 도쿄 실시간 시계, 별먼지 파티클, 커서 글로우, 카드 틸트, 필름 그레인
- [ ] EN / JA 다국어
- [ ] 스토어 결제 연동 (Gumroad · Stripe 등)
- [ ] NOCT CLUB 멤버십 오픈
- [ ] 커스텀 도메인 연결 (noct-ent.com 등)

## 이력

- v1 (2026.07~08): Runa Cafe 홈페이지로 시작 — 커밋 `dae6ddf` 이전
- v2 (2026.09~): NOCT ENTERTAINMENT 비즈니스 사이트로 전면 개편
