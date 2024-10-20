$("#registerForm").on("submit", async (event)=> {
    event.preventDefault();

    const data = {
        id: $("#userId").val().trim(),
        password: $("#floatingPassword").val().trim()
    };

    if(data.id === ''|| data.password === ''){
        return false;
    }

    const response = await fetch('/auth/sign-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if(response.status === 200 || response.status === 201){
        const redirectUrl = new URLSearchParams(window.location.search).get("redirectUrl") || null;
        location.href = redirectUrl || '/home';
        return true;
    }

    const result = await response.json();
    if(response.status === 401){
        alert(result.message);
        return false;
    }
    alert("로그인에 실패하였습니다.");
})