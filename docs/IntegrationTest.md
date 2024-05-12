# 통합 테스트

## User API

- [[Test Code 1](../backend/routes/user1.test.js)]
- [[Test Code 2](../backend/routes/user2.test.js)]
- [[Test Code 3](../backend/routes/user3.test.js)]

### [u-01] 회원 정보 조회

본 섹션은 [u-01](./API.md#u-01-회원-정보-조회)에 대한 통합 테스트의 기술이다.

| API URI | Test Name | Test Case ID | Description | Expected Result |
| :-- | :-- | :--: | :-- | :-- |
| GET /users | 로그인되지 않은 상태에서 회원 정보 조회 요청 | uit-01-1 | 즉시 요청을 보낸다. | 상태 코드 403 응답 |
| GET /users | 성공적인 회원 정보 조회 요청 | 로그인된 agent로 요청을 보낸다. | 상태 코드 200 응답 |

### [u-02] 회원 가입

본 섹션은 [u-02](./API.md#u-02-회원-가입)에 대한 통합 테스트의 기술이다.

| API URI | Test Name | Test Case ID | Description | Expected Result |
| :-- | :-- | :--: | :-- | :-- |
| POST /users | 로그인된 상태에서 회원 가입 요청 | uit-02-1 | 로그인된 agent로 회원 가입 요청을 보낸다. | 상태 코드 409 응답 |
| POST /users | 중복된 회원 ID로 회원 가입 요청 | uit-02-2 | 이미 가입된 사용자 정보로 회원 가입 요청을 보낸다. | 상태 코드 409 응답 |
| POST /users | 성공적인 회원 가입 요청 | uit-02-3 | 로그인되지 않은 상태에서 새로운 회원 가입 요청을 보낸다. | 상태 코드 200 응답 |

### [u-03] 로그인

본 섹션은 [u-03](./API.md#u-03-로그인)에 대한 통합 테스트의 기술이다.

| API URI | Test Name | Test Case ID | Description | Expected Result |
| :-- | :-- | :--: | :-- | :-- |
| POST /users/login | 부정확한 회원 정보로 로그인 요청 | uit-03-1 | 부정확한 비밀번호로 로그인을 요청한다. | 상태 코드 400 응답 |
| POST /users/login | 이미 로그인되어 있는 상태에서 로그인 요청 | uit-03-2 | 로그인된 agent로 로그인 요청을 보낸다. | 상태 코드 409 응답 |
| POST /users/login | 성공적인 로그인 요청 | uit-03-3 | 로그인되지 않은 상태에서 정확한 회원 정보로 로그인 요청을 보낸다. | 상태 코드 200 응답 |

### [u-04] 회원 정보 수정

본 섹션은 [u-04](./API.md#u-04-회원-정보-수정)에 대한 통합 테스트의 기술이다.

| API URI | Test Name | Test Case ID | Description | Expected Result |
| :-- | :-- | :--: | :-- | :-- |
| PATCH /users | 로그인되지 않은 상태에서 회원 정보 수정 요청 | uit-04-1 | 즉시 회원 정보 수정을 요청한다. | 상태 코드 403 응답 |
| PATCH /users | 일치하지 않는 비밀번호로 회원 정보 수정 요청 | uit-04-2 | 비밀번호를 오기입하여 회원 정보 수정 요청을 보낸다. | 상태 코드 400 응답 |
| PATCH /users | 부정확한 확인 비밀번호로 회원 정보 수정 요청 | uit-04-3 | 변경할 비밀번호와 다른 확인 비밀번호로 회원 정보 수정 요청을 보낸다. | 상태 코드 400 응답 |
| PATCH /users | 성공적인 회원 정보 수정 요청 | uit-04-4 | 변경 가능한 회원 정보로 수정 요청을 보낸다. | 상태 코드 200 응답 |

### [u-05] 회원 탈퇴

본 섹션은 [u-05](./API.md#u-05-회원-탈퇴)에 대한 통합 테스트의 기술이다.

| API URI | Test Name | Test Case ID | Description | Expected Result |
| :-- | :-- | :--: | :-- | :-- |
| DELETE /users | 로그인되지 않은 상태에서 회원 탈퇴 요청 | uit-05-1 | 즉시 회원 탈퇴 요청을 보낸다. | 상태 코드 403 응답 |
| DELETE /users | 부정확한 확인 메시지로 회원 탈퇴 요청 | uit-05-2 | 잘못된 확인 메시지로 회원 탈퇴 요청을 보낸다. | 상태 코드 400 응답 |
| DELETE /users | 성공적인 회원 탈퇴 요청 | uit-05-3 | 정확한 확인 메시지로 회원 탈퇴 요청을 보낸다. | 상태 코드 200 응답 |

### [u-06] 로그아웃

본 섹션은 [u-06](./API.md#u-06-로그아웃)에 대한 통합 테스트의 기술이다.

| API URI | Test Name | Test Case ID | Description | Expected Result |
| :-- | :-- | :--: | :-- | :-- |