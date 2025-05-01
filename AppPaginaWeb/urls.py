from django.urls import path
from AppPaginaWeb import views
from .views import *

urlpatterns = [
    path('', views.iniciar_sesion, name='login'),
    path('nuevo_usuario/', views.nuevo_usuario, name='registrarse'),
    path('main_negocio/', views.main_negocio, name='main_negocio'),
    path('productos/', views.productos, name='productos'),
    path('subir_producto/', views.subir_producto, name='subir_producto'),
    path('mis_productos/', views.mis_productos, name='mis_productos'),
    path('editar_producto/', views.editar_producto, name='editar_producto'),
    path('mi_perfil/', views.mi_perfil, name='mi_perfil'),
    path('negocios/', views.negocios, name='negocios'),
    path('productos/favoritos/negocios/', views.negocios, name='negocios'),
    path('negocios/infonegocio/', views.info_negocio, name='info_negocio'),
    path('categoriaproductos/', views.productos_categoria, name='categoriaproductos'),
    path('editar_perfil/', views.editar_negocio, name='editar_negocio'),
    path('subir-imagen/', views.upload_to_s3, name='subir_imagen_s3'),
    path('actualizar_negocio/<int:negocio_id>/', actualizar_negocio, name='actualizar_negocio'),
    path('borrar-imagen/', views.delete_from_s3, name='delete_from_s3'),
    path('informacion_producto/', views.info_producto, name='informacion_producto'),
    path('editar_usuario/', views.editar_usuario, name='editar_usuario'),
    path('informacion_producto/<int:producto_id>/', views.obtener_producto_por_id, name='obtener_producto_id'),
    path('informacion_negocio/<int:id>/', views.obtener_negocio_por_id, name='obtener_negocio_id_info'),
    path('obtener_usuario_por_id/<int:id>/', views.obtener_usuario_por_id, name='obtener_usuario_id'),
    path('productos/favoritos/obtener_usuario_por_id/<int:id>/', views.obtener_usuario_por_id, name='obtener_usuario_id'),
    path('productos/favoritos/', views.productos_favoritos, name='productos_favoritos'),
    path('agregar_categoria/', views.agregar_categoria, name='agregar_categoria'),

    # Usuarios
    path('usuarios/', listar_usuarios, name='listar_usuarios'),
    path('usuarios/crear/', registrar_usuario, name='registrar_usuario'),
    path('actualizar_usuario/<int:usuario_id>/', actualizar_usuario, name='actualizar_usuario'),
    path('usuarios/eliminar/<int:usuario_id>/', eliminar_usuario, name='eliminar_usuario'),
    path('mi_perfil/usuarios/<str:username>/', views.obtener_usuario_por_username, name='obtener_usuario'),
    path('mi_perfil/negocios/<str:username>/', views.obtener_negocio_por_username, name='obtener_negocio'),
    path('editar_perfil/usuario/<str:username>/', views.obtener_usuario_por_username, name='obtener_usuario_por_username'),


    # Negocios
    path('productos/negocios/', listar_negocios, name='listar_negocios'),
    path('negocios/listanegocios/', listar_negocios, name='listar_negocios_listado'),
    path('mis_productos/negocios/', listar_negocios, name='listar_negocios'),
    path('negocios/crear/', registrar_negocio, name='registrar_negocio'),
    path('negocios/eliminar/<int:negocio_id>/', eliminar_negocio, name='eliminar_negocio'),
    path('api/negocios/<str:username>/', views.obtener_negocio_por_username, name='obtener_negocio'),
    path('negocios/infonegocio/<int:id>/', views.obtener_negocio_por_id, name='obtener_negocio_id'),
    path('negocios/categorias/<int:id_usuario>/', views.obtener_categoria_por_username, name='obtener_categoria_idusuario_negocios'),

    # Categorías
    path('categorias/', listar_categorias, name='listar_categorias'),
    path('categorias/crear/', registrar_categoria, name='registrar_categoria'),
    path('categorias/actualizar/<int:categoria_id>/', actualizar_categoria, name='actualizar_categoria'),
    path('categorias/eliminar/<int:categoria_id>/', eliminar_categoria, name='eliminar_categoria'),

    # Productos
    path('productos/listadoproductos/', listar_productos, name='listar_productos'),
    path('mis_productos/listadoproductos/', listar_productos, name='listar_productos'),
    path('listadoproductos/', listar_productos, name='listar_productos'),
    path('productos/crear/', registrar_producto, name='registrar_producto'),
    path('editar_producto/productos/<int:producto_id>/', actualizar_producto, name='actualizar_producto'),
    path('mis_productos/productos/<int:producto_id>/', actualizar_producto, name='actualizar_producto_misproductos'),
    path('productos/eliminar/<int:producto_id>/', eliminar_producto, name='eliminar_producto'),
    path('subir_producto/categorias/<int:id_usuario>/', views.obtener_categoria_por_username, name='obtener_categoria_idusuario'),
    path('editar_producto/categorias/<int:id_usuario>/', views.obtener_categoria_por_username, name='obtener_categoria_idusuario'),
    path('subir_producto/categorias/<str:nombre_categoria>/', views.obtener_categoria_id_por_nombre, name='obtener_categoria_id_por_nombre'),
    path('editar_producto/producto/id/<int:producto_id>/', views.obtener_producto_por_id, name='obtener_producto_por_id'),
    path('mis_productos/producto/id/<int:producto_id>/', views.obtener_producto_por_id, name='obtener_producto_por_id_misproductos'),
    path('categoriaproductos/productos/<int:id>/', views.listar_productos_por_categoria, name='obtener_producto_id_categoria'),

    # Comentarios
    path('comentarios/', listar_comentarios, name='listar_comentarios'),
    path('comentarios/crear/', registrar_comentario, name='registrar_comentario'),
    path('comentarios/actualizar/<int:comentario_id>/', actualizar_comentario, name='actualizar_comentario'),
    path('comentarios/eliminar/<int:comentario_id>/', eliminar_comentario, name='eliminar_comentario'),

    # Respuestas
    path('respuestas/', listar_respuestas, name='listar_respuestas'),
    path('respuestas/crear/', registrar_respuesta, name='registrar_respuesta'),
    path('respuestas/actualizar/<int:respuesta_id>/', actualizar_respuesta, name='actualizar_respuesta'),
    path('respuestas/eliminar/<int:respuesta_id>/', eliminar_respuesta, name='eliminar_respuesta'),
]