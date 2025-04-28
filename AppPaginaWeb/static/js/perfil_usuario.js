document.addEventListener("DOMContentLoaded", async () => {
    // Configuración inicial
    const appData = document.getElementById("app-data");
    const tipoUsuarioCapitalice = "";
    const config = {
        defaultProfileImage: appData ? appData.getAttribute('data-default-image') : '/static/img/default_profile.avif',
        endpoints: {
            negocio: '/mi_perfil/negocios/',
            usuario: '/mi_perfil/usuario/'
        }
    };

    // Elementos del DOM
    const elements = {
        fotoPerfil: document.getElementById("foto-perfil"),
        nombreCompleto: document.getElementById("nombre-completo"),
        username: document.getElementById("username"),
        infoExtra: document.getElementById("info-extra"),
        verFavoritosBtn: document.getElementById("ver-favoritos"),
        editarPerfilBtn: document.getElementById("editar-perfil")
    };

    // Verificar que todos los elementos existen
    if (!elements.fotoPerfil || !elements.nombreCompleto || !elements.username || !elements.infoExtra) {
        return;
    }

    // Obtener datos del usuario desde localStorage
    const userData = JSON.parse(localStorage.getItem("usuario"));
    if (!userData) {
        elements.infoExtra.innerHTML = `
            <div class="alert alert-warning">
                No se encontró información de usuario. Por favor, inicie sesión.
            </div>
        `;
        return;
    }

    // Cargar datos del perfil
    async function cargarPerfil() {
        try {
            const { nombre_usuario: username, tipo_usuario: tipoUsuario } = userData;
            const apiUrl = tipoUsuario === "negocio" 
                ? `${config.endpoints.negocio}${username}/`
                : `${config.endpoints.usuario}${username}/`;

            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            const data = await response.json();
            mostrarDatosPerfil(data, tipoUsuario);
        } catch (error) {
            elements.infoExtra.innerHTML = `
                <div class="alert alert-danger">
                    Error al cargar los datos del perfil. Por favor, intente nuevamente.
                </div>
            `;
        }
    }
    // Mostrar datos en el perfil
    function mostrarDatosPerfil(data, tipoUsuario) {
        // Datos básicos
        elements.nombreCompleto.textContent = data.nombre || "Sin nombre";
        elements.username.textContent = `@${data.nombre_usuario}`;
        elements.fotoPerfil.src = data.foto_perfil || config.defaultProfileImage;
    
        // Información adicional según tipo de usuario
        let htmlInfo = '';
        let tipoUsuarioCapitalice = '';
    
        if (tipoUsuario === "negocio") {
            htmlInfo += `
                <p><i class="bi bi-shop me-2 text-primary"></i><strong>Nombre comercial:</strong> ${data.nombre}</p>
                <p><i class="bi bi-geo-alt-fill me-2 text-primary"></i><strong>Dirección:</strong> ${data.direccion || "No especificada"}</p>
                <p><i class="bi bi-info-circle-fill me-2 text-primary"></i><strong>Descripción:</strong> ${data.descripcion || "Sin descripción"}</p>
            `;
            tipoUsuarioCapitalice = "Negocio";
        } else {
            htmlInfo += `<p><i class="bi bi-person-fill me-2 text-primary"></i><strong>Nombre:</strong> ${data.nombre}</p>`;
            tipoUsuarioCapitalice = "Usuario";
        }
    
        htmlInfo += `<p><i class="bi bi-person-badge-fill me-2 text-primary"></i><strong>Tipo de usuario:</strong> ${tipoUsuarioCapitalice}</p>`;
        elements.infoExtra.innerHTML = htmlInfo;
    }
    // Iniciar carga del perfil
    cargarPerfil();
});