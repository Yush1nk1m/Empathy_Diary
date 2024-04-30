document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:8080/posts')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('diariesContainer');
            data.diaries.forEach(diary => {
                const diaryEntry = document.createElement('div');
                diaryEntry.className = 'diary-entry';
                diaryEntry.innerHTML = `
                    <h3>${diary.writeDate} ${diary.writeTime}</h3>
                    <p>${diary.content}</p>
                `;
                container.appendChild(diaryEntry);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert("일기 조회 중 에러가 발생했습니다.");
        });
});
