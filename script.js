/* General Styling */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: #f4f4f4;
    color: #333;
}

header {
    background-color: #333;
    color: white;
    padding: 10px 20px;
}

header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

header .logo h1 {
    margin: 0;
    font-size: 24px;
    text-transform: uppercase;
    letter-spacing: 2px;
}

nav ul {
    list-style: none;
    display: flex;
    gap: 15px;
    margin: 0;
    padding: 0;
}

nav ul li a {
    text-decoration: none;
    color: white;
    font-weight: bold;
}

nav ul li a:hover {
    color: #ff9800;
}

.settings select, .settings button {
    margin-left: 10px;
    padding: 5px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

main {
    padding: 20px;
}

section {
    margin-bottom: 40px;
}

section h2 {
    margin-bottom: 15px;
    color: #444;
    text-transform: uppercase;
}

section p {
    line-height: 1.6;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background-color: white;
}

table th, table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
}

table th {
    background-color: #f4f4f4;
    font-weight: bold;
}

table tr:nth-child(even) {
    background-color: #f9f9f9;
}

canvas {
    max-width: 100%;
    height: 300px;
}

button {
    padding: 10px 15px;
    background-color: #ff9800;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #e68900;
}

footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 10px 0;
    margin-top: 40px;
}
