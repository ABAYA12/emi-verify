# EMI Verify - Example API Usage

This document provides comprehensive examples of how to use the EMI Verify API for managing insurance cases and document verifications.

## Prerequisites

1. Start the server: `npm run dev`
2. Ensure PostgreSQL is running
3. Database should be set up: `npm run setup-db`

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, the API doesn't require authentication, but you can add JWT authentication by implementing the middleware.

---

## 🏥 Insurance Cases API Examples

### 1. Create a New Insurance Case

```bash
curl -X POST http://localhost:3000/api/insurance-cases \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "John Smith",
    "insured_name": "Alice Johnson",
    "country": "USA",
    "date_received": "2024-01-15",
    "date_closed": "2024-01-25",
    "turn_around_time": 10,
    "case_status": "Closed",
    "policy_number": "POL001234",
    "case_type": "Property Damage",
    "insurance_company": "ABC Insurance",
    "is_fraud": false,
    "comment": "Standard property damage claim"
  }'
```

### 2. Create a Fraud Case

```bash
curl -X POST http://localhost:3000/api/insurance-cases \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Sarah Wilson",
    "insured_name": "Bob Martinez",
    "country": "Mexico",
    "date_received": "2024-01-20",
    "case_status": "Under Investigation",
    "policy_number": "POL001235",
    "case_type": "Auto Accident",
    "insurance_company": "XYZ Insurance",
    "is_fraud": true,
    "fraud_type": "Documented Fraud",
    "fraud_source": "Internal Investigation",
    "comment": "Suspicious claim - investigating"
  }'
```

### 3. Get All Insurance Cases

```bash
curl http://localhost:3000/api/insurance-cases
```

### 4. Get Cases with Filters

```bash
# Filter by date range
curl "http://localhost:3000/api/insurance-cases?start_date=2024-01-01&end_date=2024-12-31"

# Filter by agent
curl "http://localhost:3000/api/insurance-cases?agent_name=John"

# Filter by country
curl "http://localhost:3000/api/insurance-cases?country=USA"

# Multiple filters
curl "http://localhost:3000/api/insurance-cases?country=USA&case_status=Closed&start_date=2024-01-01"
```

### 5. Update an Insurance Case

```bash
curl -X PUT http://localhost:3000/api/insurance-cases/1 \
  -H "Content-Type: application/json" \
  -d '{
    "case_status": "Closed",
    "date_closed": "2024-02-15",
    "turn_around_time": 25,
    "comment": "Case resolved successfully"
  }'
```

### 6. Bulk Create Insurance Cases

```bash
curl -X POST http://localhost:3000/api/insurance-cases/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "cases": [
      {
        "agent_name": "Agent 1",
        "insured_name": "Insured 1",
        "country": "USA",
        "date_received": "2024-01-10",
        "case_type": "Auto",
        "insurance_company": "Company A"
      },
      {
        "agent_name": "Agent 2",
        "insured_name": "Insured 2",
        "country": "Canada",
        "date_received": "2024-01-11",
        "case_type": "Home",
        "insurance_company": "Company B"
      }
    ]
  }'
```

---

## 📄 Document Verification API Examples

### 1. Create a New Document Verification

```bash
curl -X POST http://localhost:3000/api/document-verifications \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Emma Rodriguez",
    "ars_number": "ARS2024001",
    "check_id": "CHK001",
    "applicant_name": "David Thompson",
    "document_type": "Passport",
    "country": "USA",
    "region_town": "New York, NY",
    "date_received": "2024-01-10",
    "date_closed": "2024-01-15",
    "turn_around_time": 5,
    "turn_around_status": "On Time",
    "processing_fee": 150.00,
    "agent_amount_paid": 120.00,
    "total": 150.00,
    "payment_status": "PAID"
  }'
```

### 2. Create a Pending Verification

```bash
curl -X POST http://localhost:3000/api/document-verifications \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "James Liu",
    "ars_number": "ARS2024002",
    "check_id": "CHK002",
    "applicant_name": "Maria Garcia",
    "document_type": "Driver License",
    "country": "Mexico",
    "region_town": "Guadalajara",
    "date_received": "2024-01-12",
    "processing_fee": 75.00,
    "agent_amount_paid": 60.00,
    "total": 75.00,
    "payment_status": "PENDING"
  }'
```

