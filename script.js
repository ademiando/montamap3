// Elements
const menuToggle = document.getElementById('hamburger'); // Perbaikan ID
const dropdownMenu = document.getElementById('menu');
const loginButton = document.getElementById('loginButton');
const loginDropdown = document.getElementById('loginDropdown');
const languageSelect = document.getElementById('language');
const lightBtn = 
document.getElementById('lightBtn');
const darkBtn = 
document.getElementById('darkBtn');
const title = document.getElementById('title');
const description = document.getElementById('description');



// Toggle Dropdown Menu
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', () => {
    dropdownMenu.classList.toggle('menu-visible'); // Menggunakan class CSS
  });

  // Close Hamburger Menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!menuToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove('menu-visible'); // Menggunakan class CSS
    }
  });
}

// Toggle Login Dropdown
if (loginButton && loginDropdown) {
  loginButton.addEventListener('click', () => {
    loginDropdown.style.display = loginDropdown.style.display === 'block' ? 'none' : 'block';
  });

  // Close Login Dropdown when clicking outside
  document.addEventListener('click', (event) => {
    if (!loginButton.contains(event.target) && !loginDropdown.contains(event.target)) {
      loginDropdown.style.display = 'none';
    }
  });
}

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
if (languageSelect && title && description) {
  languageSelect.addEventListener('change', () => {
    const selectedLanguage = languageSelect.value;
    title.textContent = translations[selectedLanguage]?.title || "Default Title";
    description.textContent = translations[selectedLanguage]?.description || "Default Description";
  });
}

// Function to Switch to Light Theme
if (lightBtn) {
  lightBtn.addEventListener('click', () => {
    document.body.classList.remove('dark'); // Hapus tema gelap
    lightBtn.classList.add('active'); // Tandai tombol Light sebagai aktif
    darkBtn.classList.remove('active'); // Nonaktifkan tombol Dark
  });
}

// Function to Switch to Dark Theme
if (darkBtn) {
  darkBtn.addEventListener('click', () => {
    document.body.classList.add('dark'); // Tambahkan tema gelap
    darkBtn.classList.add('active'); // Tandai tombol Dark sebagai aktif
    lightBtn.classList.remove('active'); // Nonaktifkan tombol Light
  });
}

// Tab Navigation
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
  if (selectedTabContent) {
    selectedTabContent.style.display = 'block';
    selectedTabContent.classList.add('active');
  }

  // Tandai tab yang aktif
  if (event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
}

// Default Tab Activation
document.addEventListener('DOMContentLoaded', () => {
  const defaultTab = document.querySelector('.tab.active');
  if (defaultTab) {
    defaultTab.click();
  }
});






const mountainData = [
  {
    name: "Everest",
    region: "Nepal / Tibet",
    status: "Closed",
    elevation: "8,848 m",
    weather: "-35°C Windy",
    image: "mountain-image/everest.jpg",
    link: "everest"
  },
  {
    name: "K2",
    region: "Pakistan / China",
    status: "Closed",
    elevation: "8,611 m",
    weather: "-40°C Snow",
    image: "mountain-image/k2.jpg",
    link: "k2"
  },
  {
    name: "Kangchenjunga",
    region: "Nepal / India",
    status: "Closed",
    elevation: "8,586 m",
    weather: "-30°C Cloudy",
    image: "mountain-image/kangchenjunga.jpg",
    link: "kangchenjunga"
  },
  {
    name: "Lhotse",
    region: "Nepal / Tibet",
    status: "Open",
    elevation: "8,516 m",
    weather: "-28°C Sunny",
    image: "mountain-image/lhotse.jpg",
    link: "lhotse"
  },
  {
    name: "Makalu",
    region: "Nepal / Tibet",
    status: "Closed",
    elevation: "8,485 m",
    weather: "-31°C Foggy",
    image: "mountain-image/makalu.jpg",
    link: "makalu"
  },
  {
    name: "Cho Oyu",
    region: "Nepal / Tibet",
    status: "Open",
    elevation: "8,188 m",
    weather: "-25°C Clear",
    image: "mountain-image/cho-oyu.jpg",
    link: "cho-oyu"
  },
  {
    name: "Dhaulagiri I",
    region: "Nepal",
    status: "Open",
    elevation: "8,167 m",
    weather: "-23°C Sunny",
    image: "mountain-image/dhaulagiri.jpg",
    link: "dhaulagiri"
  },
  {
    name: "Manaslu",
    region: "Nepal",
    status: "Closed",
    elevation: "8,163 m",
    weather: "-26°C Snow",
    image: "mountain-image/manaslu.jpg",
    link: "manaslu"
  },
  {
    name: "Nanga Parbat",
    region: "Pakistan",
    status: "Open",
    elevation: "8,126 m",
    weather: "-22°C Cloudy",
    image: "mountain-image/nanga-parbat.jpg",
    link: "nanga-parbat"
  },
  {
    name: "Annapurna I",
    region: "Nepal",
    status: "Closed",
    elevation: "8,091 m",
    weather: "-29°C Windy",
    image: "mountain-image/annapurna.jpg",
    link: "annapurna"
  }
];

let loaded = 0;
const batch = 4;

function renderMountains() {
  const container = document.getElementById("mountainContainer");
  const slice = mountainData.slice(loaded, loaded + batch);

  slice.forEach((m) => {
    const card = document.createElement("div");
    card.className = "mountain-card";
    card.onclick = () => window.location.href = `https://montamap.com/${m.link}`;
    card.innerHTML = `
      <img src="${m.image}" alt="${m.name}" class="mountain-image" />
      <div class="gradient-overlay"></div>
      <div class="mountain-info">
        <div class="mountain-name">${m.name}</div>
        <div class="mountain-details">
          ${m.region}<br />
          <span class="${m.status === 'Open' ? 'status-open' : 'status-closed'}">Status: ${m.status}</span><br />
          Elevation: ${m.elevation}<br />
          Weather: ${m.weather}
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  loaded += batch;

  if (loaded >= mountainData.length) {
    document.getElementById("loadMoreBtn").style.display = "none";
  }
}

document.getElementById("loadMoreBtn").addEventListener("click", renderMountains);

// Initial load
renderMountains();
