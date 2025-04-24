document.addEventListener("DOMContentLoaded", () => {
    const usuarioRegistrado = JSON.parse(localStorage.getItem("usuario"));
    const loginBtn = document.getElementById('login-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const userName = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    const principalBtn = document.getElementById('boton-principal');
    const tipoCuenta = usuarioRegistrado?.tipo_usuario;

    const estaEnPerfil = document.body.dataset.miPerfil === "true";

    if (usuarioRegistrado) {
        loginBtn.style.display = 'none';
        userDropdown.style.display = 'block';
        userName.textContent = usuarioRegistrado.nombre;
    
        // Si estamos en la página de perfil, resaltar el nombre
        if (document.body.dataset.miPerfil === "true") {
            userName.style.fontWeight = "bold";
        }
    }

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
