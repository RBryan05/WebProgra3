document.addEventListener('DOMContentLoaded', async function () {
    // Variables de estado
    let urlImagen = "";
    let imagenSubida = false;
    let archivoActual = null;
    let fotoOriginal = null;

    // Elementos del DOM
    const fotoInput = document.getElementById('foto');
    const fotoPerfil = document.getElementById('foto-perfil');
    const btnSubirAWS = document.getElementById('btn-subir-aws');
    const nombre = document.getElementById('nombre');
    const nombreUsuario = document.getElementById('nombre-usuario');
    const urlsDiv = document.getElementById('urls');
    const form = document.getElementById('form-editar-perfil');
    const uploadBtn = document.querySelector('.upload-btn');
    const submitBtn = document.getElementById('submit-btn');
    const spinner = document.getElementById('spinner');
    const btnText = document.getElementById('btn-text');

    // URLs y configuraciones
    const imagenDefecto = urlsDiv.dataset.imagenDefecto;
    const loginRedirect = document.getElementById('login').dataset.loginRedirect;
    const miPerfilUrl = urlsDiv.dataset.miPerfil;
    const urlBaseUsuario = urlsDiv.dataset.obtenerUsuario;
    const subirImagenUrl = urlsDiv.dataset.subirImagenUrl;
    const usuarioLogeado = JSON.parse(localStorage.getItem('usuarioLogeado'));
    const actualizarPerfilUrl = `/actualizar_usuario/${usuarioLogeado?.id}/`;

    // Función para actualizar estado del botón de subida
    function actualizarEstadoBotonSubir() {
        if (!btnSubirAWS) return;

        btnSubirAWS.disabled = !fotoInput.files?.length || imagenSubida;

        if (imagenSubida) {
            btnSubirAWS.innerHTML = `<i class="bi bi-check-circle"></i> Imagen Subida`;
            btnSubirAWS.classList.remove('btn-success');
            btnSubirAWS.classList.add('btn-secondary');
        } else {
            btnSubirAWS.innerHTML = `<i class="bi bi-cloud-upload"></i> Subir`;
            btnSubirAWS.classList.remove('btn-secondary');
            btnSubirAWS.classList.add('btn-success');
        }
    }

    // Función para cargar datos del usuario
    async function cargarDatosUsuario() {
        try {
            const usuarioLogeadoStr = localStorage.getItem('usuarioLogeado');
            let usuarioUsername;

            if (usuarioLogeadoStr) {
                try {
                    const usuarioLogeado = JSON.parse(usuarioLogeadoStr);
                    usuarioUsername = usuarioLogeado.nombre_usuario || usuarioLogeado;
                } catch {
                    usuarioUsername = usuarioLogeadoStr;
                }
            }

            if (!usuarioUsername) {
                window.location.href = loginRedirect;
                return;
            }

            const response = await fetch(`${urlBaseUsuario}${usuarioUsername}/`);

            if (!response.ok) {
                throw new Error('Usuario no encontrado');
            }

            const usuario = await response.json();

            // Llenar campos del formulario
            nombre.value = usuario.nombre || '';
            fotoPerfil.src = usuario.foto_perfil || imagenDefecto;
            nombreUsuario.textContent = `@${usuario.nombre_usuario || 'usuario'}`;

            fotoOriginal = usuario.foto_perfil;

        } catch (error) {
            console.error(error);
            window.location.href = loginRedirect;
        }
    }

    // Función para subir imagen a AWS
    async function subirImagenAWS() {
        if (!fotoInput.files?.length || imagenSubida) return;

        const file = fotoInput.files[0];
        const originalHTML = btnSubirAWS.innerHTML;

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

            urlImagen = data.url;

            // 3. Preparar datos para enviar
            const payload = {
                nombre: nombre.value,
                foto_perfil: urlImagen || fotoPerfil.src
            };
            const updateResponse = await fetch(actualizarPerfilUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify(payload)
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json().catch(() => ({}));
                console.error('Error detallado:', {
                    status: updateResponse.status,
                    error: errorData.error || 'Error desconocido'
                });
                throw new Error(errorData.error || `Error ${updateResponse.status}`);
            }

            fotoPerfil.src = data.url;
            localStorage.setItem('imagenPerfil', data.url);
            urlImagen = data.url;
            imagenSubida = true;
            archivoActual = file.name;

            Swal.fire({
                icon: 'success',
                title: '¡Imagen subida!',
                text: 'La imagen se ha subido correctamente a AWS S3',
                timer: 2000,
                showConfirmButton: false
            });

            // Eliminar la imagen anterior si existe y es diferente a la predeterminada
            if (fotoOriginal && fotoOriginal !== imagenDefecto && fotoOriginal !== data.url) {
                await eliminarImagenAWS(fotoOriginal);
            }

        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al subir la imagen',
                timer: 2000,
                showConfirmButton: false
            });
        } finally {
            actualizarEstadoBotonSubir();
        }
    }

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
            await cargarDatosUsuario();
            return true;
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            return false;
        }
    }

    // Función para actualizar el perfil
