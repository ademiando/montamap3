document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const loginForm = document.getElementById('login-form');

    loginBtn.addEventListener('click', () => {
        loginForm.classList.toggle('hidden');
    });

    const languageSelector = document.getElementById('language-selector');
    const currencySelector = document.getElementById('currency-selector');

    languageSelector.addEventListener('change', (event) => {
        alert(`Language changed to: ${event.target.value}`);
    });

    currencySelector.addEventListener('change', (event) => {
        alert(`Currency changed to: ${event.target.value}`);
    });
});
