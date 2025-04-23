document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Aplicación cargada");

    // URLs Power Automate
    const powerAutomateURLClientes = "https://prod-149.westus.logic.azure.com:443/workflows/0a28acf883ca4529b03771e84ea63b0d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-G6U0yoXQONDakaHMXYQcimaqD0AMabpVnu3XRbmuFA";
    const powerAutomateURLProgramacion = "https://prod-140.westus.logic.azure.com:443/workflows/f790ef5ff20244ada2b103e43956af6f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=FVW_tnrfojAkn8ONoRxak0F59tRKfFogdpWCbbOK-iU";
    const powerAutomateURL = "https://prod-03.westus.logic.azure.com:443/workflows/87248192f53845e0b909f8b2af07682b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=MV6ELhNOOLXBSVOZP7686LZ0hfulVWbXKET8cbLdI2w";


    // Elementos comunes
    const btnGuardarProgramacion = document.getElementById("guardar-programacion");
    const mensajeEnvio = document.getElementById("mensaje-envio-programacion");
    const mensajeTexto = document.getElementById("mensaje-texto-programacion");
    const tablaProgramaciones = document.getElementById("tabla-programaciones");
    const btnAgregarTabla = document.getElementById("agregar-tabla");
    const refreshClientesBtn = document.getElementById("refresh-clientes");
    const selectClientes = document.getElementById("cliente");
    const mensajeClientes = document.getElementById("mensaje-clientes");
    const formulario = document.getElementById("cliente-form");
    const botonGuardar = document.getElementById("guardar-cliente");
    const toggleTablaBtn = document.getElementById("toggle-tabla");
    const tablaEditableContainer = document.getElementById("tabla-editable-container");
    const tablaEditableBody = document.querySelector("#tabla-editable tbody");
    const vistaFormulario = document.getElementById("vista-formulario");

    // 🔹 Navegación por menú
    const menuItems = document.querySelectorAll(".menu-option");
    const sections = document.querySelectorAll(".form-section");

    menuItems.forEach(item => {
        item.addEventListener("click", function () {
            menuItems.forEach(i => i.classList.remove("active"));
            this.classList.add("active");

            const targetId = this.getAttribute("data-target");
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.style.display = "block";
                } else {
                    section.style.display = "none";
                }
            });

            // Restaurar sub-vistas
            if (targetId === "crear-programacion") {
                vistaFormulario.style.display = "block";
                tablaEditableContainer.classList.add("oculto");
                toggleTablaBtn.innerText = "Ver vista tabla";
            } else {
                vistaFormulario.style.display = "none";
                tablaEditableContainer.classList.add("oculto");
            }
        });
    });

    // Mostrar vista inicial
    sections.forEach(s => s.style.display = "none");
    document.getElementById("crear-cliente").style.display = "block";

    // Cargar clientes
    async function cargarClientes() {
        mensajeClientes.innerText = "🔄 Cargando clientes...";
        mensajeClientes.style.color = "#f39c12";
        mensajeClientes.style.visibility = "visible";

        try {
            const res = await fetch(powerAutomateURLClientes);
            const datos = await res.json();
            const lista = datos.clientes.value || [];

            selectClientes.innerHTML = '<option value="">Seleccione un Cliente</option>';
            lista.map(c => c.Cliente).sort().forEach(nombre => {
                const opt = document.createElement("option");
                opt.textContent = nombre;
                opt.value = nombre;
                selectClientes.appendChild(opt);
            });

            mensajeClientes.innerText = `✅ ${lista.length} clientes cargados correctamente.`;
            mensajeClientes.style.color = "green";
        } catch {
            mensajeClientes.innerText = "❌ Error al cargar clientes.";
            mensajeClientes.style.color = "red";
        }

        setTimeout(() => mensajeClientes.style.visibility = "hidden", 3000);
    }

    refreshClientesBtn.addEventListener("click", cargarClientes);
    cargarClientes();

    // Agregar fila en vista formulario
    btnAgregarTabla.addEventListener("click", function () {
        const cliente = selectClientes.value;
        const tipo = document.getElementById("tipo-analisis").value;
        const cantidad = document.getElementById("cantidad").value;
        const mes = document.getElementById("mes").value;

        if (!cliente || !tipo || !cantidad || !mes) {
            alert("❌ Complete todos los campos.");
            return;
        }

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${cliente}</td>
            <td>${tipo}</td>
            <td>${cantidad}</td>
            <td>${mes}</td>
            <td><button class="btn-remover">Remover</button></td>`;
        tablaProgramaciones.appendChild(fila);

        fila.querySelector(".btn-remover").addEventListener("click", () => fila.remove());

        document.getElementById("cantidad").value = "";
        document.getElementById("mes").value = "";
    });

    // Alternar entre formulario y tabla editable
    toggleTablaBtn.addEventListener("click", () => {
        if (vistaFormulario.style.display !== "none") {
            vistaFormulario.style.display = "none";
            tablaEditableContainer.classList.remove("oculto");
            toggleTablaBtn.innerText = "Vista clásica";
            generarFilasTablaEditable();
        } else {
            vistaFormulario.style.display = "block";
            tablaEditableContainer.classList.add("oculto");
            toggleTablaBtn.innerText = "Ver vista tabla";
        }
    });

    function generarFilasTablaEditable() {
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const año = new Date().getFullYear();
        tablaEditableBody.innerHTML = "";

        for (let y = 0; y < 2; y++) {
            meses.forEach(mes => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${mes} ${año + y}</td>
                    <td contenteditable="true"></td>
                    <td contenteditable="true"></td>
                    <td contenteditable="true"></td>
                    <td contenteditable="true"></td>
                    <td contenteditable="true"></td>
                    <td contenteditable="true"></td>`;
                tablaEditableBody.appendChild(fila);
            });
        }
    }

