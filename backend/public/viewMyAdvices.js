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
                    <p>${advice.content}</p>
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
    console.log('Edit advice:', adviceId);
    // 수정 로직을 구현하세요.
}

function deleteAdvice(adviceId) {
    console.log('Delete advice:', adviceId);
    // 삭제 로직을 구현하세요.
}
