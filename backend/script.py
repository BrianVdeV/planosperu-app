import xlwings as xw
import os

# Lista de nombres de archivos
file_names = [
    'DEC-SUB.xlsx',
    'DEC-FAB.xlsx',
    'IND.xlsx',
    'DEC-IND.xlsx',
    'BUS-CAT.xlsx',
    'VIS-PLA.xlsx',
    'PLA-OBR.xlsx',
    'LIC-CON.xlsx',
    'LIC-FUN.xlsx',
    'SUC-INT.xlsx',
    'SUC-DEC.xlsx',
    'DIV-PAR.xlsx',
    'ANT-LEG.xlsx',
    'CON-MUL.xlsx',
    'FAC-ELE.xlsx',
    'FAC-SAN.xlsx',
    'LEV-CAR.xlsx',
    'NOT-MUN.xlsx',
    'LIC-DEM.xlsx',
    'BUS-MEM.xlsx',
    'SOL-MED.xlsx',
    'ADE-MOD.xlsx',
    'TAS-INM.xlsx',
    'LEV-ARE.xlsx',
    'COM-VEN.xlsx',
    'DEC-CON.xlsx',
    'DEC-DIV.xlsx',
    'MED-PLU.xlsx',
    'OBR-CON.xlsx',
    'NOT-NOT.xlsx',
    'FAC-ALC.xlsx',
    'DEC-MIN.xlsx',
    'EVA-EST.xlsx',
    'TRA-DEC.xlsx',
    'ACT-AUT.xlsx',
    'DIV-DON.xlsx',
    'DEC-DON.xlsx',
    'DIS-3D.xlsx',
    'CER-NUM.xlsx',
    'ACT-PLA.xlsx',
    'INF-PRE.xlsx',
    'DON.xlsx',
    'BUS-OTR.xlsx',
    'PLA-NOD.xlsx',
    'PRE-NOT.xlsx',
    'PRE-JUD.xlsx',
    'VIS-PRE.xlsx',
    'HAB-URB.xlsx',
    'PLA-ING.xlsx',
    'EXP-TEC.xlsx',
    'SUB-MUN.xlsx',
    'IND-MUN.xlsx',
    'INF-PLA.xlsx',
    'CER-PAR.xlsx'
]

# Carpeta: misma que la del script
folder_path = r'D:\Documents\planosperu-app\backend\docs'
# Ruta de la imagen
image_path = r'D:\Downloads\Picture1.png'

# Inicializar la aplicación de Excel, no visible
app = xw.App(visible=False)
for file_name in file_names:
    file_path = os.path.join(folder_path, file_name)

    if not os.path.exists(file_path):
        print(f"❌ Archivo no encontrado: {file_name}")
        continue

    try:
        wb = app.books.open(file_path)
        sheet = wb.sheets[0]  # Usa la primera hoja

        # Obtener la celda G4
        celda = sheet.range('G4')
        # Insertar la imagen y obtener el objeto picture
        pic = sheet.pictures.add(
            image_path,
            left=celda.left + celda.width / 2,
            top=celda.top + celda.height / 2
        )

        print(
            f"✅ Imagen agregada con esquina superior izquierda en el centro de G4 de {file_name}")

        wb.save()
        wb.close()
    except Exception as e:
        print(f"⚠️ Error con {file_name}: {e}")
# Cerrar la instancia de Excel
app.quit()

print("🚀 Proceso completado.")
