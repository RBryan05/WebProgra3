document.addEventListener('DOMContentLoaded', function() {
    // Obtener elementos del DOM por ID (más eficiente)
    const favoritosBtn = document.getElementById('agregarAFav');
    if (!favoritosBtn) {
        console.error('No se encontró el botón de favoritos');
        return;
    }

    const selectedProductId = localStorage.getItem('selectedProductId');
    const usuarioData = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuarioData || !selectedProductId) {
        console.error('Faltan datos en localStorage:', {usuarioData, selectedProductId});
        return;
    }

    // Verificar si el producto ya está en favoritos
    checkFavoritoStatus(usuarioData, selectedProductId, favoritosBtn);

    // Configurar el evento click
    favoritosBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleFavoritoClick(usuarioData, selectedProductId, favoritosBtn);
    });
});

async function checkFavoritoStatus(usuarioData, productId, favoritosBtn) {
    try {
        let favoritos = [];
        
        if (usuarioData.tipo_usuario === 'normal' || usuarioData.tipo_usuario === 'usuario') {
            const response = await fetch(`/obtener_usuario_por_id/${usuarioData.id}/`);
            if (!response.ok) throw new Error('Error al obtener usuario');
            const usuario = await response.json();
            favoritos = usuario.productos_favoritos || [];
        } else if (usuarioData.tipo_usuario === 'negocio') {
            const response = await fetch(`/informacion_negocio/${usuarioData.id}/`);
            if (!response.ok) throw new Error('Error al obtener negocio');
            const negocio = await response.json();
            favoritos = negocio.productos_favoritos || [];
        }

        // Actualizar el texto del botón según si el producto está en favoritos
        if (favoritos.includes(parseInt(productId))) {
            favoritosBtn.textContent = 'Eliminar de favoritos';
            favoritosBtn.href = favoritosBtn.href.replace('agregar a favoritos', 'eliminar de favoritos');
        } else {
            favoritosBtn.textContent = 'Agregar a favoritos';
            favoritosBtn.href = favoritosBtn.href.replace('eliminar de favoritos', 'agregar a favoritos');
        }
    } catch (error) {
        console.error('Error al verificar favoritos:', error);
    }
}

async function handleFavoritoClick(usuarioData, productId, favoritosBtn) {
    try {
        let favoritos = [];
        let endpoint = '';
        
        // Obtener la lista actual de favoritos
        if (usuarioData.tipo_usuario === 'normal' || usuarioData.tipo_usuario === 'usuario') {
            const response = await fetch(`/obtener_usuario_por_id/${usuarioData.id}/`);
            if (!response.ok) throw new Error('Error al obtener usuario');
            const usuario = await response.json();
            favoritos = usuario.productos_favoritos || [];
            endpoint = `/actualizar_usuario/${usuarioData.id}/`;
        } else if (usuarioData.tipo_usuario === 'negocio') {
            const response = await fetch(`/informacion_negocio/${usuarioData.id}/`);
            if (!response.ok) throw new Error('Error al obtener negocio');
            const negocio = await response.json();
            favoritos = negocio.productos_favoritos || [];
            endpoint = `/actualizar_negocio/${usuarioData.id}/`;
        }

        const productIdNum = parseInt(productId);
        
        // Determinar si agregar o eliminar el producto
        if (favoritos.includes(productIdNum)) {
            // Eliminar de favoritos
            favoritos = favoritos.filter(id => id !== productIdNum);
            favoritosBtn.textContent = 'Agregar a favoritos';
            favoritosBtn.href = favoritosBtn.href.replace('eliminar de favoritos', 'agregar a favoritos');
        } else {
            // Agregar a favoritos
            favoritos.push(productIdNum);
            favoritosBtn.textContent = 'Eliminar de favoritos';
            favoritosBtn.href = favoritosBtn.href.replace('agregar a favoritos', 'eliminar de favoritos');
        }

        // Actualizar en el servidor
        const updateData = {
            productos_favoritos: favoritos
        };

        const updateResponse = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            throw new Error('Error al actualizar favoritos');
        }

        // Actualizar localStorage si es necesario
        const updatedUser = await updateResponse.json();
        if (usuarioData.tipo_usuario === 'normal') {
            localStorage.setItem('usuario', JSON.stringify(updatedUser));
        }

    } catch (error) {
        console.error('Error al manejar favoritos:', error);
        alert('Ocurrió un error al actualizar tus favoritos');
    }
}

// Función auxiliar para obtener el token CSRF
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