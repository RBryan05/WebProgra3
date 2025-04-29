document.addEventListener("DOMContentLoaded", function () {
    // Configuración inicial
    const config = {
        defaultImage: document.getElementById('app-config').getAttribute('data-default-image'),
        apiBase: document.getElementById('app-config').getAttribute('data-api-base')
    };

    // Elementos del DOM
    const productGrid = document.getElementById('product-grid');
    const searchInput = document.getElementById('search-input');
    const infoProdcutos = document.getElementById('urls').getAttribute('data-mi-perfil');
    const titulo = document.getElementById('title');
    titulo.innerHTML = "Productos de la Categoria " + (localStorage.getItem('nombreCategoria') || "Productos de la categoría");

    if (searchInput) {
        searchInput.placeholder = "Buscar un Producto de la Categoria " + (localStorage.getItem('nombreCategoria') || "Productos de la categoría") + "...";
    }

    // Variables globales
    let todosProductos = []; // Almacenará todos los productos para filtrado

    // Función para formatear fechas
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    // Función para normalizar texto (quitar tildes y convertir ñ a n)
    function normalizarTexto(texto) {
        if (!texto) return '';
        return texto
            .toLowerCase()
            .normalize("NFD") // Descompone caracteres acentuados
            .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos (tildes)
            .replace(/ñ/g, "n"); // Convierte ñ a n
    }

    // Función para filtrar productos por nombre (versión mejorada)
    function filtrarProductos(terminoBusqueda) {
        if (!terminoBusqueda || terminoBusqueda.trim() === "") {
            renderProducts(todosProductos);
            return;
        }

        const terminoNormalizado = normalizarTexto(terminoBusqueda);

        const productosFiltrados = todosProductos.filter(producto => {
            const nombreNormalizado = normalizarTexto(producto.nombre);
            return nombreNormalizado.includes(terminoNormalizado);
        });

        renderProducts(productosFiltrados);
    }

    // Función para inicializar el buscador
    function inicializarBuscador() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');

        if (searchForm && searchInput) {
            // Buscar al enviar el formulario
            searchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                filtrarProductos(searchInput.value.trim());
            });

            // Buscar en tiempo real mientras escribe
            searchInput.addEventListener('input', function () {
                filtrarProductos(this.value.trim());
            });
        }
    }

    // Función para renderizar productos
    function renderProducts(products) {
        // Limpiar el contenedor primero
        productGrid.innerHTML = '';

        // Filtrar solo productos activos
        const activeProducts = products.filter(producto => producto.estado === "activo");

        // Mostrar mensaje si no hay resultados
        if (activeProducts.length === 0) {
            productGrid.innerHTML = '<p class="no-results">No se encontraron productos que coincidan con tu búsqueda.</p>';
            return;
        }

        // Crear y añadir cada tarjeta de producto
        activeProducts.forEach(producto => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${producto.imagen_url || config.defaultImage}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p class="price">$${producto.precio}</p>
                <p>Publicado el ${formatDate(producto.creado_en)}</p>
                <button onclick="localStorage.setItem('selectedProductId', ${producto.id}); location.href='${infoProdcutos}';">Más Información</button>
            `;
            productGrid.appendChild(productCard);
        });
    }

    // Función para manejar errores
    function handleError(error) {
        console.error("Error:", error);
        if (productGrid) {
            productGrid.innerHTML = `
                <div class="error-message">
                    <p>No se pudieron cargar los productos. Por favor, intente nuevamente.</p>
                    <button onclick="window.location.reload()">Recargar página</button>
                </div>
            `;
        }
    }

    // Obtener ID de categoría y cargar productos
    function loadCategoryProducts() {
        const idCategoria = localStorage.getItem('idCategoria');

        if (!idCategoria) {
            console.error("No se encontró ID de categoría en localStorage");
            productGrid.innerHTML = `<p class="error">No se ha seleccionado ninguna categoría.</p>`;
            return;
        }

        fetch(`${config.apiBase}${idCategoria}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data.productos || !Array.isArray(data.productos)) {
                    throw new Error("Formato de datos inválido");
                }

                todosProductos = data.productos; // Guardar todos los productos
                renderProducts(todosProductos); // Mostrar todos inicialmente
                inicializarBuscador(); // Configurar el buscador
            })
            .catch(handleError);
    }

    // Iniciar la carga de productos
    loadCategoryProducts();
});