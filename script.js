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
    {
        id: 1,
        actividad: "Fuerza Tren Inferior",
        duracion: "45 min",
        fecha: "2026-03-29",
        categoria: "Fuerza",
        intensidad: 8,
        estado: "Completado"
    },
    {
        id: 2,
        actividad: "Hipopresivos Nivel 1",
        duracion: "15 min",
        fecha: "2026-03-30",
        categoria: "Hipopresivos",
        intensidad: 6,
        estado: "Completado"
    }
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
// 3. TEMPORIZADOR HIPOPRESIVOS (MÁQUINA DE ESTADOS)
// ==========================================

// Estructura de datos dinámica según dificultad (Criterio 2)
const rutinasHipopresivas = {
    principiante: [
        { nombre: "Inhalación", seg: 3, color: "#0dcaf0", texto: "Abre tus costillas lateralmente" },
        { nombre: "Exhalación", seg: 6, color: "#6A1B9A", texto: "Suelta el aire como empañando un vidrio" },
        { nombre: "Apnea", seg: 10, color: "#D81B60", texto: "¡Vacío abdominal! Mantén la postura" }
    ],
    intermedio: [
        { nombre: "Inhalación", seg: 4, color: "#0dcaf0", texto: "Abre tus costillas lateralmente" },
        { nombre: "Exhalación", seg: 8, color: "#6A1B9A", texto: "Suelta el aire lentamente" },
        { nombre: "Apnea", seg: 15, color: "#D81B60", texto: "¡Vacío abdominal profundo!" }
    ],
    avanzado: [
        { nombre: "Inhalación", seg: 5, color: "#0dcaf0", texto: "Expansión torácica máxima" },
        { nombre: "Exhalación", seg: 10, color: "#6A1B9A", texto: "Vaciado pulmonar completo" },
        { nombre: "Apnea", seg: 20, color: "#D81B60", texto: "¡Apertura costal sin aire!" }
    ]
};

// Variables de Estado
let timerHipo;
let faseActualIdx = 0;
let tiempoRestanteHipo = 0;
let cicloActual = 1;
let totalCiclos = 3;
let fasesActivas = [];

// Elementos del DOM
const displayHipo = document.getElementById('tiempo-display');
const badgeFase = document.getElementById('fase-actual');
const txtInstruccion = document.getElementById('instruccion-fase');
const txtCiclo = document.getElementById('ciclo-actual');
const barraProgreso = document.getElementById('barra-progreso');

const selectNivel = document.getElementById('hipo-nivel');
const selectCiclos = document.getElementById('hipo-ciclos');
const btnIniciarHipo = document.getElementById('btn-iniciar-hipo');
const btnPausarHipo = document.getElementById('btn-pausar-hipo');
const btnReiniciarHipo = document.getElementById('btn-reiniciar-hipo');

// Función principal de actualización UI (Criterio 3)
const actualizarUIHipo = () => {
    // Formato de tiempo "00:00"
    displayHipo.textContent = `00:${tiempoRestanteHipo < 10 ? '0' : ''}${tiempoRestanteHipo}`;

    const faseObj = fasesActivas[faseActualIdx];

    // Cambios visuales dinámicos
    badgeFase.textContent = faseObj.nombre;
    badgeFase.style.backgroundColor = faseObj.color;
    badgeFase.style.color = "#fff";
    displayHipo.style.color = faseObj.color; // El número cambia de color
    txtInstruccion.textContent = faseObj.texto;
    txtCiclo.textContent = `Ciclo: ${cicloActual} / ${totalCiclos}`;

    // Cálculo de la barra de progreso
    const porcentaje = ((faseObj.seg - tiempoRestanteHipo) / faseObj.seg) * 100;
    barraProgreso.style.width = `${porcentaje}%`;
    barraProgreso.style.backgroundColor = faseObj.color;
};

