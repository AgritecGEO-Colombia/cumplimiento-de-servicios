document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Aplicación cargada");

    // 📌 URLs de Power Automate
    const powerAutomateURLClientes = "https://prod-149.westus.logic.azure.com:443/workflows/0a28acf883ca4529b03771e84ea63b0d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-G6U0yoXQONDakaHMXYQcimaqD0AMabpVnu3XRbmuFA";
    const powerAutomateURLProgramacion = "https://prod-140.westus.logic.azure.com:443/workflows/f790ef5ff20244ada2b103e43956af6f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=FVW_tnrfojAkn8ONoRxak0F59tRKfFogdpWCbbOK-iU";
    const powerAutomateURL = "https://prod-03.westus.logic.azure.com:443/workflows/87248192f53845e0b909f8b2af07682b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=MV6ELhNOOLXBSVOZP7686LZ0hfulVWbXKET8cbLdI2w";

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
    

    // ============================
    // 🔹 Manejo de Secciones del Menú
    // ============================
    const menuItems = document.querySelectorAll(".menu-option");
    const sections = document.querySelectorAll(".form-section");

    menuItems.forEach(item => {
        item.addEventListener("click", function () {
            menuItems.forEach(i => i.classList.remove("active"));
            this.classList.add("active");

            const targetId = this.getAttribute("data-target");
            sections.forEach(section => {
                section.style.display = "none";
                if (section.id === targetId) {
                    section.style.display = "block";
                }
            });
        });
    });

    // Mostrar la primera sección por defecto
    if (sections.length > 0) {
        sections.forEach(section => section.style.display = "none");
        document.getElementById("crear-cliente").style.display = "block";
    }

    // ============================
    // 🔹 Cargar Clientes desde Power Automate
    // ============================
    async function cargarClientes() {
        mensajeClientes.style.opacity = "1"; 
        mensajeClientes.style.visibility = "visible";
        mensajeClientes.innerText = "🔄 Cargando clientes...";
        mensajeClientes.style.color = "#f39c12"; // Amarillo

        try {
            let respuesta = await fetch(powerAutomateURLClientes);
            let datos = await respuesta.json();

            if (!datos.clientes || !Array.isArray(datos.clientes.value)) {
                throw new Error("La respuesta no tiene la estructura esperada.");
            }

            let clientes = datos.clientes.value.map(cliente => cliente["Cliente"]);
            clientes.sort((a, b) => a.localeCompare(b));

            selectClientes.innerHTML = '<option value="">Seleccione un Cliente</option>';
            clientes.forEach(nombre => {
                let option = document.createElement("option");
                option.textContent = nombre;
                option.value = nombre;
                selectClientes.appendChild(option);
            });

            mensajeClientes.innerText = `✅ ${clientes.length} clientes cargados correctamente.`;
            mensajeClientes.style.color = "green";
        } catch (error) {
            console.error("❌ Error al cargar clientes:", error);
            mensajeClientes.innerText = "❌ Error al cargar clientes.";
            mensajeClientes.style.color = "red";
        }

        setTimeout(() => {
            mensajeClientes.style.opacity = "0";
            setTimeout(() => {
                mensajeClientes.style.visibility = "hidden";
            }, 500);
        }, 3000);
    }

    // Sincronizar clientes cuando el usuario haga clic en "🔄"
    refreshClientesBtn.addEventListener("click", cargarClientes);
    cargarClientes(); // Cargar clientes automáticamente al inicio

    // ============================
    // 🔹 Agregar Programaciones a la Tabla
    // ============================
    btnAgregarTabla.addEventListener("click", function () {
        const clienteSeleccionado = document.getElementById("cliente").value;
        const tipoMuestra = document.getElementById("tipo-analisis").value;
        const cantidadMuestras = document.getElementById("cantidad").value;
        const mesProgramacion = document.getElementById("mes").value;

        if (!clienteSeleccionado || !tipoMuestra || !cantidadMuestras || !mesProgramacion) {
            alert("❌ Por favor complete todos los campos antes de agregar.");
            return;
        }

        let nuevaFila = document.createElement("tr");
        nuevaFila.innerHTML = `
            <td style="text-align: left;">${clienteSeleccionado}</td>
            <td style="text-align: center;">${tipoMuestra}</td>
            <td style="text-align: center;">${cantidadMuestras}</td>
            <td style="text-align: center;">${mesProgramacion}</td>
            <td class="acciones-columna">
                <button class="btn-remover">Remover</button>
            </td>
        `;

        tablaProgramaciones.appendChild(nuevaFila);

        document.getElementById("cantidad").value = "";
        document.getElementById("mes").value = "";

        nuevaFila.querySelector(".btn-remover").addEventListener("click", function () {
            nuevaFila.remove();
        });
    });


formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    // 🔹 Bloquear el botón y mostrar el spinner
    botonGuardar.disabled = true;
    botonGuardar.innerText = "Enviando...";
    mensajeEnvio.classList.remove("oculto");
    mensajeTexto.innerText = "🔄 Enviando datos...";

    let codigoSAP = document.getElementById("codigo-sap").value.trim();
    let nombreCliente = document.getElementById("nombre-cliente").value.trim();
    let responsableZona = document.getElementById("responsable-zona").value.trim();

    // 📌 Validar que los campos no estén vacíos antes de continuar
    if (!codigoSAP || !nombreCliente || !responsableZona) {
        mensajeTexto.innerText = "❌ Todos los campos son obligatorios.";
        setTimeout(() => mensajeEnvio.classList.add("oculto"), 2000);
        botonGuardar.disabled = false;
        botonGuardar.innerText = "Guardar Cliente";
        return;
    }

    let datosCliente = { codigoSAP, nombreCliente, responsableZona };

    console.log("📌 Datos capturados:", datosCliente);

    try {
        let respuesta = await fetch(powerAutomateURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosCliente)
        });

        if (!respuesta.ok) {
            mensajeTexto.innerText = `❌ Error al enviar los datos.`;
            setTimeout(() => mensajeEnvio.classList.add("oculto"), 3000);
            return;
        }

        // ✅ Si todo fue exitoso
        mensajeTexto.innerText = "✅ Cliente registrado exitosamente!";
        
        // 🔹 Esperar 2 segundos y ocultar mensaje
        setTimeout(() => {
            mensajeEnvio.classList.add("oculto");
            formulario.reset();

            // ✅ 🔹 Mostrar Alerta del Navegador
            alert("✅ Cliente registrado correctamente.");
        }, 2000);

    } catch (error) {
        console.error("❌ Error de conexión con Power Automate:", error);
        mensajeTexto.innerText = "❌ No se pudo conectar con el servidor.";
        setTimeout(() => mensajeEnvio.classList.add("oculto"), 3000);
    } finally {
        botonGuardar.disabled = false;
        botonGuardar.innerText = "Guardar Cliente";
    }
});






async function verificarClienteExistente(codigoSAP) {
    if (!codigoSAP) {
        console.error("❌ Error: código SAP no proporcionado.");
        return false;
    }

    let urlVerificacion = `${powerAutomateURL}?check=true&codigoSAP=${encodeURIComponent(codigoSAP)}`;

    try {
        let respuesta = await fetch(urlVerificacion, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!respuesta.ok) {
            console.error(`❌ Error HTTP ${respuesta.status}: No se pudo verificar el cliente.`);
            return false;
        }

        let datos = await respuesta.json();

        // Validar que la respuesta tiene la estructura esperada
        if (typeof datos.existe !== "boolean") {
            console.error("❌ Respuesta inválida de Power Automate:", datos);
            return false;
        }

        console.log(`✅ Cliente encontrado: ${datos.existe}`);
        return datos.existe;

    } catch (error) {
        console.error("❌ Error verificando el cliente:", error);
        return false;
    }
}






    // ============================
    // 🔹 Enviar Programaciones a Power Automate
    // ============================
    btnGuardarProgramacion.addEventListener("click", async function () {
        console.log("✅ Botón 'Guardar Programación' clickeado");

        let filas = tablaProgramaciones.querySelectorAll("tr");
        if (filas.length === 0) {
            alert("❌ No hay programaciones en la tabla para enviar.");
            return;
        }

        btnGuardarProgramacion.disabled = true;
        mensajeEnvio.classList.remove("oculto");
        mensajeTexto.innerText = "🔄 Enviando programación...";

        let programaciones = [];
        filas.forEach(fila => {
            let columnas = fila.querySelectorAll("td");
            let programacion = {
                Cliente: columnas[0].innerText,  
                Tipo: columnas[1].innerText,     
                Cantidad: parseInt(columnas[2].innerText), 
                Mes: columnas[3].innerText       
            };
            programaciones.push(programacion);
        });

        console.log("📌 JSON a enviar:", JSON.stringify({ programaciones }));

        try {
            let respuesta = await fetch(powerAutomateURLProgramacion, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ programaciones })
            });

            if (respuesta.ok) {
                console.log("✅ Programación enviada con éxito.");
                mensajeTexto.innerText = "✅ Programación enviada correctamente.";

                setTimeout(() => {
                    mensajeEnvio.classList.add("oculto");
                    tablaProgramaciones.innerHTML = "";
                }, 2000);
            } else {
                let errorText = await respuesta.text();
                console.error("❌ Error en Power Automate:", errorText);
                mensajeTexto.innerText = "❌ Error al enviar la programación.";
                setTimeout(() => mensajeEnvio.classList.add("oculto"), 2000);
            }
        } catch (error) {
            console.error("❌ Error de conexión:", error);
            mensajeTexto.innerText = "❌ No se pudo conectar con Power Automate.";
            setTimeout(() => mensajeEnvio.classList.add("oculto"), 2000);
        } finally {
            setTimeout(() => { btnGuardarProgramacion.disabled = false; }, 2000);
        }
    });
});
