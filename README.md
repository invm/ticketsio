# Tickets.io

> Buy and sell tickets for the hottest shows, concerts, games and more!

## How to run

- Install kubectl, skaffold, docker.
- run ```minikube addons enable ingress```
- Creeate kubectl secret (kubectl create secret generic jwt-secret
	--from-literal=JWT_KEY=asdf)
