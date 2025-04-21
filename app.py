# app.py
from flask import Flask, request, send_file
import xlwings as xw
import os
from flask_cors import CORS
import traceback


app = Flask(__name__)
CORS(app)
@app.route('/crear-cotizacion', methods=['POST'])
def crear_cotizacion():
    try:
        # Obtener los datos de la solicitud
        data = request.json
        cotizacion_id = data.get('id')
        codigo = data.get('codigo')
        nombre = data.get('nombre')
        detalles = data.get('detalles')
        cliente = data.get('cliente')

        # Definir las rutas del archivo
        ruta_original = 'Cotizaciones.xlsm'
        ruta_salida = 'Cotizaciones_modificado.xlsm'

        # Verificar si el archivo original existe
        if not os.path.exists(ruta_original):
            return 'El archivo original no se encuentra', 400

        # Abrir el archivo de Excel
        app_excel = xw.App(visible=False)
        libro = app_excel.books.open(ruta_original)

        # Asegurarse de que la hoja con el código existe
        hojas = [hoja.name for hoja in libro.sheets]
        if codigo not in hojas:
            return f'La hoja con el código "{codigo}" no existe en el archivo', 400

        # Eliminar todas las hojas excepto la especificada
        for hoja in libro.sheets:
            if hoja.name != codigo:
                if hoja != libro.sheets.active:
                    hoja.delete()
                else:
                    print(f"No se puede eliminar la hoja activa: {hoja.name}")

        # Rellenar los datos en la hoja seleccionada
        hoja = libro.sheets[codigo]
        hoja.range('B11').value = nombre
        hoja.range('G11').value = detalles[:15]
        hoja.range('B15').value = cliente

        # Guardar y cerrar el archivo modificado
        libro.save(ruta_salida)
        libro.close()
        app_excel.quit()

        # Enviar el archivo modificado al cliente
        return send_file(ruta_salida, as_attachment=True)

    except Exception as e:
        # Manejar errores y registrar el mensaje
        error_message = traceback.format_exc()
        print(error_message)
        return f'Ocurrió un error: {str(e)}', 500

if __name__ == '__main__':
    app.run(port=5000)