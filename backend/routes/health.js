export default async function (fastify) {
  fastify.get('/health', async () => {
    return { status: 'ok', time: Date.now() };
  });
}
