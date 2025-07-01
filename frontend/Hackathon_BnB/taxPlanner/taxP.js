import { supabase } from '../supabaseClient.js';

let email = '';
let token = '';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('gpt-content');

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    window.location.href = '../login/login.html';
    return;
  }

  try {
    //Get session (auto-refreshes the token if expired)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (sessionError || userError || !sessionData.session || !userData.user) {
      throw new Error('User not logged in or session error');
    }

    email = userData.user.email;
    token = sessionData.session.access_token;

    const response = await fetch('http://localhost:3000/api/tax/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) throw new Error('Failed to fetch tax summary');
    const result = await response.json();

    container.innerHTML = DOMPurify.sanitize(marked.parse(result.summary));
  } catch (error) {
    container.innerHTML = `<div class="error">Error loading tax plan: ${error.message}</div>`;
    console.error('❌', error);
  }

   // Cross button functionality
    document.getElementById('close-chat').addEventListener('click', () => {
    document.querySelector('.chat-section').classList.add('hidden');
    document.querySelector('.tax-section').style.flex = '1 0 100%';
  });

});

// Chatbox logic
document.getElementById('chatbox-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const input = document.getElementById('chatbox-input');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('user', message);
  input.value = '';

  // Send message to backend (replace '/api/chat' with respective endpoint)
  try {
    const response = await fetch('http://localhost:3000/api/tax/gpt', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,  // 🔐 Add this!
    },
    body: JSON.stringify({ email, question: message }) //match backend keys
    });
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    appendMessage('bot', data.answer || "Sorry, I didn't understand that.");
  } catch (err) {
    appendMessage('bot', "Error: Unable to get response from server.");
  }
});

function appendMessage(sender, text) {
  const messages = document.getElementById('chatbox-messages');
  const msg = document.createElement('div');
  msg.className = sender === 'user' ? 'user-message' : 'bot-message';

  if (sender === 'bot') {
    msg.innerHTML = DOMPurify.sanitize(marked.parse(text));
    msg.style.color = '#ff8c00';
  } else {
    msg.textContent = text;
  }

  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}
