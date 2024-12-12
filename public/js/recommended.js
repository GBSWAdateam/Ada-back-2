async function loadPlacesAndMap() {
    try {
        const region = document.getElementById('regionSelect').value;
        const contentType = document.getElementById('contentTypeSelect').value;

        const params = new URLSearchParams();
        if (region) params.append('region', region);
        if (contentType) params.append('contentType', contentType);

        const response = await fetch(`/api/places/recommended?${params}`);
        const places = await response.json();
        
        if (Array.isArray(places)) {
            displayMap(places);
            displayPlaces(places);
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
}

function displayMap(places) {
    const mapContainer = document.getElementById('map');
    const mapOption = {
        center: new kakao.maps.LatLng(36.2683, 127.6358),
        level: 13
    };
    
    const map = new kakao.maps.Map(mapContainer, mapOption);
    const bounds = new kakao.maps.LatLngBounds();

    places.forEach(place => {
        if (place.mapy && place.mapx) {
            const position = new kakao.maps.LatLng(place.mapy, place.mapx);
            bounds.extend(position);
            
            const marker = new kakao.maps.Marker({
                position: position,
                map: map
            });

            const infowindow = new kakao.maps.InfoWindow({
                content: `
                    <div style="padding:5px;max-width:300px;">
                        <h3>${place.title}</h3>
                        <p>${place.addr1}</p>
                        ${place.firstimage ? 
                            `<img src="${place.firstimage}" alt="${place.title}" style="width:200px;"><br>` : ''}
                        <p>${place.tel || ''}</p>
                        <p>분류: ${place.contentType}</p>
                    </div>
                `
            });

            kakao.maps.event.addListener(marker, 'click', () => {
                infowindow.open(map, marker);
            });
        }
    });

    if (!bounds.isEmpty()) {
        map.setBounds(bounds);
    }
}

function displayPlaces(places) {
    const placeList = document.getElementById('placeList');
    placeList.innerHTML = places.map(place => `
        <div class="place-item">
            <h3>${place.title}</h3>
            <p>${place.addr1}</p>
            ${place.firstimage ? 
                `<img src="${place.firstimage}" alt="${place.title}">` : ''}
            <p>${place.tel || ''}</p>
            <p>분류: ${place.contentType}</p>
        </div>
    `).join('');
}

function refreshPlaces() {
    loadPlacesAndMap();
}

// 초기 로드
window.onload = loadPlacesAndMap;