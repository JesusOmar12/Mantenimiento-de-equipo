        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
        import { getDatabase, ref, set, get, child, push } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
        import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
    
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
        const auth = getAuth(app);
    
       
    
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





















function mostrarTextoGradualmente(elemento) {
  var textoCompleto = elemento.textContent;
  elemento.textContent = ''; 
  var i = 0;
  var intervalo = setInterval(function() {
      if (i < textoCompleto.length) {
          elemento.textContent += textoCompleto.charAt(i);
          i++;
      } else {
          clearInterval(intervalo);
      }
  }, 100); 
}

// Agregar en tu archivo scripts.js
function openUserLoginModal() {
    const userLoginModal = new bootstrap.Modal(document.getElementById('userLoginModal'));
    userLoginModal.show();
}

function closeModal(modalId) {
    const modalElement = document.getElementById(modalId);

    if (modalElement) {
        // Retira el foco del elemento activo
        document.activeElement.blur();

        // Obtén la instancia del modal de Bootstrap y ciérralo
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }
    } else {
        console.error(`No se encontró el modal con el ID: ${modalId}`);
    }
}
function switchModal(closeModalId, openModalId) {
    closeModal(closeModalId); // Cerrar el modal activo
    const openModalElement = document.getElementById(openModalId);

    if (openModalElement) {
        const openModalInstance = bootstrap.Modal.getOrCreateInstance(openModalElement);
        openModalInstance.show(); // Abrir el nuevo modal
    } else {
        console.error(`No se encontró el modal con el ID: ${openModalId}`);
    }
}

const toggleButton = document.getElementById('toggleButton');

// Función para establecer el modo
function setMode(mode) {
    const body = document.body;
    body.classList.remove('light-mode', 'dark-mode');
    body.classList.add(mode);
    localStorage.setItem('mode', mode); // Guardar el modo en localStorage
}

// Actualizar el texto del botón
function updateButtonText(mode) {
    const button = document.querySelector('.toggle-button');
    button.textContent = mode === 'dark-mode' ? '🌜' : '🌞'; // Cambiar ícono
    button.title = mode === 'dark-mode' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro';
}

// Función para alternar entre modos
function toggleMode() {
    const currentMode = localStorage.getItem('mode') || 'light-mode';
    const newMode = currentMode === 'light-mode' ? 'dark-mode' : 'light-mode';
    setMode(newMode);
    updateButtonText(newMode);
}

// Inicializar el modo al cargar la página
window.onload = function() {
    const savedMode = localStorage.getItem('mode') || 'light-mode';
    setMode(savedMode);
    updateButtonText(savedMode);
};

// Agregar evento al botón
toggleButton.addEventListener('click', toggleMode);
        

function addToCart(productName, price, imageUrl) {
    // Obtener el cuerpo de la tabla del carrito
    const cartTbody = document.getElementById('cart-tbody');

    // Crear una nueva fila
    const newRow = document.createElement('tr');

    // Crear las celdas de la fila
    newRow.innerHTML = `
        <td><img src="${imageUrl}" alt="${productName}" style="width: 50px; height: auto;"></td>
        <td>${productName}</td>
        <td>$${price.toFixed(2)}</td>
        <td>
            <input type="number" value="1" min="1" style="width: 50px;">
        </td>
        <td>$${price.toFixed(2)}</td>
        <td>
            <button class="btn btn-danger" onclick="removeFromCart(this)">Eliminar</button>
        </td>
    `;

    // Añadir la nueva fila al cuerpo de la tabla
    cartTbody.appendChild(newRow);

    // Actualizar el total
    updateTotal();
}

// Función para eliminar un producto del carrito
function removeFromCart(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateTotal();
}

// Función para actualizar el total
function updateTotal() {
    const cartTbody = document.getElementById('cart-tbody');
    const rows = cartTbody.getElementsByTagName('tr');
    let total = 0;

    for (let row of rows) {
        const priceCell = row.cells[4].textContent;
        const price = parseFloat(priceCell.replace('$', ''));
        total += price;
    }

    document.getElementById('total-amount').textContent = `$${total.toFixed(2)}`;
}      
    
let cart = [];

function addToCart(productName, price, imageUrl) {
    // Crear un objeto del producto
    const product = {
        name: productName,
        price: price,
        image: imageUrl,
        quantity: 1
    };

    // Agregar el producto al carrito
    cart.push(product);
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartTbody = document.getElementById("cart-tbody");
    cartTbody.innerHTML = ""; // Limpiar el carrito

    let totalAmount = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        totalAmount += subtotal;

        const row = `
            <tr>
                <td><img src="${item.image}" alt="${item.name}" style="width: 50px; height: auto;"></td>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" style="width: 50px;" onchange="updateQuantity(this, '${item.name}')">
                </td>
                <td>$${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger" onclick="removeFromCart('${item.name}')">Eliminar</button>
                </td>
            </tr>
        `;
        cartTbody.innerHTML += row;
    });

    // Actualizar el total
    document.getElementById("total-amount").innerText = `$${totalAmount.toFixed(2)}`;
}

function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCartDisplay();
}

function updateQuantity(input, productName) {
    const newQuantity = parseInt(input.value);
    const product = cart.find(item => item.name === productName);
    if (product) {
        product.quantity = newQuantity;
        updateCartDisplay();
    }
}

// Resaltar el enlace activo en la navegación
document.addEventListener("DOMContentLoaded", function() {
    const currentPage = window.location.pathname.split("/").pop(); // Obtiene el nombre del archivo actual
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split("/").pop();
        // Compara la página actual con el href del enlace
        if (currentPage.toLowerCase() === linkPage.toLowerCase()) {
            link.classList.add('active'); // Añade la clase 'active' si coinciden
        }
    });
});
