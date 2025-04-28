document.addEventListener("DOMContentLoaded", () => {
    const script = document.getElementById("registro-script");

    const usuarioUrl = script.getAttribute("data-url-usuario");
    const negocioUrl = script.getAttribute("data-url-negocio");
    const redirectNegocio = script.getAttribute("data-redirect-negocio");
    const redirectUsuario = script.getAttribute("data-redirect-usuario");

    const form = document.getElementById("register-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nombre = document.getElementById('name').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const accountType = document.getElementById('account-type').value;
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const errorBox = document.getElementById('error-message');

        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        const datos = {
            nombre_usuario: username,
            nombre: nombre,
            password: password,
        };

        try {
            let url = accountType === 'negocio' ? negocioUrl : usuarioUrl;

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
                alert("Usuario registrado exitosamente");
                errorBox.textContent = "";

                // Guardar en localStorage
                localStorage.setItem("usuario", JSON.stringify({
                    id: encontrado.id,
                    nombre_usuario: encontrado.nombre_usuario,
                    nombre: encontrado.nombre,
                    direccion: encontrado.direccion,
                    telefono: encontrado.telefono,
                    descripcion: encontrado.descripcion,
                    foto_perfil: encontrado.foto_perfil,
                    tipo_usuario: encontrado.tipo_usuario
                  }));
                localStorage.setItem("usuarioLogeado", JSON.stringify({
                    nombre_usuario: encontrado.nombre_usuario,  // Mantenemos el nombre de usuario
                    id: encontrado.id || null,                  // Añadimos el ID
                    foto_perfil: encontrado.foto_perfil || null, // Añadimos la imagen de perfil
                  }));

                // Redirigir según tipo de cuenta
                if (accountType === 'negocio') {
                    window.location.href = redirectNegocio;
                } else if (accountType === 'usuario') {
                    window.location.href = redirectUsuario;
                }
            } else {
                errorBox.textContent = data.error || "Error al registrar el usuario.";
            }
        } catch (error) {
            alert("Hubo un problema al registrar el usuario.");
        }
    });
});
