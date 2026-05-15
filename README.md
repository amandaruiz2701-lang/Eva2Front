# 🌸 OrquideaFit - Herramientas de Salud y Bienestar

Aplicación web funcional desarrollada para la gestión de datos biométricos y rutinas de entrenamiento. Este proyecto aplica conceptos avanzados de JavaScript (ES6+), manipulación dinámica del DOM, estructuras de datos (arreglos de objetos) y prevención de vulnerabilidades web (XSS).

---

## 🚀 Funcionalidades Principales

1. **Calculadora de Gasto Energético (TDEE):**
   - Implementa la fórmula de Mifflin-St Jeor con ajuste biológico (sexo).
   - Manipulación del DOM para validación en línea (Inline Feedback) evitando recargas.
   - Cálculos dinámicos de superávit/déficit calórico basados en porcentajes.

2. **Temporizador de Hipopresivos (Máquina de Estados):**
   - Temporizador dinámico basado en un arreglo de objetos multidimensional para manejar la dificultad (Principiante, Intermedio, Avanzado).
   - Animación de barra de progreso matemática calculada en tiempo real.
   - Sincronización de UI con lógica JavaScript mediante `setInterval` y manejo de eventos.

3. **Registro Diario de Actividad (CRUD Avanzado):**
   - Sistema de registro (Create, Read, Update, Delete) utilizando un arreglo de objetos como estado central.
   - Mini-Dashboard dinámico que calcula totales utilizando el método `.reduce()`.
   - Modales asíncronos mediante `Promises` (async/await) para confirmar eliminaciones sin bloquear el hilo de ejecución principal.
   - Sanitización de entradas (prevención XSS) y formateo de fechas.

---

## 🛠️ Tecnologías Utilizadas
* **HTML5:** Semántica y accesibilidad (WCAG).
* **CSS3:** Framework Bootstrap 5, variables CSS customizadas y diseño responsivo (Mobile-First).
* **JavaScript (Vanilla):** Lógica funcional, manipulación del DOM, Regex y Promesas.

---

## 📄 Anexos
* Revisa el archivo `USO_IA.md` incluido en este repositorio para ver el detalle de la integración de Inteligencia Artificial en el desarrollo y refactorización del código.

---

## 👩‍💻 Autora
**Amanda Ruiz Zamorano** Estudiante de Ingeniería en Informática | INACAP