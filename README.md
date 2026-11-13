<<<<<<< HEAD
# MetalTech - Front-end (React)
=======
# Front-end
Frontend de uma aplicação desenvolvido com React, responsável pela interface e interação dos usuários com o sistema.  O projeto consome a API REST disponibilizada pelo backend, proporcionando uma experiência de navegação intuitiva e comunicação entre as camadas da aplicação.
>>>>>>> e166cc13573c074692a95e7f871ce83e24f90c72

## Como rodar
```
npm install
npm run dev
```
Abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

## Ligar na API
Copie `.env.example` para `.env` e ajuste `VITE_API_URL` com o endereço do Spring Boot.
O front espera `GET /leituras` retornando uma lista em ordem cronológica:

```
{ "id": 1, "horario": "2026-11-11T14:32:10Z", "tipo": "METALICA" | "NAO_METALICA",
  "sensor": "INDUTIVO" | "CAPACITIVO", "nivel": 87.0, "distanciaMm": 13 }
```
Se a API estiver fora do ar, aparece "API offline: sem dados" e todas as telas ficam zeradas.
Para mudar rota ou campos, edite só a parte "ÁREA DO BACK-END" do arquivo `src/api.js`.

## Realidade Aumentada
Menu "Realidade Aumentada": usa A-Frame + MindAR (arquivos em `public/ra/`).
- `targets.mind`: alvo compilado (foto da mesa).
- `index.html`: cena de RA. Para mudar a posição de cada sensor, edite a lista `SENSORES` (x e y de 0 a 1 na foto).
- Coloque a foto original em `public/ra/alvo.jpg` para ela aparecer na tela, caso queira escanear pelo monitor.
- A câmera funciona em `localhost` ou em HTTPS (no celular, só em HTTPS).
