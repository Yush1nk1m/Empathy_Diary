function submitAdvice() {
    const content = document.getElementById('adviceContent').value;
    fetch('http://localhost:8080/advices', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: content })
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
        alert("조언 전송 중 에러가 발생했습니다.");
    });
}
