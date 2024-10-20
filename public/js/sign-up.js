//왜 이 파일을 보고계신가요?


const customMessages = {
    'string.min': '최소 {#limit}자 이상이어야 합니다',
    'string.max': '최대 {#limit}자 이하이어야 합니다',
    'string.empty': '필수 입력 항목입니다',
    'any.required': '필수 입력 항목입니다',
    'any.only': '값이 일치하�� 않습니다',
    'boolean.base': '올바른 값을 입력하세요',
    'number.base': '숫자여야 합니다',
    'number.min': '최소 {#limit} 이상이어야 합니다',
    'number.max': '최대 {#limit} ��하이어야 합니다'
};

// Apply custom messages to Joi
const customJoi = joi.defaults(schema => schema.options({ messages: customMessages }));

const idSchema = customJoi.string().pattern(/^[a-zA-Z0-9]+$/).min(3).max(20).required().messages({
    'string.pattern.base': '아이디는 영어와 숫자만 사용 가능합니다'
});
const nameSchema = customJoi.string().pattern(/^[a-zA-Z가-힣0-9]+$/).min(1).max(20).required().messages({
    'string.pattern.base': '사용할 수 없는 문자가 포함되어 있습니다.'
});
const passwordSchema = customJoi.string().max(50).pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})')).required().messages({
    'string.pattern.base': '비밀번호는 최소 8자 이상이어야 하며, 영문, 숫자, 특수문자를 포함해야 합니다',
    'string.empty': '8자 이상의 영문, 숫자, 특수문자를 사용하세요.',
    'any.required': '비밀번호는 필수 입력 항목입니다',
    'string.max': '최대 50자 이하이어야 합니다'
});
const confirmPasswordSchema = customJoi.any().valid(joi.ref('password')).required();
const termsSchema = customJoi.boolean().valid(true).required();

// Overall validation schema
const validationSchema = customJoi.object({
    id: idSchema,
    name: nameSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    terms: termsSchema
});

let _validation = {
    id: false,
    name: false,
    password: false,
    confirmPassword: false,
    terms: false
};

const validation = new Proxy(_validation, {
    set(target, property, value) {
        target[property] = value;
        // 여기에 특정 코드를 추가하세요
        checkButton(); // 예: checkButton 함수 호출
        return true;
    }
});


function checkButton() {
    const registerButton = $('#registerButton');
    for (let key in validation) {
        if (!validation[key]){
            registerButton.prop('disabled', true);
            return;
        }
    }
    registerButton.prop('disabled', false);
}

