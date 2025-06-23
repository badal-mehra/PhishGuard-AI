document.addEventListener('DOMContentLoaded', function() {
    // Backend URL Configuration
    const BACKEND_URL = "https://phishguard-ai-backend.onrender.com";
    
    // Initialize Particles.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#6c63ff" },
            shape: { type: "circle" },
            opacity: { value: 0.5 },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#6c63ff", opacity: 0.2, width: 1 },
            move: { enable: true, speed: 2 }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" }
            }
        }
    });

    // Example URL Buttons
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            document.getElementById('url-input').value = url;
            scanURL(url);
        });
    });

    // Scan Button Event
    document.getElementById('scan-btn').addEventListener('click', () => {
        const url = document.getElementById('url-input').value.trim();
        if (url) {
            scanURL(url);
        } else {
            alert('Please enter a URL to scan');
        }
    });

    // Enter Key Support
    document.getElementById('url-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const url = e.target.value.trim();
            if (url) scanURL(url);
        }
    });

    // Scan URL Function
    async function scanURL(url) {
        const resultBody = document.getElementById('result-body');
        const statusIndicator = document.getElementById('status-indicator');
        
        // Show loading state
        resultBody.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Analyzing URL with VirusTotal...</p>
            </div>
        `;
        statusIndicator.style.background = 'var(--warning-color)';
        statusIndicator.style.boxShadow = '0 0 10px var(--warning-color)';

        try {
            // First validate URL format
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }

            // Call backend API
            const response = await fetch(`${BACKEND_URL}/scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            displayResults(url, data);
        } catch (error) {
            console.error('Scan Error:', error);
            displayError(url, error.message);
        }
    }

    // Display Results Function
    function displayResults(url, analysisData) {
        const resultBody = document.getElementById('result-body');
        const statusIndicator = document.getElementById('status-indicator');
        
        const stats = analysisData.data.attributes.stats;
        const totalEngines = stats.harmless + stats.malicious + stats.suspicious + stats.undetected;
        const phishingPercentage = Math.round((stats.malicious / totalEngines) * 100);
        const isDangerous = stats.malicious > 0;

        // Set status indicator
        if (isDangerous) {
            statusIndicator.style.background = 'var(--danger-color)';
            statusIndicator.style.boxShadow = '0 0 10px var(--danger-color)';
        } else {
            statusIndicator.style.background = 'var(--success-color)';
            statusIndicator.style.boxShadow = '0 0 10px var(--success-color)';
        }

        // Create result HTML
        resultBody.innerHTML = `
            <div class="result-content">
                <div class="detail-row">
                    <span>URL Scanned:</span>
                    <span>${url}</span>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${totalEngines}</div>
                        <div class="stat-label">Security Engines</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.malicious}</div>
                        <div class="stat-label">Malicious</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${phishingPercentage}%</div>
                        <div class="stat-label">Phishing Risk</div>
                    </div>
                </div>
                
                <div class="verdict ${isDangerous ? 'danger' : 'safe'}">
                    ${isDangerous ? '⚠️ DANGEROUS URL' : '✅ SAFE URL'}
                </div>
                
                <div class="result-details">
                    <h4>Detailed Analysis:</h4>
                    ${isDangerous ? `
                        <p>This URL was flagged by <strong>${stats.malicious}</strong> security engines as malicious.</p>
                        <p>Risk Level: <strong>${phishingPercentage >= 50 ? 'High' : 'Medium'}</strong></p>
                        <p class="danger-text">Warning: Do not enter personal information on this site!</p>
                    ` : `
                        <p>No security engines flagged this URL as malicious.</p>
                        <p class="safe-text">This site appears safe, but always verify before entering sensitive data.</p>
                    `}
                </div>
            </div>
        `;
    }

    // Display Error Function
    function displayError(url, message) {
        const resultBody = document.getElementById('result-body');
        const statusIndicator = document.getElementById('status-indicator');
        
        statusIndicator.style.background = 'var(--warning-color)';
        statusIndicator.style.boxShadow = '0 0 10px var(--warning-color)';
        
        resultBody.innerHTML = `
            <div class="result-content">
                <div class="detail-row">
                    <span>URL Attempted:</span>
                    <span>${url}</span>
                </div>
                
                <div class="verdict" style="background: rgba(255, 165, 2, 0.1); 
                    border: 1px solid var(--warning-color); 
                    color: var(--warning-color)">
                    ⚠️ SCAN FAILED
                </div>
                
                <div class="result-details">
                    <p>Error: ${message}</p>
                    <p>Please try again later or check the URL format.</p>
                </div>
            </div>
        `;
    }
});