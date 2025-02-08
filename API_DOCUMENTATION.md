# Organization Management System API Documentation

## Base URL
```
http://your-api-base-url/api/v1
```

## Table of Contents
1. [Authentication](#authentication)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Organization Endpoints](#organization-endpoints)
4. [User Endpoints](#user-endpoints)
5. [Response Formats](#response-formats)
6. [Role System](#role-system)
7. [Error Handling](#error-handling)

## Authentication
- All protected routes require Bearer token authentication
- Token Format: `Authorization: Bearer <jwt_token>`
- Token Expiration: 24 hours
- Include token in request headers for all protected routes

## Authentication Endpoints

### 1. Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response: (200 OK)**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "jwt_token_string",
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "profilePicture": "profile_picture_url",
      "organizations": []
    }
  }
}
```

**Error Response: (400 Bad Request)**
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 2. Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response: (200 OK)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_string",
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "profilePicture": "profile_picture_url",
      "organizations": []
    }
  }
}
```

**Error Response: (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 3. Get All Users
```http
GET /auth/users
```

**Authentication Required:** Yes

**Success Response: (200 OK)**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "user_id",
        "name": "User Name",
        "email": "user@example.com",
        "profilePicture": "profile_picture_url",
        "organizations": []
      }
    ]
  }
}
```

**Error Response: (500 Internal Server Error)**
```json
{
  "success": false,
  "message": "Error retrieving users",
  "error": "Error message"
}
```

## Organization Endpoints

### 1. Create Organization
```http
POST /organizations
```

**Authentication Required:** Yes

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (required)",
  "logo": "string (optional)"
}
```

**Success Response: (201 Created)**
```json
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "organization": {
      "_id": "org_id",
      "name": "Organization Name",
      "description": "Organization Description",
      "logo": "logo_url",
      "owner": "user_id",
      "members": [
        {
          "user": "user_id",
          "role": "owner"
        }
      ]
    }
  }
}
```

### 2. Update Organization
```http
PUT /organizations/:orgId
```

**Authentication Required:** Yes
**Required Roles:** owner, admin

**URL Parameters:**
- orgId: Organization ID (string)

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "logo": "string (optional)"
}
```

**Success Response: (200 OK)**
```json
{
  "success": true,
  "message": "Organization updated successfully",
  "data": {
    "organization": {
      "_id": "org_id",
      "name": "Updated Name",
      "description": "Updated Description",
      "logo": "updated_logo_url"
    }
  }
}
```

### 3. Delete Organization
```http
DELETE /organizations/:orgId
```

**Authentication Required:** Yes
**Required Role:** owner only

**URL Parameters:**
- orgId: Organization ID (string)

**Success Response: (200 OK)**
```json
{
  "success": true,
  "message": "Organization deleted successfully"
}
```

### 4. Get User's Organizations
```http
GET /organizations/all
```

**Authentication Required:** Yes

**Success Response: (200 OK)**
```json
{
  "success": true,
  "message": "Organizations retrieved successfully",
  "data": {
    "organizations": [
      {
        "_id": "org_id",
        "name": "Organization Name",
        "description": "Organization Description",
        "logo": "logo_url",
        "owner": "user_id",
        "members": [
          {
            "user": {
              "_id": "user_id",
              "name": "User Name",
              "email": "user@example.com"
            },
            "role": "owner"
          }
        ]
      }
    ]
  }
}
```

### 5. Update User Role
```http
PUT /organizations/:orgId/users/:userId/role
```

**Authentication Required:** Yes
**Required Roles:** owner, admin

**URL Parameters:**
- orgId: Organization ID (string)
- userId: User ID (string)

**Request Body:**
```json
{
  "role": "string (required)" // "admin" or "member"
}
```

**Success Response: (200 OK)**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "role": "updated_role"
    }
  }
}
```

### 6. Manage Organization Members
```http
POST /organizations/:orgId/users/:userId
```

**Authentication Required:** Yes
**Required Roles:** owner, admin

**URL Parameters:**
- orgId: Organization ID (string)
- userId: User ID (string)

