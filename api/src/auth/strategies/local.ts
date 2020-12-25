import * as passportLocal from 'passport-local';
import User, { IUser } from '../../models/user';
import * as bcrypt from 'bcrypt';

const LocalStrategy = passportLocal.Strategy;

const localStrat = new LocalStrategy(
    async (username: IUser['username'], password: IUser['password'], done) => {
        const user = await User.findOne({ username: username });
        if (!user) {
            done('User not found', false);
        } else {
            bcrypt.compare(password, user.password, (error, result) => {
                if (error) {
                    done(error, false);
                } else if (result) {
                    done(null, user);
                } else {
                    done('Password does not match', false);
                }
            });
        }
    },
);
export default localStrat;
