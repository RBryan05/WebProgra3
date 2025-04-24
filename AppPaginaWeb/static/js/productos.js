document.addEventListener("DOMContentLoaded", function() {
    // Configuración
    const config = {
        defaultImage: document.getElementById('app-data').getAttribute('data-default-image'),
        endpoints: {
            negocios: 'negocios/',
            productos: 'listadoproductos/'
        }
    };

    // Función para formatear fechas
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    // Función para renderizar productos
    function renderProducts(products, businesses) {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;

        // Limpiar contenedor
        productGrid.innerHTML = '';

        // Filtrar solo productos activos
        const activeProducts = products.filter(producto => producto.estado === "activo");

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
                <button>Agregar a Favoritos</button>
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
        renderProducts(productosData.productos, negociosData.negocios);
    })
    .catch(error => {
        handleError(error, 'Error al cargar los datos:');
    });
});