from flask import Flask, request, send_file
import xlwings as xw
import os
import tempfile
import traceback
from datetime import datetime
from flask_cors import CORS
import sys
import uuid
import textwrap
from collections import defaultdict

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
        areas_por_nivel = {'sotano': {'ocupada': 0, 'techada': 0, 'libre': 0}, 
                          'semisotano': {'ocupada': 0, 'techada': 0, 'libre': 0}, 
                           '1': {'ocupada': 0, 'techada': 0, 'libre': 0}, 
                           '2': {'ocupada': 0, 'techada': 0, 'libre': 0}, 
                           '3': {'ocupada': 0, 'techada': 0, 'libre': 0}, 
                           '4': {'ocupada': 0, 'techada': 0, 'libre': 0},
                           '5': {'ocupada': 0, 'techada': 0, 'libre': 0},
                           '6': {'ocupada': 0, 'techada': 0, 'libre': 0},
                           '7': {'ocupada': 0, 'techada': 0, 'libre': 0},
                           '8': {'ocupada': 0, 'techada': 0, 'libre': 0},
                           'azotea': {'ocupada': 0, 'techada': 0, 'libre': 0}, }
        # Obtener la lista de unidades inmobiliarias
        unidades = data.get('unidades_inmobiliaria', [])
        
        # Imprimir los datos de las unidades inmobiliarias
        print("Unidades inmobiliarias:", unidades)
        
        # Iterar sobre cada unidad inmobiliaria y llenarlas en el formulario
        for i, unidad in enumerate(unidades):
            if i < 6:
                offset = 8 * i
            else:
                offset = (8 * i) + 2
            nivel = unidad.get('nivel', '')
            area_ocupada = float(unidad.get('area_ocupada', 0) or 0)
            area_techada = float(unidad.get('area_techada', 0) or 0)
            area_libre = area_ocupada - area_techada

            # ✅ Asegúrate de inicializar el nivel si no existe
            if nivel not in areas_por_nivel:
                areas_por_nivel[nivel] = {
                    'ocupada': 0.0,
                    'techada': 0.0,
                    'libre': 0.0
                }

            # Luego sí suma
            areas_por_nivel[nivel]['ocupada'] += area_ocupada
            areas_por_nivel[nivel]['techada'] += area_techada
            areas_por_nivel[nivel]['libre'] += area_libre

            # Imprimir los datos de cada unidad inmobiliaria
            print(f"Unidad inmobiliaria {i + 1}:", unidad)
            numero_unidad= unidad.get('numero_unidad', '')
            # **UNIDAD INMOBILIARIA (Número de unidad)**
            hoja_formulario.range(f'A{315 + offset}').value = f'UNIDAD INMOBILIARIA {numero_unidad}'
            hoja_formulario.range(f'A{319 + offset}').value = "NIVEL"
            hoja_formulario.range(f'A{321 + offset}').value = "USO"
            # **Área Ocupada**
            hoja_formulario.range(f'D{315 + offset}').value = "ÁREA OCUPADA"
            # **Área Techada**
            hoja_formulario.range(f'D{317 + offset}').value = "ÁREA TECHADA"
            # **Área Libre**
            hoja_formulario.range(f'D{320 + offset}').value = "ÁREA LIBRE"
            # **Por el frente**
            hoja_formulario.range(f'F{315 + offset}').value = "Por el Frente"
            # **Tramo(s) (Frente)**
            hoja_formulario.range(f'G{316 + offset}').value = "TRAMO(S)"
            # **Por la derecha**
            hoja_formulario.range(f'F{317 + offset}').value = "Por la Derecha"
            # **Tramo(s) (Derecha)**
            hoja_formulario.range(f'G{318 + offset}').value = "TRAMO(S)"
            # **Por la izquierda**
            hoja_formulario.range(f'F{319 + offset}').value = "Por la Izquierda"
            # **Tramo(s) (Izquierda)**
            hoja_formulario.range(f'G{320 + offset}').value = "TRAMO(S)"
            # **Por el fondo**
            hoja_formulario.range(f'F{321 + offset}').value = "Por el Fondo"
            # **Tramo(s) (Fondo)**
            hoja_formulario.range(f'G{322 + offset}').value = "TRAMO(S)"

            # Ahora llenamos los valores reales de las unidades inmobiliarias
            hoja_formulario.range(f'E{315 + offset}').value = unidad.get('area_ocupada', '')
            hoja_formulario.range(f'E{317 + offset}').value = unidad.get('area_techada', '')
            # Suponiendo que 'nivel' es un número y lo deseas concatenar con "° PISO"
            nivel = unidad.get('nivel', '') 
            # Verifica si el nivel es un número entre '1' y '8'
            if nivel in ['1', '2', '3', '4', '5', '6', '7', '8']:
                            nivel_texto = f"{nivel}° PISO"
            else:
                nivel_texto = nivel.upper() 


            # Asignar el valor a la celda correspondiente en Excel
            hoja_formulario.range(f'A{320 + offset}').value = nivel_texto
            hoja_formulario.range(f'A{322 + offset}').value = unidad.get('uso', '')
            # Calcular el área libre (si el campo 'area_ocupada' y 'area_techada' están presentes y son numéricos)
            try:
                area_ocupada = float(unidad.get('area_ocupada', 0) or 0)
                area_techada = float(unidad.get('area_techada', 0) or 0)
                area_libre = area_ocupada - area_techada
            except ValueError:
                area_libre = ''  # Si no es posible calcular, dejar vacío
            hoja_formulario.range(f'E{320 + offset}').value = area_libre

            # Llenar los campos del perímetro de la unidad

            hoja_formulario.range(f'H{315 + offset}').value = unidad.get('por_frente', '')
            hoja_formulario.range(f'H{316 + offset}').value = unidad.get('tramo_frente', '')
            hoja_formulario.range(f'F{316 + offset}').value = unidad.get('tramo_frente_num', '')
            hoja_formulario.range(f'H{317 + offset}').value = unidad.get('por_derecha', '')
            hoja_formulario.range(f'H{318 + offset}').value = unidad.get('tramo_derecha', '')
            hoja_formulario.range(f'F{318 + offset}').value = unidad.get('tramo_derecha_num', '')
            hoja_formulario.range(f'H{319 + offset}').value = unidad.get('por_izquierda', '')
            hoja_formulario.range(f'H{320 + offset}').value = unidad.get('tramo_izquierda', '')
            hoja_formulario.range(f'F{320 + offset}').value = unidad.get('tramo_izquierda_num', '')
            hoja_formulario.range(f'H{321 + offset}').value = unidad.get('por_fondo', '')
            hoja_formulario.range(f'H{322 + offset}').value = unidad.get('tramo_fondo', '')
            hoja_formulario.range(f'F{322 + offset}').value = unidad.get('tramo_fondo_num', '')

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
            if i < 6:
                offset = 8 * i
            else:
                offset = (8 * i) + 2
            
            nivel = comun.get('nivel', '')
            area_ocupada = float(comun.get('area_ocupada', 0) or 0)
            area_techada = float(comun.get('area_techada', 0) or 0)
            area_libre = area_ocupada - area_techada

            # ✅ Inicializar si no existe
            if nivel not in areas_por_nivel:
                areas_por_nivel[nivel] = {
                    'ocupada': 0.0,
                    'techada': 0.0,
                    'libre': 0.0
                }

            # Sumar
            areas_por_nivel[nivel]['ocupada'] += area_ocupada
            areas_por_nivel[nivel]['techada'] += area_techada
            areas_por_nivel[nivel]['libre'] += area_libre

            # Imprimir los datos de cada unidad inmobiliaria
            numero_unidad= comun.get('numero_unidad', '')
            # **UNIDAD INMOBILIARIA (Número de unidad)**
            hoja_formulario.range(f'A{417 + offset}').value = f'ÁREA COMÚN {numero_unidad}'
            hoja_formulario.range(f'A{421 + offset}').value = "NIVEL"
            hoja_formulario.range(f'A{423 + offset}').value = "USO"
            # **Área Ocupada**
            hoja_formulario.range(f'D{417 + offset}').value = "ÁREA OCUPADA"
            # **Área Techada**
            hoja_formulario.range(f'D{419 + offset}').value = "ÁREA TECHADA"
            # **Área Libre**
            hoja_formulario.range(f'D{422 + offset}').value = "ÁREA LIBRE"
            # **Por el frente**
            hoja_formulario.range(f'F{417 + offset}').value = "Por el Frente"
            # **Tramo(s) (Frente)**
            hoja_formulario.range(f'G{418 + offset}').value = "TRAMO (S)"
            # **Por la derecha**
            hoja_formulario.range(f'F{419 + offset}').value = "Por la Derecha"
            # **Tramo(s) (Derecha)**
            hoja_formulario.range(f'G{420 + offset}').value = "TRAMO (S)"
            # **Por la izquierda**
            hoja_formulario.range(f'F{421 + offset}').value = "Por la Izquierda"
            # **Tramo(s) (Izquierda)**
            hoja_formulario.range(f'G{422 + offset}').value = "TRAMO (S)"
            # **Por el fondo**
            hoja_formulario.range(f'F{423 + offset}').value = "Por el Fondo"
            # **Tramo(s) (Fondo)**
            hoja_formulario.range(f'G{424 + offset}').value = "TRAMO (S)"

            # Ahora llenamos los valores reales de las unidades inmobiliarias
            hoja_formulario.range(f'E{417 + offset}').value = comun.get('area_ocupada', '')
            hoja_formulario.range(f'E{419 + offset}').value = comun.get('area_techada', '')
            nivel = comun.get('nivel', '') 
            # Verifica si el nivel es un número entre '1' y '8'
            if nivel in ['1', '2', '3', '4', '5', '6', '7', '8']:
                nivel_texto = f"{nivel}° PISO"
            else:
                nivel_texto = nivel.upper() 

            # Asignar el valor a la celda correspondiente en Excel
            hoja_formulario.range(f'A{422 + offset}').value = nivel_texto
            hoja_formulario.range(f'A{424 + offset}').value = comun.get('uso', '')
            # Calcular el área libre (si el campo 'area_ocupada' y 'area_techada' están presentes y son numéricos)
            try:
                area_ocupada = float(unidad.get('area_ocupada', 0) or 0)
                area_techada = float(unidad.get('area_techada', 0) or 0)
                area_libre = area_ocupada - area_techada
            except ValueError:
                area_libre = ''  # Si no es posible calcular, dejar vacío
            hoja_formulario.range(f'E{422 + offset}').value = area_libre

            # Llenar los campos del perímetro de la unidad

            hoja_formulario.range(f'H{417 + offset}').value = unidad.get('por_frente', '')
            hoja_formulario.range(f'H{418 + offset}').value = unidad.get('tramo_frente', '')
            hoja_formulario.range(f'F{418 + offset}').value = unidad.get('tramo_frente_num', '')
            hoja_formulario.range(f'H{419 + offset}').value = unidad.get('por_derecha', '')
            hoja_formulario.range(f'H{420 + offset}').value = unidad.get('tramo_derecha', '')
            hoja_formulario.range(f'F{420 + offset}').value = unidad.get('tramo_derecha_num', '')
            hoja_formulario.range(f'H{421 + offset}').value = unidad.get('por_izquierda', '')
            hoja_formulario.range(f'H{422 + offset}').value = unidad.get('tramo_izquierda', '')
            hoja_formulario.range(f'F{422 + offset}').value = unidad.get('tramo_izquierda_num', '')
            hoja_formulario.range(f'H{423 + offset}').value = unidad.get('por_fondo', '')
            hoja_formulario.range(f'H{424 + offset}').value = unidad.get('tramo_fondo', '')
            hoja_formulario.range(f'F{424 + offset}').value = unidad.get('tramo_fondo_num', '')
           # Crear el orden de los niveles basado en los niveles disponibles
            niveles_presentes = []

                        # Definimos la función obtener_area_ocupada, para manejar tanto enteros como cadenas
            def obtener_area_ocupada(nivel):
                # Si el nivel es numérico (como 1, 2, 3, 4), lo buscamos directamente
                if isinstance(nivel, int) and nivel in areas_por_nivel:
                    return areas_por_nivel[nivel]['ocupada']
                # Si el nivel es una cadena (como 'sotano', 'semisotano', 'azotea'), también lo buscamos
                elif isinstance(nivel, str) and nivel in areas_por_nivel:
                    return areas_por_nivel[nivel]['ocupada']
                return 0  # Si no se encuentra el nivel, retornamos 0 como valor por defecto

            # Crear el orden de los niveles basado en los niveles disponibles
            niveles_presentes = []

            # Primero verificamos si el "sótano" tiene área ocupada
            if 'sotano' in areas_por_nivel and obtener_area_ocupada('sotano') > 0:
                niveles_presentes.append('sotano')

            # Después verificamos el "semisotano"
            if 'semisotano' in areas_por_nivel and obtener_area_ocupada('semisotano') > 0:
                niveles_presentes.append('semisotano')

            # Ahora verificamos los pisos numerados del 1 al 4
            for i in range(1, 5):
                nivel_str = str(i)  # Convertimos el número a cadena
                
                if obtener_area_ocupada(nivel_str) > 0:  # Verificamos si el nivel tiene área ocupada
                    niveles_presentes.append(nivel_str)  # Agregamos la clave como cadena


            # Finalmente, verificamos la "azotea"
            if 'azotea' in areas_por_nivel and obtener_area_ocupada('azotea') > 0:
                niveles_presentes.append('azotea')

            # Imprimir los niveles presentes para ver si todos están siendo agregados correctamente
            print(f"Niveles presentes: {niveles_presentes}")  # Esto te ayudará a depurar si los niveles son correctos

            # Asignar los valores a las celdas en Excel en el orden adecuado
            fila_inicio = 215  # Fila de inicio para los datos (E215)
            for i, nivel in enumerate(niveles_presentes):
                fila = fila_inicio + i  # Las filas se incrementan para cada nivel

                # Columna A: nombre del nivel
                if nivel in ['1', '2', '3', '4']:
                    hoja_formulario.range(f'A{fila}').value = f"{nivel}°"
                elif nivel == 'sotano':
                    hoja_formulario.range(f'A{fila}').value = "SÓTANO"
                elif nivel == 'semisotano':
                    hoja_formulario.range(f'A{fila}').value = "SEMISÓTANO"
                elif nivel == 'azotea':
                    hoja_formulario.range(f'A{fila}').value = "AZOTEA"

                # Columna E: área ocupada
                hoja_formulario.range(f'E{fila}').value = obtener_area_ocupada(nivel)

                # Columna G: área techada
                if isinstance(areas_por_nivel.get(nivel), dict) and 'techada' in areas_por_nivel[nivel]:
                    hoja_formulario.range(f'G{fila}').value = float(areas_por_nivel[nivel]['techada'])
                else:
                    hoja_formulario.range(f'G{fila}').value = 0.0

                # Columna I: área libre
                if isinstance(areas_por_nivel.get(nivel), dict) and 'libre' in areas_por_nivel[nivel]:
                    hoja_formulario.range(f'I{fila}').value = float(areas_por_nivel[nivel]['libre'])
                else:
                    hoja_formulario.range(f'I{fila}').value = 0.0

                # Agregar "m2" en F, H, K
                hoja_formulario.range(f'F{fila}').value = "m2"
                hoja_formulario.range(f'H{fila}').value = "m2"
                hoja_formulario.range(f'K{fila}').value = "m2"
        niveles = data.get('niveles', "")
        lineas_niveles = niveles.split('\n')
        fila_inicial = 239
        fila_actual = fila_inicial  # Controla en qué fila estamos escribiendo
        for linea in lineas_niveles:
            if not linea.strip():
                continue  # Omitir líneas vacías

            partes = textwrap.wrap(linea, width=200)

            for parte in partes:
                hoja_formulario.range(f'A{fila_actual}').value = parte
                fila_actual += 1  # Pasar a la siguiente fila

        # Mapea cada unidad inmobiliaria con una lista de niveles
        niveles_por_unidad = defaultdict(list)

        # Agrupar niveles por unidad inmobiliaria
        for unidad in data.get('unidades_inmobiliaria', []):
            nivel = unidad.get('nivel', '')
            numero_unidad = unidad.get('numero_unidad', '')

            if nivel and numero_unidad:
                niveles_por_unidad[numero_unidad].append(nivel)

        # Inicializamos fila
        fila_ui = 293

        # Mostrar cada unidad inmobiliaria una vez
        for numero_unidad, niveles in niveles_por_unidad.items():
            niveles_mapeados = []
            for nivel in niveles:
                if nivel.lower() == 'sotano':
                    niveles_mapeados.append("SÓTANO")
                elif nivel.lower() == 'semisotano':
                    niveles_mapeados.append("SEMISÓTANO")
                elif nivel.lower() == 'azotea':
                    niveles_mapeados.append("AZOTEA")
                elif nivel.isdigit():
                    niveles_mapeados.append(f"{nivel}°")
                else:
                    niveles_mapeados.append(nivel.upper())

            niveles_unicos = list(dict.fromkeys(niveles_mapeados))

            hoja_formulario.range(f'F{fila_ui}').value = f'UI {numero_unidad}'
            hoja_formulario.range(f'E{fila_ui}').value = ", ".join(niveles_unicos)

            # 🟦 USO asignado (G columna)
            uso_asignado = None
            for unidad in data.get('unidades_inmobiliaria', []):
                if unidad.get('numero_unidad') == numero_unidad:
                    uso_asignado = unidad.get('uso', '').upper()
                    break

            hoja_formulario.range(f'G{fila_ui}').value = uso_asignado or ''
            fila_ui += 1
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
