import User, { IUser } from '../models/user';

export default async function getUser(session: any): Promise<IUser | null> {
    try {
        // console.log(session);
        const user = await User.findById(session.passport.user);
        if (user) {
            return user;
        } else {
            return null;
        }
    } catch (err) {
        console.log('err', err);
        return null;
    }
}
