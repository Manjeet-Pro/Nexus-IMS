const login = async () => {
    try {
        console.log("Attempting login...");
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'w@gmail.com', // User's email from screenshot
                password: 'password123'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Login Success:", data);
        } else {
            console.error("Login Failed Status:", response.status);
            console.error("Login Failed Data:", data);
        }
    } catch (error) {
        console.error("Login Error:", error.message);
    }
};

login();
