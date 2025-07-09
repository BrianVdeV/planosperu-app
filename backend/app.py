"""App Flask"""
import os
import tempfile
import traceback
from datetime import datetime
import sys
import uuid
import textwrap
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import xlwings as xw
import fitz
import requests  # En lugar de node-fetch

HOST = "127.0.0.1"
PORT = 5000

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_resource_path(relative_path):
    """Devuelve la ruta absoluta al recurso, funciona dentro y fuera de PyInstaller"""
    base_path = getattr(sys, '_MEIPASS', os.path.abspath("."))
    return os.path.join(base_path, relative_path)


def obtener_ruta_absoluta(nombre_archivo):
    base_path = os.path.dirname(os.path.abspath(sys.executable))
    return os.path.join(base_path, nombre_archivo)


# Token de acceso para la API
TOKEN = 'apis-token-14662.Nmuzr6WVqKvh3GRMFOxpvNhO3wZxzxlA'  # Usa el tuyo real

# Ruta para consultar DNI


@app.get("/api/dni/{numero}")
def consultar_dni(numero):
    """Consulta el DNI usando la API de RENIEC"""
    try:
        headers = {
            'Authorization': f'Bearer {TOKEN}',
            'Accept': 'application/json',
        }
        response = requests.get(
            f'https://api.apis.net.pe/v2/reniec/dni?numero={numero}', headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        print(traceback.format_exc())
        return {'error': 'Error en la consulta al API del DNI'}, 500

# Ruta para consultar RUC


@app.route('/api/ruc/<numero>', methods=['GET'])
def consultar_ruc(numero):
    """Consulta el RUC usando la API de SUNAT"""
    try:
        headers = {
            'Authorization': f'Bearer {TOKEN}',
            'Accept': 'application/json',
        }
        response = requests.get(
            f'https://api.apis.net.pe/v2/sunat/ruc/full?numero={numero}', headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        print(traceback.format_exc())
        return {'error': 'Error en la consulta al API del RUC'}, 500


@app.post("/crear-cotizacion")
async def crear_cotizacion(request: Request):
    """Crear cotización en Excel y devolverla como archivo adjunto"""
    try:
        data = await request.json()
        # cotizaciones retorna la ruta del archivo generado
        ruta_xlsx = cotizaciones(data)

        # Nombre de archivo para descargar
        codigo = data.get('codigo', 'cotizacion')
        nombre = data.get('usuario', 'usuario')
        hoy = datetime.now()
        anio = hoy.strftime("%Y")
        mes_dia = hoy.strftime("%m%d")
        abreviado_usuario = (nombre[:3] if nombre else 'USR').upper()
        nombre_archivo_excel = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}.xlsx"
        return FileResponse(
            ruta_xlsx,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename=nombre_archivo_excel
        )
    except Exception as e:
        print(traceback.format_exc())
        return f'Error al procesar el formulario: {str(e)}', 500


@app.route('/crear-cotizacion-pdf', methods=['POST'])
async def crear_cotizacion_pdf(request: Request):
    try:
        data = await request.json()
        ruta_xlsx = cotizaciones(data)  # Genera el Excel temporal

        # Convertir Excel a PDF
        app_excel = xw.App(visible=False)
        libro = app_excel.books.open(ruta_xlsx)
        hoja = libro.sheets[0]
        ruta_pdf = ruta_xlsx.replace(".xlsx", ".pdf")
        hoja.to_pdf(ruta_pdf)
        libro.close()
        app_excel.quit()

        # Nombre de archivo para descargar
        codigo = data.get('codigo', 'cotizacion')
        nombre = data.get('usuario', 'usuario')
        hoy = datetime.now()
        anio = hoy.strftime("%Y")
        mes_dia = hoy.strftime("%m%d")
        abreviado_usuario = (nombre[:3] if nombre else 'USR').upper()
        nombre_archivo_pdf = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}.pdf"

        return FileResponse(
            ruta_pdf,
            media_type='application/pdf',
            filename=nombre_archivo_pdf
        )
    except Exception as e:
        print(traceback.format_exc())
        return f'Ocurrió un error: {str(e)}', 500


