// Importa todas las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Configuración de Firebase
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

// Inicializa Firebase y obtén las instancias de Auth y Database
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Referencias a elementos de la interfaz de usuario
const form = document.getElementById('equipmentForm');
const tableBody = document.querySelector('#maintenanceTable tbody');
const dashboardStats = document.getElementById('dashboard-stats');
const opinionForm = document.getElementById('opinion-form');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const errorMessageDiv = document.getElementById('error-message');
const logoutButton = document.getElementById('logout-button');
const togglePassword = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');

let tipoMantenimientoChart = null; // Variable para almacenar la instancia del gráfico

// ---
// Lógica de Autenticación y Protección de Rutas

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
                const user = userCredential.user;
                set(ref(db, 'users/' + user.uid), {
                    name: name,
                    email: email
                }).then(() => {
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
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch(() => {
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

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'login.html';
        });
    });
}

// Lógica para mostrar/ocultar contraseña
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
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

// ---
// Lógica de Gestión de Datos y Dashboard

function updateDashboard(snapshot) {
    const totalMantenimientosEl = document.getElementById('total-mantenimientos');
    const porTipoEl = document.getElementById('mantenimientos-por-tipo');
    const ultimosRegistrosEl = document.getElementById('ultimos-registros');

    if (!dashboardStats || !snapshot.exists()) {
        if (totalMantenimientosEl) totalMantenimientosEl.textContent = '0';
        if (porTipoEl) porTipoEl.innerHTML = '<p>No hay datos para mostrar.</p>';
        if (ultimosRegistrosEl) ultimosRegistrosEl.innerHTML = '<p>No hay registros recientes.</p>';
        return;
    }

    const data = snapshot.val();
    const records = Object.values(data).sort((a, b) => new Date(b.Fecha_de_Mantenimiento) - new Date(a.Fecha_de_Mantenimiento));

    if (totalMantenimientosEl) {
        totalMantenimientosEl.textContent = records.length;
    }

    if (porTipoEl) {
        const counts = records.reduce((acc, record) => {
            const tipo = record.Tipo_de_Mantenimiento || 'No especificado';
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});

        const chartCanvas = document.getElementById('tipoMantenimientoChart');
        if (chartCanvas) {
            const labels = Object.keys(counts);
            const data = Object.values(counts);

            if (tipoMantenimientoChart) {
                tipoMantenimientoChart.destroy();
            }

            // Asegúrate de que Chart.js y el plugin ChartDataLabels están cargados en tu HTML
            if (window.Chart && window.ChartDataLabels) {
                tipoMantenimientoChart = new Chart(chartCanvas, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Mantenimientos por Tipo',
                            data: data,
                            backgroundColor: [
                                'rgba(255, 81, 0, 1)',
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(85, 83, 83, 1)',
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(153, 102, 255, 0.7)',
                            ],
                            borderColor: [
                                'rgba(255, 81, 0, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(85, 83, 83, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            datalabels: {
                                color: '#000000',
                                textAlign: 'center',
                                font: {
                                    weight: 'bold',
                                    size: 16
                                },
                                formatter: (value) => value,
                            }
                        }
                    }
                });
            }
        }
    }

    if (ultimosRegistrosEl) {
        const ultimos = records.slice(0, 100);
        if (ultimos.length > 0) {
            ultimosRegistrosEl.innerHTML = `
                <ul class="list-group list-group-flush">
                    ${ultimos.map(rec => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${rec.Nombre_del_Equipo} (${rec.Tipo_de_Mantenimiento})
                            <span class="badge bg-secondary rounded-pill">${rec.Fecha_de_Mantenimiento}</span>
                        </li>`).join('')}
                </ul>`;
        } else {
            ultimosRegistrosEl.innerHTML = '<p>No hay registros recientes.</p>';
        }
    }
}

// Mostrar los registros de Firebase en la tabla
function renderTableFirebase(snapshot) {
    if (tableBody) tableBody.innerHTML = '';
    else return;
    if (!snapshot.exists()) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" style="color:#888;">No hay registros de mantenimiento.</td>`;
        tableBody.appendChild(tr);
        return;
    }
    const data = snapshot.val();
    const keys = Object.keys(data);
    keys.forEach(key => {
        const reg = data[key];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${reg.Nombre_del_Equipo}</td>
            <td>${reg.Número_de_Serie}</td>
            <td>${reg.Fecha_de_Mantenimiento}</td>
            <td>${reg.Tipo_de_Mantenimiento}</td>
            <td>
                <button class="eliminar" data-key="${key}" title="Eliminar registro">🗑️</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    document.querySelectorAll('.eliminar').forEach(btn => {
        btn.onclick = function() {
            const key = this.getAttribute('data-key');
            remove(ref(db, 'mantenimientos/' + key));
        };
    });
}

// Escuchar cambios en Firebase y actualizar la tabla y el dashboard en tiempo real
onValue(ref(db, 'mantenimientos'), (snapshot) => {
    if (document.getElementById('maintenanceTable')) {
        renderTableFirebase(snapshot);
    }
    if (document.getElementById('dashboard-stats')) {
        updateDashboard(snapshot);
    }
});

// Evento para registrar un nuevo mantenimiento
if (form) {
    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const Nombre_del_Equipo = document.getElementById('Nombre_del_Equipo').value;
        const Número_de_Serie = document.getElementById('Número_de_Serie').value;
        const Fecha_de_Mantenimiento = document.getElementById('Fecha_de_Mantenimiento').value;
        const Tipo_de_Mantenimiento = document.getElementById('Tipo_de_Mantenimiento').value;

        try {
            await push(ref(db, 'mantenimientos'), {
                Nombre_del_Equipo,
                Número_de_Serie,
                Fecha_de_Mantenimiento,
                Tipo_de_Mantenimiento
            });
            form.reset();
        } catch (error) {
            alert('Error al guardar en Firebase: ' + error.message);
        }
    });
}
