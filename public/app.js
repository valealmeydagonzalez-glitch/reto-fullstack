const API_URL = 'http://localhost:3000/api';
let isRegistering = false;

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const mainContainer = document.getElementById('main-container');
const tasksContainer = document.getElementById('tasks-container');
const congratsBanner = document.getElementById('congrats-banner');

// --- SISTEMA DE SONIDOS SINTÉTICOS ---
function reproducirSonido(tipo) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (tipo === 'click') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (tipo === 'success') {
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.1);
            osc.frequency.setValueAtTime(783.99, now + 0.2);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (tipo === 'delete') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (tipo === 'tada') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.1);
            osc.frequency.setValueAtTime(659.25, now + 0.2);
            osc.frequency.setValueAtTime(880, now + 0.3);
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (tipo === 'party') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.15);
            osc.frequency.setValueAtTime(783.99, now + 0.3);
            osc.frequency.setValueAtTime(1046.50, now + 0.45);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
            osc.start(now);
            osc.stop(now + 0.7);
        } else if (tipo === 'bye') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.5);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    } catch (e) {}
}

// Revisar sesión al cargar
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        activarModoApp();
    }
});

function activarModoApp() {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    document.body.classList.add('in-app');
    cargarTareas();
}

// Manejar Login / Registro
async function manejarAuth() {
    reproducirSonido('click');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    const endpoint = isRegistering ? '/register' : '/login';

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Ocurrió un error');

        if (isRegistering) {
            reproducirSonido('success');
            alert('¡Registro exitoso! Ahora inicia sesión.');
            cambiarTab(false);
            document.getElementById('password').value = '';
        } else {
            reproducirSonido('success');
            localStorage.setItem('token', data.token);
            activarModoApp();
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// Cargar Tareas
async function cargarTareas() {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const tareas = await response.json();
        
        tasksContainer.innerHTML = '';
        if (tareas.length === 0) {
            tasksContainer.innerHTML = `<p style="text-align: center; color: #94a3b8; font-size: 14px; margin-top: 25px;">No tienes tareas pendientes. ¡Empieza creando una arriba! ✨</p>`;
            congratsBanner.style.display = 'none';
            return;
        }

        tareas.forEach((tarea, index) => {
            const priorityClass = `priority-${tarea.priority || 'media'}`;
            const priorityText = (tarea.priority || 'media').toUpperCase();
            const isCompleted = tarea.completed ? 'completed' : '';
            const isChecked = tarea.completed ? 'checked' : '';

            const div = document.createElement('div');
            div.className = `task-card ${isCompleted}`;
            div.id = `task-${tarea.id}`;
            div.innerHTML = `
                <div class="task-left">
                    <input type="checkbox" class="task-checkbox" ${isChecked} onchange="toggleCompletar(${tarea.id}, this)">
                    <div class="task-info">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                            <span class="task-title">${escapeHTML(tarea.title)}</span>
                            <span class="priority-badge ${priorityClass}">${priorityText}</span>
                        </div>
                        <p class="task-desc">${escapeHTML(tarea.description || '')}</p>
                    </div>
                </div>
                <div class="task-actions">
                    <div class="task-buttons-row">
                        <button class="btn-edit" onclick="reproducirSonido('click'); prepararEdicion(${tarea.id}, '${escapeAttr(tarea.title)}', '${escapeAttr(tarea.description || '')}', '${tarea.priority || 'media'}', ${tarea.completed || 0})">Editar</button>
                        <button class="btn-delete" onclick="eliminarTarea(${tarea.id})">Borrar</button>
                    </div>
                    <div class="task-buttons-row" style="margin-top: 4px;">
                        ${index > 0 ? `<button class="btn-move" onclick="moverTarea(${index}, -1)" title="Subir posición">⬆️</button>` : ''}
                        ${index < tareas.length - 1 ? `<button class="btn-move" onclick="moverTarea(${index}, 1)" title="Bajar posición">⬇️</button>` : ''}
                    </div>
                </div>
            `;
            tasksContainer.appendChild(div);
        });

        verificarTodasCompletadas();
    } catch (err) {
        console.error('Error al cargar tareas:', err);
    }
}

// Marcar como completada y verificar si se completaron todas
function toggleCompletar(id, checkbox) {
    const card = document.getElementById(`task-${id}`);
    const title = card.querySelector('.task-title').textContent;
    const desc = card.querySelector('.task-desc').textContent;
    
    // Extraer la prioridad actual de la tarjeta basándonos en su clase
    let priorityBadge = 'media';
    if (card.querySelector('.priority-alta')) priorityBadge = 'alta';
    else if (card.querySelector('.priority-baja')) priorityBadge = 'baja';

    if (checkbox.checked) {
        card.classList.add('completed');
        reproducirSonido('tada');
        try {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
    } else {
        card.classList.remove('completed');
        reproducirSonido('click');
    }

    fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, description: desc, priority: priorityBadge, completed: checkbox.checked ? 1 : 0 })
    }).then(() => {
        verificarTodasCompletadas();
    });
}

