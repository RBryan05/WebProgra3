document.addEventListener("DOMContentLoaded", () => {
    // Obtener las URLs de los archivos estáticos desde el HTML
    const staticFiles = document.getElementById('static-files');
    const defaultImageUrl = staticFiles.getAttribute('data-default-image');
    const editProductUrl = staticFiles.getAttribute('data-edit-url');

    console.log(defaultImageUrl);

    // Función para formatear la fecha
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', options);
    }

    // Obtener el id del usuario desde el localStorage
    const usuarioId = localStorage.getItem('usuario') ? JSON.parse(localStorage.getItem('usuario')).id : null;

    if (!usuarioId) {
    } else {
        // Obtener los productos y los negocios de manera simultánea
        fetch('negocios/')
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error en la respuesta del servidor de negocios: " + response.status);
                }
                return response.json();  // Convertir la respuesta a JSON
            })
            .then(data => {
                const negocios = data.negocios;

                // Obtener los productos
                fetch('listadoproductos/')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Error en la respuesta del servidor de productos: " + response.status);
                        }
                        return response.json();  // Convertir la respuesta a JSON
                    })
                    .then(data => {

                        const productGrid = document.getElementById('product-grid');

                        if (data.productos && Array.isArray(data.productos)) {
                            // Mostrar todos los productos que pertenecen al negocio logueado, sin importar su estado
                            const productosDelNegocio = data.productos.filter(producto =>
                                producto.negocio_id === usuarioId
                            );

                            productosDelNegocio.forEach(producto => {
                                const productCard = document.createElement('div');
                                productCard.classList.add('product-card');

                                const negocio = negocios.find(negocio => negocio.id === producto.negocio_id);
                                const negocioName = negocio ? negocio.nombre : "Negocio desconocido";

                                // Definir el texto del botón y la acción según el estado
                                const buttonText = producto.estado === "activo" ? "Eliminar" : "Recuperar";
                                const buttonAction = producto.estado === "activo" ? cambiarEstadoAInactivo : cambiarEstadoAActivo;

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
                            });

                            // Agregar el evento click a los botones de "Editar"
                            const editButtons = document.querySelectorAll('.edit-btn');
                            editButtons.forEach(button => {
                                button.addEventListener('click', function () {
                                    const productoId = this.getAttribute('data-id');
                                    localStorage.setItem('productoId', productoId); // Guardar el ID del producto en localStorage
                                    window.location.href = editProductUrl; // Redirigir a la página de edición
                                });
                            });

                            // Agregar el evento click a los botones de "Eliminar" o "Recuperar"
                            const deleteButtons = document.querySelectorAll('.delete-btn');
                            deleteButtons.forEach(button => {
                                button.addEventListener('click', function () {
                                    const productoId = this.getAttribute('data-id');
                                    localStorage.setItem('productoId', productoId); // Guardar el ID del producto en localStorage
                                    // Si el botón dice "Eliminar", cambiar el estado a inactivo
                                    if (this.textContent === "Eliminar") {
                                        cambiarEstadoAInactivo(productoId);
                                    }
                                    // Si el botón dice "Recuperar", cambiar el estado a activo
                                    else if (this.textContent === "Recuperar") {
                                        cambiarEstadoAActivo(productoId);
                                    }
                                });
                            });
                        } else {
                        }
                    })
                    .catch(error => {
                    });
            })
            .catch(error => {
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
