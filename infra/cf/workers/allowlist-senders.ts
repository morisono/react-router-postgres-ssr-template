export default {
  async email(message, env, ctx) {
    const allowList = ["friend@example.com", "coworker@example.com"];
    if (allowList.indexOf(message.from) == -1) {
      message.setReject("Address not allowed");
    } else {
      await message.forward("inbox@corp");
    }
  },
};