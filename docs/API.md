# RESTful API

## 회원

회원과 관련된 정보들을 관리한다.

| HTTP method | URI | API ID | role |
| :--: | :-- | :--: | :-- |
| GET | /users | u-01 | 회원 정보 조회 |
| POST | /users | u-02 | 회원 가입 |
| POST | /users/login | u-03 | 로그인 |
| PATCH | /users | u-04 | 회원 정보 수정 |
| DELETE | /users | u-05 | 회원 탈퇴 |

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