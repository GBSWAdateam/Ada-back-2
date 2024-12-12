document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/places/recommended');
        const places = await response.json();
        if (Array.isArray(places)) {
            if (typeof kakao !== 'undefined') {
                kakao.maps.load(() => {
                    displayPlacesOnMap(places);
                    displayPlaces(places);
                });
            } else {
                console.error('카카오 맵 스크립트가 로드되지 않았습니다.');
            }
        } else {
            console.error('추천 장소 데이터를 가져오는 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('추천 장소를 가져오는 중 오류:', error);
    }
});

function displayPlacesOnMap(places) {
    const mapContainer = document.getElementById('map');
    const mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 초기 중심 좌표
        level: 3 // 초기 확대 레벨
    };
    const map = new kakao.maps.Map(mapContainer, mapOption);

    places.forEach(place => {
        const markerPosition = new kakao.maps.LatLng(place.latitude, place.longitude);
        const marker = new kakao.maps.Marker({
            position: markerPosition
        });
        marker.setMap(map);
    });
}

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