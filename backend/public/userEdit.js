document.addEventListener('DOMContentLoaded', function() {
    // 사용자 정보를 가져와서 폼에 채웁니다.
    fetch('http://localhost:8080/users', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('userId').value = data.userId;
        document.getElementById('email').value = data.email;
        document.getElementById('nickname').value = data.nickname;
    });

    // 폼 제출 이벤트를 처리합니다.
    document.getElementById('editForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const body = {
            newNickname: formData.get('nickname'),
            newPassword: formData.get('newPassword'),
            newConfirmPassword: formData.get('newConfirmPassword'),
            password: formData.get('password')
        };

        fetch('http://localhost:8080/users', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        .then(response => {
            return response.text().then(text => {
                if (response.ok) {
                    alert(text);
                    window.location.href = '/';
                } else {
                    throw new Error(text);
                }
            });
        })
        .catch(error => {
            alert('수정 실패: ' + error.message);
        });
    });
});
