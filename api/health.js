export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  if (req.method === "OPTIONS") return res.status(200).end()
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
}
