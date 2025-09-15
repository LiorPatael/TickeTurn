TickeTurn Postman Collection

This folder contains a Postman collection that performs a simple end-to-end flow against the TickeTurn backend API.

How to use

1. Open Postman (or Insomnia). In Postman: File → Import → Import From File, and select `TickeTurn.postman_collection.json`.
2. Create an environment with a variable `baseUrl` set to `http://localhost:3050`.
3. Run the requests in order using the Collection Runner. Make sure the backend server is running.

Requests included

- Register Seller
- Login Seller
- Create Ticket
- Register Buyer
- Login Buyer
- Get Tickets
- Get Ticket By ID
- Purchase Ticket (buyer)
- Verify Ticket Removed From Listings

Notes

- The collection stores tokens in environment variables `sellerToken` and `buyerToken` during the flow.
- If you already have users with the example emails, change the emails in the register requests.
