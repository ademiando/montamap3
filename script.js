// Elements
const menuToggle = document.getElementById('menuToggle');
const dropdownMenu = document.getElementById('dropdownMenu');
const loginButton = document.getElementById('loginButton');
const loginDropdown = document.getElementById('loginDropdown');
const languageSelect = document.getElementById('language');
const themeSwitch = document.getElementById('themeSwitch');
const title = document.getElementById('title');
const description = document.getElementById('description');

// Toggle Dropdown Menu
menuToggle.addEventListener('click', (event) => {
  dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

// Close Hamburger Menu when clicking outside
document.addEventListener('click', (event) => {
  if (!menuToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
    dropdownMenu.style.display = 'none'; // Menutup menu
  }
});

// Toggle Login Dropdown
loginButton.addEventListener('click', () => {
  loginDropdown.style.display = loginDropdown.style.display === 'block' ? 'none' : 'block';
});

// Close Login Dropdown when clicking outside
document.addEventListener('click', (event) => {
  if (!loginButton.contains(event.target) && !loginDropdown.contains(event.target)) {
    loginDropdown.style.display = 'none';
  }
});

// Language Translations
const translations = {
  en: {
    title: "Welcome to Xcapeak",
    description: "This is your mountain tracker and ticket website."
  },
  id: {
    title: "Selamat Datang di Xcapeak",
    description: "Ini adalah situs pelacak gunung dan tiket Anda."
  },
  zh: {
    title: "欢迎来到 Xcapeak",
    description: "这是您的山地追踪和票务网站。"
  },
  hi: {
    title: "Xcapeak में आपका स्वागत है",
    description: "यह आपका पर्वत ट्रैकर और टिकट वेबसाइट है।"
  },
  ru: {
    title: "Добро пожаловать в Xcapeak",
    description: "Это ваш сайт для отслеживания гор и билетов."
  }
};

// Update Language Content
languageSelect.addEventListener('change', () => {
  const selectedLanguage = languageSelect.value;
  title.textContent = translations[selectedLanguage].title;
  description.textContent = translations[selectedLanguage].description;
});

// Toggle Theme (Light/Dark)
themeSwitch.addEventListener('click', () => {
  const isDarkMode = document.body.classList.toggle('dark');
  themeSwitch.textContent = isDarkMode ? "Theme: Dark Mode" : "Theme: Light Mode";
});

  function openTab(event, tabName) {
  // Sembunyikan semua konten tab
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach((content) => {
    content.style.display = 'none';
    content.classList.remove('active');
  });

  // Nonaktifkan semua tab
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.classList.remove('active');
  });

  // Tampilkan konten tab yang dipilih
  const selectedTabContent = document.getElementById(tabName);
  selectedTabContent.style.display = 'block';
  selectedTabContent.classList.add('active');

  // Tandai tab yang aktif
  event.currentTarget.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  const defaultTab = document.querySelector('.tab');
  if (defaultTab) {
    defaultTab.click();
  }
});
