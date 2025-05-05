from flask import Flask, request, send_file
import xlwings as xw
import os
import tempfile
import traceback
from datetime import datetime
from flask_cors import CORS
import sys
import uuid
app = Flask(__name__)
CORS(app)

def obtener_ruta_absoluta(nombre_archivo):
    base_path = os.path.dirname(os.path.abspath(sys.executable))  
    return os.path.join(base_path, nombre_archivo)

@app.route('/crear-cotizacion-pdf', methods=['POST'])
def crear_cotizacion_pdf():
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
        observaciones = data.get('observaciones') or ' '
        pisos = data.get('piso')
        area = data.get('area')
        cuotas = data.get('cuotas', [])
        fechas = data.get('fechas', [])
        
        # Verificar si el archivo de plantilla existe con el nombre del código
        ruta_original = obtener_ruta_absoluta(f'{codigo}.xlsx')
        if not os.path.exists(ruta_original):
            return f'El archivo con el código "{codigo}" no se encuentra', 400

        # Iniciar Excel de forma oculta
        app_excel = xw.App(visible=False)
        libro = app_excel.books.open(ruta_original)

        hoja = libro.sheets[0]  # Solo se trabaja con la primera hoja del archivo

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

        nombre_archivo = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}-{cliente_limpio}-{ubicacion_limpia}"
        hoja.range('E19').value = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}"
        print(f"Nombre del archivo generado: {nombre_archivo}")

        # Crear archivo temporal Excel
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as temp_file:
            ruta_salida = temp_file.name

        # Guardar el archivo generado como Excel
        libro.save(ruta_salida)

        # Exportar a PDF
        pdf_temp_path = ruta_salida.replace(".xlsx", ".pdf")
        hoja.to_pdf(pdf_temp_path)  # Exporta a PDF usando xlwings

        # Cerrar el libro y la aplicación Excel
        libro.close()
        app_excel.quit()

        # Asegurarse de que el archivo PDF se pase correctamente
        return send_file(
            pdf_temp_path,
            as_attachment=True,
            download_name=f"{nombre_archivo}.pdf",  # Usar el nombre correcto para el archivo PDF
            mimetype='application/pdf'
        )

    except Exception as e:
        print(traceback.format_exc())
        return f'Ocurrió un error: {str(e)}', 500
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
        observaciones = data.get('observaciones') or ' '
        pisos = data.get('piso')
        area = data.get('area')
        cuotas = data.get('cuotas', [])
        fechas = data.get('fechas', [])
        
        # Verificar si el archivo de plantilla existe con el nombre del código
        ruta_original = obtener_ruta_absoluta(f'{codigo}.xlsx')
        if not os.path.exists(ruta_original):
            return f'El archivo con el código "{codigo}" no se encuentra', 400

        # Iniciar Excel de forma oculta
        app_excel = xw.App(visible=False)
        libro = app_excel.books.open(ruta_original)

        hoja = libro.sheets[0]  # Solo se trabaja con la primera hoja del archivo

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

        nombre_archivo_excel = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}-{cliente_limpio}-{ubicacion_limpia}.xlsx"
        hoja.range('E19').value = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}"
        print(f"Nombre del archivo generado: {nombre_archivo_excel}")

        # Crear archivo temporal Excel
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as temp_file:
            ruta_salida = temp_file.name

        # Guardar el archivo generado como Excel
        libro.save(ruta_salida)

        # Cerrar el libro y la aplicación Excel
        libro.close()
        app_excel.quit()

        # Asegurarse de que el archivo Excel se pase correctamente
        return send_file(
            ruta_salida,  # Pasar la ruta del archivo Excel generado
            as_attachment=True,
            download_name=nombre_archivo_excel,  # Usar el nombre correcto para el archivo Excel
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'  # MIME tipo para archivos Excel
        )
  except Exception as e:
        import traceback
        print(traceback.format_exc())
        return f'Error al procesar el formulario: {str(e)}', 500
