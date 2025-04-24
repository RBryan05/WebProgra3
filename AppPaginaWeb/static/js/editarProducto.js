document.addEventListener("DOMContentLoaded", () => {
    const script = document.getElementById("edit-product-script");
    // Obtener el id del producto desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productoId = localStorage.getItem("productoId");  // Asegúrate de pasar el id del producto en la URL como un parámetro

    // Obtener el usuario desde el localStorage
    const user = JSON.parse(localStorage.getItem("usuario"));
    const id_usuario = user.id;

    const redirecSuccess = script.getAttribute("data-redirect-url")

    // Llenar el select de categorías con las categorías obtenidas
    fetch("categorias/" + id_usuario + "/")
        .then(response => response.json())
        .then(data => {
            const selectCategoria = document.getElementById('categoria');
            selectCategoria.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';  // Limpiar el select

            // Recorrer todas las categorías y agregar opciones al select
            data.forEach(categoria => {
                const option = document.createElement("option");
                option.value = categoria.id;
                option.textContent = categoria.nombre;
                selectCategoria.appendChild(option);
            });
        })
        .catch(error => {
        });

    // Obtener los detalles del producto para editarlo
    fetch(`producto/id/${productoId}/`)
        .then(response => response.json())
        .then(producto => {
            // Rellenar el formulario con los detalles del producto
            document.getElementById('nombre').value = producto.nombre;
            document.getElementById('descripcion').value = producto.descripcion;
            document.getElementById('imagen').value = producto.imagen_url;
            document.getElementById('estado').value = producto.estado;
            document.getElementById('categoria').value = producto.categoria_id;
            document.getElementById('precio').value = producto.precio;
        })
        .catch(error => {
        });

    // Manejar el envío del formulario
    const form = document.getElementById('productoForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault();  // Evitar que el formulario se envíe de manera tradicional

        // Recoger los datos del formulario
        const nombre = document.getElementById('nombre').value;
        const descripcion = document.getElementById('descripcion').value;
        const imagen = document.getElementById('imagen').value;
        const estado = document.getElementById('estado').value;
        const categoria = document.getElementById('categoria').value;
        const precio = parseFloat(document.getElementById('precio').value);  // Obtener el precio

        // Crear un objeto con los datos del producto
        const producto = {
            nombre: nombre,
            descripcion: descripcion,
            imagen_url: imagen,
            estado: estado,
            categoria_id: categoria,
            precio: precio,  // Agregar el precio
            negocio_id: id_usuario  // El negocio_id es el id del usuario
        };

        // Enviar los datos al servidor usando fetch
        fetch(`/editar_producto/productos/${productoId}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify(producto)
        })
            .then(async response => {
                // Comprobamos si el response es OK (200-299)
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
                alert("Producto actualizado exitosamente.");
                window.location.href = `/mis_productos/`;  // Redirigir a la página de mis productos
            })
            .catch(error => {
                alert("Error al actualizar: " + error.message);
            });
    });
});
