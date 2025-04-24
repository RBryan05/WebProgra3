document.addEventListener("DOMContentLoaded", () => {
  const script = document.getElementById("login-script");

  if (!script) {
    return;
  }

  const usuariosUrl = script.getAttribute("data-usuarios-url");
  const negociosUrl = script.getAttribute("data-negocios-url");
  const redirectUsuario = script.getAttribute("data-redirect-usuario");
  const redirectNegocio = script.getAttribute("data-redirect-negocio");

  const form = document.getElementById("login-form");
  const errorMsg = document.getElementById("login-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const accountType = document.getElementById("account-type").value;

    if (!accountType) {
      mostrarError("Por favor selecciona un tipo de cuenta.");
      return;
    }

    const url = accountType === "usuario" ? usuariosUrl : negociosUrl;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Respuesta inválida del servidor");
        return res.json();
      })
      .then(data => {
        const lista = accountType === "usuario" ? data.usuarios : data.negocios;
        const encontrado = lista.find(item => item.nombre_usuario === username);

        if (encontrado && encontrado.password === password) {
          localStorage.setItem("usuario", JSON.stringify(encontrado));
          localStorage.setItem("usuarioLogeado", encontrado.nombre_usuario);
          window.location.href = accountType === "usuario" ? redirectUsuario : redirectNegocio;
        } else {
          mostrarError("Usuario o contraseña incorrectos.");
        }
      })
      .catch(err => {
        mostrarError("Error al conectar con el servidor.");
      });
  });

  localStorage.clear();

  function mostrarError(mensaje) {
    errorMsg.textContent = mensaje;
    errorMsg.style.display = "block";
  }
});
