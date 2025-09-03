export default {
  async email(message, env, ctx) {
    const blockList = ["hacker@example.com", "spammer@example.com"]
    if (blockList.includes(message.from)) {
      message.setReject("Address is blocked");
      return;
    }
    await message.forward("inbox@corp");
  }
}