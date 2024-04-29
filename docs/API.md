# RESTful API

**상태 코드 표**
| Code | Name | Summary |
| :-- | :-- | :-- |
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 완료 |
| 209 | - | - |
| 400 | Bad Request | 잘못된 문법 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 찾을 수 없음 |
| 409 | Conflict | 서버의 현재 상태와 충돌함 |
| 500 | Internal Server Error | 서버 에러 |

## 회원

회원과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /users | u-01 | 회원 정보 조회 |
| POST | /users | u-02 | 회원 가입 |
| POST | /users/login | u-03 | 로그인 |
| PATCH | /users | u-04 | 회원 정보 수정 |
| DELETE | /users | u-05 | 회원 탈퇴 |
| POST | /users/logout | u-06 | 로그아웃 |

### [u-01] 회원 정보 조회

1. **개요**
   - **목적**: 비밀번호를 제외한 회원의 기본적인 정보를 조회한다.
2. **HTTP 요청**
   - **HTTP 메소드**: GET
   - **경로 및 쿼리 파라미터**: /users
   - **요청 예시**: GET www.example.com/users
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음
   - **응답 형태**: JSON
   - **응답 예시**: { "userId": "kys010306", "email": "kys010306@sogang.ac.kr", "nickname": "유신" }

### [u-02] 회원 가입

1. **개요**
   - **목적**: 서비스의 회원으로 가입한다.
2. **HTTP 요청**
   - **HTTP 메소드**: POST
   - **경로 및 쿼리 파라미터**: /users
   - **요청 예시**: POST www.example.com/users
   - **요청 바디**: { userId: "kys010306", email: "kys010306@sogang.ac.kr", nickname: "유신", password: "12345", confirmPassword: "12345" }
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 400: 비밀번호와 확인 비밀번호 불일치
     - 409: 로그인되어 있음, 이미 존재하는 회원 ID
     - 500: 서버 에러
   - **응답 형태**: TEXT
   - **응답 예시**: "회원 가입에 성공했습니다."

### [u-03]

1. **개요**
   - **목적**:
2. **HTTP 요청**
   - **HTTP 메소드**:
   - **경로 및 쿼리 파라미터**:
   - **요청 예시**:
3. **HTTP 응답**
   - **응답 코드**
     - -
   - **응답 바디**:
   - **응답 예시**:

### [u-04]

1. **개요**
   - **목적**:
2. **HTTP 요청**
   - **HTTP 메소드**:
   - **경로 및 쿼리 파라미터**:
   - **요청 예시**:
3. **HTTP 응답**
   - **응답 코드**
     - -
   - **응답 바디**:
   - **응답 예시**:

### [u-05]

1. **개요**
   - **목적**:
2. **HTTP 요청**
   - **HTTP 메소드**:
   - **경로 및 쿼리 파라미터**:
   - **요청 예시**:
3. **HTTP 응답**
   - **응답 코드**
     - -
   - **응답 바디**:
   - **응답 예시**:

### [u-06]

1. **개요**
   - **목적**:
2. **HTTP 요청**
   - **HTTP 메소드**:
   - **경로 및 쿼리 파라미터**:
   - **요청 예시**:
3. **HTTP 응답**
   - **응답 코드**
     - -
   - **응답 바디**:
   - **응답 예시**:

## 일기

일기와 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /posts | p-01 | 사용자의 모든 일기 조회 |
| GET | /posts/{postId} | p-02 | 사용자의 특정 일기 조회 |
| POST | /posts | p-03 | 일기 등록 |
| PATCH | /posts | p-04 | 일기 내용 수정 |
| DELETE | /posts/{postId} | p-05 | 일기 삭제 |
| GET | /posts/duration?{startDate}&{endDate} | p-06 | 특정 기간 동안 작성한 모든 일기 조회 |

## 조언

어떤 회원이 다른 회원에게 보낼 수 있는 조언과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /advices/today | a-01 | 오늘 자신에게 온 조언 조회 |
| GET | /advices/me | a-02 | 작성한 모든 조언 조회 |
| POST | /advices | a-03 | 조언 작성 |
| PATCH | /advices | a-04 | 조언 내용 수정 |
| DELETE | /advices/{adviceId} | a-05 | 조언 삭제 |

## 감정

일기장에 매핑된 감정과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /emotions | e-01 | 사용자의 누적된 모든 감정 조회 |
| GET | /emotions/{postId} | e-02 | 특정 일기장에 매핑된 감정 모두 조회 |
| GET | /emotions/duration?{startDate}&{endDate} | e-03 | 특정 기간 동안 매핑된 감정 모두 조회 |

## 감성

일기장에 매핑된 감성과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /sentiments/{postId} | e-01 | 특정 일기장의 감성 점수 조회 |
| GET | /sentiments/duration?{startDate}&{endDate} | e-02 | 특정 기간 동안의 감성 점수 조회 |

## 대화방

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| POST | /chatrooms | cr-01 | AI 챗봇과의 대화방 생성 |
| POST | /chatrooms/posts | cr-02 | AI 챗봇과의 대화 제출(요약 생성) |
| GET | /chatrooms | cr-03 | 최근 대화방 내용 다시 불러오기 |
| POST | /chatrooms/chats | cr-04 | AI 챗봇에게 메시지 전송 |

