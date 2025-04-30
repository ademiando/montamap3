// Navbar collapse on click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.navbar-collapse').classList.remove('show');
  });
});