// Lógica del motor del temporizador
const cicloTemporizador = () => {
    tiempoRestanteHipo--;

    // Transición de fase o ciclo
    if (tiempoRestanteHipo < 0) {
        faseActualIdx++;

        // Si terminamos las 3 fases (Inhala, Exhala, Apnea)
        if (faseActualIdx >= fasesActivas.length) {
            faseActualIdx = 0;
            cicloActual++;

            // Si terminamos todos los ciclos
            if (cicloActual > totalCiclos) {
                terminarRutina();
                return;
            }
        }
        tiempoRestanteHipo = fasesActivas[faseActualIdx].seg;
    }
    actualizarUIHipo();
};

const terminarRutina = () => {
    clearInterval(timerHipo);
    mostrarAlerta("¡Rutina Completada!", `Has completado ${totalCiclos} ciclos exitosamente. No olvides registrarlo en tu historial.`, "success"); // Reutilizamos tu función de alerta
    resetearEstadoHipo();
};

const resetearEstadoHipo = () => {
    clearInterval(timerHipo);
    const nivelSeleccionado = selectNivel.value;
    fasesActivas = rutinasHipopresivas[nivelSeleccionado];
    totalCiclos = parseInt(selectCiclos.value);

    faseActualIdx = 0;
    cicloActual = 1;
    tiempoRestanteHipo = fasesActivas[0].seg;

    btnIniciarHipo.disabled = false;
    btnPausarHipo.disabled = true;

    // Restablecer estilos a estado inactivo
    displayHipo.style.color = "var(--flor-oscura)";
    badgeFase.style.backgroundColor = "var(--flor-pastel)";
    badgeFase.style.color = "var(--flor-oscura)";
    badgeFase.textContent = "Preparación";
    txtInstruccion.textContent = "Configura tu rutina y presiona iniciar.";
    txtCiclo.textContent = `Ciclo: 0 / ${totalCiclos}`;
    displayHipo.textContent = "00:00";
    barraProgreso.style.width = "0%";

    // Desbloquear selectores
    selectNivel.disabled = false;
    selectCiclos.disabled = false;
};

// Eventos de los Botones
if (btnIniciarHipo) {
    btnIniciarHipo.addEventListener('click', () => {
        // Bloquear selectores durante la rutina
        selectNivel.disabled = true;
        selectCiclos.disabled = true;

        btnIniciarHipo.disabled = true;
        btnPausarHipo.disabled = false;

        // Si está en 0 o no se ha iniciado, cargar configuración
        if (tiempoRestanteHipo === 0 || displayHipo.textContent === "00:00") {
            fasesActivas = rutinasHipopresivas[selectNivel.value];
            totalCiclos = parseInt(selectCiclos.value);
            tiempoRestanteHipo = fasesActivas[faseActualIdx].seg;
            actualizarUIHipo();
        }

        timerHipo = setInterval(cicloTemporizador, 1000);
    });
}

if (btnPausarHipo) {
    btnPausarHipo.addEventListener('click', () => {
        clearInterval(timerHipo);
        btnIniciarHipo.disabled = false;
        btnPausarHipo.disabled = true;
    });
}

if (btnReiniciarHipo) {
    btnReiniciarHipo.addEventListener('click', resetearEstadoHipo);
}

// Inicializar variables al cargar la página
if (selectNivel) resetearEstadoHipo();

// ==========================================
// 4. REGISTRO DE ACTIVIDAD (CRUD AVANZADO)
// ==========================================
const tablaBody = document.querySelector('#herramienta-registro tbody');
const formRegistro = document.getElementById('form-registro');
const btnGuardarReg = document.getElementById('btn-guardar-reg');

let editandoID = null;

