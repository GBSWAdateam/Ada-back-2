const mongoose = require('mongoose');
const Place = require('../models/Place');

const initialPlaces = [
    { name: '경복궁', address: '서울 종로구 사직로 161', lat: 37.579617, lng: 126.977041 },
    { name: '해운대 해수욕장', address: '부산 해운대구 해운대해변로 264', lat: 35.158888, lng: 129.160248 },
    { name: '불국사', address: '경상북도 경주시 불국로 385', lat: 35.790359, lng: 129.331436 },
    { name: '한라산', address: '제주특별자치도 제주시 오등동', lat: 33.361667, lng: 126.529167 },
    { name: '설악산', address: '강원도 속초시 설악산로', lat: 38.119596, lng: 128.465580 },
    { name: '전주 한옥마을', address: '전북 전주시 완산구 기린대로 99', lat: 35.815361, lng: 127.153932 },
    { name: '남산서울타워', address: '서울 용산구 남산공원길 105', lat: 37.551168, lng: 126.988228 },
    { name: '제주 성산일출봉', address: '제주특별자치도 서귀포시 성산읍 성산리', lat: 33.458031, lng: 126.942520 },
    { name: '광안리 해수욕장', address: '부산 수영구 광안해변로 219', lat: 35.153141, lng: 129.118576 },
    { name: '에버랜드', address: '경기도 용인시 처인구 포곡읍 에버랜드로 199', lat: 37.293491, lng: 127.202306 }
];

async function initializeData(Place) {
    try {
        // places 컬렉션의 데이터 수 확인
        const count = await Place.countDocuments();
        
        if (count === 0) {
            console.log('places 컬렉션이 비어있습니다. 초기 데이터를 추가합니다.');
            await Place.insertMany(initialPlaces);
            console.log('초기 데이터가 성공적으로 추가되었습니다.');
        } else {
            console.log(`places 컬렉션에 ${count}개의 데이터가 이미 존재합니다.`);
        }
    } catch (error) {
        console.error('데이터 초기화 중 오류 발생:', error);
    }
}

module.exports = initializeData; 