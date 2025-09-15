const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const download = document.getElementById("download");
const radiusInput = document.getElementById("radius");
const radiusValue = document.getElementById("radiusValue");
const controls = document.getElementById("controls");
const previewContainer = document.getElementById("previewContainer");
const uploadArea = document.querySelector(".upload-area");
const themeToggle = document.getElementById("themeToggle");

let img = new Image();
let currentRadius = parseInt(radiusInput.value);

// Theme toggle functionality
themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";

  // Save theme preference
  try {
    localStorage.setItem("theme", newTheme);
  } catch (e) {
    // Fallback if localStorage is not available
  }
});

// Load saved theme
let savedTheme = "light";
try {
  savedTheme = localStorage.getItem("theme") || "light";
} catch (e) {
  // Fallback if localStorage is not available
}
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

// Drag and drop
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
});

// Slider
radiusInput.addEventListener("input", () => {
  currentRadius = parseInt(radiusInput.value);
  radiusValue.textContent = currentRadius;
  if (img.src) {
    drawImageRounded();
  }
});

// Upload
upload.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    handleFile(file);
  }
});

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    showNotification("selecione apenas arquivos de imagem", "error");
    return;
  }

  // Show loading state
  uploadArea.innerHTML = `
    <div class="upload-content">
      <div class="upload-icon">⏳</div>
      <span class="upload-text">processando imagem...</span>
      <span class="upload-subtext">aguarde enquanto carregamos sua imagem</span>
    </div>
  `;

  img = new Image();
  img.onload = function () {
    // Reset upload area
    uploadArea.innerHTML = `
      <div class="upload-content">
        <div class="upload-icon">✅</div>
        <span class="upload-text">imagem carregada com sucesso!</span>
        <span class="upload-subtext">ajuste o raio abaixo e clique para trocar de imagem</span>
        <span class="upload-formats">clique para selecionar outra imagem</span>
      </div>
    `;

    controls.style.display = "block";
    previewContainer.style.display = "block";
    download.style.display = "block";

    // Ajustar raio máximo baseado no tamanho da imagem
    const maxRadius = Math.min(img.width, img.height) / 2;
    radiusInput.max = Math.min(maxRadius, 200);

    drawImageRounded();
    showNotification("imagem carregada com sucesso!", "success");
  };

  img.onerror = function () {
    // Reset upload area
    uploadArea.innerHTML = `
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <span class="upload-text">clique aqui ou arraste sua imagem</span>
        <span class="upload-subtext">selecione qualquer imagem do seu dispositivo para começar a arredondar os cantos</span>
        <span class="upload-formats">png • jpg • jpeg • gif • webp</span>
      </div>
    `;
    showNotification("erro ao carregar a imagem", "error");
  };

  img.src = URL.createObjectURL(file);
}

function showNotification(message, type) {
  // Remove existing notification
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function drawImageRounded() {
  canvas.width = img.width;
  canvas.height = img.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const maxRadius = Math.min(canvas.width / 2, canvas.height / 2);
  const radius = Math.min(currentRadius, maxRadius);

  ctx.save();

  // Se o raio for igual ou maior que metade da menor dimensão, criar círculo
  if (radius >= maxRadius) {
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, maxRadius, 0, Math.PI * 2);
    ctx.closePath();
  } else {
    // Criar retângulo com bordas arredondadas
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(canvas.width - radius, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
    ctx.lineTo(canvas.width, canvas.height - radius);
    ctx.quadraticCurveTo(
      canvas.width,
      canvas.height,
      canvas.width - radius,
      canvas.height
    );
    ctx.lineTo(radius, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
  }

  ctx.clip();
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

// Download
download.addEventListener("click", function () {
  try {
    const link = document.createElement("a");
    link.download = "imagem-arredondada.png";
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
    showNotification("download iniciado!", "success");
  } catch (error) {
    showNotification("erro ao fazer download", "error");
  }
});
