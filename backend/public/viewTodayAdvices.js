document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:8080/advices/today')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('advicesContainer');
            data.advices.forEach(advice => {
                const adviceElement = document.createElement('div');
                adviceElement.className = 'advice-entry';
                adviceElement.innerHTML = `
                    <p>${advice.content}</p>
                    <small>${advice.writeDate} ${advice.writeTime}</small>
                `;
                container.appendChild(adviceElement);
            });
        })
        .catch(error => {
            console.error('Error fetching today\'s advices:', error);
            container.innerHTML = '<p>Error loading advices.</p>';
        });
});
