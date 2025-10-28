# ChillCrib API Documentation

## Customer API Endpoints

### Create Customer
```json
POST /api/customers
Content-Type: application/json
{
    "name": "John Doe",
    "email": "exampel1@gmail.com",
    "password": "password123",
    "address": "1st Street New York, New York 123456",
    "identifier": "username123",
    "phone_number": "123-456-7890"
}
```

### Update Customer
```json
{
    "name": "John Doey",
    "email": "1stexample@gmail.com",
    "password": "password456",
    "address": "2nd Blvd New York, New York 789012",
    "identifier": "username345",
    "phone_number": "789-456-1234"
}
```

### Get Customer
````json
GET /api/customers/{id}
````

### Get all Customers
````json
GET /api/customers
````

### Delete Customers
````json
DELETE /api/customers/{id}
````

## Provider API Endpoints

### Create Provider
````json
POST /api/providers
Content-Type: application/json
{
    "name": "John Doe",
    "email": "example1@gmail.com",
    "password": "password123",
    "address": "1st St New York, New York 789012",
    "identifier": "username123",
    "phone_number": "789-456-1234"
}
````
### Update Provider
````json
{
    "name": "John Doey",
    "email": "1stexample@gmail.com",
    "password": "password456",
    "address": "2nd Blvd New York, New York 789012",
    "identifier": "username345",
    "phone_number": "789-456-1234",
    "rating": 0.0,
    "total_earnings": 0.0,
}
````
### Get Provider
````json
GET /api/providers/{id}
````

## Proprty API Endpoints

### Create Customer
```json
POST /api/customers
Content-Type: application/json
{
    "name": "John Doe",
    "email": "exampel1@gmail.com",
    "password": "password123",
    "address": "1st Street New York, New York 123456",
    "identifier": "username123",
    "phone_number": "123-456-7890"
}
```