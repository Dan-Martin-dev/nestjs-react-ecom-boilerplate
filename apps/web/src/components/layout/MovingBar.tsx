import '../../../styles/MovingBar.css'

type MovingBarProps = {
  messages: string[]
  className?: string
}

export default function MovingBar({ messages, className }: MovingBarProps) {
  // duplicate messages to make the marquee seamless
  const items = [...messages, ...messages]

  return (
    <div className={`moving-bar moving-bar-pause-hover ${className ?? ''}`} aria-hidden="true">
      <div className="moving-bar-inner">
        <div className="moving-bar-content">
          {items.map((msg, idx) => (
            <span key={idx}>{msg}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
