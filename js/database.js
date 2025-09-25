
// Модуль работы с базой данных SQLite
const database = {
    db: null,
    
    // Инициализация базы данных
    init: function() {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open('FriendMapDB', 1);
            
            request.onerror = function(event) {
                console.error('Ошибка открытия базы данных:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = function(event) {
                database.db = event.target.result;
                console.log('База данных успешно открыта');
                resolve();
            };
            
            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                
                // Создаем хранилище для пользователей
                if (!db.objectStoreNames.contains('users')) {
                    const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    usersStore.createIndex('email', 'email', { unique: true });
                }
                
                // Создаем хранилище для друзей
                if (!db.objectStoreNames.contains('friends')) {
                    const friendsStore = db.createObjectStore('friends', { keyPath: 'id', autoIncrement: true });
                    friendsStore.createIndex('userId', 'userId', { unique: false });
                    friendsStore.createIndex('friendId', 'friendId', { unique: false });
                    friendsStore.createIndex('userId_friendId', ['userId', 'friendId'], { unique: true });
                }
                
                // Создаем хранилище для меток
                if (!db.objectStoreNames.contains('locations')) {
                    const locationsStore = db.createObjectStore('locations', { keyPath: 'id', autoIncrement: true });
                    locationsStore.createIndex('userId', 'userId', { unique: true });
                }
            };
        });
    },
    
    // Добавление пользователя
    addUser: function(user) {
        return new Promise((resolve, reject) => {
            const transaction = database.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.add(user);
            
            request.onsuccess = function() {
                resolve(request.result);
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },
    
    // Получение пользователя по email
    getUserByEmail: function(email) {
        return new Promise((resolve, reject) => {
            const transaction = database.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const index = store.index('email');
            const request = index.get(email);
            
            request.onsuccess = function() {
                resolve(request.result);
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },
    
    // Получение пользователя по ID
    getUserById: function(id) {
        return new Promise((resolve, reject) => {
            const transaction = database.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.get(id);
            
            request.onsuccess = function() {
                resolve(request.result);
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },
    
    // Добавление друга
    addFriend: function(userId, friendId) {
        return new Promise((resolve, reject) => {
            const transaction = database.db.transaction(['friends'], 'readwrite');
            const store = transaction.objectStore('friends');
            
            // Проверяем, не добавлен ли уже этот друг
            const index = store.index('userId_friendId');
            const checkRequest = index.get([userId, friendId]);
            
            checkRequest.onsuccess = function() {
                if (checkRequest.result) {
                    reject(new Error('Этот пользователь уже у вас в друзьях'));
                    return;
                }
                
                const friendRelationship = {
                    userId: userId,
                    friendId: friendId,
                    createdAt: new Date().toISOString()
                };
                
                const addRequest = store.add(friendRelationship);
                
                addRequest.onsuccess = function() {
                    resolve(addRequest.result);
                };
                
                addRequest.onerror = function(event) {
                    reject(event.target.error);
                };
            };
            
            checkRequest.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },
    
    // Получение списка друзей пользователя
    getFriends: function(userId) {
        return new Promise((resolve, reject) => {
            const transaction = database.db.transaction(['friends', 'users'], 'readonly');
            const friendsStore = transaction.objectStore('friends');
            const usersStore = transaction.objectStore('users');
            
            const friends = [];
            const index = friendsStore.index('userId');
            const request = index.openCursor(IDBKeyRange.only(userId));
            
            request.onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    const friendId = cursor.value.friendId;
                    const getUserRequest = usersStore.get(friendId);
                    
                    getUserRequest.onsuccess = function() {
                        const friend = getUserRequest.result;
                        if (friend) {
                            friends.push(friend);
                        }
                        cursor.continue();
                    };
                    
                    getUserRequest.onerror = function(event) {
                        console.error('Ошибка получения данных друга:', event.target.error);
                        cursor.continue();
                    };
                } else {
                    resolve(friends);
                }
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },
    
    // Сохранение метки пользователя
    saveLocation: function(userId, location) {
        return new Promise((resolve, reject) => {
            const transaction = database.db.transaction(['locations'], 'readwrite');
            const store = transaction.objectStore('locations');
            
            // Сначала получаем текущую метку
            const index = store.index('userId');
            const getRequest = index.get(userId);
            
            getRequest.onsuccess = function() {
                const locationData = {
                    userId: userId,
                    lat: location.lat,
                    lng: location.lng,
                    visibility: location.visibility,
                    updatedAt: new Date().toISOString()
                };
                
                let request;
                if (getRequest.result) {
                    // Обновляем существующую метку
                    locationData.id = getRequest.result.id;
                    request = store.put(locationData);
                } else {
                    // Добавляем новую метку
                    request = store.add(locationData);
                }
                
                request.onsuccess = function() {
                    resolve(request.result);
                };
                
                request.onerror = function(event) {
                    reject(event.target.error);
                };
            };
            
            getRequest.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },
    
    // Получение метки пользователя
    getLocation: function(userId) {
        return new Promise((resolve, reject) => {
            const transaction = database.db.transaction(['locations'], 'readonly');
            const store = transaction.objectStore('locations');
            const index = store.index('userId');
            const request = index.get(userId);
            
            request.onsuccess = function() {
                resolve(request.result);
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },
    
    // Удаление метки пользователя
    deleteLocation: function(userId) {
        return new Promise((resolve, reject) => {
            const transaction = database.db.transaction(['locations'], 'readwrite');
            const store = transaction.objectStore('locations');
            const index = store.index('userId');
            const getRequest = index.get(userId);
            
            getRequest.onsuccess = function() {
                if (getRequest.result) {
                    const deleteRequest = store.delete(getRequest.result.id);
                    
                    deleteRequest.onsuccess = function() {
                        resolve(true);
                    };
                    
                    deleteRequest.onerror = function(event) {
                        reject(event.target.error);
                    };
                } else {
                    resolve(false);
                }
            };
            
            getRequest.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },
    
    // Получение меток друзей
    getFriendsLocations: function(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const friends = await database.getFriends(userId);
                const locations = [];
                
                for (const friend of friends) {
                    const location = await database.getLocation(friend.id);
                    if (location && location.visibility === 'all') {
                        locations.push({
                            friend: friend,
                            location: location
                        });
                    }
                }
                
                resolve(locations);
            } catch (error) {
                reject(error);
            }
        });
    }
};
