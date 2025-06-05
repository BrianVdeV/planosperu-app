import React, { useState, useEffect } from 'react'
import {
  CFormInput,
  CFormSelect,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CButton,
  CFormCheck,
  CRow,
  CFormLabel,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'

export default function RegistrarUnidadInmobiliaria() {
  const [formDataUnidadInmobiliarias, setFormDataUnidadInmobiliarias] = useState([
    {
      numero_unidad: '',
      nivel: '',
      uso: '',
      area_ocupada: '',
      area_techada: '',
      area_libre: '',
      por_frente: '',
      tramo_frente: '',
      tramo_frente_num: 0,
      tramo_frente_array: [],
      por_derecha: '',
      tramo_derecha: '',
      tramo_derecha_num: 0,
      tramo_derecha_array: [],
      por_izquierda: '',
      tramo_izquierda: '',
      tramo_izquierda_num: 0,
      tramo_izquierda_array: [],
      por_fondo: '',
      tramo_fondo: '',
      tramo_fondo_num: 0,
      tramo_fondo_array: [],
    },
  ])
  const handleEliminarUnidad = (index) => {
    const nuevasUnidades = [...formDataUnidadInmobiliarias]
    nuevasUnidades.splice(index, 1)
    setFormDataUnidadInmobiliarias(nuevasUnidades)
  }
  const [unidadesAsignadas, setUnidadesAsignadas] = useState([])
  const handleUnidadAsignadaChange = (e, index) => {
    const opcionesSeleccionadas = Array.from(e.target.selectedOptions).map((option) => option.value)
    const nuevasUnidades = [...unidadesAsignadas]
    nuevasUnidades[index] = opcionesSeleccionadas
    setUnidadesAsignadas(nuevasUnidades)
  }

  const [fechaTerminacion, setFechaTerminacion] = useState('')
  // Función para manejar el cambio de la cantidad de pisos
  const handleNivelEspecialChange = (e) => {
    const { name, checked } = e.target
    setNivelesEspeciales((prevState) => ({
      ...prevState,
      [name]: checked,
    }))
  }
  // Función para manejar el cambio de la cantidad de pisos
  const handleNivelEspecial2Change = (e) => {
    const { name, checked } = e.target
    setNivelesEspeciales2((prevState) => ({
      ...prevState,
      [name]: checked,
    }))
  }
  const [cantidadPropietarios, setCantidadPropietarios] = useState(1) // Inicializamos con 1 propietario
  const [propietarios, setPropietarios] = useState([
    {
      nombres: '',
      apellidos: '',
      dni: '',
      estado_civil: '',
      conyugue: '',
      direccion: '',
    },
  ])

  const [unidadesPorPropietario, setUnidadesPorPropietario] = useState([]) // Para almacenar las unidades inmobiliarias por propietario

  // Manejo de cambios en el nombre del propietario
  const handlePropietarioChange = (e, index) => {
    const newPropietarios = [...propietarios]
    newPropietarios[index] = e.target.value // Actualiza el propietario
    setPropietarios(newPropietarios)
  }

  const handleUnidadChange = (e, index) => {
    const newUnidades = [...unidadesPorPropietario]
    newUnidades[index] = e.target.value // Actualiza la unidad inmobiliaria
    setUnidadesPorPropietario(newUnidades)
  }
  const [formDataPropietario, setFormDataPropietario] = useState({
    unidad_asignada: '',
  })
  const handleChangePropietario = (e) => {
    const { name, value } = e.target
    setFormDataPropietario((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const [formDataAreaComun, setFormDataAreaComun] = useState([
    {
      numero_unidad: '',
      nivel: '',
      uso: '',
      area_ocupada: '',
      area_techada: '',
      area_libre: '',
      por_frente: '',
      tramo_frente: '',
      tramo_frente_num: 0,
      tramo_frente_array: [],
      por_derecha: '',
      tramo_derecha: '',
      tramo_derecha_num: 0,
      tramo_derecha_array: [],
      por_izquierda: '',
      tramo_izquierda: '',
      tramo_izquierda_num: 0,
      tramo_izquierda_array: [],
      por_fondo: '',
      tramo_fondo: '',
      tramo_fondo_num: 0,
      tramo_fondo_array: [],
    },
  ])
  const handleRemoveAreaComun = (index) => {
    const newData = [...formDataAreaComun]
    newData.splice(index, 1)
    setFormDataAreaComun(newData)
  }

  const [numPisos, setNumPisos] = useState(1)
  const [numPisos2, setNumPisos2] = useState(1)
  const [nivelesEspeciales, setNivelesEspeciales] = useState({
    azotea: false,
    sotano: false,
    semisotano: false,
  }) // Estado para los checkboxes de niveles especiales
  const [nivelesEspeciales2, setNivelesEspeciales2] = useState({
    azotea: false,
    sotano: false,
    semisotano: false,
  }) // Estado para los checkboxes de niveles especiales
  // Añadir una nueva unidad inmobiliaria
  const handleAddUnidadInmobiliaria = () => {
    setFormDataUnidadInmobiliarias((prev) => [
      ...prev,
      {
        numero_unidad: '',
        nivel: '',
        uso: '',
        area_ocupada: '',
        area_techada: '',
        area_libre: '',
        por_frente: '',
        tramo_frente: '',
        tramo_frente_num: '',
        por_derecha: '',
        tramo_derecha: '',
        tramo_derecha_num: '',
        por_izquierda: '',
        tramo_izquierda: '',
        tramo_izquierda_num: '',
        por_fondo: '',
        tramo_fondo: '',
        tramo_fondo_num: '',
      },
    ])
  }
  // Añadir una nueva unidad inmobiliaria
  const handleAddAreaComun = () => {
    setFormDataAreaComun((prev) => [
      ...prev,
      {
        numero_unidad: '',
        nivel: '',
        uso: '',
        area_ocupada: '',
        area_techada: '',
        area_libre: '',
        por_frente: '',
        tramo_frente: '',
        tramo_frente_num: '',
        por_derecha: '',
        tramo_derecha: '',
        tramo_derecha_num: '',
        por_izquierda: '',
        tramo_izquierda: '',
        tramo_izquierda_num: '',
        por_fondo: '',
        tramo_fondo: '',
        tramo_fondo_num: '',
      },
    ])
  }

  const [formDataOT, setFormDataOT] = useState({
    ot: '', // OT
    siglas: '', // Siglas
    valor_unitario: '',
    partida_registral: '',
    area_m2: '',
    conyugue: '',
  })

  const [currentStep, setCurrentStep] = useState(1) // Controla en qué paso del formulario estamos
  const navigate = useNavigate()

  // Handle form changes
  const handleChangeOT = (e) => {
    const { name, value } = e.target
    setFormDataOT((prev) => ({ ...prev, [name]: value }))
  }

  const handleChangeUnidadInmobiliaria = (e, index) => {
    const { name, value } = e.target

    setFormDataUnidadInmobiliarias((prev) => {
      const updated = [...prev]
      const unidadActual = { ...updated[index] }

      if (name.endsWith('_num')) {
        const keyBase = name.replace('_num', '') // ej. tramo_frente
        const num = parseInt(value) || 0
        unidadActual[name] = num
        unidadActual[`${keyBase}_array`] = Array(num).fill('')
        unidadActual[keyBase] = ''
      } else if (name.includes('_array_')) {
        const baseArrayName = name.substring(0, name.lastIndexOf('_array_') + 6) // ej. "tramo_frente_array"
        const idx = parseInt(name.substring(name.lastIndexOf('_array_') + 7)) // ej. 0
        unidadActual[baseArrayName] = unidadActual[baseArrayName] || []
        unidadActual[baseArrayName][idx] = value
        const keyBase = baseArrayName.replace('_array', '')
        unidadActual[keyBase] = unidadActual[baseArrayName].join(',')
      } else {
        unidadActual[name] = value
      }

      if (
        unidadActual.area_ocupada !== '' &&
        unidadActual.area_techada !== '' &&
        !isNaN(unidadActual.area_ocupada) &&
        !isNaN(unidadActual.area_techada)
      ) {
        unidadActual.area_libre = (unidadActual.area_ocupada - unidadActual.area_techada).toString()
      }

      updated[index] = unidadActual
      return updated
    })
  }

  const handleChangeAreaComun = (e, index) => {
    const { name, value } = e.target

    setFormDataAreaComun((prev) => {
      const updated = [...prev]
      const areaActual = { ...updated[index], [name]: value }
      if (name.endsWith('_num')) {
        const keyBase = name.replace('_num', '') // ej. tramo_frente
        const num = parseInt(value) || 0
        areaActual[name] = num
        areaActual[`${keyBase}_array`] = Array(num).fill('')
        areaActual[keyBase] = ''
      } else if (name.includes('_array_')) {
        const baseArrayName = name.substring(0, name.lastIndexOf('_array_') + 6)
        const idx = parseInt(name.substring(name.lastIndexOf('_array_') + 7))
        areaActual[baseArrayName] = areaActual[baseArrayName] || []
        areaActual[baseArrayName][idx] = value
        const keyBase = baseArrayName.replace('_array', '')
        areaActual[keyBase] = areaActual[baseArrayName].join(',')
      } else {
        areaActual[name] = value
      }

      if (
        areaActual.area_ocupada !== '' &&
        areaActual.area_techada !== '' &&
        !isNaN(areaActual.area_ocupada) &&
        !isNaN(areaActual.area_techada)
      ) {
        areaActual.area_libre = (areaActual.area_ocupada - areaActual.area_techada).toString()
      }

      updated[index] = areaActual
      return updated
    })
  }

  const [descripcionNiveles, setDescripcionNiveles] = useState({})

  const generarNiveles = () => {
    const niveles = []
    if (nivelesEspeciales.sotano) niveles.push('Sótano')
    if (nivelesEspeciales.semisotano) niveles.push('Semisótano')
    for (let i = 1; i <= numPisos; i++) {
      niveles.push(`${i}° piso`)
    }
    if (nivelesEspeciales.azotea) niveles.push('Azotea')
    return niveles
  }

  // 👇 ESTA PARTE DEBE ESTAR AQUÍ
  const niveles = generarNiveles()

  const nivelesRenderizados = niveles.map((nivel, index) => (
    <div key={index} style={{ marginBottom: '15px' }}>
      <CFormLabel>{nivel} consta de:</CFormLabel>
      <CFormInput
        type="text"
        placeholder="Ej: Dormitorios, sala, baño, etc."
        value={descripcionNiveles[nivel] || ''}
        onChange={(e) =>
          setDescripcionNiveles({
            ...descripcionNiveles,
            [nivel]: e.target.value,
          })
        }
      />
    </div>
  ))

  const handleSubmit = (e) => {
    e.preventDefault()
    // Generar un array de objetos con el nombre y unidad de cada propietario
    const propietariosYUnidades = propietarios.map((propietario, index) => ({
      ...propietario, // Incluye nombres, apellidos, dni, etc.
      unidad_inmobiliaria:
        cantidadPropietarios === 1
          ? formDataUnidadInmobiliarias.map((u) => u.numero_unidad)
          : unidadesAsignadas[index] || [],
    }))

    // Enviar un array con los propietarios, incluso si hay un solo propietario
    const propietariosFinales = propietariosYUnidades // Enviamos siempre como array, incluso si hay uno solo

    const descripcionFormateada = Object.entries(descripcionNiveles)
      .map(([nivel, descripcion]) => `${nivel} consta de: ${descripcion}`)
      .join('\n') // Usamos '\n' para agregar saltos de línea
    const data = {
      ot: formDataOT,
      unidades_inmobiliaria: formDataUnidadInmobiliarias,
      area_comun: formDataAreaComun,
      niveles: descripcionFormateada,
      fecha_terminacion: fechaTerminacion,
      propietarios: propietariosFinales,
    }

    fetch('http://127.0.0.1:5000/formulario-persona-natural', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al registrar Unidad Inmobiliaria')
        return res.blob() // Cambiar de .json() a .blob()
      })
      .then((blob) => {
        // Crear un enlace para descargar el archivo
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'Formulario_Persona_Natural.xlsm' // Nombre del archivo a descargar
        link.click() // Inicia la descarga
      })
      .then(() => {
        alert('Unidad Inmobiliaria registrada correctamente')
        navigate('/dashboard') // Redirige al dashboard
      })
      .catch((err) => {
        console.error(err)
        alert('Hubo un error al registrar la Unidad Inmobiliaria')
      })
  }

  return (
    <CCol xs={12}>
      <CCard>
        <CCardHeader>
          <strong>Registrar Unidad Inmobiliaria</strong>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            {/* Paso 1: Formulario OT */}
            {currentStep === 1 && (
              <div>
                <strong>Formulario de OT:</strong>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    marginTop: '15px',
                  }}
                >
                  <div>
                    <CFormInput
                      name="ot"
                      label="OT"
                      value={formDataOT.ot}
                      onChange={handleChangeOT}
                      required
                    />
                  </div>
                  <div>
                    <CFormInput
                      name="siglas"
                      label="Siglas"
                      value={formDataOT.siglas}
                      onChange={handleChangeOT}
                      required
                    />
                  </div>
                  <div>
                    <CFormInput
                      name="area_m2"
                      label="Área en m²"
                      value={formDataOT.area_m2}
                      onChange={handleChangeOT}
                      required
                    />
                  </div>

                  <div>
                    <CFormInput
                      name="partida_registral"
                      label="Partida Registral"
                      value={formDataOT.partida_registral}
                      onChange={handleChangeOT}
                      required
                    />
                  </div>

                  <div>
                    <CFormInput
                      name="valor_unitario"
                      label="Valor Unitario"
                      value={formDataOT.valor_unitario}
                      onChange={handleChangeOT}
                      required
                    />
                  </div>

                  <hr style={{ margin: '30px 0' }} />
                  <strong>Cantidad de Propietarios:</strong>
                  <input
                    type="number"
                    min="1"
                    value={cantidadPropietarios}
                    onChange={(e) => {
                      const nuevaCantidad = parseInt(e.target.value) || 1
                      setCantidadPropietarios(nuevaCantidad)

                      setPropietarios((prev) => {
                        const copia = [...prev]
                        while (copia.length < nuevaCantidad) {
                          copia.push({
                            nombres: '',
                            apellidos: '',
                            dni: '',
                            estado_civil: '',
                            conyugue: '',
                            direccion: '',
                          })
                        }
                        return copia.slice(0, nuevaCantidad)
                      })
                    }}
                    style={{
                      padding: '10px',
                      width: '100%',
                      borderRadius: '5px',
                      border: '1px solid #ccc',
                      marginTop: '10px',
                      marginBottom: '20px',
                    }}
                  />

                  {propietarios.map((propietario, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: '30px',
                        border: '1px solid #ccc',
                        padding: '15px',
                        borderRadius: '10px',
                      }}
                    >
                      <strong>Propietario {index + 1}</strong>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '15px',
                          marginTop: '15px',
                        }}
                      >
                        <div>
                          <CFormInput
                            label="Nombres"
                            value={propietario.nombres}
                            onChange={(e) => {
                              const nuevos = [...propietarios]
                              nuevos[index].nombres = e.target.value
                              setPropietarios(nuevos)
                            }}
                            required
                          />
                        </div>
                        <div>
                          <CFormInput
                            label="Apellidos"
                            value={propietario.apellidos}
                            onChange={(e) => {
                              const nuevos = [...propietarios]
                              nuevos[index].apellidos = e.target.value
                              setPropietarios(nuevos)
                            }}
                            required
                          />
                        </div>
                        <div>
                          <CFormInput
                            label="DNI"
                            value={propietario.dni}
                            onChange={(e) => {
                              const nuevos = [...propietarios]
                              nuevos[index].dni = e.target.value
                              setPropietarios(nuevos)
                            }}
                            required
                          />
                        </div>
                        <div>
                          <CFormSelect
                            label="Estado Civil"
                            value={propietario.estado_civil}
                            onChange={(e) => {
                              const nuevos = [...propietarios]
                              nuevos[index].estado_civil = e.target.value
                              setPropietarios(nuevos)
                            }}
                            required
                          >
                            <option value="">Seleccione Estado Civil</option>
                            <option value="soltero">Soltero</option>
                            <option value="casado">Casado</option>
                            <option value="viudo">Viudo</option>
                            <option value="divorciado">Divorciado</option>
                            <option value="separado">Separado Jurídicamente</option>
                          </CFormSelect>
                        </div>
                        <div>
                          <CFormInput
                            label="Conyugue"
                            value={propietario.conyugue}
                            onChange={(e) => {
                              const nuevos = [...propietarios]
                              nuevos[index].conyugue = e.target.value
                              setPropietarios(nuevos)
                            }}
                            required
                          />
                        </div>
                        <div>
                          <CFormInput
                            label="Dirección"
                            value={propietario.direccion}
                            onChange={(e) => {
                              const nuevos = [...propietarios]
                              nuevos[index].direccion = e.target.value
                              setPropietarios(nuevos)
                            }}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <CButton color="primary" onClick={() => setCurrentStep(2)}>
                    Siguiente
                  </CButton>
                </div>
              </div>
            )}

            {/* Paso 2: Formulario Unidad Inmobiliaria */}
            {currentStep === 2 && (
              <div>
                <div>
                  <CRow style={{ marginBottom: '20px' }}>
                    <CCol xs={12} md={6}>
                      {/* Input para preguntar cuántos pisos tiene el inmueble */}
                      <CFormInput
                        type="number"
                        label="¿Cuántos pisos tiene el inmueble?"
                        min={1}
                        value={numPisos}
                        onChange={(e) => setNumPisos(parseInt(e.target.value) || 1)}
                        required
                      />
                    </CCol>

                    <CCol xs={12} md={6}>
                      {/* Checkboxes para Azotea, Sótano, y Semisótano */}
                      <div>
                        <CFormCheck
                          type="checkbox"
                          id="azotea"
                          name="azotea"
                          label="Azotea"
                          checked={nivelesEspeciales.azotea}
                          onChange={handleNivelEspecialChange}
                        />
                        <CFormCheck
                          type="checkbox"
                          id="sotano"
                          name="sotano"
                          label="Sótano"
                          checked={nivelesEspeciales.sotano}
                          onChange={handleNivelEspecialChange}
                        />
                        <CFormCheck
                          type="checkbox"
                          id="semisotano"
                          name="semisotano"
                          label="Semisótano"
                          checked={nivelesEspeciales.semisotano}
                          onChange={handleNivelEspecialChange}
                        />
                      </div>
                    </CCol>
                  </CRow>

                  {formDataUnidadInmobiliarias.map((unidad, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <strong>Unidad Inmobiliaria</strong>
                          <CFormInput
                            name="numero_unidad"
                            type="text"
                            placeholder={`${index + 1}`} // Colocamos un placeholder si el campo está vacío
                            value={unidad.numero_unidad || ''} // Si no tiene valor, lo mostramos vacío
                            onChange={(e) => handleChangeUnidadInmobiliaria(e, index)} // Manejamos el cambio de valor
                            style={{ marginLeft: '10px', width: '70px' }} // Un pequeño espacio entre el texto y el input
                            required
                          />
                        </div>
                        {/* Botón para eliminar la unidad */}
                        <button
                          type="button"
                          onClick={() => handleEliminarUnidad(index)}
                          style={{
                            marginLeft: '10px',
                            background: 'none',
                            border: 'none',
                            color: 'red',
                            fontWeight: 'bold',
                            fontSize: '20px',
                            cursor: 'pointer',
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '15px',
                          marginTop: '15px',
                        }}
                      >
                        <div>
                          <CFormSelect
                            name="nivel"
                            label="Nivel"
                            value={unidad.nivel}
                            onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                            required
                          >
                            <option value="">Seleccione un nivel</option>

                            {/* Mapeamos los pisos normales */}
                            {[...Array(numPisos)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Piso {i + 1}
                              </option>
                            ))}

                            {/* Si el inmueble tiene azotea, la añadimos como opción */}
                            {nivelesEspeciales.azotea && <option value="azotea">Azotea</option>}

                            {/* Si el inmueble tiene sótano, la añadimos como opción */}
                            {nivelesEspeciales.sotano && <option value="sotano">Sótano</option>}

                            {/* Si el inmueble tiene semisótano, la añadimos como opción */}
                            {nivelesEspeciales.semisotano && (
                              <option value="semisotano">Semisótano</option>
                            )}
                          </CFormSelect>
                        </div>
                        <div>
                          <CFormInput
                            name="uso"
                            label="Uso"
                            value={unidad.uso}
                            onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                            required
                          />
                        </div>

                        {/* ESTE DIV OCUPA TODA LA FILA DEL GRID */}
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                              <CFormInput
                                name="area_ocupada"
                                label="Área Ocupada"
                                type="number"
                                value={unidad.area_ocupada}
                                onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                                required
                                step="0.01"
                              />
                            </div>

                            <div style={{ flex: 1 }}>
                              <CFormInput
                                name="area_techada"
                                type="number"
                                label="Área Techada"
                                value={unidad.area_techada}
                                onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                                required
                                step="0.01"
                              />
                            </div>

                            <div style={{ flex: 1 }}>
                              <CFormInput
                                name="area_libre"
                                label="Área Libre"
                                type="number"
                                value={unidad.area_libre}
                                onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                                required
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>

                        {/* CONTINÚA EN FORMATO DE 2 COLUMNAS */}
                        <div>
                          <CFormInput
                            name="por_frente"
                            label="Por el frente"
                            value={unidad.por_frente}
                            onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                          {/* Input numérico a la izquierda para el tramo */}
                          <div style={{ flex: 1 }}>
                            <CFormInput
                              type="number"
                              name="tramo_frente_num"
                              label="Tramo(s)"
                              value={unidad.tramo_frente_num || ''}
                              onChange={(e) => handleChangeUnidadInmobiliaria(e, index)} // Maneja el cambio del valor
                              required
                              placeholder="N° tramo"
                              style={{ marginRight: '10px' }} // Para un poco de separación entre el input numérico y el texto
                            />
                          </div>

                          {/* Input para el valor del tramo */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {Array.from({ length: unidad.tramo_frente_num || 0 }).map((_, i) => (
                              <CFormInput
                                key={`tramo_frente_array_${i}`}
                                type="number"
                                name={`tramo_frente_array_${i}`}
                                label={`Tramo ${i + 1}`}
                                value={unidad.tramo_frente_array?.[i] || ''}
                                onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                                required
                                placeholder={`Valor del tramo ${i + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <CFormInput
                            name="por_derecha"
                            label="Por la derecha"
                            value={unidad.por_derecha}
                            onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                          {/* Input numérico a la izquierda para el tramo */}
                          <div style={{ flex: 1 }}>
                            <CFormInput
                              type="number"
                              name="tramo_derecha_num"
                              label="Tramo(s)"
                              value={unidad.tramo_derecha_num || ''}
                              onChange={(e) => handleChangeUnidadInmobiliaria(e, index)} // Maneja el cambio del valor
                              required
                              placeholder="N° tramo"
                              style={{ marginRight: '10px' }} // Para un poco de separación entre el input numérico y el texto
                            />
                          </div>

                          {/* Input para el valor del tramo */}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {Array.from({ length: unidad.tramo_derecha_num || 0 }).map((_, i) => (
                              <CFormInput
                                key={`tramo_derecha_array_${i}`}
                                type="number"
                                name={`tramo_derecha_array_${i}`}
                                label={`Tramo ${i + 1}`}
                                value={unidad.tramo_derecha_array?.[i] || ''}
                                onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                                required
                                placeholder={`Valor del tramo ${i + 1}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <CFormInput
                            name="por_izquierda"
                            label="Por la izquierda"
                            value={unidad.por_izquierda}
                            onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                          {/* Input numérico a la izquierda para el tramo */}
                          <div style={{ flex: 1 }}>
                            <CFormInput
                              type="number"
                              name="tramo_izquierda_num"
                              label="Tramo(s)"
                              value={unidad.tramo_izquierda_num || ''}
                              onChange={(e) => handleChangeUnidadInmobiliaria(e, index)} // Maneja el cambio del valor
                              required
                              placeholder="N° tramo"
                              style={{ marginRight: '10px' }} // Para un poco de separación entre el input numérico y el texto
                            />
                          </div>

                          {/* Input para el valor del tramo */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {Array.from({ length: unidad.tramo_izquierda_num || 0 }).map((_, i) => (
                              <CFormInput
                                key={`tramo_izquierda_array_${i}`}
                                type="number"
                                name={`tramo_izquierda_array_${i}`}
                                label={`Tramo ${i + 1}`}
                                value={unidad.tramo_izquierda_array?.[i] || ''}
                                onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                                required
                                placeholder={`Valor del tramo ${i + 1}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <CFormInput
                            name="por_fondo"
                            label="Por el fondo"
                            value={unidad.por_fondo}
                            onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                          {/* Input numérico a la izquierda para el tramo */}
                          <div style={{ flex: 1 }}>
                            <CFormInput
                              type="number"
                              name="tramo_fondo_num"
                              label="Tramo(s)"
                              value={unidad.tramo_fondo_num || ''}
                              onChange={(e) => handleChangeUnidadInmobiliaria(e, index)} // Maneja el cambio del valor
                              required
                              placeholder="N° tramo"
                              style={{ marginRight: '10px' }} // Para un poco de separación entre el input numérico y el texto
                            />
                          </div>

                          {/* Input para el valor del tramo */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {Array.from({ length: unidad.tramo_fondo_num || 0 }).map((_, i) => (
                              <CFormInput
                                key={`tramo_fondo_array_${i}`}
                                type="number"
                                name={`tramo_fondo_array_${i}`}
                                label={`Tramo ${i + 1}`}
                                value={unidad.tramo_fondo_array?.[i] || ''}
                                onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                                required
                                placeholder={`Valor del tramo ${i + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <CButton color="secondary" onClick={() => setCurrentStep(1)}>
                      Atrás
                    </CButton>
                    <CButton color="primary" onClick={handleAddUnidadInmobiliaria}>
                      +
                    </CButton>
                    <CButton color="primary" onClick={() => setCurrentStep(3)}>
                      Siguiente
                    </CButton>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div>
                  <CRow style={{ marginBottom: '20px' }}>
                    <CCol xs={12} md={6}>
                      {/* Input para preguntar cuántos pisos tiene el inmueble */}
                      <CFormInput
                        type="number"
                        label="¿Cuántos pisos tiene el inmueble?"
                        min={1}
                        value={numPisos2}
                        onChange={(e) => setNumPisos2(parseInt(e.target.value) || 1)}
                        required
                      />
                    </CCol>

                    <CCol xs={12} md={6}>
                      {/* Checkboxes para Azotea, Sótano, y Semisótano */}
                      <div>
                        <CFormCheck
                          type="checkbox"
                          id="azotea"
                          name="azotea"
                          label="Azotea"
                          checked={nivelesEspeciales2.azotea}
                          onChange={handleNivelEspecial2Change}
                        />
                        <CFormCheck
                          type="checkbox"
                          id="sotano"
                          name="sotano"
                          label="Sótano"
                          checked={nivelesEspeciales2.sotano}
                          onChange={handleNivelEspecial2Change}
                        />
                        <CFormCheck
                          type="checkbox"
                          id="semisotano"
                          name="semisotano"
                          label="Semisótano"
                          checked={nivelesEspeciales2.semisotano}
                          onChange={handleNivelEspecial2Change}
                        />
                      </div>
                    </CCol>
                  </CRow>

                  {formDataAreaComun.map((comun, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <strong>ÁREA COMÚN</strong>
                          <CFormInput
                            name="numero_unidad"
                            type="text"
                            placeholder={`${index + 1}`}
                            value={comun.numero_unidad || ''}
                            onChange={(e) => handleChangeAreaComun(e, index)}
                            style={{ marginLeft: '10px', width: '70px' }}
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAreaComun(index)}
                          style={{
                            marginLeft: '10px',
                            background: 'none',
                            border: 'none',
                            color: 'red',
                            fontWeight: 'bold',
                            fontSize: '20px',
                            cursor: 'pointer',
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '15px',
                          marginTop: '15px',
                        }}
                      >
                        <div>
                          <CFormSelect
                            name="nivel"
                            label="Nivel"
                            value={comun.nivel}
                            onChange={(e) => handleChangeAreaComun(e, index)}
                            required
                          >
                            <option value="">Seleccione un nivel</option>

                            {/* Mapeamos los pisos normales */}
                            {[...Array(numPisos2)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Piso {i + 1}
                              </option>
                            ))}

                            {/* Si el inmueble tiene azotea, la añadimos como opción */}
                            {nivelesEspeciales2.azotea && <option value="azotea">Azotea</option>}

                            {/* Si el inmueble tiene sótano, la añadimos como opción */}
                            {nivelesEspeciales2.sotano && <option value="sotano">Sótano</option>}

                            {/* Si el inmueble tiene semisótano, la añadimos como opción */}
                            {nivelesEspeciales2.semisotano && (
                              <option value="semisotano">Semisótano</option>
                            )}
                          </CFormSelect>
                        </div>

                        <div>
                          <CFormInput
                            name="uso"
                            label="Uso"
                            value={comun.uso}
                            onChange={(e) => handleChangeAreaComun(e, index)}
                            required
                          />
                        </div>

                        {/* ESTE DIV OCUPA TODA LA FILA DEL GRID */}
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                              <CFormInput
                                name="area_ocupada"
                                label="Área Ocupada"
                                type="number"
                                value={comun.area_ocupada}
                                onChange={(e) => handleChangeAreaComun(e, index)}
                                required
                                step="0.01"
                              />
                            </div>

                            <div style={{ flex: 1 }}>
                              <CFormInput
                                name="area_techada"
                                type="number"
                                label="Área Techada"
                                value={comun.area_techada}
                                onChange={(e) => handleChangeAreaComun(e, index)}
                                required
                                step="0.01"
                              />
                            </div>

                            <div style={{ flex: 1 }}>
                              <CFormInput
                                name="area_libre"
                                label="Área Libre"
                                type="number"
                                value={comun.area_libre}
                                onChange={(e) => handleChangeAreaComun(e, index)}
                                required
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>

                        {/* CONTINÚA EN FORMATO DE 2 COLUMNAS */}
                        <div>
                          <CFormInput
                            name="por_frente"
                            label="Por el frente"
                            value={comun.por_frente}
                            onChange={(e) => handleChangeAreaComun(e, index)}
                            required
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                          {/* Input numérico a la izquierda para el tramo */}
                          <div style={{ flex: 1 }}>
                            <CFormInput
                              type="number"
                              name="tramo_frente_num"
                              label="Tramo(s)"
                              value={comun.tramo_frente_num || ''}
                              onChange={(e) => handleChangeAreaComun(e, index)}
                              required
                              placeholder="N° tramo"
                              style={{ marginRight: '10px' }} // Para un poco de separación entre el input numérico y el texto
                            />
                          </div>

                          {/* Input para el valor del tramo */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {Array.from({ length: comun.tramo_frente_num || 0 }).map((_, i) => (
                              <CFormInput
                                key={`tramo_frente_array_${i}`}
                                type="number"
                                name={`tramo_frente_array_${i}`}
                                label={`Tramo ${i + 1}`}
                                value={comun.tramo_frente_array?.[i] || ''}
                                onChange={(e) => handleChangeAreaComun(e, index)}
                                required
                                placeholder={`Valor del tramo ${i + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <CFormInput
                            name="por_derecha"
                            label="Por la derecha"
                            value={comun.por_derecha}
                            onChange={(e) => handleChangeAreaComun(e, index)}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                          {/* Input numérico a la izquierda para el tramo */}
                          <div style={{ flex: 1 }}>
                            <CFormInput
                              type="number"
                              name="tramo_derecha_num"
                              label="Tramo(s)"
                              value={comun.tramo_derecha_num || ''}
                              onChange={(e) => handleChangeAreaComun(e, index)}
                              required
                              placeholder="N° tramo"
                              style={{ marginRight: '10px' }} // Para un poco de separación entre el input numérico y el texto
                            />
                          </div>

                          {/* Input para el valor del tramo */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {Array.from({ length: comun.tramo_derecha_num || 0 }).map((_, i) => (
                              <CFormInput
                                key={`tramo_derecha_array_${i}`}
                                type="number"
                                name={`tramo_derecha_array_${i}`}
                                label={`Tramo ${i + 1}`}
                                value={comun.tramo_derecha_array?.[i] || ''}
                                onChange={(e) => handleChangeAreaComun(e, index)}
                                required
                                placeholder={`Valor del tramo ${i + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <CFormInput
                            name="por_izquierda"
                            label="Por la izquierda"
                            value={comun.por_izquierda}
                            onChange={(e) => handleChangeAreaComun(e, index)}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                          {/* Input numérico a la izquierda para el tramo */}
                          <div style={{ flex: 1 }}>
                            <CFormInput
                              type="number"
                              name="tramo_izquierda_num"
                              label="Tramo(s)"
                              value={comun.tramo_izquierda_num || ''}
                              onChange={(e) => handleChangeAreaComun(e, index)}
                              required
                              placeholder="N° tramo"
                              style={{ marginRight: '10px' }} // Para un poco de separación entre el input numérico y el texto
                            />
                          </div>

                          {/* Input para el valor del tramo */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {Array.from({ length: comun.tramo_izquierda_num || 0 }).map((_, i) => (
                              <CFormInput
                                key={`tramo_izquierda_array_${i}`}
                                type="number"
                                name={`tramo_izquierda_array_${i}`}
                                label={`Tramo ${i + 1}`}
                                value={comun.tramo_izquierda_array?.[i] || ''}
                                onChange={(e) => handleChangeAreaComun(e, index)}
                                required
                                placeholder={`Valor del tramo ${i + 1}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <CFormInput
                            name="por_fondo"
                            label="Por el fondo"
                            value={comun.por_fondo}
                            onChange={(e) => handleChangeAreaComun(e, index)}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                          {/* Input numérico a la izquierda para el tramo */}
                          <div style={{ flex: 1 }}>
                            <CFormInput
                              type="number"
                              name="tramo_fondo_num"
                              label="Tramo(s)"
                              value={comun.tramo_fondo_num || ''}
                              onChange={(e) => handleChangeAreaComun(e, index)}
                              required
                              placeholder="N° tramo"
                              style={{ marginRight: '10px' }} // Para un poco de separación entre el input numérico y el texto
                            />
                          </div>

                          {/* Input para el valor del tramo */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {Array.from({ length: comun.tramo_fondo_num || 0 }).map((_, i) => (
                              <CFormInput
                                key={`tramo_fondo_array_${i}`}
                                type="number"
                                name={`tramo_fondo_array_${i}`}
                                label={`Tramo ${i + 1}`}
                                value={comun.tramo_fondo_array?.[i] || ''}
                                onChange={(e) => handleChangeAreaComun(e, index)}
                                required
                                placeholder={`Valor del tramo ${i + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <CButton color="secondary" onClick={() => setCurrentStep(2)}>
                      Atrás
                    </CButton>
                    <CButton color="primary" onClick={handleAddAreaComun}>
                      +
                    </CButton>
                    <CButton color="primary" onClick={() => setCurrentStep(4)}>
                      Siguiente
                    </CButton>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <strong>Datos Necesarios:</strong>

                {/* Sección para Fecha de terminación de la construcción */}
                <div>
                  <label>Fecha de terminación de la construcción:</label>
                  <input
                    type="date"
                    value={fechaTerminacion} // Asegúrate de usar un estado para manejar el valor
                    onChange={(e) => setFechaTerminacion(e.target.value)} // Actualiza el valor con el setter
                    style={{
                      padding: '10px',
                      width: '100%',
                      borderRadius: '5px',
                      border: '1px solid #ccc',
                      marginTop: '10px',
                    }}
                  />
                </div>

                {/* Sección para Propietarios */}
                <div style={{ marginTop: '20px' }}>
                  {/* Mostrar campos para ingresar la información de los propietarios */}
                  {Array.from({ length: cantidadPropietarios }).map((_, index) => (
                    <div
                      key={index}
                      style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}
                    >
                      <div style={{ flex: 1 }}>
                        <label>Propietario {index + 1}:</label>
                        <input
                          type="text"
                          value={`${propietarios[index]?.nombres || ''} ${propietarios[index]?.apellidos || ''}`}
                          readOnly
                          style={{
                            padding: '10px',
                            width: '100%',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            marginTop: '10px',
                            backgroundColor: '#f9f9f9', // opcional: para que se vea como un campo deshabilitado
                          }}
                        />
                      </div>

                      {cantidadPropietarios > 1 && (
                        <div style={{ marginLeft: '10px', flex: 1 }}>
                          <label>Unidad Inmobiliaria:</label>
                          <CFormSelect
                            multiple
                            name={`unidad_asignada_${index}`}
                            value={unidadesAsignadas[index] || []}
                            onChange={(e) => handleUnidadAsignadaChange(e, index)}
                            required
                          >
                            {[
                              ...new Set(
                                formDataUnidadInmobiliarias
                                  .map((unidad) => unidad.numero_unidad?.trim())
                                  .filter((num) => num),
                              ),
                            ].map((num, idx) => (
                              <option key={idx} value={num}>
                                Unidad {num}
                              </option>
                            ))}
                          </CFormSelect>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Resto de la interfaz de usuario */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    marginTop: '15px',
                  }}
                >
                  {nivelesRenderizados}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <CButton color="secondary" onClick={() => setCurrentStep(3)}>
                    Atrás
                  </CButton>
                  <CButton type="submit" color="primary">
                    Finalizar
                  </CButton>
                </div>
              </div>
            )}
          </CForm>
        </CCardBody>
      </CCard>
    </CCol>
  )
}
