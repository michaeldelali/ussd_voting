# API Design - Borbor Carnival 25 Voting System

## USSD Endpoints (External Integration)

### POST `/api/ussd`
- **Purpose**: Handle USSD session requests from telco aggregator
- **Request Body**:
  ```json
  {
    "SESSIONID": "string",
    "USERID": "string", 
    "MSISDN": "string",
    "USERDATA": "string",
    "MSGTYPE": "string",
    "NETWORK": "string"
  }
  ```
- **Response**: USSD response string (CON/END format)

### POST `/api/payment/callback`
- **Purpose**: Handle payment callback from payment provider
- **Request Body**: Payment provider specific format
- **Response**: Acknowledgment

## Dashboard API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current user

### Analytics
- `GET /api/analytics/votes` - Get vote statistics
  - Query params: `startDate`, `endDate`, `candidateId`
  - Response: Vote counts, percentages, trends

- `GET /api/analytics/transactions` - Get transaction data
  - Query params: `status`, `type`, `page`, `limit`
  - Response: Paginated transaction list

- `GET /api/analytics/donations` - Get donation statistics
  - Response: Total donations, donor count, trends

### Candidates
- `GET /api/candidates` - List all candidates
- `POST /api/candidates` - Create new candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Real-time Updates
- `WebSocket /api/ws` - Real-time vote updates for dashboard

## USSD Flow States

### Main Menu States:
- `MAIN_MENU` - Welcome screen
- `VOTE_FLOW` - Voting process
- `DONATE_FLOW` - Donation process

### Vote Flow States:
- `ENTER_GROUP_CODE` - User enters candidate code
- `VALIDATE_CODE` - Validate entered code
- `DISPLAY_CANDIDATE` - Show selected candidate
- `ENTER_VOTE_COUNT` - User enters number of votes
- `CONFIRM_VOTE_PAYMENT` - Confirm payment details
- `ENTER_MOMO_PIN` - User enters PIN
- `PROCESS_PAYMENT` - Payment processing
- `VOTE_SUCCESS` - Success message
- `VOTE_FAILED` - Error handling

### Donation Flow States:
- `ENTER_DONATION_AMOUNT` - User enters donation amount
- `CONFIRM_DONATION` - Confirm donation details
- `ENTER_DONATION_PIN` - User enters PIN
- `PROCESS_DONATION` - Process donation payment
- `DONATION_SUCCESS` - Success message
- `DONATION_FAILED` - Error handling

## Payment Integration

Based on your existing carnival-ussd project, we'll use the same payment provider with these endpoints:
- Mobile Money: `pushPayment()` function
- API credentials: Basic auth with encoded credentials
- Callback handling for async payment confirmation