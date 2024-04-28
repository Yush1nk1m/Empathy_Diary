function logout() {
    fetch('http://localhost:8080/users/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {  // HTTP 상태 코드 200 (성공)
            return response.text().then(message => {
                alert(message);  // 서버 응답 메시지
                window.location.href = '/';  // 메인 페이지로 리디렉션
            });
        } else {
            return response.text().then(message => {
                throw new Error(message);  // 에러 메시지 발생
            });
        }
    })
    .catch(error => {
        alert(error.message);  // 에러 처리
    });
}
