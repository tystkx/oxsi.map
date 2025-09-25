// Модуль карты
const mapModule = {
    map: null,
    userMarker: null,
    userLocation: null,
    
    // Инициализация карты
    initMap: function() {
        const initialCoords = [55.7558, 37.6173]; // Москва по умолчанию
        
        this.map = L.map('map').setView(initialCoords, 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        // Обработчик клика по карте
        this.map.on('click', function(e) {
            mapModule.setUserLocation(e.latlng.lat, e.latlng.lng);
        });
        
        // Пытаемся получить геолокацию
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const userCoords = [
                        position.coords.latitude,
                        position.coords.longitude
                    ];
                    mapModule.setUserLocation(userCoords[0], userCoords[1]);
                    mapModule.map.setView(userCoords, 13);
                },
                function(error) {
                    console.log("Геолокация не разрешена");
                }
            );
        }
    },
    
    // Установка местоположения пользователя
    setUserLocation: function(lat, lng) {
        this.userLocation = { lat, lng };
        
        document.getElementById('current-location').textContent = 
            `Широта: ${lat.toFixed(4)}, Долгота: ${lng.toFixed(4)}`;
        
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }
        
        this.userMarker = L.marker([lat, lng])
            .addTo(this.map)
            .bindPopup("<b>Ваше местоположение</b>")
            .openPopup();
        
        L.circle([lat, lng], {
            color: '#ff2e63',
            fillColor: '#ff2e63',
            fillOpacity: 0.2,
            radius: 500
        }).addTo(this.map);
    },
    
    // Показать местоположение друга
    showFriendLocation: function(friend) {
        if (friend.location) {
            this.map.setView([friend.location.lat, friend.location.lng], 13);
            L.marker([friend.location.lat, friend.location.lng])
                .addTo(this.map)
                .bindPopup(`<b>${friend.name}</b><br>${this.getStatusText(friend.status)}`)
                .openPopup();
        }
    },
    
    // Получение текста статуса
    getStatusText: function(status) {
        switch(status) {
            case "online": return "В сети";
            case "away": return "Отошел";
            case "offline": return "Не в сети";
            default: return status;
        }
    }
};