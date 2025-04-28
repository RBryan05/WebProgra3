document.addEventListener("DOMContentLoaded", () => {
    // Variables de estado
    let imagenSubida = false;  // Cambiado a false inicialmente
    let archivoActual = null;
    let urlImagen = "";
    let imagenOriginal = "";

    // Obtener elementos del DOM
    const script = document.getElementById("edit-product-script");
    const productoId = localStorage.getItem("productoId");
    const user = JSON.parse(localStorage.getItem("usuario"));
    const id_usuario = user.id;
    const redirecSuccess = script.getAttribute("data-redirect-url");
    const btnSubirAWS = document.getElementById('btn-subir-aws');
    const fotoInput = document.getElementById('foto');
    const imagenInput = document.getElementById('imagen');
    const uploadBtn = document.querySelector('.upload-btn');
    const form = document.getElementById('productoForm');
    const urlsDiv = document.getElementById('urls');

    // URLs
    const subirImagenUrl = urlsDiv.dataset.subirImagenUrl;

    // Función para actualizar estado del botón de subida
    function actualizarEstadoBoton() {
        if (!btnSubirAWS) return;

        if (imagenSubida) {
            btnSubirAWS.disabled = true;
            btnSubirAWS.innerHTML = `<i class="bi bi-check-circle"></i> Imagen Subida`;
            btnSubirAWS.classList.remove('btn-success');
            btnSubirAWS.classList.add('btn-secondary');
        } else {
            btnSubirAWS.disabled = !fotoInput.files?.length;
            btnSubirAWS.innerHTML = `<i class="bi bi-cloud-upload"></i> Subir`;
            btnSubirAWS.classList.remove('btn-secondary');
            btnSubirAWS.classList.add('btn-success');
        }
    }

    // Función para subir imagen a AWS
    async function subirImagenAWS() {
        if (!fotoInput.files?.length || imagenSubida) return;

        const file = fotoInput.files[0];

        try {
            btnSubirAWS.disabled = true;
            btnSubirAWS.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status"></span> Subiendo...
            `;

            const formData = new FormData();
            formData.append('imagen', file);

            const response = await fetch(subirImagenUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al subir la imagen');
            }

            // Actualizar estado y URL de la imagen
            imagenSubida = true;
            archivoActual = file.name;
            urlImagen = data.url;
            if (imagenInput) {
                imagenInput.value = data.url;
            }

            const imagenFinal = imagenSubida && urlImagen ? urlImagen : imagenOriginal;

        // Recoger datos del formulario
        const producto = {
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value,
            imagen_url: imagenFinal,
            estado: document.getElementById('estado').value,
            categoria_id: document.getElementById('categoria').value,
            precio: parseFloat(document.getElementById('precio').value),
            negocio_id: id_usuario
        };

        // Enviar actualización
        fetch(`/editar_producto/productos/${productoId}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify(producto)
        })
            .then(async response => {
                if (!response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Error del servidor");
                    } else {
                        const text = await response.text();
                        throw new Error(text || "Error desconocido");
                    }
                }
                return response.json();
            })

            Swal.fire({
                icon: 'success',
                title: '¡Imagen subida!',
                text: 'La imagen se ha subido correctamente',
                timer: 1500,
                showConfirmButton: false
            });

            eliminarImagenAWS(imagenOriginal); // Eliminar la imagen original de AWS S3

        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al subir la imagen',
                timer: 2500,
                showConfirmButton: false
            });
        } finally {
            actualizarEstadoBoton();
        }
    }

    // Función para eliminar imagen de AWS S3
    async function eliminarImagenAWS(imageUrl) {
        try {
            const response = await fetch('/borrar-imagen/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify({
                    image_url: imageUrl
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al eliminar la imagen');
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    // Evento cuando se selecciona una nueva imagen
    if (fotoInput) {
        fotoInput.addEventListener('change', function (e) {
            if (e.target.files && e.target.files[0]) {
                const nuevoArchivo = e.target.files[0];

                // Verificar si es un archivo diferente al ya subido
                if (!archivoActual || nuevoArchivo.name !== archivoActual) {
                    imagenSubida = false;
                    urlImagen = "";
                    if (imagenInput) {
                        imagenInput.value = "";
                    }
                }
            } else {
                // Si se elimina la selección, mantener la imagen original
                imagenSubida = true;
                urlImagen = imagenOriginal;
                if (imagenInput) {
                    imagenInput.value = imagenOriginal;
                }
            }
            actualizarEstadoBoton();
        });
    }

    async function cargarDatosIniciales() {
        try {
            // Cargar en paralelo pero esperar a que ambas respuestas estén listas
            const [categoriasResponse, productoResponse] = await Promise.all([
                fetch("categorias/" + id_usuario + "/"),
                fetch(`producto/id/${productoId}/`)
            ]);
            
            const [categoriasData, producto] = await Promise.all([
                categoriasResponse.json(),
                productoResponse.json()
            ]);
            
            const selectCategoria = document.getElementById('categoria');
            if (selectCategoria) {
                // Limpiar y llenar categorías
                selectCategoria.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';
                categoriasData.forEach(categoria => {
                    const option = document.createElement("option");
                    option.value = categoria.id;
                    option.textContent = categoria.nombre;
                    selectCategoria.appendChild(option);
                });
                
                // Establecer valores del formulario
                document.getElementById('nombre').value = producto.nombre;
                document.getElementById('descripcion').value = producto.descripcion;
                document.getElementById('precio').value = parseFloat(producto.precio).toFixed(2);
                document.getElementById('estado').value = producto.estado;
                selectCategoria.value = producto.categoria_id; // Ahora seguro que el select está listo
                
                // Imágenes
                urlImagen = producto.imagen_url;
                imagenOriginal = producto.imagen_url;
                
                actualizarEstadoBoton();
            }
        } catch (error) {
            console.error("Error al cargar datos iniciales:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los datos del producto',
                timer: 1500,
                showConfirmButton: false
            });
        }
    }

    // Manejar el envío del formulario
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            // Validar que si hay imagen seleccionada, esté subida
            if (fotoInput.files?.length && !imagenSubida) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Imagen no subida',
                    text: 'Debes subir la imagen seleccionada antes de actualizar el producto',
                    timer: 1500,
                    showConfirmButton: false
                });
                return;
            }

            // Determinar qué URL de imagen usar:
            // 1. Si se subió una nueva imagen, usar esa URL
            // 2. Si no se seleccionó ninguna imagen nueva, usar la original
            // 3. Si se seleccionó pero no se subió, no debería llegar aquí por la validación anterior
            const imagenFinal = imagenSubida && urlImagen ? urlImagen : imagenOriginal;

            // Recoger datos del formulario
            const producto = {
                nombre: document.getElementById('nombre').value,
                descripcion: document.getElementById('descripcion').value,
                imagen_url: imagenFinal,
                estado: document.getElementById('estado').value,
                categoria_id: document.getElementById('categoria').value,
                precio: parseFloat(document.getElementById('precio').value),
                negocio_id: id_usuario
            };

            // Enviar actualización
            fetch(`/editar_producto/productos/${productoId}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify(producto)
            })
                .then(async response => {
                    if (!response.ok) {
                        const contentType = response.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || "Error del servidor");
                        } else {
                            const text = await response.text();
                            throw new Error(text || "Error desconocido");
                        }
                    }
                    return response.json();
                })
                .then(data => {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: 'Producto actualizado correctamente',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = redirecSuccess;
                    });
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Error al actualizar el producto',
                        timer: 1500,
                        showConfirmButton: false
                    });
                });
        });
    }

    // Event listeners
    if (btnSubirAWS) {
        btnSubirAWS.addEventListener('click', subirImagenAWS);
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => fotoInput.click());
    }

    // Inicializar estado del botón
    cargarDatosIniciales()
    actualizarEstadoBoton();
});