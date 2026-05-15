// ==========================================
// 1. ESTADO GLOBAL Y SEGURIDAD
// ==========================================
// Función para mostrar alertas profesionales (Reemplaza al alert nativo)
const mostrarAlerta = (titulo, mensaje, tipo = 'danger') => {
    // 1. Limpiar modales previos para no ensuciar el DOM
    const modalPrevio = document.getElementById('modalAlertaCustom');
    if (modalPrevio) modalPrevio.remove();

    // 2. Crear la estructura HTML del Modal de Bootstrap
    const modalHTML = `
        <div class="modal fade" id="modalAlertaCustom" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-${tipo} bg-opacity-10 border-0">
                        <h5 class="modal-title fw-bold text-${tipo}">
                            <i class="bi bi-exclamation-circle-fill me-2"></i>${titulo}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body py-4 text-muted">
                        ${mensaje}
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-${tipo} rounded-pill px-4 fw-bold" data-bs-dismiss="modal">Entendido</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 3. Inyectar en el DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 4. Inicializar y mostrar usando Bootstrap JS
    const modalElement = document.getElementById('modalAlertaCustom');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
};
let historialEntrenamientos = [
    { id: 1, actividad: "Fuerza Tren Inferior", duracion: "45 min", fecha: "2026-03-29", estado: "Completado" }
];

const sanitizar = (texto) => {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
};

// ==========================================
// 2. CALCULADORA DE KCAL (FEEDBACK LOCALIZADO)
// ==========================================
const kcalForm = document.getElementById('kcal-form');

// Función para limpiar errores previos
const limpiarErrores = () => {
    const inputs = kcalForm.querySelectorAll('.is-invalid');
    inputs.forEach(input => input.classList.remove('is-invalid'));

    // Limpiar el recuadro de éxito si existía
    const resDiv = document.getElementById('kcal-result-success');
    if (resDiv) resDiv.remove();
};

// Función para inyectar el error debajo del input
const mostrarErrorInput = (idInput, mensaje) => {
    const input = document.getElementById(idInput);
    input.classList.add('is-invalid');

    // Buscamos el div "invalid-feedback" que está justo después del input
    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = mensaje;
    }
};

if (kcalForm) {
    kcalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        limpiarErrores();

        let hayErrores = false;

        // 1. CAPTURA DE TODOS LOS DATOS
        const genero = document.getElementById('user-gender').value;
        const peso = parseFloat(document.getElementById('user-weight').value);
        const altura = parseFloat(document.getElementById('user-height').value);
        const edad = parseInt(document.getElementById('user-age').value);
        const actividad = document.getElementById('activity-level').value;
        const objetivo = document.getElementById('user-goal').value; // Ahora lo capturamos arriba

        // 2. TODAS LAS VALIDACIONES JUNTAS
        if (!genero) {
            mostrarErrorInput('user-gender', 'Por favor, selecciona tu sexo biológico.');
            hayErrores = true;
        }
        if (!peso || peso < 30 || peso > 300) {
            mostrarErrorInput('user-weight', 'Debe ser entre 30 y 300 kg.');
            hayErrores = true;
        }
        if (!altura || altura < 100 || altura > 250) {
            mostrarErrorInput('user-height', 'Debe ser entre 100 y 250 cm.');
            hayErrores = true;
        }
        if (!edad || edad < 15 || edad > 120) {
            mostrarErrorInput('user-age', 'Rango válido: 15 a 120 años.');
            hayErrores = true;
        }
        if (!actividad) {
            mostrarErrorInput('activity-level', 'Selecciona tu nivel de actividad.');
            hayErrores = true;
        }
        if (!objetivo) {
            mostrarErrorInput('user-goal', 'Selecciona un objetivo para ajustar tus calorías.');
            hayErrores = true;
        }

        // Si hay cualquier error, cortamos la ejecución ANTES de calcular
        if (hayErrores) return;

        // 3. CÁLCULO DE MANTENIMIENTO (TDEE BASE) - Una sola vez
        const ajusteGenero = (genero === 'male') ? 5 : -161;
        let tmb = (10 * peso) + (6.25 * altura) - (5 * edad) + ajusteGenero;
        const factores = { sedentary: 1.2, moderate: 1.55, intense: 1.9 };
        const mantenimiento = Math.round(tmb * factores[actividad]);

        // 4. LÓGICA DE INGENIERÍA NUTRICIONAL (Ajuste según objetivo)
        let caloriasFinales = mantenimiento;
        let mensajeObjetivo = "para mantener tu peso actual";

        if (objetivo === 'deficit') {
            caloriasFinales = Math.round(mantenimiento * 0.85); // Recorte del 15%
            mensajeObjetivo = "para iniciar un déficit calórico saludable";
        } else if (objetivo === 'surplus') {
            caloriasFinales = Math.round(mantenimiento * 1.10); // Aumento del 10%
            mensajeObjetivo = "para apoyar el crecimiento muscular (superávit)";
        }

        // Mapeo simple para que el texto del objetivo se vea bonito en español
        const nombresObjetivos = {
            'maintain': 'Mantenimiento',
            'deficit': 'Déficit Calórico',
            'surplus': 'Volumen Muscular'
        };

        // 5. RENDERIZAR ÉXITO
        let resDiv = document.createElement('div');
        resDiv.id = 'kcal-result-success';
        resDiv.className = 'alert mt-4 fw-bold text-center border-0 shadow-sm';
        resDiv.style.backgroundColor = 'var(--flor-pastel)';
        resDiv.style.color = 'var(--flor-oscura)';
        resDiv.innerHTML = `
            <div class="small mb-1 text-muted fw-normal">Tu objetivo: ${nombresObjetivos[objetivo]}</div>
            <i class="bi bi-lightning-charge-fill me-2 text-warning"></i>
            Necesitas <strong>${caloriasFinales} kcal</strong> diarias ${mensajeObjetivo}.
        `;

        kcalForm.appendChild(resDiv);
    });
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
    if (inputs[3]) inputs[3].value = item.categoria;
    if (inputs[4]) inputs[4].value = item.intensidad;

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
        mostrarAlerta("Error de Validación", error, "danger");
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