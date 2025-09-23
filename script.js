// Importa las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { errorMessageDiv, registerForm, auth, db, loginForm } from "./auth";

const firebaseConfig = {
    apiKey: "AIzaSyCxRP4rNfVJRzU8YLrMu51Os9-PfY60Tqk", // Asegúrate que esta clave es correcta y está segura
    authDomain: "mantenimiento-a-equipo.firebaseapp.com",
    databaseURL: "https://mantenimiento-a-equipo-default-rtdb.firebaseio.com",
    projectId: "mantenimiento-a-equipo",
    storageBucket: "mantenimiento-a-equipo.firebasestorage.app",
    messagingSenderId: "840988363789",
    appId: "1:840988363789:web:47bf961f1ad221529d1944",
    measurementId: "G-D9REDB493L" // Este ID parece ser el correcto según tus HTML
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Referencia a la tabla y formulario
const form = document.getElementById('equipmentForm');
const tableBody = document.querySelector('#maintenanceTable tbody');
const dashboardStats = document.getElementById('dashboard-stats');
export const loginForm = document.getElementById('login-form');
export const registerForm = document.getElementById('register-form');
export const errorMessageDiv = document.getElementById('error-message');

let tipoMantenimientoChart = null; // Variable para almacenar la instancia del gráfico

// Actualizar el dashboard con estadísticas
function updateDashboard(snapshot) {
    const totalMantenimientosEl = document.getElementById('total-mantenimientos');
    const porTipoEl = document.getElementById('mantenimientos-por-tipo');
    const ultimosRegistrosEl = document.getElementById('ultimos-registros');

    if (!dashboardStats || !snapshot.exists()) {
        if(totalMantenimientosEl) totalMantenimientosEl.textContent = '0';
        if(porTipoEl) porTipoEl.innerHTML = '<p>No hay datos para mostrar.</p>';
        if(ultimosRegistrosEl) ultimosRegistrosEl.innerHTML = '<p>No hay registros recientes.</p>';
        return;
    }

    const data = snapshot.val();
    // Convertir a array y ordenar por fecha descendente para obtener los más recientes primero
    const records = Object.values(data).sort((a, b) => new Date(b.Fecha_de_Mantenimiento) - new Date(a.Fecha_de_Mantenimiento));

    // Total de mantenimientos
    if (totalMantenimientosEl) {
        totalMantenimientosEl.textContent = records.length;
    }

    // Mantenimientos por tipo
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

            // Si ya existe un gráfico, lo destruimos para crear uno nuevo
            if (tipoMantenimientoChart) {
                tipoMantenimientoChart.destroy();
            }

            // Registrar el plugin globalmente para todos los gráficos
            Chart.register(ChartDataLabels);

            tipoMantenimientoChart = new Chart(chartCanvas, {
                type: 'doughnut', // Tipo de gráfico: dona
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Mantenimientos por Tipo',
                        data: data,
                        backgroundColor: [ // Colores para cada sección
                            'rgba(255, 115, 0, 1)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(190, 178, 178, 1)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                        ],
                        borderColor: [
                            'rgba(255, 81, 0, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(190, 189, 186, 1)',
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
                        // Configuración del plugin datalabels
                        datalabels: {
                            color: '#000000', // Color del texto 
                            textAlign: 'center',
                            font: {
                                weight: 'bold',
                                size: 16
                            },
                            // Formateador para mostrar el valor numérico
                            formatter: (value) => value,
                        }
                    }
                }
            });
        }
    }

    // Últimos 1000 registros
    if (ultimosRegistrosEl) {
        const ultimos = records.slice(0, 100); // Mostrar los últimos 100 registros
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
    else return; // Si no hay tabla, no hacer nada
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

    // Asignar eventos a los botones de eliminar
    document.querySelectorAll('.eliminar').forEach(btn => {
        btn.onclick = function() {
            const key = this.getAttribute('data-key');
            remove(ref(db, 'mantenimientos/' + key));
        };
    });
}

// Escuchar cambios en Firebase y actualizar la tabla en tiempo real
onValue(ref(db, 'mantenimientos'), (snapshot) => {
    // Solo renderizar la tabla si el elemento existe en la página actual
    if (document.getElementById('maintenanceTable')) {
        renderTableFirebase(snapshot);
    }
    // Solo actualizar el dashboard si el elemento existe en la página actual
    if (document.getElementById('dashboard-stats')) {
        updateDashboard(snapshot);
    }
});

// Evento para registrar un nuevo mantenimiento
if (form) {
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Obtiene los valores de los campos del formulario
        const Nombre_del_Equipo = document.getElementById('Nombre_del_Equipo').value;
        const Número_de_Serie = document.getElementById('Número_de_Serie').value;
        const Fecha_de_Mantenimiento = document.getElementById('Fecha_de_Mantenimiento').value;
        const Tipo_de_Mantenimiento = document.getElementById('Tipo_de_Mantenimiento').value;

        // Guarda los datos en Firebase Realtime Database
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

// Formulario de opiniones
const opinionForm = document.getElementById('opinion-form');
if (opinionForm) {
    opinionForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Evitar recargar la página al enviar el formulario

        const nombre = document.getElementById('nombre').value;
        const opinion = document.getElementById('opinion').value;

        // Referencia a la base de datos en Firebase (tabla "Opiniones")
        const opinionesRef = ref(db, 'Opiniones');

        // Guardar los datos en Firebase
        push(opinionesRef, {
            nombre: nombre,
            opinion: opinion,
            fecha: new Date().toISOString() // Guardar la fecha/hora de la opinión
        }).then(() => {
            const mensaje = document.getElementById('mensaje');
            mensaje.className = 'alert alert-success'; // Agregar clase de éxito
            mensaje.textContent = '¡Gracias por tu opinión!';
            mensaje.classList.remove('d-none'); // Hacer visible el mensaje
            opinionForm.reset();
        }).catch((error) => {
            const mensaje = document.getElementById('mensaje');
            mensaje.className = 'alert alert-danger';
            mensaje.textContent = 'Hubo un error al enviar tu opinión. Intenta de nuevo.';
            mensaje.classList.remove('d-none');
            console.error('Error al guardar la opinión:', error);
        });
    });
}

function showMessage(message, isError = true) {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.className = isError ? 'alert alert-danger mt-3' : 'alert alert-success mt-3';
        errorMessageDiv.classList.remove('d-none');
    }
}

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
