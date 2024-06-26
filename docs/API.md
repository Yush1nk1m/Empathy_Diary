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
   - **요청 예시**: GET https://empathydiaryapi.com/users
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: JSON
   - **응답 예시**: { "userId": "kys010306", "email": "kys010306@sogang.ac.kr", "nickname": "유신" }

### [u-02] 회원 가입

1. **개요**
   - **목적**: 서비스의 회원으로 가입한다.
2. **HTTP 요청**
   - **HTTP 메소드**: POST
   - **경로 및 쿼리 파라미터**: /users
   - **요청 예시**: POST https://empathydiaryapi.com/users
   - **요청 바디**: { userId: "kys010306", email: "kys010306@sogang.ac.kr", nickname: "유신", password: "12345", confirmPassword: "12345" }
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 400: 비밀번호와 확인 비밀번호 불일치
     - 409: 로그인되어 있음, 이미 존재하는 회원 ID
     - 500: 서버 에러
   - **응답 형태**: TEXT
   - **응답 예시**: 회원 가입에 성공했습니다.

### [u-03] 로그인

1. **개요**
   - **목적**: 사용자 정보의 유효성을 검사하고 서비스에 로그인한다.
2. **HTTP 요청**
   - **HTTP 메소드**: POST
   - **경로 및 쿼리 파라미터**: /users/login
   - **요청 바디**: { userId: "kys010306", password: "12345" }
   - **요청 예시**: POST https://empathydiaryapi.com/users/login
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 400: 회원 정보 불일치
     - 409: 로그인되어 있음
     - 500: 서버 에러
   - **응답 형태**: TEXT
   - **응답 예시**: 로그인에 성공했습니다.

### [u-04] 회원 정보 수정

1. **개요**
   - **목적**: 사용자의 닉네임 또는 비밀번호를 수정한다.
2. **HTTP 요청**
   - **HTTP 메소드**: PATCH
   - **경로 및 쿼리 파라미터**: /users
   - **요청 바디**: { newNickname: [새로운 닉네임], newPassword: [새로운 비밀번호], newConfirmPassword: [새로운 확인 비밀번호], password: [현재 비밀번호] }
   - **요청 예시**: PATCH https://empathydiaryapi.com/users
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 400: 비밀번호 불일치, 변경될 정보 없음, 확인 비밀번호 불일치
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT
   - **응답 예시**: 회원 정보가 수정되었습니다.

### [u-05] 회원 탈퇴

1. **개요**
   - **목적**: 서비스의 회원 정보를 삭제한다.
2. **HTTP 요청**
   - **HTTP 메소드**: DELETE
   - **경로 및 쿼리 파라미터**: /users
   - **요청 바디**: { confirmMessage: "회원 탈퇴를 희망합니다." }
   - **요청 예시**: DELETE https://empathydiaryapi.com/users
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 400: 확인 메시지 불일치
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT
   - **응답 예시**: 회원 탈퇴가 완료되었습니다.

### [u-06] 로그아웃

1. **개요**
   - **목적**: 사용자의 서비스 로그인 상태를 해제한다.
2. **HTTP 요청**
   - **HTTP 메소드**: POST
   - **경로 및 쿼리 파라미터**: /users/logout
   - **요청 예시**: POST https://empathydiaryapi.com/users/logout
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT
   - **응답 예시**: 로그아웃에 성공하였습니다.

## 일기

일기와 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /posts | p-01 | 모든 일기 조회 |
| GET | /posts/{postId} | p-02 | 특정 일기 조회 |
| POST | /posts | p-03 | 일기 등록 |
| PATCH | /posts | p-04 | 일기 내용 수정 |
| DELETE | /posts/{postId} | p-05 | 일기 삭제 |
| GET | /posts/period?{startDate}&{endDate} | p-06 | 특정 기간 동안 작성한 모든 일기 조회 |

일기 API 대부분은 chatGPT API 도입 이후 로직의 전반적인 수정이 있을 예정이다.

### [p-01] 모든 일기 조회

1. **개요**
   - **목적**: 사용자가 작성한 모든 일기를 조회한다.
2. **HTTP 요청**
   - **HTTP 메소드**: GET
   - **경로 및 쿼리 파라미터**: /posts
   - **요청 예시**: GET https://empathydiaryapi.com/posts
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: JSON()
   - **응답 예시**: { "diaries": [{ "id": "[일기 ID]", "content": "[일기 내용]", "writeDate": "[작성 날짜]", "writeTime": "[작성 시각]", "emotions": ["기쁨", "사랑", "뿌듯함"], "positiveScore": 50, "negativeScore": 50 }, ...] }

### [p-02] 특정 일기 조회

1. **개요**
   - **목적**: 사용자가 작성한 특정 일기를 조회한다.
