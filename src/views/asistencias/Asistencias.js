import React, { useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CButton,
} from '@coreui/react'
import axios from 'axios'

const nombres = ['Jorge', 'Katherin', 'Betci', 'Andrea', 'Elizabeth', 'Jazmin', 'Renzo', 'Ivonne']

const meses = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
]

const now = new Date()
const defaultMes = (now.getMonth() + 1).toString().padStart(2, '0')
const defaultAño = now.getFullYear().toString()

const Asistencias = () => {
  const [nombre, setNombre] = useState(nombres[0])
  const [mes, setMes] = useState(defaultMes)
  const [año, setAño] = useState(defaultAño)
  const [descargando, setDescargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setDescargando(true)
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/export',
        { nombre, mes, año },
        { responseType: 'blob' },
      )
      // Descargar el archivo recibido
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reporte_${nombre}_${año}_${mes}.xlsm`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Error al exportar: ' + (error.response?.data || error.message))
    }
    setDescargando(false)
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Asistencias</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-4">
              <CFormLabel>Nombre</CFormLabel>
              <CFormSelect value={nombre} onChange={(e) => setNombre(e.target.value)}>
                {nombres.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="col-md-4">
              <CFormLabel>Mes</CFormLabel>
              <CFormSelect value={mes} onChange={(e) => setMes(e.target.value)}>
                {meses.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="col-md-4">
              <CFormLabel>Año</CFormLabel>
              <CFormInput
                type="number"
                value={año}
                onChange={(e) => setAño(e.target.value)}
                min="2000"
                max="2100"
              />
            </div>
            <div className="col-12">
              <CButton type="submit" color="primary" disabled={descargando}>
                {descargando ? 'Descargando...' : 'Exportar'}
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Asistencias
