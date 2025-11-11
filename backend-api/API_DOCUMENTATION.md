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
PUT /api/customers/{id}
Content-Type: application/json
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
PUT /api/providers/{id}
Content-Type: application/json
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

## Property API Endpoints

### Create Property
```json
POST /api/properties
Content-Type: application/json
{
    "amenities": "Beach View, Dryers and Washers, etc..",
    "bookings-this-month": 0,
    "current_image_index": 0,
    "description": "Example description goes here.",
    "is_active": TRUE,
    "location": "123 1st St, New York City, New York 123456",
    "max_guests": 7,
    "price_per_night": 350.00,
    "title": "Beach House",
    "provider_id": 1,
}
```
### Update Property
```json
PUT /api/properties/{id}
Content-Type: application/json
{
    "amenities": "Beach View, Dryers and Washers, Hot Tub, Bar Nearby, Free WIfi, etc...",
    "bookings-this-month": 3,
    "current_image_index": 0,
    "description": "This Beachhouse is an excellent choice for your visit to the Outer Banks of North Carolina.",
    "is_active": FALSE,
    "location": "123 2nd St, New York City, New York 123456",
    "max_guests": 7,
    "price_per_night": 450.00,
    "title": "Beach House",
    "provider_id": 1,
}
```

### Get Property
````json
GET api/properties/{id}
````

### Get all Properties
````json
GET /api/properties
````

## Subscription API Endpoints

### Create Subscription
```json
POST /api/subscriptions
Content-Type: application/json
{
    "type": "BASIC",
    "is_active": "FALSE",
    "start_date": 2025-10-31 00:00:00,
    "end_date": 2025-11-30 00:00:00,
    "customer_id": 1
}
```

### Update Subscription
````json
PUT /api/subscriptions/{id}
Content-Type: application/json
{
    "type": "PREMIUM",
    "is_active": "TRUE",
    "start_date": 2025-11-30 00:00:00,
    "end_date": 2025-12-31 11:59:59,
    "customer_id": 1
}
````
### Get Subscription
````json
GET /api/subscriptions/{id}
````

## Review API Endpoints

### Create Review
````json
POST /api/reviews
Content-Type: application/json
{
    "guest_name": "John Doe",
    "rating": 5.0,
    "comment": "This crib really was chill and I highly recommend it.",
    "customer_id": 1,
    "property_id": 3
}
````

### Get all Reviews
````json
GET /api/reviews
````
### Get a specific Review
````json
GET /api/reviews/{id}
````