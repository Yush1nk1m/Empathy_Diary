document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:8080/chatrooms/summarize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('diarySummary').value = data.content;
    })
    .catch(error => {
        console.error('Error fetching summary:', error);
        alert('일기 요약 가져오기 실패');
    });
});

function saveDiary() {
    // 여기에 일기 저장 로직을 구현
    const content = document.getElementById('diarySummary').value;
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

function continueWriting() {
    // chatRoom.html로 이동
    window.location.href = 'chatRoom.html?source=summarize';
}
