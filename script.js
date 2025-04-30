document.addEventListener("DOMContentLoaded", () => {
    // Language Selector
    const languageSelector = document.getElementById("language-selector");
    languageSelector.addEventListener("change", (e) => {
        alert(`Language switched to: ${e.target.value}`);
    });

    // Currency Selector
    const currencySelector = document.getElementById("currency-selector");
    currencySelector.addEventListener("change", (e) => {
        alert(`Currency switched to: ${e.target.value}`);
    });

    // Temperature Selector
    const temperatureSelector = document.getElementById("temperature-selector");
    temperatureSelector.addEventListener("change", (e) => {
        alert(`Temperature unit switched to: ${e.target.value}`);
    });

    // Chart.js Example
    const ctx = document.getElementById("chart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                "Mount Everest", 
                "K2", 
                "Kangchenjunga", 
                "Lhotse", 
                "Makalu",
                "Cho Oyu",
                "Dhaulagiri",
                "Manaslu",
                "Nanga Parbat",
                "Annapurna"
            ],
            datasets: [
                {
                    label: "Height (meters)",
                    data: [8848, 8611, 8586, 8516, 8485, 8188, 8167, 8163, 8126, 8091],
                    backgroundColor: [
                        "#ff9800",
                        "#4caf50",
                        "#2196f3",
                        "#9c27b0",
                        "#f44336",
                        "#00bcd4",
                        "#3f51b5",
                        "#ffc107",
                        "#8bc34a",
                        "#ff5722"
                    ]
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top"
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Login Button Action
    const loginButton = document.getElementById("login-btn");
    loginButton.addEventListener("click", () => {
        alert("Login functionality is coming soon!");
    });
});
