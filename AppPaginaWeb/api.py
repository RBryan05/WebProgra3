import requests

# URLs base de la API
BASE_URL = "https://apiproyectoprogra3.onrender.com/api/"
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

def obtener_dato(tipo, item_id):
    url = f"{BASE_URL}{ENDPOINTS[tipo]}{item_id}/"
    try:
        response = requests.get(url, timeout=10)
        return response.json() if response.status_code == 200 else None
    except requests.exceptions.RequestException:
        return None

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
    
    try:
        # 1. Filtrar solo campos con valor y convertir "" a None
        payload = {k: v for k, v in data.items() if v is not None}
        
        # 2. Log para depuración (¡IMPORTANTE!)
        print(f"Enviando a API externa: URL={url}, Data={payload}")
        
        # 3. Configurar timeout y headers
        response = requests.put(
            url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10  # 10 segundos máximo
        )
        
        # 4. Verificar respuesta
        if response.status_code in [200, 201]:
            return response.json()
        else:
            print(f"Error API: Status={response.status_code}, Response={response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Error de conexión: {str(e)}")
        return None

# Función para eliminar datos
def eliminar_dato(tipo, item_id):
    url = f"{BASE_URL}{ENDPOINTS[tipo]}{item_id}/"
    response = requests.delete(url)
    return response.status_code == 204  # Retorna True si se eliminó correctamente
