document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Script de Actividades Cargado");

    // 📌 URLs de Power Automate
    const powerAutomateURLClientes = "https://prod-149.westus.logic.azure.com:443/workflows/0a28acf883ca4529b03771e84ea63b0d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-G6U0yoXQONDakaHMXYQcimaqD0AMabpVnu3XRbmuFA";
    const powerAutomateURLActividades = "https://prod-93.westus.logic.azure.com:443/workflows/6dbd45b81de0476686ebed433e874985/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZyXoM51G4MucYgK6WmwzFVmWU37XYbCq9Uemct2Wa_k"; 

    // 📌 Elementos del DOM
    const btnGuardarActividad = document.getElementById("guardar-actividad");
    const btnAgregarActividad = document.getElementById("agregar-actividad");
    const mensajeEnvioActividad = document.getElementById("mensaje-envio-actividad");
    const mensajeTextoActividad = document.getElementById("mensaje-texto-actividad");
    const tablaActividades = document.getElementById("tabla-actividades");
    const selectClientesActividad = document.getElementById("cliente-actividad");
    const refreshClientesBtnActividad = document.getElementById("refresh-clientes-actividad");
    const mensajeClientesActividad = document.getElementById("mensaje-clientes-actividad");

    // 🔹 Función para Cargar Clientes en el Dropdown
    async function cargarClientesActividad() {
        if (!selectClientesActividad) {
            console.error("❌ No se encontró el select de clientes en el DOM.");
            return;
        }

        mensajeClientesActividad.innerText = "🔄 Cargando clientes...";
        mensajeClientesActividad.style.color = "#f39c12"; // Amarillo

        try {
            let respuesta = await fetch(powerAutomateURLClientes);
            let datos = await respuesta.json();

            // 📌 Verificar que la respuesta tiene la estructura esperada
            if (!datos.clientes || !Array.isArray(datos.clientes.value)) {
                throw new Error("La respuesta no tiene la estructura esperada.");
            }

            let clientes = datos.clientes.value.map(cliente => cliente["Cliente"]);
            clientes.sort((a, b) => a.localeCompare(b)); // Ordenar alfabéticamente

            // 📌 Limpiar y agregar una opción por defecto
            selectClientesActividad.innerHTML = '<option value="">Seleccione un Cliente</option>';
            clientes.forEach(nombre => {
                let option = document.createElement("option");
                option.textContent = nombre;
                option.value = nombre;
                selectClientesActividad.appendChild(option);
            });

            // 📌 Mostrar mensaje de éxito
            mensajeClientesActividad.innerText = `✅ ${clientes.length} clientes cargados correctamente.`;
            mensajeClientesActividad.style.color = "green";
        } catch (error) {
            console.error("❌ Error al cargar clientes:", error);
            mensajeClientesActividad.innerText = "❌ Error al cargar clientes.";
            mensajeClientesActividad.style.color = "red";
        }

        // 🔹 Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
            mensajeClientesActividad.innerText = "";
        }, 3000);
    }

    // 📌 Ejecutar la carga de clientes al iniciar la página
    cargarClientesActividad();

    // 📌 Evento para refrescar clientes con el botón 🔄
    refreshClientesBtnActividad.addEventListener("click", function () {
        console.log("🔄 Refrescando clientes...");
        cargarClientesActividad();
    });

    // ============================
    // 🔹 Agregar Actividad a la Tabla
    // ============================
    btnAgregarActividad.addEventListener("click", function () {
        const cliente = selectClientesActividad.value;
        const tipoMuestra = document.getElementById("tipo-muestra").value; // ✅ Se corrigió el ID aquí
        const cantidad = document.getElementById("cantidad-actividad").value;
        const fecha = document.getElementById("fecha-ejecucion").value;
        const mes = document.getElementById("mes-actividad").value;

        if (!cliente || !tipoMuestra || !cantidad || !fecha || !mes) {
            alert("❌ Complete todos los campos antes de agregar.");
            return;
        }

        let nuevaFila = document.createElement("tr");
        nuevaFila.innerHTML = `
            <td>${cliente}</td>
            <td>${tipoMuestra}</td>
            <td>${cantidad}</td>
            <td>${fecha}</td>
            <td>${mes}</td>
            <td class="acciones-columna">
                <button class="btn-remover">Remover</button>
            </td>
        `;

        tablaActividades.appendChild(nuevaFila);

        // 📌 Agregar evento al botón de eliminar fila
        nuevaFila.querySelector(".btn-remover").addEventListener("click", function () {
            nuevaFila.remove();
        });
    });

    // ============================
    // 🔹 Enviar Actividades a Power Automate
    // ============================

    btnGuardarActividad.addEventListener("click", async function () {
        console.log("✅ Botón 'Guardar Actividad' clickeado");

        let filas = tablaActividades.querySelectorAll("tr");
        if (filas.length === 0) {
            alert("❌ No hay actividades en la tabla para enviar.");
            return;
        }

        // 🔹 Bloquear el botón y mostrar el spinner
        btnGuardarActividad.disabled = true;
        mensajeEnvioActividad.classList.remove("oculto");
        mensajeTextoActividad.innerText = "🔄 Enviando actividad...";

        // 🔹 Construcción del JSON con los datos de la tabla
        let actividades = [];
        filas.forEach(fila => {
            let columnas = fila.querySelectorAll("td");
            let actividad = {
                Cliente: columnas[0].innerText,  
                Tipo: columnas[1].innerText,     
                Cantidad: parseInt(columnas[2].innerText), 
                Fecha: columnas[3].innerText,  // 📌 Ya viene formateada desde Power Automate
                Mes: columnas[4].innerText       
            };
            actividades.push(actividad);
        });

        console.log("📌 JSON a enviar:", JSON.stringify({ actividades }));

        // 🔹 Enviar datos a Power Automate
        try {
            let respuesta = await fetch(powerAutomateURLActividades, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actividades })
            });

            if (respuesta.ok) {
                console.log("✅ Actividad enviada con éxito.");
                mensajeTextoActividad.innerText = "✅ Actividad enviada correctamente.";

                // 🔹 Limpiar la tabla después de 2 segundos
                setTimeout(() => {
                    mensajeEnvioActividad.classList.add("oculto");
                    tablaActividades.innerHTML = "";
                }, 2000);
            } else {
                let errorText = await respuesta.text();
                console.error("❌ Error en Power Automate:", errorText);
                mensajeTextoActividad.innerText = "❌ Error al enviar la actividad.";
                setTimeout(() => mensajeEnvioActividad.classList.add("oculto"), 2000);
            }
        } catch (error) {
            console.error("❌ Error de conexión:", error);
            mensajeTextoActividad.innerText = "❌ No se pudo conectar con Power Automate.";
            setTimeout(() => mensajeEnvioActividad.classList.add("oculto"), 2000);
        } finally {
            // 🔹 Rehabilitar el botón después de 2 segundos
            setTimeout(() => { btnGuardarActividad.disabled = false; }, 2000);
        }
    });


});
