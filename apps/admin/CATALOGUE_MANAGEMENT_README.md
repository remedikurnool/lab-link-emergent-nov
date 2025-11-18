# Catalogue Management Feature

## Overview

The Catalogue Management feature has been added to the Lab Link admin panel, providing comprehensive management of diagnostic tests, scans, packages, and centres with multi-centre pricing and report delivery times.

## Features Added

### 1. **Catalogue Page** (`/catalogue`)
- Tabbed interface for easy navigation
- Four main sections: Tests, Scans, Packages, Centres
- Integrated into admin navigation

### 2. **Tests Management**
- ✅ View all tests with centre-specific pricing
- ✅ Search and filter tests
- ✅ Toggle test active/inactive status
- ✅ Multi-centre pricing display
- ✅ Report delivery times
- ✅ Home collection availability
- ✅ Original price and discount management

### 3. **Scans Management**
- ✅ Similar functionality to Tests
- ✅ Scan-specific categories
- ✅ Multi-centre pricing
- ✅ Report delivery times

### 4. **Packages Management**
- ✅ Package overview with included tests
- ✅ Popular package marking
- ✅ Multi-centre pricing
- ✅ Tests included visualization
- ✅ Toggle popular status

### 5. **Centres Management**
- ✅ View all diagnostic centres
- ✅ Centre statistics (tests, scans, packages count)
- ✅ Rating display with star visualization
- ✅ Contact information
- ✅ Toggle centre active/inactive

## Database Schema

### Enhanced `centre_pricing` table:
- ✅ `report_delivery_time` column added (TEXT, default '24 hours')
- ✅ Supports multi-centre pricing variants
- ✅ Home collection availability
- ✅ Original price and discount tracking

## Navigation

Added "Catalogue" link to admin navigation between "Centres" and "Settings".

## UI Components

### New Components Created:
1. **`/catalogue/page.tsx`** - Main catalogue page with tabs
2. **`TestsSection.tsx`** - Tests management interface
3. **`ScansSection.tsx`** - Scans management interface
4. **`PackagesSection.tsx`** - Packages management interface
5. **`CentresSection.tsx`** - Centres management interface

### Features:
- ✅ Responsive design
- ✅ Search functionality
- ✅ Status toggles
- ✅ Pricing display with discounts
- ✅ Report time visualization
- ✅ Centre statistics
- ✅ Loading states

## Usage

### Accessing Catalogue Management:

1. **Login to admin panel**
   ```
   http://localhost:3201/login
   Email: admin@lablink.com
   Password: admin@123
   ```

2. **Navigate to Catalogue**
   - Click "Catalogue" in the admin navigation
   - Or go to: `http://localhost:3201/catalogue`

3. **Manage Content**
   - **Tests Tab**: View and manage diagnostic tests
   - **Scans Tab**: View and manage diagnostic scans
   - **Packages Tab**: View and manage test packages
   - **Centres Tab**: View and manage diagnostic centres

### Key Features:

#### Multi-Centre Pricing
- Each test/scan/package can have different prices at different centres
- Supports original price, discounted price, and percentage discounts
- Visual discount indicators

#### Report Delivery Times
- Configurable delivery times per centre and item
- Displayed with clock icons
- Default: "24 hours"

#### Home Collection
- Toggle home collection availability
- Visual indicators for available services

#### Centre Statistics
- Number of tests, scans, and packages per centre
- Rating display with star visualization
- Contact information

## Database Relationships

### Centre Pricing Structure:
```
tests/scans/packages → centre_pricing → diagnostic_centres
```

Each item can have multiple pricing entries, one per centre, allowing for:
- Different prices per centre
- Different delivery times per centre
- Different home collection availability per centre

## Future Enhancements

### Planned Features:
1. **Add/Edit Forms** - Currently shows "Add Test" buttons (forms to be implemented)
2. **Bulk Operations** - Update multiple items at once
3. **Pricing History** - Track price changes over time
4. **Import/Export** - Bulk import from CSV/Excel
5. **Advanced Filtering** - Filter by price range, category, etc.
6. **Analytics** - Popular items, revenue by centre, etc.

### Add/Edit Forms (To Be Implemented):
- Test creation/editing form
- Scan creation/editing form
- Package creation/editing form with test selection
- Centre creation/editing form
- Pricing management forms

## Technical Implementation

### Components Structure:
```
apps/admin/src/
├── app/catalogue/page.tsx
└── components/catalogue/
    ├── TestsSection.tsx
    ├── ScansSection.tsx
    ├── PackagesSection.tsx
    └── CentresSection.tsx
```

### Key Technologies:
- ✅ Next.js 15
- ✅ React with TypeScript
- ✅ Supabase for data fetching
- ✅ Tailwind CSS for styling
- ✅ Lucide React for icons

### Data Fetching:
- Uses Supabase joins to fetch related centre pricing
- Optimized queries with proper filtering
- Real-time updates (when implemented)

## Testing

### Manual Testing Checklist:
- [ ] Login to admin panel
- [ ] Navigate to Catalogue page
- [ ] Switch between Tests, Scans, Packages, Centres tabs
- [ ] Search functionality works
- [ ] Status toggles work
- [ ] Multi-centre pricing displays correctly
- [ ] Report delivery times show
- [ ] Home collection indicators work
- [ ] Centre statistics display correctly

## Troubleshooting

### Common Issues:

1. **No Data Showing**
   - Check if items exist in database
   - Verify centre_pricing entries exist
   - Check RLS policies

2. **Pricing Not Showing**
   - Ensure `centre_pricing` table has entries
   - Check `is_active = true` in pricing table
   - Verify centre relationships

3. **Report Times Not Showing**
   - Check if `report_delivery_time` column exists
   - Default value should be '24 hours'

## Performance Considerations

- Uses efficient Supabase queries with joins
- Implements pagination-ready structure
- Optimized for large catalogues
- Responsive design for all screen sizes

## Security

- ✅ Admin authentication required
- ✅ RLS policies protect data access
- ✅ Role-based permissions (super_admin vs admin)
- ✅ Safe data operations

## Integration

The Catalogue Management integrates with existing admin features:
- ✅ Admin authentication
- ✅ Navigation system
- ✅ Layout consistency
- ✅ Data from existing tables (tests, scans, packages, diagnostic_centres, centre_pricing)

## Next Steps

1. **Implement Add/Edit Forms** - Complete CRUD operations
2. **Add Bulk Operations** - Update multiple items
3. **Enhanced Search/Filtering** - Advanced filters
4. **Analytics Dashboard** - Catalogue performance metrics
5. **Import/Export** - Bulk data management

---

*Catalogue Management v1.0 - Read-only display with status management*
