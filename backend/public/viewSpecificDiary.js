function fetchDiary() {
    const diaryId = document.getElementById('diaryId').value;
    fetch(`http://localhost:8080/posts/${diaryId}`)
        .then(response => {
            if (!response.ok) {
                return response.text()
                    .then((message) => {
                        throw new Error(message);
                    });
            }
            return response.json();
        })
        .then(data => {
            const diaryDetails = document.getElementById('diaryDetails');
            diaryDetails.innerHTML = `
                <h2>일기 내용</h2>
                <p>${data.diary.content}</p>
                <h4>작성 날짜: ${data.diary.writeDate}</h4>
                <h4>작성 시각: ${data.diary.writeTime}</h4>
            `;
        })
        .catch(error => {
            alert(error.message);
        });
}
