# Ecommerce microservice

This repository contains a ecommerce microservice built using nodejs express and each service is dockerised for the deployment to be easy


Below is a detailed documentation of the API endpoints for the e-commerce application, categorized by microservice. Each endpoint includes its purpose, HTTP method, path, and notes on cross-service communication or business logic where applicable.

---

### **User Service**
**Base URL:** `/api/users`

| Endpoint                  | Method | Path                          | Description                                                                 | Cross-Service Communication / Business Logic                                                                 |
|---------------------------|--------|-------------------------------|-----------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Register User             | POST   | `/register`                  | Registers a new user with email, password, and profile details.            | None. Creates a user entity and stores it in the User Service database.                                     |
| Login User                | POST   | `/login`                     | Authenticates a user and returns a session token (e.g., JWT).              | None. Validates credentials and generates a session token.                                                 |
| Get User Profile          | GET    | `/profile/{userId}`          | Retrieves user profile details (e.g., name, email, address).               | None. Fetches data from the User Service database.                                                         |
| Update User Profile       | PUT    | `/profile/{userId}`          | Updates user profile details (e.g., name, address).                        | None. Updates the user entity in the User Service database.                                                |
| Logout User               | POST   | `/logout`                    | Invalidates the user’s session token.                                      | None. Ends the session by invalidating the token in the User Service.                                      |
| Validate Session          | GET    | `/session/validate`          | Validates the current session token.                                       | None. Checks token validity within the User Service.                                                       |

---

### **Product Service**
**Base URL:** `/api/products`

| Endpoint                  | Method | Path                          | Description                                                                 | Cross-Service Communication / Business Logic                                                                 |
|---------------------------|--------|-------------------------------|-----------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Get Product List          | GET    | `/`                          | Retrieves a list of all products with pagination and filtering options.    | None. Fetches product data from the Product Service database.                                              |
| Get Product Details       | GET    | `/{productId}`               | Retrieves details of a specific product (e.g., images, description).       | None. Fetches a single product from the Product Service database.                                          |
| Add Product               | POST   | `/`                          | Adds a new product (admin only).                                           | **Inventory Service**: Notifies Inventory Service to initialize stock for the new product.                  |
| Update Product            | PUT    | `/{productId}`               | Updates product details (e.g., price, description) (admin only).           | None. Updates product data in the Product Service database.                                                |
| Delete Product            | DELETE | `/{productId}`               | Deletes a product (admin only).                                            | **Inventory Service**: Notifies Inventory Service to remove stock associated with the product.              |

---

### **Cart Service**
**Base URL:** `/api/cart`

| Endpoint                  | Method | Path                          | Description                                                                 | Cross-Service Communication / Business Logic                                                                 |
|---------------------------|--------|-------------------------------|-----------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Get Cart                  | GET    | `/{userId}`                  | Retrieves the user’s cart contents.                                        | None. Fetches cart data from the Cart Service database.                                                    |
| Add to Cart               | POST   | `/{userId}/items`            | Adds a product to the user’s cart.                                         | **Product Service**: Validates product existence and retrieves product details.<br>**Inventory Service**: Checks if sufficient stock is available. |
| Remove from Cart          | DELETE | `/{userId}/items/{itemId}`   | Removes a specific item from the user’s cart.                              | None. Updates cart data in the Cart Service database.                                                      |
| Update Cart Item          | PUT    | `/{userId}/items/{itemId}`   | Updates the quantity of a specific item in the cart.                       | **Inventory Service**: Verifies stock availability for the updated quantity.                                |
| Checkout                  | POST   | `/{userId}/checkout`         | Initiates the checkout process and clears the cart after order creation.   | **Order Processing Service**: Sends cart details to create an order.<br>**Inventory Service**: Reserves stock for the order. |

---

### **Order Processing Service**
**Base URL:** `/api/orders`

| Endpoint                  | Method | Path                          | Description                                                                 | Cross-Service Communication / Business Logic                                                                 |
|---------------------------|--------|-------------------------------|-----------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Create Order              | POST   | `/`                          | Creates a new order from cart data.                                        | **Cart Service**: Receives cart details.<br>**Payment Service**: Initiates payment.<br>**Inventory Service**: Deducts stock after payment succeeds. |
| Get Order Details         | GET    | `/{orderId}`                 | Retrieves details of a specific order (e.g., items, status).               | None. Fetches order data from the Order Processing Service database.                                        |
| Get User Orders           | GET    | `/user/{userId}`             | Retrieves all orders for a specific user.                                  | None. Fetches user-specific order history from the Order Processing Service database.                      |
| Update Order Status       | PUT    | `/{orderId}/status`          | Updates the status of an order (e.g., shipped, delivered) (admin only).    | **Inventory Service**: May release reserved stock if the order is canceled.                                 |
| Cancel Order              | DELETE | `/{orderId}`                 | Cancels an order before it’s shipped.                                      | **Payment Service**: Refunds the payment.<br>**Inventory Service**: Restores reserved stock.                |

---

### **Payment Service**
**Base URL:** `/api/payments`

| Endpoint                  | Method | Path                          | Description                                                                 | Cross-Service Communication / Business Logic                                                                 |
|---------------------------|--------|-------------------------------|-----------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Process Payment           | POST   | `/process`                   | Processes a payment for an order.                                          | **Order Processing Service**: Receives payment confirmation to update order status.                        |
| Get Payment Status        | GET    | `/{paymentId}`               | Retrieves the status of a specific payment.                                | None. Fetches payment data from the Payment Service database.                                              |
| Refund Payment            | POST   | `/{paymentId}/refund`        | Initiates a refund for a payment.                                          | **Order Processing Service**: Notifies about refund completion to update order status.                     |

---

### **Inventory Service**
**Base URL:** `/api/inventory`

| Endpoint                  | Method | Path                          | Description                                                                 | Cross-Service Communication / Business Logic                                                                 |
|---------------------------|--------|-------------------------------|-----------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Get Stock Level           | GET    | `/{productId}`               | Retrieves the current stock level of a product.                            | None. Fetches stock data from the Inventory Service database.                                              |
| Update Stock              | PUT    | `/{productId}`               | Updates stock level for a product (admin only).                            | None. Updates stock data in the Inventory Service database.                                                |
| Reserve Stock             | POST   | `/reserve`                   | Reserves stock for an order during checkout.                               | **Order Processing Service**: Confirms reservation for order creation.                                     |
| Release Stock             | POST   | `/release`                  | Releases reserved stock (e.g., on order cancellation).                     | **Order Processing Service**: Notifies about stock release after cancellation.                             |
| Deduct Stock              | POST   | `/deduct`                    | Deducts stock after a successful order.                                    | **Order Processing Service**: Confirms stock deduction after payment succeeds.                             |

---

### **Notes on Cross-Service Communication and Business Logic**
1. **User Service**: Primarily standalone but provides user authentication tokens used across other services for authorization.
2. **Product Service**: Interacts with Inventory Service to ensure stock consistency when products are added or removed.
3. **Cart Service**: Heavily relies on Product Service for product validation and Inventory Service for stock checks during cart operations and checkout.
4. **Order Processing Service**: Acts as a coordinator, communicating with Cart Service (to fetch cart data), Payment Service (to process payments), and Inventory Service (to manage stock).
5. **Payment Service**: Integrates with Order Processing Service to confirm payment status and trigger order updates.
6. **Inventory Service**: Provides stock management support to Product Service, Cart Service, and Order Processing Service.

This API structure ensures modularity and scalability, with clear boundaries between services and well-defined communication points for business logic execution. Let me know if you'd like further details or adjustments!