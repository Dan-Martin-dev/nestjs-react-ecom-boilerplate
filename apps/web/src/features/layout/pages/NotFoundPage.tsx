  const NotFoundPage = () => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
    </div>
  )
}
export default NotFoundPage;
