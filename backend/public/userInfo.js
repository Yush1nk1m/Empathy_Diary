document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:8080/users', {
        method: 'GET'
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('서버로부터 정보를 가져오는 데 실패했습니다.');
        }
    })
    .then(userInfo => {
        const displayDiv = document.getElementById('userInfoDisplay');
        displayDiv.innerHTML = `
            <p>사용자 ID: ${userInfo.userId}</p>
            <p>이메일: ${userInfo.email}</p>
            <p>닉네임: ${userInfo.nickname}</p>
        `;
    })
    .catch(error => {
        document.getElementById('userInfoDisplay').textContent = error.message;
    });
});
