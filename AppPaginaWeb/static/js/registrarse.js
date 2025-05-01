document.addEventListener("DOMContentLoaded", () => {
    const script = document.getElementById("registro-script");
    const form = document.getElementById("register-form");

    // Verifica que el script y el form existan
    if (!script || !form) {
        console.error("Elementos esenciales no encontrados");
        return;
    }

    // Obtener URLs desde los data attributes
    const usuarioUrl = script.getAttribute("data-url-usuario");
    const negocioUrl = script.getAttribute("data-url-negocio");
    const redirectNegocio = script.getAttribute("data-redirect-negocio");
    const redirectUsuario = script.getAttribute("data-redirect-usuario");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Obtener valores del formulario
        const nombre = document.getElementById('name').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const accountType = document.getElementById('account-type').value;
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const errorBox = document.getElementById('error-message');

        // Validación básica
        if (password !== confirmPassword) {
            errorBox.textContent = "Las contraseñas no coinciden.";
            return;
        }

        const datos = {
            nombre_usuario: username,
            nombre: nombre,
            password: password,
        };

        try {
            const url = accountType === 'negocio' ? negocioUrl : usuarioUrl;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(datos)
            });

            const data = await response.json();

            if (response.ok) {
                // Limpiar mensajes de error
                errorBox.textContent = "";
                
                // Guardar datos en localStorage
                localStorage.setItem("usuario", JSON.stringify({
                    id: data.id,
                    nombre_usuario: data.nombre_usuario,
                    nombre: data.nombre,
                    tipo_usuario: data.tipo_usuario
                }));
                
                localStorage.setItem("usuarioLogeado", JSON.stringify({
                    nombre_usuario: data.nombre_usuario,
                    id: data.id,
                    tipo_usuario: data.tipo_usuario
                }));

                // Redirección - IMPORTANTE: Verifica las URLs
                window.location.href = accountType === 'negocio' ? redirectNegocio : redirectUsuario;
                
            } else {
                // Mostrar error devuelto por el servidor
                errorBox.textContent = data.error || "Error al registrar el usuario.";
            }
        } catch (error) {
            console.error("Error en el registro:", error);
            errorBox.textContent = "Hubo un problema al conectar con el servidor.";
        }
    });
});