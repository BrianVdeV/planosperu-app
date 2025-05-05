import React, { useState, useEffect } from "react";
import { CFormInput, CFormSelect, CCard, CCardBody, CCardHeader, CCol, CForm, CButton } from "@coreui/react";
import { useNavigate } from "react-router-dom";

export default function RegistrarUnidadInmobiliaria() {
  const [formDataUnidadInmobiliarias, setFormDataUnidadInmobiliarias] = useState([
    {
      nivel: '',
      uso: '',
      area_ocupada: '',
      area_techada: '',
      area_libre: '',
      por_frente: '',
      tramo_frente: '',
      por_derecha: '',
      tramo_derecha: '',
      por_izquierda: '',
      tramo_izquierda: '',
      por_fondo: '',
      tramo_fondo: '',
    },
  ]);
  const [numPisos, setNumPisos] = useState(1);

  // Añadir una nueva unidad inmobiliaria
const handleAddUnidadInmobiliaria = () => {
  setFormDataUnidadInmobiliarias((prev) => [
    ...prev,
    {
      nivel: '',
      uso: '',
      area_ocupada: '',
      area_techada: '',
      area_libre: '',
      por_frente: '',
      tramo_frente: '',
      por_derecha: '',
      tramo_derecha: '',
      por_izquierda: '',
      tramo_izquierda: '',
      por_fondo: '',
      tramo_fondo: '',
    },
  ]);
};

  
  const [formDataOT, setFormDataOT] = useState({
    ot: "", // OT
    siglas: "", // Siglas
    apellidos: "", // Apellidos
    nombres: "", // Nombres
    direccion: "", // Dirección
    dni: "", // DNI
    estado_civil: "", // Estado civil
    telefono: "", // Teléfono
    email: "", // Correo electrónico
  });

  const [currentStep, setCurrentStep] = useState(1); // Controla en qué paso del formulario estamos
  const navigate = useNavigate();

  // Handle form changes
  const handleChangeOT = (e) => {
    const { name, value } = e.target;
    setFormDataOT((prev) => ({ ...prev, [name]: value }));
  };

  
  const handleChangeUnidadInmobiliaria = (e, index) => {
    const { name, value } = e.target;
  
    setFormDataUnidadInmobiliarias((prev) => {
      const updated = [...prev];
      const unidadActual = { ...updated[index], [name]: value };
  
      if (
        unidadActual.area_ocupada !== '' &&
        unidadActual.area_techada !== '' &&
        !isNaN(unidadActual.area_ocupada) &&
        !isNaN(unidadActual.area_techada)
      ) {
        unidadActual.area_libre = (unidadActual.area_ocupada - unidadActual.area_techada).toString();
      }
  
      updated[index] = unidadActual;
      return updated;
    });
  };
  
    

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const data = {
      ot: formDataOT,
      unidades_inmobiliaria: formDataUnidadInmobiliarias,
    };
  
    fetch("http://127.0.0.1:5000/formulario-persona-natural", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al registrar Unidad Inmobiliaria");
        return res.blob(); // Cambiar de .json() a .blob()
      })
      .then((blob) => {
        // Crear un enlace para descargar el archivo
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Formulario_Persona_Natural.xlsm'; // Nombre del archivo a descargar
        link.click(); // Inicia la descarga
      })
      .then(() => {
        alert("Unidad Inmobiliaria registrada correctamente");
        navigate("/dashboard"); // Redirige al dashboard
      })
      .catch((err) => {
        console.error(err);
        alert("Hubo un error al registrar la Unidad Inmobiliaria");
      });
  };
  

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
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                    marginTop: "15px",
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
                      name="nombres"
                      label="Nombres"
                      value={formDataOT.nombres}
                      onChange={handleChangeOT}
                      required
                    />
                  </div>
                  <div>
                    <CFormInput
                      name="apellidos"
                      label="Apellidos"
                      value={formDataOT.apellidos}
                      onChange={handleChangeOT}
                      required
                    />
                  </div>
                  <div>
                    <CFormInput
                      name="dni"
                      label="DNI"
                      value={formDataOT.dni}
                      onChange={handleChangeOT}
                      required
                    />
                  </div>
                  <div>
                    <CFormSelect
                      name="estado_civil"
                      label="Estado Civil"
                      value={formDataOT.estado_civil}
                      onChange={handleChangeOT}
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
                      name="area_m2"
                      label="Área en m²"
                      value={formDataOT.area_m2}
                      onChange={handleChangeUnidadInmobiliaria}
                      required
                    />
                  </div>

                  <div>
                    <CFormInput
                      name="partida_registral"
                      label="Partida Registral"
                      value={formDataOT.partida_registral}
                      onChange={handleChangeUnidadInmobiliaria}
                      required
                    />
                  </div>

                  <div>
                    <CFormInput
                      name="valor_unitario"
                      label="Valor Unitario"
                      value={formDataOT.valor_unitario}
                      onChange={handleChangeUnidadInmobiliaria}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
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
                <div style={{ marginBottom: "20px" }}>
        <CFormInput
          type="number"
          label="¿Cuántos pisos tiene el inmueble?"
          min={1}
          value={numPisos}
          onChange={(e) => setNumPisos(parseInt(e.target.value) || 1)}
          required
        />
      </div>
      {formDataUnidadInmobiliarias.map((unidad, index) => (
        <div key={index}>
          <strong>UNIDAD INMOBILIARIA {index + 1}</strong>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginTop: "15px",
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
              {[...Array(numPisos)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Piso {i + 1}
                </option>
              ))}
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
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <CFormInput
                    name="area_ocupada"
                    label="Área Ocupada"
                    type="number"
                    value={unidad.area_ocupada}
                    onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                    required
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

            <div>
              <CFormInput
                name="tramo_frente"
                label="Tramo(s)"
                value={unidad.tramo_frente}
                onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                required
              />
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

            <div>
              <CFormInput
                name="tramo_derecha"
                label="Tramo(s)"
                value={unidad.tramo_derecha}
                onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                required
              />
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

            <div>
              <CFormInput
                name="tramo_izquierda"
                label="Tramo(s)"
                value={unidad.tramo_izquierda}
                onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                required
              />
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

            <div>
              <CFormInput
                name="tramo_fondo"
                label="Tramo(s)"
                value={unidad.tramo_fondo}
                onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                required
              />
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
        <CButton color="secondary" onClick={() => setCurrentStep(1)}>
          Atrás
        </CButton>
        <CButton color="primary" onClick={handleAddUnidadInmobiliaria}>
          Agregar más unidad inmobiliaria
        </CButton>
        <CButton type="submit" color="primary">
          Finalizar
        </CButton>
      </div>
    </div>
              </div>
            )}
          </CForm>
        </CCardBody>
      </CCard>
    </CCol>
  );
}
