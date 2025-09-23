// Importa las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCxRP4rNfVJRzU8YLrMu51Os9-PfY60Tqk",
    authDomain: "mantenimiento-a-equipo.firebaseapp.com",
    databaseURL: "https://mantenimiento-a-equipo-default-rtdb.firebaseio.com",
    projectId: "mantenimiento-a-equipo",
    storageBucket: "mantenimiento-a-equipo.firebasestorage.app",
    messagingSenderId: "840988363789",
    appId: "1:840988363789:web:47bf961f1ad221529d1944",
    measurementId: "G-NFXY6LLJMR"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Exporta 'auth' para que otros scripts puedan usarlo
export const db = getDatabase(app); // Exporta 'db' para que otros scripts puedan usarlo

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const errorMessageDiv = document.getElementById('error-message');

function showMessage(message, isError = true) {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.className = isError ? 'alert alert-danger mt-3' : 'alert alert-success mt-3';
        errorMessageDiv.classList.remove('d-none');
    }
}

// Lógica de registro
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Usuario registrado
                const user = userCredential.user;
                // Guardar información adicional en Realtime Database
                set(ref(db, 'users/' + user.uid), {
                    name: name,
                    email: email
                }).then(() => {
                    // Redirigir al login o directamente a index
                    window.location.href = 'login.html';
                });
            })
            .catch((error) => {
                showMessage(error.message);
            });
    });
}

// Lógica de inicio de sesión
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Usuario ha iniciado sesión
                window.location.href = 'index.html';
            })
            .catch((error) => {
                showMessage('Correo o contraseña incorrectos.');
            });
    });
}

// Lógica para proteger rutas y cerrar sesión
const protectedPages = ['index.html', 'control_de_mantenimiento.html', 'dashboard.html', 'preventivo.html', 'correctivo.html'];
const currentPage = window.location.pathname.split("/").pop();

onAuthStateChanged(auth, (user) => {
    if (user) {
        // El usuario está autenticado
        if (currentPage === 'login.html' || currentPage === 'register.html') {
            window.location.href = 'index.html';
        }
    } else {
        // El usuario no está autenticado
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
});

const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        e.preventDefault(); // Previene la acción por defecto del enlace
        signOut(auth).then(() => {
            window.location.href = 'login.html';
        });
    });
}

// Lógica para mostrar/ocultar contraseña
const togglePassword = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        // Cambia el tipo de input
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Cambia el ícono del ojo
        const icon = this.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });
}