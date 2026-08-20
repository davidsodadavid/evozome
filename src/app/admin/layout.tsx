export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen w-full flex-1 font-sans"
      style={{ backgroundColor: "rgb(20,21,22)", color: "rgb(226,224,213)" }}
    >
      {children}
    </div>
  );
}
