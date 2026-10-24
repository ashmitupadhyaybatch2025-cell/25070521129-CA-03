import { useEffect, useRef } from 'react'

const KATAKANA = '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ｱｲｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ9876543210'

export default function MatrixBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const fontSize = 16
    let columns = Math.floor(width / fontSize)
    
    // Start with drops randomly distributed so matrix is visible immediately
    let drops = Array.from({ length: columns }, () => Math.floor(Math.random() * (height / fontSize)))

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      columns = Math.floor(width / fontSize)
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * (height / fontSize)))
    }

    window.addEventListener('resize', handleResize)

    // Initial black screen fill
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, width, height)

    let lastTime = 0
    const interval = 1000 / 30 // 30 FPS smooth cadence

    const render = (time) => {
      animId = requestAnimationFrame(render)

      if (time - lastTime < interval) return
      lastTime = time

      // Fade canvas slightly for matrix trail
      ctx.fillStyle = 'rgba(5, 5, 5, 0.12)'
      ctx.fillRect(0, 0, width, height)

      ctx.font = `bold ${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = KATAKANA.charAt(Math.floor(Math.random() * KATAKANA.length))
        const x = i * fontSize
        const y = drops[i] * fontSize

        // Draw bright leading character with yellow neon glow
        ctx.shadowBlur = 8
        ctx.shadowColor = '#facc15'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(char, x, y)

        // Draw glowing yellow trailing character right behind it
        ctx.shadowBlur = 4
        ctx.shadowColor = '#eab308'
        ctx.fillStyle = '#facc15'
        const prevChar = KATAKANA.charAt(Math.floor(Math.random() * KATAKANA.length))
        ctx.fillText(prevChar, x, y - fontSize)

        // Reset shadow
        ctx.shadowBlur = 0

        // Reset drop to top with slight randomness
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0
        }

        drops[i]++
      }
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="matrix-canvas"
      aria-hidden="true"
    />
  )
}
