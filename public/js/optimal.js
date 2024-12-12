document.getElementById('optimalRouteForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await generateOptimalRoute();
});

async function generateOptimalRoute() {
    const start = document.getElementById('start').value;
    const waypoints = document.getElementById('waypoints').value.split(',').map(w => w.trim());
    const end = document.getElementById('end').value;
    const preferences = document.getElementById('preferences').value;
    const budget = document.getElementById('budget').value;
    const days = document.getElementById('days').value;
    const routeType = document.getElementById('routeType').value;
    const transportMode = document.getElementById('transportMode').value;
    const arrivalTime = document.getElementById('arrivalTime').value;
    const avoidAreas = document.getElementById('avoidAreas').value;
    const scenicRoutes = document.getElementById('scenicRoutes').value;
    const realTimeTraffic = document.getElementById('realTimeTraffic').checked;
    const weatherInfo = document.getElementById('weatherInfo').checked;

    try {
        const response = await fetch('http://localhost:8080/api/openai/optimal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start,
                waypoints,
                end,
                preferences,
                budget,
                days,
                routeType,
                transportMode,
                arrivalTime,
                avoidAreas,
                scenicRoutes,
                realTimeTraffic,
                weatherInfo
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        displayOptimalRoute(data.optimalRoute);
    } catch (error) {
        console.error('Error generating optimal route:', error);
    }
}

function displayOptimalRoute(optimalRoute) {
    const resultContainer = document.getElementById('optimalRouteResult');
    resultContainer.innerHTML = optimalRoute;
}

function adjustBudget(amount) {
    const budgetInput = document.getElementById('budget');
    budgetInput.value = parseInt(budgetInput.value || '0') + amount;
}