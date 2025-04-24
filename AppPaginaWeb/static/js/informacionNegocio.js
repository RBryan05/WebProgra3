document.addEventListener("DOMContentLoaded", () => {
    // Obtener la URL de la imagen predeterminada desde el DOM
    const urlDefaultProfile = document.getElementById('static-data').getAttribute('data-default-profile');

    // Obtener el id del negocio desde el localStorage
    const idNegocio = localStorage.getItem("idNegocio");
    let fotoPerfilNegocio = ""; // Variable global para guardar la foto del negocio

    // Función para obtener la información del negocio
    async function obtenerInfoNegocio() {
        try {
            // Obtener la información del negocio
            const response = await fetch(`/negocios/infonegocio/${idNegocio}/`);
            const negocio = await response.json();

            // Actualizar el título de la página con el nombre del negocio
            document.querySelector('.title').textContent = negocio.nombre;

            // Actualizar la foto de perfil
            const fotoPerfil = document.getElementById("fotoPerfil");
            fotoPerfil.src = negocio.foto_perfil || urlDefaultProfile; // Usar la URL predeterminada
            fotoPerfilNegocio = negocio.foto_perfil || urlDefaultProfile; // Guardar la foto en la variable global

            // Actualizar la dirección y descripción
            document.getElementById("direccionNegocio").textContent = negocio.direccion || "Dirección no proporcionada";
            document.getElementById("descripcionNegocio").textContent = negocio.descripcion || "Descripción no proporcionada";
        } catch (error) {
        }
    }

    // Función para obtener las categorías del negocio
    async function obtenerCategorias() {
        try {
            const response = await fetch(`/negocios/categorias/${idNegocio}/`);
            const categorias = await response.json();

            const categoriaCards = document.getElementById("categoriaCards");
            categoriaCards.innerHTML = ''; // Limpiar las tarjetas anteriores

            categorias.forEach(categoria => {
                const card = document.createElement("div");
                card.classList.add("categoria-card");

                const imagen = categoria.imagen_url || fotoPerfilNegocio;  // Si no tiene imagen, usar la del negocio

                // Crear la tarjeta de categoría
                card.innerHTML = `
                    <h3>${categoria.nombre}</h3>
                    <img src="${imagen}" alt="${categoria.nombre}" class="imagen-categoria">
                    <button class="btn-ingresar" data-id="${categoria.id}" data-nombre="${categoria.nombre}">Ingresar</button>
                `;

                // Agregar el evento de clic al botón "Ingresar"
                const btnIngresar = card.querySelector('.btn-ingresar');
                btnIngresar.addEventListener('click', function () {
                    const categoriaId = this.getAttribute('data-id'); // Obtener el id de la categoría
                    const nombreCategoria = categoria.nombre; // Obtener el nombre de la categoría
                    localStorage.setItem("idCategoria", categoriaId); // Guardar el id de la categoría en localStorage
                    localStorage.setItem("nombreCategoria", nombreCategoria); // Guardar el nombre de la categoría en localStorage
                    window.location.href = `/categoriaproductos/`; // Redirigir a la página de productos de la categoría
                });

                categoriaCards.appendChild(card); // Agregar la tarjeta al contenedor
            });
        } catch (error) {
        }
    }

    // Ejecutar funciones
    obtenerInfoNegocio().then(obtenerCategorias);
});
