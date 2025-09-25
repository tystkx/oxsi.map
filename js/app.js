
// Основной модуль приложения
const app = {
    currentUser: null,
    friends: [],
    isSidebarOpen: false,
    isFriendsOpen: false,
    tempLocation: null,
    
    // Инициализация приложения после входа
    initApp: function() {
        document.getElementById('auth-page').style.display = 'none';
        document.getElementById('app-page').style.display = 'block';
        
        // Обновляем информацию о пользователе
        document.getElementById('user-name').textContent = this.currentUser.name;
        document.getElementById('user-avatar').textContent = this.currentUser.name.charAt(0);
        this.updateUserStatus(this.currentUser.status);
        
        // Инициализируем карту
        mapModule.initMap();
        
        // Загружаем данные пользователя
        this.loadUserData();
    },
    
    // Загрузка данных пользователя
    loadUserData: function() {
        try {
            // Загружаем друзей
            this.friends = database.getFriends(this.currentUser.id);
            this.renderFriends();
            
            // Загружаем метку пользователя
            const userLocation = database.getLocation(this.currentUser.id);
            if (userLocation) {
                this.displayUserLocation(userLocation);
            }
            
            // Загружаем и отображаем метки друзей
            const friendsLocations = database.getFriendsLocations(this.currentUser.id);
            mapModule.showFriendsLocations(friendsLocations);
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    },
    
    // Отображение метки пользователя
    displayUserLocation: function(location) {
        document.getElementById('current-location').textContent = 
            `Широта: ${location.lat.toFixed(4)}, Долгота: ${location.lng.toFixed(4)}`;
        document.getElementById('location-info').textContent = 'Местоположение сохранено';
        document.getElementById('clear-location-btn').style.display = 'block';
        
        mapModule.saveUserLocation(location);
    },
    
    // Обновление статуса пользователя
    updateUserStatus: function(status) {
        const indicator = document.getElementById('user-status-indicator');
        const text = document.getElementById('user-status-text');
        
        indicator.className = 'status-indicator ' + status;
        text.textContent = mapModule.getStatusText(status);
        
        // Обновляем статус в текущем пользователе
        if (this.currentUser) {
            this.currentUser.status = status;
            // Здесь можно сохранить в базу, если нужно
        }
    },
    
    // Отображение списка друзей
    renderFriends: function() {
        const friendsList = document.getElementById('friends-list');
        friendsList.innerHTML = '';
        
        if (this.friends.length === 0) {
            friendsList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">У вас пока нет друзей</p>';
            return;
        }
        
        this.friends.forEach(friend => {
            const friendItem = document.createElement('div');
            friendItem.className = 'friend-item';
            
            const friendLocation = database.getLocation(friend.id);
            const hasLocation = friendLocation && friendLocation.visibility === 'all';
            
            friendItem.innerHTML = `
                <div class="friend-avatar">${friend.name.charAt(0)}</div>
                <div class="friend-info">
                    <h4>${friend.name}</h4>
                    <p>${mapModule.getStatusText(friend.status)} ${hasLocation ? '📍' : ''}</p>
                </div>
            `;
            
            friendItem.addEventListener('click', () => {
                const location = database.getLocation(friend.id);
                mapModule.showFriendLocation(friend, location);
                this.closeFriends();
            });
            
            friendsList.appendChild(friendItem);
        });
    },
    
    // Переключение боковой панели
    toggleSidebar: function() {
        const sidebar = document.querySelector('.app-sidebar');
        this.isSidebarOpen = !this.isSidebarOpen;
        sidebar.classList.toggle('active', this.isSidebarOpen);
        
        if (this.isFriendsOpen) {
            this.closeFriends();
        }
    },
    
    // Закрытие боковой панели
    closeSidebar: function() {
        const sidebar = document.querySelector('.app-sidebar');
        sidebar.classList.remove('active');
        this.isSidebarOpen = false;
    },
    
    // Переключение панели друзей
    toggleFriends: function() {
        const friendsPanel = document.querySelector('.friends-panel');
        this.isFriendsOpen = !this.isFriendsOpen;
        friendsPanel.classList.toggle('active', this.isFriendsOpen);
        
        if (this.isSidebarOpen) {
            this.closeSidebar();
        }
    },
    
    // Закрытие панели друзей
    closeFriends: function() {
        const friendsPanel = document.querySelector('.friends-panel');
        friendsPanel.classList.remove('active');
        this.isFriendsOpen = false;
    },
    
    // Показать модальное окно добавления друга
    showAddFriendModal: function() {
        document.getElementById('add-friend-modal').style.display = 'flex';
        this.closeSidebar();
    },
    
    // Показать модальное окно метки
    showLocationModal: function() {
        const modal = document.getElementById('location-modal');
        const locationInfo = document.getElementById('modal-location-info');
        
        if (this.tempLocation) {
            locationInfo.textContent = `Широта: ${this.tempLocation.lat.toFixed(4)}, Долгота: ${this.tempLocation.lng.toFixed(4)}`;
        } else {
            const currentText = document.getElementById('current-location').textContent;
            locationInfo.textContent = currentText !== 'Не выбрано' ? currentText : 'Не установлено';
        }
        
        modal.style.display = 'flex';
        this.closeSidebar();
    },
    
    // Показать модальное окно настроек
    showSettingsModal: function() {
        document.getElementById('settings-modal').style.display = 'flex';
        document.getElementById('status-select').value = this.currentUser.status || 'online';
        this.closeSidebar();
    },
    
    // Показать информацию о базе данных
    showDatabaseInfo: function() {
        this.showDatabaseTab('users');
        document.getElementById('database-modal').style.display = 'flex';
        this.closeSidebar();
        this.loadDatabaseData();
    },
    
    // Показать вкладку базы данных
    showDatabaseTab: function(tabName) {
        // Скрыть все вкладки
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Показать выбранную вкладку
        document.getElementById(tabName + '-tab').classList.add('active');
        document.querySelector(`.tab-btn[onclick="app.showDatabaseTab('${tabName}')"]`).classList.add('active');
    },
    
    // Загрузить данные базы данных
    loadDatabaseData: function() {
        try {
            const data = database.getAllData();
            
            // Пользователи
            let usersHtml = '<table><tr><th>ID</th><th>Имя</th><th>Email</th><th>Статус</th><th>Создан</th></tr>';
            data.users.forEach(user => {
                usersHtml += `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.email}</td><td>${user.status}</td><td>${new Date(user.created_at).toLocaleString()}</td></tr>`;
            });
            usersHtml += '</table>';
            document.getElementById('users-table').innerHTML = usersHtml;
            
            // Друзья
            let friendsHtml = '<table><tr><th>ID</th><th>User ID</th><th>Friend ID</th><th>Создан</th></tr>';
            data.friends.forEach(friend => {
                friendsHtml += `<tr><td>${friend.id}</td><td>${friend.user_id}</td><td>${friend.friend_id}</td><td>${new Date(friend.created_at).toLocaleString()}</td></tr>`;
            });
            friendsHtml += '</table>';
            document.getElementById('friends-table').innerHTML = friendsHtml;
            
            // Метки
            let locationsHtml = '<table><tr><th>ID</th><th>User ID</th><th>Широта</th><th>Долгота</th><th>Видимость</th><th>Обновлено</th></tr>';
            data.locations.forEach(location => {
                locationsHtml += `<tr><td>${location.id}</td><td>${location.user_id}</td><td>${location.lat}</td><td>${location.lng}</td><td>${location.visibility}</td><td>${new Date(location.updated_at).toLocaleString()}</td></tr>`;
            });
            locationsHtml += '</table>';
            document.getElementById('locations-table').innerHTML = locationsHtml;
            
        } catch (error) {
            console.error('Ошибка загрузки данных БД:', error);
        }
    },
    
    // Закрыть модальное окно
    closeModal: function(modalId) {
        document.getElementById(modalId).style.display = 'none';
    },
    
    // Добавление друга
    addFriend: function() {
        const email = document.getElementById('friend-email').value.trim();
        
        if (!email) {
            alert('Пожалуйста, введите email друга');
            return;
        }
        
        if (email === this.currentUser.email) {
            alert('Нельзя добавить самого себя в друзья');
            return;
        }
        
        try {
            const friend = database.getUserByEmail(email);
            if (!friend) {
                alert('Пользователь с таким email не найден');
                return;
            }
            
            database.addFriend(this.currentUser.id, friend.id);
            
            // Обновляем список друзей
            this.friends = database.getFriends(this.currentUser.id);
            this.renderFriends();
            
            // Обновляем метки друзей на карте
            const friendsLocations = database.getFriendsLocations(this.currentUser.id);
            mapModule.showFriendsLocations(friendsLocations);
            
            document.getElementById('friend-email').value = '';
            this.closeModal('add-friend-modal');
            
            alert(`Друг ${friend.name} добавлен!`);
        } catch (error) {
            console.error('Ошибка добавления друга:', error);
            alert(error.message || 'Ошибка добавления друга');
        }
    },
    
    // Сохранение метки
    saveLocation: function() {
        if (!this.tempLocation && document.getElementById('current-location').textContent === 'Не выбрано') {
            alert('Сначала выберите местоположение на карте');
            return;
        }
        
        const location = this.tempLocation || database.getLocation(this.currentUser.id);
        if (!location) {
            alert('Сначала выберите местоположение на карте');
            return;
        }
        
        const visibility = document.getElementById('location-visibility').value;
        
        try {
            database.saveLocation(this.currentUser.id, {
                lat: location.lat,
                lng: location.lng,
                visibility: visibility
            });
            
            this.displayUserLocation({ lat: location.lat, lng: location.lng, visibility: visibility });
            this.tempLocation = null;
            this.closeModal('location-modal');
            
            alert('Метка успешно сохранена!');
        } catch (error) {
            console.error('Ошибка сохранения метки:', error);
            alert('Ошибка сохранения метки');
        }
    },
    
    // Очистка метки
    clearLocation: function() {
        try {
            database.deleteLocation(this.currentUser.id);
            mapModule.clearUserLocation();
            this.closeModal('location-modal');
            alert('Метка удалена!');
        } catch (error) {
            console.error('Ошибка удаления метки:', error);
            alert('Ошибка удаления метки');
        }
    },
    
    // Сохранение настроек
    saveSettings: function() {
        const status = document.getElementById('status-select').value;
        
        this.updateUserStatus(status);
        alert('Настройки сохранены!');
        this.closeModal('settings-modal');
    }
};

// Проверяем, авторизован ли пользователь при загрузке
window.onload = function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        app.currentUser = JSON.parse(savedUser);
        app.initApp();
    }
};
