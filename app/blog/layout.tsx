import style from './main.module.scss'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className={style.navbar}>AAABB NAVBAR</div>
        <main id={style.main}>{children}</main>
      </body>
    </html>
  )
}