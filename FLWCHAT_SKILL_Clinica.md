# FLWCHAT_SKILL — Documentação Completa da API flw.chat

> Contexto completo para uso no Claude Code.
> Base URL: `https://api.flwchat.com.br`

---

## Índice de Endpoints

- [autenticação](#autenticação)
- [paginação](#paginação)
- [rate-limiting](#rate-limiting)
- [login-integrado](#login-integrado)
- [webhooks-1](#webhooks-1)
- [webhook-no-chatbot](#webhook-no-chatbot)
- [rastreio-de-campanha-utm](#rastreio-de-campanha-utm)
- [informações-para-firewall](#informações-para-firewall)
- [1-criar-um-assistente-1](#1-criar-um-assistente-1)
- [2-criar-o-loop-no-chatbot](#2-criar-o-loop-no-chatbot)
- [3-como-ler-e-responder-textos](#3-como-ler-e-responder-textos)
- [4-como-processar-áudios](#4-como-processar-áudios)
- [5-como-processar-imagens](#5-como-processar-imagens)
- [criar-token-para-integração](#criar-token-para-integração)
- [make](#make)
- [n8n](#n8n)
- [get_v2-file](#get_v2-file)
- [post_v2-file](#post_v2-file)
- [get_v1-custom-field](#get_v1-custom-field)
- [get_v1-portfolio](#get_v1-portfolio)
- [get_v1-portfolio-id-contact](#get_v1-portfolio-id-contact)
- [post_v1-portfolio-id-contact](#post_v1-portfolio-id-contact)
- [delete_v1-portfolio-id-contact](#delete_v1-portfolio-id-contact)
- [post_v1-portfolio-id-contact-batch](#post_v1-portfolio-id-contact-batch)
- [delete_v1-portfolio-id-contact-batch](#delete_v1-portfolio-id-contact-batch)
- [get_v1-contact](#get_v1-contact)
- [post_v1-contact](#post_v1-contact)
- [post_v1-contact-filter](#post_v1-contact-filter)
- [get_v1-contact-phonenumber-phone](#get_v1-contact-phonenumber-phone)
- [put_v1-contact-phonenumber-phone](#put_v1-contact-phonenumber-phone)
- [get_v1-contact-id](#get_v1-contact-id)
- [put_v2-contact-id](#put_v2-contact-id)
- [post_v1-contact-phonenumber-phone-tags](#post_v1-contact-phonenumber-phone-tags)
- [post_v1-contact-id-tags](#post_v1-contact-id-tags)
- [post_v2-contact-batch](#post_v2-contact-batch)
- [get_v1-contact-custom-field](#get_v1-contact-custom-field)
- [post_v1-department](#post_v1-department)
- [get_v2-department](#get_v2-department)
- [get_v1-department-id](#get_v1-department-id)
- [put_v1-department-id](#put_v1-department-id)
- [delete_v1-department-id](#delete_v1-department-id)
- [put_v1-department-id-agents](#put_v1-department-id-agents)
- [get_v1-department-id-channel](#get_v1-department-id-channel)
- [get_v1-tag](#get_v1-tag)
- [get_v1-company-officehours](#get_v1-company-officehours)
- [get_v1-agent](#get_v1-agent)
- [post_v1-agent](#post_v1-agent)
- [get_v1-agent-id](#get_v1-agent-id)
- [put_v1-agent-id](#put_v1-agent-id)
- [delete_v1-agent-id](#delete_v1-agent-id)
- [post_v1-agent-id-departments](#post_v1-agent-id-departments)
- [post_v1-agent-id-status](#post_v1-agent-id-status)
- [post_v1-agent-id-logout](#post_v1-agent-id-logout)
- [get_v1-webhook-event](#get_v1-webhook-event)
- [get_v1-webhook-subscription](#get_v1-webhook-subscription)
- [post_v1-webhook-subscription](#post_v1-webhook-subscription)
- [get_v1-webhook-subscription-subscriptionid](#get_v1-webhook-subscription-subscriptionid)
- [put_v1-webhook-subscription-subscriptionid](#put_v1-webhook-subscription-subscriptionid)
- [delete_v1-webhook-subscription-subscriptionid](#delete_v1-webhook-subscription-subscriptionid)
- [get_v1-channel](#get_v1-channel)
- [get_v1-chatbot](#get_v1-chatbot)
- [post_v1-chatbot-send](#post_v1-chatbot-send)
- [get_v2-session](#get_v2-session)
- [get_v2-session-id](#get_v2-session-id)
- [put_v1-session-id-transfer](#put_v1-session-id-transfer)
- [put_v1-session-id-assignee](#put_v1-session-id-assignee)
- [put_v1-session-id-complete](#put_v1-session-id-complete)
- [put_v1-session-id-status](#put_v1-session-id-status)
- [put_v2-session-id-partial](#put_v2-session-id-partial)
- [get_v1-session-id-message](#get_v1-session-id-message)
- [post_v1-session-id-message](#post_v1-session-id-message)
- [post_v1-session-id-message-sync](#post_v1-session-id-message-sync)
- [post_v1-session-id-note](#post_v1-session-id-note)
- [get_v1-session-id-note](#get_v1-session-id-note)
- [get_v1-session-note-id](#get_v1-session-note-id)
- [delete_v1-session-note-id](#delete_v1-session-note-id)
- [post_v1-message-send](#post_v1-message-send)
- [post_v1-message-send-sync](#post_v1-message-send-sync)
- [get_v1-message-id](#get_v1-message-id)
- [get_v1-message-id-status](#get_v1-message-id-status)
- [delete_v1-message-id](#delete_v1-message-id)
- [get_v1-message](#get_v1-message)
- [get_v1-scheduled-message](#get_v1-scheduled-message)
- [post_v1-scheduled-message](#post_v1-scheduled-message)
- [get_v1-scheduled-message-id](#get_v1-scheduled-message-id)
- [put_v1-scheduled-message-id](#put_v1-scheduled-message-id)
- [post_v1-scheduled-message-id-cancel](#post_v1-scheduled-message-id-cancel)
- [post_v1-scheduled-message-batch-cancel](#post_v1-scheduled-message-batch-cancel)
- [get_v1-template](#get_v1-template)
- [post_v1-template-otp-send](#post_v1-template-otp-send)
- [get_v1-template-otp-messageid-status](#get_v1-template-otp-messageid-status)
- [get_v1-sequence](#get_v1-sequence)
- [get_v2-sequence-id-contact](#get_v2-sequence-id-contact)
- [post_v1-sequence-id-contact](#post_v1-sequence-id-contact)
- [delete_v1-sequence-id-contact](#delete_v1-sequence-id-contact)
- [post_v1-sequence-id-contact-batch](#post_v1-sequence-id-contact-batch)
- [delete_v1-sequence-id-contact-batch](#delete_v1-sequence-id-contact-batch)
- [get_v1-panel-card](#get_v1-panel-card)
- [post_v1-panel-card](#post_v1-panel-card)
- [get_v1-panel-card-id](#get_v1-panel-card-id)
- [put_v2-panel-card-id](#put_v2-panel-card-id)
- [post_v1-panel-card-id-duplicate](#post_v1-panel-card-id-duplicate)
- [get_v1-panel-card-cardid-note](#get_v1-panel-card-cardid-note)
- [post_v1-panel-card-cardid-note](#post_v1-panel-card-cardid-note)
- [delete_v1-panel-card-cardid-note-noteid](#delete_v1-panel-card-cardid-note-noteid)
- [get_v1-panel](#get_v1-panel)
- [get_v1-panel-id](#get_v1-panel-id)
- [get_v1-panel-id-custom-fields](#get_v1-panel-id-custom-fields)

---


---

## autenticação

**URL:** `https://flwchat.readme.io/reference/autenticação`

Para uso da API deverá ser gerado um token permanente através da plataforma web.

O token pode ser gerado acessando a página de integrações `Ajustes > Integrações > Integração via API`).

Após gerar o token, informe-o nos `Headers` de cada requisição, utilizando a chave `Authorization` e o schema `Bearer`.

Exemplo: `Authorization: Bearer pn_0000000000000000000000`.

---

Você também pode realizar requisições diretamente a partir desta documentação. Para isso, bastar informar o token no campo adequado, assim como no exemplo abaixo:

Updated about 2 years ago

---


---

## paginação

**URL:** `https://flwchat.readme.io/reference/paginação`

### Requisição

Vários endpoints de listagem de entidades possuem paginação, que é controlada através dos seguintes atributos `pageNumber` e `pageSize`, enviados no corpo da requisição.

JSON

```
{
  "pageNumber": 1,
  "pageSize": 50,
  ...
}
```

Sendo:

- `pageNumber`: indica qual página deseja obter;
- `pageSize`: indica o tamanho desta página, ou seja, quantos itens serão retornados, sendo possível no máximo 100.

Observe que ao alterar o `pageSize` em requisições subsequentes, o `pageNumber` retornará resultados diferentes. Portanto, é importante manter um `pageSize` constante enquanto se itera sobre o `pageNumber`.

---

### Resposta

Os resultados retornados nos endpoints paginados possuem a seguinte estrutura:

JSON

```
{
  "pageNumber": 1,
  "pageSize": 50,
  "totalPages": 5,
  "totalItems": 250,
  "hasMorePages": true,
  "items:" [{...}],
  ...
}
```

Sendo:

- `pageNumber`: indica qual página foi obtida;
- `pageSize`: indica o tamanho da página obtida;
- `totalPages`: total de páginas existentes para a consulta atual;
- `totalItems`: total de itens existentes para a consulta atual;
- `hasMorePages`: indica se há mais páginas a serem consultadas, ou seja, se `pageNumber` é menor que `totalPages`;
- `items`: array de entidades retornadas, cujo tamanho será menor ou igual a `pageSize`.

Updated about 2 years ago

---


---

## rate-limiting

**URL:** `https://flwchat.readme.io/reference/rate-limiting`

Para garantir a estabilidade, segurança e desempenho da API, aplicamos limites de requisições. Eles funcionam em duas camadas complementares:

1. **Limite principal (uso contínuo)**
   Você pode realizar até **`1.000` requisições a cada `5` minutos**, o que equivale a uma média aproximada de `3` requisições por segundo.
   Esse limite controla o uso regular da API ao longo do tempo.
2. **Limite de proteção contra picos (burst limit)**
   Além do limite principal, existe um limite adicional de segurança: **`200` requisições a cada `5` segundos.**
   Esse mecanismo evita picos repentinos de chamadas que poderiam impactar a saúde e a estabilidade da aplicação, mesmo que o limite principal ainda não tenha sido atingido.

**Comportamento em caso de excesso**

Requisições que ultrapassarem qualquer um desses limites receberão como resposta o status `429 – Too Many Requests`, você deve esperar para que o limite seja reestabelecido para voltar a disparar mensagem.

> ## 📘 Escopo
>
> Os limites citados acima são aplicados por conta



## Dicas para evitar atingir o limite

Algumas boas práticas ajudam a manter sua integração estável e evitam respostas `429 – Too Many Requests`.

- **Evite loops sem controle**
  Laços que disparam requisições em sequência (especialmente for ou while) devem sempre ter algum tipo de atraso ou controle de volume.
- **Implemente retry com espera (backoff)**
  Se receber um 429, aguarde alguns segundos antes de tentar novamente. Repetir imediatamente tende a piorar o problema.
- **Distribua as chamadas ao longo do tempo**
  Em vez de disparar muitas requisições de uma vez, espalhe-as de forma uniforme para manter uma média estável.

## Dicas específicas para quem usa n8n\*\*

O n8n é poderoso, mas pode gerar picos de requisições sem perceber. Algumas configurações ajudam bastante:

- **Use o node Wait**
  Após chamadas em massa ou dentro de loops, utilize o node Wait para inserir um atraso entre as execuções.
  Mesmo um intervalo pequeno (ex: 500 ms) já reduz drasticamente o risco de atingir o limite.
- **Controle a concorrência**
  Ao usar nodes como HTTP Request e Split In Batches, evite executar muitos itens em paralelo. Prefira processar em lotes menores e sequenciais.
- **Configure corretamente o Split In Batches**
  Use tamanhos de lote menores (ex: 10 ou 20 itens).
  Combine com o node Wait entre os lotes para suavizar o volume de chamadas.
- **Trate o erro 429 explicitamente**
  Configure o fluxo para:
  -Detectar o erro 429
  -Aguardar alguns segundos
  -Repetir a requisição automaticamente
  -Isso evita falhas no workflow e respeita os limites da API.

Updated 2 months ago

---


---

## login-integrado

**URL:** `https://flwchat.readme.io/reference/login-integrado`

Para integrar o login, você deve criar um token permanente em Ajustes > Integração > Integração via API;
Com esse token permanente, você deve enviar uma requisição com e-mail ou telefone do usuário que deseja autenticar via POST;

Passe o token permanente no cabeçalho da requisição usando Auth Bearer como tipo de autenticação;

> ## 🚧 Nunca faça essa requisição no seu front-end, ela deve ser feita via backend para preservar a segurança dos seus dados.

**Authorization:** Bearer pn\_000x000x000x000x000x000x000x00
**POST:** [<https://api.flw.chat/auth/v1/login/authenticate/external>](https://api.flw.chat/auth/v1/login/authenticate/external)

**Requisição (exemplo)**

JavaScript

```
{
 "phoneNumber": "5531999999999",
 "email": "[email protected]"
}
```

**Resposta (exemplo)**

JavaScript

```
{
 "userId": "99ad412d-0a0d-4c2f-aaee-a07b1",
 "accessToken": "eyJhbGciOiJIUz5IsInR5cCI6IkpXVCJ9",
 "expiresIn": "2023-01-01T09:48:10Z",
 "refreshToken": "rf_qUYCL67n7k3PuNorO9qA9g509Q7uQ",
 "tenantId": "7798b5de-0cc2-b456-47b454ee6e14",
 "urlRedirect": "https://xyz.flw.chat/auth/sign-in?transfer-login=true&defaultTenantId=7798b5de-0cc2-b456-47b454ee6e14&refresh-token=rf_qUYCL67n7k3PuNorO9qA9g509Q7uQ"
}
```

Com a resposta, você poderá usar o campo **urlRedirect** para direcionar seu usuário, assim ele iniciará a sessão já autenticado.

Updated 6 months ago

---


---

## webhooks-1

**URL:** `https://flwchat.readme.io/reference/webhooks-1`

O envio de eventos por webhook é um mecanismo para notificar o seu sistema quando uma variedade de interações ou eventos acontecem, incluindo quando uma pessoa envia uma mensagem ou um contato é alterado.

---

### Configuração

É possível realizar a configuração através da plataforma (acessando `Ajustes > Integrações > Webhooks` ).

Ao criar uma nova assinatura, você deverá selecionar os eventos/tópicos que deseja assinar e informar uma URL válida. A plataforma enviará requisições HTTP utilizando o método `POST` para a URL informada, que deverá estar preparada e disponível publicamente para receber os eventos.

É possível pausar temporariamente o recebimento de webhooks, modificando os status da assinatura para inativo.

### Ciclo de vida de uma conversa

![](https://files.readme.io/7a99955-Captura_de_Tela_2023-10-25_as_18.39.39.png)

---

### Estrutura

As mensagens de webhook enviadas possuirão o corpo no formato `application/json` e a seguinte estrutura:

JSON

```
{
    "eventType": "NOME_DO_EVENTO",
    "date": "DATA_DE_ENVIO",
    "content": { ... }
}
```

Sendo:

- `eventType`: o nome do evento/tópico, sendo os valores possíveis listados [abaixo](#eventos);
- `date`: data e hora de geração do evento, seguindo o formato `YYYY-MM-DDTHH:mm:ss`;
- `content`: conteúdo do evento.

Veja abaixo um exemplo de webhook de alteração de contato:

JSON

```
{
    "eventType": "CONTACT_UPDATE",
    "date": "2023-08-23T16:42:35.4359934Z",
    "content": {
        "id": "ed2b52f8-cf13-449b-b3d5-ae27051f4663",
        "createdAt": "2022-10-28T21:24:26.158391Z",
        "updatedAt": "2023-08-23T16:15:35.3814324Z",
        "companyId": "626fb5de-0cc2-4209-b456-47b454ee6e14",
        "name": "John Raymond Legrasse",
        "phonenumber": "+55|00000000000",
        "phonenumberFormatted": "(00) 00000-0000",
        "email": "[email protected]",
        "instagram": null,
        "annotation": "",
        "tagsId": [],
        "tags": [],
        "status": "ACTIVE",
        "origin": "CREATED_FROM_HUB",
        "utm": null,
        "customFieldValues": {},
        "metadata": null
    }
}
```

Updated about 2 years ago

---


---

## webhook-no-chatbot

**URL:** `https://flwchat.readme.io/reference/webhook-no-chatbot`

Durante o atendimento pelo Chatbot, o sistema poderá disparar webhooks para buscar mais informações, dados e criar fluxos alternativos para uma melhor experiência dos clientes.

![](https://files.readme.io/ef08e9d-Captura_de_Tela_2024-01-23_as_14.57.27.png)

O webhook no chatbot tem uma mensagens de input e output padrões, você define a URL e recebe a mensagem via método `POST`.

**Mensagem de disparo:**
Esta mensagem será enviada pelo chatbot para seu sistema com todos os dados capturados até o momento, os dados do canal de atendimento, dados do contato e as opções de respostas possíveis:

JSON

```
{
    "responseKeys": [
        "CLIENTE_EXISTE",
        "CLIENTE_NAO_EXISTE"
    ],
    "sessionId": "567ca9b8-eaa9-4a33-8cf9-d2c67060af74",
    "session": {
      "id": "567ca9b8-eaa9-4a33-8cf9-d2c67060af74",
      "createdAt": "2024-06-02T12:00:10.38771Z",
      "departmentId": "07deebd3-dede-42d1-9169-75e00efdf088",
      "userId": null,
      "number": "2024062700164",
      "utm": {
        "clid": "asldkjasLKJASLKDJLKJASLDKJASGFui3HT7c7KUdBaB7lOHHxp5CxufCY0GjlvZcDRpsTaRbZMQ",
        "term": null,
        "medium": "REFERRAL",
        "source": "INSTAGRAM",
        "content": "Campanha de Natal Minas Gerais!",
        "campaign": "776107696326",
        "headline": "Converse conosco",
        "referralUrl": "https://www.instagram.com/p/x466u6s5ykjs/"
      }
    },
    "channel": {
        "id": "0a4ca3cd-b9fd-4523-a032-5a343bf7b209",
        "key": "551140037752",
        "platform": "WhatsApp",
        "displayName": "(11) 3000-0000"
    },
    "contact": {
        "id": "f8f43b22-2f20-42f3-be13-65bf90282143",
        "name": "David",
        "phonenumber": "+55|1199999999",
        "display-phonenumber": "(11) 99999-9999",
        "email": "[email protected]",
        "instagram": null,
        "tags": [
            "Lead"
        ],
        "cnpj": "00.000.000/0000-00",
        "metadata": { "cod-ext": "abcd" }
    },
    "questions": {
        "cb-ec36e3fe-qst-c0b0875a": {
            "text": "Qual seu CNPJ?",
            "answer": "00.000.000/0000-00"
        }
    },
    "menus": {
        "cb-ec36e3fe-mn-943b055a": {
            "text": "Qual opção você deseja?",
            "answer": "Comprar"
        }
    },
    "lastMessage": {
      "id": "152d4d13-0b13-49bb-bafc-3923434f204b",
      "createdAt": "2024-06-27T19:09:22.592061Z",
      "type": "IMAGE",
      "text": null,
      "fileId": "aa546fa6-ca68-4a8b-a57d-c031460fae69",
      "file": {
        "publicUrl": "https://cdn.flw.chat/upload/88fb5de-0cc2-4209-b456-47b454ee6e14/IMAGE/c40e85e_20240627190923197_436019626068697.jpg?AWSAccessKeyId=XXXX",
        "extension": ".jpg",
        "mimeType": "image/jpeg",
        "name": "436019626068697.jpg",
        "size": 233541
      }
    }
}
```

**Mensagem de retorno (Simples)**
Seu webhook deverá responder com um código HTTP `200` para seguir no fluxo principal de sucesso, mas você poderá criar fluxos alternativos, assim deverá responder com o código HTTP `200` e uma mensagem conforme abaixo:

JSON

```
{
    "response": "CLIENTE_EXISTE"
}
```

**Mensagem de retorno (Com dados do contato)**
Você poderá atualizar os dados do contato no retorno do webhook, bem como metadados para serem usados em outro momento de integração, como no exemplo abaixo o código do cliente no seu sistema.

JSON

```
{
    "response": "CLIENTE_EXISTE",
    "metadata": {
        "cliente-existe": true
    },
    "contact": {
        "cnpj": "00.000.000/0000-00",
        "metadata": {
            "cod-ext": "abcd"
        }
    }
}
```

**Mensagem de retorno (Com disparo de mensagens)**
Também é possível enviar mensagens ao usuário ao retornar do webhook, você deverá indicar uma lista de mensagens que serão disparadas na ordem enviada;

JSON

```
{
    "response": "CLIENTE_EXISTE",
    "messages": [
        {
            "text": "Segue seu boleto abaixo para pagamento. Vencimento dia 10/01"
        },
        {
            "fileUrl": "https://xyz.com/boleto.pdf"
        },
        {
            "template": {
                "id": "ab78cd_oferta",
                "parameters": {
                    "valor": "R$ 9,99"
                }
            }
        }
    ]
}
```

As mensagens podem incluir texto e/ou arquivo. Além disso, é possível utilizar um modelo de mensagem (template) previamente criado.

As opções de respostas foram separadas para efeitos didáticos, mas podem ser combinadas em uma única mensagem.

---

## Perguntas Dinâmicas

Este recurso permite carregar opções de resposta em tempo real diretamente do seu sistema via Webhook. No momento em que o cliente atinge a etapa correspondente no fluxo, o chatbot realiza a requisição e renderiza as alternativas retornadas.

**Parâmetros do Objeto de Resposta**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `text` | String | Opcional | Texto principal da pergunta. Pode ser omitido se a opção "Definir como mensagem fixa" estiver ativa no nó. |
| `type` | String | **Sim** | Define o formato de exibição. Valores aceitos: `BUTTONS`, `LIST` ou `NUMBERS`. |
| `options` | Array | **Sim** | Lista de objetos contendo as opções para seleção (máximo de 50 itens). |

**Estrutura do Array `options`**

Cada objeto dentro da lista de opções suporta os seguintes campos:

- `text` **(Obrigatório)**: O rótulo ou texto principal da opção exibida ao usuário.
- `description` **(Opcional)**: Subtítulo ou descrição de apoio. Disponível exclusivamente para o tipo `LIST`.
- `url` **(Opcional)**: Link para redirecionamento externo. Disponível exclusivamente para o tipo `BUTTONS`.

**Exemplo de Retorno JSON**

JSON

```
{
  "text": "Como podemos ajudar hoje?",
  "type": "BUTTONS",
  "options": [
    {
      "text": "Área de Cliente",
      "url": "https://empresa.com/cliente"
    },
    {
      "text": "Suporte Técnico"
    }
  ]
}
```

Updated about 1 month ago

---


---

## rastreio-de-campanha-utm

**URL:** `https://flwchat.readme.io/reference/rastreio-de-campanha-utm`

Os padrões UTM são parâmetros adicionados às URLs para ajudar a rastrear a eficácia das campanhas, esses padrões permitem que você identifique de onde os visitantes estão vindo e quais campanhas são mais eficazes.

---

Um exemplo de uma URL com parâmetro UTM

`https://api.flw.chat/chat/v1/channel/wa/[TELEFONE]?text=[MENSAGEM]&utm_source=[SOURCE]&utm_medium=[MEDIUM]&utm_campaign=[CAMPAIGN]`

**Parâmetros**

**[TELFONE]**: Inserir telefone da sua empresa no formato "5511980009999";
**[MENSAGEM]**: Inserir a mensagem que será enviada pelo cliente no WhatsApp. Ex.: Quero saber mais;
**[MEDIUM]**: Meio onde vai ser difundida a campanha independentemente da fonte. Ex.: Stories;
**[SOURCE]**: Plataforma de origem do lead. Ex.: tiktok;
**[CAMPAIGN]** : identifica a campanha. Ex.: PublicoAberto;

---

Assim que a conversa for iniciada, você verá a mensagem abaixo podendo ver a origem do lead.

![](https://files.readme.io/af1af8dd77ea112d7eae8958c87ac01390becb36419f221d0837dcd4a25dc60f-image.png)

Além deste ponto você conseguirá ver na origem do contato e no relatório de indicadores e de atendimentos.




![](https://files.readme.io/7eb194fc3093006500316a099c3b5791324ea982f1dce00ef30ea9c69c0d03de-image.png)

Updated 6 months ago

---


---

## informações-para-firewall

**URL:** `https://flwchat.readme.io/reference/informações-para-firewall`

**Acesso web**
`https://*.flw.chat` e `https://*.wts.chat`

**API**
`https://api.flw.chat` e `https://api.wts.chat`

**Download de arquivos**
`https://cdn.flw.chat` e `https://cdn.wts.chat`

**Upload de arquivos**
`https://wts-storage.s3.sa-east-1.amazonaws.com`

**Conexão websocket web**
`wss://rt-web.flw.chat` e `wss://rt-web.wts.chat`

**Conexão websocket app mobile**
`wss://rt.flw.chat` e `wss://rt.wts.chat`

**IP de chamadas de webhook**
`18.215.79.89`

**Distribuição de conteúdo / arquivos**
`https://ip-ranges.amazonaws.com/ip-ranges.json`
*Utilizamos o serviço `CLOUDFRONT` da AWS para fazer a distribuição de arquivos, para liberação no firewall é necessário adicionar os ranges de ips da AWS*

Updated 5 months ago

---


---

## 1-criar-um-assistente-1

**URL:** `https://flwchat.readme.io/reference/1-criar-um-assistente-1`

Antes de tudo vamos criar nosso assistente IA, configurar o modelo e criar uma chave de API.

## Como criar uma conta na OpenAI

- Acesse o site da OpenAI (<https://platform.openai.com>) no seu navegador.
- Inicie o cadastro: clique no botão "Sign Up" ou "Registrar-se" no canto superior direito da página.
- Preencha suas informações: insira seu endereço de e-mail ou, se preferir, faça login diretamente com uma conta Google ou Microsoft. Em seguida crie uma senha.
- Verificação de e-mail: após fornecer suas informações e criar uma conta, você receberá um e-mail de verificação. Acesse sua caixa de entrada e clique no link de verificação enviado pela OpenAI.
- Preencha seus dados pessoais: pode ser solicitado o fornecimento de informações como seu nome e telefone para verificação.
- Escolha um plano: a OpenAI oferece tanto uma versão gratuita quanto planos pagos com mais recursos. Escolha o que melhor se adequa às suas necessidades.

---

## Como criar um projeto dentro da OpenAI

- Após criar sua conta na OpenAI, será possível acessar o painel onde você poderá criar o seu assistente.
- No painel, clique em "Dashboard".
- Depois, clique em "Assistants".

![](https://files.readme.io/1884fc9cfbadab6cbe9b395cce670fc856b0a0cb618daf59c8470345b496481a-WTS.png)

- Clique em "Create".
- Ao clicar em "Create", será aberta a tela acima onde você poderá dar um nome ao seu assistente no campo "Name".
- No campo "System instruction", você deverá definir como o assistente deve se comportar. Exemplo:

> **Você deve se comportar como um corretor de imóveis. Pergunte ao cliente sobre o tipo de imóvel, localização desejada, número de quartos, banheiros, vagas de garagem e faixa de preço. Responda perguntas frequentes de forma rápida e objetiva. Transfira para o atendimento humano se a informação disponível não for suficiente.**

- Defina o modelo no campo "Model" — recomendamos o gpt-4o-mini por ser um modelo completo e mais rápido que outros.
- Em seguida, é possível definir configurações adicionais como "File search" que permite que o assistente tenha conhecimento dos arquivos que você ou seus usuários carregam. Depois que um arquivo é carregado, o assistente decide automaticamente quando recuperar o conteúdo com base nas solicitações do usuário e, também, o "Code Interpreter" que permite que o assistente escreva e execute códigos.
- Configure o "Response Format" para "Text".
- Deixe os campos "Temperature" e "Top P" default, no futuro ajuste para que a resposta seja mais adequada ao tom que você deseja que o assistente responda.

---

## Como criar uma chave de API

- No menu lateral, clique em "API Keys".
- Na página de "API Keys", clique no botão "Create new secret key", como demonstra a imagem abaixo:

![](https://files.readme.io/43e2c8e270320cec6ab59a1a01942b68fcdcc679b147031f5542879e44a572a1-WTS_3.png)

- Um pop-up aparecerá mostrando sua nova chave de API. **Copie a chave imediatamente**, pois você não poderá visualizá-la novamente.
- Essa chave será usada para autenticar suas solicitações ao utilizar a API da OpenAI.
- Se precisar, você pode revogar ou criar novas chaves a partir dessa mesma tela a qualquer momento.



**Lembre-se de que a chave de API é privada e você não deve compartilhá-la publicamente, pois ela dá acesso à sua conta e aos seus créditos da OpenAI.**

Updated 11 months ago

---


---

## 2-criar-o-loop-no-chatbot

**URL:** `https://flwchat.readme.io/reference/2-criar-o-loop-no-chatbot`

## Como criar o modelo do chatbot

- Dentro da plataforma faça login com o usuário administrador e siga os passos abaixo para criar o modelo do chatbot que será integrado à IA.
- No menu de opções clique em **Apps** > **Chatbot** > **Novo**.
- Dê um nome ao seu chatbot e o associe a um tipo de canal (Z-API ou WhatsApp oficial). Defina a equipe padrão desse chatbot.
- Crie um nó de mensagem receptiva. Exemplo: *Olá, boas-vindas! Como posso ajudar?*
- Em seguida, configure uma ação que aguarde resposta do contato com as opções: **"Limite de espera: Sem limite"** e **"Tolerância: 5 segundos"**.
- Acima do nó de "Aguardar resposta do contato" é necessário criar um ponto de retorno. Atenção: sem este ponto de retorno o loop não irá funcionar.
- Em seguida, é preciso configurar o disparo webhook que enviará as informações do atendimento.
- No campo **URL** copie a URL do webhook que deverá ser criado no N8N e cole no campo "URL". Clique em **"Atualizar"** para salvar as configurações.

  ![](https://files.readme.io/2a68c3db185774771513e3170f7bd6d9f9b88f50a23c066ababadae59bf9f9be-image.png)




---

## Como criar os loops

- Dentro do subfluxo de **"Sucesso"** crie uma ação que redireciona para o ponto de retorno **"GPT"**, como mostra a imagem acima.
- Assim, o loop estará configurado de modo que sempre que o contato enviar uma mensagem a mesma voltará ao ponto de retorno configurado e será disparada via webhook criando o loop.

  ![](https://files.readme.io/1cea14fb4be34843910e0885f9dfb82d2376afb50718f3e6d2f53f1fca4baec3-image.png)



- No subfluxo de **"Falha no envio"** adicione uma mensagem de modo que o contato seja informado que a mensagem dele falhou ou não foi compreendida, logo após adicione outro ponto de retorno **"GPT"**, assim como no fluxo de "Sucesso no envio"

  ![](https://files.readme.io/cda5cd9b183db87645645cf2aaf482e281d973361e593fe392f47b757f0c4dba-image.png)



Após seguir os passos acima, salve seu chatbot, publique e o associe ao canal em que os clientes entrarão em contato e serão respondidos por seu assistente.

Updated about 1 year ago

---


---

## 3-como-ler-e-responder-textos

**URL:** `https://flwchat.readme.io/reference/3-como-ler-e-responder-textos`

**Confira abaixo como ficará a integração após seguir esse tutorial.**

![](https://files.readme.io/cfefb1c37cf1a3dfbb0565c56dc4962574eda264966f4ad202eac5961ce13215-image.png)

> ## 📘 Para baixar o fluxo pronto, o JSON com todos os passos está [nesse link](https://github.com/wtschat/files/blob/main/wts_n8n_response_with_text.json) .
>
> Você poderá criar seu próprio fluxo, para facilitar você pode baixar o nosso fluxo e alterar.

---

# Como fazer

## Montando o escopo da integração

- Crie uma conta no [N8N](https://n8n.io/).
- Clique em "Add workflow".
- Em seguida, clique em "Add first step".
- Selecione o node "On webhook call".
- Altere o método "HTTP" para **"Post"**.

---

## Armazenando variáveis

- Crie um node "Edit Fields".
- Crie uma variável chamada text e armazene nessa variável o valor "lastMessagesAggregated". Veja imagem abaixo

  ![](https://files.readme.io/facbcd30f03b11a64240d77c4287b5960eef156874099cfd664fd92db60b382c-image.png)

---

## Configurando o node do assistente

- Logo após criar o webhook, é preciso criar o node do assistente IA.
- Para isso, clique em "+" digite **"OpenIA"** e selecione **"Message an assistant"**.
- Adicione a credencial que foi criada dentro da plataforma da OpenIA, essa credencial será a chave da API que você criou no passo 3 da etapa [Criando o assistente](https://dash.readme.com/project/helena/v1.0/refs/configura%C3%A7%C3%A3o-do-assistente).
- Nas opções "Resource" e "Operation" deixe ambos default.
- Em "Assistant" selecione o assistente que você criou na etapa [Criando o assistente](https://dash.readme.com/project/helena/v1.0/refs/configura%C3%A7%C3%A3o-do-assistente).
- Em "Prompt" selecione a opção "Define below", no campo "text" passe a variável "text" que gravamos no node anterior "Edit Fields".

  ![](https://files.readme.io/ae767047c740f4d42a51d78e0c20c5976fda75c90c94fbaf99089f7d85fd935a-image.png)



- Em "Memory" defina para "Use memory connector". Será criado um nó abaixo do nome "Window Buffer Memory", nele é preciso passar o ID da sessão (presente no webhook).

> ### Atenção
>
> Definir a memória é muito importante, ela que fará com que o assistente consiga entender o contexto da conversa.
>
> ![](https://files.readme.io/5df3223a5bdecaf177473b259690b565fe6dc883ef21de2574e6a168eab20746-image.png)

---

## Ferramentas do assistente IA

O assistente assistente possui ferramentas (Tools), que permite interações com outros sistemas através de requisições HTTP, isso torna-se útil e abre um leque de opções, você pode fazer requisições para buscar um boleto em um banco de dados e retorna-lo para o contato por exemplo, nesse documento vamos abordar três funcionalidades, mas o céu é o limite tratando-se dessa funcionalidade.

1. Nessa primeira etapa vamos realizar uma requisição na API para buscar as equipes de uma conta, essa lista de equipes dará uma base ao seu agente para transferir o contato de acordo com o contexto da conversa.

- Clique em tools e crie uma requisição HTTP
- Em "Description" você deve dar instruções para o agente da função, segue uma sugestão: "Nesta função você consegue listar as equipes disponíveis para transferência".
- Configure a requisição de acordo com a [documentação](https://wtschat.readme.io/reference/get_v1-session)
- Ao configurar o header defina o "Value Provided" como "Using Field Below". Veja imagem abaixo

  ![](https://files.readme.io/358fe8a6d87ef75b4e5762813d0508afdc2507743637092ef2839bfef9ba105c-image.png)

2. Nessa etapa vamos configurar a função de transferência de equipe, também vamos criar uma requisição HTTP, para o endpoint de transferir conversas.

- Assim como na etapa anterior vamos dar algumas instruções para nosso assistente IA sobre como usar essa função, segue uma sugestão:
  **Setores para transferência.**
  **Algumas diretrizes:**
  **-Seja rápido e objetivo ao responder perguntas frequentes, buscando entender detalhadamente o problema do contato.**
  **-Explique de maneira simples qualquer processo técnico de baixa complexidade.**
  **-Demonstre paciência ao lidar com questões delicadas ou frustrações dos clientes.**
  **-Utilize um tom positivo e otimista, mesmo ao comunicar informações difíceis ou negativas**.
  **-Não solicite dados do contato como (e-mail, Id, números de protocolo, documentos).**
- Configure a requisição de acordo com a [documentação](https://wtschat.readme.io/reference/put_v1-session-id-transfer).
- Marque a opção "Send Body" e cole o JSON abaixo no body da requisição.

JSON

```
{
  "type": "DEPARTMENT",
  "newDepartmentId": "{departmentId}"
}
```

- Você deve usar um placeholder para quaisquer dados a serem preenchidos pelo modelo. Veja imagem abaixo

  ![](https://files.readme.io/9c47ae4c1fa9260cab44ea338517f64f7233a6916b49c2e8742882392c1c6fc9-image.png)

3. Por fim, a função de concluir atendimento, nessa etapa vamos configurar uma outra requisição para finalizar o atendimento quando solicitado pelo contato. Siga os passos abaixo

- No campo "Description" passe as instruções para seu assistente IA.
- Configure a requisição de acordo com a [documentação](https://wtschat.readme.io/reference/put_v1-session-id-complete).
- Marque a opção "Send Body" e cole o JSON abaixo no body da requisição
- JSON

  ```
  {
    "reactivateOnNewMessage": true
  }
  ```

  ![](https://files.readme.io/e395c0cd565d4c4ffa909f2c9c435968e37b079209006e47990240b1b7554735-image.png)

  ---

  ## Configuração do node de enviar mensagem ao contato
- O primeiro passo é instalar o módulo do WTS em seu N8N. É possível encontrar essa informação para a instalação em "Ajustes" > "Integrações" > "Automações via N8N".
- Após instalar o módulo WTS, crie uma chave de API dentro da plataforma em "Ajustes" > "Integrações" > "Integrações Via API" > "Novo" > "Nomeie a chave" > "Salve" > "Copie".
- Clique para adicionar um novo nó e digite "WTS", procure por "Session Actions" > "Send Message Text".
- Em "Credential to connection with", caso você já tenha uma chave de API criada, bastar selecioná-la. Caso não, basta criar uma nova "Create new credential" e colar a chave API criada na plataforma.
- O output em questão é a resposta do seu agente, você deve passá-lo dentro da requisição para disparar essa resposta para o contato.
- No campo "Text" coloque o output retornado por seu agente IA, no campo "Session ID" informe o id da sessão (essa informação você encontra no output do webhook, procure por "sessionId").

  ![](https://files.readme.io/32bd80ce5b147a49d540fee71eb35c23da1f13b56c6bec8a36ad78882e24f370-image.png)

Seguindo esse tutorial, será possível ler e responder textos usando o ChatGPT, além disso será possível executar funções de transferência e conclusão de atendimentos. Você também pode adicionar outras funções ao seu assistente, como buscar boletos em uma API externa por exemplo, existem diversas possibilidades que você pode explorar utilizando as ferramentas do seu assistente.

Updated about 1 year ago

---


---

## 4-como-processar-áudios

**URL:** `https://flwchat.readme.io/reference/4-como-processar-áudios`

**Confira abaixo como ficará a integração após seguir esse tutorial.**

![](https://files.readme.io/7cc1583c454c1a0441643149950d2cdafb2d08bef63adb07def0e4575c8bd7a6-image.png)

> ## 📘 Para baixar o fluxo pronto, o JSON com todos os passos está [nesse link](https://github.com/wtschat/files/blob/main/wts_n8n_transcribe_audio.json).
>
> Você poderá criar seu próprio fluxo, para facilitar você pode baixar o nosso fluxo e alterar.

## Separando os tipos de mensagem

Como explicado anteriormente, mensagens agregadas são divididas em mensagens de texto e mensagens que contenham áudio, imagem ou arquivo. Para separarmos as mensagens de texto das mensagens que contenham arquivos, vamos usar o node "Filter" validando se o tipo de mensagem "Text" é ou não vazio.

- Se não for vazio vamos usar um "Set" para gravar a várivel "lastMessagesAggregated.text" e, caso seja vazio, serão enviadas apenas mensagens do tipo "File", vamos tratar sobre mais a frente.


![](https://files.readme.io/71fc809bc4c502da99eb9943f229c9850a781eb0b9c7ea44e93591ea0ab93402-image.png)

- Já para mensagens "Files" devemos dividir os arquivos vindos do webhook em arquivos únicos, usando o node "Split Out" e tratar cada tipo de arquivo de uma maneira. Nessa etapa vamos tratar apenas arquivos de áudio, outros tipos de arquivos serão abordados mais a frente.

  ![](https://files.readme.io/e7c75bd3c0081ce3d348d9c5298682a3b463db1d52f5da648eb28fb9e8841acc-image.png)
- Após dividirmos os arquivos vamos separá-los por tipo, áudio, imagem e documentos. Para isso usaremos o node "Switch" e comparar se o "file.mimeType" (tipo de arquivo) começa com áudio/(formato) do arquivo.

  ![](https://files.readme.io/7af17401bbc21aa3d7560ece8c31595cc9099638341708ad4427a6c4aae10cf8-image.png)

---

## Tratando arquivo de áudio

- Após separar o arquivo de áudio dos demais, é preciso fazer o seu download. Para isso usaremos uma requisição HTTP, vamos dar um "GET" na URL pública que se encontra o áudio.

![](https://files.readme.io/c479446f08f8c7de2912467eeb97adc6c1449024ae15df08aa5bb7c56f312686-image.png)


---

## Transcrevendo o áudio

- Logo após realizar o download do áudio, crie um node OpenIA > "Transcribe Recording".
- No campo "Input Data Field Name" é necessário passar o nome do campo de entrada que contém os dados do arquivo binário a serem processados.

  ![](https://files.readme.io/204196db3bcddd8f53201fd10a3890f6707cd323a80b3f59108dfb06ba9072d2-image.png)
- Grave o output da transcrição em uma variável.
- Crie um node "Merge" para agrupar os inputs.
- Grave os valores "text" e "sessionId" em um node "Set".

![](https://files.readme.io/564f668d83d296a519040ff68fc620715a5ede2a0f10014fe43997892da0fcc4-image.png)

- Em seguida, é necessário concatenar as mensagens em uma única mensagem para enviarmos para o seu assistente. Para isso será utilizado um node "Code", basta copiar o código abaixo:

JavaScript

```
var text = "";
var sessionId = $('Webhook').first().json.body.sessionId;

for (const item of $input.all()) {
  text += item.json.text + " \n";
}

return { "text": text, "sessionId": sessionId };
```

---

### Resumo do que o código faz:

1. Inicializa uma variável text como uma string vazia.
2. Recupera o valor do sessionId de uma resposta de webhook anterior.
3. Itera por todos os itens de entrada disponíveis e concatena o texto de cada item, adicionando uma nova linha entre os textos.
4. Retorna um objeto com o texto concatenado e o sessionId para ser usado em outro lugar.

- Ligue o node "Code" ao seu assistente, que por sua vez estará ligado ao node "Enviar mensagem".

Após todos esses passos sua integração irá processar áudios enviados, transcrevendo-os em texto para que seu assistente consiga interpretar e responder da forma mais adequada.

Updated about 1 year ago

---


---

## 5-como-processar-imagens

**URL:** `https://flwchat.readme.io/reference/5-como-processar-imagens`

**Confira abaixo como ficará a integração após seguir esse tutorial.**

![](https://files.readme.io/369776debe631f1056604367ea9f710eab5f720f7ebd09ee18394d33c8e89ec7-image.png)
> ## 📘 Para baixar o fluxo pronto, o JSON com todos os passos está [nesse link](https://github.com/wtschat/files/blob/main/wts_n8n_transcribe_image.json).
>
> Você poderá criar seu próprio fluxo, para facilitar você pode baixar o nosso fluxo e alterar.

## Processando imagens

- Na etapa anterior no processamento de áudio foi criado o node "Switch" para processar diferentes tipos de arquivo, vamos criar uma rota dentro desse switch para processar as **imagens.**
- Para isso, é necessário comparar se o "file.mimeType" (tipo de arquivo) começa com image/ + (formato) do arquivo, assim como foi feito para o áudio. Confira a imagem abaixo:

  ![](https://files.readme.io/6291b8bb5c1840b9ee157b48677d63afdf81b190962700520d60f28f33defc68-image.png)
- Grave o "Content" (resultado da transcrição da imagem) em uma variável

  ![](https://files.readme.io/580a4203a135f4df22c16ef8e685b2a13ca6f231a89652a3dbdd68a05cd74861-image.png)
- Após esses passos basta ligar o node "Set" (que contém a variável da transcrição da imagem) ao "Merge". Como mostra a imagem inicial desse documento
- Salve seu workflow.



Seguindo esse rápido tutorial será possível processar imagens com IA.

Updated about 1 year ago

---


---

## criar-token-para-integração

**URL:** `https://flwchat.readme.io/reference/criar-token-para-integração`

Um token permanente permite que você autentique e autorize seu aplicativo sem ter que implementar fluxos de autenticação. Basta criar um novo token e usá-lo para autenticação onde quiser.

Para criar um token de autenticação clique em **Ajustes > Integrações > Integração via API (Configurar)**. Em seguida, clique em **Novo** e adicione um nome para o token.

![](https://files.readme.io/828e12c05b6f3fcf45df249ebad77a6391c8fc35c503fe25f7af7f54e28dcfde-Token.gif)

### Uso do token em uma chamada Http

Para utilizar o token permanente, você deve incluí-lo no cabeçalho (header) da requisição HTTP. Use o formato abaixo para garantir o acesso:

**Header "Authorization":** Bearer {seu\_token\_aqui}

cURL

```
curl -X GET "https://api.flw.chat/v1/channel" \
     -H "Authorization: Bearer pn_TOKEN_PERMANENTE"
```

### Orientações de segurança

**Geração do Token:** Você pode gerar um novo token permanente sempre que precisar, informe o nome da plataforma que irá utilizar o token para que você consiga identificar no futuro. Esse token é uma chave única que permite acesso direto aos nossos serviços, sem necessidade de login contínuo.

**Uso do Token:** O token permanente pode ser utilizado em integrações externas e ferramentas que precisem acessar sua conta. Lembre-se de mantê-lo seguro, pois ele dá acesso direto à sua conta.

**Revogação do Token:** Você tem o controle total do token permanente. Caso não precise mais dele ou queira reforçar a segurança, você pode excluí-lo a qualquer momento. Uma vez excluído, todas as integrações que utilizavam esse token deixarão de funcionar.

**Segurança:** Recomendamos não compartilhar seu token com terceiros e, se suspeitar de algum uso indevido, exclua-o imediatamente e gere um novo.

Updated 6 months ago

---


---

## make

**URL:** `https://flwchat.readme.io/reference/make`

O **Make.com** é uma plataforma de automação que permite criar fluxos de trabalho personalizados para integrar diferentes aplicativos e serviços, eliminando tarefas manuais e repetitivas. Com uma interface visual intuitiva, os usuários podem conectar ferramentas e configurar gatilhos e ações para automatizar processos.

### Como funciona a contagem:

- **Operação**: Cada vez que um módulo em um cenário é executado, ele conta como uma operação. Por exemplo:
  - Buscar dados em uma planilha: 1 operação.
  - Enviar uma mensagem via e-mail ou Slack: 1 operação.
  - Processar dados de várias linhas: cada linha pode contar como uma operação separada.
- **Cobrança**:
  - **Plano contratado**: Cada plano (Gratuito, Core, Pro, etc.) tem um limite de operações mensais.
    - **Exemplo**: Um plano Core pode oferecer 10.000 operações por mês.
  - **Excedente**: Se o limite for atingido, os cenários param de executar até que:
    - O limite seja renovado no próximo ciclo.
    - Você faça um upgrade para um plano superior.

### Autenticação - Make.com

Um token permanente permite que você autentique e autorize seu aplicativo sem ter que implementar fluxos de autenticação OAuth 2.0. Basta criar um novo token e usá-lo para autenticação onde quiser.

Tutorial de instalação do aplicativo wtschat no Make.com

Passos para instalação

1. ### Acesse o Link do Aplicativo Make

   Abra o navegador e acesse o [link](https://www.make.com/en/hq/app-invitation/0e94c36cbd3949661d56ad6aa33a80df) específico do aplicativo Make. Clique no botão “Instalar” para iniciar o processo.

   ![](https://files.readme.io/dab813e8d75ffeaec47b23d825d9d2b37b833d63a144a6f471ee33e5f04f7e83-image.png)
2. ### Complete a Instalação do Aplicativo

Você será redirecionado para uma página onde deverá selecionar a organização na qual deseja instalar o aplicativo. Selecione a organização desejada e clique no botão “Instalar” localizado no canto inferior direito da tela.
Observação: A instalação só pode ser feita em uma organização na qual você possui a função de “administrador” ou “desenvolvedor de aplicativos”.

![](https://files.readme.io/ef661dee5d39df4742fde9a3c0c359d2a85f53ee3456126d3a8619ce3190f063-INSTALAO_1.gif)

3. ### Confirmação de Instalação

   Uma notificação aparecerá na tela indicando que a instalação foi concluída com sucesso. Clique em "Finish Wizard"



4. ### Acesse o Make

   Abra o Make e acesse a organização onde você instalou o aplicativo. Navegue até “Aplicativos Instalados” para visualizar o ícone e o nome do aplicativo "wts.chat".

![](https://files.readme.io/76c4ae2777e38063a22bb3cf1ada4ee603fbc98602785c16ba4a7c7ca59a36f2-image.png)

*Visualize o ícone do aplicativo wts.chat em Aplicativos Instalados*



5. ### Crie um Novo Cenário

   Vá para a seção “Cenários”. Clique no botão “Crie um novo cenário” no canto superior direito da tela.

![](https://files.readme.io/f6ead864644441c5328cf2630f30d8962742d533f63ea778af58321aa8a69bae-create_scenario.gif)

6. ### Adicione o módulo wtsChat ao Cenário

   Após criar o cenário, um pop-up será exibido permitindo que você pesquise os aplicativos. Digite "wts chat" na barra de pesquisa. Você poderá ver todos os módulos do wts chat, organizados em grupos como “Contatos”, “Mensagens”, “Painéis”, etc.

![](https://files.readme.io/c653eb4d846c64beefb01adf8166fa3a66824241f2e741d367cab70cce6c5cd1-INSTALAO_2.gif)

Updated about 1 year ago

---


---

## n8n

**URL:** `https://flwchat.readme.io/reference/n8n`

O **n8n** é uma plataforma **LowCode** que permite criar automações de maneira intuitiva, sem a necessidade de conhecimento profundo em programação. Com o n8n, é possível integrar nossa plataforma com diversos serviços externos, aumentando significativamente as possibilidades ao utilizar nossa API.

# Modalidades de uso

### n8n.cloud

Você pode optar por contratar o n8n como **serviço na nuvem**, pagando por execução dos fluxos. Existem diferentes pacotes com limites de execuções mensais, atendendo às necessidades da maioria dos usuários. Este modelo é ideal para aqueles que buscam simplicidade e não querem se preocupar com manutenção de infraestrutura.
Veja mais [aqui](https://n8n.io).

### Auto-hospedado (Self-hosted)

Para cenários em que há grande volume de integrações e automações, o custo do n8n na nuvem pode ser um fator limitante. Nesse caso, é possível instalar o n8n em um servidor próprio, permitindo execuções ilimitadas e reduzindo os custos relacionados.

Com a opção de **auto-hospedagem**, você paga apenas pelo servidor, o que é vantajoso para quem deseja flexibilidade e escalabilidade sem restrição de execuções.
Veja mais [aqui](https://docs.n8n.io/hosting/).

---

# Módulo nativo para uso Self-hosted

Desenvolvemos um módulo nativo para facilitar a integração;

> ## 📘 Atenção - Community Nodes
>
> Para construção do módulo utilizamos a funcionalidade **Community Nodes** do N8N, esta funcionalidade está disponível apenas para contas **auto-hospedadas (self-hosted)**.
>
> Os usuários com n8n.cloud ainda não têm acesso a essa funcionalidade.

### Passos para instalação

**1 - Acesse as configurações na página inicial do n8n. Para isso, clique no menu de configurações no canto inferior esquerdo, em seguida clique em “Settings”/ “Configurações”.**

![Configurações da plataforma](https://files.readme.io/71de7612ae22b4af7730ebc6dec92b7ffa7d5bd0db6ba32f4b97dfe72df00491-chrome-capture-2024-11-19_2.gif)

Configurações da plataforma

**2 - Em seguida, no menu de opções clique em “Community nodes”/ “Nós da comunidade”.**

![Opção "Community nodes"](https://files.readme.io/0ecb7ffaaa79d7602cd7272e58fa61da6ff43b6600e4a3b961f9cbf64cf0a34a-community.png)

Opção "Community nodes"

**3 - Clique em “Install comunnity nodes”.**

Adicione o nome do pacote npm e aceite os termos de instalação e clique em install.
**Nome do pacote**: n8n-nodes-wts.

![Defina o nome do pacote: **n8n-nodes-wts**](https://files.readme.io/a0f9d80c267de39a3188e62fc2a5c59bcd504b8cd2bfe691d001824a655b4f00-Nome_NPM.png)

Defina o nome do pacote: **n8n-nodes-wts**

### 🎉 Pronto, agora é só usar...

---

### Uso do módulo

- Clique no painel de nós, no canto superior direito e busque por “wts chat” para listar as ações disponíveis.

  ![](https://files.readme.io/deb34f3d8488b542c6936a683d2025997f8268ed5d76c8b67f7c962711e5523a-zoom.gif)

  Para utilizar o módulo, é necessário ter um token permanente, saiba mais [aqui](https://dash.readme.com/project/wtschat/v1.0/refs/criar-token-para-integra%C3%A7%C3%A3o).

  Após adicionar um dos nós, clique em **Credential to connect with** e **Create new credential**. Escolha um nome que identifique a sua conta na plataforma. Para finalizar, clique em **salvar**.

  ![](https://files.readme.io/bdeaf66ba592ecbe7ad27a56df035e7f89ba9ce940921788a4e361e8416fc52b-chrome-capture-2024-11-19_5.gif)

  Preencha as outras opções do nó e execute.

  ### 🎉 Pronto você deu o primeiro passo para realizar as integrações.

Updated about 1 year ago

---


---

## get_v2-file

**URL:** `https://flwchat.readme.io/reference/get_v2-file`

Type

string

enum

required

Tipo do arquivo
Se informado o tipo UNDEFINED o sistema tentará identificar o tipo do arquivo
Arquivos do tipo DOCUMENT não passam por transformação ou compressão, mas arquivos do tipo IMAGE e VIDEO são transformados para que sejam compatíveis com todas as plataformas.

UNDEFINEDPDFEXCELWORDIMAGEAUDIOVIDEODOCUMENT

Show 8 enum values

Name

string

required

Nome do arquivo, com extensão (ex.: paisagem.jpg)

MimeType

string

Mimetype do arquivo. Se não informado ele será definido pelo tipo ou extensão do arquivo

# 200 Success

# 500 Server Error

Updated 12 months ago

---


---

## post_v2-file

**URL:** `https://flwchat.readme.io/reference/post_v2-file`

tempFileId

uuid

required

Código do arquivo

# 200 Success

# 500 Server Error

Updated 12 months ago

---


---

## get_v1-custom-field

**URL:** `https://flwchat.readme.io/reference/get_v1-custom-field`

EntityType

string

enum

Defaults to CONTACT

Tipo de entidade do campo personalizado.

CONTACTPANEL

Allowed:

`CONTACT``PANEL`

NestedList

boolean

Defaults to false

Determina a estrutura da lista retornada. Se verdadeiro, os campos serão retornados de forma aninhada, isto é, estruturado em grupos.

truefalse

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## get_v1-portfolio

**URL:** `https://flwchat.readme.io/reference/get_v1-portfolio`

IncludeDetails

array of strings

IncludeDetails

ADD  string

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

# 200 Success

# 500 Server Error

Updated over 1 year ago

---


---

## get_v1-portfolio-id-contact

**URL:** `https://flwchat.readme.io/reference/get_v1-portfolio-id-contact`

id

uuid

required

Id da carteira.

CreatedAt.Before

date-time

CreatedAt.After

date-time

CreatedAt.ApplyCompanyTimezone

boolean

truefalse

CreatedAt.IsNull

boolean

truefalse

UpdatedAt.Before

date-time

UpdatedAt.After

date-time

UpdatedAt.ApplyCompanyTimezone

boolean

truefalse

UpdatedAt.IsNull

boolean

truefalse

ContactIds

array of uuids

ContactIds

ADD  uuid

Page

int32

PageSize

int32

OrderBy

string

OrderByDesc

string

TimestampField

string

TimestampFilter

date-time

NextPageToken

string

Type

string

enum

UndefinedPageNumberTimestampToken

Allowed:

`Undefined``PageNumber``Timestamp``Token`

SkipCount

boolean

truefalse

# 200 Success

# 500 Server Error

Updated over 1 year ago

---


---

## post_v1-portfolio-id-contact

**URL:** `https://flwchat.readme.io/reference/post_v1-portfolio-id-contact`

id

uuid

required

Id da carteira.

Filtro de busca do contato.

contactId

uuid | null

phoneNumber

string | null

# 200 Success

# 500 Server Error

Updated over 1 year ago

---


---

## delete_v1-portfolio-id-contact

**URL:** `https://flwchat.readme.io/reference/delete_v1-portfolio-id-contact`

id

uuid

required

Id da carteira.

Filtro de busca do contato.

contactId

uuid | null

phoneNumber

string | null

200

Success

# 500 Server Error

Updated over 1 year ago

---


---

## post_v1-portfolio-id-contact-batch

**URL:** `https://flwchat.readme.io/reference/post_v1-portfolio-id-contact-batch`

id

uuid

required

Id da carteira.

Filtro de busca dos contatos.

contactIds

array of uuids | null

contactIds

ADD  uuid

phoneNumbers

array of strings | null

phoneNumbers

ADD  string

# 200 Success

# 500 Server Error

Updated over 1 year ago

---


---

## delete_v1-portfolio-id-contact-batch

**URL:** `https://flwchat.readme.io/reference/delete_v1-portfolio-id-contact-batch`

id

uuid

required

Id da carteira.

Filtro de busca dos contatos.

contactIds

array of uuids | null

contactIds

ADD  uuid

phoneNumbers

array of strings | null

phoneNumbers

ADD  string

200

Success

# 500 Server Error

Updated over 1 year ago

---


---

## get_v1-contact

**URL:** `https://flwchat.readme.io/reference/get_v1-contact`

IncludeDetails

array of strings

Detalhes que devem ser incluídos na resposta.

IncludeDetails

ADD  string

Status

string

enum

Defaults to ACTIVE

Status dos contatos a serem listados. Caso não informado, o valor padrão é ACTIVE.

ACTIVEARCHIVEDBLOCKED

Allowed:

`ACTIVE``ARCHIVED``BLOCKED`

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## post_v1-contact

**URL:** `https://flwchat.readme.io/reference/post_v1-contact`

Dados para criação do contato.

name

string | null

Nome do contato.

phoneNumber

string | null

Número no WhatsApp.

email

string | null

Endereço de email.

instagram

string | null

Nome de usuário no Instagram.

annotation

string | null

Notas internas da equipe.

tagIds

array of uuids | null

IDs das etiquetas atribuídas.

tagIds

ADD  uuid

tagNames

array of strings | null

Nomes das etiquetas atribuídas. Este campo será ignorado caso `TagIds` seja definido.

tagNames

ADD  string

portfolioIds

array of uuids | null

IDs das carteiras atribuídas.

portfolioIds

ADD  uuid

portfolioNames

array of strings | null

Nomes das carteiras atribuídas. Este campo será ignorado caso `PortfolioIds` seja definido.

portfolioNames

ADD  string

sequenceIds

array of uuids | null

IDs das sequências atribuídas.

sequenceIds

ADD  uuid

customFields

object | null

Objeto chave-valor para definir valores de campos personalizados no contato.
Cada item do objeto deverá ter como nome a chave do campo personalizado.
Caso a chave não corresponda a algum campo personalizado ou o tipo de dados do valor seja incompatível, o item será ignorado.

customFields object | null

metadata

object | null

Metadados relevantes para o contato. Neste campo, pode ser salvo qualquer propriedade adicional para o contato, na estrutura chave-valor.

- Para adicionar um metadado: utilize uma chave não utilizada anteriormente neste contato, atribuindo o novo valor;
- Para atualizar um metadado: utilize a chave salva anteriormente neste contato, atribuindo o novo valor;
- Para remover um metadado: utilize a chave salva anteriormente, atribuindo valor nulo.

metadata object | null

options

object

options object

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## post_v1-contact-filter

**URL:** `https://flwchat.readme.io/reference/post_v1-contact-filter`

Parâmetros para filtragem dos contatos. Os filtros são aditivos.

pageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

pageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

orderBy

string | null

Nome do campo para ser utilizado como pivô da ordenação.

orderDirection

string | null

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

createdAt

object

createdAt object

updatedAt

object

updatedAt object

includeDetails

array of strings | null

Detalhes que devem ser incluídos na resposta.

includeDetails

ADD  string

status

string | null

enum

Defaults to ACTIVE

Status dos contatos a serem listados. Caso não informado, o valor padrão é ACTIVE.

ACTIVEARCHIVEDBLOCKED

Allowed:

`ACTIVE``ARCHIVED``BLOCKED`

textFilter

string | null

Filtro textual. A busca é realizada nos atributos textuais relevantes do contato.

name

string | null

Filtro por nome.

phoneNumber

string | null

Filtro por número de telefone.

email

string | null

Filtro por email.

instagram

string | null

Filtro por nome de usuário do Instagram.

tagIds

array of uuids | null

Filtro por etiquetas usando IDs.

tagIds

ADD  uuid

tagNames

array of strings | null

Filtro por etiquetas usando nomes.

tagNames

ADD  string

portfolioIds

array of uuids | null

Filtro por carteiras usando IDs.

portfolioIds

ADD  uuid

portfolioNames

array of strings | null

Filtro por carteiras usando nomes.

portfolioNames

ADD  string

origin

string | null

enum

Filtro por origem.

CREATED\_BY\_USERCREATED\_FROM\_HUBIMPORTED

Allowed:

`CREATED_BY_USER``CREATED_FROM_HUB``IMPORTED`

customFields

object | null

Filtro por valores de campos personalizados.

customFields object | null

metadata

object | null

Filtro por metadados.

metadata object | null

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## get_v1-contact-phonenumber-phone

**URL:** `https://flwchat.readme.io/reference/get_v1-contact-phonenumber-phone`

phone

string

required

Número de telefone

IncludeDetails

array of strings

Detalhes que devem ser incluídos na resposta.

IncludeDetails

ADD  string

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## put_v1-contact-phonenumber-phone

**URL:** `https://flwchat.readme.io/reference/put_v1-contact-phonenumber-phone`

phone

string

required

Número de telefone.

Dados para atualização do contato.

fields

array of strings | null

Campos a serem atualizados.

fields

ADD  string

name

string | null

Nome do contato.

phoneNumber

string | null

Número no WhatsApp.

email

string | null

Endereço de email.

instagram

string | null

Nome de usuário no Instagram.

annotation

string | null

Notas internas da equipe.

tagIds

array of uuids | null

IDs das etiquetas atribuídas.

tagIds

ADD  uuid

tagNames

array of strings | null

Nomes das etiquetas atribuídas. Este campo será ignorado caso `TagIds` seja definido.

tagNames

ADD  string

portfolioIds

array of uuids | null

IDs das carteiras atribuídas.

portfolioIds

ADD  uuid

portfolioNames

array of strings | null

Nomes das carteiras atribuídas. Este campo será ignorado caso `PortfolioIds` seja definido.

portfolioNames

ADD  string

sequenceIds

array of uuids | null

IDs das sequências atribuídas.

sequenceIds

ADD  uuid

status

string | null

enum

Status do contato.

ACTIVEARCHIVEDBLOCKED

Allowed:

`ACTIVE``ARCHIVED``BLOCKED`

pictureUrl

string | null

Informe neste campo uma Url para definição da imagem do contato

customFields

object | null

Objeto chave-valor para definir valores de campos personalizados no contato.
Cada item do objeto deverá ter como nome a chave do campo personalizado.
Caso a chave não corresponda a algum campo personalizado ou o tipo de dados do valor seja incompatível, o item será ignorado.

customFields object | null

metadata

object | null

Metadados relevantes para o contato. Neste campo, pode ser salvo qualquer propriedade adicional para o contato, na estrutura chave-valor.

- Para adicionar um metadado: utilize uma chave não utilizada anteriormente neste contato, atribuindo o novo valor;
- Para atualizar um metadado: utilize a chave salva anteriormente neste contato, atribuindo o novo valor;
- Para remover um metadado: utilize a chave salva anteriormente, atribuindo valor nulo.

metadata object | null

utm

object

utm object

options

object

options object

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## get_v1-contact-id

**URL:** `https://flwchat.readme.io/reference/get_v1-contact-id`

id

uuid

required

ID do contato

IncludeDetails

array of strings

Detalhes que devem ser incluídos na resposta.

IncludeDetails

ADD  string

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## put_v2-contact-id

**URL:** `https://flwchat.readme.io/reference/put_v2-contact-id`

id

uuid

required

ID do contato.

Dados para atualização do contato.

fields

array of strings | null

Campos a serem atualizados.

fields

ADD  string

name

string | null

Nome do contato.

phoneNumber

string | null

Número no WhatsApp.

email

string | null

Endereço de email.

instagram

string | null

Nome de usuário no Instagram.

annotation

string | null

Notas internas da equipe.

tagIds

array of uuids | null

IDs das etiquetas atribuídas.

tagIds

ADD  uuid

tagNames

array of strings | null

Nomes das etiquetas atribuídas. Este campo será ignorado caso `TagIds` seja definido.

tagNames

ADD  string

portfolioIds

array of uuids | null

IDs das carteiras atribuídas.

portfolioIds

ADD  uuid

portfolioNames

array of strings | null

Nomes das carteiras atribuídas. Este campo será ignorado caso `PortfolioIds` seja definido.

portfolioNames

ADD  string

sequenceIds

array of uuids | null

IDs das sequências atribuídas.

sequenceIds

ADD  uuid

status

string | null

enum

Status do contato.

ACTIVEARCHIVEDBLOCKED

Allowed:

`ACTIVE``ARCHIVED``BLOCKED`

pictureUrl

string | null

Informe neste campo uma Url para definição da imagem do contato

customFields

object | null

Objeto chave-valor para definir valores de campos personalizados no contato.
Cada item do objeto deverá ter como nome a chave do campo personalizado.
Caso a chave não corresponda a algum campo personalizado ou o tipo de dados do valor seja incompatível, o item será ignorado.

customFields object | null

metadata

object | null

Metadados relevantes para o contato. Neste campo, pode ser salvo qualquer propriedade adicional para o contato, na estrutura chave-valor.

- Para adicionar um metadado: utilize uma chave não utilizada anteriormente neste contato, atribuindo o novo valor;
- Para atualizar um metadado: utilize a chave salva anteriormente neste contato, atribuindo o novo valor;
- Para remover um metadado: utilize a chave salva anteriormente, atribuindo valor nulo.

metadata object | null

utm

object

utm object

options

object

options object

# 200 Success

# 500 Server Error

Updated 8 months ago

---


---

## post_v1-contact-phonenumber-phone-tags

**URL:** `https://flwchat.readme.io/reference/post_v1-contact-phonenumber-phone-tags`

phone

string

required

Número de telefone

Lista de etiquetas e operação esperada

tagNames

array of strings | null

Lista de nomes das etiquetas

tagNames

ADD  string

tagIds

array of uuids | null

Lista de identificadores das etiquetas (opcional se o nome for informado)

tagIds

ADD  uuid

operation

string

enum

Tipo de operação:
InsertIfNotExists - Insere as etiquetas que já não estiverem relacionadas ao contato;
DeleteIfExists - Remove as etiquetas que já estiverem relacionadas no contato;
ReplaceAll - Remove todas as etiquetas do contato e inclui as que estão sendo informadas.

InsertIfNotExistsDeleteIfExistsReplaceAll

Allowed:

`InsertIfNotExists``DeleteIfExists``ReplaceAll`

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## post_v1-contact-id-tags

**URL:** `https://flwchat.readme.io/reference/post_v1-contact-id-tags`

id

uuid

required

ID do contato ou número de telefone.

Lista de etiquetas e operação esperada

tagNames

array of strings | null

Lista de nomes das etiquetas

tagNames

ADD  string

tagIds

array of uuids | null

Lista de identificadores das etiquetas (opcional se o nome for informado)

tagIds

ADD  uuid

operation

string

enum

Tipo de operação:
InsertIfNotExists - Insere as etiquetas que já não estiverem relacionadas ao contato;
DeleteIfExists - Remove as etiquetas que já estiverem relacionadas no contato;
ReplaceAll - Remove todas as etiquetas do contato e inclui as que estão sendo informadas.

InsertIfNotExistsDeleteIfExistsReplaceAll

Allowed:

`InsertIfNotExists``DeleteIfExists``ReplaceAll`

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## post_v2-contact-batch

**URL:** `https://flwchat.readme.io/reference/post_v2-contact-batch`

Dados para salvar os contatos.

items

array of objects

required

length between 1 and 100

Dados para criação dos contatos.

items\*

ADD  object

options

object

options object

# 200 Success

# 500 Server Error

Updated 8 months ago

---


---

## get_v1-contact-custom-field

**URL:** `https://flwchat.readme.io/reference/get_v1-contact-custom-field`

NestedList

boolean

Defaults to false

Determina a estrutura da lista retornada. Se verdadeiro, os campos serão retornados de forma aninhada, isto é, estruturado em grupos.

truefalse

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## post_v1-department

**URL:** `https://flwchat.readme.io/reference/post_v1-department`

name

string | null

Nome da equipe

isDefault

boolean

Se é a equipe padrão

truefalse

distributionIsEnabled

boolean

Se a distribuição está habilitada

truefalse

distributionConfig

object

distributionConfig object

restrictionType

string | null

enum

Tipo de restrição

NONEDEPARTMENT\_RESTRICTIONUSER\_RESTRICTION

Allowed:

`NONE``DEPARTMENT_RESTRICTION``USER_RESTRICTION`

channelsConfig

object

channelsConfig object

agents

array of objects | null

Lista de usuários para criar na equipe

agents

ADD  object

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## get_v2-department

**URL:** `https://flwchat.readme.io/reference/get_v2-department`

# 200 Success

# 500 Server Error

Updated 6 months ago

---

ShellNodeRubyPHPPython

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

200500

Updated 6 months ago

---


---

## get_v1-department-id

**URL:** `https://flwchat.readme.io/reference/get_v1-department-id`

id

uuid

required

includeDetails

string

enum

AllAgentsChannels

Allowed:

`All``Agents``Channels`

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## put_v1-department-id

**URL:** `https://flwchat.readme.io/reference/put_v1-department-id`

id

uuid

required

ID da equipe.

Dados para atualização da equipe.

name

string | null

Nome da equipe

isDefault

boolean

Se é a equipe padrão

truefalse

distributionIsEnabled

boolean

Se a distribuição está habilitada

truefalse

distributionConfig

object

distributionConfig object

restrictionType

string | null

enum

Tipo de restrição

NONEDEPARTMENT\_RESTRICTIONUSER\_RESTRICTION

Allowed:

`NONE``DEPARTMENT_RESTRICTION``USER_RESTRICTION`

channelsConfig

object

channelsConfig object

fields

array of strings

required

Campos que devem ser atualizados

fields\*

ADD  string

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## delete_v1-department-id

**URL:** `https://flwchat.readme.io/reference/delete_v1-department-id`

> Falha ao extrair: Conteúdo muito curto


---

## put_v1-department-id-agents

**URL:** `https://flwchat.readme.io/reference/put_v1-department-id-agents`

id

uuid

required

ID da equipe

Dados de atualização dos equipes. Use action: "REPLACEALL", "UPSERT" ou "REMOVE".

action

string

enum

required

ReplaceAllUpsertRemove

Allowed:

`ReplaceAll``Upsert``Remove`

items

array of objects

required

items\*

ADD  object

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## get_v1-department-id-channel

**URL:** `https://flwchat.readme.io/reference/get_v1-department-id-channel`

id

uuid

required

ID da equipe

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## get_v1-tag

**URL:** `https://flwchat.readme.io/reference/get_v1-tag`

# 200 Success

# 500 Server Error

Updated about 2 years ago

---

ShellNodeRubyPHPPython

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

200500

Updated about 2 years ago

---


---

## get_v1-company-officehours

**URL:** `https://flwchat.readme.io/reference/get_v1-company-officehours`

# 200 Success

# 500 Server Error

Updated 4 months ago

---

ShellNodeRubyPHPPython

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

200500

Updated 4 months ago

---


---

## get_v1-agent

**URL:** `https://flwchat.readme.io/reference/get_v1-agent`

# 200 Success

# 500 Server Error

Updated about 2 years ago

---

ShellNodeRubyPHPPython

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

200500

Updated about 2 years ago

---


---

## post_v1-agent

**URL:** `https://flwchat.readme.io/reference/post_v1-agent`

Dados do usuário

name

string

required

length between 1 and 100

Nome do usuário

email

string | null

Email do usuário

phoneNumber

string | null

Telefone do usuário

profile

string

enum

required

Perfil do usuário

AdminAgentRestrictedAgent

Allowed:

`Admin``Agent``RestrictedAgent`

availability

string | null

enum

Disponibilidade do usuário

AVAILABLEUNAVAILABLE

Allowed:

`AVAILABLE``UNAVAILABLE`

# 200 Success

# 500 Server Error

Updated 3 months ago

---


---

## get_v1-agent-id

**URL:** `https://flwchat.readme.io/reference/get_v1-agent-id`

id

uuid

required

ID do usuário

# 200 Success

# 500 Server Error

Updated 3 months ago

---


---

## put_v1-agent-id

**URL:** `https://flwchat.readme.io/reference/put_v1-agent-id`

id

uuid

required

ID do usuário

Campos a serem atualizados

name

string | null

Nome do usuário

shortName

string | null

Nome curto/apelido do usuário

email

string | null

Email do usuário

phoneNumber

string | null

Número de telefone do usuário

profile

string

enum

Perfil do usuário

AdminAgentRestrictedAgent

Allowed:

`Admin``Agent``RestrictedAgent`

availability

string

enum

Disponibilidade do usuário

AVAILABLEUNAVAILABLE

Allowed:

`AVAILABLE``UNAVAILABLE`

fields

array of strings

required

Campos que devem ser atualizados

fields\*

ADD  string

# 200 Success

# 500 Server Error

Updated 3 months ago

---


---

## delete_v1-agent-id

**URL:** `https://flwchat.readme.io/reference/delete_v1-agent-id`

id

uuid

required

ID do usuário

Parâmetros para remoção

sessionResolution

string | null

enum

COMPLETETRANSFERRETURN\_TO\_PENDING

Allowed:

`COMPLETE``TRANSFER``RETURN_TO_PENDING`

transferUserId

uuid | null

ID do usuário que receberá os atendimentos em andamento. Obrigatório quando o campo sessionResolution for igual a TRANSFER

200

Success

# 500 Server Error

Updated 3 months ago

---


---

## post_v1-agent-id-departments

**URL:** `https://flwchat.readme.io/reference/post_v1-agent-id-departments`

id

uuid

required

ID do usuário

Dados de atualização dos equipes. Use action: "ReplaceAll", "UPSERT" ou "REMOVE"

action

string

enum

required

Ação a ser executada: REPLACE\_ALL, UPSERT ou REMOVE

ReplaceAllUpsertRemove

Allowed:

`ReplaceAll``Upsert``Remove`

items

array of objects

required

Lista de equipes para atualização

items\*

ADD  object

200

Success

# 500 Server Error

Updated 3 months ago

---


---

## post_v1-agent-id-status

**URL:** `https://flwchat.readme.io/reference/post_v1-agent-id-status`

id

uuid

required

ID do usuário

Dados do novo status

status

string

enum

required

Novo status do usuário

UndefinedActiveBlocked

Allowed:

`Undefined``Active``Blocked`

# 200 Success

# 500 Server Error

Updated 3 months ago

---


---

## post_v1-agent-id-logout

**URL:** `https://flwchat.readme.io/reference/post_v1-agent-id-logout`

id

uuid

required

ID do usuário

200

Success

# 500 Server Error

Updated 3 months ago

---


---

## get_v1-webhook-event

**URL:** `https://flwchat.readme.io/reference/get_v1-webhook-event`

# 200 Success

# 500 Server Error

Updated over 1 year ago

---

ShellNodeRubyPHPPython

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

200500

Updated over 1 year ago

---


---

## get_v1-webhook-subscription

**URL:** `https://flwchat.readme.io/reference/get_v1-webhook-subscription`

# 200 Success

# 500 Server Error

Updated about 2 years ago

---

ShellNodeRubyPHPPython

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

200500

Updated about 2 years ago

---


---

## post_v1-webhook-subscription

**URL:** `https://flwchat.readme.io/reference/post_v1-webhook-subscription`

Parâmetros para criação da assinatura de webhook.

name

string

required

length between 1 and 100

Nome para identificação da assinatura

url

string

required

length between 1 and 500

URL destino para onde serão enviadas requisições POST

enabled

boolean | null

Defaults to true

Estado inicial da assinatura (ativa ou inativa)

truefalse

events

array of strings

required

length ≥ 1

Eventos que deverão ser enviados para esta assinatura

events\*

ADD  string

# 200 Success

# 500 Server Error

Updated almost 2 years ago

---


---

## get_v1-webhook-subscription-subscriptionid

**URL:** `https://flwchat.readme.io/reference/get_v1-webhook-subscription-subscriptionid`

subscriptionId

uuid

required

ID da assinatura de webhook.

# 200 Success

# 500 Server Error

Updated almost 2 years ago

---


---

## put_v1-webhook-subscription-subscriptionid

**URL:** `https://flwchat.readme.io/reference/put_v1-webhook-subscription-subscriptionid`

subscriptionId

uuid

required

ID da assinatura de webhook.

Parâmetros para atualização da assinatura de webhook.

fields

array of strings

required

Campos a serem atualizados.

fields\*

ADD  string

name

string | null

Nome para identificação da assinatura.

url

string | null

URL destino para onde serão enviadas requisições POST.

enabled

boolean | null

Defaults to true

Estado inicial da assinatura (ativa ou inativa).

truefalse

events

array of strings | null

Tópicos de webhook que deverão ser inscritos nesta assinatura.

events

ADD  string

# 200 Success

# 500 Server Error

Updated almost 2 years ago

---


---

## delete_v1-webhook-subscription-subscriptionid

**URL:** `https://flwchat.readme.io/reference/delete_v1-webhook-subscription-subscriptionid`

subscriptionId

uuid

required

ID da assinatura de webhook.

200

Success

# 500 Server Error

Updated almost 2 years ago

---


---

## get_v1-channel

**URL:** `https://flwchat.readme.io/reference/get_v1-channel`

ChannelType

string

enum

Tipo do canal.

AllWhatsappMessengerInstagram

Allowed:

`All``Whatsapp``Messenger``Instagram`

# 200 Success

# 500 Server Error

Updated almost 2 years ago

---


---

## get_v1-chatbot

**URL:** `https://flwchat.readme.io/reference/get_v1-chatbot`

Name

string

Filtro por nome do chatbot.

Types

array of strings

Filtro por tipo de uso do chatbot. É possível informar mais de um tipo.

Types

ADD  string

ChannelIds

array of uuids

Filtro por ID do canal. É possível informar mais de um ID.

ChannelIds

ADD  uuid

DefaultDepartmentIds

array of uuids

Filtro por ID da equipe padrão. É possível informar mais de um ID.

DefaultDepartmentIds

ADD  uuid

PublishStatuses

array of strings

Filtro por status de publicação do chatbot. É possível informar mais de um status.

PublishStatuses

ADD  string

AutomationUsages

array of strings

Filtro por disponibilidade da automação. É possível informar mais de uma disponibilidade.

AutomationUsages

ADD  string

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

# 200 Success

# 500 Server Error

Updated over 1 year ago

---


---

## post_v1-chatbot-send

**URL:** `https://flwchat.readme.io/reference/post_v1-chatbot-send`

Parâmetros para iniciar o chatbot.

botKey

uuid | null

Chave do chatbot a ser enviado.

from

string | null

Número de telefone ou @usuarioinstagram do canal cadastrado na conta.

to

string | null

Número de telefone ou @usuarioinstagram do destinatário.

sessionId

uuid | null

ID da conversa para a qual o chatbot deve ser enviado.
Se a conversa estiver concluída, o chatbot será executado sem reiniciá-la.

options

object

options object

sessionMetadata

object | null

Metadados relevantes para o atendimento. Através deste campo, é possível salvar propriedades adicionais para o atendimento, na estrutura chave-valor.
Qualquer metadado adicionado poderá ser utilizado como parâmetro nas mensagens e condicionais do chatbot, além de serem enviados de volta nos webhooks.
Esses metadados são enviados apenas enquanto o atendimento estiver ativo, ou seja, não são enviados em atendimentos posteriores.

sessionMetadata object | null

contactMetadata

object | null

Metadados relevantes para o contato. Através deste campo, é possível salvar propriedades adicionais para o contato, na estrutura chave-valor.
Qualquer metadado adicionado poderá ser utilizado como parâmetro nas mensagens e condicionais do chatbot, além de serem enviados de volta nos webhooks.
Esses metadados são salvos no contato e, portanto, são enviados mesmo em atendimentos posteriores.

contactMetadata object | null

# 200 Success

# 500 Server Error

Updated over 1 year ago

---


---

## get_v2-session

**URL:** `https://flwchat.readme.io/reference/get_v2-session`

Status

array of strings

Filtro por status da conversa.

Status

ADD  string

DepartmentId

uuid

Filtro por ID da equipe.

UserId

uuid

Filtro por ID do usuário.

TagsId

array of uuids

Filtro por IDs de etiquetas

TagsId

ADD  uuid

TagsName

array of strings

Filtro por nomes de etiquetas

TagsName

ADD  string

ChannelsId

array of uuids

Filtro por ID de canais

ChannelsId

ADD  uuid

ContactId

uuid

Filtro por ID do contato.

EndAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

EndAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

ActiveAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

ActiveAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

LastInteractionAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

LastInteractionAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

IncludeDetails

array of strings

Inclua detalhes de outras entidades no resultado da sua busca.

IncludeDetails

ADD  string

Metadata

object

Filtro por metadados.

Metadata object

Type

string

enum

Filtro por tipo da conversa.

INDIVIDUALGROUP

Allowed:

`INDIVIDUAL``GROUP`

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

# 200 Success

# 500 Server Error

Updated 4 months ago

---


---

## get_v2-session-id

**URL:** `https://flwchat.readme.io/reference/get_v2-session-id`

id

uuid

required

ID da conversa.

includeDetails

array of strings

includeDetails

ADD  string

# 200 Success

# 500 Server Error

Updated 4 months ago

---


---

## put_v1-session-id-transfer

**URL:** `https://flwchat.readme.io/reference/put_v1-session-id-transfer`

id

uuid

required

ID da conversa.

Parâmetros para transferência da conversa.

type

string

enum

required

Determina se a transferência deverá ser entre equipes ou usuários.

DEPARTMENTUSER

Allowed:

`DEPARTMENT``USER`

newDepartmentId

uuid | null

ID da nova equipe para a conversa.

newUserId

uuid | null

ID do novo usuário para a conversa.

options

object

options object

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## put_v1-session-id-assignee

**URL:** `https://flwchat.readme.io/reference/put_v1-session-id-assignee`

id

uuid

required

ID da conversa.

Parâmetros para atribuição do usuário.

userId

uuid

required

ID do usuário.

options

object

options object

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## put_v1-session-id-complete

**URL:** `https://flwchat.readme.io/reference/put_v1-session-id-complete`

id

uuid

required

ID da conversa.

Parâmetros para conclusão da conversa.

reactivateOnNewMessage

boolean

Defaults to false

Determina se a conversa deve ser reativada ao receber uma nova mensagem do contato. O valor padrão é `false`.

truefalse

stopBotInExecution

boolean

Defaults to false

Determina se o chatbot de automação em execução deve ser interrompido. O valor padrão é `false`.

truefalse

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## put_v1-session-id-status

**URL:** `https://flwchat.readme.io/reference/put_v1-session-id-status`

id

uuid

required

ID da conversa.

Parâmetros para alteração de status.

newStatus

string

enum

required

Novo status para a conversa.

UNDEFINEDSTARTEDPENDINGIN\_PROGRESSCOMPLETEDHIDDEN

Allowed:

`UNDEFINED``STARTED``PENDING``IN_PROGRESS``COMPLETED``HIDDEN`

options

object

options object

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## put_v2-session-id-partial

**URL:** `https://flwchat.readme.io/reference/put_v2-session-id-partial`

id

uuid

required

ID da conversa.

Parâmetros para alteração.

companyId

uuid

Código da empresa

status

string | null

enum

Situação do atendmento

UNDEFINEDSTARTEDPENDINGIN\_PROGRESSCOMPLETEDHIDDEN

Allowed:

`UNDEFINED``STARTED``PENDING``IN_PROGRESS``COMPLETED``HIDDEN`

endAt

date-time | null

Data de conclusão

number

string | null

Código de identificação

departmentId

uuid | null

Código da equipe

userId

uuid | null

Código do usuário / atendente

classification

object

classification object

metadata

object | null

Definição dos metadados

metadata object | null

options

object

options object

fields

array of strings | null

Definição dos campos a serem atualizados

fields

ADD  string

# 200 Success

# 500 Server Error

Updated over 1 year ago

---


---

## get_v1-session-id-message

**URL:** `https://flwchat.readme.io/reference/get_v1-session-id-message`

id

uuid

required

ID da conversa.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## post_v1-session-id-message

**URL:** `https://flwchat.readme.io/reference/post_v1-session-id-message`

id

uuid

required

Dados para envio da mensagem.

text

string | null

Texto da mensagem a ser enviada. Obrigatório caso não seja informado o parâmetro `templateId` ou `fileUrl`.

templateId

string | null

ID do modelo de mensagem para a mensagem a ser enviada. Obrigatório caso não seja informado o parâmetro `text` ou `fileUrl`.

parameters

object | null

Parâmetros do modelo de mensagem. Obrigatório caso o modelo de mensagem informado no `templateId` possua parâmetros.

parameters object | null

fileUrl

string | null

URL pública de algum arquivo que deseja-se enviar na mensagem. O arquivo enviado deverá seguir as regras do canal de atendimento.

fileId

uuid | null

Código do arquivo que deseja-se enviar na mensagem, o ID pode ser obtido nas rotas /core/v2/file, o arquivo deverá seguir as regras do canal de atendimento.

refId

uuid | null

ID de referência para identificar a mensagem externamente como resposta a uma mensagem anterior.

# 200 Success

# 500 Server Error

Updated almost 2 years ago

---


---

## post_v1-session-id-message-sync

**URL:** `https://flwchat.readme.io/reference/post_v1-session-id-message-sync`

id

uuid

required

Dados para envio da mensagem.

text

string | null

Texto da mensagem a ser enviada. Obrigatório caso não seja informado o parâmetro `templateId` ou `fileUrl`.

templateId

string | null

ID do modelo de mensagem para a mensagem a ser enviada. Obrigatório caso não seja informado o parâmetro `text` ou `fileUrl`.

parameters

object | null

Parâmetros do modelo de mensagem. Obrigatório caso o modelo de mensagem informado no `templateId` possua parâmetros.

parameters object | null

fileUrl

string | null

URL pública de algum arquivo que deseja-se enviar na mensagem. O arquivo enviado deverá seguir as regras do canal de atendimento.

fileId

uuid | null

Código do arquivo que deseja-se enviar na mensagem, o ID pode ser obtido nas rotas /core/v2/file, o arquivo deverá seguir as regras do canal de atendimento.

refId

uuid | null

ID de referência para identificar a mensagem externamente como resposta a uma mensagem anterior.

# 200 Success

# 500 Server Error

Updated over 1 year ago

---


---

## post_v1-session-id-note

**URL:** `https://flwchat.readme.io/reference/post_v1-session-id-note`

id

uuid

required

text

string | null

Texto da mensagem

filesUrls

array of strings | null

Lista de arquivos (Urls)

filesUrls

ADD  string

filesIds

array of uuids | null

Lista de arquivos (Ids)

filesIds

ADD  uuid

# 200 Success

# 500 Server Error

Updated 12 months ago

---


---

## get_v1-session-id-note

**URL:** `https://flwchat.readme.io/reference/get_v1-session-id-note`

id

uuid

required

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

# 200 Success

# 500 Server Error

Updated 12 months ago

---


---

## get_v1-session-note-id

**URL:** `https://flwchat.readme.io/reference/get_v1-session-note-id`

id

uuid

required

# 200 Success

# 500 Server Error

Updated 12 months ago

---


---

## delete_v1-session-note-id

**URL:** `https://flwchat.readme.io/reference/delete_v1-session-note-id`

id

uuid

required

# 200 Success

# 500 Server Error

Updated 12 months ago

---


---

## post_v1-message-send

**URL:** `https://flwchat.readme.io/reference/post_v1-message-send`

Dados para envio da mensagem.

from

string | null

Número de telefone do canal cadastrado na conta.

to

string

required

length ≥ 1

Número de telefone do destinatário.

botId

uuid | null

ID do bot que será ativado após a resposta do contato.

body

object

required

body object

department

object

department object

user

object

user object

options

object

options object

# 200 Success

# 500 Server Error

Updated almost 2 years ago

---


---

## post_v1-message-send-sync

**URL:** `https://flwchat.readme.io/reference/post_v1-message-send-sync`

Dados para envio da mensagem.

from

string | null

Número de telefone do canal cadastrado na conta.

to

string

required

length ≥ 1

Número de telefone do destinatário.

botId

uuid | null

ID do bot que será ativado após a resposta do contato.

body

object

required

body object

department

object

department object

user

object

user object

options

object

options object

# 200 Success

# 500 Server Error

Updated almost 2 years ago

---


---

## get_v1-message-id

**URL:** `https://flwchat.readme.io/reference/get_v1-message-id`

id

uuid

required

ID da mensagem.

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## get_v1-message-id-status

**URL:** `https://flwchat.readme.io/reference/get_v1-message-id-status`

id

uuid

required

ID da mensagem.

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## delete_v1-message-id

**URL:** `https://flwchat.readme.io/reference/delete_v1-message-id`

id

uuid

required

ID da mensagem a ser excluída.

# 200 Success

# 500 Server Error

Updated 9 months ago

---


---

## get_v1-message

**URL:** `https://flwchat.readme.io/reference/get_v1-message`

SessionId

uuid

required

ID da conversa.

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## get_v1-scheduled-message

**URL:** `https://flwchat.readme.io/reference/get_v1-scheduled-message`

ScheduledAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

ScheduledAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

IncludeDetails

array of strings

Lista de detalhes a serem incluídos na resposta

IncludeDetails

ADD  string

Status

string

enum

Status da mensagem agendada para filtrar

SCHEDULEDPROCESSEDSENTDELIVEREDREADCANCELEDFAILED

Allowed:

`SCHEDULED``PROCESSED``SENT``DELIVERED``READ``CANCELED``FAILED`

Type

string

enum

Tipo da mensagem agendada para filtrar

TEMPLATECHATBOT

Allowed:

`TEMPLATE``CHATBOT`

From

string

ID ou número de telefone do canal cadastrado na conta.

To

string

ID ou número de telefone do destinatário.

User

string

ID ou nome do usuário

Department

string

ID ou nome da equipe

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## post_v1-scheduled-message

**URL:** `https://flwchat.readme.io/reference/post_v1-scheduled-message`

Dados para criação da mensagem agendada

from

string | null

Número de telefone do canal cadastrado na conta.

to

string

required

length ≥ 1

Número de telefone do destinatário.

department

object

department object

type

string

enum

Tipo da mensagem agendada

TEMPLATECHATBOT

Allowed:

`TEMPLATE``CHATBOT`

templateId

string | null

ID do modelo de mensagem para a mensagem a ser enviada.

botId

uuid | null

ID do bot que será ativado após a resposta do contato.

scheduling

date-time

Data e hora programada para envio da mensagem

hiddenSession

boolean

Indica se a sessão deve ficar oculta (padrão: false)

truefalse

templateParams

object

templateParams object

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## get_v1-scheduled-message-id

**URL:** `https://flwchat.readme.io/reference/get_v1-scheduled-message-id`

id

uuid

required

ID da mensagem agendada

includeDetails

array of strings

Detalhes adicionais a serem incluídos

includeDetails

ADD  string

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## put_v1-scheduled-message-id

**URL:** `https://flwchat.readme.io/reference/put_v1-scheduled-message-id`

id

uuid

required

ID da mensagem agendada

Dados para atualização

fields

array of strings

required

Campos que devem ser atualizados

fields\*

ADD  string

to

string | null

Número de telefone do destinatário.

from

string | null

Número de telefone do canal cadastrado na conta.

department

object

department object

type

string | null

enum

Tipo da mensagem agendada

TEMPLATECHATBOT

Allowed:

`TEMPLATE``CHATBOT`

templateId

string | null

ID do modelo de mensagem para a mensagem a ser enviada.

botId

uuid | null

ID do bot que será ativado após a resposta do contato.

scheduling

date-time | null

Data e hora programada para envio da mensagem

hiddenSession

boolean | null

Indica se a sessão deve ficar oculta (padrão: false)

truefalse

templateParams

object

templateParams object

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## post_v1-scheduled-message-id-cancel

**URL:** `https://flwchat.readme.io/reference/post_v1-scheduled-message-id-cancel`

id

uuid

required

ID da mensagem agendada

200

Success

# 500 Server Error

Updated 6 months ago

---


---

## post_v1-scheduled-message-batch-cancel

**URL:** `https://flwchat.readme.io/reference/post_v1-scheduled-message-batch-cancel`

Lista de IDs das mensagens a serem canceladas

ADD  uuid

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## get_v1-template

**URL:** `https://flwchat.readme.io/reference/get_v1-template`

Archived

boolean

Filtro por modelos de mensagem arquivados.

truefalse

Name

string

Filtro por nome do modelo de mensagem.

SearchableText

string

Filtro por conteúdo do modelo de mensagem.

ChannelId

uuid

Filtro por id do canal.

ApprovedOnly

boolean

Filtro por status do modelo de mensagem.

truefalse

Type

string

enum

Filtro por tipo do modelo de mensagem.

QUICKREPLYATTENDANCECAMPAIGNSEQUENCESCHEDULEDMESSAGEAUTHENTICATION

Allowed:

`QUICKREPLY``ATTENDANCE``CAMPAIGN``SEQUENCE``SCHEDULEDMESSAGE``AUTHENTICATION`

IncludeDetails

array of strings

Detalhes que devem ser incluidos na resposta.

IncludeDetails

ADD  string

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## post_v1-template-otp-send

**URL:** `https://flwchat.readme.io/reference/post_v1-template-otp-send`

Dados para envio da mensagem.

from

string | null

Número do canal cadastrado na conta.

to

string | null

Número de telefone do destinatário.

code

string | null

Código a ser enviado. Caso não seja informado, um código aleatório será gerado.

integrationId

string | null

ID de integração para que você possa identificar durante a busca

templateId

string | null

ID do modelo de mensagem do tipo Autenticação

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## get_v1-template-otp-messageid-status

**URL:** `https://flwchat.readme.io/reference/get_v1-template-otp-messageid-status`

messageId

string

required

ID da mensagem ou IntegrationId para consultar o status.

# 200 Success

# 500 Server Error

Updated 6 months ago

---


---

## get_v1-sequence

**URL:** `https://flwchat.readme.io/reference/get_v1-sequence`

IncludeDetails

array of strings

IncludeDetails

ADD  string

Name

string

ContactId

uuid

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

# 200 Success

# 500 Server Error

Updated over 1 year ago

---


---

## get_v2-sequence-id-contact

**URL:** `https://flwchat.readme.io/reference/get_v2-sequence-id-contact`

id

uuid

required

ID da sequência.

IncludeDetails

array of strings

IncludeDetails

ADD  string

Name

string

Nome do contato.

ContactId

uuid

Id do contato.

PhoneNumber

string

Número do contato.

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

# 200 Success

# 500 Server Error

Updated 3 months ago

---


---

## post_v1-sequence-id-contact

**URL:** `https://flwchat.readme.io/reference/post_v1-sequence-id-contact`

id

uuid

required

ID da sequência.

Filtro de busca do contato.

contactId

uuid | null

ID do contato.

phoneNumber

string | null

Telefone do contato.

# 200 Success

# 500 Server Error

Updated over 1 year ago

---


---

## delete_v1-sequence-id-contact

**URL:** `https://flwchat.readme.io/reference/delete_v1-sequence-id-contact`

id

uuid

required

ID da sequência.

Filtro de busca do contato.

contactId

uuid | null

ID do contato.

phoneNumber

string | null

Telefone do contato.

200

Success

# 500 Server Error

Updated over 1 year ago

---


---

## post_v1-sequence-id-contact-batch

**URL:** `https://flwchat.readme.io/reference/post_v1-sequence-id-contact-batch`

id

uuid

required

ID da sequência.

Parâmetros para adicionar os contatos.

contactIds

array of uuids | null

Filtro por ids.

contactIds

ADD  uuid

phoneNumbers

array of strings | null

Filtro por números de telefones. Caso o contato não exista ele será criado

phoneNumbers

ADD  string

# 200 Success

# 500 Server Error

Updated over 1 year ago

---


---

## delete_v1-sequence-id-contact-batch

**URL:** `https://flwchat.readme.io/reference/delete_v1-sequence-id-contact-batch`

id

uuid

required

ID da sequência.

Parâmetros para remover os contatos. Os filtros são aditivos.

contactIds

array of uuids | null

Filtro por ids.

contactIds

ADD  uuid

phoneNumbers

array of strings | null

Filtro por números de telefones. Caso o contato não exista ele será criado

phoneNumbers

ADD  string

200

Success

# 500 Server Error

Updated over 1 year ago

---


---

## get_v1-panel-card

**URL:** `https://flwchat.readme.io/reference/get_v1-panel-card`

PanelId

uuid

required

ID do painel.

StepId

uuid

Filtro por ID da etapa.

ContactId

uuid

Filtro por ID do contato.

ResponsibleUserId

uuid

Filtro por ID do responsável.

TextFilter

string

Filtro textual. A busca é realizada nos atributos textuais relevantes do item.

IncludeArchived

boolean

Defaults to false

Incluir itens arquivados. Por padrão, não são incluídos na listagem.

truefalse

IncludeDetails

array of strings

Detalhes que devem ser incluídos na resposta.

IncludeDetails

ADD  string

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

# 200 Success

# 500 Server Error

Updated 8 months ago

---


---

## post_v1-panel-card

**URL:** `https://flwchat.readme.io/reference/post_v1-panel-card`

Dados para criação do card.

stepId

uuid

required

ID da etapa do painel onde o item deverá ser inserido.

title

string

required

length between 1 and 500

Título do item.

description

string | null

Descrição do item.

position

double | null

0 to 2147483647

Posição do item na etapa.

dueDate

date-time | null

Data de vencimento do item.

responsibleUserId

uuid | null

ID do usuário responsável pelo item.

tagIds

array of uuids | null

IDss das etiquetas atribuídas.

tagIds

ADD  uuid

tagNames

array of strings | null

Nomes das etiquetas atribuídas. Este campo será ignorado caso `TagIds` seja definido.

tagNames

ADD  string

contactIds

array of strings | null

IDs dos contatos relacionados ao item.

contactIds

ADD  string

sessionId

uuid | null

ID da conversa relacionada ao item.

monetaryAmount

double | null

Valor monetário atribuído ao item.

customFields

object | null

Objeto chave-valor para definir valores de campos personalizados no item.
Cada item do objeto deverá ter como nome a chave do campo personalizado.
Caso a chave não corresponda a algum campo personalizado ou o tipo de dados do valor seja incompatível, o item será ignorado.

customFields object | null

metadata

object | null

Metadados relevantes para o item. Neste campo, pode ser salvo qualquer propriedade adicional para o item, na estrutura chave-valor.

- Para adicionar um metadado: utilize uma chave não utilizada anteriormente neste item, atribuindo o novo valor;
- Para atualizar um metadado: utilize a chave salva anteriormente neste item, atribuindo o novo valor;
- Para remover um metadado: utilize a chave salva anteriormente, atribuindo valor nulo.

metadata object | null

# 200 Success

# 500 Server Error

Updated 8 months ago

---


---

## get_v1-panel-card-id

**URL:** `https://flwchat.readme.io/reference/get_v1-panel-card-id`

id

uuid

required

ID do card.

IncludeDetails

array of strings

Detalhes que devem ser incluídos na resposta.

IncludeDetails

ADD  string

# 200 Success

# 500 Server Error

Updated 8 months ago

---


---

## put_v2-panel-card-id

**URL:** `https://flwchat.readme.io/reference/put_v2-panel-card-id`

id

string

required

ID do card.

Dados para atualização do card.

fields

array of strings | null

Campos a serem atualizados.

fields

ADD  string

stepId

uuid | null

ID da etapa do painel para onde o item deverá ser movido.

title

string | null

Título do item.

description

string | null

Descrição do item.

position

double | null

0 to 2147483647

Posição do item na etapa.

dueDate

date-time | null

Data de vencimento do item.

responsibleUserId

uuid | null

ID do usuário responsável pelo item.

tagIds

array of uuids | null

IDss das etiquetas atribuídas.

tagIds

ADD  uuid

tagNames

array of strings | null

Nomes das etiquetas atribuídas. Este campo será ignorado caso `TagIds` seja definido.

tagNames

ADD  string

contactIds

array of uuids | null

IDs dos contatos relacionados ao item.

contactIds

ADD  uuid

sessionId

uuid | null

ID da conversa relacionada ao item.

monetaryAmount

double | null

Valor monetário atribuído ao item.

archived

boolean | null

Determina o status de arquivamento do item.

truefalse

customFields

object | null

Objeto chave-valor para definir valores de campos personalizados no item.
Cada item do objeto deverá ter como nome a chave do campo personalizado.
Caso a chave não corresponda a algum campo personalizado ou o tipo de dados do valor seja incompatível, o item será ignorado.

customFields object | null

metadata

object | null

Metadados relevantes para o item. Neste campo, pode ser salvo qualquer propriedade adicional para o item, na estrutura chave-valor.

- Para adicionar um metadado: utilize uma chave não utilizada anteriormente neste item, atribuindo o novo valor;
- Para atualizar um metadado: utilize a chave salva anteriormente neste item, atribuindo o novo valor;
- Para remover um metadado: utilize a chave salva anteriormente, atribuindo valor nulo.

metadata object | null

# 200 Success

# 500 Server Error

Updated 8 months ago

---


---

## post_v1-panel-card-id-duplicate

**URL:** `https://flwchat.readme.io/reference/post_v1-panel-card-id-duplicate`

id

uuid

required

ID do card.

Dados para duplicação do card.

copyToStepId

uuid | null

ID da etapa de destino, pode ser uma etapa do mesmo painel ou de outro painel. Se vazio, mantem a cópia na mesma etapa.

options

object

options object

# 200 Success

# 500 Server Error

Updated 8 months ago

---


---

## get_v1-panel-card-cardid-note

**URL:** `https://flwchat.readme.io/reference/get_v1-panel-card-cardid-note`

cardId

uuid

required

ID do card.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

# 200 Success

# 500 Server Error

Updated 8 months ago

---


---

## post_v1-panel-card-cardid-note

**URL:** `https://flwchat.readme.io/reference/post_v1-panel-card-cardid-note`

cardId

uuid

required

ID do card.

Dados para criação da anotação.

text

string | null

Texto da anotação.

fileUrls

array of strings | null

URL pública de algum arquivo que deseja-se anexar à anotação.
O tamanho máximo permitido para um arquivo é de 25MB.

fileUrls

ADD  string

# 200 Success

# 500 Server Error

Updated 8 months ago

---


---

## delete_v1-panel-card-cardid-note-noteid

**URL:** `https://flwchat.readme.io/reference/delete_v1-panel-card-cardid-note-noteid`

cardId

uuid

required

ID do card.

noteId

uuid

required

ID da anotação.

200

Success

# 500 Server Error

Updated 8 months ago

---


---

## get_v1-panel

**URL:** `https://flwchat.readme.io/reference/get_v1-panel`

Title

string

Filtro por título do painel.

IncludeDetails

array of strings

Detalhes que devem ser incluídos na resposta.

IncludeDetails

ADD  string

CreatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

CreatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

UpdatedAt.Before

date-time

Limite superior de busca, sempre em fuso horário UTM.

UpdatedAt.After

date-time

Limite inferior de busca, sempre em fuso horário UTM.

PageNumber

int32

0 to 2147483647

Defaults to 1

Número da página a ser obtida.

PageSize

int32

1 to 100

Defaults to 15

Tamanho da página a ser obtida.

OrderBy

string

Nome do campo para ser utilizado como pivô da ordenação.

OrderDirection

string

enum

Determina se a ordenação deve ser crescente ou decrescente.

ASCENDINGDESCENDING

Allowed:

`ASCENDING``DESCENDING`

# 200 Success

# 500 Server Error

Updated almost 2 years ago

---


---

## get_v1-panel-id

**URL:** `https://flwchat.readme.io/reference/get_v1-panel-id`

id

uuid

required

ID do painel.

IncludeDetails

array of strings

Detalhes que devem ser incluídos na resposta.

IncludeDetails

ADD  string

# 200 Success

# 500 Server Error

Updated about 2 years ago

---


---

## get_v1-panel-id-custom-fields

**URL:** `https://flwchat.readme.io/reference/get_v1-panel-id-custom-fields`

id

uuid

required

ID do painel.

NestedList

boolean

Defaults to false

Determina a estrutura da lista retornada. Se verdadeiro, os campos serão retornados de forma aninhada, isto é, estruturado em grupos.

truefalse

# 200 Success

# 500 Server Error

Updated about 2 years ago

---



---

## Status da Extração

- **Total:** 108 endpoints
- **Sucesso:** 107
- **Falhas:** 1


### Páginas com falha

- `delete_v1-department-id`: Conteúdo muito curto