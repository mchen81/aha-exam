import type {NextApiRequest, NextApiResponse} from 'next';
import {OAuth2Client} from 'google-auth-library';
import userAccountService from "@/lib/service/UserAccountService";
import ApplicationError from "@/lib/service/ApplicationError";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const {email, password} = req.body;
            await userAccountService.registerUserByPassword(email, password);
            res.status(200).json({
                success: true,
            });

        } catch (error) {
            if (error instanceof ApplicationError) {
                res.status(400).json({error: error.message});
            } else {
                res.status(500).json({error: 'Internal Server Error'});
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default handler;
