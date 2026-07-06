# Instalación - InkaGrill Website

## Requisitos Previos

- **PHP** 7.4 o superior
- **MySQL** 5.7 o superior (o MariaDB)
- **Servidor web** (Apache o Nginx)
- **XAMPP, WAMP o MAMP** (recomendado para desarrollo local)

## Pasos de Instalación

### 1. Instalar XAMPP

1. Descargar XAMPP desde: https://www.apachefriends.org/
2. Instalar siguiendo las instrucciones del instalador
3. Iniciar el Panel de Control de XAMPP
4. Activar los módulos **Apache** y **MySQL**

### 2. Extraer el Proyecto

1. Descargar el proyecto (archivo ZIP)
2. Extraer el contenido
3. Copiar la carpeta del proyecto a:
   - **Windows**: `C:\xampp\htdocs\inkagrill`
   - **Mac**: `/Applications/XAMPP/htdocs/inkagrill`
   - **Linux**: `/opt/lampp/htdocs/inkagrill`

### 3. Crear la Base de Datos

#### Opción A: Usando phpMyAdmin (Recomendado)

1. Abrir el navegador y ir a: `http://localhost/phpmyadmin`
2. Hacer clic en la pestaña **"Importar"**
3. Hacer clic en **"Seleccionar archivo"**
4. Seleccionar el archivo `database.sql` del proyecto
5. Hacer clic en **"Continuar"** al final de la página
6. Esperar a que se complete la importación

#### Opción B: Usando línea de comandos

```bash
# Abrir terminal y ejecutar:
mysql -u root -p < ruta/al/archivo/database.sql
```

### 4. Configurar la Conexión a la Base de Datos

1. Abrir el archivo `api/config.php`
2. Verificar/modificar las credenciales:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'inkagrill');
define('DB_USER', 'root');        // Usuario por defecto de XAMPP
define('DB_PASS', '');            // Sin contraseña por defecto en XAMPP
```

**Nota**: Si configuraste una contraseña para MySQL, actualiza `DB_PASS`.

### 5. Verificar Instalación

1. Abrir el navegador
2. Ir a: `http://localhost/inkagrill/index.html`
3. Deberías ver la página principal del restaurante

### 6. Acceder al Panel de Administración

1. Ir a: `http://localhost/inkagrill/admin.html`
2. Gestionar reservas y menú desde allí

## Estructura del Proyecto

```
inkagrill/
├── index.html              # Página principal
├── admin.html              # Panel de administración
├── css/
│   ├── styles.css         # Estilos de la página principal
│   └── admin.css          # Estilos del panel admin
├── js/
│   ├── main.js            # JavaScript de la página principal
│   └── admin.js           # JavaScript del panel admin
├── api/
│   ├── config.php         # Configuración de base de datos
│   ├── menu.php           # API para gestión de menú
│   └── reservations.php   # API para gestión de reservas
└── database.sql           # Script de base de datos
```

## Solución de Problemas

### Error: "No se puede conectar a la base de datos"

**Solución**:
1. Verificar que MySQL esté corriendo en XAMPP
2. Comprobar las credenciales en `api/config.php`
3. Asegurar que la base de datos `inkagrill` existe

### Error 404: "Archivo no encontrado"

**Solución**:
1. Verificar que los archivos estén en la carpeta `htdocs`
2. Comprobar la URL: debe ser `http://localhost/inkagrill/index.html`

### El menú no carga

**Solución**:
1. Abrir consola del navegador (F12)
2. Verificar errores en la pestaña "Consola"
3. Asegurar que el archivo `database.sql` se importó correctamente
4. Verificar que Apache y MySQL estén corriendo

### CORS Error

**Solución**:
El archivo `api/config.php` ya incluye headers CORS. Si persiste el error:
1. Verificar que estás accediendo vía `http://localhost` (no abriendo el archivo directamente)
2. Reiniciar Apache desde el panel de XAMPP

## Datos de Prueba

El script SQL incluye datos de ejemplo:
- 4 categorías de menú (Parrilla Argentina, Cocina Peruana, Bebidas, Postres)
- 20 platos distribuidos en las categorías
- 3 reservas de ejemplo

## Personalización

### Cambiar Información del Restaurante

Editar `index.html` y modificar:
- Nombre del restaurante
- Dirección y coordenadas del mapa
- Teléfono y email
- Horarios de atención

### Modificar Colores y Estilos

Editar `css/styles.css` y cambiar las variables CSS en `:root`:

```css
:root {
  --primary: #c94d2a;        /* Color principal */
  --secondary: #2c5530;      /* Color secundario */
  --accent: #d4a574;         /* Color de acento */
}
```

## Seguridad para Producción

Antes de subir a un servidor en producción:

1. **Cambiar credenciales de base de datos**
2. **Habilitar HTTPS**
3. **Agregar validación adicional en PHP**
4. **Implementar autenticación para el panel admin**
5. **Configurar backups automáticos de la base de datos**

## Soporte

Para problemas o consultas:
- Revisar la documentación de XAMPP: https://www.apachefriends.org/faq.html
- Verificar logs de Apache: `xampp/apache/logs/error.log`
- Verificar logs de MySQL: `xampp/mysql/data/mysql_error.log`

## Licencia

Este proyecto es de código abierto para uso educativo y comercial.
