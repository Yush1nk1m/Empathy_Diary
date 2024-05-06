document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:8080/chatrooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const chatContainer = document.getElementById('chatContainer');
        data.chats.forEach(chat => {
            const chatMessage = document.createElement('div');
            chatMessage.className = chat.role === 'assistant' ? 'chat-assistant' : 'chat-user';
            chatMessage.textContent = chat.content;
            chatContainer.appendChild(chatMessage);
        });
    })
    .catch(error => {
        console.error('Error loading chats:', error);
    });
});

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    // 예제로 사용자 메시지를 즉시 추가하고, 실제로는 서버에 전송 로직 필요
    const chatContainer = document.getElementById('chatContainer');
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-user';
    userMessage.textContent = message;
    chatContainer.appendChild(userMessage);
    messageInput.value = '';
}

function summarizeDiary() {
    // 일기 요약 기능을 호출하는 함수 (서버 API 호출 필요)
    alert('일기 요약 기능 구현 필요');
}
