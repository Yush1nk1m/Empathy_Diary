function submitDiary() {
    const content = document.getElementById('diaryContent').value;
    fetch('http://localhost:8080/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    })
    .then(response => {
        return response.text().then(text => {
            alert(text);
            if (response.ok) {
                window.location.href = '/';
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert("일기 작성 중 에러가 발생했습니다.");
    });
}