2. **HTTP 요청**
   - **HTTP 메소드**: GET
   - **경로 및 쿼리 파라미터**: /posts/:postId
   - **요청 예시**: GET https://empathydiaryapi.com/posts/1
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음, 접근 권한이 없음
     - 404: 해당 ID를 가진 일기가 없음
     - 500: 서버 에러
   - **응답 형태**: JSON(성공 시), TEST(실패 시)
   - **응답 예시**
     - { "diary": { "id": "[일기 ID]", "content": "[일기 내용]", "writeDate": "[작성 날짜]", "writeTime": "[작성 시각]", "emotions": ["기쁨", "사랑", "뿌듯함"], "positiveScore": 50, "negativeScore": 50 } }
     - 접근 권한이 없습니다.

### [p-03] 일기 등록

1. **개요**
   - **목적**: 사용자의 일기를 등록한다.
2. **HTTP 요청**
   - **HTTP 메소드**: POST
   - **경로 및 쿼리 파라미터**: /posts
   - **요청 바디**: { content: "[일기 내용]" }
   - **요청 예시**: POST https://empathydiaryapi.com/posts
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 400: 일기 내용이 존재하지 않음
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: JSON(성공 시), TEXT(실패 시)
   - **응답 예시**
     - 일기 내용이 존재하지 않습니다.
     - { "postId": "1", "emotions": ["기쁨", "사랑", "뿌듯함"], "positiveScore": 50, "negativeScore": 50 }

### [p-04] 일기 내용 수정

1. **개요**
   - **목적**: 사용자가 작성한 일기의 내용을 수정한다.
2. **HTTP 요청**
   - **HTTP 메소드**: PATCH
   - **경로 및 쿼리 파라미터**: /posts
   - **요청 바디**: { postId: "[일기 ID]", newContent: "[일기 내용]" }
   - **요청 예시**: PATCH https://empathydiaryapi.com/posts
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 400: 일기 내용이 존재하지 않음
     - 403: 로그인되지 않음, 접근 권한이 없음
     - 404: 해당 ID를 가진 일기가 없음
     - 500: 서버 에러
   - **응답 형태**: JSON(성공 시), TEXT(실패 시)
   - **응답 예시**
     - 수정될 내용이 없습니다.
     - { "postId": "1", "emotions": ["기쁨", "사랑", "뿌듯함"], "positiveScore": 50, "negativeScore": 50 }

### [p-05] 일기 삭제

1. **개요**
   - **목적**: 사용자가 작성한 일기를 삭제한다.
2. **HTTP 요청**
   - **HTTP 메소드**: DELETE
   - **경로 및 쿼리 파라미터**: /posts/:postId
   - **요청 예시**: DELETE https://empathydiaryapi.com/posts/1
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음, 접근 권한이 없음
     - 404: 해당 ID를 가진 일기가 없음
     - 500: 서버 에러
   - **응답 형태**: TEXT
   - **응답 예시**: 일기가 삭제되었습니다.

### [p-06] 특정 기간 동안 작성한 모든 일기 조회

1. **개요**
   - **목적**: 특정 기간(시작 날짜 이후, 종료 날짜 이전) 동안 사용자가 작성한 모든 일기를 조회한다.
2. **HTTP 요청**
   - **HTTP 메소드**: GET
   - **경로 및 쿼리 파라미터**: /posts/period?startDate=[시작 날짜]&endDate=[종료 날짜]
   - **요청 예시**: GET https://empathydiaryapi.com/posts/period?startDate=2024-04-01&endDate=2024-05-01 (4월 1일 00시 00분부터 5월 2일 00시 00분 전까지)
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 400: 충분한 쿼리 파라미터가 없음, 쿼리 파라미터의 값이 유효하지 않음
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT(실패 시), JSON(성공 시)
   - **응답 예시**
     - { "diaries": [{ "id": "[일기 ID]", "content": "[일기 내용]", "writeDate": "[작성 날짜]", "writeTime": "[작성 시각]", "emotions": ["기쁨", "사랑", "뿌듯함"], "positiveScore": 50, "negativeScore": 50 }, ...] }
     - 쿼리 파라미터의 값이 유효하지 않습니다.

## 조언

어떤 회원이 다른 회원에게 보낼 수 있는 조언과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /advices/today | a-01 | 오늘 자신에게 온 조언 조회 |
| GET | /advices/me | a-02 | 작성한 모든 조언 조회 |
| POST | /advices | a-03 | 조언 작성 |
| PATCH | /advices | a-04 | 조언 내용 수정 |
| DELETE | /advices/{adviceId} | a-05 | 조언 삭제 |

### [a-01] 오늘 자신에게 온 조언 조회

1. **개요**
   - **목적**: 오늘 나에게 온 모든 조언을 조회한다.
