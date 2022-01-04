# Tickets.io

> Buy and sell tickets for the hottest shows, concerts, games and more!

## How to run

- Install kubectl, skaffold, docker.
- run ```minikube addons enable ingress```
- Create jwt key kubectl secret ```kubectl create secret generic jwt-secret --from-literal JWT_KEY=asdf)```
- Create stripe key kubectl secret ```kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=asdf)```
- In payments service, add stripe key in .env file in order to run tests locally and add github action secret as STRIPE_KEY
