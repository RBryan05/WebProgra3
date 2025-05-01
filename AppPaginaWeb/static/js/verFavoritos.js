document.addEventListener("DOMContentLoaded", async function () {
    // Obtener usuario del localStorage
    const usuarioData = JSON.parse(localStorage.getItem('usuario'));
    if (!usuarioData || !usuarioData.id) {
        document.getElementById('product-grid').innerHTML =
            '<p class="no-results">Debes iniciar sesión para ver tus favoritos</p>';
        return;
    }

    // Determinar el tipo de usuario y las URLs correspondientes
    const isNegocio = usuarioData.tipo_usuario === 'negocio';
    const usuarioEndpoint = isNegocio
        ? `/informacion_negocio/${usuarioData.id}/`
        : `/obtener_usuario_por_id/${usuarioData.id}/`;
    
    const actualizarEndpoint = isNegocio
        ? `/actualizar_negocio/${usuarioData.id}/`
        : `/actualizar_usuario/${usuarioData.id}/`;

    // Configuración
    const config = {
        defaultImage: document.getElementById('app-data').getAttribute('data-default-image'),
        endpoints: {
            productos: '/listadoproductos/',
            usuario: usuarioEndpoint,
            actualizar: actualizarEndpoint
        },
        userId: usuarioData.id
    };

    const infoProductos = document.getElementById('urls').getAttribute('data-mi-perfil');
    let favoritosProducts = [];

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

    // Función para filtrar productos por nombre
    function filtrarProductos(terminoBusqueda) {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;

        if (!terminoBusqueda || terminoBusqueda.trim() === "") {
            renderProducts(favoritosProducts);
            return;
        }

        const terminoNormalizado = normalizarTexto(terminoBusqueda);

        const productosFiltrados = favoritosProducts.filter(producto => {
            const nombreNormalizado = normalizarTexto(producto.nombre);
            return nombreNormalizado.includes(terminoNormalizado);
        });

        renderProducts(productosFiltrados);
    }

    // Función para inicializar el buscador
    function inicializarBuscador() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');

        if (searchInput) {
            searchInput.placeholder = "Buscar un Producto de mis Favoritos...";
        }

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
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;

        // Limpiar contenedor
        productGrid.innerHTML = '';

        // Mostrar mensaje si no hay productos
        if (products.length === 0) {
            productGrid.innerHTML = '<p class="no-results">No se encontraron productos que coincidan con tu búsqueda.</p>';
            return;
        }

        // Crear tarjetas simplificadas para cada producto
        products.forEach(producto => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${producto.imagen_url || config.defaultImage}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p class="price">$${producto.precio}</p>
                <p>Publicado el ${formatDate(producto.creado_en)}</p>
                <button onclick="localStorage.setItem('selectedProductId', ${producto.id}); location.href='${infoProductos}';">
                    Más Información
                </button>
                <button class="btn-remove-fav" onclick="removeFromFavorites(${producto.id}, this)">
                    Eliminar de favoritos
                </button>
            `;

            productGrid.appendChild(productCard);
        });
    }

    // Función mejorada para manejar respuestas de la API
    async function fetchWithAuth(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Respuesta no JSON: ${text.substring(0, 100)}...`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en fetch:', error);
            throw error;
        }
    }

    // Función principal para renderizar favoritos
    async function renderFavoritos() {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;

        try {
            productGrid.innerHTML = '<p class="loading">Cargando tus favoritos...</p>';

            // 1. Obtener lista de favoritos del usuario/negocio
            const responseData = await fetchWithAuth(config.endpoints.usuario);
            
            // Manejar la respuesta diferente según el tipo de usuario
            let favoritosIds = [];
            if (isNegocio) {
                favoritosIds = responseData.productos_favoritos || responseData.favoritos || [];
            } else {
                favoritosIds = responseData.productos_favoritos || [];
            }

            // Convertir todos los IDs a número
            favoritosIds = favoritosIds.map(id => Number(id));

            if (favoritosIds.length === 0) {
                productGrid.innerHTML = '<p class="no-results">No tienes productos favoritos guardados.</p>';
                return;
            }

            // 2. Obtener todos los productos
            const productosData = await fetchWithAuth(config.endpoints.productos);
            const allProducts = productosData.productos || [];

            // 3. Filtrar solo productos favoritos activos
            favoritosProducts = allProducts.filter(producto => {
                const productoId = Number(producto.id);
                return favoritosIds.includes(productoId) && producto.estado === "activo";
            });

            if (favoritosProducts.length === 0) {
                productGrid.innerHTML = '<p class="no-results">No tienes productos favoritos activos.</p>';
                return;
            }

            // Renderizar productos
            renderProducts(favoritosProducts);
            inicializarBuscador();

        } catch (error) {
            console.error('Error al cargar favoritos:', error);
            productGrid.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar tus favoritos: ${error.message}</p>
                    <button onclick="window.location.reload()">Reintentar</button>
                </div>
            `;
        }
    }

    window.removeFromFavorites = async function(productId, buttonElement) {
        const { isConfirmed } = await Swal.fire({
            title: '¿Eliminar de favoritos?',
            text: "¿Estás seguro que deseas quitar este producto de tus favoritos?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
    
        if (!isConfirmed) return;
    
        try {
            // 1. Primero obtener los favoritos actuales DIRECTAMENTE del servidor
            const usuarioResponse = await fetchWithAuth(config.endpoints.usuario);
            let currentFavorites = [];
            
            if (isNegocio) {
                currentFavorites = usuarioResponse.productos_favoritos || usuarioResponse.favoritos || [];
            } else {
                currentFavorites = usuarioResponse.productos_favoritos || [];
            }
    
            // Convertir todos los IDs a número para comparación consistente
            currentFavorites = currentFavorites.map(id => Number(id));
            const productIdNum = Number(productId);
    
            // Verificar que el producto está realmente en favoritos
            if (!currentFavorites.includes(productIdNum)) {
                await showError('Este producto no está en tus favoritos');
                return;
            }
    
            // Filtrar el producto a eliminar
            const updatedFavorites = currentFavorites.filter(id => id !== productIdNum);
    
            // Mostrar carga mientras se procesa
            Swal.fire({
                title: 'Procesando...',
                html: 'Eliminando producto de favoritos',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
    
            // Preparar datos para actualización
            const updateData = {
                productos_favoritos: updatedFavorites
            };
    
            const response = await fetch(config.endpoints.actualizar, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || '',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al actualizar favoritos');
            }
    
            // Actualizar datos locales
            const updatedUser = await response.json();
            localStorage.setItem('usuario', JSON.stringify(updatedUser));
    
            // Actualizar la lista en memoria
            favoritosProducts = favoritosProducts.filter(producto => Number(producto.id) !== productIdNum);
    
            // Actualizar la interfaz
            if (favoritosProducts.length === 0) {
                document.getElementById('product-grid').innerHTML = `
                    <div class="no-favorites-message">
                        <h3>No tienes productos favoritos</h3>
                    </div>
                `;
            } else {
                renderProducts(favoritosProducts);
            }
    
            await Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: 'El producto se ha quitado de tus favoritos',
                timer: 2000,
                showConfirmButton: false
            });
    
        } catch (error) {
            console.error('Error al eliminar favorito:', error);
            await showError(error.message || 'Error al eliminar de favoritos');
        }
    };
    
    // Función auxiliar para mostrar errores
    async function showError(message) {
        await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: message,
            confirmButtonText: 'Entendido'
        });
    }
    
    // Función para obtener el token CSRF (se mantiene igual)
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Iniciar la carga
    renderFavoritos();
});