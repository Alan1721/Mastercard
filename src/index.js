const { searchAccountRange } = require('./mastercard');

async function main() {
  try {
    const accountRange = process.argv[2];

    if (!accountRange) {
      console.error('Debes enviar un accountRange.');
      console.error('Ejemplo: node src/index.js 585240844');
      process.exit(1);
    }

    const result = await searchAccountRange(accountRange);

    console.log('Respuesta de Mastercard:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error al consumir Mastercard');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

main();