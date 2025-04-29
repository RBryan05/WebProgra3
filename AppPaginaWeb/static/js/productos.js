document.addEventListener("DOMContentLoaded", function () {
    // Variables globales para almacenar los datos
    let allProducts = [];
    let allBusinesses = [];

    // Configuración
    const config = {
        defaultImage: document.getElementById('app-data').getAttribute('data-default-image'),
        endpoints: {
            negocios: 'negocios/',
            productos: 'listadoproductos/'
        }
    };

    const infoProdcutos = document.getElementById('urls').getAttribute('data-mi-perfil');

    // Función para formatear fechas
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    // Función para normalizar texto (quitar tildes y convertir ñ a n)
    function normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD") // Descompone caracteres acentuados
            .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos (tildes)
            .replace(/ñ/g, "n"); // Convierte ñ a n
    }

    // Función para filtrar productos según el término de búsqueda (versión mejorada)
    function filterProducts(searchTerm) {
        if (!searchTerm) {
            renderProducts(allProducts, allBusinesses);
            return;
        }

        const terminoNormalizado = normalizarTexto(searchTerm);

        const filteredProducts = allProducts.filter(producto => {
            const nombreNormalizado = normalizarTexto(producto.nombre);
            return nombreNormalizado.includes(terminoNormalizado);
        });

        renderProducts(filteredProducts, allBusinesses);
    }

    // Función para renderizar productos
    function renderProducts(products, businesses) {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;

        // Limpiar contenedor
        productGrid.innerHTML = '';

        // Filtrar solo productos activos
        const activeProducts = products.filter(producto => producto.estado === "activo");

        // Mostrar mensaje si no hay resultados
        if (activeProducts.length === 0) {
            productGrid.innerHTML = '<p class="no-results">No se encontraron productos que coincidan con tu búsqueda.</p>';
            return;
        }

        // Crear tarjetas para cada producto
        activeProducts.forEach(producto => {
            const negocio = businesses.find(negocio => negocio.id === producto.negocio_id);
            const negocioName = negocio ? negocio.nombre : "Negocio desconocido";

            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${producto.imagen_url || config.defaultImage}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p class="price">$${producto.precio}</p>
                <p><strong>Publicado por:</strong> ${negocioName}</p>
                <p>Publicado el ${formatDate(producto.creado_en)}</p>
                <button onclick="localStorage.setItem('selectedProductId', ${producto.id}); location.href='${infoProdcutos}';">Más Información</button>
            `;

            productGrid.appendChild(productCard);
        });
    }

    // Función para manejar errores
    function handleError(error, message) {
        console.error(message, error);
        const productGrid = document.getElementById('product-grid');
        if (productGrid) {
            productGrid.innerHTML = `<p class="error-message">Error al cargar los datos. Por favor, recarga la página.</p>`;
        }
    }

    // Función para inicializar el buscador
    function initSearch() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');

        if (searchForm && searchInput) {
            // Buscar al enviar el formulario
            searchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                filterProducts(searchInput.value.trim());
            });

            // Buscar en tiempo real mientras escribe
            searchInput.addEventListener('input', function () {
                filterProducts(this.value.trim());
            });
        }
    }

    // Cargar datos de negocios y productos
    Promise.all([
        fetch(config.endpoints.negocios).then(response => {
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return response.json();
        }),
        fetch(config.endpoints.productos).then(response => {
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return response.json();
        })
    ])
        .then(([negociosData, productosData]) => {
            if (!negociosData.negocios || !productosData.productos) {
                throw new Error('Datos incompletos recibidos del servidor');
            }

            // Almacenar todos los productos y negocios para filtrado
            allProducts = productosData.productos;
            allBusinesses = negociosData.negocios;

            // Renderizar todos los productos inicialmente
            renderProducts(allProducts, allBusinesses);

            // Inicializar el buscador
            initSearch();
        })
        .catch(error => {
            handleError(error, 'Error al cargar los datos:');
        });
});