import React, { useEffect, useState } from 'react';

export default function CrearCotizacion() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [cuotas, setCuotas] = useState(0);
  const [montoCuotas, setMontoCuotas] = useState([]);

  // Cargar las cotizaciones
  useEffect(() => {
    fetch('http://localhost:3000/api/cotizaciones') // Asegúrate de que esta URL sea la correcta
      .then(response => response.json())
      .then(data => setCotizaciones(data))
      .catch(error => console.error('Error al obtener las cotizaciones:', error));
  }, []);

  // Manejar el cambio en el campo de cotización
  const handleCotizacionChange = async (e) => {
    const cotizacionId = e.target.value;
    if (!cotizacionId) return;

    try {
      const obsResponse = await fetch(`http://localhost:3001/get_observaciones/${cotizacionId}`);
      const obsData = await obsResponse.json();
      setObservaciones(obsData.observaciones);

      const cuotasResponse = await fetch(`http://localhost:3001/obtener_cuotas/${cotizacionId}`);
      const cuotasData = await cuotasResponse.json();
      setCuotas(cuotasData.cuotas);
      setMontoCuotas(Array.from({ length: cuotasData.cuotas }, () => ''));
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  // Manejar el cambio de monto de cuotas
  const handleMontoChange = (index, value) => {
    const updatedMontos = [...montoCuotas];
    updatedMontos[index] = value;
    setMontoCuotas(updatedMontos);
  };

  return (
    <div className="container">
      <div className="card mt-3">
        <div className="card-header">
          <h4 className="card-title">Crear Cotización</h4>
          <p className="card-title-desc">Llena el formulario para crear una nueva cotización.</p>
        </div>
        <div className="card-body">
          <form method="POST">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Usuario</label>
                <input type="text" className="form-control" value="usuario_actual" disabled />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Cotización</label>
                <select className="form-control" onChange={handleCotizacionChange}>
                  <option value="">Selecciona una cotización</option>
                  {cotizaciones.map((cot) => (
                    <option key={cot.id} value={cot.id}>{cot.nombre}</option>
                  ))}
                </select>
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
              <textarea className="form-control" name="detalles" rows="3" required></textarea>
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

            <div className="mb-3">
              <label className="form-label">Modo de Cancelación</label>
              {Array.from({ length: cuotas }).map((_, i) => (
                <div className="mb-2" key={i}>
                  <label htmlFor={`cuota_${i}`}>Monto de la cuota {i + 1}:</label>
                  <input
                    type="number"
                    className="form-control"
                    id={`cuota_${i}`}
                    name={`monto_cancelacion_${i + 1}`}
                    placeholder={`Monto cuota ${i + 1}`}
                    value={montoCuotas[i] || ''}
                    onChange={(e) => handleMontoChange(i, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="mb-3">
              <label className="form-label">Observaciones</label>
              <textarea
                className="form-control"
                name="observaciones"
                rows="3"
                value={observaciones}
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
