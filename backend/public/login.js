document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();  // 폼의 기본 제출 이벤트 방지
    const formData = new FormData(this);

    fetch('http://localhost:8080/users/login', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('로그인 성공!');
            window.location.href = '/';  // 메인 페이지로 리디렉션
        } else {
            return response.text().then(text => { throw new Error(text); });
        }
    })
    .catch(error => {
        alert('로그인 실패: ' + error.message);
    });
});