**Request Body:**
```json
{
  "action": "string (required)", // "add" or "remove"
  "role": "string (required when action is add)" // "admin" or "member"
}
```

**Success Response: (200 OK)**
```json
{
  "success": true,
  "message": "Member added/removed successfully",
  "data": {
    "organization": {
      "_id": "org_id",
      "name": "Organization Name",
      "members": [
        {
          "user": "user_id",
          "role": "role_name"
        }
      ]
    }
  }
}
```

### 7. Get Organization Members
```http
GET /organizations/:organizationId/members
```

**Authentication Required:** Yes

**URL Parameters:**
- organizationId: Organization ID (string)

**Success Response: (200 OK)**
```json
{
  "success": true,
  "message": "Members retrieved successfully",
  "data": {
    "members": [
      {
        "user": {
          "_id": "user_id",
          "name": "User Name",
          "email": "user@example.com",
          "profilePicture": "profile_picture_url"
        },
        "role": "role_name"
      }
    ]
  }
}
```

### 8. Get Remaining Users Not in Organization
```http
GET /auth/organizations/:orgId/remaining-users
```

**Authentication Required:** Yes

**URL Parameters:**
- orgId: Organization ID (string)

**Success Response: (200 OK)**
```json
{
  "success": true,
  "message": "Remaining users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "user_id",
        "name": "User Name",
        "email": "user@example.com",
        "profilePicture": "profile_picture_url",
        "organizations": []
      }
    ]
  }
}
```

**Error Response: (404 Not Found)**
```json
{
  "success": false,
  "message": "Organization not found"
}
```

**Error Response: (500 Internal Server Error)**
```json
{
  "success": false,
  "message": "Error retrieving remaining users",
  "error": "Error message"
}
```

### 9. Get Organization by ID
```http
GET /organizations/:orgId
```

**Authentication Required:** Yes

**URL Parameters:**
- orgId: Organization ID (string)

**Success Response: (200 OK)**
```json
{
  "success": true,
  "message": "Organization retrieved successfully",
  "data": {
    "_id": "org_id",
    "name": "Organization Name",
    "description": "Organization Description",
    "logo": "logo_url",
    "owner": {
      "_id": "user_id",
      "name": "Owner Name",
      "email": "owner@example.com",
      "logo": "logo_url"
    },
    "members": [
      {
        "user": {
          "_id": "user_id",
          "name": "Member Name",
          "email": "member@example.com",
          "logo": "logo_url"
        },
        "role": "member"
      }
    ]
  }
}
```

**Error Response: (404 Not Found)**
```json
{
  "success": false,
  "message": "Organization not found"
}
```

**Error Response: (500 Internal Server Error)**
```json
{
  "success": false,
  "message": "Error retrieving organization",
  "error": "Error message"
}
```

## Role System

### Available Roles
1. **owner**
   - Full access to organization
   - Cannot be removed or role changed
   - Can delete organization
   - Can manage all members and roles

2. **admin**
   - Can update organization details
   - Can manage members (add/remove)
   - Can update member roles (except owner)

3. **member**
   - Basic access to organization
   - Can view organization details
   - Can view member list

### Role Hierarchy
owner > admin > member

## Error Handling

### Common Error Codes
- 400: Bad Request (Invalid input/validation failed)
- 401: Unauthorized (Invalid/missing authentication)
- 403: Forbidden (Insufficient permissions)
- 404: Not Found (Resource doesn't exist)
- 500: Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message" // Optional
}
```

## Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  profilePicture: String,
  organizations: [{ type: ObjectId, ref: 'Organization' }]
}
```

### Organization Model
```javascript
{
  name: String (required),
  description: String (required),
  logo: String,
  owner: { type: ObjectId, ref: 'User' },
  members: [{
    user: { type: ObjectId, ref: 'User' },
    role: String (enum: ['owner', 'admin', 'member'])
  }]
}
```

## Security Notes
1. All passwords are hashed using bcrypt
2. JWT tokens are used for authentication
3. Role-based access control (RBAC) is implemented
4. Input validation is performed on all endpoints
5. Error messages are sanitized to prevent information leakage
