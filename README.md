# Lab 7: API Gateway, Service Discovery & Cloud Deployment

## 1. Project Overview

This project extends the microservices application developed in Lab 6.

The system contains three existing microservices:

- User Service
- Product Service
- Order Service

In Lab 7, an **API Gateway** is added as a single entry point for clients. The Gateway receives client requests and forwards them to the appropriate microservice.

The services communicate with each other through a Docker network, while only the API Gateway is exposed to the host machine.

---

## 2. Technologies Used

- Node.js
- Express.js
- MongoDB
- Docker
- Docker Compose
- API Gateway
- HTTP Proxy Middleware
- Postman
- Environment Variables

---

## 3. Architecture

```text
                    Client / Postman
                           |
                           | HTTP Requests
                           v
                 +--------------------+
                 |    API Gateway     |
                 |      Port 3000     |
                 +--------------------+
                    /       |       \
                   /        |        \
                  v         v         v
          +----------+ +----------+ +----------+
          |   User   | | Product  | |  Order   |
          | Service  | | Service  | | Service  |
          |  :3001   | |  :3002   | |  :3003   |
          +----------+ +----------+ +----------+
                |           |           |
                v           v           v
             MongoDB     MongoDB     MongoDB

All services communicate through the Docker network:

campus-network

Only the API Gateway is externally exposed:

localhost:3000

The User, Product and Order services are not directly exposed to the host.

4. API Gateway

The API Gateway acts as the single entry point to the microservices.

Instead of clients directly accessing:

User Service
Product Service
Order Service

the client sends requests to:

API Gateway

The Gateway then forwards the request to the appropriate service.

Gateway Routes
Gateway Route	Target Service
/users	User Service
/products	Product Service
/orders	Order Service
/health	API Gateway

Examples:

GET http://localhost:3000/users
GET http://localhost:3000/products
GET http://localhost:3000/orders
GET http://localhost:3000/health
5. API Gateway Responsibilities

The API Gateway performs the following functions:

Provides a single entry point for clients.
Routes requests to the correct microservice.
Logs incoming requests and response status.
Handles unavailable downstream services.
Uses environment variables for service URLs.
Runs as a Docker container.
Communicates with other services through the Docker network.
6. Service Discovery

Service discovery allows services to locate and communicate with each other.

In this project, Docker Compose provides service discovery through Docker's internal DNS.

The service names are used as hostnames.

For example:

http://user-service:3001
http://product-service:3002
http://order-service:3003

The API Gateway does not use localhost to communicate with the other containers.

For example:

USER_SERVICE_URL=http://user-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
ORDER_SERVICE_URL=http://order-service:3003

Docker resolves these service names inside the Docker network.

7. Static vs Dynamic Service Discovery
Static Service Discovery

In static service discovery, service addresses are configured manually.

For example:

USER_SERVICE_URL=http://user-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
ORDER_SERVICE_URL=http://order-service:3003

The application knows the service names and ports from its configuration.

Dynamic Service Discovery

In dynamic service discovery, services can register themselves with a service registry, and other services discover their current location dynamically.

Examples of service discovery systems include:

Consul
Eureka
Kubernetes service discovery
Service Discovery Used in This Lab

This Lab uses Docker Compose service discovery.

Docker Compose creates a network and allows containers to communicate using their service names.

This is simpler than using a separate service registry and is suitable for the Docker Compose environment used in this lab.

8. Environment Configuration

Service URLs are externalized using environment variables.

API Gateway Environment Variables
PORT=3000

USER_SERVICE_URL=http://user-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
ORDER_SERVICE_URL=http://order-service:3003

The Gateway reads these values using dotenv and process.env.

This avoids hardcoding service URLs directly into the application logic.

9. Docker Deployment

The project uses Docker Compose to run all services.

The main containers are:

api-gateway
user-service
product-service
order-service
user-db
product-db
order-db

The Gateway is exposed on:

3000

The microservices communicate internally through:

campus-network

The databases are also connected to the Docker network.

10. Running the Project

Open a terminal in the ass 7 directory.

Run:

docker compose up --build

To run the containers in detached mode:

docker compose up --build -d

To check running containers:

docker ps

To stop the application:

docker compose down
11. API Testing Using Postman

The API Gateway was tested using Postman.

Health Check

Request:

GET http://localhost:3000/health

Expected result:

{
  "success": true,
  "service": "API Gateway",
  "status": "healthy"
}
User Service

Request:

GET http://localhost:3000/users

The Gateway forwards the request to the User Service.

Product Service

Request:

GET http://localhost:3000/products

The Gateway forwards the request to the Product Service.

Order Service

Request:

GET http://localhost:3000/orders

The Gateway forwards the request to the Order Service.

12. Request Logging

The API Gateway contains request logging middleware.

For each request, the Gateway logs:

HTTP method
Requested URL
Target service
Response status code
Response time

Example:

GET /users -> User Service -> 200 (15ms)

Gateway logs can be viewed using:

docker logs api-gateway

or:

docker logs api-gateway --tail 30
13. Handling Unreachable Services

The Gateway also handles situations where a downstream service is unavailable.

For example, the Product Service can be stopped using:

docker stop product-service

Then:

GET http://localhost:3000/products

is sent through the Gateway.

Since the Product Service is unavailable, the Gateway returns an error response instead of leaving the request unresolved.

Example:

{
  "success": false,
  "message": "Target service unavailable"
}

The HTTP status used by the Gateway for this condition is:

503 Service Unavailable

The Product Service can then be started again:

docker start product-service

After restarting the service:

GET http://localhost:3000/products

can be tested again to verify that the service is available.

14. Port Exposure

Only the API Gateway is exposed to the host machine.

API Gateway  ->  localhost:3000

The following services are internal Docker services:

User Service     -> 3001
Product Service  -> 3002
Order Service    -> 3003

They communicate through:

campus-network

This means clients access the application through the Gateway rather than directly accessing individual microservices.

15. Project Structure
ass 7/
│
├── api-gateway/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── Dockerfile
│
├── user-service/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── Dockerfile
│
├── product-service/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── Dockerfile
│
├── order-service/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── Dockerfile
│
├── ss/
│   └── Postman and Docker screenshots
│
├── compose.yaml
├── .gitignore
└── README.md
16. Troubleshooting
Port 3000 Already in Use

If port 3000 is already being used by another container, check:

docker ps

Stop the container using the port:

docker stop <container-name>

Then start the Lab 7 services again.

Container Name Conflict

If Docker reports that a container name is already in use, check:

docker ps -a

The conflicting container can be stopped or removed before starting the Lab 7 Compose setup.

Gateway Not Reachable

Check whether the Gateway is running:

docker ps

Check Gateway logs:

docker logs api-gateway

Also verify that port 3000 is mapped correctly.

Downstream Service Unavailable

Check the status of the service:

docker ps

Check its logs:

docker logs product-service

or:

docker logs user-service

or:

docker logs order-service
17. API Gateway Discussion

An API Gateway is useful in a microservices architecture because clients do not need to communicate separately with every microservice.

Without a Gateway, a client may need to know the location of the User, Product and Order services.

With a Gateway:

Client
   |
   v
API Gateway
   |
   +----> User Service
   |
   +----> Product Service
   |
   +----> Order Service

The Gateway provides a single entry point and can also handle common responsibilities such as routing, logging and error handling.

18. Deployment Architecture

The application is containerized using Docker.

The deployment consists of:

Client
  |
  v
API Gateway
  |
  +---- User Service ---- User MongoDB
  |
  +---- Product Service - Product MongoDB
  |
  +---- Order Service --- Order MongoDB

All containers communicate through the Docker network.

19. Cloud Deployment

The Lab 7 application is designed to be deployed as containers on a cloud platform.

For cloud deployment, the service URLs are provided through environment variables instead of hardcoding them.

The cloud deployment requires the Gateway to be publicly accessible while the microservices communicate internally or through their configured service URLs.

The public Gateway URL can then be used from Postman for testing.

Example:

https://<public-gateway-url>/health
https://<public-gateway-url>/users
https://<public-gateway-url>/products
https://<public-gateway-url>/orders
20. Testing Evidence

The ss folder contains screenshots showing the implementation and testing of Lab 7.

The evidence includes:

API Gateway health check
User Service through Gateway
Product Service through Gateway
Order Service through Gateway
Docker containers
Service availability/error testing
Gateway request logging
21. Reflection

This lab helped in understanding how an API Gateway can provide a single entry point for a microservices application. I learned how requests can be routed from the Gateway to different services using service-specific URLs. Docker Compose service names were used for communication between containers through a shared Docker network. Environment variables were used to keep service configuration separate from the application code. I also learned how the Gateway can handle unavailable downstream services and log requests. Overall, the lab provided practical understanding of API Gateway, service discovery, container networking and microservices deployment.

22. Conclusion

Lab 7 extends the Lab 6 microservices application by introducing an API Gateway, Docker-based service discovery, centralized request routing, logging and service failure handling.

The final architecture provides a single entry point for clients while keeping the individual microservices connected through the Docker network.
