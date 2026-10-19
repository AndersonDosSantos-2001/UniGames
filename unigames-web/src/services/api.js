const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function tratarResposta(response) {
  if (response.status === 204) {
    return null;
  }

  const dados = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(dados.erro || 'Ocorreu um erro na comunicação com o servidor.');
  }

  return dados;
}


export async function listarJogos(filtros = {}) {
  const params = new URLSearchParams();

  if (filtros.nome) params.append('nome', filtros.nome);
  if (filtros.anoLancamento) params.append('anoLancamento', filtros.anoLancamento);
  if (filtros.generoId) params.append('generoId', filtros.generoId);
  if (filtros.desenvolvedoraId) params.append('desenvolvedoraId', filtros.desenvolvedoraId);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/jogos${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  return tratarResposta(response);
}


export async function buscarJogoPorId(id) {
  const response = await fetch(`${API_BASE_URL}/jogos/${id}`);
  return tratarResposta(response);
}


export async function cadastrarJogo(dadosJogo) {
  const formData = new FormData();
  formData.append('nome', dadosJogo.nome);
  formData.append('descricao', dadosJogo.descricao);
  formData.append('anoLancamento', dadosJogo.anoLancamento);
  formData.append('preco', dadosJogo.preco);
  formData.append('desenvolvedoraId', dadosJogo.desenvolvedoraId);
  formData.append('generos', JSON.stringify(dadosJogo.generos || []));

  if (dadosJogo.imagem instanceof File) {
    formData.append('imagem', dadosJogo.imagem);
  }

  const response = await fetch(`${API_BASE_URL}/jogos`, {
    method: 'POST',
    body: formData,
  });

  return tratarResposta(response);
}


export async function atualizarJogo(id, dadosJogo) {
  const formData = new FormData();
  formData.append('nome', dadosJogo.nome);
  formData.append('descricao', dadosJogo.descricao);
  formData.append('anoLancamento', dadosJogo.anoLancamento);
  formData.append('preco', dadosJogo.preco);
  formData.append('desenvolvedoraId', dadosJogo.desenvolvedoraId);
  formData.append('generos', JSON.stringify(dadosJogo.generos || []));

  if (dadosJogo.imagem instanceof File) {
    formData.append('imagem', dadosJogo.imagem);
  }

  const response = await fetch(`${API_BASE_URL}/jogos/${id}`, {
    method: 'PUT',
    body: formData,
  });

  return tratarResposta(response);
}


export async function deletarJogo(id) {
  const response = await fetch(`${API_BASE_URL}/jogos/${id}`, {
    method: 'DELETE',
  });

  return tratarResposta(response);
}


export async function listarDesenvolvedoras() {
  const response = await fetch(`${API_BASE_URL}/desenvolvedoras`);
  return tratarResposta(response);
}


export async function cadastrarDesenvolvedora(nome) {
  const response = await fetch(`${API_BASE_URL}/desenvolvedoras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });

  return tratarResposta(response);
}


export async function atualizarDesenvolvedora(id, nome) {
  const response = await fetch(`${API_BASE_URL}/desenvolvedoras/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });

  return tratarResposta(response);
}


export async function deletarDesenvolvedora(id) {
  const response = await fetch(`${API_BASE_URL}/desenvolvedoras/${id}`, {
    method: 'DELETE',
  });

  return tratarResposta(response);
}


export async function listarGeneros() {
  const response = await fetch(`${API_BASE_URL}/generos`);
  return tratarResposta(response);
}


export async function cadastrarGenero(nome) {
  const response = await fetch(`${API_BASE_URL}/generos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });

  return tratarResposta(response);
}


export async function atualizarGenero(id, nome) {
  const response = await fetch(`${API_BASE_URL}/generos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });

  return tratarResposta(response);
}


export async function deletarGenero(id) {
  const response = await fetch(`${API_BASE_URL}/generos/${id}`, {
    method: 'DELETE',
  });

  return tratarResposta(response);
}
