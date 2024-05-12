# 통합 테스트

## User API

- [[Test Code 1](../backend/routes/user1.test.js)]
- [[Test Code 2](../backend/routes/user2.test.js)]
- [[Test Code 3](../backend/routes/user3.test.js)]

### [u-01] 회원 정보 조회

본 섹션은 [u-01](./API.md#u-01-회원-정보-조회)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| GET | /users | 로그인되지 않은 상태에서 회원 정보 조회 요청 | uit-01-1 | 즉시 요청을 보낸다. | 상태 코드 403 응답 |
| GET | /users | 성공적인 회원 정보 조회 요청 | 로그인된 agent로 요청을 보낸다. | 상태 코드 200 응답 |

### [u-02] 회원 가입

본 섹션은 [u-02](./API.md#u-02-회원-가입)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| POST | /users | 로그인된 상태에서 회원 가입 요청 | uit-02-1 | 로그인된 agent로 회원 가입 요청을 보낸다. | 상태 코드 409 응답 |
| POST | /users | 중복된 회원 ID로 회원 가입 요청 | uit-02-2 | 이미 가입된 사용자 정보로 회원 가입 요청을 보낸다. | 상태 코드 409 응답 |
| POST | /users | 성공적인 회원 가입 요청 | uit-02-3 | 로그인되지 않은 상태에서 새로운 회원 가입 요청을 보낸다. | 상태 코드 200 응답 |

### [u-03] 로그인

본 섹션은 [u-03](./API.md#u-03-로그인)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| POST | /users/login | 부정확한 회원 정보로 로그인 요청 | uit-03-1 | 부정확한 비밀번호로 로그인을 요청한다. | 상태 코드 400 응답 |
| POST | /users/login | 이미 로그인되어 있는 상태에서 로그인 요청 | uit-03-2 | 로그인된 agent로 로그인 요청을 보낸다. | 상태 코드 409 응답 |
| POST | /users/login | 성공적인 로그인 요청 | uit-03-3 | 로그인되지 않은 상태에서 정확한 회원 정보로 로그인 요청을 보낸다. | 상태 코드 200 응답 |

### [u-04] 회원 정보 수정

본 섹션은 [u-04](./API.md#u-04-회원-정보-수정)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| PATCH | /users | 로그인되지 않은 상태에서 회원 정보 수정 요청 | uit-04-1 | 즉시 회원 정보 수정을 요청한다. | 상태 코드 403 응답 |
| PATCH | /users | 일치하지 않는 비밀번호로 회원 정보 수정 요청 | uit-04-2 | 비밀번호를 오기입하여 회원 정보 수정 요청을 보낸다. | 상태 코드 400 응답 |
| PATCH | /users | 부정확한 확인 비밀번호로 회원 정보 수정 요청 | uit-04-3 | 변경할 비밀번호와 다른 확인 비밀번호로 회원 정보 수정 요청을 보낸다. | 상태 코드 400 응답 |
| PATCH | /users | 성공적인 회원 정보 수정 요청 | uit-04-4 | 변경 가능한 회원 정보로 수정 요청을 보낸다. | 상태 코드 200 응답 |

### [u-05] 회원 탈퇴

본 섹션은 [u-05](./API.md#u-05-회원-탈퇴)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| DELETE | /users | 로그인되지 않은 상태에서 회원 탈퇴 요청 | uit-05-1 | 즉시 회원 탈퇴 요청을 보낸다. | 상태 코드 403 응답 |
| DELETE | /users | 부정확한 확인 메시지로 회원 탈퇴 요청 | uit-05-2 | 잘못된 확인 메시지로 회원 탈퇴 요청을 보낸다. | 상태 코드 400 응답 |
| DELETE | /users | 성공적인 회원 탈퇴 요청 | uit-05-3 | 정확한 확인 메시지로 회원 탈퇴 요청을 보낸다. | 상태 코드 200 응답 |

### [u-06] 로그아웃

본 섹션은 [u-06](./API.md#u-06-로그아웃)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| POST | /users/logout | 로그인되지 않은 상태에서 로그아웃 요청 | uit-06-1 | 즉시 로그아웃을 요청한다. | 상태 코드 403 응답 |
| POST | /users/logout | 성공적인 로그아웃 요청 | uit-06-2 | 로그인된 agent로 로그아웃을 요청한다. | 상태 코드 200 응답 |

## Post API

- [[Test Code 1](../backend/routes/post1.test.js)]
- [[Test Code 2](../backend/routes/post2.test.js)]
- [[Test Code 3](../backend/routes/post3.test.js)]

### [p-01] 모든 일기 조회

본 섹션은 [p-01](./API.md#p-01-모든-일기-조회)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| GET | /posts | 로그인되지 않은 상태에서 일기 조회 요청 | pit-01-1 | 즉시 일기 조회 요청을 보낸다. | 상태 코드 403 응답 |
| GET | /posts | 성공적인 일기 조회 요청 | pit-01-2 | agent가 일기를 3개 등록하고 조회 요청을 보낸다. | 상태 코드 200 및 일기 3개의 정보 응답 |

### [p-02] 특정 일기 조회

본 섹션은 [p-02](./API.md#p-02-특정-일기-조회)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| GET | /posts/:postId | 로그인되지 않은 상태에서 일기 조회 요청 | pit-02-1 | 즉시 일기 조회 요청을 보낸다. | 상태 코드 403 응답 |
| GET | /posts/:postId | 다른 사용자의 일기 조회 요청 | pit-02-2 | agent가 일기를 작성하고, agent2가 해당 일기의 조회를 요청한다. | 상태 코드 403 응답 |
| GET | /posts/:postId | 존재하지 않는 ID를 가진 일기 조회 요청 | pit-02-3 | postId: -1인 일기의 조회를 요청한다. | 상태 코드 404 응답 |
| GET | /posts/:postId | 성공적인 일기 조회 요청 | pit-02-4 | agent가 일기를 작성한 후 해당 일기의 조회를 요청한다. | 상태 코드 200 및 조회한 일기의 정보 응답 |

### [p-03] 일기 등록

본 섹션은 [p-03](./API.md#p-03-일기-등록)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| POST | /posts | 로그인되지 않은 상태에서 일기 등록 요청 | pit-03-1 | 즉시 일기 등록 요청을 보낸다. | 상태 코드 403 응답 |
| POST | /posts | 일기 내용 없이 일기 등록 요청 | pit-03-2 | 일기 내용을 null로 설정하고 일기 등록 요청을 보낸다. | 상태 코드 400 응답 |
| POST | /posts | 성공적인 일기 등록 요청 | pit-03-3 | 유효한 일기 내용으로 일기 등록 요청을 보낸다. | 상태 코드 200 및 등록된 일기의 정보 응답 |

### [p-04] 일기 내용 수정

본 섹션은 [p-04](./API.md#p-04-일기-내용-수정)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| PATCH | /posts | 로그인되지 않은 상태에서 일기 수정 요청 | pit-04-1 | 즉시 일기 수정 요청을 보낸다. | 상태 코드 403 응답 |
| PATCH | /posts | 수정할 내용 없이 일기 수정 요청 | pit-04-2 | 수정할 내용을 null로 설정하고 일기 수정 요청을 보낸다. | 상태 코드 400 응답 |
| PATCH | /posts | 다른 사용자의 일기 수정 요청 | pit-04-3 | agent가 일기를 작성하고, agent2가 해당 일기를 수정하는 요청을 보낸다. | 상태 코드 403 응답 |
| PATCH | /posts | 존재하지 않는 ID의 일기 수정 요청 | pit-04-4 | postId: -1인 일기의 수정 요청을 보낸다. | 상태 코드 404 응답 |
| PATCH | /posts | 성공적인 일기 수정 요청 | pit-04-5 | agent가 일기를 작성하고, 해당 일기의 수정 요청을 보낸다. | 상태 코드 200 및 수정된 일기의 정보 응답 |

### [p-05] 일기 삭제

본 섹션은 [p-05](./API.md#p-05-일기-삭제)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| DELETE | /posts/:postId | 로그인되지 않은 상태에서 일기 삭제 요청 | pit-05-1 | 즉시 일기 삭제 요청을 보낸다. | 상태 코드 403 응답 |
| DELETE | /posts/:postId | 다른 사용자의 일기 삭제 요청 | pit-05-2 | agent가 일기를 작성하고, agent2가 해당 일기의 삭제를 요청한다. | 상태 코드 403 응답 |
| DELETE | /posts/:postId | 존재하지 않는 ID의 일기 삭제 요청 | pit-05-3 | id: -1인 일기의 삭제를 요청한다. | 상태 코드 404 응답 |
| DELETE | /posts/:postId | 성공적인 일기 삭제 요청 | pit-05-4 | agent가 일기를 작성하고, 해당 일기의 삭제를 요청한다. | 상태 코드 200 응답 |

### [p-06] 특정 기간 일기 조회

본 섹션은 [p-06](./API.md#p-06-특정-기간-동안-작성한-모든-일기-조회)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| GET | /posts/period?[startDate]&[endDate] | 로그인되지 않은 상태에서 일기 조회 요청 | pit-06-1 | 즉시 일기 조회 요청을 보낸다. | 상태 코드 403 응답 |
| GET | /posts/period?[startDate]&[endDate] | 충분한 쿼리 파라미터 없이 일기 조회 요청 | pit-06-2 | 쿼리 파라미터를 제공하지 않고 일기 조회 요청을 보낸다. | 상태 코드 400 응답 |
| GET | /posts/period?[startDate]&[endDate] | 유효하지 않은 쿼리 파라미터 값으로 일기 조회 요청 | pit-06-3 | Date 객체로 파싱할 수 없는 값을 쿼리 파라미터에 설정하고 일기 조회 요청을 보낸다. | 상태 코드 400 응답 |
| GET | /posts/period?[startDate]&[endDate] | 성공적인 일기 조회 요청 | pit-06-4 | agent가 일기를 3개 등록하고 어제, 오늘, 내일 날짜로 일기 조회 요청을 보낸다. | 모든 요청에 대해 상태 코드 200 응답, 어제와 내일 날짜 요청에는 빈 리스트 응답, 오늘 날짜 요청에는 일기 정보로 구성된 원소 3개의 리스트 응답 |

## Advice API

- [[Test Code 1](../backend/routes/advice1.test.js)]

### [a-01] 오늘의 조언 조회

본 섹션은 [a-01](./API.md#a-01-오늘-자신에게-온-조언-조회)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| GET | /advices/today | 로그인되지 않은 상태에서 조언 조회 요청 | ait-01-1 | 즉시 조언 조회 요청을 보낸다. | 상태 코드 403 응답 |
| GET | /advices/today | 성공적인 조언 조회 요청 | ait-01-2 | agent만 조언을 2개 작성하고, agent와 agent2가 각각 조언 조회 요청을 보낸다. | 둘 다 상태 코드 200 응답, body의 advices 속성에 agent는 빈 리스트가 응답되고, agent2는 조언 정보가 2개 담긴 리스트 응답 |

### [a-02] 작성한 모든 조언 조회

본 섹션은 [a-02](./API.md#a-02-작성한-모든-조언-조회)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| GET | /advices/me | 로그인되지 않은 상태에서 조언 조회 요청 | ait-02-1 | 즉시 조언 조회 요청을 보낸다. | 상태 코드 403 응답 |
| GET | /advices/me | 성공적인 조언 조회 요청 | ait-02-2 | agent가 조언 2개를 작성한 후 조언 조회 요청을 보낸다. | 상태 코드 200 및 작성한 조언의 정보 2개를 리스트로 응답 |

### [a-03] 조언 작성

본 섹션은 [a-03](./API.md#a-03-조언-작성)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| POST | /advices | 로그인되지 않은 상태에서 조언 작성 요청 | ait-03-1 | 즉시 조언 작성 요청을 보낸다. | 상태 코드 403 응답 |
| POST | /advices | 유효하지 않은 요청 바디로 조언 작성 요청 | ait-03-2 | 요청 바디의 content 속성을 null로 설정하고 조언 작성 요청을 보낸다. | 상태 코드 400 응답 |
| POST | /advices | 성공적인 조언 작성 요청 | ait-03-3 | 유효한 요청 바디로 조언 작성 요청을 보낸다. | 상태 코드 200 및 작성한 조언의 정보 응답 |

### [a-04] 조언 내용 수정

본 섹션은 [a-04](./API.md#a-04-조언-내용-수정)에 대한 통합 테스트의 기술이다.

| Method | API URI | Test Name | Test Case ID | Description | Expected Result |
| :--: | :-- | :-- | :--: | :-- | :-- |
| PATCH | /advices | 로그인되지 않은 상태에서 조언 수정 요청 | ait-04-1 | 즉시 조언 수정 요청을 보낸다. | 상태 코드 403 응답 |
| PATCH | /advices | 요청 바디에 adviceId 누락된 상태로 조언 슈정 요청 | ait-04-2 | adviceId 속성을 null로 설정하고 조언 수정 요청을 보낸다. | 상태 코드 400 응답 |
| PATCH | /advices | 요청 바디에 newContent 누락된 상태로 조언 수정 요청 | ait-04-3 | newContent 속성을 null로 설정하고 조언 수정 요청을 보낸다. | 상태 코드 400 응답 |
| PATCH | /advices | 다른 사용자의 조언 수정 요청 | ait-04-4 | agent가 조언을 작성하고, agent2가 해당 조언의 수정을 요청한다. | 상태 코드 403 응답 |
| PATCH | /advices | 성공적인 조언 수정 요청 | ait-04-5 | agent가 조언을 작성한 후 해당 조언의 수정을 요청한다. | 상태 코드 200 및 수정된 조언의 정보 응답 |

### [a-05] 조언 삭제

본 섹션은 [a-05](./API.md#a-05-조언-삭제)에 대한 통합 테스트의 기술이다.