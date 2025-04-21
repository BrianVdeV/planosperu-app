import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';

export default function CrearCotizacion() {
  const [cotizacion, setCotizaciones] = useState([]);
  const [cotizacionSeleccionado, setCotizacionSeleccionado] = useState('');
  const [detalles, setDetalles] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [montoCuotas, setMontoCuotas] = useState([]);
  const [montoCancelacion, setMontoCancelacion] = useState(""); // Inicializa con una cadena vacía
  const [montoTotal, setMontoTotal] = useState(''); // Para almacenar el monto total ingresado

  // 🔥 Añadir estados para usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');

  // 🔄 Cargar cotizaciones
  useEffect(() => {
    axios.get("https://planosperu.com.pe/intranet/api/tipot/")
      .then(response => setCotizaciones(response.data.results))
      .catch(error => console.error('Error al obtener las cotizaciones:', error));
  }, []);

  useEffect(() => {
    if (cotizacionSeleccionado) {
      const cotizacionSeleccionada = cotizacion.find(c => c.id === cotizacionSeleccionado);
  
      // 📝 Actualiza observaciones
      setObservaciones(cotizacionSeleccionada ? cotizacionSeleccionada.observaciones : '');
  
      // 📝 Actualiza detalles según el tipo
      if (cotizacionSeleccionada) {
        switch (cotizacionSeleccionada.tipo) {
          case "Planos y Documentos":
            setDetalles("Se elaborará planos y documentos para , según normativa vigente.");
            break;
          case "Documentos":
            setDetalles("Se elaborará documentos para , según normativa vigente.");
            break;
          case "Planos":
            setDetalles("Se elaborará planos para");
            break;
          default:
            setDetalles("");
        }
      } else {
        setDetalles("");
      }
    } else {
      setObservaciones('');
      setDetalles('');
    }
  }, [cotizacionSeleccionado, cotizacion]);
  

  // 🔄 Cargar usuarios desde tu API
  useEffect(() => {
    axios.get("https://planosperu.com.pe/intranet/api/users/")
      .then(res => {
        // Actualiza el estado con los resultados
        setUsuarios(res.data.results); // Los usuarios están dentro de la propiedad 'results'
      })
      .catch(err => {
        console.error("❌ Error al obtener usuarios:", err.message);
        console.log("Código de error:", err.code);
        console.log("Detalles:", err.response?.data || err.request || "Sin respuesta del servidor");
      });
  }, []);

  const handleUsuarioChange = (selectedOption) => {
    const username = selectedOption ? selectedOption.value : '';
    setUsuarioSeleccionado(username);
  };

  const handleCotizacionChange = async (selectedOption) => {
    const cotizacionId = selectedOption ? selectedOption.value : '';
    setCotizacionSeleccionado(cotizacionId);
  
    if (cotizacionId && montoTotal > 0) {
      const selectedCotizacion = cotizacion.find(c => c.id === cotizacionId);
  
      if (selectedCotizacion) {
        const cuotas = selectedCotizacion.cuotas;
        let montos = [];
  
        if (cuotas === 1) {
          montos = [montoTotal];
        } else {
          let porcentajes = [];
  
          if (cuotas === 2) {
            porcentajes = [0.55, 0.45];
          } else if (cuotas === 3) {
            porcentajes = [0.40, 0.30, 0.30];
          } else if (cuotas === 4) {
            porcentajes = [0.35, 0.25, 0.20, 0.20];
          }
  
          const redondearDecena = (monto) => Math.round(monto / 10) * 10;
          let sumaRedondeada = 0;
  
          for (let i = 0; i < porcentajes.length; i++) {
            if (i === porcentajes.length - 1) {
              montos.push(parseFloat((montoTotal - sumaRedondeada).toFixed(2)));
            } else {
              const monto = redondearDecena(montoTotal * porcentajes[i]);
              montos.push(monto);
              sumaRedondeada += monto;
            }
          }
        }
  
        setMontoCuotas(montos);
        setMontoCancelacion(montos[0]);
  
        // Detalles según tipo
        if (selectedCotizacion.tipo === "Planos y Documentos") {
          setDetalles("Se elaborará planos y documentos para , según normativa vigente.");
        } else if (selectedCotizacion.tipo === "Documentos") {
          setDetalles("Se elaborará documentos para , según normativa vigente.");
        } else if (selectedCotizacion.tipo === "Planos") {
          setDetalles("Se elaborará planos para");
        } else {
          setDetalles("");
        }
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();  // Evita el comportamiento por defecto (recargar la página)
  
    const datos = {
      id: usuarioSeleccionado,                // si 'usuarioSeleccionado' representa un ID
      codigo: cotizacionSeleccionado,         // nombre de la hoja a conservar
      nombre: montoTotal.toString(),          // nombre de la cotización
      detalles: detalles,
      cliente: observaciones                  // o el campo que represente al cliente
    };
    
  
    const response = await fetch('http://127.0.0.1:5000/crear-cotizacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
  
    if (!response.ok) {
      alert('Error al generar la cotización');
      return;
    }
  
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cotizacion_generada.xlsm';
    a.click();
  };
  const handleMontoTotalChange = (e) => {
    const value = parseFloat(e.target.value) || '';
    setMontoTotal(value);
  
    if (cotizacionSeleccionado && value > 0) {
      const selectedCotizacion = cotizacion.find(c => c.id === cotizacionSeleccionado);
  
      if (selectedCotizacion) {
        const cuotas = selectedCotizacion.cuotas;
        let montos = [];
  
        if (cuotas === 1) {
          montos = [value];
        } else {
          let porcentajes = [];
  
          if (cuotas === 2) {
            porcentajes = [0.55, 0.45];
          } else if (cuotas === 3) {
            porcentajes = [0.40, 0.30, 0.30];
          } else if (cuotas === 4) {
            porcentajes = [0.35, 0.25, 0.20, 0.20];
          }
  
          const redondearDecena = (monto) => Math.round(monto / 10) * 10;
          let sumaRedondeada = 0;
  
          for (let i = 0; i < porcentajes.length; i++) {
            if (i === porcentajes.length - 1) {
              montos.push(parseFloat((value - sumaRedondeada).toFixed(2)));
            } else {
              const monto = redondearDecena(value * porcentajes[i]);
              montos.push(monto);
              sumaRedondeada += monto;
            }
          }
        }
  
        setMontoCuotas(montos);
        setMontoCancelacion(montos[0]);
      }
    }
    const handleCrearCotizacion = async () => {
      const datos = {
        id: 5,
        codigo: "ABC123",
        nombre: "Cotización especial",
        detalles: "Detalles largos de cotización que deben ir en varias filas...",
        cliente: "Cliente Ejemplo",
      };
    
      const response = await fetch('http://localhost:5000/crear-cotizacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
    
      if (!response.ok) {
        alert('Error al generar el Excel');
        return;
      }
    
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cotizacion_generada.xlsm';
      a.click();
    };

    
  };

  return (
    <div className="container">
      <div className="card mt-3">
        <div className="card-header">
          <h4 className="card-title">Crear Cotización</h4>
          <p className="card-title-desc">Llena el formulario para crear una nueva cotización.</p>
        </div>
        <div className="card-body">
        <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Usuario</label>
                <Select
                  options={usuarios.map(usuario => ({
                    value: usuario.username,  // Asegúrate de que 'username' es único
                    label: usuario.username   // El valor que se muestra
                  }))}
                  value={usuarioSeleccionado ? { value: usuarioSeleccionado, label: usuarioSeleccionado } : null}
                  onChange={handleUsuarioChange}
                  placeholder="Seleccione un usuario"
                />
              </div>

              {/* Select de Cotizaciones */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Cotización</label>
                <Select
                  options={[
                    {
                      label: 'SUNARP',
                      options: cotizacion
                        .filter(c => c.entidad?.toLowerCase().trim() === 'sunarp')
                        .map(c => ({
                          value: c.id,
                          label: c.nom_tipo
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)) // Ordenar alfabéticamente
                    },
                    {
                      label: 'OTROS',
                      options: cotizacion
                        .filter(c => c.entidad?.toLowerCase().trim() !== 'sunarp')
                        .map(c => ({
                          value: c.id,
                          label: c.nom_tipo
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)) // Ordenar alfabéticamente
                    }
                  ]}
                  value={
                    cotizacionSeleccionado
                      ? {
                        value: cotizacionSeleccionado,
                        label:
                          cotizacion.find(c => c.id === cotizacionSeleccionado)?.nom_tipo || ''
                      }
                      : null
                  }
                  onChange={handleCotizacionChange}
                  placeholder="Seleccione una cotización"
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Cliente</label>
                <input type="text" className="form-control" name="cliente" required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">DNI</label>
                <input type="text" className="form-control" name="dni" />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Teléfono</label>
                <input type="text" className="form-control" name="telefono" />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Ubicación</label>
                <input type="text" className="form-control" name="ubicacion" required />
              </div>
            </div>

            <div className="mb-3">
  <label className="form-label">Detalles</label>
  <textarea
    className="form-control"
    name="detalles"
    rows="3"
    value={detalles}
    onChange={(e) => setDetalles(e.target.value)}
    required
  ></textarea>
</div>


            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Número de Pisos</label>
                <input type="number" className="form-control" name="pisos" required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Área (m²)</label>
                <input type="number" step="0.01" className="form-control" name="area" required />
              </div>
            </div>     
            {/* Campo para ingresar el monto total */}
            <div className="mb-3">
              <label className="form-label">Monto Cancelación</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={montoTotal}
                onChange={handleMontoTotalChange}
                placeholder="Ingrese el monto total"
              />
            </div>

            {/* Mostrar las cuotas calculadas */}
            <div className="mb-3">
              <label className="form-label">Cuotas</label>
              {montoCuotas.length > 0 && (
                <ul>
                  {montoCuotas.map((monto, index) => (
                    <li key={index}>
                      Cuota {index + 1}: S/. {monto}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Campo Observaciones */}
            <div className="mb-3">
              <label className="form-label">Observaciones</label>
              <textarea
                className="form-control"
                name="observaciones"
                rows="3"
                value={observaciones || ''} 
                onChange={(e) => setObservaciones(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary">Crear Cotización</button>
          </form>
        </div>
      </div>
    </div>
  );
}