### 3. Get All Document Verifications

```bash
curl http://localhost:3000/api/document-verifications
```

### 4. Get Verifications with Filters

```bash
# Filter by date range
curl "http://localhost:3000/api/document-verifications?start_date=2024-01-01&end_date=2024-12-31"

# Filter by document type
curl "http://localhost:3000/api/document-verifications?document_type=Passport"

# Filter by payment status
curl "http://localhost:3000/api/document-verifications?payment_status=PENDING"

# Multiple filters
curl "http://localhost:3000/api/document-verifications?country=USA&payment_status=PAID"
```

### 5. Update Payment Status

```bash
curl -X PUT http://localhost:3000/api/document-verifications/1 \
  -H "Content-Type: application/json" \
  -d '{
    "payment_status": "PAID",
    "date_closed": "2024-01-20",
    "turn_around_time": 8,
    "turn_around_status": "On Time"
  }'
```

---

## 📊 Analytics API Examples

### 1. Get Dashboard Overview

```bash
curl http://localhost:3000/api/analytics/dashboard
```

Response:
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_records": 6,
      "total_completed": 4,
      "total_pending": 2
    },
    "insurance_cases": {
      "total": 3,
      "closed": 2,
      "pending": 1,
      "fraud_cases": 1,
      "fraud_rate": "33.33"
    },
    "document_verifications": {
      "total": 3,
      "completed": 2,
      "pending": 1,
      "completion_rate": "66.67"
    },
    "financial_overview": {
      "total_processing_fees": 325.00,
      "total_agent_payments": 260.00,
      "net_revenue": 65.00
    }
  }
}
```

### 2. Get Insurance Cases KPIs

```bash
curl http://localhost:3000/api/analytics/insurance-cases
```

### 3. Get Document Verification KPIs

```bash
curl http://localhost:3000/api/analytics/document-verifications
```

### 4. Get KPIs with Date Filter

```bash
curl "http://localhost:3000/api/analytics/dashboard?start_date=2024-01-01&end_date=2024-03-31"
```

---

## 📤 Export API Examples

### 1. Export Insurance Cases to CSV

```bash
curl "http://localhost:3000/api/export/insurance-cases" --output insurance-cases.csv
```

### 2. Export Document Verifications to CSV

```bash
curl "http://localhost:3000/api/export/document-verifications" --output document-verifications.csv
```

### 3. Export with Date Filter

```bash
curl "http://localhost:3000/api/export/insurance-cases?start_date=2024-01-01&end_date=2024-12-31" \
  --output insurance-cases-2024.csv
```

### 4. Get Export Summary

```bash
curl http://localhost:3000/api/export/summary
```

---

## 🧪 Testing Examples

### Using Node.js/JavaScript

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Create an insurance case
async function createInsuranceCase() {
  try {
    const response = await axios.post(`${API_BASE}/insurance-cases`, {
      agent_name: 'Test Agent',
      insured_name: 'Test Insured',
      country: 'USA',
      date_received: '2024-01-15',
      case_type: 'Auto Accident',
      insurance_company: 'Test Insurance'
    });
    
    console.log('Created case:', response.data);
    return response.data.data.id;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Get analytics
async function getAnalytics() {
  try {
    const response = await axios.get(`${API_BASE}/analytics/dashboard`);
    console.log('Dashboard:', response.data.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Run examples
createInsuranceCase().then(caseId => {
  console.log('Case created with ID:', caseId);
  getAnalytics();
});
```

### Using Python