@app.route('/crear-cotizacion-jpg', methods=['POST'])
async def crear_cotizacion_jpg(request: Request):
    try:
        # 1. Generar el Excel
        data = await request.json()
        ruta_xlsx = cotizaciones(data)

        # 2. Convertir Excel a PDF
        app_excel = xw.App(visible=False)
        libro = app_excel.books.open(ruta_xlsx)
        hoja = libro.sheets[0]
        ruta_pdf = ruta_xlsx.replace(".xlsx", ".pdf")
        hoja.to_pdf(ruta_pdf)
        libro.close()
        app_excel.quit()

        # 3. Convertir PDF a JPG
        doc = fitz.open(ruta_pdf)
        pagina = doc.load_page(0)  # Primera página
        pixmap = pagina.get_pixmap(dpi=300)
        ruta_jpg = ruta_pdf.replace(".pdf", ".jpg")
        pixmap.save(ruta_jpg)
        doc.close()

        # 4. Enviar el JPG
        codigo = data.get('codigo', 'cotizacion')
        nombre = data.get('usuario', 'usuario')
        hoy = datetime.now()
        anio = hoy.strftime("%Y")
        mes_dia = hoy.strftime("%m%d")
        abreviado_usuario = (nombre[:3] if nombre else 'USR').upper()
        file_name = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}.jpg"

        return FileResponse(
            ruta_jpg,
            media_type='image/jpeg',
            filename=file_name
        )

    except Exception as e:
        print(traceback.format_exc())
        return f"Error al generar la cotización en JPG: {str(e)}", 500


def cotizaciones(data):
    """
    Edita el xlsx de cotizaciones a partir de un JSON.
    Recibe un diccionario con los datos y retorna la ruta del archivo Excel generado.
    """

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
    ruta_original = get_resource_path(f'docs/{codigo}.xlsx')
    if not os.path.exists(ruta_original):
        raise FileNotFoundError(
            f'El archivo con el código "{codigo}" no se encuentra')

    # Iniciar Excel de forma oculta
    app_excel = xw.App(visible=False)
    wb = app_excel.books.open(ruta_original)
    hoja = wb.sheets[0]

    # Limitar el tamaño de los detalles
    limites_detalles = [15, 100]
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

    def limpiar(texto):
        return ''.join(c for c in texto if c.isalnum() or c in (' ', '-', '_')).replace(' ', '')

    cliente_limpio = limpiar(cliente or 'Cliente')
    ubicacion_limpia = limpiar(ubicacion or 'Ubicacion')

    nombre_archivo = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}-{cliente_limpio}-{ubicacion_limpia}.xlsx"
    hoja.range(
        'E19').value = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}"

    # Crear archivo temporal Excel
    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as temp_file:
        ruta_salida = temp_file.name

    wb.save(ruta_salida)
    wb.close()
    app_excel.quit()

    return ruta_salida


