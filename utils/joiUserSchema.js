const joi = require("./joiKR");
const customJoi = require('./joiKR');
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


const registerSchema = joi.object({
    id: idSchema,
    name: nameSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    terms: termsSchema
});

module.exports = {
    registerSchema
};