async function actualizarPerfil(event) {
    event.preventDefault();

    if (!submitBtn) return;

    const originalText = btnText.textContent;
    
    try {
        submitBtn.disabled = true;
        btnText.textContent = 'Guardando...';
        spinner.classList.remove('d-none');

        // 1. Obtener usuario actual
        const usuario = JSON.parse(localStorage.getItem('usuarioLogeado'));
        if (!usuario?.id) throw new Error('Usuario no identificado');

        // 2. Determinar qué foto usar:
        // - Si hay imagen subida: usar la nueva URL
        // - Si hay archivo seleccionado pero no subido: mantener la original
        // - Si no hay archivo seleccionado: mantener la original
        let fotoParaGuardar = fotoOriginal; // Por defecto, mantener la original
        
        if (imagenSubida) {
            fotoParaGuardar = urlImagen; // Usar la nueva imagen subida
        } else if (fotoInput.files?.length) {
            // Hay archivo seleccionado pero no subido - mostrar advertencia
            const confirmacion = await Swal.fire({
                icon: 'warning',
                title: 'Imagen no subida',
                html: 'Has seleccionado una imagen pero no la has subido. ¿Qué deseas hacer?',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Subir ahora',
                denyButtonText: 'Mantener foto actual',
                cancelButtonText: 'Cancelar'
            });

            if (confirmacion.isConfirmed) {
                // Subir la imagen primero
                await subirImagenAWS();
                fotoParaGuardar = urlImagen;
            } else if (confirmacion.isDenied) {
                // Mantener la foto actual
                fotoParaGuardar = fotoOriginal;
            } else {
                // Cancelar la operación
                submitBtn.disabled = false;
                btnText.textContent = originalText;
                spinner.classList.add('d-none');
                return;
            }
        }

        // 3. Preparar datos para enviar
        const payload = {
            nombre: nombre.value,
            foto_perfil: fotoParaGuardar
        };

        // 4. Enviar solicitud de actualización
        const updateResponse = await fetch(actualizarPerfilUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify(payload)
        });

        if (!updateResponse.ok) {
            const error = await updateResponse.json().catch(() => ({}));
            throw new Error(error.error || `Error ${updateResponse.status}`);
        }

        const data = await updateResponse.json();

        Swal.fire({
            icon: 'success',
            title: '¡Perfil actualizado!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = miPerfilUrl;
        });

        localStorage.setItem("usuario", JSON.stringify({
            id: data.id,
            nombre_usuario: data.nombre_usuario,
            nombre: data.nombre,
            foto_perfil: data.foto_perfil,
            tipo_usuario: data.tipo_usuario
        }));

        localStorage.setItem("usuarioLogeado", JSON.stringify({
            nombre_usuario: data.nombre_usuario,  // Mantenemos el nombre de usuario
            id: data.id || null,                  // Añadimos el ID
            foto_perfil: data.foto_perfil || null, // Añadimos la imagen de perfil          
        }));

    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Error al guardar cambios',
            timer: 2000,
            showConfirmButton: false
        });
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            btnText.textContent = originalText;
            spinner.classList.add('d-none');
        }
    }
}

    // Event Listeners
    if (btnSubirAWS) {
        btnSubirAWS.addEventListener('click', subirImagenAWS);
    }

    if (form) {
        form.addEventListener('submit', actualizarPerfil);
    }

    if (fotoInput) {
        fotoInput.addEventListener('change', function (e) {
            if (e.target.files && e.target.files[0]) {
                const nuevoArchivo = e.target.files[0];

                if (!archivoActual || nuevoArchivo.name !== archivoActual) {
                    imagenSubida = false;
                    urlImagen = "";
                }

                const reader = new FileReader();
                reader.onload = function (event) {
                    fotoPerfil.src = event.target.result;
                };
                reader.readAsDataURL(e.target.files[0]);
            } else {
                imagenSubida = false;
                urlImagen = "";
            }
            actualizarEstadoBotonSubir();
        });
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', function () {
            fotoInput.click();
        });
    }

    // Inicializar
    actualizarEstadoBotonSubir();
    await cargarDatosUsuario();
});