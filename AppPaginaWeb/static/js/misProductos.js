document.addEventListener("DOMContentLoaded", () => {
    // Obtener las URLs de los archivos estáticos desde el HTML
    const staticFiles = document.getElementById('static-files');
    const defaultImageUrl = staticFiles.getAttribute('data-default-image');
    const editProductUrl = staticFiles.getAttribute('data-edit-url');

    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.placeholder = "Buscar en mis Productos...";
    }

    // Variables globales para almacenar datos
    let todosProductos = [];
    let todosNegocios = []; // Cambié el nombre a todosNegocios para consistencia
    let negocios = []; // Esta la mantenemos para compatibilidad con el código existente

    // Función para formatear la fecha
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', options);
    }

    // Función para normalizar texto
    function normalizarTexto(texto) {
        if (!texto) return '';
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ñ/g, "n");
    }

    // Función para crear tarjeta de negocio (si la necesitas)
    function crearTarjetaNegocio(negocio) {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-negocio";
        const imagenUrl = negocio.foto_perfil || defaultImageUrl;

        tarjeta.innerHTML = `
            <img src="${imagenUrl}" alt="Foto de ${negocio.nombre}" class="imagen-perfil">
            <h3 class="nombre-negocio">${negocio.nombre}</h3>
            <p class="direccion-negocio">${negocio.direccion || "Dirección no proporcionada"}</p>
            <a href="/negocios/infonegocio/" data-id="${negocio.id}" onclick="guardarId(event)" class="mas-info">Más información</a>
        `;

        return tarjeta;
    }

    // Función para filtrar productos por nombre
    function filtrarProductos(terminoBusqueda) {
        if (!terminoBusqueda || terminoBusqueda.trim() === "") {
            renderizarProductos(todosProductos);
            return;
        }

        const terminoNormalizado = normalizarTexto(terminoBusqueda);

        const productosFiltrados = todosProductos.filter(producto => {
            const nombreNormalizado = normalizarTexto(producto.nombre);
            return nombreNormalizado.includes(terminoNormalizado);
        });

        renderizarProductos(productosFiltrados);
    }


    // Función para renderizar productos
    function renderizarProductos(productos) {
        const productGrid = document.getElementById('product-grid');
        productGrid.innerHTML = '';

        if (productos.length === 0) {
            productGrid.innerHTML = '<p class="no-results">No se encontraron productos que coincidan con tu búsqueda.</p>';
            return;
        }

        productos.forEach(producto => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            const negocio = negocios.find(negocio => negocio.id === producto.negocio_id);
            const negocioName = negocio ? negocio.nombre : "Negocio desconocido";

            const buttonText = producto.estado === "activo" ? "Eliminar" : "Recuperar";

            productCard.innerHTML = `
                 <img src="${producto.imagen_url || defaultImageUrl}" alt="${producto.nombre}" />
                 <h3>${producto.nombre}</h3>
                 <p>${producto.descripcion}</p>
                 <p class="price">$${producto.precio}</p>
                 <p><strong>Publicado por:</strong> ${negocioName}</p>
                 <p>Publicado el ${formatDate(producto.creado_en)}</p>
                 <button class="edit-btn" data-id="${producto.id}">Editar</button>
                 <button class="delete-btn" data-id="${producto.id}">${buttonText}</button>  
             `;

            productGrid.appendChild(productCard);

            // Agregar eventos a los botones
            productCard.querySelector('.edit-btn').addEventListener('click', function () {
                const productoId = this.getAttribute('data-id');
                localStorage.setItem('productoId', productoId);
                window.location.href = editProductUrl;
            });

            productCard.querySelector('.delete-btn').addEventListener('click', function () {
                const productoId = this.getAttribute('data-id');
                localStorage.setItem('productoId', productoId);
                if (this.textContent === "Eliminar") {
                    cambiarEstadoAInactivo(productoId);
                } else {
                    cambiarEstadoAActivo(productoId);
                }
            });
        });
    }

    // Inicializar el buscador de productos
    function inicializarBuscador() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');

        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                filtrarProductos(searchInput.value.trim());
            });

            searchInput.addEventListener('input', function () {
                filtrarProductos(this.value.trim());
            });
        }
    }

    // Obtener el id del usuario desde el localStorage
    const usuarioId = localStorage.getItem('usuario') ? JSON.parse(localStorage.getItem('usuario')).id : null;

    if (!usuarioId) {
        console.error("Usuario no identificado");
    } else {
        // Obtener los negocios y productos
        Promise.all([
            fetch('negocios/').then(response => {
                if (!response.ok) throw new Error("Error al cargar negocios");
                return response.json();
            }),
            fetch('listadoproductos/').then(response => {
                if (!response.ok) throw new Error("Error al cargar productos");
                return response.json();
            })
        ])
            .then(([negociosData, productosData]) => {
                // Asignar los datos
                todosNegocios = negociosData.negocios || negociosData;
                negocios = todosNegocios; // Mantener compatibilidad
                todosProductos = (productosData.productos || productosData)
                    .filter(producto => producto.negocio_id === usuarioId);

                // Renderizar productos
                renderizarProductos(todosProductos);

                // Inicializar buscador
                inicializarBuscador();
            })
            .catch(error => {
                console.error("Error:", error);
                const container = document.getElementById('product-grid') || document.getElementById('negocios-container');
                if (container) {
                    container.innerHTML = '<p class="error-message">Error al cargar los datos. Por favor, recarga la página.</p>';
                }
            });
    }

    // Función para cambiar el estado de un producto a "Inactivo"
    function cambiarEstadoAInactivo(productoId) {
        const user = JSON.parse(localStorage.getItem("usuario"));
        const id_usuario = user.id;

        fetch(`producto/id/${productoId}/`)
            .then(response => response.json())
            .then(producto => {
                const productoActualizado = {
                    nombre: producto.nombre,
                    descripcion: producto.descripcion,
                    imagen_url: producto.imagen_url,
                    estado: 'inactivo',
                    categoria_id: producto.categoria_id,
                    precio: producto.precio,
                    negocio_id: id_usuario
                };

                // Obtener el token CSRF
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

                // Enviar la solicitud al servidor para cambiar el estado
                return fetch(`productos/${productoId}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken
                    },
                    body: JSON.stringify(productoActualizado)
                });
            })
            .then(async response => {
                if (!response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Error desconocido del servidor.");
                    } else {
                        const text = await response.text();
                        throw new Error("Error inesperado del servidor:\n\n" + text);
                    }
                }
                return response.json();
            })
            .then(data => {
                alert("Producto desactivado correctamente.");
                location.reload();
            })
            .catch(error => {
                alert("Error al desactivar: " + error.message);
            });
    }

    // Función para cambiar el estado de un producto a "Activo" (Recuperar)
    function cambiarEstadoAActivo(productoId) {
        const user = JSON.parse(localStorage.getItem("usuario"));
        const id_usuario = user.id;

        fetch(`producto/id/${productoId}/`)
            .then(response => response.json())
            .then(producto => {
                const productoActualizado = {
                    nombre: producto.nombre,
                    descripcion: producto.descripcion,
                    imagen_url: producto.imagen_url,
                    estado: 'activo',
                    categoria_id: producto.categoria_id,
                    precio: producto.precio,
                    negocio_id: id_usuario
                };

                // Obtener el token CSRF
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

                // Enviar la solicitud al servidor para cambiar el estado
                return fetch(`productos/${productoId}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken
                    },
                    body: JSON.stringify(productoActualizado)
                });
            })
            .then(async response => {
                if (!response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Error desconocido del servidor.");
                    } else {
                        const text = await response.text();
                        throw new Error("Error inesperado del servidor:\n\n" + text);
                    }
                }
                return response.json();
            })
            .then(data => {
                alert("Producto recuperado correctamente.");
                location.reload();
            })
            .catch(error => {
                alert("Error al recuperar: " + error.message);
            });
    }
});
