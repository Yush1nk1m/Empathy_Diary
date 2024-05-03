document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:8080/advices/me')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch advices');
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('advicesContainer');
            data.advices.forEach(advice => {
                const adviceEntry = document.createElement('div');
                adviceEntry.className = 'advice-entry';
                adviceEntry.innerHTML = `
                    <p id=content-${advice.adviceId}>${advice.content}</p>
                    <small>${advice.writeDate} ${advice.writeTime}</small>
                    <button onclick="editAdvice(${advice.adviceId})">수정</button>
                    <button onclick="deleteAdvice(${advice.adviceId})">삭제</button>
                `;
                container.appendChild(adviceEntry);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading advices.');
        });
});

function editAdvice(adviceId) {
    const contentP = document.getElementById(`content-${adviceId}`);
    const currentContent = contentP.innerText;
    contentP.outerHTML = `<textarea id="edit-content-${adviceId}">${currentContent}</textarea>`;
    const button = document.querySelector(`button[onclick="editAdvice(${adviceId})"]`);
    button.innerText = '수정 완료';
    button.onclick = () => submitAdviceEdit(adviceId);
}

function submitAdviceEdit(adviceId) {
    const editedContent = document.getElementById(`edit-content-${adviceId}`).value;
    fetch('http://localhost:8080/advices', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adviceId: adviceId, newContent: editedContent })
    })
    .then(response => {
        if (response.ok)
            return response.json();
        else
            throw new Error(response.text());
    })
    .then(data => {
        const contentArea = document.getElementById(`edit-content-${adviceId}`);
        contentArea.outerHTML = `<p id="content-${adviceId}">${data.newContent}</p>`;
        const button = document.querySelector(`button[onclick="editAdvice(${adviceId})"]`);
        button.innerText = '수정';
        button.onclick = () => editAdvice(adviceId);
    })
    .catch(error => {
        alert('수정 실패: ' + error.message);
    });
}
  

function deleteAdvice(adviceId) {
    console.log('Delete advice:', adviceId);
    // 삭제 로직을 구현하세요.
}
