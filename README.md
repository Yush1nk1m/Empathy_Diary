# 공감 다이어리 (2024. 03. ~ 2024. 05.)

최종 편집 일시: 2024년 6월 2일 오후 9:33</br>
태그: Artillery, ChatGPT, EC2, Express, HTTPS, Javascript, Jest, MySQL, Node.JS, Redis, Sequelize, Supertest</br>
관련 링크: https://github.com/Yush1nk1m/Empathy_Diary</br>

![Untitled](%E1%84%80%E1%85%A9%E1%86%BC%E1%84%80%E1%85%A1%E1%86%B7%20%E1%84%83%E1%85%A1%E1%84%8B%E1%85%B5%E1%84%8B%E1%85%A5%E1%84%85%E1%85%B5%20(2024%2003%20~%202024%2005%20)%200820caaaafa64a49af1634ee037c5ca7/Untitled.png)

## 1. 프로젝트 소개

 공감 다이어리는 AI 기술을 활용한 일기 웹 애플리케이션입니다. 공감 다이어리 서비스에서 사용자들은 일기를 작성하고 자신의 감정 정보를 추적하며, 때로는 정신 건강 상태를 진단해볼 수도 있습니다. 이외에도 매일 자신과 비슷한 감정을 느낀 사용자들에게 익명의 따뜻한 조언을 전달함으로써 사용자 간의 연결감을 제공합니다. 이것이 이 서비스를 공감 다이어리라고 명명한 이유입니다.

 본 프로젝트는 2024년 1학기 서강대학교 인공지능 연계전공의 **AI융합캡스톤디자인과창업** 교과에서 진행된 프로젝트입니다.

 **프로젝트 공통 과제**: AI 기술을 활용한 일기 웹 애플리케이션 개발

 **백엔드 개발 목표**: 사용자 데이터와 AI 생성 데이터를 적절히 관리할 수 있는 백엔드 API 서버 개발

 **프로젝트 규모**: 구현 및 테스트 코드 약 8,000 라인, 개발 문서 약 1,200 라인, 총 209회 커밋 (추가 커밋 내용은 시연을 위한 임시 기능 추가입니다.)

 **아키텍처:**

![Untitled](%E1%84%80%E1%85%A9%E1%86%BC%E1%84%80%E1%85%A1%E1%86%B7%20%E1%84%83%E1%85%A1%E1%84%8B%E1%85%B5%E1%84%8B%E1%85%A5%E1%84%85%E1%85%B5%20(2024%2003%20~%202024%2005%20)%200820caaaafa64a49af1634ee037c5ca7/Untitled%201.png)

## 2. 프로젝트 핵심 기술 및 기여 내용

 

### 2-1. 프로젝트 핵심 기술 사용 목적 및 근거

- **Node.js + Express**
    - **사용 목적**: 백엔드 API 서버 구현
    - **사용 근거**
        - 프론트엔드 개발자와 같은 프로그래밍 언어로 개발할 수 있어 상호 간 코드를 이해하기 쉽다.
        - 짧은 기간 내에 프로토타입을 개발할 수 있다.
- **MySQL + Sequelize**
    - **사용 목적**: 데이터베이스 조작
    - **사용 근거**
        - 이전 프로젝트는 NoSQL 데이터베이스를 사용하였는데 이는 비관계형 특성상 테이블 간 관계를 개발자가 임의로 표현해야 하고 CASCADE 같은 연산이 자동적으로 주어지지 않아 불편하였다. 따라서 데이터 무결성을 조금 더 쉽게 보장하고 완성도 높은 서비스를 설계하기 위해 RDBMS인 MySQL을 선택하였다.
        - 프로젝트 주제를 3월 초부터 잡을 수 있었기 때문에 데이터베이스 설계를 미리 해둘 시간이 충분하였다. 따라서 RDBMS를 선택함에도 시간적으로 무리가 없었다.
        - 쿼리를 직접 작성하지 않고 데이터베이스를 쉽게 조작하기 위해 ORM인 Sequelize를 사용하였다.
- **Redis**
    - **사용 목적**: 배포 환경에서의 멀티 프로세싱을 고려한 세션 저장
    - **사용 근거**
        - 서버 메모리에서 세션을 관리하면 사용자가 보내는 요청을 다른 프로세스가 처리할 때 로그인 상태가 해제된 것으로 간주할 수 있다. 이를 방지하기 위해 세션을 메모리에 저장하지 않고 외부 데이터베이스인 Redis에 저장하도록 설정하였다.
