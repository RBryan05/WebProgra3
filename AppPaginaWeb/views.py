from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .api import obtener_datos, obtener_dato, crear_dato, actualizar_dato, eliminar_dato
from django.core.files.storage import default_storage
from datetime import datetime
import os

def main_negocio(request):
    return render(request, 'main/index.html')

def nuevo_usuario(request):
    return render(request, 'registration/registrarse.html')

def productos(request):
    return render(request, 'main/productos.html', {
        'activar_buscador': True,
        'pagina_actual': 'productos',
    })

def iniciar_sesion(request):
    return render(request, 'registration/login.html')

def subir_producto(request):
    return render(request, 'main/subirProducto.html')

def editar_producto(request):
    return render(request, 'main/editarProducto.html')

def mi_perfil(request):
    return render(request, 'main/miPerfil.html', {
        'mi_perfil': True
    })

def negocios(request):
    return render(request, 'main/negocios.html', {
        'pagina_actual': 'negocios',
        'activar_buscador': True,
    })

def info_negocio(request):
    return render(request, 'main/informacionNegocio.html', {
        'activar_buscador': True,
    })

def editar_negocio(request):
    return render(request, 'main/editarNegocio.html', {
        'mi_perfil': True
    })

def editar_usuario(request):
    return render(request, 'main/editarUsuario.html', {
        'mi_perfil': True
    })

def info_producto(request):
    return render(request, 'main/detallesProducto.html')

# Listar usuarios
def listar_usuarios(request):
    usuarios = obtener_datos("usuarios")
    return JsonResponse({"usuarios": usuarios}, safe=False)

def mis_productos(request):
    return render(request, 'main/misProductos.html', {
        'activar_buscador': True,     
    })

def productos_categoria(request):
    return render(request, 'main/productosCategoria.html', {
        'activar_buscador': True,     
    })

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
        try:
            # 1. Obtener datos actuales del usuario
            usuario_actual = obtener_dato("usuarios", usuario_id)
            if not usuario_actual:
                return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
            
            # 2. Combinar con nuevos datos
            nuevos_datos = json.loads(request.body)
            datos_completos = {**usuario_actual, **nuevos_datos}  # Fusiona ambos diccionarios
            
            # 3. Actualizar en API externa
            resultado = actualizar_dato("usuarios", usuario_id, datos_completos)
            
            if resultado:
                return JsonResponse(resultado)
            return JsonResponse({'error': 'Error en API externa'}, status=502)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

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
    
def obtener_negocio_por_id(request, id):
    negocios = obtener_datos("negocios")
    negocio = next((n for n in negocios if n["id"] == id), None)
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

@csrf_exempt
def actualizar_negocio(request, negocio_id):
    if request.method == "PUT":
        try:
            # 1. Obtener datos actuales del negocio
            negocio_actual = obtener_dato("negocios", negocio_id)  # Necesitarás implementar esta función
            if not negocio_actual:
                return JsonResponse({'error': 'Negocio no encontrado'}, status=404)
            
            # 2. Combinar con nuevos datos
            nuevos_datos = json.loads(request.body)
            datos_completos = {**negocio_actual, **nuevos_datos}  # Fusiona ambos diccionarios
            
            # 3. Actualizar en API externa
            resultado = actualizar_dato("negocios", negocio_id, datos_completos)
            
            if resultado:
                return JsonResponse(resultado)
            return JsonResponse({'error': 'Error en API externa'}, status=502)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

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

# Listar productos por categoría
def listar_productos_por_categoria(request, id):
    productos = obtener_datos("productos")  # Obtener todos los productos

    # Filtrar productos donde el id de la categoría coincida con el id pasado
    productos_filtrados = [p for p in productos if p["categoria_id"] == id]

    return JsonResponse({"productos": productos_filtrados}, safe=False)

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

import boto3
from botocore.exceptions import ClientError
from django.conf import settings

@csrf_exempt
def upload_to_s3(request):
    if request.method == 'POST' and request.FILES.get('imagen'):
        imagen = request.FILES['imagen']
        
        # Configura cliente S3
        s3 = boto3.client('s3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME)
        
        # Genera nombre único
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        extension = os.path.splitext(imagen.name)[1].lower()
        nombre_archivo = f"uploads/{timestamp}{extension}"
        
        try:
            # Sube el archivo sin ACL
            s3.upload_fileobj(
                imagen,
                settings.AWS_STORAGE_BUCKET_NAME,
                nombre_archivo,
                ExtraArgs={
                    'ContentType': imagen.content_type,
                    # Nota: No incluir 'ACL' aquí
                }
            )
            
            # Verifica que el archivo existe
            s3.head_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=nombre_archivo
            )
            
            url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{nombre_archivo}"
            
            return JsonResponse({
                'success': True,
                'url': url,
                'path': nombre_archivo
            })
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_msg = e.response['Error']['Message']
            return JsonResponse({
                'error': f"Error de AWS ({error_code}): {error_msg}"
            }, status=500)
        except Exception as e:
            return JsonResponse({
                'error': f"Error inesperado: {str(e)}"
            }, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=400)

@csrf_exempt
def delete_from_s3(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        image_url = data.get('image_url')
        
        if not image_url:
            return JsonResponse({'error': 'URL de imagen no proporcionada'}, status=400)
        
        # Extraer el path/key del bucket desde la URL completa
        try:
            # Asumiendo que tu URL es como: https://tudominio.s3.region.amazonaws.com/path/to/file.jpg
            bucket_domain = f"{settings.AWS_S3_CUSTOM_DOMAIN}/"
            key = image_url.split(bucket_domain)[1]
        except IndexError:
            return JsonResponse({'error': 'URL de imagen no válida'}, status=400)
        
        # Configurar cliente S3
        s3 = boto3.client('s3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME)
        
        try:
            # Verificar que el archivo existe antes de eliminarlo
            s3.head_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=key
            )
            
            # Eliminar el archivo
            s3.delete_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=key
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Imagen eliminada correctamente'
            })
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                return JsonResponse({
                    'error': 'La imagen no existe en el bucket'
                }, status=404)
            return JsonResponse({
                'error': f"Error de AWS ({error_code}): {e.response['Error']['Message']}"
            }, status=500)
        except Exception as e:
            return JsonResponse({
                'error': f"Error inesperado: {str(e)}"
            }, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=400)