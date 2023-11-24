self.addEventListener('fetch', function(event) {
    event.respondWith(
        new Response(null, {
            status: 500,
            statusText: 'Simulated network error'
        })
    );
});
