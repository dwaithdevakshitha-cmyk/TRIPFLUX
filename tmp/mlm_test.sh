
# 1. Register Level 1 Associate (Shreya) referred by Kiran (ID 3)
echo "Registering Shreya (Assoc) ref by Kiran..."
echo '{"firstName": "Shreya", "lastName": "Assoc", "email": "shreya@tripflux.tours", "phone": "9876543213", "password": "Password123", "role": "associate", "panNumber": "ABCDE5678F", "dateOfBirth": "1992-01-01", "referralCode": "3"}' > /tmp/shreya.json
curl -s -X POST http://localhost:3010/api/register -H "Content-Type: application/json" -d @/tmp/shreya.json > /tmp/shreya_res.json
cat /tmp/shreya_res.json
echo ""

SHREYA_ID=$(cat /tmp/shreya_res.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('user_id', ''))")

# 2. Register New User (Kavya2) referred by Shreya
echo "Registering User ref by Shreya (ID $SHREYA_ID)..."
echo "{\"firstName\": \"Kavya2\", \"lastName\": \"User\", \"email\": \"kavya2@tripflux.tours\", \"phone\": \"9876543214\", \"password\": \"Password123\", \"role\": \"user\", \"referralCode\": \"$SHREYA_ID\"}" > /tmp/user2.json
curl -s -X POST http://localhost:3010/api/register -H "Content-Type: application/json" -d @/tmp/user2.json > /tmp/user2_res.json
cat /tmp/user2_res.json
echo ""

USER2_ID=$(cat /tmp/user2_res.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('user_id', ''))")

# 3. Booking by Kavya2
echo "Booking by Kavya2 ($USER2_ID)..."
echo "{\"userId\": \"$USER2_ID\", \"packageId\": \"2\", \"travelDate\": \"2025-07-01\", \"totalAmount\": 200000, \"passengers\": [{\"name\": \"Kavya2\", \"age\": 25, \"gender\": \"Female\"}]}" > /tmp/booking2.json
curl -s -X POST http://localhost:3010/api/bookings -H "Content-Type: application/json" -d @/tmp/booking2.json
echo ""
