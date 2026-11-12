// map tile proxy: keeps the MapTiler key on the server (Vercel env var MAPKEY)
// GET /api/tiles?dark=1&z=4&x=10&y=6&r=@2x
// no MAPKEY set -> redirects to free CARTO tiles instead
// also served by vite.config.ts during `npm run dev`

const ok = (v: string | null) => v !== null && /^\d{1,7}$/.test(v)

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const [z, x, y] = ['z', 'x', 'y'].map((k) => params.get(k))
  if (!ok(z) || !ok(x) || !ok(y)) return new Response('bad tile', { status: 400 })

  const dark = params.get('dark') === '1'
  const retina = params.get('r') === '@2x' ? '@2x' : ''
  const key = process.env.MAPKEY

  if (!key) {
    const style = dark ? 'dark_all' : 'rastertiles/voyager'
    const sub = 'abcd'[(Number(x) + Number(y)) % 4]
    return Response.redirect(`https://${sub}.basemaps.cartocdn.com/${style}/${z}/${x}/${y}${retina}.png`, 302)
  }

  const style = dark ? 'streets-v2-dark' : 'streets-v2'
  const upstream = await fetch(
    `https://api.maptiler.com/maps/${style}/${z}/${x}/${y}${retina}.png?key=${key}`,
  )
  if (!upstream.ok) return new Response('tile error', { status: upstream.status })

  return new Response(upstream.body, {
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'image/png',
      // tiles barely change: let browsers and Vercel's CDN keep them
      'cache-control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800',
    },
  })
}