- **Jest + Supertest**
    - **사용 목적**: 테스트 작성
    - **사용 근거**
        - 테스트 작성을 통해 추후 Continuous Integration/Continuous Deployment를 도입 가능한 소프트웨어를 개발하고자 Jest, Supertest를 사용하였다.
        - 둘 다 유명한 프레임워크, 라이브러리이기 때문에 인터넷에 참고할 만한 문서가 많고, Node.js를 공부할 때 참고한 서적에 소개되어 있어 짧은 기간에 테스트를 많이 작성하기 용이할 것 같아 선택하였다.
- **HTTPS Protocol**
    - **사용 목적**: CORS 관련 문제로부터의 해방
    - **사용 근거**
        - 백엔드 서버에서 쿠키 기반으로 사용자 인증을 진행하고 있는데, 이와 관련하여 프론트엔드 서버에서 로그인 요청 시 쿠키가 올바르게 응답되지 않는 CORS 문제가 존재하였다.
        - 프론트엔드 서버와 백엔드 서버가 같은 서버 내에서 실행된다면 간단한 로직 수정으로 CORS의 허용 도메인을 직접 명시하여 해결할 수 있으나, 프론트엔드 개발자에게 백엔드 서버를 로컬에 설치하는 방법을 알려주기 어려워 안정적으로 API를 테스트할 수 있게 하기 위해 HTTPS 서버로 전환하였다.

### 2-2. 프로젝트 기여 내용

 본 프로젝트에서 저는 1인 백엔드 개발을 진행했습니다. 그럼에도 이전 프로젝트에서 미숙한 설계와 부족한 협업이 소프트웨어의 위기를 낳는 것을 확인했기 때문에 여러 명이 같이 작업을 진행할 수 있을 정도로 설계가 깔끔한 백엔드 서버를 개발하고자 하였습니다.

 제가 수행한 주요한 작업은 다음과 같습니다.

1. **유스케이스 기반 프론트엔드에서 필요한 페이지 정의**</br>
 웹 디자이너가 사용하는 사용자 시나리오와 유스케이스 작성 방식을 혼합하여 백엔드 개발자와 프론트엔드 개발자가 함께 이해할 수 있는 변형된 유스케이스를 도출하였습니다. 이를 통해 사전에 서비스에 필요한 페이지를 정의하고 기능적 요구 사항에 대해 생각해볼 수 있었습니다.
    
    ![Untitled](%E1%84%80%E1%85%A9%E1%86%BC%E1%84%80%E1%85%A1%E1%86%B7%20%E1%84%83%E1%85%A1%E1%84%8B%E1%85%B5%E1%84%8B%E1%85%A5%E1%84%85%E1%85%B5%20(2024%2003%20~%202024%2005%20)%200820caaaafa64a49af1634ee037c5ca7/Untitled%202.png)
    
2. **데이터베이스 설계 및 구현**</br>
 먼저 서비스에 필요한 개체들을 떠올리고 이에 대한 시퀄라이즈 모델을 생성했습니다. 이후 개체 간에 일대일, 일대다, 다대다 관계 중 어떤 관계가 존재하는지 분석하여 관계를 연결한 후 CASCADE 옵션까지 고려하여 모델을 완성했습니다.
3. **RESTful API 설계 및 구현**</br>
 프로젝트 리포지토리 내에서 API 문서를 따로 생성하여 관리했습니다. 구현을 시작하기 전 먼저 서비스의 주요 기능들을 구현하기 위해 필요한 REST API들을 정의하고, API별로 URI, 요청 형식, 응답 형식을 꼼꼼히 정의한 후 구현을 시작했습니다.
4. **전체적인 서버 로직 구현**</br>
 라우터, 컨트롤러 로직을 구현하고, 코드들의 디렉터리 구조를 설계하였습니다.
5. **서버 로직에 대한 단위 테스트 작성**</br>
 Jest를 사용해 구현한 컨트롤러 코드에 대한 단위 테스트를 작성했습니다. 전체적인 컨트롤러 로직이 복잡하지 않았기 때문에 테스트 커버리지 100%을 목표로 단위 테스트를 작성할 수 있었습니다.
