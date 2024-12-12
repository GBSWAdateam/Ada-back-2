document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/places/random');
        const places = await response.json();
        displayPlaces(places);
    } catch (error) {
        console.error('랜덤 장소 로드 중 오류:', error);
    }

    if (typeof kakao !== 'undefined' && kakao.maps) {
        initializeMap();
    } else {
        console.error('카카오맵 스크립트가 로드되지 않았습니다.');
    }
});

function displayPlaces(places) {
    const placeList = document.getElementById('placeList');
    placeList.innerHTML = '';

    places.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.className = 'place-item';
        placeCard.innerHTML = `
            <div class="place-name">${place.title}</div>
            <div class="place-address">${place.addr1}</div>
            ${place.firstimage ? `<img src="${place.firstimage}" alt="${place.title}" style="width:100%;height:150px;object-fit:cover;">` : ''}
        `;
        placeList.appendChild(placeCard);
    });
}

function initializeMap() {
    const container = document.getElementById('map');
    const options = {
        center: new kakao.maps.LatLng(36.2683, 127.6358),
        level: 13
    };
    
    const map = new kakao.maps.Map(container, options);
}