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

# Listar usuarios
def listar_usuarios(request):
    usuarios = obtener_datos("usuarios")
    return JsonResponse({"usuarios": usuarios}, safe=False)

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

# Crear categoría
@csrf_exempt
def registrar_categoria(request):
    if request.method == "POST":
        data = json.loads(request.body)
        categoria_creada = crear_dato("categorias", data)
        return JsonResponse(categoria_creada, safe=False)

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

# Crear producto
@csrf_exempt
def registrar_producto(request):
    if request.method == "POST":
        data = json.loads(request.body)
        producto_creado = crear_dato("productos", data)
        return JsonResponse(producto_creado, safe=False)

# Actualizar producto
@csrf_exempt
def actualizar_producto(request, producto_id):
    if request.method == "PUT":
        data = json.loads(request.body)
        producto_actualizado = actualizar_dato("productos", producto_id, data)
        return JsonResponse(producto_actualizado, safe=False)

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
