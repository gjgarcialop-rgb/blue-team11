# Software Requirements Specification
## For <ChillCrib>

Version 0.1  
Prepared by <Giovanni Garica Lopez>  
<organization>  
<9/15/25> 

Table of Contents
=================
* [Revision History](#revision-history)
* 1 [Introduction](#1-introduction)
  * 1.1 [Document Purpose](#11-document-purpose)
  * 1.2 [Product Scope](#12-product-scope)
  * 1.3 [Definitions, Acronyms and Abbreviations](#13-definitions-acronyms-and-abbreviations)
  * 1.4 [References](#14-references)
  * 1.5 [Document Overview](#15-document-overview)
* 2 [Product Overview](#2-product-overview)
  * 2.1 [Product Functions](#21-product-functions)
  * 2.2 [Product Constraints](#22-product-constraints)
  * 2.3 [User Characteristics](#23-user-characteristics)
  * 2.4 [Assumptions and Dependencies](#24-assumptions-and-dependencies)
* 3 [Requirements](#3-requirements)
  * 3.1 [Functional Requirements](#31-functional-requirements)
    * 3.1.1 [User Interfaces](#311-user-interfaces)
    * 3.1.2 [Hardware Interfaces](#312-hardware-interfaces)
    * 3.1.3 [Software Interfaces](#313-software-interfaces)
  * 3.2 [Non-Functional Requirements](#32-non-functional-requirements)
    * 3.2.1 [Performance](#321-performance)
    * 3.2.2 [Security](#322-security)
    * 3.2.3 [Reliability](#323-reliability)
    * 3.2.4 [Availability](#324-availability)
    * 3.2.5 [Compliance](#325-compliance)
    * 3.2.6 [Cost](#326-cost)
    * 3.2.7 [Deadline](#327-deadline)

## Revision History
| Name | Date    | Reason For Changes  | Version   |
| Gio  | 9/16/25 | Answering questions | 0.1       |
| Allen|9/17/2025| Answering Questions | 0.1.1     |
|      |         |                     |           |
|      |         |                     |           |

## 1. Introduction

### 1.1 Document Purpose
The purpose of this document is to define the basic functions from our app ChillCrib. This is a web-based application for viewing and renting an AirBNB for how long you'll stay. The document is intended for anyone who uses the app or wants to view it. ChillCrib will guide early development and provide updates along the way.

### 1.2 Product Scope
ChillCrib v0.1 will serve as a platform where users can rent or view the listing provided on the app. This will have basic details about what you're looking at but this current version will not have features until we further update. These features can be booking payment plans, booking features with tiers. At the moment it will focus on providing a clean interface for browinf and listing and diplaying property information. The main goals are:
1. Allow the user to view the list of properties
2. Give details on who owns the property, location, and price.
3. Creates a foundation for what is coming for the user and rental owners.

### 1.3 Definitions, Acronyms and Abbreviations                                     
SRS // Software Requirement Specification
UI // User interface
v0.1 // Initial release version and mainly just viewing

### 1.4 References
https://www.airbnb.com
IEEE Std 830-1998, IEEE Recommended Practice for Software Requirements Specifications.
https://airbnb.io/projects/javascript/
AirBNB Privacy Policy
https://www.airbnb.com/help/article/2855
AirBNB Security
https://www.airbnb.com/e/security

### 1.5 Document Overview
The rest of the document will outline early designs for ChillCrib or future designs that will come. Section two will show and overview of the product which will includes goals, functions, etc. Section three will talk about functionality and non-functional requirements for version 0.1 which focuses on browsing the app and what kind of limits it has.

## 2. Product Overview
This section should describe the general factors that affect the product and its requirements. This section does not state specific requirements. Instead, it provides a background for those requirements, which are defined in detail in Section 3, and makes them easier to understand.

### 2.1 Product Functions
* We will have a homepage wih navigation buttons for viewing the main page, listings
* There wil be a serch box for searching by location, name, or even by person (the,renter).
* We will allow users to browse through a list of available rentals
* There will be a details page for each property.


### 2.2 Product Constraints
* It must be able to run in any modern web brower on mobile and PC.
* It will require an internet connection.
* It is a web based application, using HTML, CSS, Javascript and possibly others.
  
### 2.3 User Characteristics
* Customer: They can browse listings, view details on the provider, and have a clean UI.
* Provider: This will be a future user, not included in version 0.1
* SysAdmin: In the future, they will be able to moderate users, reviews, and listings.

### 2.4 Assumptions and Dependencies
* Assume that the user has a stable internet connection to access the page.
* We may add 3rd Party APIs in the future for anything like payments, map details, login (with google, facebook, etc... buttons)
* Will rely on a databse for storing property information in the future.

## 3. Requirements

### 3.1 Functional Requirements 
- FR-0: Core Browsing Capability
System shall allow users to browse and view rental properties through a web-based interface
- FR-1: Homepage Navigation
System shall display homepage with navigation links such as home, listing, etc.
- FR-2: Property Listing
System shall allow users to view a list of available rental properties which lists the name, location, price, and small info about them.
- FR-3: Property Details
System shall allow users to click on a property they want and provide a description for them and a detail page which shows images and amenities.

#### 3.1.1 User interfaces
The system shall show a homepage with navigation keys such as (Home, Listings, About Us, Contact,)
It shall show users the ability to view which houses are available with basic info.
(List, Prices, owner description, avalibility, group size.)
The system shall give search bar to look up places.

#### 3.1.2 Hardware interfaces
No specialized hardware is needed.
The system shall support basic inputs such as mouse and keyboard for now.

#### 3.1.3 Software interfaces
System shall run on computer only and web browser like Google.
It shall connect to a basic backend or database for storing property info.
System shall be compatible with standard HTML,CSS, and JavaScript

### 3.2 Non Functional Requirements 

#### 3.2.1 Performance
* The webpage should run smoothly with no lagspikes. 
* Pages should be able to load fully within 3-5 seconds.
* Images should fully load, provided they are in the accepted formats (jpg, png, jpeg, etc...) 
#### 3.2.2 Security
ChillCrib version 0.1 is a basic web app With no current sensitive data, but in the future, we may refer to GDPR and CCPA for basic security. We also may in the future encrypt our web app with HTTPS for better data protection.
#### 3.2.3 Reliability
or version 1.0, we may display a message or error in the case of any serious errors in our prototype. We are aiming to alawys test the webite to ensure reliability before publishing for users to access. 
#### 3.2.4 Availability
Chillcrib is aiming to be available up to 95% of the time to our users. For our version 1.0 prototype, we may display a simple message such as "Site unavailable" whenever we are working on it, with a short downtime so users dont have to wait long to re-access the site. 
#### 3.2.5 Compliance
The ChillCrib site will follow basic modern standards for HTML, CSS, javascript, and any other languages we may use. Version 0.1 does not handle user data, but will need to comply with laws in the future. 
#### 3.2.6 Cost
ChillCrib is aiming towards using all open source products and APIs to minimize any costs for us. Our hosting costs should be minimal, as we are aiming to deploy on basic web hosting services, with a small monthly cost for a backened database, roughly 5-10$. For version 1, we wont be having any licensing costs associated. Overall, we are aiming for a low cost option. 
#### 3.2.7 Deadline
We are aiming for ChillCrib's final product to be complete on December 2025, with currently unknown times for different versions of our websites beta to be complete