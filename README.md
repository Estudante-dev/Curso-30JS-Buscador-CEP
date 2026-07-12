# Curso-30JS-Buscador-CEP

Projeto **Buscador de CEP** do [#30ProjetosJavaScript](https://github.com/) — aplicação em HTML5, CSS3 e JavaScript Vanilla para consultar endereços brasileiros pelo CEP.

## Como usar

Abra o arquivo `index.html` no navegador (duplo clique ou via servidor local).

```bash
# opcional: servidor local
npx serve .
```

1. Digite o CEP no campo (apenas números; a máscara `00000-000` é aplicada automaticamente).
2. Ao completar 8 dígitos, a busca na [ViaCEP](https://viacep.com.br/) acontece sozinha.
3. Confira logradouro, bairro, cidade e estado.
4. Use **Copiar Endereço Completo** para enviar o endereço formatado à área de transferência.

## Funcionalidades

- Máscara dinâmica com regex (bloqueia letras e caracteres especiais)
- Busca automática ao completar o CEP
- Requisição assíncrona com `fetch` + `async/await`
- Estados de carregamento (spinner + campo desabilitado)
- Mensagens para CEP inválido, CEP inexistente e falha de conexão
- Botão de cópia com Clipboard API

## Estrutura

```
├── index.html
├── css/style.css
└── js/script.js
```
