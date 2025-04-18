from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .api import obtener_datos, crear_dato, actualizar_dato, eliminar_dato
from django.db import IntegrityError

def main_negocio(request):
    return render(request, 'main/index.html')

def nuevo_usuario(request):
    return render(request, 'registration/registrarse.html')

def productos(request):
    return render(request, 'main/productos.html')

def iniciar_sesion(request):
    return render(request, 'registration/login.html')

def subir_producto(request):
    return render(request, 'main/subirProducto.html')

def editar_producto(request):
    return render(request, 'main/editarProducto.html')

def mi_perfil(request):
    return render(request, 'main/miPerfil.html')

# Listar usuarios
def listar_usuarios(request):
    usuarios = obtener_datos("usuarios")
    return JsonResponse({"usuarios": usuarios}, safe=False)

def mis_productos(request):
    return render(request, 'main/misProductos.html')

# Obtener usuario por nombre de usuario (username)
def obtener_usuario_por_username(request, username):
    usuarios = obtener_datos("usuarios")
    usuario = next((u for u in usuarios if u["nombre_usuario"] == username), None)

    if usuario:
        return JsonResponse(usuario, safe=False)
    else:
        return JsonResponse({"error": "Usuario no encontrado"}, status=404)

# Crear usuario
@csrf_exempt
def registrar_usuario(request):
    if request.method == "POST":
        data = json.loads(request.body)
        usuario_creado = crear_dato("usuarios", data)

        if usuario_creado["success"]:
            return JsonResponse(usuario_creado["data"], safe=False, status=201)
        else:
            return JsonResponse({"error": usuario_creado["error"]}, status=400)

# Actualizar usuario
@csrf_exempt
def actualizar_usuario(request, usuario_id):
    if request.method == "PUT":
        data = json.loads(request.body)
        usuario_actualizado = actualizar_dato("usuarios", usuario_id, data)
        return JsonResponse(usuario_actualizado, safe=False)

# Eliminar usuario
@csrf_exempt
def eliminar_usuario(request, usuario_id):
    if request.method == "DELETE":
        resultado = eliminar_dato("usuarios", usuario_id)
        return JsonResponse({"eliminado": resultado}, safe=False)

# Listar negocios
def listar_negocios(request):
    negocios = obtener_datos("negocios")
    return JsonResponse({"negocios": negocios}, safe=False)

# Obtener negocio por nombre de usuario (username)
def obtener_negocio_por_username(request, username):
    negocios = obtener_datos("negocios")
    negocio = next((n for n in negocios if n["nombre_usuario"] == username), None)

    if negocio:
        return JsonResponse(negocio, safe=False)
    else:
        return JsonResponse({"error": "Negocio no encontrado"}, status=404)

# Crear negocio
@csrf_exempt
def registrar_negocio(request):
    if request.method == "POST":
        data = json.loads(request.body)
        negocio_creado = crear_dato("negocios", data)
        if negocio_creado["success"]:
            return JsonResponse(negocio_creado["data"], safe=False, status=201)
        else:
            return JsonResponse({"error": negocio_creado["error"]}, status=400)

# Actualizar negocio
@csrf_exempt
def actualizar_negocio(request, negocio_id):
    if request.method == "PUT":
        data = json.loads(request.body)
        negocio_actualizado = actualizar_dato("negocios", negocio_id, data)
        return JsonResponse(negocio_actualizado, safe=False)

# Eliminar negocio
@csrf_exempt
def eliminar_negocio(request, negocio_id):
    if request.method == "DELETE":
        resultado = eliminar_dato("negocios", negocio_id)
        return JsonResponse({"eliminado": resultado}, safe=False)

# Listar categorías
def listar_categorias(request):
    categorias = obtener_datos("categorias")
    return JsonResponse({"categorias": categorias}, safe=False)

def obtener_categoria_por_username(request, id_usuario):
    # Obtén las categorías de alguna fuente (puede ser una base de datos, API externa, etc.)
    categorias = obtener_datos("categorias")  # Asegúrate de que esta función devuelva los datos correctos
    
    # Filtra todas las categorías que coincidan con el negocio_id (id_usuario)
    categorias_usuario = [c for c in categorias if c["negocio_id"] == id_usuario]

    if categorias_usuario:
        # Si se encuentran categorías, devuélvelas como JSON
        return JsonResponse(categorias_usuario, safe=False)
    else:
        # Si no se encuentra ninguna categoría, devuelve un error 404
        return JsonResponse({"error": "Categorías no encontradas"}, status=404)

