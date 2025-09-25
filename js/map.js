
// Модуль карты
const mapModule = {
    map: null,
    userMarker: null,
    friendMarkers: [],
    
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
                    mapModule.map.setView(userCoords, 13);
                },
                function(error) {
                    console.log("Геолокация не разрешена");
                }
            );
        }
        
        // Оптимизация для мобильных устройств
        this.map.touchZoom.enable();
        this.map.doubleClickZoom.disable();
    },
    
    // Установка местоположения пользователя
    setUserLocation: function(lat, lng) {
        // Сохраняем координаты для использования в модальном окне
        app.tempLocation = { lat: lat, lng: lng };
        
        document.getElementById('current-location').textContent = 
            `Широта: ${lat.toFixed(4)}, Долгота: ${lng.toFixed(4)}`;
        document.getElementById('location-info').textContent = 'Местоположение выбрано. Сохраните метку.';
        document.getElementById('clear-location-btn').style.display = 'block';
        
        // Показываем временную метку
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }
        
        this.userMarker = L.marker([lat, lng])
            .addTo(this.map)
            .bindPopup("<b>Ваше местоположение</b><br><small>Нажмите 'Моя метка' для сохранения</small>")
            .openPopup();
        
        // Временный круг
        L.circle([lat, lng], {
            color: '#ff2e63',
            fillColor: '#ff2e63',
            fillOpacity: 0.2,
            radius: 500
        }).addTo(this.map);
    },
    
    // Сохранение метки пользователя
    saveUserLocation: function(location) {
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }
        
        this.userMarker = L.marker([location.lat, location.lng])
            .addTo(this.map)
            .bindPopup("<b>Ваше местоположение</b>")
            .openPopup();
        
        L.circle([location.lat, location.lng], {
            color: '#ff2e63',
            fillColor: '#ff2e63',
            fillOpacity: 0.2,
            radius: 500
        }).addTo(this.map);
    },
    
    // Очистка метки пользователя
    clearUserLocation: function() {
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
            this.userMarker = null;
        }
        
        document.getElementById('current-location').textContent = 'Не выбрано';
        document.getElementById('location-info').textContent = 'Кликните на карте, чтобы установить ваше местоположение';
        document.getElementById('clear-location-btn').style.display = 'none';
    },
    
    // Отображение меток друзей
    showFriendsLocations: function(friendsLocations) {
        // Очищаем предыдущие метки друзей
        this.clearFriendMarkers();
        
        friendsLocations.forEach(item => {
            if (item.location) {
                const friendMarker = L.marker([item.location.lat, item.location.lng])
                    .addTo(this.map)
                    .bindPopup(`
                        <b>${item.friend.name}</b><br>
                        <small>${this.getStatusText(item.friend.status)}</small>
                    `);
                
                // Добавляем цветной круг вокруг метки друга
                L.circle([item.location.lat, item.location.lng], {
                    color: '#2eff63',
                    fillColor: '#2eff63',
                    fillOpacity: 0.2,
                    radius: 300
                }).addTo(this.map);
                
                this.friendMarkers.push(friendMarker);
            }
        });
    },
    
    // Очистка меток друзей
    clearFriendMarkers: function() {
        this.friendMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.friendMarkers = [];
    },
    
    // Получение текста статуса
    getStatusText: function(status) {
        switch(status) {
            case "online": return "В сети";
            case "away": return "Отошел";
            case "offline": return "Не в сети";
            default: return status;
        }
    },
    
    // Показать местоположение конкретного друга
    showFriendLocation: function(friend, location) {
        if (location) {
            this.map.setView([location.lat, location.lng], 15);
            L.marker([location.lat, location.lng])
                .addTo(this.map)
                .bindPopup(`<b>${friend.name}</b><br>${this.getStatusText(friend.status)}`)
                .openPopup();
        } else {
            alert(`У друга ${friend.name} не установлено местоположение`);
        }
    }
};
