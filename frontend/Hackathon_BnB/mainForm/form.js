import { supabase } from '../supabaseClient.js';

// Getting the currently logged-in user
document.addEventListener('DOMContentLoaded', async () => {
  const { data,error } = await supabase.auth.getUser();
  const user = data?.user;
  
  console.log("Supabase user:", data, "Error:", error);

  if (error || !user) {
    alert('Please log in first.');
    window.location.href = '../login/login.html';
    return;
  }

  const email = user.email;
  const name = user.user_metadata?.full_name || '';

  const { data: existingProfile, error: profileError } = await supabase
    .from('UserProfile')
    .select('*', { head: false })
    .eq('userId', user.id)
    .maybeSingle();

  console.log("Looking for profile with userId:", user.id);
  console.log("Profile fetch result:", existingProfile, "Error:", profileError);

  if (existingProfile && !profileError) {
    console.log('User profile already exists, redirecting...');
    window.location.href = 'http://127.0.0.1:5500/frontend/Hackathon_BnB/index.html';
    return;
  }

  // Sending data to `/user/init` only once per session
  try {
    console.log("Calling /user/init with:", { email, name });
    await fetch('http://localhost:3000/api/user/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
  } catch (err) {
    console.error('Error initializing user:', err);
  }

const emailInput = document.getElementById('email');
const nameInput = document.getElementById('name');

emailInput.value = email;
nameInput.value = name;

// Preventing user from editing these
emailInput.readOnly = true;
nameInput.readOnly = true;
emailInput.style.backgroundColor = '#f3f4f6'; // optional: light gray
nameInput.style.backgroundColor = '#f3f4f6';

  // Form submission logic (sending to `/user/profile`)
  const form = document.getElementById('userDetailsForm');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = {
      email,
      name,
      age: document.getElementById('age').value,
      role: document.getElementById('role').value,
      income: document.getElementById('income').value,
      hasHealthInsurance: document.getElementById('hasHealthInsurance').value,
      hasEducationLoan: document.getElementById('hasEducationLoan').value,
      hasPPF: document.getElementById('hasPPF').value,
      hasNPS: document.getElementById('hasNPS').value,
      hasLifeInsurance: document.getElementById('hasLifeInsurance').value,
      hasFD: document.getElementById('hasFD').value,
    };

    try {
      const response = await fetch('http://localhost:3000/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile save failed:', errorData.message);
        alert('Error: ' + errorData.message);
        return;
      }

      successMessage.style.display = 'block';
      form.querySelectorAll('input:not([readonly]), select').forEach(el => el.value = '');
      document.querySelector('.form-container').style.opacity = '0.5';
      setTimeout(() => {
        successMessage.scrollIntoView({ behavior: 'smooth' });
      }, 300);

      setTimeout(() => {
      window.location.href = "http://127.0.0.1:5500/frontend/Hackathon_BnB/index.html";
      }, 2000);

    } catch (err) {
      console.error('Error submitting profile:', err);
    }
  });

  function validateForm() {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select');

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
        input.style.borderColor = '#e53e3e';
        setTimeout(() => {
          input.style.borderColor = '#cbd5e0';
        }, 2000);
      }
    });

    const emailInput = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      isValid = false;
      emailInput.style.borderColor = '#e53e3e';
      setTimeout(() => {
        emailInput.style.borderColor = '#cbd5e0';
      }, 2000);
    }

    return isValid;
  }

});