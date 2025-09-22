     // Importa las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";

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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// Referencia a la tabla y formulario
const form = document.getElementById('equipmentForm');
const tableBody = document.querySelector('#maintenanceTable tbody');
const dashboardStats = document.getElementById('dashboard-stats');


// Mostrar los registros de Firebase en la tabla
function renderTableFirebase(snapshot) {
    tableBody.innerHTML = '';
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
onValue(ref(db, 'mantenimientos'), renderTableFirebase);

// Evento para registrar un nuevo mantenimiento
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
   
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
    
       
    
            // Formulario de opiniones
            document.getElementById('opinion-form').addEventListener('submit', function (e) {
                e.preventDefault(); // Evitar recargar la página al enviar el formulario
    
                const nombre = document.getElementById('nombre').value;
                const opinion = document.getElementById('opinion').value;
    
                // Referencia a la base de datos en Firebase (tabla "Opiniones")
                const opinionesRef = ref(database, 'Opiniones');
    
                // Guardar los datos en Firebase
                push(opinionesRef, {
                    nombre: nombre,
                    opinion: opinion,
                    fecha: new Date().toISOString() // Guardar la fecha/hora de la opinión
                })
                .then(() => {
                    const mensaje = document.getElementById('mensaje');
                    mensaje.className = 'alert alert-success'; // Agregar clase de éxito
                    mensaje.textContent = '¡Gracias por tu opinión!';
                    mensaje.classList.remove('d-none'); // Hacer visible el mensaje
                    document.getElementById('opinion-form').reset();
                })
                .catch((error) => {
                    const mensaje = document.getElementById('mensaje');
                    mensaje.className = 'alert alert-danger';
                    mensaje.textContent = 'Hubo un error al enviar tu opinión. Intenta de nuevo.';
                    mensaje.classList.remove('d-none');
                    console.error('Error al guardar la opinión:', error);
                });
            });
    