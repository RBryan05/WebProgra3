document.addEventListener("DOMContentLoaded", function () {
    // Obtener el ID del producto del localStorage
    const productId = localStorage.getItem('selectedProductId');
    let negocioId = null; // Variable para almacenar el ID del negocio

    if (!productId) {
        console.error('No se encontró ID de producto en el localStorage');
        return;
    }

    // URL del endpoint para obtener el producto
    const productUrl = `/informacion_producto/${productId}/`;

    // Obtener datos del producto
    fetch(productUrl)
        .then(response => {
            if (!response.ok) throw new Error('Producto no encontrado');
            return response.json();
        })
        .then(producto => {
            // Llenar los datos del producto
            document.getElementById('nombreProducto').textContent = producto.nombre;
            document.getElementById('precioProducto').textContent = "Precio: " + `$${producto.precio}`;
            document.getElementById('descripcionProducto').textContent = producto.descripcion;

            // Establecer la imagen del producto
            const imgElement = document.getElementById('fotoProducto');
            imgElement.src = producto.imagen_url || document.getElementById('static-data').getAttribute('data-default-profile');
            imgElement.alt = producto.nombre;

            // Guardar el ID del negocio para usarlo después
            negocioId = producto.negocio_id;

            // Obtener datos del negocio
            return fetch(`/informacion_negocio/${producto.negocio_id}/`);
        })
        .then(response => {
            if (!response.ok) throw new Error('Negocio no encontrado');
            return response.json();
        })
        .then(negocio => {
            // Llenar los datos del negocio
            document.getElementById('nombreNegocio').textContent = "🏪 " + (negocio.nombre || 'No disponible');
            document.getElementById('descripcionNegocio').textContent = '"' + (negocio.descripcion || 'No hay descripción disponible') + '"';
            document.getElementById('direccionNegocio').textContent = "📍 " + (negocio.direccion || 'No disponible');

            const telefonoElement = document.getElementById('telefonoNegocio');
            telefonoElement.textContent = "📞 " + (negocio.telefono || 'No disponible');

            // Si no hay teléfono, podemos ocultar el elemento o cambiar su estilo
            if (!negocio.telefono) {
                telefonoElement.style.opacity = '0.7';
                telefonoElement.style.fontStyle = 'italic';
            }

            // Configurar el evento click para el botón "Ver perfil del negocio"
            const verNegocioLink = document.getElementById('verNegocioLink');
            if (verNegocioLink) {
                verNegocioLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Guardar el ID del negocio en el localStorage
                    localStorage.setItem('idNegocio', negocioId);
                    // Redirigir a la página del perfil del negocio
                    window.location.href = `/negocios/infonegocio/`;
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const errorElement = document.createElement('p');
            errorElement.className = 'error-message';
            errorElement.textContent = 'Error al cargar la información. Por favor, intenta nuevamente.';
            document.querySelector('.producto-container').prepend(errorElement);

            // Mostrar valores por defecto para el negocio si hay error
            document.getElementById('nombreNegocio').textContent = 'Información no disponible';
            document.getElementById('direccionNegocio').textContent = 'No se pudo cargar la dirección';
            document.getElementById('telefonoNegocio').textContent = 'Teléfono no disponible';
        });
});