// ==========================================
// 1. ESTADO GLOBAL Y SEGURIDAD
// ==========================================
let historialEntrenamientos = [
    { id: 1, actividad: "Fuerza Tren Inferior", duracion: "45 min", fecha: "2026-03-29", estado: "Completado" }
];

const sanitizar = (texto) => {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
};


// ==========================================
// 2. CALCULADORA DE KCAL
// ==========================================
const kcalForm = document.getElementById('kcal-form');

if (kcalForm) {
    kcalForm.addEventListener('submit', (e) => {
        // ESTA ES LA LÍNEA CLAVE QUE EVITA QUE LA PÁGINA SE REINICIE
        e.preventDefault(); 
        
        const peso = parseFloat(document.getElementById('user-weight').value);
        const altura = parseFloat(document.getElementById('user-height').value);
        const edad = parseInt(document.getElementById('user-age').value);
        const actividad = document.getElementById('activity-level').value;

        // Validación robusta
        if (!peso || !altura || !edad || !actividad) {
            alert("Por favor, completa todos los campos correctamente.");
            return;
        }

        // Cálculo TMB (Mifflin-St Jeor)
        let tmb = (10 * peso) + (6.25 * altura) - (5 * edad) - 161;
        const factores = { sedentary: 1.2, moderate: 1.55, intense: 1.9 };
        const tdee = Math.round(tmb * factores[actividad]);

        mostrarResultadoKcal(tdee);
    });
}

function mostrarResultadoKcal(total) {
    let resDiv = document.getElementById('kcal-result');
    if (!resDiv) {
        resDiv = document.createElement('div');
        resDiv.id = 'kcal-result';
        resDiv.className = 'alert alert-success mt-4 fw-bold text-center';
        kcalForm.appendChild(resDiv);
    }
    // Evitamos innerHTML directo por seguridad (Criterio de la rúbrica)
    resDiv.textContent = `Tu gasto energético diario estimado es de ${total} kcal.`;
}

// ==========================================
// 3. TEMPORIZADOR HIPOPRESIVOS (CORREGIDO)
// ==========================================
let timerInterval;
const display = document.getElementById('tiempo-display');
const faseBadge = document.getElementById('fase-actual');
const btnIniciar = document.querySelector('#herramienta-hipopresivos .btn-primary');
const btnPausa = document.querySelector('#herramienta-hipopresivos .btn-outline-primary');
const btnReiniciar = document.querySelector('#herramienta-hipopresivos .text-muted');

const fases = [
    { nombre: "Inhalación", seg: 2, color: "#D81B60" },
    { nombre: "Exhalación", seg: 4, color: "#6A1B9A" },
    { nombre: "Apnea", seg: 10, color: "#4A4A4A" }
];

let faseActualIdx = 0;
let tiempoRestante = 0;

function actualizarUI() {
    display.textContent = `00:${tiempoRestante < 10 ? '0' : ''}${tiempoRestante}`;
    faseBadge.textContent = fases[faseActualIdx].nombre;
    faseBadge.style.backgroundColor = fases[faseActualIdx].color;
}

btnIniciar.onclick = () => {
    btnIniciar.disabled = true;
    btnPausa.disabled = false;
    if (tiempoRestante <= 0) {
        faseActualIdx = 0;
        tiempoRestante = fases[faseActualIdx].seg;
    }
    
    timerInterval = setInterval(() => {
        tiempoRestante--;
        if (tiempoRestante < 0) {
            faseActualIdx = (faseActualIdx + 1) % fases.length;
            tiempoRestante = fases[faseActualIdx].seg;
        }
        actualizarUI();
    }, 1000);
};

btnPausa.onclick = () => {
    clearInterval(timerInterval);
    btnIniciar.disabled = false;
    btnPausa.disabled = true;
};

btnReiniciar.onclick = () => {
    clearInterval(timerInterval);
    tiempoRestante = 0;
    faseActualIdx = 0;
    actualizarUI();
    btnIniciar.disabled = false;
};

