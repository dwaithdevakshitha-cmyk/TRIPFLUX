
# 1. Register Associate
echo "Registering Associate..."
echo '{"firstName": "Kiran", "lastName": "Assoc", "email": "kiran@tripflux.tours", "phone": "9876543211", "password": "Password123", "role": "associate", "panNumber": "ABCDE1234F", "dateOfBirth": "1990-01-01"}' > /tmp/assoc.json
curl -s -X POST http://localhost:3010/api/register -H "Content-Type: application/json" -d @/tmp/assoc.json > /tmp/assoc_res.json
cat /tmp/assoc_res.json
echo ""

# 2. Register User with Associate's Referral (using Associate's ID or Email)
ASSOC_ID=$(cat /tmp/assoc_res.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('user_id', ''))")
echo "Associate registered with ID: $ASSOC_ID"

echo "Registering User with referral..."
echo "{\"firstName\": \"Kavya\", \"lastName\": \"User\", \"email\": \"kavya_ref@tripflux.tours\", \"phone\": \"9876543212\", \"password\": \"Password123\", \"role\": \"user\", \"referralCode\": \"$ASSOC_ID\"}" > /tmp/user.json
curl -s -X POST http://localhost:3010/api/register -H "Content-Type: application/json" -d @/tmp/user.json > /tmp/user_res.json
cat /tmp/user_res.json
echo ""

USER_ID=$(cat /tmp/user_res.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('user_id', ''))")

# 3. Create Booking for User
echo "Creating Booking for User $USER_ID..."
# First check packages to get a valid ID
PKG_ID=$(curl -s http://localhost:3010/api/packages | python3 -c "import sys, json; print(json.load(sys.stdin)[0].get('id', '1'))")
echo "Using Package ID: $PKG_ID"

echo "{\"userId\": \"$USER_ID\", \"packageId\": \"$PKG_ID\", \"travelDate\": \"2025-06-01\", \"totalAmount\": 100000, \"passengers\": [{\"name\": \"Kavya\", \"age\": 25, \"gender\": \"Female\"}]}" > /tmp/booking.json
curl -s -X POST http://localhost:3010/api/bookings -H "Content-Type: application/json" -d @/tmp/booking.json > /tmp/booking_res.json
cat /tmp/booking_res.json
echo ""