// 1. FUNCIÓN PARA EL DASHBOARD 
const actualizarResumen = () => {
    const totalRutinas = historialEntrenamientos.length;
    const totalMinutos = historialEntrenamientos.reduce((acumulador, item) => {
        const minutos = parseInt(item.duracion) || 0;
        return acumulador + minutos;
    }, 0);

    const elRutinas = document.getElementById('resumen-total-rutinas');
    const elMinutos = document.getElementById('resumen-total-minutos');

    if (elRutinas && elMinutos) {
        elRutinas.textContent = totalRutinas;
        elMinutos.textContent = totalMinutos;
    }
};

// 2. FUNCIÓN PARA RENDERIZAR LA TABLA
const renderizarTabla = () => {
    actualizarResumen(); // Ahora sí la encuentra
    tablaBody.innerHTML = '';

    historialEntrenamientos.forEach(item => {
        const tr = document.createElement('tr');

        let fechaFormateada = item.fecha;
        try {
            const fechaObj = new Date(item.fecha + 'T00:00:00');
            fechaFormateada = fechaObj.toLocaleDateString('es-CL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });
            fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
        } catch (e) {
            console.error("Error al formatear fecha:", e);
        }

        tr.innerHTML = `
            <td class="ps-4">
                <div class="fw-bold text-name text-dark-fusion"></div>
                <small class="text-muted text-date"></small>
                <div class="badge bg-light text-dark border extra-info mt-1" style="font-size: 0.7rem"></div>
            </td>
            <td class="text-muted small text-dur align-middle"></td>
            <td class="text-center align-middle">
                <button class="btn btn-sm btn-outline-info btn-edit me-1" aria-label="Editar"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger btn-delete" aria-label="Eliminar"><i class="bi bi-trash"></i></button>
            </td>
        `;

        tr.querySelector('.text-name').textContent = item.actividad;
        tr.querySelector('.text-date').textContent = fechaFormateada; 
        tr.querySelector('.extra-info').textContent = `${item.categoria} | Int: ${item.intensidad}/10`;
        tr.querySelector('.text-dur').textContent = item.duracion;

        tr.querySelector('.btn-edit').onclick = () => cargarParaEditar(item.id);
        tr.querySelector('.btn-delete').onclick = () => confirmarEliminacion(item.id);

        tablaBody.appendChild(tr);
    });
};

// 3. FUNCIONES DE EDICIÓN Y ELIMINACIÓN
const cargarParaEditar = (id) => {
    const item = historialEntrenamientos.find(i => i.id === id);

    document.getElementById('reg-actividad').value = item.actividad;
    document.getElementById('reg-duracion').value = item.duracion;
    document.getElementById('reg-fecha').value = item.fecha;
    document.getElementById('reg-categoria').value = item.categoria;
    document.getElementById('reg-intensidad').value = item.intensidad;

    editandoID = id;
    btnGuardarReg.textContent = "Guardar Cambios";
    btnGuardarReg.className = "btn btn-warning btn-sm w-100 fw-bold shadow-sm rounded-pill py-2";

    document.getElementById('herramienta-registro').scrollIntoView({ behavior: 'smooth' });
};

// ==========================================
// 4.1. LÓGICA DE ELIMINACIÓN ESTILIZADA (PROMISES)
// ==========================================

// A. Función reutilizable que muestra el modal y devuelve una Promesa (Criterio 4)
const mostrarModalConfirmacion = () => {
    return new Promise((resolve) => {
        // 1. Obtener elementos
        const modalElement = document.getElementById('modal-confirmar-borrado');
        const btnAceptar = modalElement.querySelector('.btn-aceptar');
        const btnCancelar = modalElement.querySelector('.btn-cancelar');

        // 2. Crear la instancia de Bootstrap
        const bsModal = new bootstrap.Modal(modalElement);

        // 3. Manejar eventos de clics
        const alAceptar = () => {
            bsModal.hide();
            modalElement.removeEventListener('hidden.bs.modal', alCancelar); // Limpiar listener
            resolve(true); // Usuario quiere borrar
        };

        const alCancelar = () => {
            resolve(false); // Usuario canceló (clic en botón, X o fuera)
        };

        // Asignar clics únicos (se limpian solos al ocultar el modal por diseño de la Promesa)
        btnAceptar.onclick = alAceptar;
        
        // El evento de Bootstrap 'hidden.bs.modal' atrapa cualquier forma de cerrar
        modalElement.addEventListener('hidden.bs.modal', alCancelar, { once: true });

        // 4. Mostrar
        bsModal.show();
    });
};

// B. Función principal de eliminación actualizada (Criterio 3 - DOM Asíncrono)
const confirmarEliminacion = async (id) => {
    // 1. Llamamos a nuestra función personalizada y ESPERAMOS (await) la respuesta
    // La ejecución del código se detiene aquí hasta que el usuario decida
    const quiereBorrar = await mostrarModalConfirmacion();

    // 2. Actuamos según la decisión
    if (quiereBorrar) {
        // Proceder con el borrado en el arreglo
        historialEntrenamientos = historialEntrenamientos.filter(i => i.id !== id);
        // Actualizar la interfaz
        renderizarTabla();
    }
    // Si es false (quiereBorrar), no hacemos nada y el modal simplemente se cierra.
};

// 4. LÓGICA DE VALIDACIÓN Y GUARDADO
if (formRegistro) {
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputsInvalidos = formRegistro.querySelectorAll('.is-invalid');
        inputsInvalidos.forEach(input => input.classList.remove('is-invalid'));

        let hayErrores = false;

        const actInput = document.getElementById('reg-actividad');
        const durInput = document.getElementById('reg-duracion');
        const fecInput = document.getElementById('reg-fecha');
        const catInput = document.getElementById('reg-categoria');
        const intInput = document.getElementById('reg-intensidad');

        const act = actInput.value.trim();
        const dur = durInput.value.trim();
        const fec = fecInput.value;
        const cat = catInput.value;
        const int = parseInt(intInput.value);

        if (act.length < 3 || act.length > 40) {
            mostrarErrorInput('reg-actividad', 'Debe tener entre 3 y 40 caracteres.');
            hayErrores = true;
        }

        const durRegex = /^\d+\s?min$/;
        if (!durRegex.test(dur)) {
            mostrarErrorInput('reg-duracion', 'Formato: "30 min".');
            hayErrores = true;
        } else {
            const minNum = parseInt(dur);
            if (minNum <= 0 || minNum > 300) {
                mostrarErrorInput('reg-duracion', 'Máximo realista: 300 min.');
                hayErrores = true;
            }
        }

        if (!fec) {
            mostrarErrorInput('reg-fecha', 'Fecha obligatoria.');
            hayErrores = true;
        } else {
            const fechaIngresada = new Date(fec);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0); 
            if (fechaIngresada > hoy) {
                mostrarErrorInput('reg-fecha', 'No puedes registrar al futuro.');
                hayErrores = true;
            }
        }

        if (!cat) {
            mostrarErrorInput('reg-categoria', 'Selecciona una.');
            hayErrores = true;
        }

        if (!int || int < 1 || int > 10) {
            mostrarErrorInput('reg-intensidad', 'Valor de 1 a 10.');
            hayErrores = true;
        }

        if (hayErrores) return;

        if (editandoID) {
            const index = historialEntrenamientos.findIndex(i => i.id === editandoID);
            historialEntrenamientos[index] = { id: editandoID, actividad: act, duracion: dur, fecha: fec, categoria: cat, intensidad: int };
            editandoID = null;
            btnGuardarReg.textContent = "Añadir Registro";
            btnGuardarReg.className = "btn btn-primary btn-sm w-100 fw-bold shadow-sm rounded-pill py-2";
        } else {
            historialEntrenamientos.unshift({ id: Date.now(), actividad: act, duracion: dur, fecha: fec, categoria: cat, intensidad: int });
        }
        
        renderizarTabla();
        formRegistro.reset();
    });
}

// 5. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', renderizarTabla);