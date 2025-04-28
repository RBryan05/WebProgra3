document.addEventListener("DOMContentLoaded", () => {
    const usuarioRegistrado = JSON.parse(localStorage.getItem("usuario"));
    const loginBtn = document.getElementById('login-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const userName = document.getElementById('user-name');
    const userProfileImg = document.getElementById('user-profile-img');
    const defaultProfileImg = document.getElementById('default-profile-img');
    const logoutBtn = document.getElementById('logout-btn');
    const principalBtn = document.getElementById('boton-principal');
    const tipoCuenta = usuarioRegistrado?.tipo_usuario;
    const fotoEditada = localStorage.getItem("imagenPerfil");

    const estaEnPerfil = document.body.dataset.miPerfil === "true";

    if (usuarioRegistrado) {
        loginBtn.style.display = 'none';
        userDropdown.style.display = 'block';
        userName.textContent = usuarioRegistrado.nombre;

        // Establecer imagen de perfil (usar imagen por defecto si no hay)
        userProfileImg.src = fotoEditada || usuarioRegistrado.foto_perfil || defaultProfileImg.src;

        // Si estamos en la página de perfil, resaltar el nombre
        if (estaEnPerfil) {
            userName.style.fontWeight = "bold";
        }
    }

    // Resto del código existente...
    if (tipoCuenta) {
        if (tipoCuenta === "negocio") {
            principalBtn.addEventListener('click', function () {
                window.location.href = principalBtn.dataset.negocioUrl;
            });
        } else if (tipoCuenta === "normal") {
            principalBtn.addEventListener('click', function () {
                window.location.href = principalBtn.dataset.usuarioUrl;
            });
        }
    } else {
        principalBtn.addEventListener('click', function () {
            window.location.href = principalBtn.dataset.loginUrl;
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem("usuario");
            window.location.href = logoutBtn.dataset.logoutUrl;
        });
    }
});