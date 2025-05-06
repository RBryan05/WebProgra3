document.addEventListener('DOMContentLoaded', () => {
    const productoId = localStorage.getItem('selectedProductId');
    const comentariosLista = document.getElementById('comentariosLista');
    const comentariosSeccion = document.getElementById('comentariosListaContainer');
    const urlsDiv = document.getElementById("static-data");
    const defaultProfileUrl = urlsDiv ? urlsDiv.getAttribute("data-imagen-perfil") : null;
    const defaultBusinessUrl = urlsDiv ? urlsDiv.getAttribute("data-imagen-negocio") : null;

    // Obtener usuario logeado
    const usuarioLogeado = JSON.parse(localStorage.getItem('usuario'));
    const usuarioLogeadoId = usuarioLogeado?.id || null;
    const usuarioLogeadoTipo = usuarioLogeado?.tipo_usuario || null;

    if (!productoId) {
        console.warn('No se encontró selectedProductId en localStorage.');
        return;
    }

    function cargarComentarios() {
        fetch(`/obtener_comentarios_producto/${productoId}/`)
            .then(response => {
                if (response.status === 404) return [];
                if (!response.ok) throw new Error('Error al obtener comentarios.');
                return response.json();
            })
            .then(comentarios => {
                comentariosLista.innerHTML = '';

                if (!Array.isArray(comentarios)) {
                    throw new Error('Formato de respuesta inválido');
                }

                if (comentarios.length === 0) {
                    comentariosLista.innerHTML = '<p class="no-comments">No hay comentarios aún.</p>';
                    return;
                }

                // Separar comentarios y respuestas
                const comentariosPrincipales = comentarios.filter(c => !c.esRespuesta);
                const respuestas = comentarios.filter(c => c.esRespuesta);

                // Crear array de promesas para todos los comentarios
                const promesasComentarios = comentariosPrincipales.map(comentario => {
                    return crearItemComentario(comentario)
                        .then(item => {
                            comentariosLista.appendChild(item);
                            return { item, comentario };
                        });
                });

                // Cuando todos los comentarios estén creados
                Promise.all(promesasComentarios)
                    .then(resultados => {
                        // Dentro de la función cargarComentarios(), modifica la parte donde manejas las respuestas:
                        resultados.forEach(({ item, comentario }) => {
                            // Filtrar respuestas para este comentario específico
                            const respuestasDeEsteComentario = respuestas.filter(r =>
                                r.comentario_respuesta === comentario.id
                            );

                            // Obtener elementos del DOM
                            const respuestasContainer = item.querySelector('.respuestas-container');
                            const btnVerRespuestas = item.querySelector('.btn-ver-respuestas');
                            const btnOcultarRespuestas = item.querySelector('.btn-ocultar-respuestas');
                            const respuestasCount = item.querySelector('.respuestas-count');
                            const controlesRespuestas = item.querySelector('.controles-respuestas');

                            // Mostrar botón si hay respuestas
                            if (respuestasDeEsteComentario.length > 0 && respuestasContainer) {
                                if (respuestasCount) {
                                    respuestasCount.textContent = respuestasDeEsteComentario.length;
                                }
                                if (btnVerRespuestas) {
                                    btnVerRespuestas.style.display = 'inline-block';
                                }

                                // Agregar las primeras 3 respuestas
                                respuestasDeEsteComentario.slice(0, 3).forEach(respuesta => {
                                    crearItemRespuesta(respuesta, comentario)
                                        .then(respuestaItem => {
                                            respuestasContainer.appendChild(respuestaItem);
                                        });
                                });

                                // Si hay más de 3 respuestas, crear contenedor de controles adicionales
                                if (respuestasDeEsteComentario.length > 3) {
                                    const btnCargarMas = document.createElement('button');
                                    btnCargarMas.className = 'btn-cargar-mas-respuestas';

                                    // Calcular respuestas restantes inicialmente
                                    let respuestasRestantes = respuestasDeEsteComentario.length - 3;
                                    btnCargarMas.textContent = `Ver ${respuestasRestantes} más ▼`;

                                    // Crear contenedor para ambos botones
                                    const controlesAdicionales = document.createElement('div');
                                    controlesAdicionales.className = 'controles-adicionales';
                                    controlesAdicionales.style.display = 'none'; // Oculto inicialmente

                                    // Agregar botones al contenedor
                                    controlesAdicionales.appendChild(btnCargarMas);
                                    if (btnOcultarRespuestas) {
                                        controlesAdicionales.appendChild(btnOcultarRespuestas);
                                    }

                                    // Insertar después del contenedor de respuestas
                                    respuestasContainer.parentNode.insertBefore(controlesAdicionales, respuestasContainer.nextSibling);

                                    // Agregar las respuestas restantes ocultas
                                    respuestasDeEsteComentario.slice(3).forEach(respuesta => {
                                        crearItemRespuesta(respuesta, comentario)
                                            .then(respuestaItem => {
                                                respuestaItem.style.display = 'none';
                                                respuestasContainer.appendChild(respuestaItem);
                                            });
                                    });

                                    let respuestasMostradas = 3;
                                    btnCargarMas.addEventListener('click', () => {
                                        const respuestasOcultas = respuestasContainer.querySelectorAll('.respuesta-item[style="display: none;"]');
                                        const mostrar = Math.min(3, respuestasOcultas.length);

                                        for (let i = 0; i < mostrar; i++) {
                                            respuestasOcultas[i].style.display = 'block';
                                        }

                                        respuestasMostradas += mostrar;
                                        respuestasRestantes = respuestasDeEsteComentario.length - respuestasMostradas;

                                        // Actualizar texto del botón
                                        if (respuestasRestantes > 0) {
                                            btnCargarMas.textContent = `Ver ${respuestasRestantes} más`;
                                        } else {
                                            btnCargarMas.textContent = 'No hay más respuestas';
                                        }
                                    });

                                    // Mostrar controles adicionales cuando se muestran las respuestas
                                    if (btnVerRespuestas && controlesAdicionales) {
                                        btnVerRespuestas.addEventListener('click', () => {
                                            respuestasContainer.style.display = 'block';
                                            btnVerRespuestas.style.display = 'none';
                                            controlesAdicionales.style.display = 'block';
                                        });
                                    }

                                    // Ocultar respuestas y controles adicionales
                                    if (btnOcultarRespuestas) {
                                        btnOcultarRespuestas.addEventListener('click', () => {
                                            respuestasContainer.style.display = 'none';
                                            controlesAdicionales.style.display = 'none';
                                            btnVerRespuestas.style.display = 'inline-block';
                                        });
                                    }
                                }
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Error al procesar comentarios:', error);
                    });
            })
            .catch(error => {
                console.error('Error al cargar los comentarios:', error);
                comentariosLista.innerHTML = `
                    <p class="error-comments">
                        Error al cargar los comentarios.
                        <button onclick="window.location.reload()">Reintentar</button>
                    </p>
                `;
            });
    }

    // Función para crear elemento de comentario principal
    function crearItemComentario(comentario) {
        return new Promise((resolve) => {
            const item = document.createElement('div');
            item.classList.add('comentario-item');
            item.dataset.comentarioId = comentario.id;

            // Determinar si el autor es usuario o negocio
            const esAutorUsuario = comentario.usuario !== null;
            const autorUrl = esAutorUsuario ?
                `/obtener_usuario_por_id/${comentario.usuario}/` :
                `/obtener_negocio_por_id/${comentario.negocio}/`;

            // Determinar si mostrar acciones (eliminar)
            const mostrarAcciones = (usuarioLogeadoTipo === 'normal' && esAutorUsuario && usuarioLogeadoId === comentario.usuario) ||
                (usuarioLogeadoTipo === 'negocio' && !esAutorUsuario && usuarioLogeadoId === comentario.negocio);

            // Obtener info del autor
            fetch(autorUrl)
                .then(res => res.ok ? res.json() : null)
                .then(autor => {
                    const fecha = new Date(comentario.creado_en).toLocaleDateString();
                    let nombre, foto;

                    if (esAutorUsuario) {
                        nombre = autor?.nombre + " (Usuario)" || `Usuario #${comentario.usuario}`;
                        foto = autor?.foto_perfil || defaultProfileUrl;
                    } else {
                        nombre = autor?.nombre + " (Negocio)" || `Negocio #${comentario.negocio}`;
                        foto = autor?.foto_perfil || defaultBusinessUrl;
                    }

                    item.innerHTML = `
                        <div class="comentario-card">
                            <div class="comentario-header">
                                <img src="${foto}" alt="${nombre}" class="comentario-avatar">
                                <div class="comentario-user-info">
                                    <p class="comentario-autor">${nombre}</p>
                                    <p class="comentario-fecha">${fecha}</p>
                                </div>
                                <div class="comentario-calificacion">
                                    <span>⭐ ${comentario.calificacion}/5</span>
                                </div>
                            </div>
                            <div class="comentario-texto">
                                <p>${comentario.texto}</p>
                            </div>
                            <div class="comentario-acciones">
                                <button class="btn-responder">Responder</button>
                                ${mostrarAcciones ? '<button class="btn-eliminar">Eliminar</button>' : ''}
                            </div>
                            <div class="respuestas-container" id="respuestas-${comentario.id}">
                                <!-- Las respuestas se agregarán aquí dinámicamente -->
                            </div>
                            <button class="btn-ver-respuestas" data-comentario-id="${comentario.id}" style="display: none;">
                                <span class="respuestas-count">0</span> respuestas ▼
                            </button>
                            <button class="btn-ocultar-respuestas" data-comentario-id="${comentario.id}" style="display: none;">
                                Ocultar respuestas ▲
                            </button>
                        </div>
                    `;

                    // Configurar eventos
                    const btnVerRespuestas = item.querySelector('.btn-ver-respuestas');
                    const btnOcultarRespuestas = item.querySelector('.btn-ocultar-respuestas');
                    const respuestasContainer = item.querySelector('.respuestas-container');
                    const respuestasCount = item.querySelector('.respuestas-count');

                    if (btnVerRespuestas && btnOcultarRespuestas && respuestasContainer) {
                        btnVerRespuestas.addEventListener('click', () => {
                            respuestasContainer.style.display = 'block';
                            btnVerRespuestas.style.display = 'none';
                            btnOcultarRespuestas.style.display = 'inline-block';
                        });

                        btnOcultarRespuestas.addEventListener('click', () => {
                            respuestasContainer.style.display = 'none';
                            btnOcultarRespuestas.style.display = 'none';
                            btnVerRespuestas.style.display = 'inline-block';
                        });
                    }

                    if (mostrarAcciones) {
                        item.querySelector('.btn-eliminar').addEventListener('click', () => {
                            eliminarComentario(comentario.id);
                        });
                    }

                    item.querySelector('.btn-responder').addEventListener('click', () => {
                        responderComentario(comentario.id, nombre);
                    });

                    resolve(item);
                })
                .catch(error => {
                    console.error('Error al obtener autor:', error);
                    // Versión de respaldo si falla la petición
                    const nombre = esAutorUsuario ? `Usuario #${comentario.usuario}` : `Negocio #${comentario.negocio}`;
                    item.innerHTML = `
                        <div class="comentario-card">
                            <div class="comentario-header">
                                <div class="comentario-user-info">
                                    <p class="comentario-autor">${nombre}</p>
                                    <p class="comentario-fecha">${new Date(comentario.creado_en).toLocaleDateString()}</p>
                                </div>
                                <div class="comentario-calificacion">
                                    <span>⭐ ${comentario.calificacion}/5</span>
                                </div>
                            </div>
                            <div class="comentario-texto">
                                <p>${comentario.texto}</p>
                            </div>
                            <div class="comentario-acciones">
                                <button class="btn-responder">Responder</button>
                                ${mostrarAcciones ? '<button class="btn-eliminar">Eliminar</button>' : ''}
                            </div>
                            <div class="respuestas-container" id="respuestas-${comentario.id}">
                                <!-- Las respuestas se agregarán aquí dinámicamente -->
                            </div>
                            <button class="btn-ver-respuestas" data-comentario-id="${comentario.id}" style="display: none;">
                                <span class="respuestas-count">0</span> respuestas ▼
                            </button>
                            <button class="btn-ocultar-respuestas" data-comentario-id="${comentario.id}" style="display: none;">
                                Ocultar respuestas ▲
                            </button>
                        </div>
                    `;
                    resolve(item);
                });
        });
    }

    // Función para crear elemento de respuesta
    function crearItemRespuesta(respuesta, comentarioPadre) {
        return new Promise((resolve) => {
            const item = document.createElement('div');
            item.classList.add('respuesta-item');
            item.dataset.respuestaId = respuesta.id;

            // Determinar si mostrar acciones (eliminar)
            const mostrarAcciones = (usuarioLogeadoTipo === 'normal' && respuesta.usuario === usuarioLogeadoId) ||
                (usuarioLogeadoTipo === 'negocio' && respuesta.negocio === usuarioLogeadoId);

            // Obtener información del autor de la respuesta
            const esAutorUsuario = respuesta.usuario !== null;
            const autorUrl = esAutorUsuario ?
                `/obtener_usuario_por_id/${respuesta.usuario}/` :
                `/obtener_negocio_por_id/${respuesta.negocio}/`;

            fetch(autorUrl)
                .then(res => res.ok ? res.json() : null)
                .then(autor => {
                    const fecha = new Date(respuesta.creado_en).toLocaleDateString();
                    let nombre, foto;

                    if (esAutorUsuario) {
                        nombre = autor?.nombre + " (Usuario)" || `Usuario #${respuesta.usuario}`;
                        foto = autor?.foto_perfil || defaultProfileUrl;
                    } else {
                        nombre = autor?.nombre + " (Negocio)" || `Negocio #${respuesta.negocio}`;
                        foto = autor?.foto_perfil || defaultBusinessUrl;
                    }

                    // Obtener información del comentario padre
                    const textoComentarioPadre = comentarioPadre.texto.length > 100 ?
                        comentarioPadre.texto.substring(0, 100) + '...' :
                        comentarioPadre.texto;

                    item.innerHTML = `
                    <div class="respuesta-card">
                        <div class="respuesta-header">
                            <img src="${foto}" alt="${nombre}" class="respuesta-avatar">
                            <div class="respuesta-user-info">
                                <p class="respuesta-autor">${nombre}</p>
                                <p class="respuesta-fecha">${fecha}</p>
                            </div>
                        </div>
                        <div class="respuesta-texto">
                            <p>${respuesta.texto}</p>
                        </div>
                        <div class="respuesta-acciones">
                            ${mostrarAcciones ? '<button class="btn-eliminar-respuesta">Eliminar</button>' : ''}
                        </div>
                    </div>
                `;

                    // Agregar evento de eliminar si es necesario
                    if (mostrarAcciones) {
                        item.querySelector('.btn-eliminar-respuesta').addEventListener('click', () => {
                            eliminarComentario(respuesta.id);
                        });
                    }

                    resolve(item);
                })
                .catch(error => {
                    console.error('Error al obtener autor de respuesta:', error);
                    // Versión simplificada si falla la obtención del autor
                    const nombre = esAutorUsuario ? `Usuario #${respuesta.usuario}` : `Negocio #${respuesta.negocio}`;

                    item.innerHTML = `
                    <div class="respuesta-card">
                        <div class="respuesta-contexto" data-comentario-id="${comentarioPadre.id}">
                            <span class="respuesta-a">En respuesta a:</span>
                            <blockquote>${textoComentarioPadre}</blockquote>
                        </div>
                        <div class="respuesta-texto">
                            <p>${respuesta.texto}</p>
                        </div>
                    </div>
                `;

                    resolve(item);
                });
        });
    }

    // Función para eliminar comentario
    function eliminarComentario(comentarioId) {
        if (confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
            fetch(`/comentarios/eliminar/${comentarioId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
                .then(response => {
                    if (response.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Comentario eliminado!',
                            showConfirmButton: false,
                            timer: 2500
                        }).then(() => {
                            window.location.reload(); // Recargar para actualizar la lista de comentarios
                        });
                    } else {
                        throw new Error('Error al eliminar comentario');
                    }
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'No se pudo eliminar el comentario',
                        showConfirmButton: false,
                        timer: 2500
                    })
                });
        }
    }

    // Función para manejar el envío de comentarios/respuestas
    function manejarEnvioComentario(event) {
        event.preventDefault();

        const productoId = localStorage.getItem('selectedProductId');
        const usuarioLogeado = JSON.parse(localStorage.getItem('usuario'));
        const textarea = document.getElementById('nuevoComentario');
        const comentarioTexto = textarea.value.trim();

        if (!comentarioTexto) {
            Swal.fire({
                icon: 'info',
                title: 'Por favor escribe un comentario',
                showConfirmButton: false,
                timer: 2500
            });
            return;
        }

        if (!productoId) {
            Swal.fire({
                icon: 'error',
                title: 'Lo sentimos',
                showConfirmButton: false,
                text: 'No se pudo enviar el comentario',
                timer: 2500
            })
            return;
        }

        if (!usuarioLogeado) {
            Swal.fire({
                icon: 'info',
                title: 'Debes iniciar sesión para comentar',
                showConfirmButton: false,
                timer: 2500
            });
            return;
        }

        // Determinar si es un comentario normal o una respuesta
        const esRespuesta = textarea.dataset.respuestaA !== undefined;
        const comentarioIdRespuesta = esRespuesta ? textarea.dataset.respuestaA : null;

        // Preparar los datos para enviar
        const comentarioData = {
            producto: productoId,
            texto: comentarioTexto,
            calificacion: 5, // Puedes ajustar esto si tienes un sistema de calificación
            esRespuesta: esRespuesta,
            comentario_respuesta: comentarioIdRespuesta
        };

        // Determinar si el usuario es normal o negocio
        if (usuarioLogeado.tipo_usuario === 'normal') {
            comentarioData.usuario = usuarioLogeado.id;
            comentarioData.negocio = null;
        } else if (usuarioLogeado.tipo_usuario === 'negocio') {
            comentarioData.negocio = usuarioLogeado.id;
            comentarioData.usuario = null;
        }

        // Enviar el comentario al servidor
        fetch('/comentarios/crear/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(comentarioData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al enviar el comentario');
                }
                return response.json();
            })
            .then(data => {
                // Limpiar el textarea
                textarea.value = '';
                textarea.removeAttribute('data-respuesta-a');

                // Recargar los comentarios
                cargarComentarios();

                // Mostrar mensaje de éxito
                if(esRespuesta) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Respuesta enviada!',
                        showConfirmButton: false,
                        timer: 2500
                    });
                }
                else {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Comentario enviado!',
                        showConfirmButton: false,
                        timer: 2500
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Lo sentimos',
                    showConfirmButton: false,
                    text: 'No se pudo enviar el comentario',
                    timer: 2500
                })
            });
    }

    function responderComentario(comentarioId, nombreAutor) {
        // Cerrar cualquier formulario de respuesta existente primero
        const formulariosExistente = document.querySelectorAll('.respuesta-form-container');
        formulariosExistente.forEach(form => form.remove());
    
        const comentarioItem = document.querySelector(`.comentario-item[data-comentario-id="${comentarioId}"]`);
    
        // Crear formulario de respuesta
        const formContainer = document.createElement('div');
        formContainer.className = 'respuesta-form-container';
        formContainer.innerHTML = `
            <div class="respuesta-header">
                <span>Respondiendo a ${nombreAutor}</span>
            </div>
            <form class="form-respuesta" data-comentario-id="${comentarioId}">
                <textarea placeholder="Escribe tu respuesta aquí..." required></textarea>
                <div class="respuesta-actions">
                    <button type="button" class="btn-cancelar-respuesta">Cancelar</button>
                    <button type="submit" class="btn-enviar-respuesta">Enviar</button>
                </div>
            </form>
        `;
    
        // Insertar después del comentario
        comentarioItem.insertAdjacentElement('afterend', formContainer);
    
        // Eventos
        formContainer.querySelector('.btn-cancelar-respuesta').addEventListener('click', () => {
            formContainer.remove();
        });
    
        formContainer.querySelector('.form-respuesta').addEventListener('submit', function (e) {
            e.preventDefault();
            const texto = this.querySelector('textarea').value.trim();
            if (texto) {
                enviarRespuesta(comentarioId, texto);
                formContainer.remove();
            }
        });
    
        formContainer.querySelector('textarea').focus();
    }

    function enviarRespuesta(comentarioId, texto) {
        const usuarioLogeado = JSON.parse(localStorage.getItem('usuario'));
        const productoId = localStorage.getItem('selectedProductId');

        if (!usuarioLogeado || !productoId) return;

        const comentarioData = {
            producto: productoId,
            texto: texto,
            calificacion: 5,
            esRespuesta: true,
            comentario_respuesta: comentarioId
        };

        if (usuarioLogeado.tipo_usuario === 'normal') {
            comentarioData.usuario = usuarioLogeado.id;
            comentarioData.negocio = null;
        } else {
            comentarioData.negocio = usuarioLogeado.id;
            comentarioData.usuario = null;
        }

        fetch('/comentarios/crear/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(comentarioData)
        })
            .then(response => {
                if (!response.ok) throw new Error('Error al enviar respuesta');
                return response.json();
            })
            .then(() => {
                cargarComentarios(); // Recargar todos los comentarios
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Lo sentimos',
                    showConfirmButton: false,
                    text: 'No se pudo enviar la respuesta',
                    timer: 2500
                })
            });
    }

    // Asignar el evento al formulario
    document.getElementById('formComentario').addEventListener('submit', manejarEnvioComentario);

    // Función auxiliar para obtener cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    cargarComentarios();
});