# Crear categoría
@csrf_exempt
def registrar_categoria(request):
    if request.method == "POST":
        data = json.loads(request.body)
        categoria_creada = crear_dato("categorias", data)
        return JsonResponse(categoria_creada, safe=False)
    
from django.http import JsonResponse

def obtener_categoria_id_por_nombre(request, nombre_categoria):
    categorias = obtener_datos("categorias")
    
    categorias_filtradas = [c for c in categorias if c["nombre"].lower() == nombre_categoria.lower()]

    if categorias_filtradas:
        # Si se encuentran categorías que coinciden con el nombre, devuélvelas como JSON
        return JsonResponse(categorias_filtradas, safe=False)
    else:
        # Si no se encuentra ninguna categoría, devuelve un error 404
        return JsonResponse({"error": "Categoría no encontrada"}, status=404)


# Actualizar categoría
@csrf_exempt
def actualizar_categoria(request, categoria_id):
    if request.method == "PUT":
        data = json.loads(request.body)
        categoria_actualizada = actualizar_dato("categorias", categoria_id, data)
        return JsonResponse(categoria_actualizada, safe=False)

# Eliminar categoría
@csrf_exempt
def eliminar_categoria(request, categoria_id):
    if request.method == "DELETE":
        resultado = eliminar_dato("categorias", categoria_id)
        return JsonResponse({"eliminado": resultado}, safe=False)

# Listar productos
def listar_productos(request):
    productos = obtener_datos("productos")
    return JsonResponse({"productos": productos}, safe=False)

def obtener_producto_por_id(request, producto_id):
    productos = obtener_datos("productos")
    producto = next((p for p in productos if p["id"] == producto_id), None)

    if producto:
        return JsonResponse(producto, safe=False)
    else:
        return JsonResponse({"error": "Producto no encontrado"}, status=404)

# Crear producto
@csrf_exempt
def registrar_producto(request):
    if request.method == "POST":
        data = json.loads(request.body)
        producto_creado = crear_dato("productos", data)
        return JsonResponse(producto_creado, safe=False)

@csrf_exempt
def actualizar_producto(request, producto_id):
    if request.method == "PUT":
        data = json.loads(request.body)
        producto_actualizado = actualizar_dato("productos", producto_id, data)
        return JsonResponse(producto_actualizado, safe=False)
    else:
        return JsonResponse({"error": "Método no permitido"}, status=405)

# Eliminar producto
@csrf_exempt
def eliminar_producto(request, producto_id):
    if request.method == "DELETE":
        resultado = eliminar_dato("productos", producto_id)
        return JsonResponse({"eliminado": resultado}, safe=False)

# Listar comentarios
def listar_comentarios(request):
    comentarios = obtener_datos("comentarios")
    return JsonResponse({"comentarios": comentarios}, safe=False)

# Crear comentario
@csrf_exempt
def registrar_comentario(request):
    if request.method == "POST":
        data = json.loads(request.body)
        comentario_creado = crear_dato("comentarios", data)
        return JsonResponse(comentario_creado, safe=False)

# Actualizar comentario
@csrf_exempt
def actualizar_comentario(request, comentario_id):
    if request.method == "PUT":
        data = json.loads(request.body)
        comentario_actualizado = actualizar_dato("comentarios", comentario_id, data)
        return JsonResponse(comentario_actualizado, safe=False)

# Eliminar comentario
@csrf_exempt
def eliminar_comentario(request, comentario_id):
    if request.method == "DELETE":
        resultado = eliminar_dato("comentarios", comentario_id)
        return JsonResponse({"eliminado": resultado}, safe=False)

# Listar respuestas
def listar_respuestas(request):
    respuestas = obtener_datos("respuestas")
    return JsonResponse({"respuestas": respuestas}, safe=False)

# Crear respuesta
@csrf_exempt
def registrar_respuesta(request):
    if request.method == "POST":
        data = json.loads(request.body)
        respuesta_creada = crear_dato("respuestas", data)
        return JsonResponse(respuesta_creada, safe=False)

# Actualizar respuesta
@csrf_exempt
def actualizar_respuesta(request, respuesta_id):
    if request.method == "PUT":
        data = json.loads(request.body)
        respuesta_actualizada = actualizar_dato("respuestas", respuesta_id, data)
        return JsonResponse(respuesta_actualizada, safe=False)

# Eliminar respuesta
@csrf_exempt
def eliminar_respuesta(request, respuesta_id):
    if request.method == "DELETE":
        resultado = eliminar_dato("respuestas", respuesta_id)
        return JsonResponse({"eliminado": resultado}, safe=False)
