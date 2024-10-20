const LocalStrategy = require('passport-local');
const User = require('../models').user;

module.exports = function (passport) {
    // Passport Local Strategy
    const option = {usernameField:"id", passwordField:"password"}
    passport.use(
        new LocalStrategy(option, async (id, password, done) => {
            try {
                const user = await User.findOne({ id });
                if (!user) return done(null, false, { message: '아이디와 일치하는 계정이 없습니다.' });

                const isMatch = await user.comparePassword(password);
                if (!isMatch) return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        })
    );

    // 세션에 저장 및 해제
    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser(async (_id, done) => {
        try {
            const user = await User.findById(_id);
            user.password = undefined;
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};