```python
import requests
import json

API_BASE = 'http://localhost:3000/api'

# Create a document verification
def create_document_verification():
    data = {
        'agent_name': 'Python Agent',
        'applicant_name': 'Test Applicant',
        'document_type': 'Passport',
        'country': 'USA',
        'date_received': '2024-01-15',
        'processing_fee': 100.00,
        'payment_status': 'PENDING'
    }
    
    response = requests.post(f'{API_BASE}/document-verifications', json=data)
    
    if response.status_code == 201:
        print('Created verification:', response.json())
        return response.json()['data']['id']
    else:
        print('Error:', response.json())

# Get KPIs
def get_document_kpis():
    response = requests.get(f'{API_BASE}/analytics/document-verifications')
    
    if response.status_code == 200:
        kpis = response.json()['data']
        print(f"Total verifications: {kpis['overview']['total_verifications_received']}")
        print(f"Completion rate: {kpis['overview']['completion_rate']}%")
        print(f"Total fees: ${kpis['financial_metrics']['total_processing_fees_collected']}")
    else:
        print('Error:', response.json())

# Run examples
verification_id = create_document_verification()
if verification_id:
    print(f'Verification created with ID: {verification_id}')
    get_document_kpis()
```

---

## 🔄 Workflow Examples

### Complete Insurance Case Workflow

```bash
# 1. Create a new case
CASE_ID=$(curl -s -X POST http://localhost:3000/api/insurance-cases \
  -H "Content-Type: application/json" \
  -d '{"agent_name":"Workflow Agent","insured_name":"Test Insured","country":"USA","date_received":"2024-01-15","case_type":"Auto"}' \
  | jq -r '.data.id')

echo "Created case ID: $CASE_ID"

# 2. Update case status
curl -X PUT http://localhost:3000/api/insurance-cases/$CASE_ID \
  -H "Content-Type: application/json" \
  -d '{"case_status":"Under Review"}'

# 3. Close the case
curl -X PUT http://localhost:3000/api/insurance-cases/$CASE_ID \
  -H "Content-Type: application/json" \
  -d '{"case_status":"Closed","date_closed":"2024-01-25","turn_around_time":10}'

# 4. Get updated analytics
curl http://localhost:3000/api/analytics/insurance-cases
```

### Document Verification Workflow

```bash
# 1. Create verification
VERIFICATION_ID=$(curl -s -X POST http://localhost:3000/api/document-verifications \
  -H "Content-Type: application/json" \
  -d '{"agent_name":"Workflow Agent","applicant_name":"Test Applicant","document_type":"Passport","country":"USA","date_received":"2024-01-15","processing_fee":150.00,"payment_status":"PENDING"}' \
  | jq -r '.data.id')

echo "Created verification ID: $VERIFICATION_ID"

# 2. Complete verification
curl -X PUT http://localhost:3000/api/document-verifications/$VERIFICATION_ID \
  -H "Content-Type: application/json" \
  -d '{"date_closed":"2024-01-20","turn_around_time":5,"turn_around_status":"On Time"}'

# 3. Update payment
curl -X PUT http://localhost:3000/api/document-verifications/$VERIFICATION_ID \
  -H "Content-Type: application/json" \
  -d '{"payment_status":"PAID","agent_amount_paid":120.00}'

# 4. Export to CSV
curl "http://localhost:3000/api/export/document-verifications" --output completed-verifications.csv
```

---

## 🚨 Error Handling Examples

### Handling Missing Fields

```bash
# This will work - missing fields are allowed
curl -X POST http://localhost:3000/api/insurance-cases \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Minimal Agent",
    "country": "USA"
  }'
```

### Handling Invalid IDs

```bash
# This will return 404
curl http://localhost:3000/api/insurance-cases/999999
```

### Handling Invalid JSON

```bash
# This will return 400
curl -X POST http://localhost:3000/api/insurance-cases \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

---

## 📋 Best Practices

1. **Date Format**: Always use YYYY-MM-DD format for dates
2. **Decimal Numbers**: Use proper decimal format (e.g., 150.00, not 150)
3. **Boolean Values**: Use true/false for boolean fields
4. **Filtering**: Combine multiple filters for more specific results
5. **Pagination**: For large datasets, implement pagination in your client
6. **Error Handling**: Always check the `success` field in responses
7. **Rate Limiting**: Be mindful of API rate limits (100 requests per 15 minutes by default)

---

This completes the comprehensive API usage examples. The EMI Verify system is now fully functional with all the features you requested!
