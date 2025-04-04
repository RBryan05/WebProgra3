from django.urls import path
from AppPaginaWeb import views
from .views import *

urlpatterns = [
    path('', views.iniciar_sesion, name='login'),
    path('nuevo_usuario/', views.nuevo_usuario, name='registrarse'),
    path('main_negocio/', views.main_negocio, name='main_negocio'),
    path('productos/', views.productos, name='productos'),

    # Usuarios
    path('usuarios/', listar_usuarios, name='listar_usuarios'),
    path('usuarios/crear/', registrar_usuario, name='registrar_usuario'),
    path('usuarios/actualizar/<int:usuario_id>/', actualizar_usuario, name='actualizar_usuario'),
    path('usuarios/eliminar/<int:usuario_id>/', eliminar_usuario, name='eliminar_usuario'),
    path('api/usuarios/<str:username>/', views.obtener_usuario_por_username, name='obtener_usuario'),


    # Negocios
    path('negocios/', listar_negocios, name='listar_negocios'),
    path('negocios/crear/', registrar_negocio, name='registrar_negocio'),
    path('negocios/actualizar/<int:negocio_id>/', actualizar_negocio, name='actualizar_negocio'),
    path('negocios/eliminar/<int:negocio_id>/', eliminar_negocio, name='eliminar_negocio'),
    path('api/negocios/<str:username>/', views.obtener_negocio_por_username, name='obtener_negocio'),

    # Categorías
    path('categorias/', listar_categorias, name='listar_categorias'),
    path('categorias/crear/', registrar_categoria, name='registrar_categoria'),
    path('categorias/actualizar/<int:categoria_id>/', actualizar_categoria, name='actualizar_categoria'),
    path('categorias/eliminar/<int:categoria_id>/', eliminar_categoria, name='eliminar_categoria'),

    # Productos
    path('productos/', listar_productos, name='listar_productos'),
    path('productos/crear/', registrar_producto, name='registrar_producto'),
    path('productos/actualizar/<int:producto_id>/', actualizar_producto, name='actualizar_producto'),
    path('productos/eliminar/<int:producto_id>/', eliminar_producto, name='eliminar_producto'),

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