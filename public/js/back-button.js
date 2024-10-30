const backButton = document.querySelector('#back-button');

backButton.addEventListener('click', function(event) {
    event.preventDefault();
    window.history.back();
});