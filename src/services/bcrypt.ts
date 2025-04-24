import bcrypt from 'bcrypt';

const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

export async function hashPassword(password: string){
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
}

export async function verifyPassword(hashedPassword: string, password: string){
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}