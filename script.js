// Dicionários de Caracteres
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Elementos do DOM
const passwordDisplay = document.getElementById('passwordDisplay');
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');
const includeUppercase = document.getElementById('includeUppercase');
const includeLowercase = document.getElementById('includeLowercase');
const includeNumbers = document.getElementById('includeNumbers');
const includeSymbols = document.getElementById('includeSymbols');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const copyBtn = document.getElementById('copyBtn');
const regenerateBtn = document.getElementById('regenerateBtn');

// Função de Geração Aleatória Segura usando Window.crypto
function getRandomInt(max) {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

// Gera a Senha
function generatePassword() {
  const length = parseInt(lengthSlider.value, 10);
  let availableChars = '';
  let requiredChars = [];

  // Monta os caracteres disponíveis com base nos checkboxes
  if (includeUppercase.checked) {
    availableChars += CHAR_SETS.uppercase;
    requiredChars.push(CHAR_SETS.uppercase[getRandomInt(CHAR_SETS.uppercase.length)]);
  }
  if (includeLowercase.checked) {
    availableChars += CHAR_SETS.lowercase;
    requiredChars.push(CHAR_SETS.lowercase[getRandomInt(CHAR_SETS.lowercase.length)]);
  }
  if (includeNumbers.checked) {
    availableChars += CHAR_SETS.numbers;
    requiredChars.push(CHAR_SETS.numbers[getRandomInt(CHAR_SETS.numbers.length)]);
  }
  if (includeSymbols.checked) {
    availableChars += CHAR_SETS.symbols;
    requiredChars.push(CHAR_SETS.symbols[getRandomInt(CHAR_SETS.symbols.length)]);
  }

  // Validação: Caso nenhuma opção esteja selecionada
  if (availableChars === '') {
    passwordDisplay.value = '';
    updateStrengthIndicator(0);
    return;
  }

  let generatedPassword = [...requiredChars];

  // Preenche o restante do comprimento
  for (let i = requiredChars.length; i < length; i++) {
    const randomIndex = getRandomInt(availableChars.length);
    generatedPassword.push(availableChars[randomIndex]);
  }

  // Embaralha os caracteres da senha para evitar padrões fixos no início
  generatedPassword = shuffleArray(generatedPassword).join('');

  passwordDisplay.value = generatedPassword;
  evaluateStrength(generatedPassword, length);
}

// Embaralhamento (Algorithm: Fisher-Yates seguro)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Calcula e atualiza a força da senha
function evaluateStrength(password, length) {
  let score = 0;

  if (!password) {
    updateStrengthIndicator(0);
    return;
  }

  // Avaliação baseada no tamanho e diversidade
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;

  let typesCount = 0;
  if (/[A-Z]/.test(password)) typesCount++;
  if (/[a-z]/.test(password)) typesCount++;
  if (/[0-9]/.test(password)) typesCount++;
  if (/[^A-Za-z0-9]/.test(password)) typesCount++;

  score += typesCount;

  // Normalização para um indicador de 1 a 4
  let finalScore = 1;
  if (score >= 6) finalScore = 4;      // Muito Forte
  else if (score >= 4) finalScore = 3; // Forte
  else if (score >= 3) finalScore = 2; // Média
  else finalScore = 1;                 // Fraca

  updateStrengthIndicator(finalScore);
}

// Atualiza a barra e o texto do indicador visual de força
function updateStrengthIndicator(score) {
  const configs = {
    0: { width: '0%', color: 'transparent', text: '-' },
    1: { width: '25%', color: 'var(--strength-weak)', text: 'Fraca' },
    2: { width: '50%', color: 'var(--strength-medium)', text: 'Média' },
    3: { width: '75%', color: 'var(--strength-strong)', text: 'Forte' },
    4: { width: '100%', color: 'var(--strength-very-strong)', text: 'Muito Forte' }
  };

  const current = configs[score];
  strengthBar.style.width = current.width;
  strengthBar.style.backgroundColor = current.color;
  strengthText.textContent = current.text;
  strengthText.style.color = current.color !== 'transparent' ? current.color : 'inherit';
}

// Copiar para a Área de Transferência
async function copyToClipboard() {
  const password = passwordDisplay.value;
  if (!password) return;

  try {
    await navigator.clipboard.writeText(password);
    
    // Feedback visual temporário
    copyBtn.textContent = 'Copiado!';
    copyBtn.style.backgroundColor = 'var(--strength-strong)';

    setTimeout(() => {
      copyBtn.textContent = 'Copiar';
      copyBtn.style.backgroundColor = 'var(--primary-color)';
    }, 2000);
  } catch (err) {
    console.error('Falha ao copiar senha: ', err);
  }
}

// Event Listeners
lengthSlider.addEventListener('input', (e) => {
  lengthValue.textContent = e.target.value;
  generatePassword();
});

[includeUppercase, includeLowercase, includeNumbers, includeSymbols].forEach(checkbox => {
  checkbox.addEventListener('change', generatePassword);
});

regenerateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyToClipboard);

// Inicialização automática ao carregar a página
document.addEventListener('DOMContentLoaded', generatePassword);