# ChillCrib - Software Design 

Version 1  
Prepared by Blue Team 11\
ChillCrib\
Oct 20, 2025

Table of Contents
=================
* [Revision History](#revision-history)
* 1 [Product Overview](#1-product-overview)
* 2 [Use Cases](#2-use-cases)
  * 2.1 [Use Case Model](#21-use-case-model)
  * 2.2 [Use Case Descriptions](#22-use-case-descriptions)
    * 2.2.1 [Actor: Provider](#221-actor-provider)
    * 2.2.2 [Actor: Customer](#222-actor-customer) 
* 3 [UML Class Diagram](#3-uml-class-diagram)
* 4 [Database Schema](#4-database-schema)

## Revision History
| Name | Date    | Reason For Changes  | Version   |
| ---- | ------- | ------------------- | --------- |
|  Gio |10/8     | Initial Design      |    1      |
|      |         |                     |           |
|      |         |                     |           |

## 1. Product Overview
ChillCrib is a simple, comprehensive, easy to use web-based rental platform that connects travelers with property owners for short-term accommodations. Property providers and customers make use of the centralized platform to meet their rental needs. 
Providers create and publish property listings, customers browse available properties and can book stays, leave reviews, and manage subscriptions for additional services.

## 2. Use Cases
### 2.1 Use Case Model
![Use Case Model](https://github.com/gjgarcialop-rgb/blue-team11/blob/Allen-Orozco-Lopez-milestone3/doc/Objected-Oriented-Design/Blueteam-BoxModel.png)

### 2.2 Use Case Descriptions

#### 2.2.1 Actor: Provider
##### 2.2.1.1 Sign Up
A provider can sign up to create their profile with their name, email, password, and phone number. Emails must be unique.
##### 2.2.1.2 Log In
A provider shall be able to sign in using their registered email and password. After logging in, the provider shall be directed to their dashboard where they see an overview of their properties, bookings, and earnings.
##### 2.2.1.3 Update Profile
A provider shall be able to modify their profile by going to their profile page. They can change their email, password, and contact information.
##### 2.2.1.4 Create Property Listings
The provider shall be able to create a new property listing. They would provide a property title, description, location, price per night, maximum guests, and amenities. This property will be associated only with this provider.
##### 2.2.1.5 Manage Properties
A provider will be able to view and manage their property listings, update availability, view booking statistics, and see total earnings.
##### 2.2.1.6 View Customer Stats
A provider will be able to view several statistics such as total bookings, total revenue, and property ratings.

#### 2.2.2 Actor: Customer
##### 2.2.2.1 Sign Up
A customer can sign up to create their profile with their name, email, password, and address. Emails must be unique.
##### 2.2.2.2 Log In
A customer shall be able to sign in using their registered email and password. After logging in, the customer shall be directed to their dashboard where they see an overview of their bookings and subscriptions.
##### 2.2.2.3 Browse Properties
A customer shall be able to view available rental properties. They can do this from the listings page or using a search function. They can also filter properties by location, price, or amenities. They will also be able to select one property and view more details.
##### 2.2.2.4 Book Properties
Upon selecting a property, a customer shall be able to make a booking by providing guest details, check-in/check-out dates, and number of guests. This booking will then appear on their dashboard.
##### 2.2.2.5 Manage Subscriptions
A customer may subscribe to additional services such as insurance protection, cleaning services, or rental equipment. They can manage these subscriptions from their dashboard.
##### 2.2.2.6 Review Properties
A customer may write a review for a property they have stayed at. They will be able to rate the property and provide written feedback about their experience.

## 3. UML Class Diagram
![UML Class Diagram](https://github.com/gjgarcialop-rgb/blue-team11/blob/main/doc/Objected-Oriented-Design/Blueteam-UML.png)
## 4. Database Schema
![Database Schema](https://github.com/gjgarcialop-rgb/blue-team11/blob/main/doc/Objected-Oriented-Design/Blueteam11-Schema.png)
