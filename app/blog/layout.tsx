export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div>AAABB NAVBAR</div>
        <main>{children}</main>
      </body>
    </html>
  )
}