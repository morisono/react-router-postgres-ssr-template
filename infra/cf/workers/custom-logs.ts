export default {
        async fetch(request) {
                const { cf } = request;
                const { city, country } = cf;

                console.log(`Request came from city: ${city} in country: ${country}`);

                return new Response("Hello worker!", {
                        headers: { "content-type": "text/plain" },
                });
        },
};