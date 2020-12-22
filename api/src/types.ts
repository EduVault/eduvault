export interface ApiRes<T> {
    data: T;
    code: number;
    message: string;
}
export interface PasswordRes {
    username: string;
    _id: string;
    token: string;
}

export interface DotwalletProfile {
    pay_status: number;
    pre_amount: number;
    total_amount: number;
    user_address: string;
    user_avatar: string;
    user_name: string;
    user_open_id: string;
}
export interface DotwalletAccessData {
    access_token: string;
    expires_in: number;
    refresh_token: string;
}
