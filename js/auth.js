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
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (email && password) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                app.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(app.currentUser));
                app.initApp();
            } else {
                alert('Неверный email или пароль');
            }
        } else {
            alert('Пожалуйста, заполните все поля');
        }
    },
    
    // Функция регистрации
    register: function() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        if (name && email && password) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            if (users.some(u => u.email === email)) {
                alert('Пользователь с таким email уже существует');
                return;
            }
            
            const newUser = { name, email, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            app.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(app.currentUser));
            
            app.initApp();
        } else {
            alert('Пожалуйста, заполните все поля');
        }
    },
    
    // Выход из аккаунта
    logout: function() {
        app.currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('auth-page').style.display = 'block';
        document.getElementById('app-page').style.display = 'none';
    }
};