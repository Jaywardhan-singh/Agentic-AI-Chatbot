const LYZR_API_ENDPOINT = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';
const LYZR_API_KEY = 'sk-default-8mMgqx3cvc0BQfZT4i0PVYWwN1i6MxmB';
const USER_ID = 'jays2002singh@gmail.com';
const AGENT_ID = '687f95ead1873d04f9c7aa85';
const SESSION_ID = '687f95ead1873d04f9c7aa85-q3bbfwermq';

const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    const bubble = document.createElement('div');
    bubble.className = `bubble ${sender}`;

    // Custom formatting: points as separate paragraphs with spacing
    function formatText(text) {
        // Split into blocks by double newlines
        const blocks = text.split(/\n\n+/);
        let html = '';
        blocks.forEach(block => {
            // Numbered points (e.g., 1. ... 2. ...)
            if (/^(\d+\. .*(\n\d+\. .*)+)/.test(block)) {
                block.split(/\n/).forEach(line => {
                    const match = line.match(/^(\d+)\. (.*)/);
                    if (match) html += `<p style='margin-bottom:1em;'><strong>${match[1]}.</strong> ${match[2]}</p>`;
                });
            }
            // Bulleted points (e.g., - ... or * ...)
            else if (/^([-*] .*(\n[-*] .*)+)/.test(block)) {
                block.split(/\n/).forEach(line => {
                    const match = line.match(/^[-*] (.*)/);
                    if (match) html += `<p style='margin-bottom:1em;'>&bull; ${match[1]}</p>`;
                });
            }
            // Paragraph
            else {
                // Replace single newlines with <br> for line breaks within a paragraph
                html += `<p>${block.replace(/\n/g, '<br>')}</p>`;
            }
        });
        return html;
    }

    bubble.innerHTML = formatText(text);
    messageDiv.appendChild(bubble);
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    // Hide welcome message on first user input
    const welcome = document.querySelector('.chatbot-welcome');
    if (welcome) welcome.style.display = 'none';
    appendMessage(message, 'user');
    userInput.value = '';
    appendMessage('...', 'bot'); // Loading indicator

    try {
        const response = await fetch(LYZR_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': LYZR_API_KEY
            },
            body: JSON.stringify({
                user_id: USER_ID,
                agent_id: AGENT_ID,
                session_id: SESSION_ID,
                message: message
            })
        });
        const data = await response.json();
        // Remove loading indicator
        const loading = chatWindow.querySelector('.message.bot:last-child');
        if (loading && loading.textContent === '...') {
            chatWindow.removeChild(loading);
        }
        // The reply is likely in data.response or similar; adjust as needed
        if (data && data.response) {
            appendMessage(data.response, 'bot');
        } else if (data && data.message) {
            appendMessage(data.message, 'bot');
        } else {
            appendMessage('Sorry, I did not understand that.', 'bot');
        }
    } catch (error) {
        // Remove loading indicator
        const loading = chatWindow.querySelector('.message.bot:last-child');
        if (loading && loading.textContent === '...') {
            chatWindow.removeChild(loading);
        }
        appendMessage('Error connecting to Lyzr API.', 'bot');
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Theme toggle logic
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const htmlTag = document.documentElement;

function setTheme(theme) {
    htmlTag.setAttribute('data-theme', theme);
    if (theme === 'dark') {
        themeIcon.innerHTML = '<path d="M21.64 13.64A9 9 0 1 1 12 3a7 7 0 0 0 9.64 10.64z"></path>';
    } else {
        themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>';
    }
    localStorage.setItem('chat-theme', theme);
}

// Load theme from localStorage
const savedTheme = localStorage.getItem('chat-theme') || 'light';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlTag.getAttribute('data-theme');
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
});
