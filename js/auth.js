
// Модуль аутентификации
const auth = {
    // Показать форму регистрации
    showRegisterForm: function() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    },
    
    // Показать форму входа
    showLoginForm: function() {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    },
    
    // Функция входа
    login: function() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        
        if (!email || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        try {
            const user = database.getUserByEmail(email);
            
            if (user && user.password === password) {
                app.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(app.currentUser));
                app.initApp();
            } else {
                alert('Неверный email или пароль');
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            alert('Ошибка входа. Попробуйте еще раз.');
        }
    },
    
    // Функция регистрации
    register: function() {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();
        
        if (!name || !email || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        if (password.length < 4) {
            alert('Пароль должен содержать минимум 4 символа');
            return;
        }
        
        try {
            const userId = database.addUser({ 
                name: name, 
                email: email, 
                password: password,
                status: 'online'
            });
            
            const newUser = database.getUserById(userId);
            app.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(app.currentUser));
            
            app.initApp();
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            alert(error.message || 'Ошибка регистрации. Попробуйте еще раз.');
        }
    },
    
    // Выход из аккаунта
    logout: function() {
        app.currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('auth-page').style.display = 'block';
        document.getElementById('app-page').style.display = 'none';
        
        // Очищаем карту
        if (mapModule.map) {
            mapModule.map.remove();
            mapModule.map = null;
        }
    }
};
