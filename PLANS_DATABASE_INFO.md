# Plans Database Information

## Database Collection: `plans`

### Schema Structure

Plans are saved in MongoDB with the following structure:

```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  title: String,                    // REQUIRED - Plan name
  subtitle: String,                  // Optional - Plan description
  price: Number,                     // REQUIRED - Plan price (default: 0)
  priceType: String,                 // Enum: 'one-time' | 'monthly' | 'yearly' (default: 'one-time')
  credits: Number,                   // REQUIRED - Number of credits (default: 0)
  creditsDescription: String,       // Description of credits (default: 'Resume + ATS Analysis')
  features: [String],                // Array of feature strings (default: [])
  status: String,                   // REQUIRED - Enum: 'active' | 'inactive' | 'draft' (default: 'active')
  popular: Boolean,                  // Mark as popular plan (default: false)
  createdAt: Date,                   // Auto-generated timestamp
  updatedAt: Date,                   // Auto-generated timestamp
  __v: Number                        // Mongoose version key
}
```

## How Plans Are Saved

### 1. Via API Endpoint
**POST** `/api/plans`

```javascript
// Request body
{
  "title": "Professional Plan",
  "subtitle": "Best for professionals",
  "price": 29.99,
  "priceType": "monthly",
  "credits": 10,
  "creditsDescription": "Resume + ATS Analysis",
  "features": [
    "Unlimited templates",
    "ATS score analysis",
    "PDF export",
    "Priority support"
  ],
  "status": "active",
  "popular": true
}
```

### 2. Via Admin Dashboard
- Location: `/plans` page
- Component: `PlanModal.jsx`
- Form fields match the schema exactly

## Field Details

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `title` | String | ✅ Yes | - | Must be non-empty |
| `subtitle` | String | ❌ No | - | Optional text |
| `price` | Number | ✅ Yes | `0` | Must be >= 0 |
| `priceType` | String | ❌ No | `'one-time'` | Must be: 'one-time', 'monthly', or 'yearly' |
| `credits` | Number | ✅ Yes | `0` | Must be >= 0 |
| `creditsDescription` | String | ❌ No | `'Resume + ATS Analysis'` | Optional description |
| `features` | Array[String] | ❌ No | `[]` | Array of feature strings |
| `status` | String | ✅ Yes | `'active'` | Must be: 'active', 'inactive', or 'draft' |
| `popular` | Boolean | ❌ No | `false` | Boolean flag |

## Example Plan Documents

### Example 1: Free Plan
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Free Plan",
  "subtitle": "Get started for free",
  "price": 0,
  "priceType": "one-time",
  "credits": 1,
  "creditsDescription": "Resume + ATS Analysis",
  "features": [
    "1 Resume",
    "Basic templates",
    "ATS Score"
  ],
  "status": "active",
  "popular": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Example 2: Professional Plan
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Professional Plan",
  "subtitle": "Best for professionals",
  "price": 29.99,
  "priceType": "monthly",
  "credits": 10,
  "creditsDescription": "Resume + ATS Analysis",
  "features": [
    "Unlimited templates",
    "ATS score analysis",
    "PDF export",
    "Priority support",
    "Custom branding"
  ],
  "status": "active",
  "popular": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Example 3: Enterprise Plan
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Enterprise Plan",
  "subtitle": "For teams and businesses",
  "price": 99.99,
  "priceType": "yearly",
  "credits": 100,
  "creditsDescription": "Resume + ATS Analysis",
  "features": [
    "Unlimited templates",
    "Advanced ATS analysis",
    "Team collaboration",
    "API access",
    "Custom integrations",
    "Dedicated support"
  ],
  "status": "active",
  "popular": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Database Operations

### Fetch All Plans
```javascript
const plans = await Plan.find({}).sort({ createdAt: -1 });
```

### Create Plan
```javascript
const plan = await Plan.create({
  title: "New Plan",
  price: 19.99,
  priceType: "monthly",
  credits: 5,
  features: ["Feature 1", "Feature 2"],
  status: "active"
});
```

### Update Plan
```javascript
const plan = await Plan.findByIdAndUpdate(
  planId,
  { price: 24.99 },
  { new: true }
);
```

### Delete Plan
```javascript
await Plan.findByIdAndDelete(planId);
```

## Important Notes

1. **Required Fields**: `title`, `price`, `credits`, and `status` are required
2. **Price Validation**: Price must be >= 0
3. **Credits Validation**: Credits must be >= 0
4. **Status Values**: Only 'active', 'inactive', or 'draft' are allowed
5. **Price Type Values**: Only 'one-time', 'monthly', or 'yearly' are allowed
6. **Timestamps**: `createdAt` and `updatedAt` are automatically managed by Mongoose


