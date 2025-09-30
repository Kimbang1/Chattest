# AGENTS.md

## 📌 기본 규칙
- 모든 설명 / 커밋 메시지 / 코드 주석은 **한국어**로 작성  
- 예제 코드는 꼭 **주석 포함**  
- 보안 모범 사례 준수  
  - 비밀키 / 토큰 노출 금지  
  - 민감정보 마스킹  
  - 외부 API 호출 시 인증 방식 명확히  

## 역할 프로필 (Profile)
### fullstack
- 프론트엔드: React Native  
- 백엔드: Spring Boot  
- RESTful API, JWT 인증, PostgreSQL DB  

### frontend
- React Native 0.7x 이상  
- react-navigation 활용  
- 모바일 성능 최적화  
  - 번들 사이즈 관리  
  - 메모리/리스트 최적화  

### backend
- Java 21 기준 (또는 명시 버전)  
- Spring Boot  
- WebSocket: SockJS + STOMP  
- JWT 인증, PostgreSQL  

## 개발 / 테스트 / 빌드 명령
- 설치: `pnpm install` 또는 `npm ci`  
- 프론트 실행: `pnpm start`  
- 백엔드 실행: `./gradlew bootRun`  
- 테스트: `pnpm test && ./gradlew test`  
- 코드 스타일 검사: (예: `npm run lint` or `./gradlew check`)  

## 코드 스타일 / 커밋 규칙
- 프론트: ESLint + Prettier, 함수형 코드 우선  
- 백엔드: 계층 구조 엄격히 분리 (Controller / Service / Repository)  
- 커밋 메시지 컨벤션: `feat:`, `fix:`, `chore:` 등  
- 코드 변경 시 꼭 테스트 추가 / 수정  

## 보안 & 품질 가드
- `.env`, `application-*.yml` 등 민감 설정 파일은 Git에 포함 금지  
- 로그에 개인정보(PII) 저장 금지  
- PR 시 유닛/통합 테스트 필수  
- 민감 API 호출 시 인증 예외 처리, 예외 핸들링 명시  

## Codex / 자동화 Agent 관련 지침
- 생성 요청 시: “한국어로 설명 + 예제 코드 포함 + 보안 주의” 명시  
- 리팩터링 시: 기존 코드 스타일과 일관성 유지  
- 외부 API 키 노출 금지 → `process.env` 또는 `config/**.secret` 처리  
- 작업 전후 diff / 테스트 실행 후 반영  

## (옵션) 커스텀 태그 / 메타 정보  
- `@profile fullstack` 형태로 특정 작업에 프로필 명시 가능  
- `@skip test` 등 태그 사용 시 테스트 생략 가능 (단 주의)  
