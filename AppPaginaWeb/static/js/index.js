document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (usuario) {
            // Asegúrate de que el nombre de usuario esté correctamente asignado
            document.getElementById("nombre-usuario").textContent = "¡Bienvenido, " + usuario.nombre;
        } else {
            document.getElementById("nombre-usuario").textContent = "¡Por favor inicie sesión para continuar.";
        }
});