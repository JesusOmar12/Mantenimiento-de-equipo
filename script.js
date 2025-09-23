// Importa las funciones necesarias de Firebase
import { ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
// Importa las instancias de auth y db desde auth.js para evitar duplicados
import { auth, db } from "./auth.js";

// Referencias a elementos de la interfaz
const form = document.getElementById('equipmentForm');
const tableBody = document.querySelector('#maintenanceTable tbody');
const dashboardStats = document.getElementById('dashboard-stats');
const opinionForm = document.getElementById('opinion-form');

let tipoMantenimientoChart = null; // Variable para almacenar la instancia del gráfico

// ---
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

            Chart.register(ChartDataLabels);

            tipoMantenimientoChart = new Chart(chartCanvas, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Mantenimientos por Tipo',
                        data: data,
                        backgroundColor: [
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

// Escuchar cambios en Firebase y actualizar la tabla en tiempo real
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

// Formulario de opiniones
if (opinionForm) {
    opinionForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const opinion = document.getElementById('opinion').value;
        const opinionesRef = ref(db, 'Opiniones');

        push(opinionesRef, {
            nombre: nombre,
            opinion: opinion,
            fecha: new Date().toISOString()
        }).then(() => {
            const mensaje = document.getElementById('mensaje');
            mensaje.className = 'alert alert-success';
            mensaje.textContent = '¡Gracias por tu opinión!';
            mensaje.classList.remove('d-none');
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