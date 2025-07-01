import { supabase } from './supabaseClient.js';

// Sync minimal user to backend
async function initUserInBackend(user, token) {
  try {
    const res = await fetch('http://localhost:3000/api/user/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: user.email,
        name: user.user_metadata?.full_name || 'Anonymous',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Init user failed:', data);
    } else {
      console.log('User initialized in backend:', data);
    }
  } catch (err) {
    console.error('Failed to initialize user in backend:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');

  //Toggle Login/Register
  showRegister?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  });

  showLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  //Login Handler
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const messageEl = document.getElementById('login-message');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      messageEl.textContent = `Login failed: ${error.message}`;
      messageEl.style.color = 'red';
    } else {
      const user = data.user;
      const token = data.session.access_token;

      await initUserInBackend(user, token);

      localStorage.setItem('sb-access-token', token);
      messageEl.textContent = 'Login successful!';
      messageEl.style.color = 'green';
      window.location.href = './index.html';
    }
  });

  //Register Handler with Auto-Login + Init Backend
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name')?.value;
    const email = document.getElementById('reg-email')?.value;
    const password = document.getElementById('reg-password')?.value;
    const messageEl = document.getElementById('register-message');

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (signupError) {
      messageEl.textContent = `Signup failed: ${signupError.message}`;
      messageEl.style.color = 'red';
      return;
    }

    //Inform user about email confirmation
    if (!signupData.session) {
      messageEl.textContent = 'Signup successful! Please check your email to confirm before logging in.';
      messageEl.style.color = 'blue';
      return;
    }

    //Auto-login after signup (if no email confirmation required)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      messageEl.textContent = `Signup success, but login failed: ${signInError.message}`;
      messageEl.style.color = 'orange';
      return;
    }

    const user = signInData.user;
    const token = signInData.session.access_token;
    await initUserInBackend(user, token);

    localStorage.setItem('sb-access-token', token);
    messageEl.textContent = 'Signup and login successful! Redirecting...';
    messageEl.style.color = 'green';

    setTimeout(() => {
      window.location.href = './index.html';
    }, 1000);
  });
});

export async function signOut() {
  await supabase.auth.signOut();
}