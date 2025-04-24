document.addEventListener("DOMContentLoaded", function() {
    // Configuración inicial
    const config = {
        defaultImage: document.getElementById('app-config').getAttribute('data-default-image'),
        apiBase: document.getElementById('app-config').getAttribute('data-api-base')
    };

    // Elementos del DOM
    const productGrid = document.getElementById('product-grid');
    titulo = document.getElementById('title');
    titulo.innerHTML = "Productos de la Categoria " + localStorage.getItem('nombreCategoria') || "Productos de la categoría";
    // Función para formatear fechas
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    // Función para renderizar productos
    function renderProducts(products) {
        // Limpiar el contenedor primero
        productGrid.innerHTML = '';

        // Filtrar solo productos activos
        const activeProducts = products.filter(producto => producto.estado === "activo");

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
                <button class="favorite-btn">Agregar a Favoritos</button>
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
                renderProducts(data.productos);
            })
            .catch(handleError);
    }

    // Iniciar la carga de productos
    loadCategoryProducts();
});