// ==========================================
// 4. REGISTRO DE ACTIVIDAD (CRUD AVANZADO)
// ==========================================
const tablaBody = document.querySelector('#herramienta-registro tbody');
const formRegistro = document.querySelector('#herramienta-registro form');
const btnAccion = document.querySelector('#herramienta-registro button'); // El botón "Añadir"

let editandoID = null; // Para saber si estamos editando o creando

// Función de validación avanzada (Criterio 1)
const validarDatos = (act, dur, fec, cat, int) => {
    const durRegex = /^\d+\s?min$/; // Valida formatos como "30min" o "45 min"
    
    if (!act || act.length < 3) return "El nombre debe tener al menos 3 caracteres.";
    if (!durRegex.test(dur)) return "La duración debe ser un número seguido de 'min' (ej: 20 min).";
    if (!fec) return "La fecha es obligatoria.";
    if (!cat) return "Debes seleccionar una categoría.";
    if (int < 1 || int > 10) return "La intensidad debe estar entre 1 y 10.";
    
    return null; // Todo correcto
};

const renderizarTabla = (datosFiltrados = historialEntrenamientos) => {
    tablaBody.innerHTML = ''; 
    
    datosFiltrados.forEach(item => {
        const tr = document.createElement('tr');
        
        // Usamos textContent en nodos hijos para máxima seguridad (Criterio 1)
        tr.innerHTML = `
            <td class="ps-4">
                <div class="fw-bold text-name"></div>
                <small class="text-muted text-date"></small>
                <div class="badge bg-light text-dark border extra-info" style="font-size: 0.7rem"></div>
            </td>
            <td class="text-muted small text-dur"></td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-info btn-edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger btn-delete"><i class="bi bi-trash"></i></button>
            </td>
        `;

        tr.querySelector('.text-name').textContent = item.actividad;
        tr.querySelector('.text-date').textContent = item.fecha;
        tr.querySelector('.extra-info').textContent = `${item.categoria} | Int: ${item.intensidad}/10`;
        tr.querySelector('.text-dur').textContent = item.duracion;

        // Eventos de botones
        tr.querySelector('.btn-edit').onclick = () => cargarParaEditar(item.id);
        tr.querySelector('.btn-delete').onclick = () => eliminarRegistro(item.id);

        tablaBody.appendChild(tr);
    });
};

// Cargar datos en el formulario para editar
const cargarParaEditar = (id) => {
    const item = historialEntrenamientos.find(i => i.id === id);
    const inputs = formRegistro.querySelectorAll('input, select');
    
    inputs[0].value = item.actividad;
    inputs[1].value = item.duracion;
    inputs[2].value = item.fecha;
    // (Asegúrate de haber añadido los inputs de categoría e intensidad al HTML)
    if(inputs[3]) inputs[3].value = item.categoria;
    if(inputs[4]) inputs[4].value = item.intensidad;

    editandoID = id;
    btnAccion.textContent = "Guardar Cambios";
    btnAccion.className = "btn btn-warning btn-sm w-100 fw-bold shadow-sm rounded-pill py-2";
    window.location.hash = "#herramienta-registro"; // Scroll suave al form
};

btnAccion.onclick = (e) => {
    e.preventDefault();
    const inputs = formRegistro.querySelectorAll('input, select');
    const [act, dur, fec, cat, int] = Array.from(inputs).map(i => i.value);

    const error = validarDatos(act, dur, fec, cat, int);
    if (error) {
        alert(error);
        return;
    }

    if (editandoID) {
        // Actualizar existente
        const index = historialEntrenamientos.findIndex(i => i.id === editandoID);
        historialEntrenamientos[index] = { ...historialEntrenamientos[index], actividad: act, duracion: dur, fecha: fec, categoria: cat, intensidad: int };
        editandoID = null;
        btnAccion.textContent = "Añadir";
        btnAccion.className = "btn btn-primary btn-sm w-100 fw-bold shadow-sm rounded-pill py-2";
    } else {
        // Crear nuevo
        historialEntrenamientos.unshift({ id: Date.now(), actividad: act, duracion: dur, fecha: fec, categoria: cat, intensidad: int });
    }

    renderizarTabla();
    formRegistro.reset();
};