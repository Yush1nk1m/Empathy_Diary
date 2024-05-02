document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:8080/posts')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('diariesContainer');
            data.diaries.forEach(diary => {
                const diaryEntry = document.createElement('div');
                diaryEntry.className = 'diary-entry';
                diaryEntry.setAttribute('data-id', diary.id);
                diaryEntry.innerHTML = `
                    <h3>${diary.writeDate} ${diary.writeTime}</h3>
                    <p id="content-${diary.id}">${diary.content}</p>
                    <button onclick="editDiary(${diary.id})">수정</button>
                    <button onclick="deleteDiary(${diary.id})">삭제</button>
                `;
                container.appendChild(diaryEntry);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert("일기 조회 중 에러가 발생했습니다.");
        });
});

function deleteDiary(postId) {
    if (confirm("정말로 삭제하시겠습니까?")) {
        fetch(`http://localhost:8080/posts/${postId}`, {
            method: 'DELETE'
        })
        .then(response => response.text())
        .then(text => {
            alert(text);
        })
        .catch(error => {
            alert('일기 삭제 실패: ' + error.message);
        });
    }
}

function editDiary(diaryId) {
    const contentPara = document.getElementById(`content-${diaryId}`);
    const currentContent = contentPara.innerText;
    contentPara.innerHTML = `<input type="text" value="${currentContent}" id="edit-content-${diaryId}">`;
    const button = contentPara.nextElementSibling;
    button.innerText = '수정 완료';
    button.onclick = () => submitDiaryEdit(diaryId);
}

function submitDiaryEdit(diaryId) {
    const editedContent = document.getElementById(`edit-content-${diaryId}`).value;
    fetch(`http://localhost:8080/posts`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId: diaryId, newContent: editedContent })
    })
    .then(response => {
        if (response.ok) {
            document.getElementById(`content-${diaryId}`).innerText = editedContent;
            const button = document.getElementById(`content-${diaryId}`).nextElementSibling;
            button.innerText = '수정';
            button.onclick = () => editDiary(diaryId); // 버튼 기능을 원래대로 복구
        } else {
            return response.text().then(text => {
                throw new Error(text);
            });
        }
    })
    .catch(error => {
        alert('일기 수정 실패: ' + error.message);
    });
}