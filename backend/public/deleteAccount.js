function confirmDelete() {
    const confirmMessage = document.getElementById('confirmText').value;
    if (confirmMessage === "회원 탈퇴를 희망합니다.") {
        if (confirm("정말로 탈퇴하시겠습니까?")) {
            fetch('http://localhost:8080/users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ confirmMessage })
            })
            .then(response => {
                if (response.ok) {
                    alert("회원 탈퇴 처리가 완료되었습니다.");
                    window.location.href = '/';
                } else {
                    alert("오류가 발생했습니다. 다시 시도해 주세요.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("통신 오류가 발생했습니다.");
            });
        }
    } else {
        alert("정확한 문구를 입력해 주세요.");
    }
}
