document.addEventListener("DOMContentLoaded", () => {
    // Data Gunung
    const mountains = [
        { name: "Gunung Rinjani", ticketPrice: "Rp 150.000", temperature: "15°C", height: "3,726m", status: "Trending" },
        { name: "Gunung Semeru", ticketPrice: "Rp 120.000", temperature: "10°C", height: "3,676m", status: "Popular" },
        { name: "Gunung Kerinci", ticketPrice: "Rp 180.000", temperature: "12°C", height: "3,805m", status: "Favorite" },
    ];

    // Muat data gunung ke tabel
    const tableBody = document.getElementById("mountain-list");
    mountains.forEach((mountain, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${mountain.name}</td>
            <td>${mountain.ticketPrice}</td>
            <td>${mountain.temperature}</td>
            <td>${mountain.height}</td>
            <td>${mountain.status}</td>
        `;
        tableBody.appendChild(row);
    });

    // Grafik Statistik
    const ctx = document.getElementById("chart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: mountains.map(mountain => mountain.name),
            datasets: [{
                label: "Ketinggian (meter)",
                data: mountains.map(mountain => parseInt(mountain.height.replace(",", "").replace("m", ""))),
                backgroundColor: ["#4caf50", "#2196f3", "#ff9800"],
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
});
