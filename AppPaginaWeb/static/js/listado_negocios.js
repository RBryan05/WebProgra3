
function guardarId(event) {
    // Obtener el ID desde el atributo data-id del enlace
    const idNegocio = event.target.getAttribute('data-id');
    localStorage.setItem("idNegocio", idNegocio);
}
document.addEventListener("DOMContentLoaded", () => {
    const defaultImagePath = document.getElementById('app-data').getAttribute('data-default-profile');
    function crearTarjetaNegocio(negocio) {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-negocio";
        const imagenUrl = negocio.foto_perfil ? negocio.foto_perfil : defaultImagePath;

        tarjeta.innerHTML = `
            <img src="${imagenUrl}" alt="Foto de ${negocio.nombre}" class="imagen-perfil">
            <h3 class="nombre-negocio">${negocio.nombre}</h3>
            <p class="direccion-negocio">${negocio.direccion || "Dirección no proporcionada"}</p>
        `;

        return tarjeta;
    }

    fetch("/negocios/listanegocios/")
        .then(response => response.json())
        .then(data => {

            const negocios = data.negocios || data;
            const container = document.getElementById("negocios-container");

            negocios.forEach(negocio => {
                const tarjeta = crearTarjetaNegocio(negocio);
                container.appendChild(tarjeta);
            });
        })
        .catch(error => {
            console.error("Error al cargar los negocios:", error);
        });

    function crearTarjetaNegocio(negocio) {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-negocio";

        const imagenUrl = negocio.foto_perfil ? negocio.foto_perfil : defaultImagePath;

        tarjeta.innerHTML = `
            <img src="${imagenUrl}" alt="Foto de ${negocio.nombre}" class="imagen-perfil">
            <h3 class="nombre-negocio">${negocio.nombre}</h3>
            <p class="direccion-negocio">${negocio.direccion || "Dirección no proporcionada"}</p>
            <a href="/negocios/infonegocio/" data-id="${negocio.id}" onclick="guardarId(event)" class="mas-info">Más información</a>
            `
        ;
        return tarjeta;
    }
});