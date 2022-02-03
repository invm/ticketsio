# Tickets.io

> Buy and sell tickets for the hottest shows, concerts, games, and more!

Tickets.io is an application that allows users to create tickets for different events for sale, allows users to create purchase them and pay with credit cards with the help of Stripe API. 
The trivial functionality includes authentication with jwt, creation of a user, ticket, order, and payment entities, each in its service, and some replicated with the relevant fields between services, also there is a locking mechanism that allows the users to lock the ticket for a specific time frame that implemented with a task queue using bull npm module and redis.

Implemented with microservices architecture, fully written in typescript with a common library shared between all the services to allow maximum code and types reusability.  Every route, event listener, and event publisher is tested, with automatic Github action workflow, all the functions are also documented in a postman collection with examples to all possible responses for every request.

The application is built with the following tech stack:

- Typescript
- Nodejs
- Mongodb
- Kubernetes 
- Docker
- Skaffold
- Redis

## How to run

- Install kubectl, skaffold, docker.
- run ```minikube addons enable ingress```
- Create jwt key kubectl secret ```kubectl create secret generic jwt-secret --from-literal JWT_KEY=asdf)```
- Create stripe key kubectl secret ```kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=asdf)```
- In payments service, add stripe key in .env file in order to run tests locally and add Github action secret as STRIPE_KEY
