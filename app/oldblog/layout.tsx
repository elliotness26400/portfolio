import './main.scss';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div>
        <div className="navbar">AAABB NAVBAR</div>
        <main id="main">{children}</main>
      </div>
  )
}