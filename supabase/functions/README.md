# Edge Functions

## calculate-commission

Automatically calculates and creates commission records when a booking is confirmed.

### Deploy:
```bash
supabase functions deploy calculate-commission
```

### Usage:
```javascript
const { data } = await supabase.functions.invoke('calculate-commission', {
  body: { bookingId: 'BK1762369...' }
});
```
