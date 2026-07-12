const campoCep = document.getElementById("cep");
const formulario = document.getElementById("formulario-cep");
const elementoStatus = document.getElementById("status");
const carregando = document.getElementById("carregando");
const resultados = document.getElementById("resultados");
const botaoCopiar = document.getElementById("botao-copiar");

const campos = {
  logradouro: document.getElementById("logradouro"),
  bairro: document.getElementById("bairro"),
  cidade: document.getElementById("cidade"),
  estado: document.getElementById("estado"),
};

let ultimoCepConsultado = "";
let temporizadorCopiar = null;

function somenteDigitos(valor) {
  return valor.replace(/\D/g, "");
}

function mascararCep(valor) {
  const digitos = somenteDigitos(valor).slice(0, 8);

  if (digitos.length <= 5) {
    return digitos;
  }

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

function definirStatus(mensagem, tipo) {
  if (!mensagem) {
    elementoStatus.hidden = true;
    elementoStatus.textContent = "";
    elementoStatus.className = "status";
    return;
  }

  elementoStatus.hidden = false;
  elementoStatus.textContent = mensagem;
  elementoStatus.className = `status status--${tipo}`;
}

function definirCarregamento(estaCarregando) {
  campoCep.disabled = estaCarregando;
  carregando.hidden = !estaCarregando;

  if (estaCarregando) {
    definirStatus("Carregando...", "carregando");
  }
}

function limparResultados() {
  campos.logradouro.textContent = "—";
  campos.bairro.textContent = "—";
  campos.cidade.textContent = "—";
  campos.estado.textContent = "—";
  resultados.hidden = true;
  botaoCopiar.classList.remove("esta-copiado");
  botaoCopiar.textContent = "Copiar Endereço Completo";
}

function preencherResultados(dados) {
  campos.logradouro.textContent = dados.logradouro || "Não informado";
  campos.bairro.textContent = dados.bairro || "Não informado";
  campos.cidade.textContent = dados.localidade || "Não informado";
  campos.estado.textContent = dados.uf || "Não informado";
  resultados.hidden = false;
}

function formatarEnderecoCompleto(dados) {
  const logradouro = dados.logradouro || "Logradouro não informado";
  const bairro = dados.bairro || "Bairro não informado";
  const cidade = dados.localidade || "Cidade não informada";
  const estado = dados.uf || "UF";
  const cep = mascararCep(dados.cep || "");

  return `${logradouro}, ${bairro} — ${cidade}/${estado}${cep ? ` — CEP ${cep}` : ""}`;
}

async function buscarEndereco(digitosCep) {
  const resposta = await fetch(`https://viacep.com.br/ws/${digitosCep}/json/`);

  if (!resposta.ok) {
    throw new Error("ERRO_HTTP");
  }

  return resposta.json();
}

async function consultarCep(digitosCep) {
  if (digitosCep === ultimoCepConsultado) {
    return;
  }

  ultimoCepConsultado = digitosCep;
  limparResultados();
  definirCarregamento(true);

  try {
    const dados = await buscarEndereco(digitosCep);

    if (dados.erro) {
      definirStatus(
        "CEP não encontrado. Verifique o número e tente novamente.",
        "vazio"
      );
      return;
    }

    preencherResultados(dados);
    definirStatus("Endereço encontrado com sucesso.", "sucesso");
    resultados.dataset.enderecoCompleto = formatarEnderecoCompleto(dados);
  } catch (erro) {
    ultimoCepConsultado = "";

    if (!navigator.onLine || erro instanceof TypeError) {
      definirStatus(
        "Falha de conexão. Verifique sua internet e tente novamente.",
        "erro"
      );
      return;
    }

    definirStatus(
      "Não foi possível consultar o CEP no momento. Tente novamente.",
      "erro"
    );
  } finally {
    definirCarregamento(false);
  }
}

campoCep.addEventListener("input", (evento) => {
  const valorMascarado = mascararCep(evento.target.value);
  evento.target.value = valorMascarado;

  const digitos = somenteDigitos(valorMascarado);

  if (digitos.length < 8) {
    ultimoCepConsultado = "";
    limparResultados();
    definirStatus("", "");
    return;
  }

  consultarCep(digitos);
});

campoCep.addEventListener("paste", (evento) => {
  evento.preventDefault();
  const textoColado = (evento.clipboardData || window.clipboardData).getData("text");
  const valorMascarado = mascararCep(textoColado);
  campoCep.value = valorMascarado;

  const digitos = somenteDigitos(valorMascarado);
  if (digitos.length === 8) {
    consultarCep(digitos);
  }
});

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const digitos = somenteDigitos(campoCep.value);

  if (digitos.length !== 8) {
    limparResultados();
    definirStatus(
      "Informe um CEP válido com 8 dígitos no formato 00000-000.",
      "erro"
    );
    return;
  }

  consultarCep(digitos);
});

botaoCopiar.addEventListener("click", async () => {
  const endereco = resultados.dataset.enderecoCompleto;

  if (!endereco) {
    definirStatus("Não há endereço para copiar.", "erro");
    return;
  }

  try {
    await navigator.clipboard.writeText(endereco);
    botaoCopiar.classList.add("esta-copiado");
    botaoCopiar.textContent = "Endereço copiado!";
    definirStatus(
      "Endereço completo copiado para a área de transferência.",
      "sucesso"
    );

    clearTimeout(temporizadorCopiar);
    temporizadorCopiar = setTimeout(() => {
      botaoCopiar.classList.remove("esta-copiado");
      botaoCopiar.textContent = "Copiar Endereço Completo";
    }, 2000);
  } catch {
    definirStatus(
      "Não foi possível copiar. Verifique as permissões do navegador.",
      "erro"
    );
  }
});