// Verificar si todas las tareas tienen check para lanzar felicitaciones masivas
function verificarTodasCompletadas() {
    const tarjetas = document.querySelectorAll('.task-card');
    if (tarjetas.length === 0) {
        congratsBanner.style.display = 'none';
        return;
    }

    let todasListas = true;
    tarjetas.forEach(card => {
        if (!card.classList.contains('completed')) {
            todasListas = false;
        }
    });

    if (todasListas) {
        congratsBanner.style.display = 'block';
        reproducirSonido('party');
        try {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.4 }
            });
        } catch (e) {}
    } else {
        congratsBanner.style.display = 'none';
    }
}

// Mover tarea visualmente
function moverTarea(index, direccion) {
    reproducirSonido('click');
    const cards = Array.from(tasksContainer.children);
    const targetIndex = index + direccion;
    if (targetIndex >= 0 && targetIndex < cards.length) {
        if (direccion < 0) {
            tasksContainer.insertBefore(cards[index], cards[targetIndex]);
        } else {
            tasksContainer.insertBefore(cards[targetIndex], cards[index]);
        }
    }
}

// Crear o Actualizar Tarea (Corregido para capturar bien la prioridad del select)
async function guardarTarea(e) {
    e.preventDefault();
    reproducirSonido('success');
    const taskId = document.getElementById('editing-task-id').value;
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const priority = document.getElementById('task-priority').value; // <-- Aquí se toma el valor correcto del select
    const currentCompleted = document.getElementById('editing-task-completed').value;

    const endpoint = taskId ? `${API_URL}/tasks/${taskId}` : `${API_URL}/tasks`;
    const method = taskId ? 'PUT' : 'POST';
    const completedVal = taskId ? parseInt(currentCompleted || 0) : 0;

    try {
        await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, description, priority, completed: completedVal })
        });

        cancelarEdicion();
        cargarTareas();
    } catch (err) {
        console.error('Error al guardar tarea:', err);
    }
}

function prepararEdicion(id, title, description, priority, completed) {
    document.getElementById('editing-task-id').value = id;
    document.getElementById('task-title').value = title;
    document.getElementById('task-desc').value = description;
    document.getElementById('task-priority').value = priority; // <-- Carga la prioridad correcta en el selector
    document.getElementById('editing-task-completed').value = completed;
    
    document.getElementById('task-submit-btn').textContent = 'Actualizar Tarea';
    document.getElementById('task-cancel-btn').style.display = 'block';
    document.getElementById('task-title').focus();
}

function cancelarEdicion() {
    reproducirSonido('click');
    document.getElementById('editing-task-id').value = '';
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
    document.getElementById('task-priority').value = 'media';
    document.getElementById('editing-task-completed').value = '0';

    document.getElementById('task-submit-btn').textContent = 'Añadir Tarea';
    document.getElementById('task-cancel-btn').style.display = 'none';
}

// Eliminar Tarea
async function eliminarTarea(id) {
    reproducirSonido('delete');
    const card = document.getElementById(`task-${id}`);
    if (card) {
        card.classList.add('deleting');
    }

    setTimeout(async () => {
        try {
            await fetch(`${API_URL}/tasks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            cargarTareas();
        } catch (err) {
            console.error('Error al eliminar tarea:', err);
        }
    }, 300);
}

// Cerrar Sesión
function cerrarSesionConEstilo() {
    reproducirSonido('bye');
    mainContainer.classList.add('goodbye-animation');

    setTimeout(() => {
        localStorage.removeItem('token');
        appSection.classList.add('hidden');
        authSection.classList.remove('hidden');
        document.body.classList.remove('in-app');
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        mainContainer.classList.remove('goodbye-animation');
    }, 650);
}

// Funciones auxiliares
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[tag] || tag)
    );
}
function escapeAttr(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}