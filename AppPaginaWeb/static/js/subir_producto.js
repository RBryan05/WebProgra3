document.addEventListener('DOMContentLoaded', function () {
    // Variables de estado
    let imagenSubida = false;
    let archivoActual = null;
    let urlImagen = "";
    let imagenEliminar = ""; // Para rastrear la imagen subida
    let imagenAnteriorSubida = null; // Para rastrear imágenes subidas pero no usadas

    // Obtener las URLs desde el div
    const urlsDiv = document.getElementById('urls');
    const urls = {
        subirImagenUrl: urlsDiv.dataset.subirImagenUrl,
        registrarProducto: urlsDiv.dataset.registrarProducto,
        urlMainNegocio: urlsDiv.dataset.urlIndex
    };

    // Obtener elementos del DOM
    const user = JSON.parse(localStorage.getItem("usuario"));
    const id_usuario = user.id;
    const btnSubirAWS = document.getElementById('btn-subir-aws');
    const fotoInput = document.getElementById('foto');
    const imagenInput = document.getElementById('imagen');
    const uploadBtn = document.querySelector('.upload-btn');
    const form = document.getElementById('productoForm');
    const selectCategoria = document.getElementById('categoria');

    // Función para eliminar imagen de AWS
    async function eliminarImagenAWS(imageUrl) {
        if (!imageUrl) return true;

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
            console.error('Error al eliminar imagen:', error);
            return false;
        }
    }

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

    // Función para cargar categorías
    function cargarCategorias() {
        if (!selectCategoria) return;

        // Mostrar estado de carga
        selectCategoria.disabled = true;
        const originalHTML = selectCategoria.innerHTML;
        selectCategoria.innerHTML = '<option value="">Cargando categorías...</option>';

        fetch(`categorias/${id_usuario}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar categorías');
                }
                return response.json();
            })
            .then(data => {
                selectCategoria.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';

                data.forEach(categoria => {
                    const option = document.createElement("option");
                    option.value = categoria.id;
                    option.textContent = categoria.nombre;
                    selectCategoria.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Error al obtener categorías:", error);
                selectCategoria.innerHTML = originalHTML;
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar las categorías',
                    timer: 2500,
                    showConfirmButton: false
                });
            })
            .finally(() => {
                selectCategoria.disabled = false;
            });
    }

    // Función para subir imagen a AWS
    async function subirImagenAWS() {
        if (!fotoInput.files?.length || imagenSubida || !btnSubirAWS) return;

        // Antes de actualizar, eliminar la imagen anterior si existe
        if (imagenAnteriorSubida && imagenAnteriorSubida !== urlImagen) {
            await eliminarImagenAWS(imagenAnteriorSubida);
        }

        const file = fotoInput.files[0];

        try {
            btnSubirAWS.disabled = true;
            btnSubirAWS.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status"></span> Subiendo...
            `;

            const formData = new FormData();
            formData.append('imagen', file);

            const response = await fetch(urls.subirImagenUrl, {
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
            imagenEliminar = data.url;
            imagenAnteriorSubida = imagenEliminar; // Guarda la URL previa antes de actualizar

            if (imagenInput) {
                imagenInput.value = data.url;
            }

            Swal.fire({
                icon: 'success',
                title: '¡Imagen subida!',
                text: 'La imagen se ha subido correctamente',
                timer: 2500,
                showConfirmButton: false
            });

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
                    actualizarEstadoBoton();
                }
            } else {
                imagenSubida = false;
                urlImagen = "";
                if (imagenInput) {
                    imagenInput.value = "";
                }
                actualizarEstadoBoton();
            }
        });
    }

    // Manejar el envío del formulario
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
    
            // Mostrar loading
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status"></span> Procesando...
            `;
    
            // Validar que la imagen se haya subido si hay un archivo seleccionado
            if (fotoInput.files?.length && !imagenSubida) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                Swal.fire({
                    icon: 'warning',
                    title: 'Imagen no subida',
                    text: 'Debes subir la imagen seleccionada antes de crear el producto',
                    timer: 2500,
                    showConfirmButton: false
                });
                return;
            }
    
            // Validar que haya una URL de imagen
            if (!urlImagen) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                Swal.fire({
                    icon: 'error',
                    title: 'Imagen requerida',
                    text: 'Debes subir una imagen antes de crear el producto',
                    timer: 2500,
                    showConfirmButton: false
                });
                return;
            }
    
            // Validar categoría seleccionada
            const categoriaId = document.getElementById('categoria').value;
            if (!categoriaId) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                Swal.fire({
                    icon: 'error',
                    title: 'Categoría requerida',
                    text: 'Debes seleccionar una categoría para el producto',
                    timer: 2500,
                    showConfirmButton: false
                });
                return;
            }
    
            // Recoger los datos del formulario
            const producto = {
                nombre: document.getElementById('nombre').value,
                precio: document.getElementById('precio').value,
                descripcion: document.getElementById('descripcion').value,
                imagen_url: urlImagen,
                estado: document.getElementById('estado').value,
                categoria_id: categoriaId,
                negocio_id: id_usuario
            };
    
            // Enviar los datos al servidor
            fetch(urls.registrarProducto, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify(producto)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        throw new Error(data.error);
                    }
    
                    // Limpiar la imagen anterior ya que ahora está asociada a un producto
                    imagenAnteriorSubida = null;
    
                    return Swal.fire({
                        icon: 'success',
                        title: '¡Producto creado!',
                        text: 'El producto se ha registrado correctamente',
                        timer: 2500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = urls.urlMainNegocio;
                    });
                })
                .then(() => {
                    form.reset();
                    imagenSubida = false;
                    archivoActual = null;
                    urlImagen = "";
                    actualizarEstadoBoton();
                    cargarCategorias(); // Recargar categorías por si hubo cambios
                    
                    // Redirigir después de que se cierre la alerta
                    window.location.href = urls.urlMainNegocio;
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Error al registrar el producto',
                        timer: 2500,
                        showConfirmButton: false
                    });
                })
                .finally(() => {
                    // Restaurar el botón
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
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

    // Inicializar
    actualizarEstadoBoton();
    cargarCategorias(); // Cargar categorías al iniciar
});