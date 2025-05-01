document.addEventListener("DOMContentLoaded", () => {
    // Obtener la URL de la imagen predeterminada desde el DOM
    const urlDefaultProfile = document.getElementById('static-data').getAttribute('data-default-profile');
    const idNegocio = localStorage.getItem("idNegocio");
    let fotoPerfilNegocio = "";
    let todasCategorias = []; // Almacenará todas las categorías para el filtrado
    const searchInput = document.getElementById('search-input');

    // Función para obtener la información del negocio
    async function obtenerInfoNegocio() {
        try {
            const response = await fetch(`/negocios/infonegocio/${idNegocio}/`);
            const negocio = await response.json();

            document.querySelector('.title').textContent = negocio.nombre;
            const fotoPerfil = document.getElementById("fotoPerfil");
            fotoPerfil.src = negocio.foto_perfil || urlDefaultProfile;
            fotoPerfilNegocio = negocio.foto_perfil || urlDefaultProfile;

            if (searchInput) {
                searchInput.placeholder = "Buscar una Categoria de " + negocio.nombre + "...";
            }

            document.getElementById("direccionNegocio").textContent = "📍 " + (negocio.direccion || "Dirección no proporcionada");
            document.getElementById("descripcionNegocio").textContent = "ℹ️ " + (negocio.descripcion || "Descripción no proporcionada");
            document.getElementById("telefonoNegocio").textContent = "📞 " + (negocio.telefono || "Teléfono no proporcionado");
        } catch (error) {
            console.error("Error al obtener información del negocio:", error);
        }
    }

    // Función para renderizar categorías
    function renderizarCategorias(categorias) {
        const categoriaCards = document.getElementById("categoriaCards");
        categoriaCards.innerHTML = '';

        if (categorias.length === 0) {
            categoriaCards.innerHTML = '<p class="no-results">No se encontraron categorías que coincidan con tu búsqueda.</p>';
            return;
        }

        categorias.forEach(categoria => {
            const card = document.createElement("div");
            card.classList.add("categoria-card");

            const imagen = categoria.imagen_url || fotoPerfilNegocio;

            card.innerHTML = `
                <h3>${categoria.nombre}</h3>
                <img src="${imagen}" alt="${categoria.nombre}" class="imagen-categoria">
                <button class="btn-ingresar" data-id="${categoria.id}" data-nombre="${categoria.nombre}">Ingresar</button>
            `;

            const btnIngresar = card.querySelector('.btn-ingresar');
            btnIngresar.addEventListener('click', function () {
                localStorage.setItem("idCategoria", this.getAttribute('data-id'));
                localStorage.setItem("nombreCategoria", categoria.nombre);
                window.location.href = `/categoriaproductos/`;
            });

            categoriaCards.appendChild(card);
        });
    }

    // Función para normalizar texto (reutilizable)
    function normalizarTexto(texto) {
        if (!texto) return '';
        return texto
            .toLowerCase()
            .normalize("NFD") // Descompone caracteres acentuados
            .replace(/[\u0300-\u036f]/g, "") // Elimina tildes/diacríticos
            .replace(/ñ/g, "n"); // Convierte ñ a n
    }

    // Función para filtrar categorías por nombre (versión mejorada)
    function filtrarCategorias(terminoBusqueda) {
        if (!terminoBusqueda || terminoBusqueda.trim() === "") {
            renderizarCategorias(todasCategorias);
            return;
        }

        const terminoNormalizado = normalizarTexto(terminoBusqueda);

        const categoriasFiltradas = todasCategorias.filter(categoria => {
            const nombreNormalizado = normalizarTexto(categoria.nombre);
            return nombreNormalizado.includes(terminoNormalizado);
        });

        renderizarCategorias(categoriasFiltradas);
    }

    // Inicializar el buscador
    function inicializarBuscador() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');

        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                filtrarCategorias(searchInput.value.trim());
            });

            searchInput.addEventListener('input', function () {
                filtrarCategorias(this.value.trim());
            });
        }
    }

    // Función para obtener las categorías del negocio
    async function obtenerCategorias() {
        try {
            const response = await fetch(`/negocios/categorias/${idNegocio}/`);
            const categorias = await response.json();

            todasCategorias = categorias; // Guardar todas las categorías
            renderizarCategorias(todasCategorias);
            inicializarBuscador();
        } catch (error) {
            console.error("Error al obtener categorías:", error);
            document.getElementById("categoriaCards").innerHTML =
                '<p class="error-message">Error al cargar las categorías. Por favor, recarga la página.</p>';
        }
    }

    // Ejecutar funciones
    obtenerInfoNegocio().then(obtenerCategorias);
});