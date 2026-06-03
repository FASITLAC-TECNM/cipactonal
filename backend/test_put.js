import fetch from 'node-fetch';

async function test() {
    try {
        const tokenResp = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({usuario: 'admin_test', correo: 'test@example.com', contraseña: 'password'})
        });
        
        // We probably don't have login easily scriptable. Let's modify the DB directly or check what's in the DB.
    } catch(e) {}
}
