// Función para configurar la selección de estrellas
function configurarSeleccionEstrellas() {
    const estrellas = document.querySelectorAll('.estrella-seleccionable');
    const inputCalificacion = document.getElementById('calificacionInput');
    const valorDisplay = document.createElement('span'); // Creamos un elemento para mostrar el valor
    
    // Añadimos el display del valor junto a las estrellas
    valorDisplay.className = 'valor-calificacion';
    valorDisplay.textContent = '5/5'; // Valor por defecto
    document.querySelector('.estrellas-seleccion').appendChild(valorDisplay);
    
    estrellas.forEach((estrella, index) => {
        estrella.addEventListener('click', () => {
            const valorSeleccionado = index + 1;
            inputCalificacion.value = valorSeleccionado; // Guardamos el valor en el input oculto
            valorDisplay.textContent = valorSeleccionado + '/5'; // Actualizamos el display
            
            estrellas.forEach((star, i) => {
                if (i <= index) {
                    star.classList.remove('bi-star');
                    star.classList.add('bi-star-fill');
                    star.classList.add('seleccionada');
                } else {
                    star.classList.remove('bi-star-fill');
                    star.classList.remove('seleccionada');
                    star.classList.add('bi-star');
                }
            });
        });
        
        // Efectos hover
        estrella.addEventListener('mouseover', () => {
            const hoverIndex = index + 1;
            valorDisplay.textContent = hoverIndex  + '/5'; // Mostramos valor temporal durante hover
            estrellas.forEach((star, i) => {
                if (i < hoverIndex) {
                    star.classList.add('hover');
                } else {
                    star.classList.remove('hover');
                }
            });
        });
        
        estrella.addEventListener('mouseout', () => {
            valorDisplay.textContent = inputCalificacion.value + '/5'; // Volvemos al valor seleccionado
            estrellas.forEach(star => {
                star.classList.remove('hover');
            });
        });
    });
    
    // Establecer calificación por defecto (5 estrellas)
    inputCalificacion.value = 5;
    estrellas.forEach(star => {
        star.classList.remove('bi-star');
        star.classList.add('bi-star-fill');
        star.classList.add('seleccionada');
    });
}

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

    function actualizarPromedioCalificaciones(comentarios) {
        const comentariosCalificados = comentarios.filter(c => !c.esRespuesta && c.calificacion);
        
        if (comentariosCalificados.length === 0) {
            document.getElementById('promedioCalificacion').textContent = '0.0';
            document.getElementById('cantidadCalificaciones').textContent = '(No hay reseñas de este producto)';
            renderizarEstrellasPromedio(0);
            return;
        }
        
        const suma = comentariosCalificados.reduce((total, c) => total + c.calificacion, 0);
        const promedio = suma / comentariosCalificados.length;
        const promedioRedondeado = Math.round(promedio * 2) / 2;
    
        document.getElementById('promedioCalificacion').textContent = promedioRedondeado.toFixed(1);
        document.getElementById('cantidadCalificaciones').textContent = `(${comentariosCalificados.length} reseñas)`;
        renderizarEstrellasPromedio(promedioRedondeado);
    }

    function renderizarEstrellasPromedio(promedio) {
        const contenedor = document.getElementById('estrellasPromedio');
        contenedor.innerHTML = '';
        
        for (let i = 1; i <= 5; i++) {
            const estrella = document.createElement('i');
            
            if (i <= promedio) {
                estrella.className = 'bi bi-star-fill';
            } else if (i - 0.5 <= promedio) {
                estrella.className = 'bi bi-star-half';
            } else {
                estrella.className = 'bi bi-star';
            }
            
            estrella.style.color = '#ffc107';
            contenedor.appendChild(estrella);
        }

        contenedor.appendChild(document.createTextNode(' ')); // Espacio entre estrellas
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
    
                // Nueva línea para actualizar calificaciones
                actualizarPromedioCalificaciones(comentarios);
    
                if (comentarios.length === 0) {
                    comentariosLista.innerHTML = '<p class="no-comments">No hay comentarios aún.</p>';
                    return;
                }
    
                const comentariosPrincipales = comentarios.filter(c => !c.esRespuesta);
                const respuestas = comentarios.filter(c => c.esRespuesta);
    
                const promesasComentarios = comentariosPrincipales.map(comentario => {
                    return crearItemComentario(comentario)
                        .then(item => {
                            comentariosLista.appendChild(item);
                            return { item, comentario };
                        });
                });
    
                Promise.all(promesasComentarios)
                    .then(resultados => {
                        resultados.forEach(({ item, comentario }) => {
                            const respuestasDeEsteComentario = respuestas.filter(r => 
                                r.comentario_respuesta === comentario.id
                            );
    
                            const respuestasContainer = item.querySelector('.respuestas-container');
                            const btnVerRespuestas = item.querySelector('.btn-ver-respuestas');
                            const btnOcultarRespuestas = item.querySelector('.btn-ocultar-respuestas');
                            const respuestasCount = item.querySelector('.respuestas-count');
                            const controlesRespuestas = item.querySelector('.controles-respuestas');
    
                            if (respuestasDeEsteComentario.length > 0 && respuestasContainer) {
                                if (respuestasCount) {
                                    respuestasCount.textContent = respuestasDeEsteComentario.length;
                                }
                                if (btnVerRespuestas) {
                                    btnVerRespuestas.style.display = 'inline-block';
                                }
    
                                respuestasDeEsteComentario.slice(0, 3).forEach(respuesta => {
                                    crearItemRespuesta(respuesta, comentario)
                                        .then(respuestaItem => {
                                            respuestasContainer.appendChild(respuestaItem);
                                        });
                                });
    
                                if (respuestasDeEsteComentario.length > 3) {
                                    const btnCargarMas = document.createElement('button');
                                    btnCargarMas.className = 'btn-cargar-mas-respuestas';
                                    let respuestasRestantes = respuestasDeEsteComentario.length - 3;
                                    btnCargarMas.textContent = `Ver ${respuestasRestantes} más ▼`;
    
                                    const controlesAdicionales = document.createElement('div');
                                    controlesAdicionales.className = 'controles-adicionales';
                                    controlesAdicionales.style.display = 'none';
    
                                    controlesAdicionales.appendChild(btnCargarMas);
                                    if (btnOcultarRespuestas) {
                                        controlesAdicionales.appendChild(btnOcultarRespuestas);
                                    }
    
                                    respuestasContainer.parentNode.insertBefore(controlesAdicionales, respuestasContainer.nextSibling);
    
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
    
                                        if (respuestasRestantes > 0) {
                                            btnCargarMas.textContent = `Ver ${respuestasRestantes} más`;
                                        } else {
                                            btnCargarMas.textContent = 'No hay más respuestas';
                                        }
                                    });
    
                                    if (btnVerRespuestas && controlesAdicionales) {
                                        btnVerRespuestas.addEventListener('click', () => {
                                            respuestasContainer.style.display = 'block';
                                            btnVerRespuestas.style.display = 'none';
                                            controlesAdicionales.style.display = 'block';
                                        });
                                    }
    
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
        const calificacion = parseInt(document.getElementById('calificacionInput').value);

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

        const esRespuesta = textarea.dataset.respuestaA !== undefined;
        const comentarioIdRespuesta = esRespuesta ? textarea.dataset.respuestaA : null;

        const comentarioData = {
            producto: productoId,
            texto: comentarioTexto,
            calificacion: calificacion,  // Usamos la calificación seleccionada
            esRespuesta: esRespuesta,
            comentario_respuesta: comentarioIdRespuesta
        };

        if (usuarioLogeado.tipo_usuario === 'normal') {
            comentarioData.usuario = usuarioLogeado.id;
            comentarioData.negocio = null;
        } else if (usuarioLogeado.tipo_usuario === 'negocio') {
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
                if (!response.ok) {
                    throw new Error('Error al enviar el comentario');
                }
                return response.json();
            })
            .then(data => {
                textarea.value = '';
                textarea.removeAttribute('data-respuesta-a');
                cargarComentarios();

                if (esRespuesta) {
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

    configurarSeleccionEstrellas();
    cargarComentarios();
});