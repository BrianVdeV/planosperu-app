import React, { useState, useEffect } from "react";
import { CFormInput, CFormSelect, CCard, CCardBody, CCardHeader, CCol, CForm, CButton,CFormCheck ,CRow} from "@coreui/react";
import { useNavigate } from "react-router-dom";

export default function RegistrarUnidadInmobiliaria() {
  const [formDataUnidadInmobiliarias, setFormDataUnidadInmobiliarias] = useState([
    {
      numero_unidad:'',
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
  ]);
  const [nivelSeleccionado, setNivelSeleccionado] = useState("");

  // Función para manejar el cambio de la cantidad de pisos
  const handleNivelEspecialChange = (e) => {
    const { name, checked } = e.target;
    setNivelesEspeciales((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };
// Función para manejar el cambio de la cantidad de pisos
const handleNivelEspecial2Change = (e) => {
  const { name, checked } = e.target;
  setNivelesEspeciales2((prevState) => ({
    ...prevState,
    [name]: checked,
  }));
};

  const [formDataAreaComun, setFormDataAreaComun] = useState([
    {
      numero_unidad:'',
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
  ]);
  const [numPisos, setNumPisos] = useState(1);
  const [numPisos2, setNumPisos2] = useState(1);
  const [nivelesEspeciales, setNivelesEspeciales] = useState({
    azotea: false,
    sotano: false,
    semisotano: false,
  }); // Estado para los checkboxes de niveles especiales
  const [nivelesEspeciales2, setNivelesEspeciales2] = useState({
    azotea: false,
    sotano: false,
    semisotano: false,
  }); // Estado para los checkboxes de niveles especiales
  // Añadir una nueva unidad inmobiliaria
const handleAddUnidadInmobiliaria = () => {
  setFormDataUnidadInmobiliarias((prev) => [
    ...prev,
    {
      numero_unidad:'',
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
  ]);
};
 // Añadir una nueva unidad inmobiliaria
 const handleAddAreaComun = () => {
  setFormDataAreaComun((prev) => [
    ...prev,
    {
      numero_unidad:'',
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
  ]);
};
  
  const [formDataOT, setFormDataOT] = useState({
    ot: "", // OT
    siglas: "", // Siglas
    apellidos: "", // Apellidos
    nombres: "", // Nombres
    direccion: "", // Dirección
    valor_unitario:"",
    partida_registral:"",
    dni: "", // DNI
    estado_civil: "", // Estado civil
    area_m2:"",
    conyugue:"",
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
  const handleChangeAreaComun = (e, index) => {
    const { name, value } = e.target;
  
    setFormDataAreaComun((prev) => {
      const updated = [...prev];
      const areaActual = { ...updated[index], [name]: value };
  
      if (
        areaActual.area_ocupada !== '' &&
        areaActual.area_techada !== '' &&
        !isNaN(areaActual.area_ocupada) &&
        !isNaN(areaActual.area_techada)
      ) {
        areaActual.area_libre = (areaActual.area_ocupada -areaActual.area_techada).toString();
      }
  
      updated[index] = areaActual;
      return updated;
    });
  };
  
    

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const data = {
      ot: formDataOT,
      unidades_inmobiliaria: formDataUnidadInmobiliarias,
      area_comun:formDataAreaComun,
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
                      name="conyugue"
                      label="Conyugue"
                      value={formDataOT.conyugue}
                      onChange={handleChangeOT}
                      required
                    />
                  </div>
                  <div>
                    <CFormInput
                      name="direccion"
                      label="Dirección"
                      value={formDataOT.direccion}
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
                <CRow style={{ marginBottom: "20px" }}>
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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <strong>Unidad Inmobiliaria</strong>
            <CFormInput
              name="numero_unidad"
              type="text"
              placeholder={`${index + 1}`}  // Colocamos un placeholder si el campo está vacío
              value={unidad.numero_unidad || ''} // Si no tiene valor, lo mostramos vacío
              onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}  // Manejamos el cambio de valor
              style={{ marginLeft: '10px', width: '70px' }} // Un pequeño espacio entre el texto y el input
              required
            />
          </div>
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

          {/* Mapeamos los pisos normales */}
          {[...Array(numPisos)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Piso {i + 1}
            </option>
          ))}

          {/* Si el inmueble tiene azotea, la añadimos como opción */}
          {nivelesEspeciales.azotea && (
            <option value="azotea">Azotea</option>
          )}

          {/* Si el inmueble tiene sótano, la añadimos como opción */}
          {nivelesEspeciales.sotano && (
            <option value="sotano">Sótano</option>
          )}

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
                  onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}  // Maneja el cambio del valor
                  required
                  placeholder="N° tramo"
                  style={{ marginRight: '10px' }}  // Para un poco de separación entre el input numérico y el texto
                />
              </div>

              {/* Input para el valor del tramo */}
              <div style={{ flex: 3 }}>
                <CFormInput
                  name="tramo_frente"
                  label=" "
                  value={unidad.tramo_frente}
                  onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                  required
                  placeholder="Descripción del tramo"
                />
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
                  onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}  // Maneja el cambio del valor
                  required
                  placeholder="N° tramo"
                  style={{ marginRight: '10px' }}  // Para un poco de separación entre el input numérico y el texto
                />
              </div>

              {/* Input para el valor del tramo */}
              <div style={{ flex: 3 }}>
                <CFormInput
                  name="tramo_derecha"
                  label=" "
                  value={unidad.tramo_derecha}
                  onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                  required
                  placeholder="Descripción del tramo"
                />
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
                  onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}  // Maneja el cambio del valor
                  required
                  placeholder="N° tramo"
                  style={{ marginRight: '10px' }}  // Para un poco de separación entre el input numérico y el texto
                />
              </div>

              {/* Input para el valor del tramo */}
              <div style={{ flex: 3 }}>
                <CFormInput
                  name="tramo_izquierda"
                  label=" "
                  value={unidad.tramo_izquierda}
                  onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                  required
                  placeholder="Descripción del tramo"
                />
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
                  onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}  // Maneja el cambio del valor
                  required
                  placeholder="N° tramo"
                  style={{ marginRight: '10px' }}  // Para un poco de separación entre el input numérico y el texto
                />
              </div>

              {/* Input para el valor del tramo */}
              <div style={{ flex: 3 }}>
                <CFormInput
                  name="tramo_fondo"
                   label=" "
                  value={unidad.tramo_fondo}
                  onChange={(e) => handleChangeUnidadInmobiliaria(e, index)}
                  required
                  placeholder="Descripción del tramo"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
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
                <CRow style={{ marginBottom: "20px" }}>
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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <strong>ÁREA COMÚN</strong>
            <CFormInput
              name="numero_unidad"
              type="text"
              placeholder={`${index + 1}`}  // Colocamos un placeholder si el campo está vacío
              value={comun.numero_unidad || ''} // Si no tiene valor, lo mostramos vacío
              onChange={(e) => handleChangeAreaComun(e, index)}  // Manejamos el cambio de valor
              style={{ marginLeft: '10px', width: '70px' }} // Un pequeño espacio entre el texto y el input
              required
            />
          </div>
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
          {nivelesEspeciales2.azotea && (
            <option value="azotea">Azotea</option>
          )}

          {/* Si el inmueble tiene sótano, la añadimos como opción */}
          {nivelesEspeciales2.sotano && (
            <option value="sotano">Sótano</option>
          )}

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
                onChange={(e) =>handleChangeAreaComun(e, index)}
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
                  style={{ marginRight: '10px' }}  // Para un poco de separación entre el input numérico y el texto
                />
              </div>

              {/* Input para el valor del tramo */}
              <div style={{ flex: 3 }}>
                <CFormInput
                  name="tramo_frente"
                  label=" "
                  value={comun.tramo_frente}
                  onChange={(e) => handleChangeAreaComun(e, index)}
                  required
                  placeholder="Descripción del tramo"
                />
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
                  style={{ marginRight: '10px' }}  // Para un poco de separación entre el input numérico y el texto
                />
              </div>

              {/* Input para el valor del tramo */}
              <div style={{ flex: 3 }}>
                <CFormInput
                  name="tramo_derecha"
                  label=" "
                  value={comun.tramo_derecha}
                  onChange={(e) => handleChangeAreaComun(e, index)}
                  required
                  placeholder="Descripción del tramo"
                />
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
                  style={{ marginRight: '10px' }}  // Para un poco de separación entre el input numérico y el texto
                />
              </div>

              {/* Input para el valor del tramo */}
              <div style={{ flex: 3 }}>
                <CFormInput
                  name="tramo_izquierda"
                  label=" "
                  value={comun.tramo_izquierda}
                  onChange={(e) => handleChangeAreaComun(e, index)}
                  required
                  placeholder="Descripción del tramo"
                />
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
                  style={{ marginRight: '10px' }}  // Para un poco de separación entre el input numérico y el texto
                />
              </div>

              {/* Input para el valor del tramo */}
              <div style={{ flex: 3 }}>
                <CFormInput
                  name="tramo_fondo"
                  label=" "
                  value={comun.tramo_fondo}
                  onChange={(e) => handleChangeAreaComun(e, index)}
                  required
                  placeholder="Descripción del tramo"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
        <CButton color="secondary" onClick={() => setCurrentStep(2)}>
          Atrás
        </CButton>
        <CButton color="primary" onClick={handleAddAreaComun}>
         +
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
