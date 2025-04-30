document.addEventListener("DOMContentLoaded", () => {
    // Chart.js Initialization
    const ctx = document.getElementById("chart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Mount Everest", "K2", "Kangchenjunga", "Lhotse", "Makalu"],
            datasets: [
                {
                    label: "Height (meters)",
                    data: [8848, 8611, 8586, 8516, 8485],
                    borderColor: "#007bff",
                    backgroundColor: "rgba(0, 123, 255, 0.1)",
                    fill: true
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

    // Get Started Button
    document.getElementById("get-started").addEventListener("click", () => {
        window.location.href = "#overview";
    });
});
