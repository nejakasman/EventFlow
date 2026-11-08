document.addEventListener('DOMContentLoaded', () => {
    const registrationLink = document.querySelector('#kc-registration a');

    if (registrationLink) {
        registrationLink.href = 'http://localhost:5173/?registration=1';
    }
});