
How to use the script in the future:
You can re-run this script anytime using the following command in your terminal:

Get-Content db\schema.sql | docker exec -i TRIPFLUX_NEW psql -U postgres -d tripflux-db
