import os

def concatenar_proyecto(carpeta_origen, archivo_salida):
    # 1. Configuración: ¿Qué ignorar y qué incluir?
    carpetas_ignoradas = {'.git', 'node_modules', '__pycache__', 'venv', 'env', 'dist', 'build', 'out'}
    # Añade aquí las extensiones de los archivos de código que quieras incluir
    extensiones_permitidas = {'.js', '.ts', '.py', '.html', '.css', '.json', '.java', '.cpp', '.php', '.md', '.jsx', '.tsx'}

    print(f"Buscando archivos en: {os.path.abspath(carpeta_origen)}")

    with open(archivo_salida, 'w', encoding='utf-8') as outfile:
        # Recorrer el directorio
        for raiz, directorios, archivos in os.walk(carpeta_origen):
            # Filtrar carpetas ignoradas para no entrar en ellas
            directorios[:] = [d for d in directorios if d not in carpetas_ignoradas]

            for archivo in archivos:
                ext = os.path.splitext(archivo)[1].lower()
                
                # Si el archivo tiene una extensión permitida y no es el propio script
                if ext in extensiones_permitidas and archivo != os.path.basename(__file__):
                    ruta_completa = os.path.join(raiz, archivo)
                    # Obtener la ruta relativa para que sea más limpia
                    ruta_relativa = os.path.relpath(ruta_completa, carpeta_origen)

                    # Escribir separadores visuales y el nombre del archivo
                    outfile.write("=" * 80 + "\n")
                    outfile.write(f"ARCHIVO: {ruta_relativa}\n")
                    outfile.write("=" * 80 + "\n\n")

                    # Leer el contenido del archivo y escribirlo en el archivo de salida
                    try:
                        with open(ruta_completa, 'r', encoding='utf-8') as infile:
                            outfile.write(infile.read() + "\n\n")
                    except Exception as e:
                        outfile.write(f"// [Error al leer este archivo: {e}]\n\n")

    print(f"¡Éxito! Todo tu código se ha guardado en '{archivo_salida}'")

# Ejecutar la función
if __name__ == '__main__':
    # '.' significa la carpeta actual (donde está este script)
    # 'codigo_completo.txt' es el archivo resultante que vas a subir al chat
    concatenar_proyecto('.', 'codigo_completo.txt')