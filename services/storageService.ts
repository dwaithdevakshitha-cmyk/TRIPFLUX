
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'tripflux-secure-key-2026';

export const storageService = {
    // Encrypt and save data to localStorage (Simulating file write)
    saveCustomer(customerData: any) {
        try {
            // 1. Get existing data
            const existingDataRaw = localStorage.getItem('tripflux_user_details_xml');
            let customers = [];

            if (existingDataRaw) {
                try {
                    const bytes = CryptoJS.AES.decrypt(existingDataRaw, SECRET_KEY);
                    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

                    if (decryptedData) {
                        try {
                            customers = JSON.parse(decryptedData);
                        } catch (parseError) {
                            customers = [];
                        }
                    }
                } catch (e) {
                    customers = [];
                }
            }

            // 2. Add new customer
            customers.push({
                ...customerData,
                id: Date.now().toString()
            });

            // 3. Encrypt the entire collection
            const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(customers), SECRET_KEY).toString();

            // 4. Store in "files" (localStorage proxies)
            localStorage.setItem('tripflux_user_details_xml', encryptedData);
            localStorage.setItem('tripflux_user_details_backup_xml', encryptedData);

            // 5. ALSO SEND TO LOCAL SERVER FOR XML WRITING
            fetch('http://localhost:3002/api/save-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData),
            }).catch(err => console.error('Failed to save to XML server:', err));

            // LOG FOR THE USER TO SEE:
            console.log("=== NEW DATA FOR user_details.xml ===");
            console.log(`<?xml version="1.0" encoding="UTF-8"?>\n<secure_vault>\n  <data>${encryptedData}</data>\n</secure_vault>`);
            console.log("==========================================");

        } catch (error) {
            console.error('Encryption/Storage Error:', error);
        }
    },

    // Decrypt and retrieve data
    getCustomers() {
        try {
            const encryptedData = localStorage.getItem('tripflux_user_details_xml');
            if (!encryptedData) return [];

            const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decryptedData);
        } catch (error) {
            return [];
        }
    },

    updateCustomer(emailOrPhone: string, updates: any) {
        try {
            const customers = this.getCustomers();
            const index = customers.findIndex((c: any) => c.emailOrPhone === emailOrPhone);
            if (index !== -1) {
                customers[index] = { ...customers[index], ...updates };
                const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(customers), SECRET_KEY).toString();
                localStorage.setItem('tripflux_user_details_xml', encryptedData);
                localStorage.setItem('tripflux_user_details_backup_xml', encryptedData);
                return customers[index];
            }
        } catch (error) {
            console.error('Storage Update Error:', error);
        }
        return null;
    },

    getReferralsByPromo(promoCodeOrId: string) {
        if (!promoCodeOrId) return [];
        try {
            const customers = this.getCustomers();
            return customers
                .filter((c: any) => c.referralCode === promoCodeOrId)
                .map((c: any) => ({
                    first_name: c.firstName,
                    last_name: c.lastName,
                    custom_user_id: c.id,
                    referral_type: c.role,
                    status: 'pending'
                }));
        } catch (error) {
            return [];
        }
    }
};
