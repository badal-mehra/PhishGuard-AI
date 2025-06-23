document.addEventListener('DOMContentLoaded', function() {
    // Initialize Particles.js
    particlesJS('particles-js', { /* Config from earlier */ });

    // Example URL Buttons
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            document.getElementById('url-input').value = url;
            scanURL(url);
        });
    });

    // Scan Button
    document.getElementById('scan-btn').addEventListener('click', () => {
        const url = document.getElementById('url-input').value.trim();
        if (url) scanURL(url);
        else alert('Please enter a URL');
    });

    // Enter Key Support
    document.getElementById('url-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const url = e.target.value.trim();
            if (url) scanURL(url);
        }
    });

    // API Call Function
    async function scanURL(url) {
        const resultBody = document.getElementById('result-body');
        resultBody.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Analyzing URL...</p>
            </div>
        `;

        try {
            // Render backend URL
            const response = await fetch('https://phishguard-ai-backend.onrender.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();
            displayResults(url, data);
        } catch (error) {
            console.error('Error:', error);
            displayError(url, 'Failed to scan URL');
        }
    }

    // Display Results (Same as before)
    function displayResults(url, data) { /* ... */ }
});
