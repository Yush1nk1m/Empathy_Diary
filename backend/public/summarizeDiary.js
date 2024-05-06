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
    window.location.href = '/';
}

function continueWriting() {
    // chatRoom.html로 이동
    window.location.href = 'chatRoom.html?source=summarize';
}