6. **서버 로직에 대한 통합 테스트 작성**</br>
 Jest, Supertest를 사용해 구현한 라우터 코드에 대해 통합 테스트를 작성했습니다. 통합 테스트를 작성할 때에는 복잡한 사용자 시나리오를 생각하지 않고 단순히 특정 경로로 요청을 보낼 때 사전 정의한 상태 코드를 모두 응답시킬 수 있게끔 테스트를 설계하였습니다.
7. **설계한 내용에 대한 개발 문서화**</br>
 데이터베이스 구조 및 정의한 모델들의 정보를 담은 문서, REST API 문서, 테스트 계획 및 테스트별 설명 문서를 작성했습니다.
8. **서비스 배포**</br>
 AWS Lightsail, EC2 인스턴스를 통해 배포를 진행했습니다. 배포 과정에서 pm2를 사용해 서버를 멀티 프로세스로 실행시키는 방법, 서버 실행 후 오류를 모니터링하는 방법을 터득했고, nginx를 사용해 특정 포트로 들어오는 요청을 서버가 실행되고 있는 포트로 포워딩하는 방법을 터득했습니다.

## 3. 배운 점 및 아쉬웠던 점

### 3-1. 프로젝트를 통해 배운 점

1. **서비스 배포 방법 및 고려해야 할 점**</br>
 이전에 진행한 프로젝트에서 서비스를 배포하지 못했던 점이 큰 아쉬움으로 남아 필요한 기능이 모두 구현되고 단위 테스트를 모두 작성한 직후 첫 번째 버전의 서비스를 AWS lightsail을 사용하여 배포했습니다.
 배포 과정 중 먼저 pm2를 통해 백그라운드에서 서버를 실행시키며, 상황에 따라 여러 개의 프로세스에서 서버를 실행시키는 방법에 대해서 알게 되었으며, nginx와 같은 프록시 서버를 통해 특정 포트로 들어오는 요청을 다른 포트에 있는 서버로 포워딩하는 방법도 알게 되었습니다.</br>
 이후 HTTPS를 도입하는 과정에서 백엔드 서버를 AWS EC2로 전환하였습니다. 배포한 서버를 전환한 이유는 AWS의 다양한 인스턴스를 생성하는 방법, 그 환경에서 배포하는 방법에 대해 폭넓게 익히고 싶었기 때문입니다.</br>
 프론트엔드 서버를 배포할 때는 프론트엔드 개발자가 백엔드 서버의 기능 테스트 페이지로 시연에 필요한 기능을 사용할 수 있도록 기존에 사용했던 lightsail 서버에 프론트엔드 서버를 배포했습니다.
2. **HTTPS와 보안의 중요성**</br>
 요즘 대부분의 서비스에서 프론트엔드 서버와 백엔드 서버가 따로 존재합니다. 서버 간 통신에는 CORS 제약이 존재해 쿠키 기반으로 사용자 인증을 진행하는 passport 패키지를 원활히 사용할 수 없게 되는데 이때 백엔드 서버의 프로토콜을 HTTP가 아닌 HTTPS로 바꾸면 매우 간단한 로직의 변경으로 이러한 문제를 해결할 수 있다는 것을 알게 되었습니다.</br>
 이전 프로젝트에서 겪었던 문제이고 이번에도 발생할 것이라 충분히 예상했음에도 불구하고 미리 대비를 해놓지 못한 점은 아쉽습니다. 그러나 CORS 관련 이슈가 발생한 직후부터 책임지고 10시간 동안 밤새 작업을 해 프론트엔드 개발자님의 작업에 지장이 없도록 하였습니다.</br>
 이 과정에서 보안에 대해 다시 한번 생각해 보게 되었고, 특히 단순히 CORS 에러를 해결하기 위함이 아니라 사용자의 중요한 데이터를 다루는 백엔드 서버는 HTTPS 프로토콜 사용으로 보호돼야 한다는 점을 느꼈습니다.