$(document).ready(() => {
    const id = $('#inputId');
    const name = $('#inputUsername');
    const pw = $('#inputPassword');
    const cfPW = $('#passwordCheck');
    const privacy = $('#privacyCheck');

    const error_default = $('#error-message');
    const error_username = $('#error-message-username');
    const error_id = $('#error-message-id');
    const error_pw = $('#pwHelpline');
    const error_cfPW = $('#error-message-password-check');

    function switchType(doc, type){
        if(!doc || !type) return;
        switch(type){
            case "error":
                doc.removeClass('text-success');
                doc.removeClass('text-muted');
                doc.addClass('text-danger');
                break;
            case "success":
                doc.removeClass('text-danger');
                doc.removeClass('text-muted');
                doc.addClass('text-success');
                break;
            case "muted":
                doc.removeClass('text-danger');
                doc.removeClass('text-success');
                doc.addClass('text-muted');
                break;
        }
    }

    name.on('input', () => {
        const { error } = nameSchema.validate(name.val());
        if (error) {
            error_username.html(error.details[0].message);
            validation.name = false;
        } else {
            error_username.html('');
            validation.name = true;
        }
    });

    let checkSoonTimer = null;

    id.on('input', async () => {
        if(id.val().length === ""){
            error_id.html("");
            switchType(error_id, "error");
            return false;
        }
        const { error } = idSchema.validate(id.val());
        if (error) {
            error_id.html(error.details[0].message);
            validation.id = false;
            switchType(error_id, "error");
            return false;
        }
        validation.id = true;

        const now = new Date().getTime();
        checkSoonTimer = now;
        switchType(error_id, "muted");
        error_id.html('중복 확인 중...');
        setTimeout(async () => {
            if(checkSoonTimer !== now) return;
            let response = await fetch('/auth/check-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: id.val() })
            });
            if(response.status !== 200){
                error_id.html('이미 존재하는 아이디입니다');
                validation.id = false;
                switchType(error_id, "error");
                return false;
            }

            //bootstrap green class
            switchType(error_id, "success");
            error_id.html('사용 가능한 아이디입니다.');
        }, 1000);



    });

    pw.on('input', () => {
        const { error } = passwordSchema.validate(pw.val());
        if (error) {
            error_pw.addClass('text-danger');
            error_pw.html(error.details[0].message);
            validation.password = false;
        } else {
            error_pw.removeClass('text-danger');
            error_pw.html('');
            validation.password = true;
        }


        if (pw.val() !== cfPW.val() && cfPW.val() !== '') {
            error_cfPW.html('비밀번호가 일치하지 않습니다');
            validation.confirmPassword = false;
        } else {
            error_cfPW.html('');
            validation.confirmPassword = true;
        }

    });

    cfPW.on('input', () => {
        if (pw.val() !== cfPW.val()) {
            error_cfPW.html('비밀번호가 일치하지 않습니다');
            validation.confirmPassword = false;
        } else {
            error_cfPW.html('');
            validation.confirmPassword = true;}
    });

    privacy.on('input', () => {
        validation.terms = !!privacy.is(':checked');
    });

    $('#signup-form').on('submit', async (event) => {
        event.preventDefault();
        let data = {
            id: id.val().trim(),
            name: name.val().trim(),
            password: pw.val(),
            confirmPassword: cfPW.val(),
            terms: privacy.is(':checked')
        };

        const { error } = validationSchema.validate(data);
        if (error) {
            console.log(error);
            return;
        }

        try {
            //I know. This is not fucking secure.
            //그래서 너가 뭘 할수있는데?
            const key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArQMzx5rts2T4P3vPvP60Y7Q97vPTXo6alyxK+glJ4YZJOI6V/D1cnIzPVa+wcyq3Olli+BPR9DpAuzkkMKWgDlGDpF0jtRS/SFKRiSkc9ExklubfxJ7Wiy5AOVpLsvwdCb7YCbusxvf+z9XsTI51xl3pich/tmo+Zptd99jHaiCpOekryaaWpClW++6nFUUfg5ZZDlT7uxR7MPYey9F8v9pzlt9+7m5B2faTiv0gc1WUqeTpQD6vtiGqTjENvmFdDLWdC999drFHoHeH9fZp8erfcexHcZ1roPKM9ymvYtEamHS76ukW55y+jdq6mVnZTQzXILiBDt15LhZc5wQEYwIDAQAB";

            let data_result;
            if (!window.crypto || !window.crypto.subtle) {
                alert('주의: 이 브라우저는 최신 보안 기능을 지원하지 않습니다.');
                //암호화 없이 전송
                data_result = {data:data, isEncrypted:false};
            } else {
                const publicKey = await crypto.subtle.importKey(
                    "spki",
                    Uint8Array.from(atob(key), c => c.charCodeAt(0)),
                    {
                        name: "RSA-OAEP",
                        hash: "SHA-256"
                    },
                    false,
                    ["encrypt"]
                );
                const encoder = new TextEncoder();
                const encrypted = await crypto.subtle.encrypt(
                    {
                        name: "RSA-OAEP"
                    },
                    publicKey,
                    encoder.encode(JSON.stringify(data))
                );

                let encryptedString = btoa(String.fromCharCode.apply(null, new Uint8Array(encrypted)));
                data_result = {data: encryptedString, isEncrypted: true}
            }


            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data_result)
            });

            if (response.status === 201) {
                location.href = '/auth/sign-in';
            } else {
                alert('회원가입에 실패했습니다');
                console.log(response);
                response.json().then(console.log)
            }
        } catch (e) {
            console.error(e);
            alert('회원가입에 실패했습니다. 예기치 않은 오류');
        }

    });
});