// Manejo de login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            localStorage.setItem('token', data.token);
            window.location.href = '/products';
        } catch (err) {
            const errorDiv = document.getElementById('errorMsg');
            errorDiv.textContent = err.message;
            errorDiv.classList.remove('d-none');
        }
    });
}

// Manejo de registro
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const primer_nombre = document.getElementById('primer_nombre').value;
        const segundo_nombre = document.getElementById('segundo_nombre').value;
        const primer_apellido = document.getElementById('primer_apellido').value;
        const segundo_apellido = document.getElementById('segundo_apellido').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirmPassword').value;
        const direccionResidencia = document.getElementById('direccion').value;
        const fechaNacimiento = document.getElementById('fechaNacimiento').value;
        const pais_id = document.getElementById('pais_id').value;

        if (password !== confirm) {
            const errorDiv = document.getElementById('errorMsg');
            errorDiv.textContent = 'Las contraseñas no coinciden';
            errorDiv.classList.remove('d-none');
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
                    email, password, direccionResidencia, fechaNacimiento, pais_id
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            // Redirigir a login
            window.location.href = '/login?registered=true';
        } catch (err) {
            const errorDiv = document.getElementById('errorMsg');
            errorDiv.textContent = err.message;
            errorDiv.classList.remove('d-none');
        }
    });
}