@app.route('/formulario-persona-natural', methods=['POST'])
def formulario_persona_natural():
    """Formulario SUNARP"""
    try:
        data = request.json
        ot_data = data.get('ot', {})

        # Verificar si los datos de 'ot' están presentes
        if not ot_data:
            return 'Datos de OT no proporcionados', 400

        # Ruta del archivo de plantilla Excel
        ruta_formulario = obtener_ruta_absoluta(
            'Formulario Persona Natural.xlsm')
        if not os.path.exists(ruta_formulario):
            return 'No se encontró el archivo', 400

        # Inicializar la aplicación de Excel
        app_excel = xw.App(visible=False)
        wb = app_excel.books.open(ruta_formulario)
        datos = wb.sheets[0]  # Hoja principal
        hoja_formulario = wb.sheets['FORMULARIO']  # Hoja de formulario
        hoja_anexo1 = wb.sheets['Anexo 1']
        propietarios = data.get('propietarios', [])
        primer_propietario = propietarios[0]
        hoja_anexo1.range('B9').value = primer_propietario.get('apellidos', '')
        hoja_anexo1.range('H9').value = primer_propietario.get('nombres', '')
        hoja_anexo1.range('H12').value = primer_propietario.get('dni', '')
        hoja_anexo1.range('B14').value = primer_propietario.get(
            'direccion', '')
        hoja_anexo1.range('B19').value = primer_propietario.get('conyugue', '')
        # Asignar estado civil (casado, soltero, etc.)
        estado1 = primer_propietario.get('estado_civil', '').lower()
        shapes = {
            'soltero': 'cbxEstado1_1',
            'casado': 'cbxEstado2_1',
            'viudo': 'cbxEstado3_1',
            'divorciado': 'cbxEstado4_1',
            'separada juridicamente': 'cbxEstado5_1'
        }
        # Verificar cuál es el estado civil y marcarlo en el formulario
        shape_names = [s.Name for s in hoja_anexo1.api.Shapes]
        for shape_name in shapes.values():
            if shape_name in shape_names:
                hoja_anexo1.api.Shapes(
                    shape_name).TextFrame.Characters().Text = ""

        if estado1 in shapes and shapes[estado1] in shape_names:
            hoja_anexo1.api.Shapes(
                shapes[estado1]).TextFrame.Characters().Text = "X"

        # Llenar los campos básicos del formulario con los datos de 'ot'
        datos.range('B1').value = ot_data.get('ot', '')
        datos.range('B2').value = ot_data.get('siglas', '')
        datos.range('A10').value = primer_propietario.get('apellidos', '')
        datos.range('B10').value = primer_propietario.get('nombres', '')
        datos.range('B11').value = primer_propietario.get('dni', '')
        datos.range('B12').value = primer_propietario.get('direccion', '')
        datos.range('B14').value = primer_propietario.get('conyugue', '')
        datos.range('I15').value = ot_data.get('area_m2', '')
        datos.range('I16').value = ot_data.get('partida_registral', '')
        datos.range('I13').value = ot_data.get('valor_unitario', '')
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
        cantidad_extra = len(propietarios) - 1
       # Ocultar filas base
        hoja_anexo1.api.Rows("50:112").Hidden = True

        # Diccionario base para nombres de checkboxes de estado civil
        estado_base = {
            'soltero': 'cbxEstado1_{}',
            'casado': 'cbxEstado2_{}',
            'viudo': 'cbxEstado3_{}',
            'divorciado': 'cbxEstado4_{}',
            'separada juridicamente': 'cbxEstado5_{}'
        }

        shape_names = [s.Name for s in hoja_anexo1.api.Shapes]

        def insertar_propietario(index_excel, propietario, offset_base, bloque_num=0):
            offset = offset_base + (index_excel * 21)
            num_prop = (bloque_num * 3) + index_excel + 1

            hoja_anexo1.range(
                f"B{31 + offset}").value = propietario.get("apellidos", "")
            hoja_anexo1.range(
                f"H{31 + offset}").value = propietario.get("nombres", "")
            hoja_anexo1.range(
                f"H{34 + offset}").value = propietario.get("dni", "")
            hoja_anexo1.range(
                f"B{36 + offset}").value = propietario.get("direccion", "")
            hoja_anexo1.range(
                f"B{41 + offset}").value = propietario.get("conyugue", "")

            estado = propietario.get("estado_civil", "").lower()

            # Limpiar todos los checkboxes
            for cbx in estado_base.values():
                nombre_shape = cbx.format(num_prop)
                if nombre_shape in shape_names:
                    hoja_anexo1.api.Shapes(
                        nombre_shape).TextFrame.Characters().Text = ""

            # Marcar el checkbox correcto
            if estado in estado_base:
                nombre_shape = estado_base[estado].format(num_prop)
                if nombre_shape in shape_names:
                    hoja_anexo1.api.Shapes(
                        nombre_shape).TextFrame.Characters().Text = "X"

        # -------------- PRIMER PASO: Duplicar bloques extra antes de llenar datos -----------------

        # Número de propietarios visibles (desde el segundo en adelante)
        propietarios_visibles = propietarios[1:]

        # Mostrar filas base si hay al menos 3 propietarios visibles
        if len(propietarios_visibles) >= 3:
            hoja_anexo1.api.Rows("50:112").Hidden = False

        # Calcular si es necesario bloques adicionales (3 propietarios por bloque)
        # los primeros 3 ya están en bloque base
        num_propietarios_extra = len(propietarios_visibles) - 3
        if num_propietarios_extra > 0:
            # bloques de 3 propietarios
            bloques_adicionales = (num_propietarios_extra + 2) // 3

            for b in range(bloques_adicionales):
                origen = hoja_anexo1.range("50:112")
                destino_inicio = 113 + (63 * b)
                destino_fin = destino_inicio + 62
                destino = hoja_anexo1.range(f"{destino_inicio}:{destino_fin}")

                origen.copy(destino)
                hoja_anexo1.api.HPageBreaks.Add(
                    hoja_anexo1.range(f"A{destino_inicio}").api)

                if b == 0:
                    hoja_anexo1.api.HPageBreaks.Add(
                        hoja_anexo1.range(f"A{destino_inicio}").api)
        # -------------- SEGUNDO PASO: Insertar datos en todos los bloques --------------

        # Ahora insertamos todos los propietarios visibles, distribuyéndolos en bloques y filas
        for i, propietario in enumerate(propietarios_visibles):
            # 0 para primeros 3, 1 para los siguientes, etc.
            bloque_num = i // 3
            index_en_bloque = i % 3  # posición 0,1,2 dentro del bloque
            offset_base = bloque_num * 63  # salto entre bloques

            insertar_propietario(
                index_en_bloque, propietario, offset_base, bloque_num)

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
            numero_unidad = unidad.get('numero_unidad', '')
            # **UNIDAD INMOBILIARIA (Número de unidad)**
            hoja_formulario.range(
                f'A{315 + offset}').value = f'UNIDAD INMOBILIARIA {numero_unidad}'
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
            hoja_formulario.range(
                f'F{319 + offset}').value = "Por la Izquierda"
            # **Tramo(s) (Izquierda)**
            hoja_formulario.range(f'G{320 + offset}').value = "TRAMO(S)"
            # **Por el fondo**
            hoja_formulario.range(f'F{321 + offset}').value = "Por el Fondo"
            # **Tramo(s) (Fondo)**
            hoja_formulario.range(f'G{322 + offset}').value = "TRAMO(S)"

            # Ahora llenamos los valores reales de las unidades inmobiliarias
            hoja_formulario.range(
                f'E{315 + offset}').value = unidad.get('area_ocupada', '')
            hoja_formulario.range(
                f'E{317 + offset}').value = unidad.get('area_techada', '')
            # Suponiendo que 'nivel' es un número y lo deseas concatenar con "° PISO"
            nivel = unidad.get('nivel', '')
            # Verifica si el nivel es un número entre '1' y '8'
            if nivel in ['1', '2', '3', '4', '5', '6', '7', '8']:
                nivel_texto = f"{nivel}° PISO"
            else:
                nivel_texto = nivel.upper()

            # Asignar el valor a la celda correspondiente en Excel
            hoja_formulario.range(f'A{320 + offset}').value = nivel_texto
            hoja_formulario.range(
                f'A{322 + offset}').value = unidad.get('uso', '')
            # Calcular el área libre (si el campo 'area_ocupada' y 'area_techada' están presentes y son numéricos)
            try:
                area_ocupada = float(unidad.get('area_ocupada', 0) or 0)
                area_techada = float(unidad.get('area_techada', 0) or 0)
                area_libre = area_ocupada - area_techada
            except ValueError:
                area_libre = ''  # Si no es posible calcular, dejar vacío
            hoja_formulario.range(f'E{320 + offset}').value = area_libre

            # Llenar los campos del perímetro de la unidad

            hoja_formulario.range(
                f'H{315 + offset}').value = unidad.get('por_frente', '')
            hoja_formulario.range(
                f'H{316 + offset}').value = unidad.get('tramo_frente', '')
            hoja_formulario.range(
                f'F{316 + offset}').value = unidad.get('tramo_frente_num', '')
            hoja_formulario.range(
                f'H{317 + offset}').value = unidad.get('por_derecha', '')
            hoja_formulario.range(
                f'H{318 + offset}').value = unidad.get('tramo_derecha', '')
            hoja_formulario.range(
                f'F{318 + offset}').value = unidad.get('tramo_derecha_num', '')
            hoja_formulario.range(
                f'H{319 + offset}').value = unidad.get('por_izquierda', '')
            hoja_formulario.range(
                f'H{320 + offset}').value = unidad.get('tramo_izquierda', '')
            hoja_formulario.range(
                f'F{320 + offset}').value = unidad.get('tramo_izquierda_num', '')
            hoja_formulario.range(
                f'H{321 + offset}').value = unidad.get('por_fondo', '')
            hoja_formulario.range(
                f'H{322 + offset}').value = unidad.get('tramo_fondo', '')
            hoja_formulario.range(
                f'F{322 + offset}').value = unidad.get('tramo_fondo_num', '')

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
                hoja_formulario.api.Shapes(
                    shape_name).TextFrame.Characters().Text = ""

        if estado in shapes and shapes[estado] in shape_names:
            hoja_formulario.api.Shapes(
                shapes[estado]).TextFrame.Characters().Text = "X"

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
            # Obtiene el valor de 'fecha_terminacion' o una cadena vacía si no existe
            fecha_terminacion = data.get('fecha_terminacion', '')
            # Esto muestra el valor de 'fecha_terminacion'
            print("FECHA:", fecha_terminacion)

            # Asigna el valor directamente a la celda
            hoja_formulario.range(f'J211').value = fecha_terminacion
            print("Propietarios:", propietarios)
            # Sumar
            areas_por_nivel[nivel]['ocupada'] += area_ocupada
            areas_por_nivel[nivel]['techada'] += area_techada
            areas_por_nivel[nivel]['libre'] += area_libre

            # Imprimir los datos de cada unidad inmobiliaria
            numero_unidad = comun.get('numero_unidad', '')
            # **UNIDAD INMOBILIARIA (Número de unidad)**
            hoja_formulario.range(
                f'A{417 + offset}').value = f'ÁREA COMÚN {numero_unidad}'
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
            hoja_formulario.range(
                f'F{421 + offset}').value = "Por la Izquierda"
            # **Tramo(s) (Izquierda)**
            hoja_formulario.range(f'G{422 + offset}').value = "TRAMO (S)"
            # **Por el fondo**
            hoja_formulario.range(f'F{423 + offset}').value = "Por el Fondo"
            # **Tramo(s) (Fondo)**
            hoja_formulario.range(f'G{424 + offset}').value = "TRAMO (S)"

            # Ahora llenamos los valores reales de las unidades inmobiliarias
            hoja_formulario.range(
                f'E{417 + offset}').value = comun.get('area_ocupada', '')
            hoja_formulario.range(
                f'E{419 + offset}').value = comun.get('area_techada', '')
            nivel = comun.get('nivel', '')
            # Verifica si el nivel es un número entre '1' y '8'
            if nivel in ['1', '2', '3', '4', '5', '6', '7', '8']:
                nivel_texto = f"{nivel}° PISO"
            else:
                nivel_texto = nivel.upper()

            # Asignar el valor a la celda correspondiente en Excel
            hoja_formulario.range(f'A{422 + offset}').value = nivel_texto
            hoja_formulario.range(
                f'A{424 + offset}').value = comun.get('uso', '')
            # Calcular el área libre (si el campo 'area_ocupada' y 'area_techada' están presentes y son numéricos)
            try:
                area_ocupada = float(comun.get('area_ocupada', 0) or 0)
                area_techada = float(comun.get('area_techada', 0) or 0)
                area_libre = area_ocupada - area_techada
            except ValueError:
                area_libre = ''  # Si no es posible calcular, dejar vacío
            hoja_formulario.range(f'E{422 + offset}').value = area_libre

            # Llenar los campos del perímetro de la unidad

            hoja_formulario.range(
                f'H{417 + offset}').value = comun.get('por_frente', '')
            hoja_formulario.range(
                f'H{418 + offset}').value = comun.get('tramo_frente', '')
            hoja_formulario.range(
                f'F{418 + offset}').value = comun.get('tramo_frente_num', '')
            hoja_formulario.range(
                f'H{419 + offset}').value = comun.get('por_derecha', '')
            hoja_formulario.range(
                f'H{420 + offset}').value = comun.get('tramo_derecha', '')
            hoja_formulario.range(
                f'F{420 + offset}').value = comun.get('tramo_derecha_num', '')
            hoja_formulario.range(
                f'H{421 + offset}').value = comun.get('por_izquierda', '')
            hoja_formulario.range(
                f'H{422 + offset}').value = comun.get('tramo_izquierda', '')
            hoja_formulario.range(
                f'F{422 + offset}').value = comun.get('tramo_izquierda_num', '')
            hoja_formulario.range(
                f'H{423 + offset}').value = comun.get('por_fondo', '')
            hoja_formulario.range(
                f'H{424 + offset}').value = comun.get('tramo_fondo', '')
            hoja_formulario.range(
                f'F{424 + offset}').value = comun.get('tramo_fondo_num', '')
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

                # Verificamos si el nivel tiene área ocupada
                if obtener_area_ocupada(nivel_str) > 0:
                    # Agregamos la clave como cadena
                    niveles_presentes.append(nivel_str)

            # Finalmente, verificamos la "azotea"
            if 'azotea' in areas_por_nivel and obtener_area_ocupada('azotea') > 0:
                niveles_presentes.append('azotea')

            # Imprimir los niveles presentes para ver si todos están siendo agregados correctamente
            # Esto te ayudará a depurar si los niveles son correctos
            print(f"Niveles presentes: {niveles_presentes}")

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
                hoja_formulario.range(
                    f'E{fila}').value = obtener_area_ocupada(nivel)

                # Columna G: área techada
                if isinstance(areas_por_nivel.get(nivel), dict) and 'techada' in areas_por_nivel[nivel]:
                    hoja_formulario.range(f'G{fila}').value = float(
                        areas_por_nivel[nivel]['techada'])
                else:
                    hoja_formulario.range(f'G{fila}').value = 0.0

                # Columna I: área libre
                if isinstance(areas_por_nivel.get(nivel), dict) and 'libre' in areas_por_nivel[nivel]:
                    hoja_formulario.range(f'I{fila}').value = float(
                        areas_por_nivel[nivel]['libre'])
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

            partes = textwrap.wrap(linea, width=150)

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
        fila_ui = 293  # Fila de inicio para colocar los datos
        item_number = 1  # Empezamos desde el ítem 1

        # Usamos un diccionario para almacenar los totales por número de unidad
        unidades_totales = {}
        total_area_techada = 0  # Variable para el total de todas las áreas techadas

        # Primero, recorrer todas las unidades para sumar el total de áreas techadas
        for unidad in data.get('unidades_inmobiliaria', []):
            area_techada = float(unidad.get('area_techada', 0))
            total_area_techada += area_techada  # Sumamos el área techada de cada unidad

            numero_unidad = unidad.get('numero_unidad')

            # Si la unidad ya existe en el diccionario, sumamos los valores
            if numero_unidad not in unidades_totales:
                unidades_totales[numero_unidad] = {
                    'area_techada_total': 0,
                    'area_libre_total': 0,
                    'niveles': set(),  # Usamos un set para evitar duplicados
                    'propietarios': []  # Lista de propietarios para esta unidad
                }

            # Sumamos las áreas de esta unidad
            unidades_totales[numero_unidad]['area_techada_total'] += area_techada
            unidades_totales[numero_unidad]['area_libre_total'] += float(
                unidad.get('area_libre', 0))

            # Añadimos el nivel al conjunto de niveles (para evitar duplicados)
            unidades_totales[numero_unidad]['niveles'].add(unidad.get(
                'nivel', '').upper())  # Usamos upper para homogeneizar

        # Asociar los propietarios con la unidad correspondiente
        for propietario in data.get('propietarios', []):
            unidades = propietario.get('unidad_inmobiliaria', [])

            for unidad in unidades:
                unidad = unidad.strip()
                if unidad in unidades_totales:
                    nombre_completo = f"{propietario.get('nombres', '').strip()} {propietario.get('apellidos', '').strip()}"
                    unidades_totales[unidad]['propietarios'].append(
                        nombre_completo)
                else:
                    print(
                        f"Unidad '{unidad}' no encontrada en unidades_totales")

        print(unidades_totales)
        fila_propietarios = 592  # Fila inicial para propietarios
        fila_porcentaje = 592    # Fila inicial para porcentaje de participación
        porcentajes_texto = ""

        # Agrupamos unidades por propietario
        propietarios_unidades = {}

        for numero_unidad, datos in unidades_totales.items():
            for propietario in datos['propietarios']:
                nombre_prop = propietario
                if nombre_prop not in propietarios_unidades:
                    propietarios_unidades[nombre_prop] = []
                propietarios_unidades[nombre_prop].append(numero_unidad)

        # Llevar control de propietarios ya procesados
        propietarios_procesados = set()

        def nivel_sort_key(n):
            try:
                # Primero los números, ordenados por su valor entero
                return (0, int(n))
            except ValueError:
                return (1, n)
        for numero_unidad, datos in unidades_totales.items():
            niveles_ordenados = sorted(datos['niveles'], key=nivel_sort_key)
            niveles_unicos = ", ".join(niveles_ordenados)
            area_techada_total = datos['area_techada_total']
            area_libre_total = datos['area_libre_total']

            if total_area_techada > 0:
                porcentaje_area_techada = (
                    area_techada_total / total_area_techada) * 100
            else:
                porcentaje_area_techada = 0

            hoja_formulario.range(f'F{fila_ui}').value = f'UI {numero_unidad}'
            hoja_formulario.range(f'E{fila_ui}').value = niveles_unicos

            # Uso asignado (columna G)
            uso_asignado = ''
            for unidad in data.get('unidades_inmobiliaria', []):
                if unidad.get('numero_unidad') == numero_unidad:
                    uso_asignado = unidad.get('uso', '').upper()
                    break

            hoja_formulario.range(f'G{fila_ui}').value = uso_asignado or ''
            hoja_formulario.range(f'H{fila_ui}').value = area_techada_total
            hoja_formulario.range(f'I{fila_ui}').value = area_libre_total
            hoja_formulario.range(f'J{fila_ui}').value = round(
                porcentaje_area_techada, 2)
            # Solo tomamos el primero, ya que se usa como clave
            propietario = datos['propietarios'][0]
            propietarios = datos['propietarios']
            unidades_prop = propietarios_unidades[propietario]
            if len(propietarios) > 1 and len(unidades_prop) == 1:
                # Mostrar propietarios en C con salto de línea
                propietarios_texto = "\n".join(propietarios)
                hoja_formulario.range(f'C{fila_ui}').value = propietarios_texto
                hoja_formulario.range(f'A{fila_ui}').value = item_number
                # Altura base por propietario (puedes ajustar este valor)
                altura_base = 25
                hoja_formulario.range(
                    f'{fila_ui}:{fila_ui}').row_height = altura_base * len(propietarios)
                # Escribir cada propietario en una fila de la columna B
                for i, prop in enumerate(propietarios):
                    hoja_formulario.range(
                        f'B{fila_propietarios + i * 2}').value = prop

                # Combinar celdas en H para los porcentajes y escribirlos
                inicio_merge = fila_propietarios
                fin_merge = fila_propietarios + (len(propietarios) - 1) * 2
                hoja_formulario.range(f'H{inicio_merge}:H{fin_merge}').merge()

                # Calcular porcentajes de las unidades (se repite por la cantidad de propietarios)
                porcentajes_propietario = "\n".join(
                    f"{round((unidades_totales[u]['area_techada_total'] / total_area_techada) * 100, 2)}"
                    for u in unidades_prop
                )
                hoja_formulario.range(
                    f'H{inicio_merge}').value = porcentajes_propietario

                # Avanzar filas según cantidad de propietarios
                fila_propietarios += len(propietarios) * 2
                fila_porcentaje += len(propietarios) * 2
                item_number += 1
                fila_ui += 1  # una unidad más
            elif len(propietarios) > 1 and len(unidades_prop) > 1:
                fila_ui += 1
                if propietario not in propietarios_procesados:
                    # Rango para combinar filas según unidades del propietario

                    inicio_merge = fila_ui - 1
                    fin_merge = fila_ui + len(unidades_prop) - 1

                    # Combinar y escribir propietarios en columna C (ya lo tienes bien)
                    hoja_formulario.range(
                        f'C{inicio_merge}:C{fin_merge}').merge()
                    propietarios_texto = "\n".join(propietarios)
                    hoja_formulario.range(
                        f'C{inicio_merge}').value = propietarios_texto

                    # Combinar y escribir número de ítem en A (igual)
                    hoja_formulario.range(
                        f'A{inicio_merge}:A{fin_merge}').merge()
                    hoja_formulario.range(
                        f'A{inicio_merge}').value = item_number
                    fila_ui -= 1

                    # Escribir cada propietario en una fila de la columna B
                    for i, prop in enumerate(propietarios):
                        hoja_formulario.range(
                            f'B{fila_propietarios + i * 2}').value = prop

                    # Combinar celdas para el porcentaje de unidades (igual)
                    inicio_merge_h = fila_propietarios
                    fin_merge_h = fila_propietarios + \
                        (len(propietarios) - 1) * 2
                    hoja_formulario.range(
                        f'H{inicio_merge_h}:H{fin_merge_h}').merge()

                    # Calcular y mostrar un porcentaje por cada unidad
                    porcentajes_texto = "\n".join(
                        f"{round((unidades_totales[u]['area_techada_total'] / total_area_techada) * 100, 2)}"
                        for u in unidades_prop
                    )
                    hoja_formulario.range(
                        f'H{inicio_merge_h}').value = porcentajes_texto

                    propietarios_procesados.add(propietario)

                    # Avanzar filas según cantidad de propietarios (por B y H) y unidades (por A y C)
                    fila_propietarios += len(propietarios) * 2
                    fila_porcentaje += len(propietarios) * 2
                    item_number += 1
                    fila_ui += 1
            else:
                propietario = datos['propietarios'][0]
                if len(unidades_prop) > 1:
                    if propietario not in propietarios_procesados:
                        # Combinar celdas en columnas A y C
                        inicio_merge = fila_ui
                        fin_merge = fila_ui + len(unidades_prop) - 1

                        hoja_formulario.range(
                            f'C{inicio_merge}:C{fin_merge}').merge()
                        hoja_formulario.range(
                            f'C{inicio_merge}').value = propietario

                        hoja_formulario.range(
                            f'A{inicio_merge}:A{fin_merge}').merge()
                        hoja_formulario.range(
                            f'A{inicio_merge}').value = item_number

                        hoja_formulario.range(
                            f'B{fila_propietarios}').value = propietario

                        # Calcular suma total de porcentaje para ese propietario
                        # Concatenar los porcentajes uno debajo del otro
                        porcentajes_propietario = "\n".join(
                            f"{round((unidades_totales[u]['area_techada_total'] / total_area_techada) * 100, 2)}"
                            for u in unidades_prop
                        )
                        hoja_formulario.range(
                            f'H{fila_porcentaje}').value = porcentajes_propietario

                        # Marcar como procesado
                        propietarios_procesados.add(propietario)

                        # Avanzamos contadores SOLO una vez por propietario
                        fila_propietarios += 2
                        fila_porcentaje += 2
                        item_number += 1

                else:
                    # Propietario con solo una unidad
                    hoja_formulario.range(f'C{fila_ui}').value = propietario
                    hoja_formulario.range(f'A{fila_ui}').value = item_number
                    hoja_formulario.range(
                        f'B{fila_propietarios}').value = propietario
                    hoja_formulario.range(f'H{fila_porcentaje}').value = round(
                        porcentaje_area_techada, 2)

                    fila_propietarios += 2
                    fila_porcentaje += 2
                    item_number += 1

                fila_ui += 1  # SIEMPRE se avanza por unidad

        # Guardar el archivo generado en una ruta temporal
        nombre_temporal = f"Formulario_Persona_Natural_{uuid.uuid4().hex}.xlsm"
        ruta_temporal = os.path.join(tempfile.gettempdir(), nombre_temporal)

        wb.save(ruta_temporal)
        wb.close()
        app_excel.quit()

        # Enviar el archivo al frontend para su descarga
        return send_file(ruta_temporal, as_attachment=True, download_name="Formulario_Persona_Natural.xlsm")

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return f'Error al procesar el formulario: {str(e)}', 500


if __name__ == "__main__":
    import asyncio
    import uvicorn

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    loop.run_until_complete(uvicorn.run(app, host=HOST, port=PORT))
