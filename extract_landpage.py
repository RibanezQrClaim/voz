import zipfile
import os

# Ruta del zip descargado de Figma
ZIP_PATH = r"C:\Rodrigo\documentos\agente_red\voz_agente_gmail\land.zip"
# Carpeta destino donde quieres que quede la landpage
DEST_PATH = r"C:\Rodrigo\documentos\agente_red\voz_agente_gmail\Landpage"

def extract_landpage(zip_path, dest_path):
    # Crear carpeta si no existe
    os.makedirs(dest_path, exist_ok=True)

    # Abrir el ZIP
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        # Extraer todo
        zip_ref.extractall(dest_path)

    print(f"✅ Archivos extraídos en: {dest_path}")

if __name__ == "__main__":
    extract_landpage(ZIP_PATH, DEST_PATH)
