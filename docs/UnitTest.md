# 단위 테스트

## Models

모델에 대한 단위 테스트는 간단히 `static initiate`, `static associate` 메소드의 호출 여부만을 테스트한다. 그러므로 상세 문서는 기술하지 않는다.

## Controllers, Middlewares

### User Controller

#### [u-01] 회원 정보 조회

| API ID | Test Name | Test Case ID | Description |
| :-- | :-- | :--: | :-- |
| u-01 | 회원 정보 조회 성공 | uut-01-1 | 상태 코드 200 응답 조건 |

#### [u-02] 회원 가입

| API ID | Test Name | Test Case ID | Description |
| :-- | :-- | :--: | :-- |
| u-02 | 회원 가입 성공 | uut-02-1 | 상태 코드 200 응답 조건 |
| u-02 | 확인 비밀번호 불일치 | uut-02-2 | 상태 코드 400 응답 조건 |
| u-02 | ID 중복 | uut-02-3 | 상태 코드 409 응답 조건 |
| u-02 | findOne 수행 중 에러 | uut-02-4 | 서버 에러 발생 조건 |

#### [u-03] 로그인

| API ID | Test Name | Test Case ID | Description |
| :-- | :-- | :--: | :-- |
| u-03 | 로그인 성공 | uut-03-1 | 상태 코드 200 응답 조건 |
| u-03 | 로그인 에러 | uut-03-2 | 서버 에러 발생 조건 |
| u-03 | 사용자 정보 불일치 | uut-03-3 | 상태 코드 400 응답 조건 |
| u-03 | 인증 에러 | uut-03-4 | 서버 에러 발생 조건 |

#### [u-04] 회원 정보 수정

본 섹션은 [u-04](./API.md/#u-04-회원-정보-수정)에 대한 단위 테스트의 기술이다.

| API ID | Test Name | Test Case ID | Description |
| :-- | :-- | :--: | :-- |
| u-04 | 회원 정보 수정 성공 | uut-04-1 | 상태 코드 200 응답 조건 |
| u-04 | 새 비밀번호 해싱 중 에러 | uut-04-2 | 서버 에러 발생 조건 |
| u-04 | 