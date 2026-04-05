const input = document.getElementById("accountRange");
const button = document.getElementById("consultarBtn");
const formattedResponse = document.getElementById("formattedResponse");
const rawResponse = document.getElementById("rawResponse");
const statusDiv = document.getElementById("status");
const footerText = document.getElementById("footerText");

function setStatus(message, type = "info") {
  statusDiv.textContent = message;
  statusDiv.className = type;
}

if (footerText) {
  footerText.textContent = `v1.0 · Actualizado ${new Date().getFullYear()} · Alan Franco`;
}

function onlyNumbers(value) {
  return value.replace(/\D/g, "");
}

function formatBinInfo(binInfo) {
  const issuer = binInfo.customerName || "No disponible";
  const bin = binInfo.binNum || "N/A";
  const country = binInfo.country?.name || "N/A";
  const brand = binInfo.acceptanceBrand || "N/A";
  const product = binInfo.productDescription || "N/A";
  const lowRange = binInfo.lowAccountRange || "N/A";
  const highRange = binInfo.highAccountRange || "N/A";

  return `
    <div class="result-grid">
      <div class="result-item">
        <span class="result-label">Banco emisor</span>
        <span class="result-value">${issuer}</span>
      </div>

      <div class="result-item">
        <span class="result-label">BIN</span>
        <span class="result-value">${bin}</span>
      </div>

      <div class="result-item">
        <span class="result-label">País</span>
        <span class="result-value">${country}</span>
      </div>

      <div class="result-item">
        <span class="result-label">Marca</span>
        <span class="result-value">${brand}</span>
      </div>

      <div class="result-item">
        <span class="result-label">Tipo de tarjeta</span>
        <span class="result-value">${product}</span>
      </div>

      <div class="result-item">
        <span class="result-label">Rango</span>
        <span class="result-value">${lowRange} - ${highRange}</span>
      </div>
    </div>
  `;
}

input.addEventListener("input", () => {
  input.value = onlyNumbers(input.value);
});

input.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    button.click();
  }
});

button.addEventListener("click", async () => {
  const accountRange = input.value.trim();

  if (!accountRange) {
    setStatus("Debes ingresar un BIN o accountRange.", "error");
    formattedResponse.innerHTML = '<div class="formatted-empty">Ingrese un BIN para realizar la consulta.</div>';
    rawResponse.textContent = "";
    return;
  }

  if (!/^\d{6,11}$/.test(accountRange)) {
    setStatus("El valor debe ser numérico y tener entre 6 y 11 dígitos.", "error");
    formattedResponse.innerHTML = '<div class="formatted-empty">El valor ingresado no cumple con el formato requerido.</div>';
    rawResponse.textContent = "";
    return;
  }

  try {
    setStatus("Consultando...", "info");
    formattedResponse.innerHTML = '<div class="formatted-empty">Procesando consulta...</div>';
    rawResponse.textContent = "";

    const response = await fetch("/bin-lookup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ accountRange })
    });

    let data;

    try {
      data = await response.json();
    } catch (parseError) {
      setStatus("El backend devolvió una respuesta no válida.", "error");
      formattedResponse.innerHTML = '<div class="formatted-empty">Respuesta inválida del servidor.</div>';
      rawResponse.textContent = "No se pudo interpretar la respuesta como JSON.";
      return;
    }

    rawResponse.textContent = JSON.stringify(data, null, 2);

    if (!response.ok || !data.success) {
      setStatus("Ocurrió un error en la consulta.", "error");
      formattedResponse.innerHTML = '<div class="formatted-empty">No fue posible interpretar la respuesta.</div>';
      return;
    }

    const result = data.data;

    if (!result || result.length === 0) {
      setStatus("No se encontraron datos para este BIN.", "error");
      formattedResponse.innerHTML = '<div class="formatted-empty">No se encontró información para este BIN.</div>';
      return;
    }

    const binInfo = result[0];

    setStatus("Consulta exitosa.", "success");
    formattedResponse.innerHTML = formatBinInfo(binInfo);
  } catch (error) {
    setStatus("Error de conexión con el backend.", "error");
    formattedResponse.innerHTML = '<div class="formatted-empty">Error de conexión.</div>';
    rawResponse.textContent = JSON.stringify(
      { message: error.message },
      null,
      2
    );
  }
});