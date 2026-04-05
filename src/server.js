require('dotenv').config();
const express = require('express');
const path = require('path');
const { searchAccountRange } = require('./mastercard');

const app = express();
const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '..', 'public');

app.use(express.json());
app.use(express.static(publicPath));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.post('/bin-lookup', async (req, res) => {
  try {
    const { accountRange } = req.body;

    if (!accountRange) {
      return res.status(400).json({
        success: false,
        error: 'El campo accountRange es obligatorio',
      });
    }

    if (!/^\d+$/.test(accountRange)) {
      return res.status(400).json({
        success: false,
        error: 'accountRange debe ser numérico',
      });
    }

    if (accountRange.length < 6 || accountRange.length > 11) {
      return res.status(400).json({
        success: false,
        error: 'accountRange debe tener entre 6 y 11 dígitos',
      });
    }

    const result = await searchAccountRange(accountRange);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error en /bin-lookup:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});