const tablaEditable = document.getElementById("tabla-editable");

// Navegación con teclado
tablaEditable.addEventListener("keydown", function(e) {
    const celdas = Array.from(tablaEditable.querySelectorAll("td[contenteditable='true']"));
    const index = celdas.indexOf(document.activeElement);
    const cols = 6; // número de columnas editables por fila

    if (index >= 0) {
        let nextIndex = null;
        switch (e.key) {
            
            case "ArrowDown":
                nextIndex = index + cols;
                break;
            case "ArrowUp":
                nextIndex = index - cols;
                break;
            case "Enter":
                e.preventDefault();
                nextIndex = index + cols;
                break;
        }

        if (nextIndex !== null && nextIndex >= 0 && nextIndex < celdas.length) {
            e.preventDefault();
            celdas[nextIndex].focus();
        }
    }
});

// Validar solo números positivos
tablaEditable.addEventListener("beforeinput", function(e) {
    if (
        e.target.matches("td[contenteditable='true']") &&
        e.data &&
        /[^0-9]/.test(e.data)
    ) {
        e.preventDefault(); // bloquea letras, negativos, espacios, etc.
    }
});


    // Guardar programación
    btnGuardarProgramacion.addEventListener("click", async function () {
        const usandoTabla = !tablaEditableContainer.classList.contains("oculto");
        const cliente = selectClientes.value;
        let programaciones = [];

        if (!cliente) {
            alert("❌ Selecciona un cliente.");
            return;
        }

        if (usandoTabla) {
            const filas = document.querySelectorAll("#tabla-editable tbody tr");
            const tipos = ["Foliares", "Suelo", "SS", "Fruto", "No Agritec", "Autoconsumo"];
            filas.forEach(fila => {
                const celdas = fila.querySelectorAll("td");
                const mes = celdas[0].innerText;
                tipos.forEach((tipo, i) => {
                    const val = celdas[i + 1].innerText.trim();
                    if (val && !isNaN(val) && parseInt(val) > 0) {
                        programaciones.push({ Cliente: cliente, Tipo: tipo, Cantidad: parseInt(val), Mes: mes });
                    }
                });
            });
        } else {
            const filas = tablaProgramaciones.querySelectorAll("tr");
            filas.forEach(fila => {
                const cols = fila.querySelectorAll("td");
                programaciones.push({
                    Cliente: cols[0].innerText,
                    Tipo: cols[1].innerText,
                    Cantidad: parseInt(cols[2].innerText),
                    Mes: cols[3].innerText
                });
            });
        }

        if (programaciones.length === 0) {
            alert("❌ No hay datos válidos para enviar.");
            return;
        }

        mensajeEnvio.classList.remove("oculto");
        mensajeTexto.innerText = "🔄 Enviando programación...";
        btnGuardarProgramacion.disabled = true;

        try {
            const res = await fetch(powerAutomateURLProgramacion, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ programaciones })
            });

            if (res.ok) {
                mensajeTexto.innerText = "✅ Programación enviada correctamente.";
                setTimeout(() => {
                    mensajeEnvio.classList.add("oculto");
                    tablaProgramaciones.innerHTML = "";
                    document.querySelectorAll("#tabla-editable td[contenteditable]").forEach(c => c.innerText = "");
                }, 2000);
            } else {
                mensajeTexto.innerText = "❌ Error al enviar la programación.";
            }
        } catch {
            mensajeTexto.innerText = "❌ No se pudo conectar.";
        } finally {
            btnGuardarProgramacion.disabled = false;
        }
    });
    // ============================
// 🔹 Generar Dropdown de Meses para Formulario
// ============================
const selectMes = document.getElementById("mes");
selectMes.innerHTML = ""; // Limpiar

const añoActual = new Date().getFullYear();
for (let y = 0; y < 2; y++) {
    ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].forEach(mes => {
        const option = document.createElement("option");
        option.value = `${mes} ${añoActual + y}`;
        option.textContent = `${mes} ${añoActual + y}`;
        selectMes.appendChild(option);
    });
}

});
