# 🤖 Documentación de Apoyo con Inteligencia Artificial

El desarrollo de este proyecto integró herramientas de IA (Gemini) como asistente de ingeniería ("Pair Programming") enfocado en la refactorización, seguridad y optimización del código base, cumpliendo con los requerimientos de la Sumativa 2.

### 1. Refactorización a Máquina de Estados (Temporizador)
* **Contexto:** El temporizador inicial era estático y no utilizaba estructuras de datos complejas.
* **Prompt Utilizado:** *"el temporizador tiene poca presencia y los tiempos son muy cortos, que podemos hacer para que la seccion sea mas completa y cumpla con los requerimientos de la rubrica?"*
* **Mejora Aplicada:** La IA sugirió refactorizar el código lineal hacia una máquina de estados utilizando un objeto con arreglos `rutinasHipopresivas = { principiante: [...], avanzado: [...] }`. Se optimizó la lectura de datos y se hizo el temporizador 100% dinámico.

### 2. Generación de Validaciones Complejas y UX
* **Contexto:** Las validaciones utilizaban la función nativa `alert()`, rompiendo el flujo de UX y las variables no tenían topes lógicos.
* **Prompt Utilizado:** *"tenemos que poner limite superior... quiero empezar a pulir detalles como los alert que aparecen con un numero en vez de un titulo... cambiemoslo por un recuadro como el que se estaba mostrando anteriormente pero con nuestro diseño."*
* **Mejora Aplicada:** Se reemplazó el `alert()` por validación en línea (Inline Validation) inyectando divs `.invalid-feedback` de Bootstrap dinámicamente. Se generaron expresiones regulares (`/^\d+\s?min$/`) y validaciones de límites de rango seguro para peso (30-300kg) y fechas (impidiendo registros futuros).

### 3. Modales Asíncronos (Refactorización Avanzada)
* **Contexto:** Se necesitaba una confirmación segura antes de ejecutar la acción "Delete" del CRUD, pero el `confirm()` nativo es bloqueante.
* **Prompt Utilizado:** *"encontre un alert feo, creo que en este caso si amerita alert porque es la confirmacion de la eliminacion pero hagamoslo en nuestro estilo."*
* **Mejora Aplicada:** La IA guió la implementación de un Modal personalizado de Bootstrap controlado a través de una `Promise` de JavaScript, pausando la ejecución con `await` hasta que el usuario resuelve la promesa (Aceptar/Cancelar), demostrando manejo avanzado del DOM y asincronía.