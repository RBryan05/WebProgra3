function guardarId(event) {
    // Obtener el ID desde el atributo data-id del enlace
    const idNegocio = event.target.getAttribute('data-id');
    localStorage.setItem("idNegocio", idNegocio);
}

document.addEventListener("DOMContentLoaded", () => {
    const defaultImagePath = document.getElementById('app-data').getAttribute('data-default-profile');
    let todosNegocios = []; // Almacenará todos los negocios para filtrado
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.placeholder = "Buscar un Negocio...";
    }

    // Función para crear tarjeta de negocio
    function crearTarjetaNegocio(negocio) {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-negocio";
        const imagenUrl = negocio.foto_perfil ? negocio.foto_perfil : defaultImagePath;

        tarjeta.innerHTML = `
            <img src="${imagenUrl}" alt="Foto de ${negocio.nombre}" class="imagen-perfil">
            <h3 class="nombre-negocio">${negocio.nombre}</h3>
            <p class="direccion-negocio">${negocio.direccion || "Dirección no proporcionada"}</p>
            <a href="/negocios/infonegocio/" data-id="${negocio.id}" onclick="guardarId(event)" class="mas-info">Más información</a>
        `;

        return tarjeta;
    }

    // Función para normalizar texto (añadir al inicio del script)
    function normalizarTexto(texto) {
        if (!texto) return '';
        return texto
            .toLowerCase()
            .normalize("NFD") // Descompone caracteres acentuados
            .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos (tildes)
            .replace(/ñ/g, "n"); // Convierte ñ a n
    }

    // Función para filtrar negocios (versión mejorada)
    function filtrarNegocios(terminoBusqueda) {
        const container = document.getElementById("negocios-container");
        container.innerHTML = ''; // Limpiar contenedor

        if (!terminoBusqueda || terminoBusqueda.trim() === "") {
            // Mostrar todos los negocios si no hay término de búsqueda
            todosNegocios.forEach(negocio => {
                container.appendChild(crearTarjetaNegocio(negocio));
            });
            return;
        }

        const terminoNormalizado = normalizarTexto(terminoBusqueda);
        const negociosFiltrados = todosNegocios.filter(negocio => {
            const nombreNormalizado = normalizarTexto(negocio.nombre);
            return nombreNormalizado.includes(terminoNormalizado);
        });

        if (negociosFiltrados.length === 0) {
            container.innerHTML = '<p class="no-results">No se encontraron negocios que coincidan con tu búsqueda.</p>';
        } else {
            negociosFiltrados.forEach(negocio => {
                container.appendChild(crearTarjetaNegocio(negocio));
            });
        }
    }

    // Inicializar el buscador
    function inicializarBuscador() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');

        if (searchForm && searchInput) {
            // Buscar al enviar el formulario
            searchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                filtrarNegocios(searchInput.value.trim());
            });

            // Buscar en tiempo real mientras escribe
            searchInput.addEventListener('input', function () {
                filtrarNegocios(this.value.trim());
            });
        }
    }

    // Cargar los negocios
    fetch("/negocios/listanegocios/")
        .then(response => response.json())
        .then(data => {
            todosNegocios = data.negocios || data;
            const container = document.getElementById("negocios-container");
            container.innerHTML = ''; // Limpiar contenedor antes de agregar

            // Mostrar todos los negocios inicialmente (solo una vez)
            todosNegocios.forEach(negocio => {
                container.appendChild(crearTarjetaNegocio(negocio));
            });

            inicializarBuscador();
        })
        .catch(error => {
            console.error("Error al cargar los negocios:", error);
            document.getElementById("negocios-container").innerHTML =
                '<p class="error-message">Error al cargar los negocios. Por favor, recarga la página.</p>';
        });
});