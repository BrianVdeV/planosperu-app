from flask import Flask, request, send_file
import xlwings as xw
import os
import tempfile
import traceback
from datetime import datetime
from flask_cors import CORS
from waitress import serve

app = Flask(__name__)
CORS(app)
app.debug = False

@app.route('/crear-cotizacion', methods=['POST'])
def crear_cotizacion():
    try:
        # Obtener los datos recibidos en el JSON
        data = request.json
        print("JSON recibido:", data)

        codigo = data.get('codigo')
        nombre = data.get('usuario')
        detalles = data.get('detalles', '')
        cliente = data.get('cliente')
        ubicacion = data.get('ubicacion')
        telefono = data.get('telefono')
        dni = data.get('dni')
        observaciones = data.get('observaciones', '')
        pisos = data.get('piso')
        area = data.get('area')
        cuotas = data.get('cuotas', [])
        fechas = data.get('fechas', [])

        # Verificar si el archivo de plantilla existe
        ruta_original = 'Cotizaciones.xlsm'
        if not os.path.exists(ruta_original):
            return 'El archivo original no se encuentra', 400

        # Iniciar Excel de forma oculta
        app_excel = xw.App(visible=False)
        libro = app_excel.books.open(ruta_original)

        # Verificar si la hoja con el código existe
        if codigo not in [hoja.name for hoja in libro.sheets]:
            return f'La hoja con el código "{codigo}" no existe en el archivo', 400

        # Eliminar hojas innecesarias
        for hoja in libro.sheets:
            if hoja.name != codigo:
                hoja.delete()

        hoja = libro.sheets[codigo]

        # Limitar el tamaño de los detalles
        limites_detalles = [15, 60]
        partes = []
        texto_restante = detalles.strip()

        for limite in limites_detalles:
            if len(texto_restante) <= limite:
                partes.append(texto_restante)
                texto_restante = ''
            else:
                corte = texto_restante[:limite]
                espacio = corte.rfind(' ')
                if espacio != -1:
                    partes.append(texto_restante[:espacio].strip())
                    texto_restante = texto_restante[espacio + 1:].strip()
                else:
                    partes.append(corte.strip())
                    texto_restante = texto_restante[limite:].strip()
        if texto_restante:
            partes.append(texto_restante)

        # Llenar las celdas de detalles
        celdas_detalles = ['G11', 'B12', 'B13']
        for i in range(min(3, len(partes))):
            hoja.range(celdas_detalles[i]).value = partes[i]

        # Rellenar los datos del cliente y la ubicación
        hoja.range('B15').value = cliente
        hoja.range('G15').value = ubicacion
        hoja.range('G16').value = telefono
        hoja.range('B17').value = dni
        hoja.range('B14').value = pisos
        hoja.range('D14').value = area

        # Llenar observaciones
        for i, linea in enumerate(observaciones.split('\n'), start=52):
            if i > 54:
                break
            hoja.range(f'C{i}').value = linea

        # Llenar cuotas
        celdas_cuotas = ['C61', 'C62', 'C63', 'C64']
        for i, monto in enumerate(cuotas):
            if i < len(celdas_cuotas):
                hoja.range(celdas_cuotas[i]).value = monto

        # Llenar fechas
        celdas_fechas = ['G61', 'G62', 'G63', 'G64']
        for i, fecha in enumerate(fechas):
            if i < len(celdas_fechas):
                hoja.range(celdas_fechas[i]).value = fecha

        # Crear nombre de archivo único
        hoy = datetime.now()
        anio = hoy.strftime("%Y")
        mes_dia = hoy.strftime("%m%d")
        abreviado_usuario = (nombre[:3] if nombre else 'USR').upper()

        # Función para limpiar el texto de caracteres especiales
        def limpiar(texto):
            return ''.join(c for c in texto if c.isalnum() or c in (' ', '-', '_')).replace(' ', '')

        cliente_limpio = limpiar(cliente or 'Cliente')
        ubicacion_limpia = limpiar(ubicacion or 'Ubicacion')

        nombre_archivo = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}-{cliente_limpio}-{ubicacion_limpia}.xlsm"
        print(f"Nombre del archivo generado: {nombre_archivo}")

        # Crear archivo temporal
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsm") as temp_file:
            ruta_salida = temp_file.name

        # Guardar el archivo generado
        libro.save(ruta_salida)
        libro.close()
        app_excel.quit()

        # Asegurarse de que el nombre del archivo se pase correctamente
        return send_file(
            ruta_salida,
            as_attachment=True,
            download_name=nombre_archivo,  # Usar la variable con el nombre correcto
            mimetype='application/vnd.ms-excel.sheet.macroEnabled.12'
        )

    except Exception as e:
        print(traceback.format_exc())
        return f'Ocurrió un error: {str(e)}', 500


if __name__ == '__main__':
    # Usar Waitress para servir la aplicación en producción
    serve(app, host='0.0.0.0', port=5000)
