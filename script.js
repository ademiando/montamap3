// app.js

document.addEventListener("DOMContentLoaded", () => {
    // Load mountain data (Mock JSON for demo purpose)
    const mountainData = [
        { id: 1, name: "Mount Rinjani", elevation: 3726, region: "West Nusa Tenggara", weather: "Sunny", image: "images/mountain1.jpg" },
        { id: 2, name: "Mount Semeru", elevation: 3676, region: "East Java", weather: "Cloudy", image: "images/mountain2.jpg" },
        { id: 3, name: "Mount Kerinci", elevation: 3805, region: "Jambi", weather: "Rainy", image: "images/mountain3.jpg" },
        { id: 4, name: "Mount Bromo", elevation: 2329, region: "East Java", weather: "Windy", image: "images/mountain4.jpg" },
        { id: 5, name: "Mount Merapi", elevation: 2910, region: "Central Java", weather: "Sunny", image: "images/mountain5.jpg" },
        { id: 6, name: "Mount Agung", elevation: 3142, region: "Bali", weather: "Cloudy", image: "images/mountain6.jpg" },
        { id: 7, name: "Mount Lawu", elevation: 3265, region: "Central Java", weather: "Rainy", image: "images/mountain7.jpg" },
        { id: 8, name: "Mount Slamet", elevation: 3428, region: "Central Java", weather: "Windy", image: "images/mountain8.jpg" },
        { id: 9, name: "Mount Tambora", elevation: 2850, region: "West Nusa Tenggara", weather: "Sunny", image: "images/mountain9.jpg" },
        { id: 10, name: "Mount Papandayan", elevation: 2665, region: "West Java", weather: "Cloudy", image: "images/mountain10.jpg" }
    ];

    // Helper function to get query parameter
    const getQueryParam = (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    };

    // Display Top 10 Mountains on homepage
    const displayTopMountains = () => {
        const topMountainsContainer = document.querySelector(".favorite-mountains .row");
        if (topMountainsContainer) {
            mountainData.slice(0, 10).forEach(mountain => {
                const mountainCard = `
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <img src="${mountain.image}" class="card-img-top" alt="${mountain.name}">
                            <div class="card-body">
                                <h5 class="card-title">${mountain.name}</h5>
                                <p class="card-text">Elevation: ${mountain.elevation}m<br>Region: ${mountain.region}</p>
                                <a href="detail.html?id=${mountain.id}" class="btn btn-primary">View Details</a>
                            </div>
                        </div>
                    </div>
                `;
                topMountainsContainer.innerHTML += mountainCard;
            });
        }
    };

    // Display Full Table in mountains.html
    const displayMountainTable = () => {
        const tableBody = document.querySelector("table tbody");
        if (tableBody) {
            mountainData.forEach(mountain => {
                const row = `
                    <tr>
                        <td><img src="${mountain.image}" alt="${mountain.name}" width="50"></td>
                        <td>${mountain.name}</td>
                        <td>${mountain.elevation} mdpl</td>
                        <td>${mountain.region}</td>
                        <td>${mountain.weather}</td>
                        <td><button class="btn btn-primary">Buy Ticket</button></td>
                        <td><button class="btn btn-secondary">Book Guide</button></td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
    };

    // Display Mountain Detail Page
    const displayMountainDetail = () => {
        const mountainId = getQueryParam("id");
        const mountain = mountainData.find(m => m.id === parseInt(mountainId));
        if (mountain) {
            document.querySelector(".banner").style.backgroundImage = `url(${mountain.image})`;
            document.querySelector(".banner h1").innerText = mountain.name;
            document.querySelector(".banner p").innerText = `Elevation: ${mountain.elevation}m | Region: ${mountain.region}`;
            document.querySelector("#overview").innerHTML = `
                <h3>Overview</h3>
                <p>${mountain.name} is one of the most popular mountains in the region of ${mountain.region}. It has an elevation of ${mountain.elevation} meters and is known for its ${mountain.weather} weather conditions.</p>
            `;
        } else {
            document.querySelector(".banner").innerHTML = "<h1>Mountain Not Found</h1>";
        }
    };

    // Initialize Page
    if (document.querySelector(".hero-section")) {
        // Homepage
        displayTopMountains();
    } else if (document.querySelector("table")) {
        // Mountains List Page
        displayMountainTable();
    } else if (document.querySelector(".banner")) {
        // Mountain Detail Page
        displayMountainDetail();
    }
});
