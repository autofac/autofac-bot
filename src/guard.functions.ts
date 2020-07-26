export function autobotRequest(comment: string): boolean {
    const loweredComment = comment.toLowerCase();
    return (loweredComment.startsWith('autofac-bot') || loweredComment.startsWith('autobot'));
}