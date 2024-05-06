document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('source');

    if (source === "index") {
        fetch('http://localhost:8080/chatrooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            const chatContainer = document.getElementById('chatContainer');
            const chatMessage = document.createElement('div');
            chatMessage.className = data.chat.role === 'assistant' ? 'chat-assistant' : 'chat-user';
            chatMessage.textContent = data.chat.content;
            chatContainer.appendChild(chatMessage);
        })
        .catch(error => {
            console.error('Error loading chats:', error);
        });
    }
    else if (source === "summarize") {
        fetch('http://localhost:8080/chatrooms', {
            method: 'GET',
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
    }
});

function sendMessage() {
    const inputField = document.getElementById('messageInput');
    const sendButton = document.querySelector('button[onclick="sendMessage()"]');
    
    const message = inputField.value;
    if (!message.trim()) return;  // 빈 메시지는 보내지 않음

    // 입력 필드 및 버튼 비활성화
    inputField.disabled = true;
    sendButton.disabled = true;

    const chatContainer = document.getElementById('chatContainer');
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-user';
    userMessage.textContent = message;
    chatContainer.appendChild(userMessage);

    // 서버로 메시지 전송
    fetch('http://localhost:8080/chatrooms/chats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.chat) {
            const aiResponse = document.createElement('div');
            aiResponse.className = 'chat-assistant';
            aiResponse.textContent = data.chat.content;
            chatContainer.appendChild(aiResponse);
        }
    })
    .catch(error => {
        console.error('Error sending message:', error);
        alert('메시지 전송 중 오류가 발생했습니다.');
    })
    .finally(() => {
        // 입력 필드 및 버튼 활성화
        inputField.disabled = false;
        sendButton.disabled = false;
        inputField.value = '';  // 입력 필드 초기화
        inputField.focus();  // 입력 필드에 포커스 설정
    });
}

function summarizeDiary() {
    // 일기 요약 기능을 호출하는 함수 (서버 API 호출 필요)
    window.location.href='summarizeDiary.html';
}