@app.route('/formulario-persona-natural', methods=['POST'])
def formulario_persona_natural():
    try:
        # Obtener los datos del JSON recibido
        data = request.json
        
        # Imprimir todo el JSON recibido para ver los datos completos
        print("Datos recibidos:", data)
        
        # Acceder al objeto 'ot' para obtener los datos principales
        ot_data = data.get('ot', {})
        
        # Imprimir los datos del objeto 'ot'
        print("Datos de OT:", ot_data)
        
        # Verificar si los datos de 'ot' están presentes
        if not ot_data:
            return 'Datos de OT no proporcionados', 400
        
        # Ruta del archivo de plantilla Excel
        ruta_formulario = obtener_ruta_absoluta('Formulario Persona Natural.xlsm')
        if not os.path.exists(ruta_formulario):
            return 'No se encontró el archivo', 400

        # Inicializar la aplicación de Excel
        app_excel = xw.App(visible=False)
        libro = app_excel.books.open(ruta_formulario)
        hoja = libro.sheets[0]  # Hoja principal
        hoja_formulario = libro.sheets['FORMULARIO']  # Hoja de formulario

        # Llenar los campos básicos del formulario con los datos de 'ot'
        hoja.range('D1').value = ot_data.get('ot', '')
        hoja.range('D2').value = ot_data.get('siglas', '')
        hoja.range('D5').value = ot_data.get('apellidos', '')
        hoja.range('D6').value = ot_data.get('nombres', '')
        hoja.range('D7').value = ot_data.get('dni', '')
        hoja.range('D8').value = ot_data.get('direccion', '')
        hoja.range('D10').value = ot_data.get('conyugue', '')
        hoja.range('D11').value = ot_data.get('area_m2', '')
        hoja.range('D12').value = ot_data.get('partida_registral', '')
        hoja.range('D13').value = ot_data.get('valor_unitario', '')

        # === Llenar las Unidades Inmobiliarias ===
        # Obtener la lista de unidades inmobiliarias
        unidades = data.get('unidades_inmobiliaria', [])
        
        # Imprimir los datos de las unidades inmobiliarias
        print("Unidades inmobiliarias:", unidades)
        
        # Iterar sobre cada unidad inmobiliaria y llenarlas en el formulario
        for i, unidad in enumerate(unidades):
            offset = 8 * i  # Cada unidad inmobiliaria ocupa 8 filas consecutivas

            # Imprimir los datos de cada unidad inmobiliaria
            print(f"Unidad inmobiliaria {i + 1}:", unidad)
            nivel = unidad.get('nivel', '')
            # **UNIDAD INMOBILIARIA (Número de unidad)**
            hoja_formulario.range(f'B{318 + offset}').value = f'UNIDAD INMOBILIARIA {nivel}'
            hoja_formulario.range(f'B{322 + offset}').value = "NIVEL"
            hoja_formulario.range(f'B{324 + offset}').value = "USO"
            # **Área Ocupada**
            hoja_formulario.range(f'D{318 + offset}').value = "ÁREA OCUPADA"
            # **Área Techada**
            hoja_formulario.range(f'D{320 + offset}').value = "ÁREA TECHADA"
            # **Área Libre**
            hoja_formulario.range(f'D{323 + offset}').value = "ÁREA LIBRE"
            # **Por el frente**
            hoja_formulario.range(f'F{318 + offset}').value = "Por el Frente"
            # **Tramo(s) (Frente)**
            hoja_formulario.range(f'G{319 + offset}').value = "TRAMO(S)"
            # **Por la derecha**
            hoja_formulario.range(f'F{320 + offset}').value = "Por la Derecha"
            # **Tramo(s) (Derecha)**
            hoja_formulario.range(f'G{321 + offset}').value = "TRAMO(S)"
            # **Por la izquierda**
            hoja_formulario.range(f'F{322 + offset}').value = "Por la Izquierda"
            # **Tramo(s) (Izquierda)**
            hoja_formulario.range(f'G{323 + offset}').value = "TRAMO(S)"
            # **Por el fondo**
            hoja_formulario.range(f'F{324 + offset}').value = "Por el Fondo"
            # **Tramo(s) (Fondo)**
            hoja_formulario.range(f'G{325 + offset}').value = "TRAMO(S)"

            # Ahora llenamos los valores reales de las unidades inmobiliarias
            hoja_formulario.range(f'E{318 + offset}').value = unidad.get('area_ocupada', '')
            hoja_formulario.range(f'E{320 + offset}').value = unidad.get('area_techada', '')
            hoja_formulario.range(f'B{323 + offset}').value = unidad.get('nivel', '')
            hoja_formulario.range(f'B{325 + offset}').value = unidad.get('uso', '')
            # Calcular el área libre (si el campo 'area_ocupada' y 'area_techada' están presentes y son numéricos)
            try:
                area_ocupada = float(unidad.get('area_ocupada', 0) or 0)
                area_techada = float(unidad.get('area_techada', 0) or 0)
                area_libre = area_ocupada - area_techada
            except ValueError:
                area_libre = ''  # Si no es posible calcular, dejar vacío
            hoja_formulario.range(f'E{323 + offset}').value = area_libre

            # Llenar los campos del perímetro de la unidad

            hoja_formulario.range(f'H{318 + offset}').value = unidad.get('por_frente', '')
            hoja_formulario.range(f'H{319 + offset}').value = unidad.get('tramo_frente', '')
            hoja_formulario.range(f'H{320 + offset}').value = unidad.get('por_derecha', '')
            hoja_formulario.range(f'H{321 + offset}').value = unidad.get('tramo_derecha', '')
            hoja_formulario.range(f'H{322 + offset}').value = unidad.get('por_izquierda', '')
            hoja_formulario.range(f'H{323 + offset}').value = unidad.get('tramo_izquierda', '')
            hoja_formulario.range(f'H{324 + offset}').value = unidad.get('por_fondo', '')
            hoja_formulario.range(f'H{325 + offset}').value = unidad.get('tramo_fondo', '')

        # Asignar estado civil (casado, soltero, etc.)
        estado = ot_data.get('estado_civil', '').lower()
        shapes = {
            'soltero': 'cbxEstado1',
            'casado': 'cbxEstado2',
            'viudo': 'cbxEstado3',
            'divorciado': 'cbxEstado4',
            'separada juridicamente': 'cbxEstado5'
        }

        # Imprimir el estado civil
        print("Estado civil:", estado)

        # Verificar cuál es el estado civil y marcarlo en el formulario
        shape_names = [s.Name for s in hoja_formulario.api.Shapes]
        for shape_name in shapes.values():
            if shape_name in shape_names:
                hoja_formulario.api.Shapes(shape_name).TextFrame.Characters().Text = ""

        if estado in shapes and shapes[estado] in shape_names:
            hoja_formulario.api.Shapes(shapes[estado]).TextFrame.Characters().Text = "X"
            
        area_comun = data.get('area_comun', [])
        
        # Imprimir los datos de las unidades inmobiliarias
        print("Áreas comunes:", area_comun)

        # Iterar sobre cada unidad inmobiliaria y llenarlas en el formulario
        for i, comun in enumerate(area_comun):
            offset = 8 * i  # Cada unidad inmobiliaria ocupa 8 filas consecutivas

            # Imprimir los datos de cada unidad inmobiliaria
            print(f"ÁREA COMÚN {i + 1}:", unidad)
            nivel = comun.get('nivel', '')
            # **UNIDAD INMOBILIARIA (Número de unidad)**
            hoja_formulario.range(f'B{371 + offset}').value = f'ÁREA COMÚN {nivel}'
            hoja_formulario.range(f'B{375 + offset}').value = "NIVEL"
            hoja_formulario.range(f'B{377 + offset}').value = "USO"
            # **Área Ocupada**
            hoja_formulario.range(f'D{371 + offset}').value = "ÁREA OCUPADA"
            # **Área Techada**
            hoja_formulario.range(f'D{373 + offset}').value = "ÁREA TECHADA"
            # **Área Libre**
            hoja_formulario.range(f'D{376 + offset}').value = "ÁREA LIBRE"
            # **Por el frente**
            hoja_formulario.range(f'F{371 + offset}').value = "Por el Frente"
            # **Tramo(s) (Frente)**
            hoja_formulario.range(f'G{372 + offset}').value = "TRAMO (S)"
            # **Por la derecha**
            hoja_formulario.range(f'F{373 + offset}').value = "Por la Derecha"
            # **Tramo(s) (Derecha)**
            hoja_formulario.range(f'G{374 + offset}').value = "TRAMO (S)"
            # **Por la izquierda**
            hoja_formulario.range(f'F{375 + offset}').value = "Por la Izquierda"
            # **Tramo(s) (Izquierda)**
            hoja_formulario.range(f'G{376 + offset}').value = "TRAMO (S)"
            # **Por el fondo**
            hoja_formulario.range(f'F{377 + offset}').value = "Por el Fondo"
            # **Tramo(s) (Fondo)**
            hoja_formulario.range(f'G{378 + offset}').value = "TRAMO (S)"

            # Ahora llenamos los valores reales de las unidades inmobiliarias
            hoja_formulario.range(f'E{371 + offset}').value = comun.get('area_ocupada', '')
            hoja_formulario.range(f'E{373 + offset}').value = comun.get('area_techada', '')
            hoja_formulario.range(f'B{376 + offset}').value = comun.get('nivel', '')
            hoja_formulario.range(f'B{378 + offset}').value = comun.get('uso', '')
            # Calcular el área libre (si el campo 'area_ocupada' y 'area_techada' están presentes y son numéricos)
            try:
                area_ocupada = float(unidad.get('area_ocupada', 0) or 0)
                area_techada = float(unidad.get('area_techada', 0) or 0)
                area_libre = area_ocupada - area_techada
            except ValueError:
                area_libre = ''  # Si no es posible calcular, dejar vacío
            hoja_formulario.range(f'E{376 + offset}').value = area_libre

            # Llenar los campos del perímetro de la unidad

            hoja_formulario.range(f'H{371 + offset}').value = unidad.get('por_frente', '')
            hoja_formulario.range(f'H{372 + offset}').value = unidad.get('tramo_frente', '')
            hoja_formulario.range(f'H{373 + offset}').value = unidad.get('por_derecha', '')
            hoja_formulario.range(f'H{374 + offset}').value = unidad.get('tramo_derecha', '')
            hoja_formulario.range(f'H{375 + offset}').value = unidad.get('por_izquierda', '')
            hoja_formulario.range(f'H{376 + offset}').value = unidad.get('tramo_izquierda', '')
            hoja_formulario.range(f'H{377 + offset}').value = unidad.get('por_fondo', '')
            hoja_formulario.range(f'H{378 + offset}').value = unidad.get('tramo_fondo', '')


        
        # Guardar el archivo generado en una ruta temporal
        nombre_temporal = f"Formulario_Persona_Natural_{uuid.uuid4().hex}.xlsm"
        ruta_temporal = os.path.join(tempfile.gettempdir(), nombre_temporal)

        libro.save(ruta_temporal)
        libro.close()
        app_excel.quit()

        # Enviar el archivo al frontend para su descarga
        return send_file(ruta_temporal, as_attachment=True, download_name="Formulario_Persona_Natural.xlsm")

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return f'Error al procesar el formulario: {str(e)}', 500

if __name__ == '__main__':
    app.run(port=5000)
