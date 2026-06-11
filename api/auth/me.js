import { getCurrentUser } from '../_lib.js';

export default async function handler(req, res) {
  try {
    const user = await getCurrentUser(req);
    return res.json({ user: user || null });
  } catch (e) {
    return res.json({ user: null });
  }
}