2. **HTTP 요청**
   - **HTTP 메소드**: GET
   - **경로 및 쿼리 파라미터**: /advices/today
   - **요청 예시**: GET https://empathydiaryapi.com/advices/today
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT(실패 시), JSON(성공 시)
   - **응답 예시**
     - 로그인이 필요합니다.
     - { "advices": [ { "content": "[내용]", "writeDate": "[작성 날짜]", "writeTime": "[작성 시각]" }, ... ] }

### [a-02] 작성한 모든 조언 조회

1. **개요**
   - **목적**: 사용자가 작성한 모든 조언을 조회한다.
2. **HTTP 요청**
   - **HTTP 메소드**: GET
   - **경로 및 쿼리 파라미터**: /advices/me
   - **요청 예시**: GET https://empathydiaryapi.com/advices/me
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT(실패 시), JSON(성공 시)
   - **응답 예시**
     - 로그인이 필요합니다.
     - { "advices": [ { "adviceId": "[조언 ID]", "content": "[내용]", "writeDate": "[작성 날짜]", "writeTime": "[작성 시각]" }, ... ] }

### [a-03] 조언 작성

1. **개요**
   - **목적**: 오늘 같은 감정을 느낀 사용자들에게 조언을 작성한다.
2. **HTTP 요청**
   - **HTTP 메소드**: POST
   - **경로 및 쿼리 파라미터**: /advices
   - **요청 바디**: { content: [조언 내용] }
   - **요청 예시**: POST https://empathydiaryapi.com/advices
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 400: 요청 바디가 유효하지 않음
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT(실패 시), JSON(성공 시)
   - **응답 예시**
     - 조언이 전달되지 않았습니다.
     - { "adviceId": "[조언 ID]", "content": "[조언 내용]", "emotions": [ "기쁨", "사랑", "뿌듯함" ]}

### [a-04] 조언 내용 수정

1. **개요**
   - **목적**: 작성한 조언의 내용을 수정한다.
2. **HTTP 요청**
   - **HTTP 메소드**: PATCH
   - **경로 및 쿼리 파라미터**: /advices
   - **요청 바디**: { adviceId: [조언 ID], newContent: [수정한 조언 내용] }
   - **요청 예시**: PATCH https://empathydiaryapi.com/advices
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 400: 요청 바디가 유효하지 않음
     - 403: 로그인되지 않음, 접근 권한이 없음
     - 500: 서버 에러
   - **응답 형태**: TEXT(실패 시), JSON(성공 시)
   - **응답 예시**
     - 조언 내용이 전달되지 않았습니다.
     - { "adviceId": "[조언 ID]", "newContent": "[수정된 조언 내용]" }

### [a-05] 조언 삭제

1. **개요**
   - **목적**: 작성한 조언을 삭제한다.
2. **HTTP 요청**
   - **HTTP 메소드**: DELETE
   - **경로 및 쿼리 파라미터**: /advices/:adviceId
   - **요청 예시**: DELETE https://empathydiaryapi.com/advices/1
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음, 접근 권한이 없음
     - 500: 서버 에러
   - **응답 형태**: TEXT
   - **응답 예시**
     - 조언이 삭제되었습니다.

## 감정

일기장에 매핑된 감정과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /emotions | e-01 | 사용자의 누적된 모든 감정 조회 |
| GET | /emotions/period?{startDate}&{endDate} | e-02 | 특정 기간 동안 누적된 감정 모두 조회 |

### [e-01] 사용자의 누적된 모든 감정 조회

1. **개요**
   - **목적**: 사용자가 작성한 모든 일기에 매핑된 감정들의 총 개수를 조회한다.
2. **HTTP 요청**
   - **HTTP 메소드**: GET
   - **경로 및 쿼리 파라미터**: /emotions
   - **요청 예시**: GET https://empathydiaryapi.com/emotions
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT(실패 시), JSON(성공 시)
   - **응답 예시**
     - 로그인이 필요합니다.
     - { "emotions": [ {"기쁨": 0}, {"사랑": 3}, {"뿌듯함": 2}] }

### [e-02] 특정 기간 동안 누적된 모든 감정 조회

1. **개요**
   - **목적**: 특정 기간 동안 사용자가 작성한 모든 일기에 매핑된 감정들의 총 개수를 조회한다.
2. **HTTP 요청**
   - **HTTP 메소드**: GET
   - **경로 및 쿼리 파라미터**: /emotions/period?startDate=[시작 날짜]&endDate=[종료 날짜]
   - **요청 예시**: GET https://empathydiaryapi.com/emotions/period?startDate=2024-05-05&endDate=2024-05-05
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 400: 불충분한 쿼리 파라미터, 유효하지 않은 쿼리 파라미터 값
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT(실패 시), JSON(성공 시)
   - **응답 예시**
     - 로그인이 필요합니다.
     - { "emotions": [ {"기쁨": 0}, {"사랑": 3}, {"뿌듯함": 2}] }

