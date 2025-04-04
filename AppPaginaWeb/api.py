import requests

# URLs base de la API
BASE_URL = "http://127.0.0.1:3000/api/"
ENDPOINTS = {
    "usuarios": "usuarios/",
    "negocios": "negocios/",
    "categorias": "categorias/",
    "productos": "productos/",
    "comentarios": "comentarios/",
    "respuestas": "respuestas/"
}

# Función para obtener datos
def obtener_datos(tipo):
    url = f"{BASE_URL}{ENDPOINTS[tipo]}"
    response = requests.get(url)
    return response.json() if response.status_code == 200 else None

# Función para crear datos
def crear_dato(tipo, data):
    url = f"{BASE_URL}{ENDPOINTS[tipo]}"
    response = requests.post(url, json=data)

    if response.status_code == 201:
        return {
            "success": True,
            "data": response.json()
        }
    else:
        print(f"Error al crear {tipo}: {response.status_code} - {response.text}")
        error_message = response.json()

        if "nombre_usuario" in error_message:
            error_detail = error_message["nombre_usuario"][0]
            
            # Traducir mensaje si es el conocido
            if "with this nombre usuario already exists" in error_detail.lower():
                error_detail = "Este nombre de usuario ya existe."

        else:
            error_detail = "Error desconocido."

        return {
            "success": False,
            "error": error_detail
        }

# Función para actualizar datos
def actualizar_dato(tipo, item_id, data):
    url = f"{BASE_URL}{ENDPOINTS[tipo]}{item_id}/"
    response = requests.put(url, json=data)
    return response.json() if response.status_code == 200 else None

# Función para eliminar datos
def eliminar_dato(tipo, item_id):
    url = f"{BASE_URL}{ENDPOINTS[tipo]}{item_id}/"
    response = requests.delete(url)
    return response.status_code == 204  # Retorna True si se eliminó correctamente
