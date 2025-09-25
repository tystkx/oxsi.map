// Основной модуль приложения
const app = {
    currentUser: null,
    friends: [],
    
    // Инициализация приложения после входа
    initApp: function() {
        document.getElementById('auth-page').style.display = 'none';
        document.getElementById('app-page').style.display = 'block';
        
        // Обновляем информацию о пользователе
        document.getElementById('user-name').textContent = this.currentUser.name;
        document.getElementById('user-avatar').textContent = this.currentUser.name.charAt(0);
        
        // Инициализируем карту
        mapModule.initMap();
        
        // Загружаем друзей
        this.loadFriends();
    },
    
    // Загрузка друзей
    loadFriends: function() {
        const savedFriends = localStorage.getItem('friends');
        if (savedFriends) {
            this.friends = JSON.parse(savedFriends);
            this.renderFriends();
        } else {
            // Добавляем демо-друзей при первом запуске
            this.friends = [
                {id: 1, name: "Алексей", email: "alex@example.com", status: "online", location: {lat: 55.75, lng: 37.60}},
                {id: 2, name: "Мария", email: "maria@example.com", status: "offline", location: {lat: 55.76, lng: 37.64}},
                {id: 3, name: "Дмитрий", email: "dmitry@example.com", status: "away", location: {lat: 55.74, lng: 37.58}}
            ];
            localStorage.setItem('friends', JSON.stringify(this.friends));
            this.renderFriends();
        }
    },
    
    // Отображение списка друзей
    renderFriends: function() {
        const friendsList = document.getElementById('friends-list');
        friendsList.innerHTML = '';
        
        if (this.friends.length === 0) {
            friendsList.innerHTML = '<p style="text-align: center; opacity: 0.7;">У вас пока нет друзей</p>';
            return;
        }
        
        this.friends.forEach(friend => {
            const friendItem = document.createElement('div');
            friendItem.className = 'friend-item';
            friendItem.innerHTML = `
                <div class="friend-avatar">${friend.name.charAt(0)}</div>
                <div class="friend-info">
                    <h4>${friend.name}</h4>
                    <p>${mapModule.getStatusText(friend.status)}</p>
                </div>
            `;
            friendItem.addEventListener('click', () => {
                mapModule.showFriendLocation(friend);
            });
            friendsList.appendChild(friendItem);
        });
    },
    
    // Показать модальное окно добавления друга
    showAddFriendModal: function() {
        document.getElementById('add-friend-modal').style.display = 'flex';
    },
    
    // Показать модальное окно настроек
    showSettingsModal: function() {
        document.getElementById('settings-modal').style.display = 'flex';
    },
    
    // Закрыть модальное окно
    closeModal: function(modalId) {
        document.getElementById(modalId).style.display = 'none';
    },
    
    // Добавление друга
    addFriend: function() {
        const name = document.getElementById('friend-name').value;
        const email = document.getElementById('friend-email').value;
        
        if (name && email) {
            const newFriend = {
                id: Date.now(),
                name,
                email,
                status: 'offline',
                location: null
            };
            
            this.friends.push(newFriend);
            localStorage.setItem('friends', JSON.stringify(this.friends));
            this.renderFriends();
            
            document.getElementById('friend-name').value = '';
            document.getElementById('friend-email').value = '';
            this.closeModal('add-friend-modal');
            
            alert(`Друг ${name} добавлен!`);
        } else {
            alert('Пожалуйста, заполните все поля');
        }
    },
    
    // Сохранение настроек
    saveSettings: function() {
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