3. **테스트 작성 방법 및 기능 테스트 페이지 작성의 필요성**</br>
 이전에 진행한 프로젝트에서 기능 테스트 페이지만 작성하고 테스트를 수행하지 못해 소프트웨어 동작에 대한 신뢰성을 충분히 재고하지 못했습니다. 본 프로젝트에서는 이를 보완하기 위해 Jest, Supertest를 활용해 단위 테스트와 통합 테스트를 작성하였습니다.</br>
 이를 통해 단위 테스트에서는 외부 라이브러리나 프레임워크에 의존하지 않고 동작 자체가 잘 수행되는 것을 보증해야 하고, 통합 테스트에서는 외부 라이브러리나 프레임워크를 모두 포함한 상태에서 API가 문제가 있는 입력 및 적절한 입력에 대해 설계한 대로 응답하는 것을 보장해야 한다는 것을 알 수 있었습니다.</br>
 그러나 작성해둔 테스트가 있음에도 별도의 기능 테스트 페이지는 두면 좋다는 생각이 들었습니다. 프론트엔드 개발자가 직접 기능 테스트 페이지를 통해 API의 작동을 이해하면서 동시에 백엔드 개발자가 생각하는 서비스의 모습을 이해할 수 있기 때문입니다.
4. **충분한 설계의 장점**</br>
 이전에 진행한 프로젝트에서 불충분한 설계로 인해 백엔드 개발자 간 소통이 원활하지 못했던 소프트웨어 위기 경험이 있습니다. 본 프로젝트에서는 백엔드를 혼자서 개발함에도 언제든 추가 인력이 투입될 수 있는 상황이라고 가정하고 시작하기 전부터 데이터베이스, REST API를 미리 설계하고 문서화하여 효율적으로 개발할 수 있었습니다.</br>
 그 결과 사전에 프로젝트에 대한 설계를 충분하게 해둘수록 이후에 구현함에 있어 시간 관리가 용이해지고 동시에 개발을 시작하는 다른 팀원들도 개발 현황을 추적할 수 있기 때문에 팀워크적으로도 큰 도움이 된다는 것을 체감할 수 있었습니다.
 그러나 이는 어디까지나 충분한 설계에 관한 이야기이지 waterfall 개발 모델처럼 사전에 완벽한 설계를 추구해서는 안 된다고 생각합니다. 인간은 누구나 실수를 할 수 있고 첫 번째 설계부터 완벽한 소프트웨어란 존재할 수 없기 때문입니다.

### 3-2. 프로젝트에서 아쉬웠던 점

1. **API 버전 관리 미흡함**</br>
 RESTful API를 구현할 때마다 중간쯤부터 설계에 불만이 생기기 시작합니다. API를 설계할 당시에는 URI, 요청 바디 형식, 응답 바디 형식 등이 일관성 있고 명확하다고 생각했지만, 실제 구현을 하다 보면 그렇게 일관성있지도 않고 명확하지도 않은 것 같다는 생각이 듭니다. 이럴 때 API를 v1, v2 등의 버전으로 나누어 관리하면 첫 번째 구현에서 생긴 불만 사항을 즉시 반영해 가며 프로젝트가 발전할 수 있을 텐데 이를 생각하지 못하고 단일 버전의 API만을 만들게 된 것이 아쉽습니다.
2. **TDD를 도입하지 못함**</br>
 제가 확인해본 바로는 Test-Driven Development의 정의에 대한 입장은 크게 두 가지가 있습니다. 먼저 단위 테스트를 만들어놓고 구현 코드를 작성하는 것이 TDD의 정의라는 입장과, 단위 테스트와 구현 코드를 동시에 작성하는 것이 TDD의 정의라는 입장입니다. 저는 API별로 구현 코드를 다 작성해놓고 단위 테스트를 그에 맞춰 작성했기 때문에 이번 프로젝트에 TDD를 도입했다고 보긴 어려울 것 같습니다.
3. **Typescript를 도입하지 못함**</br>
 프로젝트 진행 중 유튜브에서 Typescript에 대한 영상을 많이 찾아봤습니다. Javascript에서 가장 많이 발생하는 에러는 타입 에러이고, 상위 10개의 에러를 나열해도 그 중 절반 이상이 타입 관련 에러라고 합니다. Typescript를 사용하면 타입 에러는 확실히 피할 수 있으므로 다음부터는 프로젝트를 Typescript를 이용해서 개발해야겠다는 생각을 하게 되었습니다.
 이전에는 Typescript 사용으로 인해 코드를 읽고 쓰기 복잡해진다는 단점에만 매몰되어 있어서 도입을 고려하지 못하고 있었는데, 직접 부딪혀가면서 읽기 쉬운 코드를 작성하는 노하우를 터득해 나가는 것이 맞는 방향이라고 생각합니다.
