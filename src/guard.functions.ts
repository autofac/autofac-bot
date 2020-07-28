import { Context } from 'probot';
import { AUTOFAC_BOT_ALIAS } from './constants';


export function autobotRequest(context: Context): boolean {
    const loweredComment = context.payload?.comment?.body?.toLowerCase();
    return loweredComment && loweredComment.startsWith(AUTOFAC_BOT_ALIAS);
}