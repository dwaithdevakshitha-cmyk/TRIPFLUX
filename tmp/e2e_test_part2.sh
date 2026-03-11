
# Add a Package
echo "Adding a Package..."
echo '{"name": "EUROPE SPL", "destination": "Europe", "duration": "14 Nights - 15 Days", "price": 145000, "description": "Premium Europe Tour", "status": "active"}' > /tmp/pkg.json
curl -s -X POST http://localhost:3010/api/admin/packages -H "Content-Type: application/json" -d @/tmp/pkg.json
echo ""

# Now run the booking part again
PKG_ID=$(curl -s http://localhost:3010/api/packages | python3 -c "import sys, json; data = json.load(sys.stdin); print(data[0].get('id')) if data else print('')")
echo "Using Package ID: $PKG_ID"

if [ -z "$PKG_ID" ]; then
  echo "Failed to create/fetch package"
  exit 1
fi

USER_ID=4 # From previous run
echo "Creating Booking for User $USER_ID on Package $PKG_ID..."
echo "{\"userId\": \"$USER_ID\", \"packageId\": \"$PKG_ID\", \"travelDate\": \"2025-06-01\", \"totalAmount\": 145000, \"passengers\": [{\"name\": \"Kavya\", \"age\": 25, \"gender\": \"Female\"}]}" > /tmp/booking.json
curl -s -X POST http://localhost:3010/api/bookings -H "Content-Type: application/json" -d @/tmp/booking.json
echo ""
