# Twilio SMS Urgent Task Setup

This guide documents the setup and configuration process for SMS notifications using the Twilio API in the Smart Governance and Civic Corporation System (SGCS).

## Architecture Overview

When a councillor assigns a task with `URGENT` priority, the system will simultaneously notify the assigned worker through an in-app notification and an SMS text message sent to their registered mobile phone number.

1. **Councillor Assignment**: The councillor selects an `URGENT` risk level and assigns it to a worker.
2. **Spring Boot Backend**: The `ComplaintService` updates the task assignment normally and confirms it in PostgreSQL.
3. **SMS Dispatch**: If priority is `URGENT`, the `ComplaintService` retrieves the `Worker`'s profile from the database to extract their phone number.
4. **TwilioSmsService**: The application calls the integrated `TwilioSmsService` passing the phone number and task details.
5. **Audit Logging**: The SMS success or failure is recorded in the `SystemActivity` / Audit Log for transparent tracking. The assignment remains successful regardless of Twilio's network status.

## Twilio Setup Instructions

### 1. Create a Twilio Account
- Go to [Twilio.com](https://www.twilio.com/) and create a free or paid account.
- In your Twilio Console, acquire a Twilio phone number capable of sending SMS.

### 2. Configure Backend Credentials
You must provide the Twilio credentials to the Spring Boot backend. 
**NEVER commit real credentials to GitHub.**

Add the following environment variables (or replace the placeholders in `application.properties` locally for testing):

```properties
twilio.account-sid=your_account_sid_here
twilio.auth-token=your_auth_token_here
twilio.from-number=+1234567890
```

*Note: `twilio.from-number` must include the country code (e.g. `+1` or `+91`) and match your registered Twilio sender number.*

### 3. Worker Phone Numbers (India / Global)
The SMS will be sent to the phone number stored in the `users` table for the corresponding assigned worker.
- If the worker's phone number is lacking a country code, the `TwilioSmsService` will default to prepending `+91` (India) as a safety net.
- Ensure your Twilio account has geographic permissions enabled for the destination countries in the Twilio Programmable SMS Geo Permissions settings.

*Regulatory Note for India (DLT):* If you are sending SMS to Indian numbers using an alphanumeric sender ID or local Indian sender, you may need to comply with TRAI's DLT registration and template approval process.

## How URGENT SMS Works

The SMS is triggered **ONLY** when a task is successfully assigned as `URGENT` in the backend. 
- **NORMAL or HIGH tasks** do NOT trigger SMS, saving SMS costs and reducing notification spam.
- **Duplicate Protection**: The SMS is sent only on the successful assignment HTTP request. Refreshing the dashboard or looking at the task will not send duplicate messages. 
- **Fault Tolerance**: If the worker's phone is invalid or Twilio is unreachable, the task assignment succeeds anyway. The system correctly identifies that SMS failed and logs it. Only the UI and Audit Logs will reflect the missed SMS, guaranteeing the core system remains functional.

## Troubleshooting

- **SMS Failed to Send**: Check the SGCS backend logs. The issue is likely a missing/invalid `twilio.auth-token` or unverified Twilio recipient number (if using a Twilio Trial account, you can only send to registered verified caller IDs).
- **No valid phone number**: If the worker has no phone number in their database profile, SGCS logs a failure string: `Worker has no valid phone number registered.` but assignment continues cleanly.
