document.addEventListener('DOMContentLoaded', function () {
    // Variables de estado
    let archivoActual = null;
    let urlImagen = "";
    let imagenEliminar = "";
    let imagenAnteriorSubida = null;

    // Obtener las URLs desde el div
    const urlsDiv = document.getElementById('urls');
    const urls = {
        subirImagenUrl: urlsDiv.dataset.subirImagenUrl,
        registrarCategoria: urlsDiv.dataset.registrarCategoria,
        urlAgregarProducto: urlsDiv.dataset.urlAgregarProducto
    };

    // Obtener elementos del DOM
    const fotoInput = document.getElementById('foto');
    const uploadBtn = document.querySelector('.upload-btn');
    const form = document.getElementById('categoriaForm');

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

    // Función para subir imagen a AWS
    async function subirImagenAWS(file) {
        try {
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

            // Actualizar estado
            archivoActual = file.name;
            urlImagen = data.url;
            imagenEliminar = data.url;
            imagenAnteriorSubida = imagenEliminar;

            return { success: true, url: data.url };
        } catch (error) {
            console.error('Error:', error);
            return { success: false, error: error.message || 'Error al subir la imagen' };
        }
    }

    // Evento cuando se selecciona una nueva imagen
    if (fotoInput) {
        fotoInput.addEventListener('change', function (e) {
            if (e.target.files && e.target.files[0]) {
                const nuevoArchivo = e.target.files[0];
                if (!archivoActual || nuevoArchivo.name !== archivoActual) {
                    archivoActual = null;
                    urlImagen = "";
                }
            } else {
                archivoActual = null;
                urlImagen = "";
            }
        });
    }

    // Manejar el envío del formulario
    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
    
            // Mostrar loading
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status"></span> Procesando...
            `;
    
            try {
                // Validar que haya una imagen seleccionada
                if (!fotoInput.files?.length) {
                    throw new Error('Debes seleccionar una imagen para la categoría');
                }
    
                // Subir la imagen a AWS
                const file = fotoInput.files[0];
                const uploadResult = await subirImagenAWS(file);
    
                if (!uploadResult.success) {
                    throw new Error(uploadResult.error);
                }
    
                // Recoger los datos del formulario
                const categoria = {
                    nombre: document.getElementById('nombre').value,
                    imagen_url: uploadResult.url,
                    negocio_id: JSON.parse(localStorage.getItem("usuario")).id
                };
    
                // Registrar la categoría
                const response = await fetch(urls.registrarCategoria, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
                    },
                    body: JSON.stringify(categoria)
                });
    
                const data = await response.json();
    
                if (!response.ok) {
                    // Si falla el registro, eliminar la imagen subida
                    await eliminarImagenAWS(uploadResult.url);
                    throw new Error(data.error || 'Error al registrar la categoría');
                }
    
                // Limpiar la imagen anterior ya que ahora está asociada a una categoría
                imagenAnteriorSubida = null;
    
                // Mostrar alerta de éxito y luego redirigir
                await Swal.fire({
                    icon: 'success',
                    title: '¡Categoría creada!',
                    text: 'La categoría se ha registrado correctamente',
                    timer: 2500,
                    showConfirmButton: false
                });
    
                // Redirigir después de que se cierre la alerta
                window.location.href = urls.urlAgregarProducto;
    
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Ocurrió un error al procesar la solicitud',
                    timer: 2500,
                    showConfirmButton: false
                });
            } finally {
                // Restaurar el botón (pero no redirigir aquí)
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }

    // Event listener para el botón de upload
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => fotoInput.click());
    }
});