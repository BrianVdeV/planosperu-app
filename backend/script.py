import xlwings as xw
import os

# Lista de nombres de archivos
file_names = [
    'SUC-DEC.xlsx',
    'EVA-EST.xlsx',
    'TRA-DEC.xlsx',
    'DEC-DON.xlsx',
    'HAB-URB.xlsx'
]

# Carpeta: misma que la del script
folder_path = r'D:\Documents\planosperu-app\backend\docs'

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

        # Editar celdas B61 y B62
        sheet.range('B61').value = 'Cuota 1 S/  '
        sheet.range('B62').value = 'Cuota 2 S/  '
        sheet.range('B63').value = 'Cuota 3 S/  '
        sheet.range('B64').value = 'Cuota 4 S/  '

        wb.save()
        wb.close()

        print(f"✅ Editado: {file_name}")

    except Exception as e:
        print(f"⚠️ Error con {file_name}: {e}")

# Cerrar la instancia de Excel
app.quit()

print("🚀 Proceso completado.")
