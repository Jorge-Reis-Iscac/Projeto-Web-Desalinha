// Página de personalização. O formulário não envia dados para um servidor.
const form = document.querySelector('#custom-form');
const fileInput = document.querySelector('#reference-image');
const statusText = document.querySelector('#file-status');
const previewBox = document.querySelector('#uploaded-preview');
const previewImage = document.querySelector('#uploaded-image');
const colorInput = document.querySelector('#custom-color');
const hexLabel = document.querySelector('#color-hex');
const selectedColorsView = document.querySelector('#selected-colors');
const colorError = document.querySelector('#color-error');
const additionalColors = new Set();
const message = document.querySelector('#form-message');
let imageURL = null;

function clearImage() {
  if (imageURL) URL.revokeObjectURL(imageURL);
  imageURL = null;
  fileInput.value = '';
  previewImage.removeAttribute('src');
  previewBox.hidden = true;
  statusText.textContent = 'Ainda não escolheste nenhuma imagem.';
}
function selectedColors() {
  return [...additionalColors].map(hex => ({name:hex, hex}));
}
function updateColor() {
  hexLabel.textContent = colorInput.value.toUpperCase();
  const colors = selectedColors();
  selectedColorsView.replaceChildren();
  if (!colors.length) {
    const empty = document.createElement('span');
    empty.className = 'help-text';
    empty.textContent = 'Ainda não escolheste cores.';
    selectedColorsView.append(empty);
  } else {
    for (const color of colors) {
      const item = document.createElement('span');
      item.className = 'selected-color-chip';
      const dot = document.createElement('span');
      dot.className = 'color-dot';
      dot.style.setProperty('--swatch', color.hex);
      dot.setAttribute('aria-hidden','true');
      const label = document.createElement('span');
      label.textContent = color.hex;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-color';
      remove.dataset.removeColor = color.hex;
      remove.setAttribute('aria-label', `Remover cor ${color.hex}`);
      remove.textContent = '×';
      item.append(dot,label,remove);
      selectedColorsView.append(item);
    }
  }
  colorError.hidden = colors.length > 0;
}
fileInput.addEventListener('change', () => {
  clearPreviewOnly();
  const file = fileInput.files[0];
  if (!file) { statusText.textContent='Ainda não escolheste nenhuma imagem.'; return; }
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
    statusText.textContent='Formato não suportado. Escolhe JPG, PNG ou WEBP.';
    fileInput.value=''; return;
  }
  if (file.size > 5 * 1024 * 1024) {
    statusText.textContent='A imagem é demasiado grande. O máximo é 5 MB.';
    fileInput.value=''; return;
  }
  imageURL = URL.createObjectURL(file);
  previewImage.src = imageURL;
  previewBox.hidden = false;
  statusText.textContent = `Imagem escolhida: ${file.name}`;
});
function clearPreviewOnly() {
  if (imageURL) URL.revokeObjectURL(imageURL);
  imageURL = null;
  previewImage.removeAttribute('src');
  previewBox.hidden = true;
}
document.querySelector('#remove-image').addEventListener('click', clearImage);
colorInput.addEventListener('input', () => { hexLabel.textContent = colorInput.value.toUpperCase(); });
document.querySelector('#add-custom-color').addEventListener('click', () => {
  additionalColors.add(colorInput.value.toUpperCase());
  updateColor();
});
selectedColorsView.addEventListener('click', event => {
  const button = event.target.closest('[data-remove-color]');
  if (!button) return;
  additionalColors.delete(button.dataset.removeColor);
  updateColor();
});
form.addEventListener('reset', () => {
  clearImage();
  additionalColors.clear();
  message.hidden=true;
  requestAnimationFrame(updateColor);
});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  if (!selectedColors().length) { colorError.hidden=false; document.querySelector('#custom-color').scrollIntoView({behavior:'smooth',block:'center'}); return; }
  const category = document.querySelector('#category').value;
  const piece = document.querySelector('#product-name').value.trim();
  const colors = selectedColors().map(color => color.name).join(', ');
  const details = document.querySelector('#details').value.trim() || 'Sem detalhes adicionais';
  const name = document.querySelector('#contact-name').value.trim() || 'Não indicado';
  const hasImage = !!fileInput.files[0];
  const body = `Olá Desalinha!\n\nGostaria de pedir uma peça personalizada.\n\nCategoria: ${category}\nPeça: ${piece}\nCores: ${colors}\nDetalhes: ${details}\nNome: ${name}\nImagem de referência: ${hasImage ? 'Sim — vou anexar a fotografia manualmente.' : 'Não'}\n\nAguardo confirmação de disponibilidade e orçamento. Obrigada!`;
  const subject = `Pedido de personalização - ${category}`;
  const mailto = `mailto:ola@exemplo.pt?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

});
document.querySelector('#year').textContent = new Date().getFullYear();
updateColor();