## 감성

일기장에 매핑된 감성과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /sentiments/period?{startDate}&{endDate} | s-01 | 특정 기간 동안의 감성 점수 조회 |

### [s-01] 특정 기간 동안의 감성 점수 조회

1. **개요**
   - **목적**: 특정 기간 동안 일별로 사용자가 작성한 일기의 감성 점수 평균을 조회한다.
2. **HTTP 요청**
   - **HTTP 메소드**: GET
   - **경로 및 쿼리 파라미터**: /sentiments/period?startDate=[시작 날짜]&endDate=[종료 날짜]
   - **요청 예시**: GET https://empathydiaryapi.com/sentiments/period?startDate=2024-05-01&endDate=2024-05-05
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT(실패 시), JSON(성공 시)
   - **응답 예시**
     - 로그인이 필요합니다.
     - {"sentiments":[{"2024. 05. 03.":{"positive":50,"negative":50}},{"2024. 05. 05.":{"positive":50,"negative":50}}]}

## 대화방

사용자와 AI 챗봇의 대화와 관련된 내용들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| POST | /chatrooms | cr-01 | AI 챗봇과의 대화방 생성 |
| POST | /chatrooms/summarize | cr-02 | AI 챗봇과의 대화 제출(일기 생성) |
| GET | /chatrooms | cr-03 | AI 챗봇과의 최근 대화 내용 불러오기 |
| POST | /chatrooms/chats | cr-04 | AI 챗봇에게 메시지 전송 |

### [cr-01] AI 챗봇과의 대화방 생성

1. **개요**
   - **목적**: 사용자는 일기 작성을 위해 AI 챗봇과의 대화방을 생성한다.
2. **HTTP 요청**
   - **HTTP 메소드**: POST
   - **경로 및 쿼리 파라미터**: /chatrooms
   - **요청 예시**: POST https://empathydiaryapi.com/chatrooms
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT(실패 시), JSON(성공 시)
   - **응답 예시**
     - 로그인이 필요합니다.
     - { "roomId": 1, "chat": { "role": "assistant", "content": "[AI 챗봇의 첫 번째 메시지 내용]" } }

### [cr-02] AI 챗봇과의 대화 제출(일기 생성)

1. **개요**
   - **목적**: 사용자는 AI 챗봇과의 대화를 기반으로 일기를 생성한다.
2. **HTTP 요청**
   - **HTTP 메소드**: POST
   - **경로 및 쿼리 파라미터**: /chatrooms/summarize
   - **요청 예시**: POST https://empathydiaryapi.com/chatrooms/summarize
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음
     - 404: 채팅방이 존재하지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT(실패 시), JSON(성공 시)
   - **응답 예시**
     - 로그인이 필요합니다.
     - { "content": "[AI가 대화 내용을 요약하여 생성한 일기 내용]" }

### [cr-03] AI 챗봇과의 최근 대화 내용 불러오기

1. **개요**
   - **목적**: 사용자는 일기 내용을 보충하기 위해 직전의 대화를 다시 불러올 수 있다.
2. **HTTP 요청**
   - **HTTP 메소드**: GET
   - **경로 및 쿼리 파라미터**: /chatrooms
   - **요청 예시**: GET https://empathydiaryapi.com/chatrooms
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 403: 로그인되지 않음
     - 404: 채팅방이 존재하지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT(실패 시), JSON(성공 시)
   - **응답 예시**
     - 로그인이 필요합니다.
     - { "roomId": 1, "chats": [ { "role": "assistant", "content": "안녕하세요" }, { "role": "user", "content": "그래 안녕" } ] }

### [cr-04] AI 챗봇에게 메시지 전송

1. **개요**
   - **목적**: 사용자는 일기 작성을 위해 AI 챗봇에게 메시지를 전송한다.
2. **HTTP 요청**
   - **HTTP 메소드**: POST
   - **경로 및 쿼리 파라미터**: /chatrooms/chats
   - **요청 바디**: { content: "[사용자의 메시지]" }
   - **요청 예시**: POST https://empathydiaryapi.com/chatrooms/chats
3. **HTTP 응답**
   - **응답 코드**
     - 200: 성공
     - 400: 요청 바디가 유효하지 않음
     - 403: 로그인되지 않음
     - 404: 채팅방이 존재하지 않음
     - 500: 서버 에러
   - **응답 형태**: TEXT(실패 시), JSON(성공 시)
   - **응답 예시**
     - 요청 바디가 유효하지 않습니다.
     - { "chat": { "role": "assistant", "content": "[AI의 응답]" } }