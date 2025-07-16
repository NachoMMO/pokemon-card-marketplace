# 📚 Guía de Documentación

## 🚀 Comandos útiles para la documentación

### Servidor de desarrollo
```bash
mkdocs serve
```
Inicia un servidor local en http://127.0.0.1:8000 con recarga automática

### Construcción del sitio
```bash
mkdocs build
```
Genera el sitio estático en la carpeta `site/`

### Despliegue a GitHub Pages
```bash
mkdocs gh-deploy
```
Despliega automáticamente a GitHub Pages (rama gh-pages)

### Validar configuración
```bash
mkdocs --help
```

## 📂 Estructura de archivos
- `mkdocs.yml` - Configuración principal
- `docs_site/` - Contenido de la documentación
- `site/` - Sitio generado (no incluir en git)

## ✨ Extensiones Markdown disponibles

### 📢 Admonitions (Cajas de información)
```markdown
!!! note "Título opcional"
    Contenido de la nota

!!! tip "Consejo"
    Contenido del consejo

!!! warning "Advertencia"
    Contenido de la advertencia

!!! danger "Peligro"
    Contenido peligroso

!!! info "Información"
    Contenido informativo

!!! success "Éxito"
    Contenido de éxito
```

### 📋 Pestañas
```markdown
=== "Tab 1"
    Contenido del tab 1

=== "Tab 2"
    Contenido del tab 2
```

### 💻 Código con resaltado
```markdown
```python
def hello():
    print("Hello World")
```
```

### ✅ Listas de tareas
```markdown
- [x] Tarea completada
- [ ] Tarea pendiente
```

### 🔗 Enlaces y referencias
```markdown
[Texto del enlace](url)
[Referencia interna](archivo.md)
[Enlace a sección](archivo.md#seccion)
```

### 📊 Tablas
```markdown
| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| Valor 1   | Valor 2   | Valor 3   |
| Valor 4   | Valor 5   | Valor 6   |
```

## 🎨 Consejos de Estilo

### Uso de Emojis
- 🎯 Para objetivos y metas
- 🚀 Para características nuevas o lanzamientos
- ⚡ Para funcionalidades rápidas
- 🔒 Para seguridad
- 📱 Para móvil/responsive
- 🛠️ Para herramientas y configuración
- 📋 Para listas y documentación
- 💡 Para tips e ideas

### Estructura recomendada
1. **Título principal** con emoji descriptivo
2. **Resumen breve** de la sección
3. **Índice** para secciones largas
4. **Contenido** organizado en subsecciones
5. **Ejemplos prácticos** cuando sea apropiado
6. **Notas importantes** usando admonitions

## 🔄 Flujo de Trabajo

1. **Editar** archivos en `docs_site/`
2. **Ver cambios** automáticamente en http://127.0.0.1:8000
3. **Commit** cambios al repositorio
4. **Desplegar** con `mkdocs gh-deploy` si es necesario

¡La documentación ahora se ve profesional y es fácil de mantener! 🎉
