const doQuery = async (q) => {
    const r = await fetch('http://localhost:3001/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
    });
    const data = await r.json();
    if (!r.ok) console.error(q, data);
    else console.log(q, data);
};
(async () => {
    await doQuery("SELECT column_name FROM information_schema.columns WHERE table_name = 'commissions'");
})();
