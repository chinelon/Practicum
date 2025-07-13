function LimitExceeded() {
    return (
        <div>
            <h1>429 - Too Many Requests</h1>
            <p>You have exceeded the request limit. Please try again later.</p>
        </div>
    );
}

export default LimitExceeded;
// This component can be used in your routing setup to handle 429 errors.
// For example, in your Express app, you can use it like this:
// app.use((req, res, next) => {
//     if (rateLimitExceeded) {
//         return res.status(429).send(<LimitExceeded />);
//     }
//     next();
// });  